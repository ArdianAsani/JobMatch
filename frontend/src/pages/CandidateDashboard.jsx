/**
 * Candidate Dashboard.
 *
 * Two tabs:
 *   - Explore Jobs: lists all active job listings with a mock AI match score
 *   - My Applications: shows the candidate's submitted applications and their statuses
 *
 * user.id (from AuthContext) is used for API calls that require the candidate's
 * user ID in the URL. This replaces the previous jwtDecode(getToken()).sub pattern
 * which was fragile (could crash if the token was null or malformed at render time).
 *
 * logout() comes from AuthContext so it also clears React state, not just localStorage.
 */

import { useState, useEffect } from 'react'
import { Compass, FileText, MapPin, Briefcase, Zap, Send, Trash2 } from 'lucide-react'
import axiosInstance from '../api/axiosInstance'
import { useAuth } from '../contexts/AuthContext'

const STATUS_COLORS = {
  'Pending':      'bg-yellow-50 text-yellow-600 border border-yellow-100',
  'Under Review': 'bg-blue-50 text-blue-600 border border-blue-100',
  'Interview':    'bg-purple-50 text-purple-600 border border-purple-100',
  'Accepted':     'bg-green-50 text-green-600 border border-green-100',
  'Rejected':     'bg-red-50 text-red-600 border border-red-100',
}

