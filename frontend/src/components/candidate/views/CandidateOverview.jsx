import { useState, useEffect } from 'react'
import { ClipboardList, Search, Calendar, Bookmark, Zap, Check, MapPin, Briefcase, ArrowRight } from 'lucide-react'
import axiosInstance from '../../../api/axiosInstance'
import { useAuth } from '../../../contexts/AuthContext'

const AVATAR_COLORS = [
  'bg-purple-600', 'bg-blue-600', 'bg-teal-600', 'bg-rose-500',
  'bg-amber-500', 'bg-indigo-600', 'bg-green-600',
]
const avatarColor = (name = '') =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]

const companyInitials = (name = '') =>
  name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

const STATUS_STEP = {
  Pending: 1, 'Under Review': 2, Interview: 3, Accepted: 4, Rejected: 1,
}

const STATUS_BADGE = {
  Pending:       'bg-yellow-50 text-yellow-700',
  'Under Review':'bg-blue-50 text-blue-700',
  Interview:     'bg-purple-50 text-purple-700',
  Accepted:      'bg-green-50 text-green-700',
  Rejected:      'bg-red-50 text-red-600',
}

const STEPS = ['Applied', 'Review', 'Interview', 'Accepted']

const PipelineTracker = ({ status }) => {
  const current = STATUS_STEP[status] || 1
  return (
    <div className="flex items-center gap-0 mt-3">
      {STEPS.map((step, i) => {
        const n = i + 1
        const done = n < current
        const active = n === current
        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                done ? 'bg-indigo-600 text-white' :
                active ? 'bg-indigo-600 text-white ring-2 ring-indigo-200' :
                'bg-gray-100 text-gray-400'
              }`}>
                {done ? <Check size={12} /> : n}
              </div>
              <span className="text-[10px] text-gray-400 mt-1 whitespace-nowrap">{step}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mb-5 mx-1 ${done ? 'bg-indigo-600' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

const CandidateOverview = ({ onNavigate }) => {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    axiosInstance.get(`/api/dashboard/candidate/overview/${user.id}`)
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [user.id])

  if (isLoading) {
    return <div className="flex items-center justify-center py-24"><div className="text-sm text-gray-400 animate-pulse">Loading...</div></div>
  }

  const stats = data?.stats || {}
  const recentApps = data?.recent_applications || []
  const recommended = data?.recommended_jobs || []
  const name = data?.candidate_info?.name?.split(' ')[0] || 'there'

  const STAT_CARDS = [
    { label: 'Applications', value: stats.total_apps ?? 0, icon: ClipboardList, color: 'bg-violet-50', iconColor: 'text-violet-500' },
    { label: 'In Review',    value: stats.in_review    ?? 0, icon: Search,       color: 'bg-blue-50',   iconColor: 'text-blue-500' },
    { label: 'Interviews',   value: stats.interviews   ?? 0, icon: Calendar,     color: 'bg-slate-50',  iconColor: 'text-slate-500' },
    { label: 'Saved Jobs',   value: stats.saved_jobs   ?? 0, icon: Bookmark,     color: 'bg-pink-50',   iconColor: 'text-pink-500' },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-[#1a2035] rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-white text-xl font-bold">Welcome back, {name}! 👋</h2>
          <p className="text-slate-400 text-sm mt-1">
            You have{' '}
            <span className="text-indigo-400 font-semibold">{recommended.length} new job recommendations</span>
            {stats.interviews > 0 && ` and ${stats.interviews} interview request${stats.interviews > 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={() => onNavigate('browse')}
          className="shrink-0 px-5 py-2.5 border border-white/20 text-white text-sm font-semibold rounded-xl hover:bg-white/10 transition flex items-center gap-2"
        >
          Browse Jobs <ArrowRight size={15} />
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ label, value, icon: Icon, color, iconColor }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className={`h-10 w-10 ${color} rounded-xl flex items-center justify-center mb-3`}>
              <Icon size={18} className={iconColor} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Application Status */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
              <h3 className="font-bold text-gray-900">Application Status</h3>
              <button
                onClick={() => onNavigate('applications')}
                className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1"
              >
                View all <ArrowRight size={12} />
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {recentApps.length === 0 && (
                <p className="px-6 py-8 text-sm text-gray-400 text-center">No applications yet.</p>
              )}
              {recentApps.map(app => (
                <div key={app.app_id} className="px-6 py-4">
                  <div className="flex items-center gap-3 mb-1">
                    <div className={`h-9 w-9 ${avatarColor(app.company_name)} rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                      {companyInitials(app.company_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm text-gray-900 truncate">{app.job_title}</p>
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ml-2 shrink-0 ${STATUS_BADGE[app.status] || 'bg-gray-100 text-gray-600'}`}>
                          {app.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">{app.company_name}</p>
                    </div>
                  </div>
                  <PipelineTracker status={app.status} />
                </div>
              ))}
            </div>
          </div>

          {/* Recommended for You */}
          {recommended.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900">Recommended for You</h3>
                  <p className="text-xs text-gray-400">Based on your profile and AI match score</p>
                </div>
                <button
                  onClick={() => onNavigate('browse')}
                  className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1"
                >
                  Browse all jobs <ArrowRight size={12} />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {recommended.map(job => (
                  <MiniJobCard key={job.id} job={job} onNavigate={onNavigate} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Profile Strength */}
          <ProfileStrengthCard candidateInfo={data?.candidate_info} />

        </div>
      </div>
    </div>
  )
}

const ProfileStrengthCard = ({ candidateInfo }) => {
  const BARS = [
    { label: 'Overall Score', pct: 78, color: 'bg-indigo-600', bold: true },
    { label: 'Skills',        pct: 90, color: 'bg-green-500' },
    { label: 'Experience',    pct: 75, color: 'bg-indigo-600' },
    { label: 'Education',     pct: 85, color: 'bg-indigo-600' },
    { label: 'Portfolio',     pct: 60, color: 'bg-orange-400' },
  ]
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="font-bold text-gray-900 text-sm mb-4">Profile Strength</h3>
      <div className="space-y-3">
        {BARS.map(({ label, pct, color, bold }) => (
          <div key={label}>
            <div className="flex justify-between mb-1">
              <span className="text-xs text-gray-500">{label}</span>
              <span className={`text-xs font-bold ${bold ? 'text-indigo-600' : 'text-gray-700'}`}>{pct}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const MiniJobCard = ({ job, onNavigate }) => {
  const initials = companyInitials(job.company_name)
  const color = avatarColor(job.company_name)
  const matchColor = job.match_score >= 90 ? 'bg-green-50 text-green-700' : job.match_score >= 80 ? 'bg-teal-50 text-teal-700' : 'bg-amber-50 text-amber-700'

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`h-8 w-8 ${color} rounded-lg flex items-center justify-center text-white text-xs font-bold`}>{initials}</div>
          <div>
            <p className="text-xs font-bold text-gray-900 line-clamp-1">{job.title}</p>
            <p className="text-[10px] text-gray-400">{job.company_name}</p>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-1 mb-2">
        {job.location && <span className="flex items-center gap-0.5 text-[10px] text-gray-400"><MapPin size={9}/>{job.location}</span>}
        {job.job_type && <span className="flex items-center gap-0.5 text-[10px] text-gray-400 ml-1"><Briefcase size={9}/>{job.job_type}</span>}
      </div>
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${matchColor}`}>
          <Zap size={9}/>{job.match_score}% Match
        </span>
        <button
          onClick={() => onNavigate('browse')}
          className="text-[10px] font-semibold text-indigo-600 hover:underline"
        >
          Apply →
        </button>
      </div>
    </div>
  )
}

export default CandidateOverview
