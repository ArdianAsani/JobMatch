/**
 * Company Dashboard.
 *
 * Sections:
 *   - Job listings CRUD (create, edit, delete)
 *   - Applicant review with status updates (Accepted / Rejected)
 *   - Approval gate: companies pending admin approval see a banner instead of the dashboard
 *
 * user.id (from AuthContext) replaces the previous jwtDecode(getToken()).sub pattern.
 * logout() comes from AuthContext so React state is cleared alongside localStorage.
 */

import { useState, useEffect } from 'react'
import { Plus, X, Globe, MapPin, Trash2, Edit3, Check, Ban, Clock } from 'lucide-react'
import axiosInstance from '../api/axiosInstance'
import { useAuth } from '../contexts/AuthContext'

const CompanyDashboard = () => {
  const { user, logout } = useAuth()

  const [listings, setListings] = useState([])
  const [applicants, setApplicants] = useState([])
  const [companyInfo, setCompanyInfo] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingJob, setEditingJob] = useState(null)
  const [selectedApp, setSelectedApp] = useState(null)
  const [jobForm, setJobForm] = useState({ title: '', description: '', location: 'Prishtina', job_type: 'Full-time' })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // null while loading, true/false once the API responds
  const isApproved = companyInfo?.is_approved ?? null

  const fetchData = async () => {
    setIsLoading(true)
    setError('')
    try {
      // Both requests run in parallel to reduce wait time
      const [res, resApp] = await Promise.all([
        axiosInstance.get(`/api/dashboard/company/${user.id}`),
        axiosInstance.get(`/api/dashboard/company/${user.id}/applicants`),
      ])
      setListings(res.data.my_listings)
      setCompanyInfo(res.data.company_info)
      setApplicants(resApp.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load dashboard data. Please refresh.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmitJob = async (e) => {
    e.preventDefault()
    try {
      if (editingJob) {
        await axiosInstance.put(`/api/dashboard/jobs/update/${editingJob.id}`, jobForm)
        alert('Opportunity updated!')
      } else {
        // company_id is derived from the JWT on the backend — not sent from client
        await axiosInstance.post('/api/dashboard/jobs/create', jobForm)
        alert('Opportunity published!')
      }
      setShowModal(false)
      setEditingJob(null)
      setJobForm({ title: '', description: '', location: 'Prishtina', job_type: 'Full-time' })
      fetchData()
    } catch (err) {
      alert(err.response?.data?.detail || 'Action failed.')
    }
  }

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this listing? All linked applications will be cleared.')) return
    try {
      await axiosInstance.delete(`/api/dashboard/jobs/delete/${jobId}`)
      fetchData()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete listing.')
    }
  }

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      await axiosInstance.put(`/api/dashboard/applications/status/${appId}`, { status: newStatus })
      setSelectedApp(null)
      fetchData()
      alert(`Application marked as ${newStatus}`)
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update status.')
    }
  }

  const openEditModal = (job) => {
    setEditingJob(job)
    setJobForm({ title: job.title, description: job.description, location: job.location, job_type: job.job_type })
    setShowModal(true)
  }

  return (
    <div className="flex min-h-screen bg-[#F0F7FF] font-sans text-slate-800">
      {/* Sidebar — desktop only */}
      <aside className="w-80 bg-white border-r border-blue-100 p-8 hidden lg:flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold">JM</div>
            <h1 className="text-xl font-bold tracking-tight text-blue-900">JobMatch</h1>
          </div>
          {companyInfo && (
            <div className="space-y-4">
              <p className="text-[10px] font-black text-blue-300 tracking-[0.2em] uppercase">Company Profile</p>
              <div className="bg-white p-5 rounded-3xl border border-blue-50 space-y-4 shadow-sm">
                <h4 className="font-bold text-lg text-blue-900">{companyInfo.name}</h4>
                <div className="space-y-2 text-sm text-slate-500">
                  <p className="flex items-center gap-2"><Globe size={14}/> {companyInfo.industry}</p>
                  <p className="flex items-center gap-2"><MapPin size={14}/> {companyInfo.location}</p>
                </div>
              </div>
            </div>
          )}
        </div>
        <button
          onClick={logout}
          className="text-xs text-slate-400 hover:text-red-500 transition font-semibold text-left"
        >
          Sign out
        </button>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-10 lg:p-12">
        {/* Mobile-only header strip */}
        <div className="lg:hidden flex items-center justify-between mb-4 pb-4 border-b border-blue-100">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xs">JM</div>
            <span className="font-bold text-blue-900 text-sm">{companyInfo?.name || 'Dashboard'}</span>
          </div>
          <button onClick={logout} className="text-xs text-slate-400 hover:text-red-500 font-semibold">Sign out</button>
        </div>

        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-6 sm:mb-12">
          <div>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tighter text-blue-950">Dashboard</h2>
            <p className="text-blue-400 mt-1 sm:mt-2 font-medium text-sm sm:text-base">Full Openings & Application Management Pool.</p>
          </div>
          {isApproved && (
            <button
              onClick={() => { setEditingJob(null); setShowModal(true) }}
              className="bg-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 w-full sm:w-auto shrink-0"
            >
              <Plus size={20}/> Post Opening
            </button>
          )}
        </div>

        {/* Global loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <div className="text-sm text-slate-400 animate-pulse">Loading...</div>
          </div>
        )}

        {/* Global error state */}
        {!isLoading && error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl px-6 py-4">
            {error}
          </div>
        )}

        {/* Pending approval banner — shown while is_approved is explicitly false */}
        {!isLoading && !error && isApproved === false && (
          <div className="flex flex-col items-center justify-center py-12 sm:py-24 text-center px-4">
            <div className="h-16 w-16 bg-amber-50 border border-amber-100 rounded-full flex items-center justify-center mb-6">
              <Clock size={28} className="text-amber-500" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-3">Account Pending Approval</h3>
            <p className="text-slate-500 max-w-md leading-relaxed text-sm sm:text-base">
              Your company account is pending admin approval. You will be able to post jobs and manage applications after approval.
            </p>
          </div>
        )}

        {/* Normal dashboard — only shown when approved */}
        {!isLoading && !error && isApproved && (
          <div className="grid grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
            {/* Job Listings */}
            <div className="col-span-12 lg:col-span-5 bg-white rounded-[40px] p-5 sm:p-8 shadow-sm border border-blue-50">
              <h3 className="text-lg font-bold mb-4 sm:mb-6 text-blue-900 italic">Current Openings</h3>
              <div className="space-y-3 sm:space-y-4">
                {listings.map(job => (
                  <div key={job.id} className={`p-4 sm:p-5 rounded-3xl flex justify-between items-start group border transition ${job.is_active ? 'bg-blue-50/30 border-transparent hover:border-blue-100' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-blue-900">{job.title}</h4>
                        {/* Badge shown when an admin has deactivated this listing */}
                        {!job.is_active && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200 text-slate-500">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-blue-400 mt-1">{job.location} • {job.job_type}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => openEditModal(job)} className="p-2 text-slate-400 hover:text-blue-600 transition"><Edit3 size={16}/></button>
                      <button onClick={() => handleDeleteJob(job.id)} className="p-2 text-slate-400 hover:text-red-500 transition"><Trash2 size={16}/></button>
                    </div>
                  </div>
                ))}
                {listings.length === 0 && (
                  <p className="text-sm text-slate-400 italic">No openings posted yet.</p>
                )}
              </div>
            </div>

            {/* Applicants */}
            <div className="col-span-12 lg:col-span-7 bg-white rounded-[40px] p-5 sm:p-8 shadow-sm border border-blue-50">
              <h3 className="text-lg font-bold mb-4 sm:mb-6 text-blue-900 italic">Recent Applications</h3>
              <div className="space-y-3 sm:space-y-4">
                {applicants.map(app => (
                  <div key={app.app_id} className="p-4 sm:p-6 bg-white rounded-3xl sm:rounded-4xl flex flex-col sm:flex-row justify-between sm:items-center gap-3 border border-blue-50 hover:shadow-md transition">
                    <div>
                      <h4 className="font-bold text-slate-800">{app.candidate_name}</h4>
                      <p className="text-xs text-blue-500 font-bold uppercase tracking-tight">{app.job_title}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-bold mt-1 inline-block">{app.app_status}</span>
                    </div>
                    <button onClick={() => setSelectedApp(app)} className="bg-blue-50 text-blue-600 px-6 py-2 rounded-full text-xs font-black hover:bg-blue-600 hover:text-white transition w-full sm:w-auto text-center shrink-0">REVIEW</button>
                  </div>
                ))}
                {applicants.length === 0 && (
                  <p className="text-sm text-slate-400 italic">No applications yet.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: CREATE / UPDATE JOB */}
      {showModal && (
        <div className="fixed inset-0 bg-blue-900/10 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-[28px] sm:rounded-[48px] p-6 sm:p-10 shadow-2xl relative border border-blue-50">
            <button onClick={() => setShowModal(false)} className="absolute right-6 sm:right-8 top-6 sm:top-8 text-blue-200 hover:text-blue-600"><X size={24}/></button>
            <h3 className="text-2xl sm:text-3xl font-bold text-blue-950 mb-5 sm:mb-8">{editingJob ? 'Edit Position' : 'New Position'}</h3>
            <form onSubmit={handleSubmitJob} className="space-y-4 sm:space-y-5">
              <input
                className="w-full p-4 sm:p-5 bg-blue-50/50 border-0 rounded-[20px] sm:rounded-3xl focus:ring-2 focus:ring-blue-600"
                placeholder="Job Title"
                value={jobForm.title}
                onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                required
              />
              <textarea
                className="w-full p-4 sm:p-5 bg-blue-50/50 border-0 rounded-[20px] sm:rounded-3xl focus:ring-2 focus:ring-blue-600"
                placeholder="Description"
                rows="4"
                value={jobForm.description}
                onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                required
              />
              <button type="submit" className="w-full py-4 sm:py-5 bg-blue-600 text-white rounded-3xl sm:rounded-[28px] font-bold shadow-xl">
                {editingJob ? 'Save Changes' : 'Publish Job'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REVIEW APPLICATION */}
      {selectedApp && (
        <div className="fixed inset-0 bg-blue-900/10 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-[28px] sm:rounded-[48px] p-6 sm:p-10 shadow-2xl relative border border-blue-50">
            <button onClick={() => setSelectedApp(null)} className="absolute right-6 sm:right-8 top-6 sm:top-8 text-blue-200 hover:text-blue-600"><X size={24}/></button>
            <h3 className="text-2xl sm:text-3xl font-bold text-blue-950 mb-2">{selectedApp.candidate_name}</h3>
            <p className="text-blue-600 font-bold mb-5 sm:mb-6 text-xs uppercase tracking-widest">Targeting: {selectedApp.job_title}</p>
            <div className="space-y-4 sm:space-y-6 text-sm">
              <div className="bg-blue-50/50 p-5 sm:p-6 rounded-[28px] sm:rounded-4xl text-blue-900 leading-relaxed italic">
                "{selectedApp.candidate_summary || 'No biography added.'}"
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
                <button onClick={() => handleUpdateStatus(selectedApp.app_id, 'Accepted')} className="flex-1 py-4 bg-green-500 text-white rounded-3xl font-bold flex items-center justify-center gap-2 shadow-lg"><Check size={16}/> Accept</button>
                <button onClick={() => handleUpdateStatus(selectedApp.app_id, 'Rejected')} className="flex-1 py-4 bg-red-500 text-white rounded-3xl font-bold flex items-center justify-center gap-2 shadow-lg"><Ban size={16}/> Reject</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CompanyDashboard
