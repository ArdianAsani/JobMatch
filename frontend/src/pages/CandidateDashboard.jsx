/**
 * CandidateDashboard — shell kryesor i panelit të kandidatit.
 *
 * Menaxhon:
 *   - Navigimin mes seksioneve nëpërmjet state (activeSection)
 *   - Sidebar + Topbar janë të përbashkëta për të gjitha seksionet
 *
 * Seksionet:
 *   dashboard     → CandidateOverview   (stats, pipeline, recommended)
 *   browse        → BrowseJobsView      (kërko dhe apliko punë)
 *   applications  → MyApplicationsView  (aplikimet me pipeline tracker)
 *   saved         → SavedJobsView       (punët e ruajtura)
 *   notifications → CandidateNotificationsView
 *   profile       → CandidateProfileView (view + edit profil)
 */
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axiosInstance from '../api/axiosInstance'

import CandidateSidebar from '../components/candidate/CandidateSidebar'
import CandidateTopbar from '../components/candidate/CandidateTopbar'
import CandidateOverview from '../components/candidate/views/CandidateOverview'
import BrowseJobsView from '../components/candidate/views/BrowseJobsView'
import MyApplicationsView from '../components/candidate/views/MyApplicationsView'
import SavedJobsView from '../components/candidate/views/SavedJobsView'
import CandidateProfileView from '../components/candidate/views/CandidateProfileView'

const CandidateDashboard = () => {
  const { user, logout } = useAuth()
  const [activeSection, setActiveSection] = useState('dashboard')
  const [candidateInfo, setCandidateInfo] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosInstance.get(`/api/dashboard/candidate/overview/${user.id}`)
        setCandidateInfo(res.data.candidate_info)
      } catch {
        // Secila view trajtoje gabimin vetë
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [user.id])

  const renderView = () => {
    switch (activeSection) {
      case 'dashboard':
        return <CandidateOverview onNavigate={setActiveSection} />
      case 'browse':
        return <BrowseJobsView onNavigate={setActiveSection} />
      case 'applications':
        return <MyApplicationsView />
      case 'saved':
        return <SavedJobsView />
      case 'profile':
        return (
          <CandidateProfileView
            onUpdate={(updated) => setCandidateInfo(prev => ({ ...prev, ...updated }))}
          />
        )
      default:
        return <CandidateOverview onNavigate={setActiveSection} />
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen bg-[#1a2035] items-center justify-center">
        <div className="text-slate-400 text-sm animate-pulse">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar — desktop gjithmonë, mobile kur është hapur */}
      <div className={`${sidebarOpen ? 'flex' : 'hidden'} lg:flex`}>
        <CandidateSidebar
          active={activeSection}
          onNavigate={(section) => {
            setActiveSection(section)
            setSidebarOpen(false)
          }}
          candidateInfo={candidateInfo}
          logout={logout}
        />
      </div>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Content area */}
      <div className="flex-1 flex flex-col min-w-0">
        <CandidateTopbar
          candidateInfo={candidateInfo}
          onNavigate={setActiveSection}
          onMenuToggle={() => setSidebarOpen(s => !s)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {renderView()}
        </main>
      </div>
    </div>
  )
}

export default CandidateDashboard
