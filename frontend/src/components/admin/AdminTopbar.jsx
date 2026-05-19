import { Menu } from 'lucide-react'

const SECTION_TITLES = {
  overview:  { title: 'Dashboard Overview', subtitle: 'Platform summary and key metrics' },
  approvals: { title: 'Pending Approvals',  subtitle: 'Review and approve company registrations' },
  users:     { title: 'Manage Users',       subtitle: 'View, search, and manage all accounts' },
  jobs:      { title: 'Job Listings',       subtitle: 'Moderate and control job postings' },
};

const AdminTopbar = ({ activeSection, onMenuToggle }) => {
  const { title, subtitle } = SECTION_TITLES[activeSection] ?? SECTION_TITLES.overview;

  return (
    <header className="bg-white border-b border-slate-100 px-4 sm:px-10 py-4 sm:py-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition shrink-0"
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <h1 className="text-lg sm:text-2xl font-bold text-slate-800 tracking-tight truncate">{title}</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5 hidden sm:block">{subtitle}</p>
        </div>
      </div>
      <div className="h-9 w-9 sm:h-10 sm:w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
        A
      </div>
    </header>
  );
};

export default AdminTopbar;
