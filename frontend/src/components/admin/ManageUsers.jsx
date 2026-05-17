import { useState } from 'react';
import { ToggleLeft, ToggleRight } from 'lucide-react';
import StatusBadge from './StatusBadge';
import LoadingState from './LoadingState';
import EmptyState from './EmptyState';

const ROLE_OPTIONS = ['ALL', 'ADMIN', 'COMPANY', 'CANDIDATE'];

const ManageUsers = ({ users, loading, onToggleActive }) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  if (loading) return <LoadingState message="Loading users..." />;

  const filtered = (users ?? []).filter((u) => {
    const matchesSearch =
      `${u.first_name ?? ''} ${u.last_name ?? ''} ${u.email ?? ''}`.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleToggle = (u) => {
    const msg = u.is_active
      ? 'Are you sure you want to deactivate this user?'
      : 'Are you sure you want to activate this user?';
    if (window.confirm(msg)) onToggleActive(u.id);
  };

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
        <div className="flex gap-2">
          {ROLE_OPTIONS.map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                roleFilter === r
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-500 hover:border-indigo-300'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState message="No users match your filters." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[11px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Toggle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4 font-semibold text-slate-800">{u.first_name} {u.last_name}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{u.email}</td>
                  <td className="px-6 py-4"><StatusBadge label={u.role} /></td>
                  <td className="px-6 py-4"><StatusBadge label={u.is_active ? 'Active' : 'Inactive'} /></td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleToggle(u)}
                      className={`transition ${u.is_active ? 'text-emerald-500 hover:text-rose-500' : 'text-slate-300 hover:text-emerald-500'}`}
                      title={u.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {u.is_active ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
