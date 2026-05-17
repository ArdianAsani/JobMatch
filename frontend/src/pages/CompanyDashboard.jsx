import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { Plus, X, Globe, MapPin, Trash2, Edit3, Check, Ban, Clock } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import { getToken, logout } from '../utils/auth';

const CompanyDashboard = () => {
  const [listings, setListings] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [jobForm, setJobForm] = useState({ title: '', description: '', location: 'Prishtina', job_type: 'Full-time' });

  // Decode the logged-in user's ID from the JWT — never hardcoded
  const userId = jwtDecode(getToken()).sub;

  // Derived from server response — null while loading, true/false once fetched
  const isApproved = companyInfo?.is_approved ?? null;

  const fetchData = async () => {
    try {
      const res = await axiosInstance.get(`/api/dashboard/company/${userId}`);
      setListings(res.data.my_listings);
      setCompanyInfo(res.data.company_info);

      const resApp = await axiosInstance.get(`/api/dashboard/company/${userId}/applicants`);
      setApplicants(resApp.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmitJob = async (e) => {
    e.preventDefault();
    try {
      if (editingJob) {
        await axiosInstance.put(`/api/dashboard/jobs/update/${editingJob.id}`, jobForm);
        alert('Opportunity updated!');
      } else {
        // company_id is no longer sent — backend derives it from the JWT
        await axiosInstance.post('/api/dashboard/jobs/create', jobForm);
        alert('Opportunity published!');
      }
      setShowModal(false);
      setEditingJob(null);
      setJobForm({ title: '', description: '', location: 'Prishtina', job_type: 'Full-time' });
      fetchData();
    } catch (err) {
      alert('Action failed.');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this listing? All linked applications will be cleared.')) return;
    try {
      await axiosInstance.delete(`/api/dashboard/jobs/delete/${jobId}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      await axiosInstance.put(`/api/dashboard/applications/status/${appId}`, { status: newStatus });
      setSelectedApp(null);
      fetchData();
      alert(`Application marked as ${newStatus}`);
    } catch (err) {
      console.error(err);
    }
  };

  const openEditModal = (job) => {
    setEditingJob(job);
    setJobForm({ title: job.title, description: job.description, location: job.location, job_type: job.job_type });
    setShowModal(true);
  };

  return (
    <div className="flex min-h-screen bg-[#F0F7FF] font-sans text-slate-800">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-blue-100 p-8 hidden lg:flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold">JM</div>
            <h1 className="text-xl font-bold tracking-tight text-blue-900">JobMatch</h1>
          </div>
          {companyInfo && (
            <div className="space-y-4">
              <p className="text-[10px] font-black text-blue-300 tracking-[0.2em] uppercase">Company Profile</p>
              <div className="bg-white p-5 rounded-[24px] border border-blue-50 space-y-4 shadow-sm">
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
      <main className="flex-1 p-6 md:p-12 max-w-7xl">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-bold tracking-tighter text-blue-950">Dashboard</h2>
            <p className="text-blue-400 mt-2 font-medium">Full Openings & Application Management Pool.</p>
          </div>
          {isApproved && (
            <button onClick={() => { setEditingJob(null); setShowModal(true); }} className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2">
              <Plus size={20}/> Post Opening
            </button>
          )}
        </div>

        {/* Pending approval banner */}
        {isApproved === false && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-16 w-16 bg-amber-50 border border-amber-100 rounded-full flex items-center justify-center mb-6">
              <Clock size={28} className="text-amber-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">Account Pending Approval</h3>
            <p className="text-slate-500 max-w-md leading-relaxed">
              Your company account is pending admin approval. You will be able to post jobs and manage applications after approval.
            </p>
          </div>
        )}

        {/* Normal dashboard — only shown when approved */}
        {isApproved && (
          <div className="grid grid-cols-12 gap-8">
            {/* Job Listings */}
            <div className="col-span-12 lg:col-span-5 bg-white rounded-[40px] p-8 shadow-sm border border-blue-50">
              <h3 className="text-lg font-bold mb-6 text-blue-900 italic">Current Openings</h3>
              <div className="space-y-4">
                {listings.map(job => (
                  <div key={job.id} className="p-5 bg-blue-50/30 rounded-[24px] flex justify-between items-start group border border-transparent hover:border-blue-100 transition">
                    <div>
                      <h4 className="font-bold text-blue-900">{job.title}</h4>
                      <p className="text-xs text-blue-400 mt-1">{job.location} • {job.job_type}</p>
                    </div>
                    <div className="flex gap-2">
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
            <div className="col-span-12 lg:col-span-7 bg-white rounded-[40px] p-8 shadow-sm border border-blue-50">
              <h3 className="text-lg font-bold mb-6 text-blue-900 italic">Recent Applications</h3>
              <div className="space-y-4">
                {applicants.map(app => (
                  <div key={app.app_id} className="p-6 bg-white rounded-[32px] flex justify-between items-center border border-blue-50 hover:shadow-md transition">
                    <div>
                      <h4 className="font-bold text-slate-800">{app.candidate_name}</h4>
                      <p className="text-xs text-blue-500 font-bold uppercase tracking-tight">{app.job_title}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-bold mt-1 inline-block">{app.app_status}</span>
                    </div>
                    <button onClick={() => setSelectedApp(app)} className="bg-blue-50 text-blue-600 px-6 py-2 rounded-full text-xs font-black hover:bg-blue-600 hover:text-white transition">REVIEW</button>
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
          <div className="bg-white w-full max-w-lg rounded-[48px] p-10 shadow-2xl relative border border-blue-50">
            <button onClick={() => setShowModal(false)} className="absolute right-8 top-8 text-blue-200 hover:text-blue-600"><X size={24}/></button>
            <h3 className="text-3xl font-bold text-blue-950 mb-8">{editingJob ? 'Edit Position' : 'New Position'}</h3>
            <form onSubmit={handleSubmitJob} className="space-y-5">
              <input
                className="w-full p-5 bg-blue-50/50 border-0 rounded-[24px] focus:ring-2 focus:ring-blue-600"
                placeholder="Job Title"
                value={jobForm.title}
                onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                required
              />
              <textarea
                className="w-full p-5 bg-blue-50/50 border-0 rounded-[24px] focus:ring-2 focus:ring-blue-600"
                placeholder="Description"
                rows="4"
                value={jobForm.description}
                onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                required
              />
              <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-[28px] font-bold shadow-xl">
                {editingJob ? 'Save Changes' : 'Publish Job'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REVIEW APPLICATION */}
      {selectedApp && (
        <div className="fixed inset-0 bg-blue-900/10 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-[48px] p-10 shadow-2xl relative border border-blue-50">
            <button onClick={() => setSelectedApp(null)} className="absolute right-8 top-8 text-blue-200 hover:text-blue-600"><X size={24}/></button>
            <h3 className="text-3xl font-bold text-blue-950 mb-2">{selectedApp.candidate_name}</h3>
            <p className="text-blue-600 font-bold mb-6 text-xs uppercase tracking-widest">Targeting: {selectedApp.job_title}</p>
            <div className="space-y-6 text-sm">
              <div className="bg-blue-50/50 p-6 rounded-[32px] text-blue-900 leading-relaxed italic">
                "{selectedApp.candidate_summary || 'No biography added.'}"
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={() => handleUpdateStatus(selectedApp.app_id, 'Accepted')} className="flex-1 py-4 bg-green-500 text-white rounded-[24px] font-bold flex items-center justify-center gap-2 shadow-lg"><Check size={16}/> Accept</button>
                <button onClick={() => handleUpdateStatus(selectedApp.app_id, 'Rejected')} className="flex-1 py-4 bg-red-500 text-white rounded-[24px] font-bold flex items-center justify-center gap-2 shadow-lg"><Ban size={16}/> Reject</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDashboard;
