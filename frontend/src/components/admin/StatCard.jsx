const StatCard = ({ label, value, icon: Icon, accent = 'indigo' }) => {
  const palette = {
    indigo: { icon: 'bg-indigo-50 text-indigo-600', top: 'border-t-indigo-500' },
    violet: { icon: 'bg-violet-50 text-violet-600', top: 'border-t-violet-500' },
    sky:    { icon: 'bg-sky-50 text-sky-600',       top: 'border-t-sky-500'    },
    amber:  { icon: 'bg-amber-50 text-amber-600',   top: 'border-t-amber-500'  },
    rose:   { icon: 'bg-rose-50 text-rose-600',     top: 'border-t-rose-500'   },
  };

  const c = palette[accent] ?? palette.indigo;

  return (
    <div className={`bg-white rounded-2xl border border-slate-100 border-t-4 ${c.top} shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-6`}>
      <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 mb-4 ${c.icon}`}>
        <Icon size={20} />
      </div>
      <p className="text-3xl font-extrabold text-slate-800 tracking-tight leading-none">
        {value ?? '—'}
      </p>
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mt-2">
        {label}
      </p>
    </div>
  );
};

export default StatCard;
