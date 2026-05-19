import { ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import StatusBadge from './StatusBadge';
import LoadingState from './LoadingState';
import EmptyState from './EmptyState';

const JobListings = ({ jobs, loading, onToggleActive, onDelete }) => {
  if (loading) return <LoadingState message="Loading job listings..." />;
  if (!jobs?.length) return <EmptyState message="No job listings found." />;

  const safeTitle = (job) => job.title ?? 'Untitled job';

  const handleDelete = (job) => {
    if (window.confirm(`Delete "${safeTitle(job)}"? All linked applications will be removed.`)) {
      onDelete(job.id);
    }
  };

  const handleToggle = (job) => {
    const action = job.is_active ? 'Deactivate' : 'Activate';
    if (window.confirm(`${action} "${safeTitle(job)}"?`)) onToggleActive(job.id);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-200">
          <thead className="bg-slate-50 text-[11px] font-black text-slate-400 uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Company</th>
              <th className="px-6 py-4">Location</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Applicants</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {jobs.map((job) => (
              <tr key={job.id} className="hover:bg-slate-50/50 transition">
                <td className="px-6 py-4 font-semibold text-slate-800">{safeTitle(job)}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{job.company_name ?? 'Unknown company'}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{job.location ?? '—'}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{job.job_type ?? '—'}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{job.applicants_count ?? 0}</td>
                <td className="px-6 py-4">
                  <StatusBadge label={job.is_active ? 'Active' : 'Inactive'} />
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => handleToggle(job)}
                      className={`transition ${job.is_active ? 'text-emerald-500 hover:text-rose-500' : 'text-slate-300 hover:text-emerald-500'}`}
                      title={job.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {job.is_active ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
                    </button>
                    <button
                      onClick={() => handleDelete(job)}
                      className="text-slate-300 hover:text-rose-500 transition"
                      title="Delete job"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JobListings;
