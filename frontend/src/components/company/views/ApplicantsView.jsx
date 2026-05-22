import { useState, useEffect } from 'react'
import { Search, Zap, Download } from 'lucide-react'
import axiosInstance from '../../../api/axiosInstance'
import { useAuth } from '../../../contexts/AuthContext'
import ApplicantDetailModal from '../modals/ApplicantDetailModal'

const STATUSES = ['All Statuses', 'Pending', 'Under Review', 'Interview', 'Accepted', 'Rejected']

const STATUS_COLORS = {
  Pending:       'bg-yellow-50 text-yellow-700',
  'Under Review':'bg-blue-50 text-blue-700',
  Interview:     'bg-purple-50 text-purple-700',
  Accepted:      'bg-green-50 text-green-700',
  Rejected:      'bg-red-50 text-red-600',
}

const MatchBadge = ({ score }) => {
  const color = score >= 90 ? 'bg-green-50 text-green-700' : score >= 80 ? 'bg-teal-50 text-teal-700' : 'bg-amber-50 text-amber-700'
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${color}`}>
      <Zap size={10} /> {score}% Match
    </span>
  )
}

const ApplicantsView = () => {
  const { user } = useAuth()
  const [applicants, setApplicants] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Statuses')
  const [selectedApp, setSelectedApp] = useState(null)

  const fetchApplicants = async () => {
    setIsLoading(true)
    setError('')
    try {
      const res = await axiosInstance.get(`/api/dashboard/company/${user.id}/applicants`)
      setApplicants(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load applicants')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchApplicants() }, []) // eslint-disable-line

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await axiosInstance.put(`/api/dashboard/applications/status/${appId}`, { status: newStatus })
      setApplicants(prev => prev.map(a => a.app_id === appId ? { ...a, app_status: newStatus } : a))
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update status')
    }
  }

  const filtered = applicants.filter(a => {
    const matchName = a.candidate_name?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'All Statuses' || a.app_status === statusFilter
    return matchName && matchStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Applicants</h1>
        <p className="text-sm text-gray-400 mt-0.5">{applicants.length} total candidate{applicants.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 w-64">
          <Search size={15} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search candidates..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="text-sm text-gray-600 outline-none placeholder-gray-400 w-full bg-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 outline-none cursor-pointer"
        >
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Error */}
      {error && <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-5 py-3">{error}</div>}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-sm text-gray-400 animate-pulse">Loading applicants...</div>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 font-semibold uppercase tracking-wider border-b border-gray-100 bg-gray-50/50">
                <th className="px-6 py-3 text-left">Candidate</th>
                <th className="px-6 py-3 text-left">Applied Role</th>
                <th className="px-6 py-3 text-left">Applied On</th>
                <th className="px-6 py-3 text-left">Skills</th>
                <th className="px-6 py-3 text-left">Match</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(app => {
                const initials = app.candidate_name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?'
                const skills = app.candidate_skills?.split(',').map(s => s.trim()).filter(Boolean).slice(0, 2) || []
                return (
                  <tr key={app.app_id} className="hover:bg-gray-50/30 transition">
                    {/* Candidate */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {initials}
                        </div>
                        <span className="font-semibold text-gray-800">{app.candidate_name}</span>
                      </div>
                    </td>
                    {/* Role */}
                    <td className="px-6 py-4 text-gray-500">{app.job_title}</td>
                    {/* Date */}
                    <td className="px-6 py-4 text-gray-400">{app.applied_at_formatted}</td>
                    {/* Skills */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {skills.map(s => (
                          <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">{s}</span>
                        ))}
                        {skills.length === 0 && <span className="text-gray-300 text-xs">—</span>}
                      </div>
                    </td>
                    {/* Match */}
                    <td className="px-6 py-4"><MatchBadge score={app.match_score} /></td>
                    {/* Status inline select */}
                    <td className="px-6 py-4">
                      <select
                        value={app.app_status}
                        onChange={e => handleStatusChange(app.app_id, e.target.value)}
                        className={`text-xs font-semibold border-0 rounded-lg px-2.5 py-1 outline-none cursor-pointer ${STATUS_COLORS[app.app_status] || 'bg-gray-100 text-gray-600'}`}
                      >
                        {['Pending', 'Under Review', 'Interview', 'Accepted', 'Rejected'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="text-xs border border-indigo-200 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition"
                        >
                          View
                        </button>
                        {app.cv_file_path ? (
                          <a
                            href={`${axiosInstance.defaults.baseURL}/${app.cv_file_path}`}
                            download={app.cv_filename}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs border border-indigo-200 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition"
                          >
                            <Download size={11} /> CV
                          </a>
                        ) : (
                          <span className="text-xs border border-gray-100 text-gray-300 px-3 py-1.5 rounded-lg cursor-not-allowed">
                            No CV
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-sm text-gray-400 italic">
                    {search || statusFilter !== 'All Statuses' ? 'No results match your filters' : 'No applicants yet'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {selectedApp && (
        <ApplicantDetailModal
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
          onStatusUpdate={fetchApplicants}
        />
      )}
    </div>
  )
}

export default ApplicantsView
