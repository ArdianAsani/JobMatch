/**
 * AuthContext — single source of truth for authentication state.
 *
 * Responsibilities:
 *   - Hydrate user state from localStorage on first render (page refresh survival)
 *   - Expose login() so Login.jsx can update React state immediately after API success
 *   - Expose logout() which revokes the refresh token on the backend then clears state
 *   - Expose `loading` so ProtectedRoute can wait before deciding to redirect
 *
 * What this context does NOT do:
 *   - It does not make API calls other than the logout revocation
 *   - It does not manage refresh token rotation (that lives in axiosInstance.js)
 *   - It does not store the raw tokens in React state (tokens stay in localStorage only)
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'
import { storeAuthTokens, clearAuthTokens, getToken, getRefreshToken } from '../utils/auth'

const AuthContext = createContext(null)

/**
 * Safely decode the user_id (sub claim) from a JWT string.
 * Returns null if the token is missing, malformed, or cannot be decoded.
 * This avoids crashes when dealing with stale or corrupted localStorage values.
 */
function decodeUserId(token) {
  try {
    return jwtDecode(token).sub
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  // user = { id: string, role: string } | null
  // Role and id are decoded from the JWT so they always match what the backend issued.
  const [user, setUser] = useState(null)

  // True until localStorage has been read on the initial render.
  // ProtectedRoute waits for this to be false before deciding to redirect,
  // which prevents authenticated users from being flashed to /login on page load.
  const [loading, setLoading] = useState(true)

  // On mount: re-hydrate auth state from localStorage.
  // This runs once and covers the page-refresh case where React state is empty
  // but valid tokens are already stored.
  useEffect(() => {
    const token = getToken()
    const role = localStorage.getItem('role')

    if (token && role) {
      const id = decodeUserId(token)
      if (id) {
        setUser({ id, role })
      } else {
        // Token is present but malformed — purge stale storage to avoid a broken session
        clearAuthTokens()
      }
    }

    setLoading(false)
  }, [])

  /**
   * Called immediately after a successful POST /auth/login response.
   * Persists all three tokens (access, refresh, role) and updates React state
   * atomically so the UI reflects the logged-in session without a page reload.
   */
  const login = useCallback((authData) => {
    storeAuthTokens(authData)
    const id = decodeUserId(authData.access_token)
    setUser({ id, role: authData.role })
  }, [])

  /**
   * Revokes the refresh token on the backend then clears all local auth state.
   *
   * Uses fetch() directly instead of axiosInstance to avoid a circular
   * import: axiosInstance imports clearAuthTokens from auth.js, and auth.js
   * must stay framework-agnostic. Keeping logout here breaks that cycle.
   *
   * Even if the network call fails (offline, server down), we clear local
   * state and redirect — the token will expire naturally on the backend.
   */
  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken()
    if (refreshToken) {
      try {
        await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/auth/logout`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken }),
          }
        )
      } catch {
        // Network failure — proceed with local logout regardless
      }
    }

    clearAuthTokens()
    setUser(null)
    // Hard redirect ensures all in-memory component state is wiped clean.
    // Using window.location instead of navigate() keeps this function
    // usable outside of the React Router tree.
    window.location.href = '/login'
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook to consume auth context. Throws if called outside <AuthProvider>
 * so misconfigured usages fail loudly during development.
 */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
