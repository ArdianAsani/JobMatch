const ROLE_DASHBOARDS = {
  ADMIN: '/admin/dashboard',
  COMPANY: '/company/dashboard',
  CANDIDATE: '/candidate/dashboard',
}

export function getToken() {
  return localStorage.getItem('access_token')
}

export function getRefreshToken() {
  return localStorage.getItem('refresh_token')
}

export function getRole() {
  return localStorage.getItem('role')
}

export function isAuthenticated() {
  return !!getToken()
}

export function getDashboardPath(role) {
  return ROLE_DASHBOARDS[role] ?? '/candidate/dashboard'
}

export function storeAuthTokens({ access_token, refresh_token, role }) {
  localStorage.setItem('access_token', access_token)
  if (refresh_token) localStorage.setItem('refresh_token', refresh_token)
  localStorage.setItem('role', role)
}

export function clearAuthTokens() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('role')
}

export async function logout() {
  const refreshToken = getRefreshToken()
  if (refreshToken) {
    try {
      // Use fetch directly to avoid a circular import with axiosInstance
      await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      })
    } catch {
      // Network error — still clear local state
    }
  }
  clearAuthTokens()
  window.location.href = '/login'
}
