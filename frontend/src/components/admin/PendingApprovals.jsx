import { Check, X } from 'lucide-react';
import LoadingState from './LoadingState';
import EmptyState from './EmptyState';

const PendingApprovals = ({ companies, loading, onApprove, onReject }) => {
  if (loading) return <LoadingState message="Loading pending companies..." />;
  if (!companies?.length) return <EmptyState message="No companies awaiting approval." />;

  const handleReject = (id) => {
    if (window.confirm('Are you sure you want to reject this company and deactivate its account?')) {
      onReject(id);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-slate-50 text-[11px] font-black text-slate-400 uppercase tracking-widest">
          <tr>
            <th className="px-6 py-4">Company</th>
            <th className="px-6 py-4">Email</th>
            <th className="px-6 py-4">Industry</th>
            <th className="px-6 py-4">Website</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {companies.map((c) => (
            <tr key={c.company_profile_id} className="hover:bg-slate-50/50 transition">
              <td className="px-6 py-4 font-semibold text-slate-800">{c.company_name}</td>
              <td className="px-6 py-4 text-sm text-slate-500">{c.email}</td>
              <td className="px-6 py-4 text-sm text-slate-500">{c.industry ?? '—'}</td>
              <td className="px-6 py-4 text-sm text-slate-500">
                {c.website
                  ? <a href={c.website} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline truncate max-w-[140px] block">{c.website}</a>
                  : '—'}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onApprove(c.company_profile_id)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 transition"
                  >
                    <Check size={13} /> Approve
                  </button>
                  <button
                    onClick={() => handleReject(c.company_profile_id)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-rose-500 text-white text-xs font-bold rounded-lg hover:bg-rose-600 transition"
                  >
                    <X size={13} /> Reject
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PendingApprovals;