const CandidateDashboard = () => {
  const { user, logout } = useAuth()

  const [jobs, setJobs] = useState([])
  const [myApps, setMyApps] = useState([])
  const [activeTab, setActiveTab] = useState('explore')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchData = async () => {
    setIsLoading(true)
    setError('')
    try {
      // Both requests run in parallel — jobs list and this candidate's applications
      const [resJobs, resApps] = await Promise.all([
        axiosInstance.get('/api/dashboard/jobs/all'),
        axiosInstance.get(`/api/dashboard/applications/my/${user.id}`),
      ])
      setJobs(resJobs.data)
      setMyApps(resApps.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load dashboard data. Please refresh.')
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch data once when the component mounts.
  // user.id is stable for the lifetime of a session, so the empty dep array is correct.
  useEffect(() => {
    fetchData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleApply = async (jobId) => {
    try {
      // candidate_id is derived from the JWT on the backend — not sent from client
      // cv_file_id is omitted until the file upload feature is implemented
      await axiosInstance.post('/api/dashboard/applications/create', { job_id: jobId })
      alert('Application sent successfully!')
      fetchData()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to apply.')
    }
  }

  const handleCancelApplication = async (appId) => {
    if (!window.confirm('Are you sure you want to retract this application?')) return
    try {
      await axiosInstance.delete(`/api/dashboard/applications/cancel/${appId}`)
      alert('Application retracted.')
      fetchData()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to retract application.')
    }
  }

  return (
    <div className="flex min-h-screen bg-[#F0F7FF] font-sans text-slate-800">
      {/* Sidebar — desktop only */}
      <aside className="w-80 bg-white border-r border-blue-100 p-8 hidden lg:flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-10">
            <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold">JM</div>
            <h1 className="text-xl font-bold tracking-tight text-blue-900">JobMatch</h1>
          </div>
          <div className="bg-blue-50/50 p-4 rounded-3xl mb-8 border border-blue-50 flex items-center gap-3">
            <div className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold">B</div>
            <div>
              <h4 className="font-bold text-sm text-blue-950">Blend</h4>
              <p className="text-xs text-blue-400">AI Specialist Track</p>
            </div>
          </div>
          <nav className="space-y-2">
            <div
              onClick={() => setActiveTab('explore')}
              className={`flex items-center gap-3 p-3 rounded-2xl font-semibold cursor-pointer transition ${activeTab === 'explore' ? 'bg-blue-50 text-blue-700' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              <Compass size={18}/> Explore Jobs
            </div>
            <div
              onClick={() => setActiveTab('applications')}
              className={`flex items-center gap-3 p-3 rounded-2xl font-semibold cursor-pointer transition ${activeTab === 'applications' ? 'bg-blue-50 text-blue-700' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              <FileText size={18}/> My Applications ({myApps.length})
            </div>
          </nav>
        </div>
        <button
          onClick={logout}
          className="text-xs text-slate-400 hover:text-red-500 transition font-semibold text-left"
        >
          Sign out
        </button>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 min-w-0">
        {/* Top nav */}
        <nav className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-blue-50">
          <div className="px-4 sm:px-12 py-4 sm:py-6 flex justify-between items-center">
            <div className="text-sm font-bold text-blue-900">Student Space</div>
            <div className="flex items-center gap-3">
              <button
                onClick={logout}
                className="text-xs text-slate-400 hover:text-red-500 transition font-semibold lg:hidden"
              >
                Sign out
              </button>
              <div className="h-8 w-8 sm:h-10 sm:w-10 bg-white border border-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold shadow-sm text-sm">B</div>
            </div>
          </div>
          {/* Mobile tab bar — hidden on lg where the sidebar handles navigation */}
          <div className="lg:hidden flex border-t border-blue-50">
            <button
              onClick={() => setActiveTab('explore')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold transition border-b-2 ${activeTab === 'explore' ? 'border-blue-600 text-blue-700 bg-blue-50/50' : 'border-transparent text-slate-400'}`}
            >
              <Compass size={14}/> Explore Jobs
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold transition border-b-2 ${activeTab === 'applications' ? 'border-blue-600 text-blue-700 bg-blue-50/50' : 'border-transparent text-slate-400'}`}
            >
              <FileText size={14}/> My Apps ({myApps.length})
            </button>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-12">

          {/* Global loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-24">
              <div className="text-sm text-slate-400 animate-pulse">Loading...</div>
            </div>
          )}

          {/* Global error state */}
          {!isLoading && error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl px-6 py-4 mb-8">
              {error}
            </div>
          )}

          {/* EXPLORE TAB */}
          {!isLoading && !error && activeTab === 'explore' && (
            <>
              <header className="mb-6 sm:mb-12">
                <h1 className="text-3xl sm:text-5xl font-bold tracking-tighter text-blue-950 mb-3 italic">Next Step.</h1>
              </header>
              <div className="grid gap-4 sm:gap-6">
                {jobs.map(job => (
                  <div
                    key={job.id}
                    className="bg-white rounded-[28px] sm:rounded-[44px] p-5 sm:p-10 border border-blue-50 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden group hover:shadow-xl transition-all duration-300"
                  >
                    <div className="absolute top-0 right-4 sm:right-16 bg-blue-600 text-white px-3 sm:px-5 py-2 rounded-b-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                      <Zap size={12} fill="white"/> AI {job.match_score}% Match
                    </div>
                    <div className="space-y-3 pt-7 sm:pt-0 w-full md:w-auto">
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold text-blue-950 group-hover:text-blue-600 transition-colors">{job.title}</h3>
                        <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-2">{job.company_name}</p>
                        <div className="flex flex-wrap gap-2 sm:gap-3 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                          <span className="flex items-center gap-1"><MapPin size={12}/> {job.location}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="flex items-center gap-1"><Briefcase size={12}/> {job.job_type}</span>
                        </div>
                      </div>
                      <p className="text-slate-400 text-sm italic max-w-md line-clamp-2">{job.description}</p>
                    </div>
                    <button
                      onClick={() => handleApply(job.id)}
                      className="bg-blue-600 text-white px-8 sm:px-12 py-4 sm:py-5 rounded-full font-bold text-base sm:text-lg hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4 md:mt-0 w-full md:w-auto shrink-0"
                    >
                      Apply <Send size={16}/>
                    </button>
                  </div>
                ))}
                {jobs.length === 0 && (
                  <p className="text-sm text-slate-400 italic">No jobs available right now.</p>
                )}
              </div>
            </>
          )}

          {/* APPLICATIONS TAB */}
          {!isLoading && !error && activeTab === 'applications' && (
            <>
              <header className="mb-6 sm:mb-12">
                <h1 className="text-3xl sm:text-5xl font-bold tracking-tighter text-blue-950 mb-3 italic">Track Progress.</h1>
              </header>
              <div className="bg-white rounded-3xl sm:rounded-[40px] border border-blue-50 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-120">
                    <thead className="bg-blue-50/50 text-blue-900 text-xs font-black uppercase tracking-widest">
                      <tr>
                        <th className="p-3 sm:p-6">Position</th>
                        <th className="p-3 sm:p-6">Company</th>
                        <th className="p-3 sm:p-6">Status</th>
                        <th className="p-3 sm:p-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-50">
                      {myApps.map(app => (
                        <tr key={app.app_id} className="hover:bg-blue-50/20 transition">
                          <td className="p-3 sm:p-6 font-bold text-blue-950">{app.job_title}</td>
                          <td className="p-3 sm:p-6 text-slate-500 font-medium">{app.company_name}</td>
                          <td className="p-3 sm:p-6">
                            <span className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${STATUS_COLORS[app.status] || 'bg-gray-50 text-gray-600 border border-gray-100'}`}>
                              {app.status}
                            </span>
                          </td>
                          <td className="p-3 sm:p-6 text-right">
                            <button
                              onClick={() => handleCancelApplication(app.app_id)}
                              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={16}/>
                            </button>
                          </td>
                        </tr>
                      ))}
                      {myApps.length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-6 text-center text-sm text-slate-400 italic">
                            No applications yet. Explore jobs and apply!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  )
}

export default CandidateDashboard
