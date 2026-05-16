import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Compass, FileText, MapPin, Briefcase, Zap, Send, Trash2, Bell } from 'lucide-react';

const CandidateDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [myApps, setMyApps] = useState([]);
  const [activeTab, setActiveTab] = useState('explore'); 

  const candidateId = 1; 
  const cvFileId = 1; 

  const fetchData = async () => {
    try {
      const resJobs = await axios.get('http://localhost:8000/api/dashboard/jobs/all');
      setJobs(resJobs.data);
      const resApps = await axios.get(`http://localhost:8000/api/dashboard/applications/my/${candidateId}`);
      setMyApps(resApps.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  // CREATE Application
  const handleApply = async (jobId) => {
    try {
      await axios.post('http://localhost:8000/api/dashboard/applications/create', {
        candidate_id: candidateId, job_id: jobId, cv_file_id: cvFileId
      });
      alert("Application sent successfully! 🌊");
      fetchData();
    } catch (err) { 
      alert(err.response?.data?.detail || "Failed to apply."); 
    }
  };

  // DELETE Application (Cancel)
  const handleCancelApplication = async (appId) => {
    if (!window.confirm("Are you sure you want to retract this application?")) return;
    try {
      await axios.delete(`http://localhost:8000/api/dashboard/applications/cancel/${appId}`);
      alert("Application retracted.");
      fetchData();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="flex min-h-screen bg-[#F0F7FF] font-sans text-slate-800">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-blue-100 p-8 flex flex-col justify-between hidden lg:flex">
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
            <div onClick={() => setActiveTab('explore')} className={`flex items-center gap-3 p-3 rounded-2xl font-semibold cursor-pointer transition ${activeTab === 'explore' ? 'bg-blue-50 text-blue-700' : 'text-slate-400 hover:bg-slate-50'}`}><Compass size={18}/> Explore Jobs</div>
            <div onClick={() => setActiveTab('applications')} className={`flex items-center gap-3 p-3 rounded-2xl font-semibold cursor-pointer transition ${activeTab === 'applications' ? 'bg-blue-50 text-blue-700' : 'text-slate-400 hover:bg-slate-50'}`}><FileText size={18}/> My Applications ({myApps.length})</div>
          </nav>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="flex-1">
        <nav className="px-12 py-6 flex justify-between items-center bg-white/40 backdrop-blur-md border-b border-blue-50">
          <div className="text-sm font-bold text-blue-900">Student Space</div>
          <div className="h-10 w-10 bg-white border border-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold shadow-sm">B</div>
        </nav>

        <div className="max-w-4xl mx-auto px-6 py-12">
          {activeTab === 'explore' ? (
            <>
              <header className="mb-12"><h1 className="text-5xl font-bold tracking-tighter text-blue-950 mb-3 italic">Next Step.</h1></header>
              <div className="grid gap-6">
                {jobs.map(job => (
                  <div key={job.id} className="bg-white rounded-[44px] p-10 border border-blue-50 shadow-sm flex flex-col md:flex-row justify-between items-center relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                    <div className="absolute top-0 right-16 bg-blue-600 text-white px-5 py-2 rounded-b-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"><Zap size={12} fill="white"/> AI {job.match_score}% Match</div>
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-2xl font-bold text-blue-950 group-hover:text-blue-600 transition-colors">{job.title}</h3>
                        <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-2">{job.company_name}</p>
                        <div className="flex gap-3 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                          <span className="flex items-center gap-1"><MapPin size={12}/> {job.location}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Briefcase size={12}/> {job.job_type}</span>
                        </div>
                      </div>
                      <p className="text-slate-400 text-sm italic max-w-md line-clamp-2">{job.description}</p>
                    </div>
                    <button onClick={() => handleApply(job.id)} className="bg-blue-600 text-white px-12 py-5 rounded-full font-bold text-lg hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2 mt-6 md:mt-0">Apply <Send size={16}/></button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <header className="mb-12"><h1 className="text-5xl font-bold tracking-tighter text-blue-950 mb-3 italic">Track Progress.</h1></header>
              <div className="bg-white rounded-[40px] border border-blue-50 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-blue-50/50 text-blue-900 text-xs font-black uppercase tracking-widest">
                    <tr>
                      <th className="p-6">Position</th>
                      <th className="p-6">Company</th>
                      <th className="p-6">Status</th>
                      <th className="p-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-50">
                    {myApps.map(app => (
                      <tr key={app.app_id} className="hover:bg-blue-50/20 transition">
                        <td className="p-6 font-bold text-blue-950">{app.job_title}</td>
                        <td className="p-6 text-slate-500 font-medium">{app.company_name}</td>
                        <td className="p-6">
                          <span className="px-4 py-1.5 bg-yellow-50 text-yellow-600 border border-yellow-100 rounded-full text-xs font-black uppercase tracking-wider">{app.status}</span>
                        </td>
                        <td className="p-6 text-right">
                          <button onClick={() => handleCancelApplication(app.app_id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default CandidateDashboard;