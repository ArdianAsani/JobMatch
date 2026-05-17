import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminTopbar from '../components/admin/AdminTopbar';
import DashboardOverview from '../components/admin/DashboardOverview';
import PendingApprovals from '../components/admin/PendingApprovals';
import ManageUsers from '../components/admin/ManageUsers';
import JobListings from '../components/admin/JobListings';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [error, setError] = useState('');

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [pendingCompanies, setPendingCompanies] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(true);

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);

  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await axiosInstance.get('/api/admin/stats');
      setStats(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.detail ?? 'Failed to load admin dashboard data.');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchPending = useCallback(async () => {
    setPendingLoading(true);
    try {
      const res = await axiosInstance.get('/api/admin/companies/pending');
      setPendingCompanies(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.detail ?? 'Failed to load pending companies.');
    } finally {
      setPendingLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await axiosInstance.get('/api/admin/users');
      setUsers(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.detail ?? 'Failed to load users.');
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const fetchJobs = useCallback(async () => {
    setJobsLoading(true);
    try {
      const res = await axiosInstance.get('/api/admin/jobs');
      setJobs(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.detail ?? 'Failed to load job listings.');
    } finally {
      setJobsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchPending();
    fetchUsers();
    fetchJobs();
  }, [fetchStats, fetchPending, fetchUsers, fetchJobs]);

  const handleApprove = async (companyId) => {
    try {
      await axiosInstance.put(`/api/admin/companies/${companyId}/approve`);
      fetchPending();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.detail ?? 'Failed to approve company.');
    }
  };

  const handleReject = async (companyId) => {
    try {
      await axiosInstance.put(`/api/admin/companies/${companyId}/reject`);
      fetchPending();
      fetchStats();
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.detail ?? 'Failed to reject company.');
    }
  };

  const handleToggleUser = async (userId) => {
    try {
      await axiosInstance.put(`/api/admin/users/${userId}/toggle-active`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.detail ?? 'Failed to update user status.');
    }
  };

  const handleToggleJob = async (jobId) => {
    try {
      await axiosInstance.put(`/api/admin/jobs/${jobId}/toggle-active`);
      fetchJobs();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.detail ?? 'Failed to update job status.');
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      await axiosInstance.delete(`/api/admin/jobs/${jobId}`);
      fetchJobs();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.detail ?? 'Failed to delete job.');
    }
  };

  const SECTIONS = {
    overview: (
      <DashboardOverview
        stats={stats}
        loading={statsLoading}
        pendingCompanies={pendingCompanies}
        onNavigate={setActiveSection}
      />
    ),
    approvals: (
      <PendingApprovals
        companies={pendingCompanies}
        loading={pendingLoading}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    ),
    users: (
      <ManageUsers
        users={users}
        loading={usersLoading}
        onToggleActive={handleToggleUser}
      />
    ),
    jobs: (
      <JobListings
        jobs={jobs}
        loading={jobsLoading}
        onToggleActive={handleToggleJob}
        onDelete={handleDeleteJob}
      />
    ),
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
      <AdminSidebar activeSection={activeSection} onNavigate={setActiveSection} />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar activeSection={activeSection} />
        <main className="flex-1 p-8 md:p-10">
          {error && (
            <div className="mb-6 px-5 py-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium rounded-xl">
              {error}
            </div>
          )}
          {SECTIONS[activeSection]}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
