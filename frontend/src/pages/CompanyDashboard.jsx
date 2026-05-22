/**
 * CompanyDashboard — shell kryesor i panelit të kompanisë.
 *
 * Menaxhon:
 *   - Navigimin mes seksioneve nëpërmjet state (activeSection)
 *   - Portën e aprovimit: nëse kompania nuk është aprovuar, shfaq banner
 *   - Sidebar + Topbar janë të përbashkëta për të gjitha seksionet
 *
 * Seksionet:
 *   dashboard     → CompanyOverview  (stats, grafik, preview)
 *   jobs          → MyJobListings    (CRUD i plotë i shpalljeve)
 *   applicants    → ApplicantsView   (tabelë aplikantësh me filtera)
 *   notifications → NotificationsView
 *   profile       → CompanyProfileView (view + edit profil)
 */
import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import axiosInstance from '../api/axiosInstance'

import CompanySidebar from '../components/company/CompanySidebar'
import CompanyTopbar from '../components/company/CompanyTopbar'
import CompanyOverview from '../components/company/views/CompanyOverview'
import MyJobListings from '../components/company/views/MyJobListings'
import ApplicantsView from '../components/company/views/ApplicantsView'
import CompanyProfileView from '../components/company/views/CompanyProfileView'

const CompanyDashboard = () => {
  const { user, logout } = useAuth()
  const [activeSection, setActiveSection] = useState('dashboard')
  const [companyInfo, setCompanyInfo] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Ngarko informacionin bazë të kompanisë (emri + is_approved)
  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosInstance.get(`/api/dashboard/company/${user.id}`)
        setCompanyInfo(res.data.company_info)
      } catch {
        // Nëse dështon, vazhdo — secila view do ta trajtojë gabimin vetë
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [user.id])

  const renderView = () => {
    switch (activeSection) {
      case 'dashboard':
        return <CompanyOverview onNavigate={setActiveSection} />
      case 'jobs':
        return <MyJobListings />
      case 'applicants':
        return <ApplicantsView />
      case 'profile':
        return (
          <CompanyProfileView
            companyInfo={companyInfo}
            onUpdate={(updated) => setCompanyInfo(updated)}
          />
        )
      default:
        return <CompanyOverview onNavigate={setActiveSection} />
    }
  }

  // Po ngarkon — trego loading minimal
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
        <CompanySidebar
          active={activeSection}
          onNavigate={(section) => {
            setActiveSection(section)
            setSidebarOpen(false)
          }}
          companyInfo={companyInfo}
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
        <CompanyTopbar
          companyInfo={companyInfo}
          onNavigate={setActiveSection}
          onMenuToggle={() => setSidebarOpen(s => !s)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* Porta e aprovimit — bllokon aksesin nëse kompania nuk është aprovuar */}
          {companyInfo?.is_approved === false ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
              <div className="h-16 w-16 bg-amber-50 border border-amber-100 rounded-full flex items-center justify-center mb-6">
                <Clock size={28} className="text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Account Pending Approval</h3>
              <p className="text-gray-400 max-w-md leading-relaxed text-sm">
                Your company account is under review. You will gain full access to post jobs
                and manage applications once an admin approves your profile.
              </p>
              <button
                onClick={logout}
                className="mt-8 text-sm text-gray-400 hover:text-red-500 transition font-medium"
              >
                Sign out
              </button>
            </div>
          ) : (
            renderView()
          )}
        </main>
      </div>
    </div>
  )
}

export default CompanyDashboard
