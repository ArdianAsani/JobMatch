import { useState, useEffect } from 'react'
import { MapPin, Briefcase, Bookmark } from 'lucide-react'
import axiosInstance from '../../../api/axiosInstance'

const AVATAR_COLORS = [
  'bg-purple-600', 'bg-blue-600', 'bg-teal-600', 'bg-rose-500',
  'bg-amber-500', 'bg-indigo-600', 'bg-green-600',
]
const avatarColor = (name = '') =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
const companyInitials = (name = '') =>
  name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

const formatSalary = (salary) => {
  if (!salary) return null
  return `$${Math.round(salary).toLocaleString()}/mo`
}

const SavedJobsView = () => {
  const [jobs, setJobs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [applySuccess, setApplySuccess] = useState('')
  const [applyError, setApplyError] = useState('')

  const fetchSaved = async () => {
    setIsLoading(true)
    try {
      const res = await axiosInstance.get('/api/dashboard/saved-jobs/my')
      setJobs(res.data)
    } catch { /* silently fail */ }
    finally { setIsLoading(false) }
  }

  useEffect(() => { fetchSaved() }, [])

  const handleUnsave = async (jobId) => {
    try {
      await axiosInstance.post(`/api/dashboard/saved-jobs/toggle/${jobId}`)
      setJobs(prev => prev.filter(j => j.id !== jobId))
    } catch { /* silently fail */ }
  }

  const handleApply = async (jobId) => {
    setApplyError('')
    setApplySuccess('')
    try {
      await axiosInstance.post('/api/dashboard/applications/create', { job_id: jobId })
      setApplySuccess('Application submitted successfully.')
      fetchSaved()
    } catch (err) {
      setApplyError(err.response?.data?.detail || 'Failed to apply.')
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Saved Jobs</h2>
        <p className="text-sm text-gray-400 mt-0.5">
          {jobs.length} saved position{jobs.length !== 1 ? 's' : ''}
        </p>
      </div>

      {applySuccess && (
        <div className="bg-green-50 border border-green-100 text-green-700 text-sm rounded-xl px-4 py-3">
          {applySuccess}
        </div>
      )}
      {applyError && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">
          {applyError}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-16 text-sm text-gray-400 animate-pulse">Loading...</div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16 text-sm text-gray-400">
          No saved jobs yet. Browse jobs and bookmark the ones you like!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map(job => {
            const initials = companyInitials(job.company_name)
            const color = avatarColor(job.company_name)
            const isRemote = job.job_type === 'Remote' || (job.location || '').toLowerCase().includes('remote')

            return (
              <div key={job.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 ${color} rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                      {initials}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm leading-tight">{job.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{job.company_name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnsave(job.id)}
                    title="Remove from saved"
                    className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-red-50 transition"
                  >
                    <Bookmark size={15} className="text-indigo-500 fill-indigo-500" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {job.location && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin size={10} />{job.location}
                    </span>
                  )}
                  {job.job_type && (
                    <span className="flex items-center gap-1 text-xs text-gray-500 ml-1">
                      <Briefcase size={10} />{job.job_type}
                    </span>
                  )}
                  {isRemote && (
                    <span className="text-xs bg-green-50 text-green-600 px-1.5 py-0.5 rounded font-medium ml-1">Remote</span>
                  )}
                </div>

                {formatSalary(job.salary) && (
                  <p className="text-sm font-bold text-gray-800 mb-3">{formatSalary(job.salary)}</p>
                )}

                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs text-gray-400">
                    {job.applicant_count} applicant{job.applicant_count !== 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={() => handleApply(job.id)}
                    className="bg-indigo-600 text-white text-xs font-semibold px-4 py-1.5 rounded-full hover:bg-indigo-700 transition"
                  >
                    Apply
                  </button>
                </div>

                <p className="text-xs text-gray-300 mt-2.5">Posted {job.posted_ago}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default SavedJobsView
