const BADGE_STYLES = {
  Pending:        'bg-amber-50 text-amber-700 border border-amber-100',
  'Under Review': 'bg-sky-50 text-sky-700 border border-sky-100',
  Interview:      'bg-violet-50 text-violet-700 border border-violet-100',
  Accepted:       'bg-emerald-50 text-emerald-700 border border-emerald-100',
  Rejected:       'bg-rose-50 text-rose-700 border border-rose-100',
  Active:         'bg-emerald-50 text-emerald-700 border border-emerald-100',
  Inactive:       'bg-slate-100 text-slate-500 border border-slate-200',
  Approved:       'bg-emerald-50 text-emerald-700 border border-emerald-100',
  ADMIN:          'bg-indigo-50 text-indigo-700 border border-indigo-100',
  COMPANY:        'bg-violet-50 text-violet-700 border border-violet-100',
  CANDIDATE:      'bg-sky-50 text-sky-700 border border-sky-100',
};

const StatusBadge = ({ label }) => {
  const style = BADGE_STYLES[label] ?? 'bg-slate-100 text-slate-500 border border-slate-200';
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${style}`}>
      {label}
    </span>
  );
};

export default StatusBadge;
