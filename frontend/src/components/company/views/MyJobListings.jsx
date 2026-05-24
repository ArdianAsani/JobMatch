import { useState, useEffect } from 'react'
import { Plus, Edit, X } from 'lucide-react'
import axiosInstance from '../../../api/axiosInstance'
import { useAuth } from '../../../contexts/AuthContext'
import JobFormModal from '../modals/JobFormModal'

// Closed is not a separate state in the DB — a job is either active or paused (inactive)
const FILTERS = ['All', 'Active', 'Paused']

const StatusBadge = ({ active }) => {
  if (active) return <span className="text-xs font-semibold bg-green-50 text-green-700 px-2.5 py-0.5 rounded-full">Active</span>
  return <span className="text-xs font-semibold bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full">Paused</span>
}

const MyJobListings = () => {
  const { user } = useAuth()
  const [listings, setListings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [editingJob, setEditingJob] = useState(null)

  const fetchListings = async () => {
    setIsLoading(true)
    setError('')
    try {
      const res = await axiosInstance.get(`/api/dashboard/company/${user.id}`)
      setListings(res.data.my_listings)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load job listings')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchListings() }, []) // eslint-disable-line

  const handleDelete = async (jobId) => {
    if (!window.confirm('Delete this listing? All linked applications will be removed.')) return
    try {
      await axiosInstance.delete(`/api/dashboard/jobs/delete/${jobId}`)
      fetchListings()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete listing')
    }
  }

  const openEdit = (job) => {
    setEditingJob(job)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingJob(null)
  }

  const filtered = listings.filter(j => {
    if (filter === 'Active') return j.is_active
    if (filter === 'Paused') return !j.is_active
    return true
  })

  const countByFilter = {
    All: listings.length,
    Active: listings.filter(j => j.is_active).length,
    Paused: listings.filter(j => !j.is_active).length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Job Listings</h1>
          <p className="text-sm text-gray-400 mt-0.5">{listings.length} total position{listings.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => { setEditingJob(null); setShowModal(true) }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition shadow-sm"
        >
          <Plus size={16} /> Post New Job
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filter === f ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {f} {f !== 'All' ? `(${countByFilter[f]})` : `(${countByFilter.All})`}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-5 py-3">{error}</div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-sm text-gray-400 animate-pulse">Loading listings...</div>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 font-semibold uppercase tracking-wider border-b border-gray-100 bg-gray-50/50">
                <th className="px-6 py-3 text-left">Job Title</th>
                <th className="px-6 py-3 text-left">Location</th>
                <th className="px-6 py-3 text-left">Type</th>
                <th className="px-6 py-3 text-left">Salary</th>
                <th className="px-6 py-3 text-left">Applicants</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Posted</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(job => (
                <tr key={job.id} className="hover:bg-gray-50/30 transition">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-800">{job.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{job.job_type}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{job.location || '—'}</td>
                  <td className="px-6 py-4 text-gray-500">{job.job_type || '—'}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {job.salary ? `$${Number(job.salary).toLocaleString()}/mo` : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-800">{job.applicant_count}</span>
                  </td>
                  <td className="px-6 py-4"><StatusBadge active={job.is_active} /></td>
                  <td className="px-6 py-4 text-gray-400 text-xs">{job.posted_ago}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(job)}
                        className="text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition flex items-center gap-1"
                      >
                        <Edit size={12} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(job.id)}
                        className="h-7 w-7 flex items-center justify-center rounded-lg border border-red-100 hover:bg-red-50 transition group"
                      >
                        <X size={14} className="text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-sm text-gray-400 italic">
                    No listings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <JobFormModal
          job={editingJob}
          onClose={closeModal}
          onSuccess={() => { closeModal(); fetchListings() }}
        />
      )}
    </div>
  )
}

export default MyJobListings
