import { useState, useEffect } from 'react'
import { Check, Trash2 } from 'lucide-react'
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
  Pending:       'bg-yellow-100 text-yellow-700',
  'Under Review':'bg-blue-100 text-blue-700',
  Interview:     'bg-purple-100 text-purple-700',
  Accepted:      'bg-green-100 text-green-700',
  Rejected:      'bg-red-100 text-red-600',
}

const STEPS = ['Applied', 'Review', 'Interview', 'Accepted']

const PipelineTracker = ({ status }) => {
  const current = STATUS_STEP[status] || 1
  return (
    <div className="flex items-start mt-3 px-2">
      {STEPS.map((step, i) => {
        const n = i + 1
        const done = n < current
        const active = n === current
        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
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

const FILTER_KEYS = ['All', 'Pending', 'Under Review', 'Interview', 'Accepted', 'Rejected']
const FILTER_LABELS = {
  'All': 'All',
  'Pending': 'Applied',
  'Under Review': 'Reviewing',
  'Interview': 'Interview',
  'Accepted': 'Accepted',
  'Rejected': 'Rejected',
}

const MyApplicationsView = () => {
  const { user } = useAuth()
  const [apps, setApps] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('All')
  const [cancelError, setCancelError] = useState('')

  const fetchApps = async () => {
    setIsLoading(true)
    try {
      const res = await axiosInstance.get(`/api/dashboard/applications/my/${user.id}`)
      setApps(res.data)
    } catch { /* silently fail */ }
    finally { setIsLoading(false) }
  }

  useEffect(() => { fetchApps() }, [user.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCancel = async (appId) => {
    if (!window.confirm('Retract this application?')) return
    setCancelError('')
    try {
      await axiosInstance.delete(`/api/dashboard/applications/cancel/${appId}`)
      setApps(prev => prev.filter(a => a.app_id !== appId))
    } catch (err) {
      setCancelError(err.response?.data?.detail || 'Failed to retract application.')
    }
  }

  const counts = FILTER_KEYS.reduce((acc, k) => {
    acc[k] = k === 'All' ? apps.length : apps.filter(a => a.status === k).length
    return acc
  }, {})

  const filtered = activeFilter === 'All' ? apps : apps.filter(a => a.status === activeFilter)

  const statCards = [
    { label: 'Total',     value: apps.length,           color: 'text-gray-900' },
    { label: 'Applied',   value: counts['Pending'],      color: 'text-gray-700' },
    { label: 'Reviewing', value: counts['Under Review'], color: 'text-orange-600' },
    { label: 'Interview', value: counts['Interview'],    color: 'text-purple-600' },
    { label: 'Accepted',  value: counts['Accepted'],     color: 'text-green-600' },
  ]

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">My Applications</h2>
        <p className="text-sm text-gray-400 mt-0.5">Track all your job applications</p>
      </div>

      {cancelError && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">
          {cancelError}
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-5 gap-3">
        {statCards.map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTER_KEYS.map(key => {
          const cnt = counts[key]
          const isActive = activeFilter === key
          return (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1.5 ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-300'
              }`}
            >
              {FILTER_LABELS[key]}
              <span className={`text-[10px] font-bold ${isActive ? 'opacity-80' : 'text-gray-400'}`}>
                {cnt}
              </span>
            </button>
          )
        })}
      </div>

      {/* Application cards */}
      {isLoading ? (
        <div className="text-center py-16 text-sm text-gray-400 animate-pulse">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-sm text-gray-400">No applications in this category.</div>
      ) : (
        <div className="space-y-4">
          {filtered.map(app => (
            <div key={app.app_id} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5">
              <div className="flex items-start gap-4">
                <div className={`h-11 w-11 ${avatarColor(app.company_name)} rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                  {companyInitials(app.company_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-gray-900">{app.job_title}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {app.company_name} · {app.applied_at_formatted}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_BADGE[app.status] || 'bg-gray-100 text-gray-600'}`}>
                        {app.status}
                      </span>
                      <button
                        onClick={() => handleCancel(app.app_id)}
                        className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-red-50 transition"
                        title="Retract application"
                      >
                        <Trash2 size={14} className="text-gray-300 hover:text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <PipelineTracker status={app.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyApplicationsView
