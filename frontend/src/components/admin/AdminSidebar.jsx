import { LayoutDashboard, Building2, Users, Briefcase } from 'lucide-react';
import { logout } from '../../utils/auth';

const NAV_ITEMS = [
  { id: 'overview',  label: 'Overview',         icon: LayoutDashboard },
  { id: 'approvals', label: 'Pending Approvals', icon: Building2 },
  { id: 'users',     label: 'Manage Users',      icon: Users },
  { id: 'jobs',      label: 'Job Listings',      icon: Briefcase },
];

const AdminSidebar = ({ activeSection, onNavigate }) => (
  <aside className="w-72 bg-[#1e1b4b] min-h-screen flex flex-col justify-between p-8 flex-shrink-0">
    <div>
      <div className="flex items-center gap-3 mb-12">
        <div className="h-9 w-9 bg-indigo-400 rounded-xl flex items-center justify-center text-white font-black text-sm">JM</div>
        <span className="text-white font-bold text-lg tracking-tight">JobMatch</span>
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
      className="text-xs text-indigo-300 hover:text-rose-400 transition font-semibold text-left"
    >
      Sign out
    </button>
  </aside>
);

export default AdminSidebar;
