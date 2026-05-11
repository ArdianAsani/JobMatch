import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Layout, Briefcase, Users, Plus, X, Globe, MapPin, MessageSquare, Send } from 'lucide-react';

const CompanyDashboard = () => {
  const [listings, setListings] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [newJob, setNewJob] = useState({ title: '', description: '', location: 'Prishtina', job_type: 'Full-time' });

  const companyUserId = 1;

  const fetchData = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/api/dashboard/company/${companyUserId}`);
      setListings(res.data.my_listings);
      setCompanyInfo(res.data.company_info);
      const resApp = await axios.get(`http://localhost:8000/api/dashboard/company/${companyUserId}/applicants`);
      setApplicants(resApp.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  const handlePostJob = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/dashboard/jobs/create', { ...newJob, company_id: 1 });
      setShowModal(false);
      setNewJob({ title: '', description: '', location: 'Prishtina', job_type: 'Full-time' });
      fetchData();
    } catch (err) { alert("Error posting job"); }
  };

  return (
    <div className="flex min-h-screen bg-[#F0F7FF] font-sans text-slate-800">
      {/* Sidebar - White & Blue */}
      <aside className="w-80 bg-white border-r border-blue-100 p-8 flex flex-col justify-between hidden lg:flex">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold italic">JM</div>
            <h1 className="text-xl font-bold tracking-tight text-blue-900">JobMatch</h1>
          </div>
          <nav className="space-y-6">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-blue-300 tracking-[0.2em] uppercase">Navigation</p>
              <div className="flex items-center gap-3 bg-blue-50 text-blue-700 p-3 rounded-2xl font-semibold cursor-pointer">
                <Layout size={18}/> Overview
              </div>
            </div>
            {companyInfo && (
              <div className="pt-8 space-y-4">
                <p className="text-[10px] font-black text-blue-300 tracking-[0.2em] uppercase">Profile</p>
                <div className="bg-white p-5 rounded-[24px] border border-blue-50 space-y-4 shadow-sm">
                  <h4 className="font-bold text-lg text-blue-900">{companyInfo.name}</h4>
                  <div className="space-y-2 text-sm text-slate-500">
                    <p className="flex items-center gap-2"><Globe size={14}/> {companyInfo.industry}</p>
                    <p className="flex items-center gap-2"><MapPin size={14}/> {companyInfo.location}</p>
                  </div>
                </div>
              </div>
            )}
          </nav>
        </div>
        <div className="bg-blue-600 text-white p-6 rounded-[28px] shadow-lg shadow-blue-200">
          <button className="w-full py-2 bg-white/20 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-white/30 transition">
            <MessageSquare size={14}/> Team Messenger
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-12 max-w-7xl">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-bold tracking-tighter text-blue-950">Dashboard</h2>
            <p className="text-blue-400 mt-2 font-medium">Oceanic Japandi Style • 2026 Edition</p>
          </div>
          <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2 active:scale-95">
            <Plus size={20}/> Post Opening
          </button>
        </div>

        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-5 bg-white rounded-[40px] p-8 shadow-sm border border-blue-50">
            <h3 className="text-lg font-bold mb-6 text-blue-900">Current Openings</h3>
            <div className="space-y-4">
              {listings.map(job => (
                <div key={job.id} className="p-5 bg-blue-50/30 rounded-[24px] border border-transparent hover:border-blue-100 transition group">
                   <h4 className="font-bold text-blue-900">{job.title}</h4>
                   <p className="text-xs text-blue-400 mt-1">{job.location} • {job.job_type}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-12 lg:col-span-7 bg-white rounded-[40px] p-8 shadow-sm border border-blue-50">
            <h3 className="text-lg font-bold mb-6 text-blue-900">Recent Applicants</h3>
            <div className="space-y-4">
              {applicants.map(app => (
                <div key={app.app_id} className="p-6 bg-white rounded-[32px] flex justify-between items-center border border-blue-50 hover:shadow-md transition">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center font-bold text-lg text-white">{app.candidate_name[0]}</div>
                    <div>
                      <h4 className="font-bold text-slate-800">{app.candidate_name}</h4>
                      <p className="text-xs text-blue-500 font-bold uppercase tracking-tight">{app.job_title}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedApp(app)} className="bg-blue-50 text-blue-600 px-6 py-2 rounded-full text-xs font-black hover:bg-blue-600 hover:text-white transition">REVIEW</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* --- MODAL POST (White/Blue) --- */}
      {showModal && (
        <div className="fixed inset-0 bg-blue-900/10 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-[48px] p-10 shadow-2xl relative border border-blue-50">
            <button onClick={() => setShowModal(false)} className="absolute right-8 top-8 text-blue-200 hover:text-blue-600 transition"><X size={24}/></button>
            <h3 className="text-3xl font-bold tracking-tight text-blue-950 mb-8">New Opportunity</h3>
            <form onSubmit={handlePostJob} className="space-y-5">
              <input className="w-full p-5 bg-blue-50/50 border-0 rounded-[24px] focus:ring-2 focus:ring-blue-600" placeholder="Job Title" value={newJob.title} onChange={(e) => setNewJob({...newJob, title: e.target.value})} required />
              <textarea className="w-full p-5 bg-blue-50/50 border-0 rounded-[24px] focus:ring-2 focus:ring-blue-600" placeholder="Description" rows="4" value={newJob.description} onChange={(e) => setNewJob({...newJob, description: e.target.value})} required />
              <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-[28px] font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all">Publish Job</button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL REVIEW (White/Blue) --- */}
      {selectedApp && (
        <div className="fixed inset-0 bg-blue-900/10 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-[48px] p-10 shadow-2xl relative border border-blue-50">
            <button onClick={() => setSelectedApp(null)} className="absolute right-8 top-8 text-blue-200 hover:text-blue-600"><X size={24}/></button>
            <h3 className="text-3xl font-bold text-blue-950 mb-2">{selectedApp.candidate_name}</h3>
            <p className="text-blue-600 font-bold mb-8 uppercase tracking-widest text-xs">Targeting: {selectedApp.job_title}</p>
            <div className="space-y-6 text-sm">
              <div className="bg-blue-50/50 p-6 rounded-[32px] text-blue-900 leading-relaxed italic">
                "{selectedApp.candidate_summary || "No description provided."}"
              </div>
              <div className="flex gap-4 pt-4">
                 <button className="flex-1 py-4 bg-blue-600 text-white rounded-[24px] font-bold shadow-lg">Accept Candidate</button>
                 <button onClick={() => setSelectedApp(null)} className="flex-1 py-4 bg-white border border-blue-100 text-blue-600 rounded-[24px] font-bold">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDashboard;