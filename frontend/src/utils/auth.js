const ROLE_DASHBOARDS = {
  ADMIN: '/admin/dashboard',
  COMPANY: '/company/dashboard',
  CANDIDATE: '/candidate/dashboard',
}

export function getToken() {
  return localStorage.getItem('access_token')
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

export function logout() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('role')
  window.location.href = '/login'
}
