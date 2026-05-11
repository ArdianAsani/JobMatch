import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Briefcase, MapPin, Zap, Search, Bell, User, Send } from 'lucide-react';

const CandidateDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const candidateId = 1; 
  const cvFileId = 1; 

  const fetchJobs = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/dashboard/jobs/all');
      setJobs(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleApply = async (jobId) => {
    try {
      await axios.post('http://localhost:8000/api/dashboard/applications/create', { candidate_id: candidateId, job_id: jobId, cv_file_id: cvFileId });
      alert("Application sent successfully! 🌊");
    } catch (err) { alert("Failed to apply."); }
  };

  return (
    <div className="min-h-screen bg-[#F0F7FF] font-sans text-slate-800">
      {/* Blue Nav */}
      <nav className="px-12 py-6 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-blue-50 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-blue-600 rounded-lg"></div>
          <span className="font-bold text-xl tracking-tighter text-blue-950">JobMatch</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300"/>
            <input className="bg-blue-50/50 border-0 rounded-full py-2 pl-10 pr-4 text-sm w-64 focus:ring-2 focus:ring-blue-600 transition" placeholder="Search opportunities..."/>
          </div>
          <Bell size={20} className="text-blue-400 cursor-pointer hover:text-blue-600 transition"/>
          <div className="h-10 w-10 bg-white border border-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold shadow-sm">B</div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <header className="mb-16">
          <h1 className="text-6xl font-bold tracking-tighter text-blue-950 mb-4 italic">Next Step.</h1>
          <p className="text-blue-400 text-xl font-medium max-w-lg">Discover curated roles in a clean, focused environment.</p>
        </header>

        <div className="grid gap-6">
          {jobs.map(job => (
            <div key={job.id} className="bg-white rounded-[44px] p-10 border border-blue-50 shadow-sm hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 group flex flex-col md:flex-row justify-between items-center relative overflow-hidden">
              
              <div className="absolute top-0 right-16 bg-blue-600 text-white px-5 py-2 rounded-b-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-lg">
                 <Zap size={12} fill="white" className="text-blue-200"/> AI 94% Match
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-3xl font-bold tracking-tight mb-2 text-blue-950 group-hover:text-blue-600 transition-colors">{job.title}</h3>
                  <div className="flex flex-wrap gap-4 text-blue-300 text-xs font-black uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><MapPin size={14}/> {job.location}</span>
                    <span className="flex items-center gap-1.5"><Briefcase size={14}/> {job.job_type}</span>
                  </div>
                </div>
                <p className="text-slate-400 text-sm italic max-w-md line-clamp-2">{job.description}</p>
              </div>
              
              <button 
                onClick={() => handleApply(job.id)}
                className="bg-blue-600 text-white px-12 py-5 rounded-full font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95 flex items-center gap-2"
              >
                Apply <Send size={18}/>
              </button>
            </div>
          ))}
        </div>

        {/* Future Card */}
        <div className="mt-20 p-12 bg-white rounded-[56px] border border-blue-50 shadow-inner flex justify-between items-center">
          <div>
            <h4 className="text-2xl font-bold text-blue-950 mb-2">Elevate your application</h4>
            <p className="text-blue-300 italic font-medium">Use AI to refine your profile for better matching.</p>
          </div>
          <button className="bg-blue-50 text-blue-600 px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm">
            Optimize Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;