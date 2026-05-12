import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Briefcase, MapPin, Zap, Search, Bookmark, X, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';   // do ta krijojmë së shpejti

const CandidateDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('explore');
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterType, setFilterType] = useState('');

  const [selectedJob, setSelectedJob] = useState(null);
  const [applyingId, setApplyingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const candidateId = user?.id || 1; // do të vijë nga Auth

  // Fetch Jobs
  const fetchJobs = async () => {
    try {
      const res = await axiosInstance.get('/api/dashboard/jobs/all');
      setJobs(res.data);
      setFilteredJobs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch My Applications
  const fetchApplications = async () => {
    try {
      const res = await axiosInstance.get(`/api/dashboard/applications/my/${candidateId}`);
      setApplications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchApplications();
    setLoading(false);
  }, []);

  // Search & Filter Logic
  useEffect(() => {
    let result = [...jobs];

    if (searchTerm) {
      result = result.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterLocation) {
      result = result.filter(job => job.location === filterLocation);
    }

    if (filterType) {
      result = result.filter(job => job.job_type === filterType);
    }

    setFilteredJobs(result);
  }, [searchTerm, filterLocation, filterType, jobs]);

  const handleApply = async (jobId) => {
    setApplyingId(jobId);
    try {
      await axiosInstance.post('/api/dashboard/applications/create', {
        candidate_id: candidateId,
        job_id: jobId,
        cv_file_id: 1
      });
      alert("✅ Aplikimi u dërgua me sukses!");
      fetchApplications();
    } catch (err) {
      alert(err.response?.data?.detail || "Dështoi aplikimi.");
    } finally {
      setApplyingId(null);
    }
  };

  const toggleSaveJob = (jobId) => {
    if (savedJobs.includes(jobId)) {
      setSavedJobs(savedJobs.filter(id => id !== jobId));
    } else {
      setSavedJobs([...savedJobs, jobId]);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Sidebar */}
      <div className="w-72 bg-white border-r border-blue-100 flex flex-col fixed h-screen">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-12">
            <div className="h-10 w-10 bg-blue-600 rounded-2xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">J</span>
            </div>
            <span className="font-bold text-2xl tracking-tighter">JobMatch</span>
          </div>

          {/* Mini Profile */}
          <div className="flex gap-4 mb-10">
            <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl">
              {user?.first_name?.[0] || 'B'}
            </div>
            <div>
              <h3 className="font-semibold">{user?.first_name} {user?.last_name}</h3>
              <p className="text-sm text-slate-500">Candidate</p>
            </div>
          </div>

          <nav className="space-y-2">
            {[
              { id: 'explore', label: 'Explore Jobs', icon: Briefcase },
              { id: 'applications', label: 'My Applications', icon: Bookmark },
              { id: 'saved', label: 'Saved Jobs', icon: Heart },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-left transition-all ${
                  activeTab === item.id ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-slate-50 text-slate-600'
                }`}
              >
                <item.icon size={22} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-72 p-10">
        <div className="max-w-5xl mx-auto">
          <header className="mb-10">
            <h1 className="text-5xl font-bold tracking-tighter">Find your path.</h1>
            <p className="text-slate-500 text-lg">Discover the right opportunity for you</p>
          </header>

          {activeTab === 'explore' && (
            <>
              {/* Search & Filters */}
              <div className="flex flex-wrap gap-4 mb-10">
                <div className="relative flex-1 min-w-[300px]">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search jobs or companies..."
                    className="w-full pl-14 pr-6 py-4 bg-white rounded-3xl border border-slate-200 focus:border-blue-300 outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <select
                  className="bg-white px-6 py-4 rounded-3xl border border-slate-200 focus:border-blue-300"
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                >
                  <option value="">All Locations</option>
                  <option value="Prishtina">Prishtina</option>
                  <option value="Remote">Remote</option>
                </select>

                <select
                  className="bg-white px-6 py-4 rounded-3xl border border-slate-200 focus:border-blue-300"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              {/* Jobs List */}
              <div className="space-y-8">
                {filteredJobs.map(job => (
                  <div key={job.id} className="bg-white rounded-3xl p-9 border border-slate-100 hover:border-blue-200 transition-all group">
                    <div className="flex justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <span className="px-5 py-2 bg-blue-100 text-blue-700 text-sm font-bold rounded-full">
                            {job.company_name}
                          </span>
                          <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                            <Zap size={20} fill="currentColor" /> {job.match_score}% Match
                          </div>
                        </div>

                        <h3 className="text-2xl font-semibold text-slate-900 mb-3 cursor-pointer hover:text-blue-600 transition" 
                            onClick={() => setSelectedJob(job)}>
                          {job.title}
                        </h3>

                        <div className="flex gap-6 text-slate-500">
                          <span className="flex items-center gap-2"><MapPin size={18}/>{job.location}</span>
                          <span>{job.job_type}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        <button
                          onClick={() => toggleSaveJob(job.id)}
                          className={`p-3 rounded-2xl transition ${savedJobs.includes(job.id) ? 'text-red-500' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                          <Heart size={24} fill={savedJobs.includes(job.id) ? "currentColor" : "none"} />
                        </button>
                        <button
                          onClick={() => handleApply(job.id)}
                          disabled={applyingId === job.id}
                          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-10 py-4 rounded-2xl font-semibold transition"
                        >
                          {applyingId === job.id ? "Applying..." : "Apply Now"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'applications' && (
            <div>
              <h2 className="text-3xl font-semibold mb-8">My Applications</h2>
              {/* Applications list - do ta plotësojmë më vonë nëse dëshiron */}
            </div>
          )}

          {activeTab === 'saved' && (
            <div>
              <h2 className="text-3xl font-semibold mb-8">Saved Jobs</h2>
              {/* Saved jobs list */}
            </div>
          )}
        </div>
      </div>

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-10 max-h-[90vh] overflow-auto">
            <button onClick={() => setSelectedJob(null)} className="float-right">
              <X size={28} />
            </button>

            <h2 className="text-3xl font-bold mb-2">{selectedJob.title}</h2>
            <p className="text-blue-600 font-medium">{selectedJob.company_name}</p>

            <div className="my-8 flex gap-6 text-sm">
              <div><strong>Location:</strong> {selectedJob.location}</div>
              <div><strong>Type:</strong> {selectedJob.job_type}</div>
              <div className="text-emerald-600 font-bold">{selectedJob.match_score}% AI Match</div>
            </div>

            <div className="prose text-slate-600 leading-relaxed">
              {selectedJob.description}
            </div>

            <div className="mt-10 flex gap-4">
              <button
                onClick={() => handleApply(selectedJob.id)}
                className="flex-1 bg-blue-600 text-white py-5 rounded-2xl font-semibold text-lg"
              >
                Apply Now
              </button>
              <button
                onClick={() => setSelectedJob(null)}
                className="flex-1 border border-slate-300 py-5 rounded-2xl font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateDashboard;