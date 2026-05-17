import { Users, Building2, Briefcase, FileText, Clock } from 'lucide-react';
import StatCard from './StatCard';
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

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {STAT_CONFIG.map(({ key, label, icon, accent }) => (
          <StatCard key={key} label={label} value={stats?.[key]} icon={icon} accent={accent} />
        ))}
      </div>

      {/* Pending Companies Preview */}
      {(pendingCompanies?.length ?? 0) > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-slate-700">Awaiting Approval</h2>
            <button
              onClick={() => onNavigate('approvals')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition"
            >
              View all →
            </button>
          </div>
          <div className="space-y-3">
            {pendingCompanies?.slice(0, 3).map((c) => (
              <div key={c.company_profile_id} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                <div>
                  <p className="font-semibold text-slate-700 text-sm">{c.company_name}</p>
                  <p className="text-xs text-slate-400">{c.email} · {c.industry ?? 'No industry'}</p>
                </div>
                <span className="text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full uppercase tracking-wider">
                  Pending
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardOverview;
