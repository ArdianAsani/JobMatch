/**
 * AdminSidebar — navigation and logout for the admin dashboard.
 *
 * logout() is consumed from AuthContext so it clears React state AND revokes
 * the refresh token on the backend. Previously it was imported from utils/auth.js
 * which only cleared localStorage, leaving the React session stale.
 */

import { LayoutDashboard, Building2, Users, Briefcase, LogOut } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { Logo } from '../landing/LandingNavbar'

const NAV_ITEMS = [
  { id: 'overview',  label: 'Overview',         icon: LayoutDashboard },
  { id: 'approvals', label: 'Pending Approvals', icon: Building2 },
  { id: 'users',     label: 'Manage Users',      icon: Users },
  { id: 'jobs',      label: 'Job Listings',      icon: Briefcase },
]

const AdminSidebar = ({ activeSection, onNavigate }) => {
  const { logout } = useAuth()

  return (
    <aside className="w-72 bg-[#1e1b4b] min-h-screen flex flex-col justify-between p-8 flex-shrink-0">
      <div>
        <div className="mb-12">
          <Logo light />
        </div>

        <p className="text-[10px] font-black text-indigo-300 tracking-[0.25em] uppercase mb-4">Admin Panel</p>

        <nav className="space-y-1">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${
                activeSection === id
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-900/30'
                  : 'text-indigo-200 hover:bg-indigo-800/50 hover:text-white'
              }`}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </nav>
      </div>

      <button
        onClick={logout}
        className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-semibold text-indigo-300 hover:bg-rose-500/20 hover:text-rose-300 transition-all"
      >
        <LogOut size={17} />
        Sign out
      </button>
    </aside>
  )
}

export default AdminSidebar
