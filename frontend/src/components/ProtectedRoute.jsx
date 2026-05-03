import { Navigate } from 'react-router-dom'
import { getToken, getRole, getDashboardPath } from '../utils/auth'

export default function ProtectedRoute({ children, role: requiredRole }) {
  const token = getToken()
  const userRole = getRole()

  if (!token) return <Navigate to="/login" replace />

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to={getDashboardPath(userRole)} replace />
  }

  return children
}
