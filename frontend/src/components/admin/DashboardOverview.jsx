import { Users, Building2, Briefcase, FileText, Clock, ArrowRight } from 'lucide-react';
import StatCard from './StatCard';
import StatusBadge from './StatusBadge';
import LoadingState from './LoadingState';

const STAT_CONFIG = [
  { key: 'total_users',        label: 'Total Users',       icon: Users,     accent: 'indigo' },
  { key: 'total_companies',    label: 'Companies',         icon: Building2, accent: 'violet' },
  { key: 'active_jobs',        label: 'Active Jobs',       icon: Briefcase, accent: 'sky'    },
  { key: 'total_applications', label: 'Applications',      icon: FileText,  accent: 'amber'  },
  { key: 'pending_companies',  label: 'Pending Approvals', icon: Clock,     accent: 'rose'   },
];

const DashboardOverview = ({ stats, loading, pendingCompanies, onNavigate }) => {
  if (loading) return <LoadingState message="Loading stats..." />;

  const hasPending = (pendingCompanies?.length ?? 0) > 0;

  return (
    <div className="space-y-8">

      {/* Stats grid */}
      <div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Platform Metrics</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {STAT_CONFIG.map(({ key, label, icon, accent }) => (
            <StatCard key={key} label={label} value={stats?.[key]} icon={icon} accent={accent} />
          ))}
        </div>
      </div>

      {/* Pending Companies Preview */}
      {hasPending && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
                <Clock size={15} className="text-rose-500" />
              </div>
              <div>
                <h2 className="font-bold text-slate-800 text-sm">Awaiting Approval</h2>
                <p className="text-xs text-slate-400">
                  {pendingCompanies.length} compan{pendingCompanies.length === 1 ? 'y' : 'ies'} pending review
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('approvals')}
              className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition"
            >
              View all <ArrowRight size={13} />
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {pendingCompanies.slice(0, 3).map((c) => (
              <div key={c.company_profile_id} className="flex items-center justify-between gap-4 px-6 py-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-slate-500">
                      {c.company_name?.charAt(0)?.toUpperCase() ?? '?'}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-700 text-sm truncate">{c.company_name}</p>
                    <p className="text-xs text-slate-400 truncate">{c.email} · {c.industry ?? 'No industry'}</p>
                  </div>
                </div>
                <StatusBadge label="Pending" />
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default DashboardOverview;
