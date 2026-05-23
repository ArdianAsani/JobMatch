/**
 * Configured Axios instance for all JobMatch API requests.
 *
 * Two interceptors are registered:
 *
 * REQUEST — Injects the current access token as a Bearer header so every
 *   protected endpoint receives credentials automatically.
 *
 * RESPONSE — Handles 401 Unauthorized responses by attempting a silent token
 *   refresh. If the refresh succeeds, the original request is retried
 *   transparently. If it fails, the user is logged out and redirected to /login.
 *
 * Refresh race condition protection:
 *   Multiple requests can fail with 401 simultaneously (e.g. on page load when
 *   the access token has just expired). Without coordination, each would trigger
 *   its own POST /auth/refresh, causing the first one to revoke the token that
 *   subsequent ones are trying to use. The `isRefreshing` flag and `refreshQueue`
 *   solve this: only one refresh runs at a time; others wait in the queue and
 *   are replayed with the new token once the refresh completes.
 */

import axios from 'axios'
import { getToken, getRefreshToken, clearAuthTokens } from '../utils/auth'

const BASE_URL = ''

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// --- Refresh state (module-level, shared across all in-flight requests) ---

/** True while a POST /auth/refresh is in progress. */
let isRefreshing = false

/**
 * Queue of { resolve, reject } callbacks for requests that arrived with a 401
 * while a refresh was already running. Each entry represents one stalled request.
 * Once the refresh completes, all entries are flushed.
 */
let refreshQueue = []

/**
 * Flush refreshQueue after a refresh attempt.
 * @param {Error|null} error  — non-null on failure; null on success
 * @param {string|null} token — the new access token on success; null on failure
 */
function processQueue(error, token = null) {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token)
  })
  refreshQueue = []
}

// --- Request interceptor ---

axiosInstance.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// --- Response interceptor ---

axiosInstance.interceptors.response.use(
  (response) => response,

  async (error) => {
    const original = error.config

    // Auth endpoints return 401 as a business error (wrong password, expired
    // refresh token sent to /auth/refresh, etc.). Attempting a silent refresh
    // on those routes would cause infinite loops or incorrect behaviour.
    const isAuthEndpoint = original.url?.includes('/auth/')

    // Only intercept 401s on non-auth routes. Skip if already retried once
    // to prevent any single request from looping more than once.
    if (error.response?.status !== 401 || original._retried || isAuthEndpoint) {
      return Promise.reject(error)
    }

    // If another request is already refreshing, add this one to the wait queue.
    // It will be resolved or rejected once the refresh completes.
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject })
      }).then((newToken) => {
        original.headers.Authorization = `Bearer ${newToken}`
        return axiosInstance(original)
      })
    }

    // Mark this request so the retry doesn't trigger the interceptor again
    original._retried = true
    isRefreshing = true

    const refreshToken = getRefreshToken()

    if (!refreshToken) {
      // No refresh token stored — user was never fully logged in or already logged out
      isRefreshing = false
      clearAuthTokens()
      window.location.href = '/login'
      return Promise.reject(error)
    }

    try {
      // Use a plain axios call (not axiosInstance) to avoid triggering this
      // interceptor recursively if the refresh endpoint itself returns a 401.
      const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
        refresh_token: refreshToken,
      })

      const newToken = data.access_token
      localStorage.setItem('access_token', newToken)

      // Unblock all queued requests with the fresh token
      processQueue(null, newToken)

      original.headers.Authorization = `Bearer ${newToken}`
      return axiosInstance(original)
    } catch (refreshError) {
      // Refresh token is expired, revoked, or invalid — force full logout
      processQueue(refreshError, null)
      clearAuthTokens()
      window.location.href = '/login'
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export default axiosInstance
