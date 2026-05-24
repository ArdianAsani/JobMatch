import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { MapPin, Briefcase, Search, Zap, Building2, Clock, DollarSign } from 'lucide-react'
import axios from 'axios'
import axiosPublic from '../api/axiosInstance'
import LandingNavbar from '../components/landing/LandingNavbar'
import LandingFooter from '../components/landing/LandingFooter'
import { useAuth } from '../contexts/AuthContext'

const JOB_TYPES = ['All', 'Full-time', 'Part-time', 'Remote', 'Contract', 'Internship']

const AVATAR_COLORS = [
  'bg-indigo-500', 'bg-violet-500', 'bg-teal-500',
  'bg-rose-500', 'bg-amber-500', 'bg-blue-500', 'bg-green-500',
]

const avatarColor = (name = '') =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]

const initials = (name = '') =>
  name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

const formatSalary = (salary) => {
  if (!salary) return null
  return `$${Math.round(salary).toLocaleString()}/mo`
}

// ─── Job Card ─────────────────────────────────────────────────────────────────
const JobCard = ({ job, onApply }) => {
  const color = avatarColor(job.company_name)
  const init = initials(job.company_name)

  return (
    <div className="bg-white rounded-[40px] p-7 shadow-sm hover:shadow-md border border-gray-100 transition-all flex flex-col gap-4">
      {/* Header: avatar + title */}
      <div className="flex items-start gap-4">
        <div className={`h-12 w-12 ${color} rounded-2xl flex items-center justify-center text-white font-bold text-sm shrink-0`}>
          {init}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-base leading-tight">{job.title}</h3>
          <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
            <Building2 size={12} className="shrink-0" /> {job.company_name}
          </p>
        </div>
      </div>

      {/* Meta: location, type */}
      <div className="flex flex-wrap gap-2">
        {job.location && (
          <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-full px-3 py-1">
            <MapPin size={11} /> {job.location}
          </span>
        )}
        {job.job_type && (
          <span className="inline-flex items-center gap-1 text-xs text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1">
            <Briefcase size={11} /> {job.job_type}
          </span>
        )}
        {job.job_type === 'Remote' && (
          <span className="text-xs bg-green-50 text-green-600 border border-green-100 rounded-full px-3 py-1 font-medium">
            Remote
          </span>
        )}
      </div>

      {/* Description snippet */}
      <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
        {job.description}
      </p>

      {/* Footer: salary + posted + apply */}
      <div className="flex items-center justify-between mt-auto pt-1">
        <div>
          {formatSalary(job.salary) && (
            <p className="text-sm font-bold text-gray-800 flex items-center gap-1">
              <DollarSign size={13} className="text-green-500" />
              {formatSalary(job.salary)}
            </p>
          )}
          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
            <Clock size={10} /> {job.posted_ago}
          </p>
        </div>
        <button
          onClick={() => onApply(job.id)}
          className="bg-indigo-600 text-white text-xs font-semibold px-5 py-2.5 rounded-full hover:bg-indigo-700 active:scale-95 transition-all shadow-sm shadow-indigo-200"
        >
          Apply Now
        </button>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function FindJobs() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()

  const [jobs, setJobs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [locationFilter, setLocationFilter] = useState(searchParams.get('location') || '')
  const [typeFilter, setTypeFilter] = useState('All')

  useEffect(() => {
    axios.get('/api/jobs/public')
      .then(r => setJobs(r.data))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  const handleApply = (jobId) => {
    if (!user) {
      // Save intended job so we can redirect back after login
      localStorage.setItem('pending_job_id', String(jobId))
      navigate('/login')
      return
    }
    // Logged-in candidates go straight to their dashboard
    if (user.role === 'CANDIDATE') {
      navigate('/candidate/dashboard')
    }
  }

  const filtered = jobs.filter(j => {
    const q = search.toLowerCase()
    if (q && !j.title.toLowerCase().includes(q) && !j.company_name.toLowerCase().includes(q)) return false
    if (locationFilter && !(j.location || '').toLowerCase().includes(locationFilter.toLowerCase())) return false
    if (typeFilter !== 'All' && j.job_type !== typeFilter) return false
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <LandingNavbar />

      {/* ── Hero search ── */}
      <section className="bg-gradient-to-br from-indigo-50 via-purple-50 to-white py-14 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-indigo-100 rounded-full px-4 py-2 mb-5 shadow-sm">
            <Zap size={14} className="text-indigo-500" />
            <span className="text-sm text-gray-600 font-medium">
              {jobs.length} active positions available
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3">
            Find Your <span className="text-indigo-600">Next Opportunity</span>
          </h1>
          <p className="text-gray-500 mb-8 text-base">
            Browse open positions from top companies and apply in seconds.
          </p>

          {/* Search bar */}
          <div className="bg-white rounded-[40px] shadow-md p-2 flex flex-col md:flex-row gap-2 max-w-3xl mx-auto">
            <div className="flex items-center gap-3 flex-1 px-5 py-1">
              <Search size={16} className="text-indigo-400 shrink-0" />
              <input
                type="text"
                placeholder="Job title or company..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 outline-none text-gray-700 text-sm placeholder-gray-400 py-2 bg-transparent"
              />
            </div>
            <div className="hidden md:block w-px bg-gray-100 my-2" />
            <div className="flex items-center gap-3 px-5 md:w-44 py-1">
              <MapPin size={15} className="text-red-400 shrink-0" />
              <input
                type="text"
                placeholder="Location"
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value)}
                className="flex-1 outline-none text-gray-700 text-sm placeholder-gray-400 py-2 bg-transparent w-full"
              />
            </div>
            <button
              onClick={() => {}}
              className="bg-indigo-600 text-white px-7 py-3 rounded-[32px] font-semibold text-sm hover:bg-indigo-700 transition-colors whitespace-nowrap"
            >
              Search
            </button>
          </div>
        </div>
      </section>

      {/* ── Filters + Grid ── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10">
        {/* Job type pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {JOB_TYPES.map(type => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                typeFilter === type
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
              }`}
            >
              {type}
            </button>
          ))}
          <span className="ml-auto text-sm text-gray-400 self-center">
            {filtered.length} job{filtered.length !== 1 ? 's' : ''} found
          </span>
        </div>

        {/* Job cards grid */}
        {isLoading ? (
          <div className="text-center py-24 text-gray-400 animate-pulse text-sm">
            Loading jobs...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-400 text-sm">No jobs match your search. Try different keywords.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(job => (
              <JobCard key={job.id} job={job} onApply={handleApply} />
            ))}
          </div>
        )}
      </main>

      <LandingFooter />
    </div>
  )
}
