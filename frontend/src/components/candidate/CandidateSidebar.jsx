import { LayoutDashboard, Search, FileText, Bookmark, User, LogOut } from 'lucide-react'

const NAV = [
  { key: 'dashboard',    label: 'Dashboard',      icon: LayoutDashboard },
  { key: 'browse',       label: 'Browse Jobs',    icon: Search },
  { key: 'applications', label: 'My Applications',icon: FileText },
  { key: 'saved',        label: 'Saved Jobs',     icon: Bookmark },
  { key: 'profile',      label: 'Profile',        icon: User },
]

const CandidateSidebar = ({ active, onNavigate, candidateInfo, logout }) => {
  const name = candidateInfo?.name || 'Candidate'
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <aside className="w-64 bg-[#1a2035] flex flex-col h-screen shrink-0">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-indigo-600 rounded-xl flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="white" strokeWidth="2.5"/>
              <path d="M16.5 16.5L21 21" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-white font-bold text-lg">
            Job<span className="text-indigo-400">Match</span>
          </span>
        </div>
        <div className="mt-3">
          <span className="text-[10px] font-bold tracking-widest text-violet-400 bg-violet-400/10 px-3 py-1 rounded-full">
            CANDIDATE
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {NAV.map(({ key, label, icon: Icon }) => {
          const isActive = active === key
          return (
            <button
              key={key}
              onClick={() => onNavigate(key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          )
        })}
      </nav>

      {/* User info + logout */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-sm font-semibold truncate">{name}</p>
            <p className="text-slate-500 text-xs">Job Seeker</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="mt-3 flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-semibold text-indigo-300 hover:bg-rose-500/20 hover:text-rose-300 transition-all"
        >
          <LogOut size={17} />
          Sign out
        </button>
      </div>
    </aside>
  )
}

export default CandidateSidebar
