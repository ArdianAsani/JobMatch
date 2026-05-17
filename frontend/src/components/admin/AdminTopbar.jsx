const SECTION_TITLES = {
  overview:  { title: 'Dashboard Overview', subtitle: 'Platform summary and key metrics' },
  approvals: { title: 'Pending Approvals',  subtitle: 'Review and approve company registrations' },
  users:     { title: 'Manage Users',       subtitle: 'View, search, and manage all accounts' },
  jobs:      { title: 'Job Listings',       subtitle: 'Moderate and control job postings' },
};

const AdminTopbar = ({ activeSection }) => {
  const { title, subtitle } = SECTION_TITLES[activeSection] ?? SECTION_TITLES.overview;

  return (
    <header className="bg-white border-b border-slate-100 px-10 py-6 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{title}</h1>
        <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>
      </div>
      <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-sm">
        A
      </div>
    </header>
  );
};

export default AdminTopbar;
