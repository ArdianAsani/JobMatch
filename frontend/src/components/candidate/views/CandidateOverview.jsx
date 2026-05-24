import { useState, useEffect } from 'react'
import { ClipboardList, Search, Calendar, Bookmark, Check, ArrowRight, AlertCircle, Sparkles } from 'lucide-react'
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

// ─── Profile Completion Card ──────────────────────────────────────────────────
const ProfileCompletionCard = ({ completion, onNavigate }) => {
  const { score, items } = completion
  const missing = items.filter(i => !i.done)

  const barColor =
    score === 100 ? 'from-green-400 to-emerald-500' :
    score >= 60   ? 'from-indigo-500 to-violet-500' :
    score >= 30   ? 'from-amber-400 to-orange-400'  :
                    'from-red-400 to-rose-400'

  const scoreLabel =
    score === 100 ? 'Profile complete!' :
    score >= 60   ? 'Almost there!'     :
    score >= 30   ? 'Getting started'   :
                    'Just started'

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      {/* Header row */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="font-bold text-gray-900 text-base">Profile Completion</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            A complete profile increases your match score significantly
          </p>
        </div>
        <div className="flex flex-col items-center shrink-0 ml-4">
          <span className={`text-3xl font-extrabold ${score === 100 ? 'text-green-500' : 'text-gray-800'}`}>
            {score}%
          </span>
          <span className="text-[10px] text-gray-400 mt-0.5 whitespace-nowrap">{scoreLabel}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-5">
        <div
          className={`h-full bg-gradient-to-r ${barColor} rounded-full transition-all duration-700`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Checklist */}
      <div className="space-y-2.5">
        {items.map(item => (
          <div key={item.field} className="flex items-center gap-3">
            <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
              item.done ? 'bg-green-500' : 'bg-gray-100'
            }`}>
              {item.done
                ? <Check size={10} className="text-white" />
                : <span className="text-[9px] text-gray-400 font-bold leading-none">+{item.points}</span>
              }
            </div>
            <span className={`text-sm flex-1 ${
              item.done ? 'text-gray-400 line-through' : 'text-gray-700 font-medium'
            }`}>
              {item.label}
            </span>
            {!item.done && (
              <span className="text-xs font-bold text-indigo-500">+{item.points}%</span>
            )}
          </div>
        ))}
      </div>

      {/* CTA */}
      {missing.length > 0 && (
        <button
          onClick={() => onNavigate('profile')}
          className="mt-5 w-full flex items-center justify-center gap-2 bg-indigo-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-indigo-700 transition"
        >
          <AlertCircle size={15} />
          Complete Profile — {100 - score}% remaining
        </button>
      )}
      {missing.length === 0 && (
        <div className="mt-5 flex items-center justify-center gap-2 bg-green-50 border border-green-100 text-green-600 text-sm font-semibold py-2.5 rounded-xl">
          <Check size={15} />
          Your profile is 100% complete!
        </div>
      )}
    </div>
  )
}

// ─── AI Match label styles ────────────────────────────────────────────────────
const MATCH_BADGE = {
  'Excellent Match': 'bg-green-50 text-green-700 border border-green-100',
  'Good Match':      'bg-blue-50 text-blue-700 border border-blue-100',
  'Moderate Match':  'bg-amber-50 text-amber-700 border border-amber-100',
  'Low Match':       'bg-gray-100 text-gray-500',
}

// ─── AI Matches Card ──────────────────────────────────────────────────────────
const AIMatchesCard = ({ onNavigate }) => {
  const { user } = useAuth()
  const [matches, setMatches] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [incompleteProfile, setIncompleteProfile] = useState(false)

  useEffect(() => {
    axiosInstance.get(`/api/dashboard/candidate/matches/${user.id}`)
      .then(r => {
        setMatches(r.data.matches || [])
        setIncompleteProfile(r.data.incomplete_profile || false)
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [user.id])

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-gray-900">AI Job Matches</h3>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
            <Sparkles size={10} /> SBERT
          </span>
        </div>
        <button
          onClick={() => onNavigate('browse')}
          className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1"
        >
          Browse all <ArrowRight size={12} />
        </button>
      </div>

      {/* Body */}
      {isLoading ? (
        <div className="px-6 py-10 text-center text-sm text-gray-400 animate-pulse">
          Analysing your profile...
        </div>
      ) : incompleteProfile ? (
        <div className="px-6 py-10 text-center">
          <Sparkles size={20} className="text-indigo-200 mx-auto mb-2" />
          <p className="text-sm text-gray-500 font-medium">Complete your profile to unlock AI matching.</p>
          <p className="text-xs text-gray-400 mt-1">Add a headline, professional summary, and skills.</p>
          <button
            onClick={() => onNavigate('profile')}
            className="mt-4 text-xs text-indigo-600 font-semibold hover:underline"
          >
            Go to profile →
          </button>
        </div>
      ) : matches.length === 0 ? (
        <div className="px-6 py-10 text-center text-sm text-gray-400">
          No active job listings available right now.
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {matches.map(job => (
            <div key={job.id} className="px-6 py-4 flex items-center gap-4">
              {/* Company avatar */}
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 ${avatarColor(job.company_name)}`}>
                {companyInitials(job.company_name)}
              </div>

              {/* Job info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 truncate">{job.title}</p>
                <p className="text-xs text-gray-400 truncate">
                  {job.company_name}{job.location ? ` · ${job.location}` : ''}
                </p>
              </div>

              {/* Match score */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm font-bold text-gray-800">{job.match_score_pct}%</span>
                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap ${MATCH_BADGE[job.match_label] || MATCH_BADGE['Low Match']}`}>
                  {job.match_label}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Overview ────────────────────────────────────────────────────────────
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
  const completion = data?.profile_completion || null
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
          <h2 className="text-white text-xl font-bold">Welcome back, {name}!</h2>
          <p className="text-slate-400 text-sm mt-1">
            Here is an overview of your job search activity.
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

      {/* Profile Completion */}
      {completion && (
        <ProfileCompletionCard completion={completion} onNavigate={onNavigate} />
      )}

      {/* AI Job Matches */}
      <AIMatchesCard onNavigate={onNavigate} />

      {/* Application Status */}
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
          {recentApps.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-gray-400">No applications yet.</p>
              <button
                onClick={() => onNavigate('browse')}
                className="mt-3 text-xs text-indigo-600 font-semibold hover:underline"
              >
                Browse open jobs →
              </button>
            </div>
          ) : (
            recentApps.map(app => (
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
                    <p className="text-xs text-gray-400">{app.company_name} · {app.applied_at_formatted}</p>
                  </div>
                </div>
                <PipelineTracker status={app.status} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default CandidateOverview
