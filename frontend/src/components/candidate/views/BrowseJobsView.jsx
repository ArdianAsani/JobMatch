import { useState, useEffect, useCallback } from 'react'
import { MapPin, Briefcase, Bookmark, ChevronDown } from 'lucide-react'
import axiosInstance from '../../../api/axiosInstance'

const AVATAR_COLORS = [
  'bg-purple-600', 'bg-blue-600', 'bg-teal-600', 'bg-rose-500',
  'bg-amber-500', 'bg-indigo-600', 'bg-green-600',
]
const avatarColor = (name = '') =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
const companyInitials = (name = '') =>
  name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

const JOB_TYPES = ['All', 'Full-time', 'Part-time', 'Remote', 'Contract', 'Internship']
const CATEGORY_PILLS = ['All', 'Engineering', 'Product', 'Design', 'Data', 'Marketing']
const SORT_OPTIONS = ['Latest', 'Salary High-Low', 'Salary Low-High']

const CATEGORY_KEYWORDS = {
  Engineering: ['engineer', 'developer', 'devops', 'backend', 'frontend', 'fullstack'],
  Product:     ['product', 'manager', 'pm', 'owner'],
  Design:      ['design', 'ux', 'ui', 'creative'],
  Data:        ['data', 'analyst', 'scientist', 'ml', 'ai'],
  Marketing:   ['marketing', 'growth', 'content', 'seo', 'brand'],
}

const formatSalary = (salary) => {
  if (!salary) return null
  const k = Math.round(salary / 1000)
  return `$${k}k/yr`
}

const JobCard = ({ job, onApply, onToggleSave }) => {
  const initials = companyInitials(job.company_name)
  const color = avatarColor(job.company_name)
  const isRemote = job.job_type === 'Remote' || (job.location || '').toLowerCase().includes('remote')

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col">
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
          onClick={() => onToggleSave(job.id)}
          className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-gray-50 transition"
        >
          <Bookmark
            size={15}
            className={job.is_saved ? 'text-indigo-500 fill-indigo-500' : 'text-gray-300'}
          />
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {job.location && (
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin size={10} /> {job.location}
          </span>
        )}
        {job.job_type && (
          <span className="flex items-center gap-1 text-xs text-gray-500 ml-1">
            <Briefcase size={10} /> {job.job_type}
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
          onClick={() => onApply(job.id)}
          className="bg-indigo-600 text-white text-xs font-semibold px-4 py-1.5 rounded-full hover:bg-indigo-700 transition"
        >
          Apply
        </button>
      </div>

      <p className="text-xs text-gray-300 mt-2.5">Posted {job.posted_ago}</p>
    </div>
  )
}

const BrowseJobsView = () => {
  const [jobs, setJobs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [applyingId, setApplyingId] = useState(null)
  const [applyError, setApplyError] = useState('')
  const [applySuccess, setApplySuccess] = useState('')
  const [search, setSearch] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [sortBy, setSortBy] = useState('Latest')

  const fetchJobs = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await axiosInstance.get('/api/dashboard/jobs/all')
      setJobs(res.data)
    } catch { /* handle silently */ }
    finally { setIsLoading(false) }
  }, [])

  useEffect(() => { fetchJobs() }, [fetchJobs])

  const handleApply = async (jobId) => {
    setApplyingId(jobId)
    setApplyError('')
    setApplySuccess('')
    try {
      await axiosInstance.post('/api/dashboard/applications/create', { job_id: jobId })
      setApplySuccess('Application submitted successfully.')
      fetchJobs()
    } catch (err) {
      setApplyError(err.response?.data?.detail || 'Failed to apply.')
    } finally {
      setApplyingId(null)
    }
  }

  const handleToggleSave = async (jobId) => {
    try {
      const res = await axiosInstance.post(`/api/dashboard/saved-jobs/toggle/${jobId}`)
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, is_saved: res.data.saved } : j))
    } catch { /* silently fail */ }
  }

  const handleReset = () => {
    setSearch('')
    setLocationFilter('')
    setTypeFilter('All')
    setCategoryFilter('All')
  }

  const filtered = jobs.filter(j => {
    const q = search.toLowerCase()
    if (q && !j.title.toLowerCase().includes(q) && !j.company_name.toLowerCase().includes(q)) return false
    if (locationFilter && !(j.location || '').toLowerCase().includes(locationFilter.toLowerCase())) return false
    if (typeFilter !== 'All' && j.job_type !== typeFilter) return false
    if (categoryFilter !== 'All') {
      const keywords = CATEGORY_KEYWORDS[categoryFilter] || []
      const titleLower = j.title.toLowerCase()
      if (!keywords.some(kw => titleLower.includes(kw))) return false
    }
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'Salary High-Low') return (b.salary || 0) - (a.salary || 0)
    if (sortBy === 'Salary Low-High') return (a.salary || 0) - (b.salary || 0)
    return 0
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Browse Jobs</h2>
          <p className="text-sm text-indigo-600 font-medium mt-0.5">
            {sorted.length} job{sorted.length !== 1 ? 's' : ''} match your search
          </p>
        </div>
        <div className="relative">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2 pr-8 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-200 cursor-pointer"
          >
            {SORT_OPTIONS.map(o => <option key={o}>{o}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-3 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Feedback messages */}
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

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Job Title / Company</label>
            <input
              type="text"
              placeholder="e.g. React Developer..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Location</label>
            <input
              type="text"
              placeholder="e.g. New York..."
              value={locationFilter}
              onChange={e => setLocationFilter(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Job Type</label>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-200 cursor-pointer"
            >
              {JOB_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Category</label>
            <div className="flex gap-2">
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-200 cursor-pointer"
              >
                {CATEGORY_PILLS.map(c => <option key={c}>{c}</option>)}
              </select>
              <button
                onClick={handleReset}
                className="px-3 py-2 bg-gray-100 text-gray-500 rounded-xl text-sm font-medium hover:bg-gray-200 transition"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2">
          {CATEGORY_PILLS.map(pill => (
            <button
              key={pill}
              onClick={() => setCategoryFilter(pill === 'All' ? 'All' : pill)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
                (pill === 'All' && categoryFilter === 'All') || categoryFilter === pill
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {pill}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs grid */}
      {isLoading ? (
        <div className="text-center py-16 text-sm text-gray-400 animate-pulse">Loading jobs...</div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-16 text-sm text-gray-400">No jobs found. Try adjusting your filters.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map(job => (
            <JobCard
              key={job.id}
              job={job}
              onApply={handleApply}
              onToggleSave={handleToggleSave}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default BrowseJobsView
