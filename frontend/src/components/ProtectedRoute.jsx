/**
 * ProtectedRoute — guards role-specific dashboard routes.
 *
 * Render logic:
 *   1. While AuthContext is still hydrating from localStorage → render nothing.
 *      This prevents a flash redirect to /login that would otherwise happen
 *      before the initial token check completes on page refresh.
 *
 *   2. No authenticated user in context → redirect to /login.
 *
 *   3. User has wrong role for this route → redirect to their correct dashboard.
 *      This stops a CANDIDATE from manually navigating to /admin/dashboard.
 *
 *   4. All checks pass → render the protected page.
 */

import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getDashboardPath } from '../utils/auth'

export default function ProtectedRoute({ children, role: requiredRole }) {
  const { user, loading } = useAuth()

  // Do not make any routing decisions until the context has finished reading
  // localStorage. Without this guard, a page refresh would always redirect
  // to /login for a split second before the token is re-hydrated.
  if (loading) return null

  // No user in context means no valid session — send to login
  if (!user) return <Navigate to="/login" replace />

  // Role mismatch — redirect to the correct dashboard for this user's role
  // instead of showing an error, which also prevents manual URL tampering.
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={getDashboardPath(user.role)} replace />
  }

  return children
}
