import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Briefcase, Users, Plus, X, MapPin, Globe, Building2, Award } from 'lucide-react';

const CompanyDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [listings, setListings] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);

  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    location: 'Prishtina',
    job_type: 'Full-time'
  });

  const companyUserId = 1; // TODO: Do ta marrim nga Auth Context më vonë

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Company Listings + Info
      const companyRes = await axiosInstance.get(`/api/dashboard/company/${companyUserId}`);
      setListings(companyRes.data.my_listings || []);
      setCompanyInfo(companyRes.data.company_info);

      // Applicants
      const applicantsRes = await axiosInstance.get(`/api/dashboard/company/${companyUserId}/applicants`);
      setApplicants(applicantsRes.data || []);
    } catch (err) {
      console.error("Error fetching company data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePostJob = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/api/dashboard/jobs/create', {
        ...newJob,
        company_id: 1 // TODO: Nga Auth
      });
      
      alert("✅ Job posted successfully!");
      setShowPostModal(false);
      setNewJob({ title: '', description: '', location: 'Prishtina', job_type: 'Full-time' });
      fetchData();
    } catch (err) {
      alert("❌ Failed to post job");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Sidebar */}
      <div className="w-72 bg-white border-r border-blue-100 flex flex-col fixed h-screen">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-12">
            <div className="h-10 w-10 bg-indigo-600 rounded-2xl flex items-center justify-center">
              <Building2 size={24} className="text-white" />
            </div>
            <span className="font-bold text-2xl tracking-tighter">JobMatch</span>
          </div>

          {/* Company Profile */}
          {companyInfo && (
            <div className="mb-10">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-3xl flex items-center justify-center text-white text-4xl font-bold">
                  {companyInfo.name?.[0] || 'C'}
                </div>
                <div>
                  <h3 className="font-bold text-xl text-slate-900">{companyInfo.name}</h3>
                  <p className="text-slate-500 text-sm">{companyInfo.industry}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="space-y-2">
            {[
              { id: 'overview', label: 'Overview', icon: Briefcase },
              { id: 'applicants', label: 'All Applicants', icon: Users },
              { id: 'analytics', label: 'Analytics', icon: Award },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-left transition-all ${
                  activeTab === item.id 
                    ? 'bg-indigo-50 text-indigo-700 font-medium' 
                    : 'hover:bg-slate-50 text-slate-600'
                }`}
              >
                <item.icon size={22} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Post Job Button */}
        <div className="mt-auto mx-6 mb-8">
          <button
            onClick={() => setShowPostModal(true)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-3xl font-semibold flex items-center justify-center gap-3 transition shadow-lg shadow-indigo-100"
          >
            <Plus size={24} />
            Post New Job
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-72 p-10">
        <div className="max-w-6xl mx-auto">
          <header className="mb-12">
            <h1 className="text-5xl font-bold tracking-tighter text-slate-900">Hiring Dashboard</h1>
            <p className="text-slate-500 text-lg mt-2">Manage your talent pipeline with confidence</p>
          </header>

          {activeTab === 'overview' && (
            <div className="grid grid-cols-12 gap-8">
              {/* Current Openings */}
              <div className="col-span-12 lg:col-span-5 bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
                  <Briefcase size={24} className="text-indigo-600" />
                  Current Openings
                </h3>
                <div className="space-y-4">
                  {listings.length === 0 ? (
                    <p className="text-slate-500 py-8 text-center">No active job listings yet.</p>
                  ) : (
                    listings.map(job => (
                      <div key={job.id} className="p-6 bg-slate-50 rounded-2xl hover:bg-white hover:shadow transition">
                        <h4 className="font-semibold text-lg text-slate-900">{job.title}</h4>
                        <div className="flex gap-4 text-sm text-slate-500 mt-2">
                          <span className="flex items-center gap-1"><MapPin size={16} />{job.location}</span>
                          <span>{job.job_type}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Applicants */}
              <div className="col-span-12 lg:col-span-7 bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
                  <Users size={24} className="text-indigo-600" />
                  Recent Applicants
                </h3>
                <div className="space-y-4">
                  {applicants.length === 0 ? (
                    <p className="text-slate-500 py-12 text-center">No applications received yet.</p>
                  ) : (
                    applicants.map(app => (
                      <div key={app.app_id} className="flex items-center justify-between p-6 bg-white border border-slate-100 rounded-2xl hover:border-indigo-200 transition group">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                            {app.candidate_name?.[0] || 'U'}
                          </div>
                          <div>
                            <h4 className="font-semibold">{app.candidate_name}</h4>
                            <p className="text-sm text-slate-500">{app.job_title}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="bg-indigo-50 text-indigo-600 px-6 py-2.5 rounded-2xl text-sm font-semibold hover:bg-indigo-600 hover:text-white transition"
                        >
                          Review
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'applicants' && (
            <div>
              <h2 className="text-3xl font-semibold mb-8">All Applicants</h2>
              <p className="text-slate-500">Full applicants management coming soon...</p>
            </div>
          )}
        </div>
      </div>

      {/* Post Job Modal */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-[40px] p-10 shadow-2xl">
            <button onClick={() => setShowPostModal(false)} className="float-right text-slate-400 hover:text-slate-600">
              <X size={28} />
            </button>
            <h3 className="text-3xl font-bold text-slate-900 mb-8">Post New Opening</h3>
            
            <form onSubmit={handlePostJob} className="space-y-6">
              <input
                type="text"
                placeholder="Job Title"
                className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-100 focus:border-indigo-300 outline-none"
                value={newJob.title}
                onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                required
              />
              <textarea
                placeholder="Job Description"
                rows={5}
                className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-100 focus:border-indigo-300 outline-none resize-y"
                value={newJob.description}
                onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Location"
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-100 focus:border-indigo-300 outline-none"
                  value={newJob.location}
                  onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                />
                <select
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-100 focus:border-indigo-300 outline-none"
                  value={newJob.job_type}
                  onChange={(e) => setNewJob({ ...newJob, job_type: e.target.value })}
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-semibold text-lg hover:bg-indigo-700 transition"
              >
                Publish Job Opening
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Applicant Review Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-[40px] p-10 shadow-2xl">
            <button onClick={() => setSelectedApp(null)} className="float-right text-slate-400 hover:text-slate-600">
              <X size={28} />
            </button>
            <h3 className="text-3xl font-bold text-slate-900 mb-1">{selectedApp.candidate_name}</h3>
            <p className="text-indigo-600 font-medium">Applied for: {selectedApp.job_title}</p>

            <div className="my-8 bg-slate-50 p-6 rounded-3xl italic text-slate-600">
              "{selectedApp.candidate_summary || "No additional information provided."}"
            </div>

            <div className="flex gap-4">
              <button className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-semibold">Accept Candidate</button>
              <button onClick={() => setSelectedApp(null)} className="flex-1 py-4 border border-slate-300 rounded-2xl font-semibold">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDashboard;