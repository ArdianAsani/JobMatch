/**
 * Pure localStorage helpers for auth token management.
 *
 * These functions are intentionally framework-agnostic — they do NOT touch
 * React state. All React state updates must go through AuthContext.
 *
 * Consumers:
 *   - AuthContext  → storeAuthTokens, clearAuthTokens, getToken, getRefreshToken
 *   - axiosInstance → getToken, getRefreshToken, clearAuthTokens
 *   - ProtectedRoute / pages → getDashboardPath
 */

const ROLE_DASHBOARDS = {
  ADMIN: '/admin/dashboard',
  COMPANY: '/company/dashboard',
  CANDIDATE: '/candidate/dashboard',
}

/** Returns the stored JWT access token, or null if not present. */
export function getToken() {
  return localStorage.getItem('access_token')
}

/** Returns the stored refresh token, or null if not present. */
export function getRefreshToken() {
  return localStorage.getItem('refresh_token')
}

/** Returns the stored role string (ADMIN | COMPANY | CANDIDATE), or null. */
export function getRole() {
  return localStorage.getItem('role')
}

/** True if an access token is present in storage (does not validate expiry). */
export function isAuthenticated() {
  return !!getToken()
}

/**
 * Maps a role string to its corresponding dashboard route.
 * Falls back to the candidate dashboard for any unknown role.
 */
export function getDashboardPath(role) {
  return ROLE_DASHBOARDS[role] ?? '/candidate/dashboard'
}

/**
 * Persists all three values returned by the login/refresh endpoints.
 * Called exclusively by AuthContext.login() — components should never call this directly.
 */
export function storeAuthTokens({ access_token, refresh_token, role }) {
  localStorage.setItem('access_token', access_token)
  if (refresh_token) localStorage.setItem('refresh_token', refresh_token)
  localStorage.setItem('role', role)
}

/**
 * Removes all auth-related entries from localStorage.
 * Called by AuthContext.logout() and the axios interceptor on refresh failure.
 */
export function clearAuthTokens() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('role')
}
