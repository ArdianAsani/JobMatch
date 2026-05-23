import { useState, useEffect } from 'react'
import { Briefcase, Users, Download, Plus, X } from 'lucide-react'
import axiosInstance from '../../../api/axiosInstance'
import { useAuth } from '../../../contexts/AuthContext'
import JobFormModal from '../modals/JobFormModal'
import ApplicantDetailModal from '../modals/ApplicantDetailModal'

// ─── Stat Card ───────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, iconBg, value, label }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
    <div className="h-10 w-10 mb-4 rounded-xl flex items-center justify-center" style={{ background: iconBg }}>
      <Icon size={18} className="text-white" />
    </div>
    <p className="text-3xl font-bold text-gray-900">{value}</p>
    <p className="text-sm text-gray-500 mt-1">{label}</p>
  </div>
)

// ─── Status badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ active }) =>
  active ? (
    <span className="text-xs font-semibold bg-green-50 text-green-700 px-2.5 py-0.5 rounded-full">Active</span>
  ) : (
    <span className="text-xs font-semibold bg-red-50 text-red-600 px-2.5 py-0.5 rounded-full">Inactive</span>
  )

// ─── Main Overview ────────────────────────────────────────────────────────────
const CompanyOverview = ({ onNavigate }) => {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [applicants, setApplicants] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showJobModal, setShowJobModal] = useState(false)
  const [selectedApp, setSelectedApp] = useState(null)

  const fetchAll = async () => {
    setIsLoading(true)
    setError('')
    try {
      const [dashRes, appRes] = await Promise.all([
        axiosInstance.get(`/api/dashboard/company/${user.id}`),
        axiosInstance.get(`/api/dashboard/company/${user.id}/applicants`),
      ])
      setData(dashRes.data)
      setApplicants(appRes.data.slice(0, 3))
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, []) // eslint-disable-line

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-sm text-gray-400 animate-pulse">Loading dashboard...</div>
    </div>
  )

  if (error) return (
    <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-5 py-4">{error}</div>
  )

  const { stats, my_listings } = data
  const previewListings = my_listings.slice(0, 4)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your job listings and applicants</p>
        </div>
        <button
          onClick={() => setShowJobModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition shadow-sm"
        >
          <Plus size={16} /> Post a Job
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Briefcase} iconBg="#6366f1" value={stats.active_listings} label="Active Jobs" />
        <StatCard icon={Users}     iconBg="#7c3aed" value={stats.total_applicants} label="Total Applicants" />
        <StatCard icon={Download}  iconBg="#ec4899" value={stats.new_today}        label="New Today" />
      </div>

      {/* Manage Listings preview */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <h3 className="font-semibold text-gray-800">Manage Listings</h3>
          <button onClick={() => onNavigate('jobs')} className="text-sm text-indigo-600 font-medium hover:underline">
            View all →
          </button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 font-semibold uppercase tracking-wider border-b border-gray-50">
              <th className="px-6 py-3 text-left">Job Title</th>
              <th className="px-6 py-3 text-left">Location</th>
              <th className="px-6 py-3 text-left">Applicants</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Posted</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {previewListings.map(job => (
              <tr key={job.id} className="hover:bg-gray-50/50 transition">
                <td className="px-6 py-3">
                  <p className="font-medium text-gray-800">{job.title}</p>
                  <p className="text-xs text-gray-400">{job.job_type}</p>
                </td>
                <td className="px-6 py-3 text-gray-500">{job.location || '—'}</td>
                <td className="px-6 py-3">
                  <span className="font-semibold text-gray-800">{job.applicant_count}</span>
                  <span className="text-gray-400"> applicants</span>
                </td>
                <td className="px-6 py-3"><StatusBadge active={job.is_active} /></td>
                <td className="px-6 py-3 text-gray-400">{job.posted_ago}</td>
                <td className="px-6 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => onNavigate('jobs')} className="text-xs border border-gray-200 px-3 py-1 rounded-lg hover:bg-gray-50 transition">Edit</button>
                    <div className="h-6 w-6 flex items-center justify-center rounded-lg hover:bg-red-50 cursor-pointer group">
                      <X size={14} className="text-gray-300 group-hover:text-red-400 transition" />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
            {previewListings.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-400 italic">No job listings yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Recent Applicants preview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Recent Applicants</h3>
          <button onClick={() => onNavigate('applicants')} className="text-sm text-indigo-600 font-medium hover:underline">
            View all →
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {applicants.map(app => {
            const initials = app.candidate_name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?'
            const skills = app.candidate_skills?.split(',').map(s => s.trim()).filter(Boolean).slice(0, 3) || []
            return (
              <div key={app.app_id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {initials}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{app.candidate_name}</p>
                      <p className="text-xs text-gray-400">{app.job_title}</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {skills.map(s => (
                    <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">{s}</span>
                  ))}
                  {skills.length === 0 && (
                    <span className="text-xs text-gray-300">No skills listed</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-indigo-50 text-indigo-600 font-medium px-2.5 py-1 rounded-full">
                    {app.app_status}
                  </span>
                  <button
                    onClick={() => setSelectedApp(app)}
                    className="text-xs border border-indigo-200 text-indigo-600 px-4 py-1.5 rounded-xl font-medium hover:bg-indigo-50 transition"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            )
          })}
          {applicants.length === 0 && (
            <div className="col-span-3 bg-white rounded-2xl p-8 text-center text-sm text-gray-400 border border-gray-100">
              No applicants yet
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showJobModal && (
        <JobFormModal
          onClose={() => setShowJobModal(false)}
          onSuccess={fetchAll}
        />
      )}
      {selectedApp && (
        <ApplicantDetailModal
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
          onStatusUpdate={fetchAll}
        />
      )}
    </div>
  )
}

export default CompanyOverview
