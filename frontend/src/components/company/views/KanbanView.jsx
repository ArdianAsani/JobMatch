import { useState, useEffect, useRef } from 'react'
import { Download, Eye } from 'lucide-react'
import axiosInstance from '../../../api/axiosInstance'
import { useAuth } from '../../../contexts/AuthContext'
import ApplicantDetailModal from '../modals/ApplicantDetailModal'

const COLUMNS = [
  {
    key: 'Pending',
    label: 'Pending',
    top: 'border-amber-400',
    countCls: 'bg-amber-100 text-amber-700',
    emptyRing: 'border-amber-200',
  },
  {
    key: 'Under Review',
    label: 'Under Review',
    top: 'border-blue-400',
    countCls: 'bg-blue-100 text-blue-700',
    emptyRing: 'border-blue-200',
  },
  {
    key: 'Interview',
    label: 'Interview',
    top: 'border-violet-400',
    countCls: 'bg-violet-100 text-violet-700',
    emptyRing: 'border-violet-200',
  },
  {
    key: 'Accepted',
    label: 'Accepted',
    top: 'border-green-400',
    countCls: 'bg-green-100 text-green-700',
    emptyRing: 'border-green-200',
  },
  {
    key: 'Rejected',
    label: 'Rejected',
    top: 'border-red-400',
    countCls: 'bg-red-100 text-red-600',
    emptyRing: 'border-red-200',
  },
]

async function downloadCV(fileId, filename) {
  const res = await axiosInstance.get(`/api/files/cv/${fileId}`, { responseType: 'blob' })
  const url = URL.createObjectURL(res.data)
  const a = document.createElement('a')
  a.href = url
  a.download = filename || 'cv'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

const AVATAR_PALETTE = [
  'bg-indigo-500', 'bg-violet-500', 'bg-teal-500',
  'bg-rose-500', 'bg-amber-500', 'bg-blue-500', 'bg-green-600',
]
const avatarColor = (name = '') =>
  AVATAR_PALETTE[(name.charCodeAt(0) || 0) % AVATAR_PALETTE.length]

const KanbanView = () => {
  const { user } = useAuth()
  const [applicants, setApplicants] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedApp, setSelectedApp] = useState(null)
  const [dragOverCol, setDragOverCol] = useState(null)
  const draggingId = useRef(null)

  const fetchApplicants = async () => {
    setIsLoading(true)
    try {
      const res = await axiosInstance.get(`/api/dashboard/company/${user.id}/applicants`)
      setApplicants(res.data)
    } catch { /* handled silently */ }
    finally { setIsLoading(false) }
  }

  useEffect(() => { fetchApplicants() }, []) // eslint-disable-line

  const handleDrop = async (colKey) => {
    const appId = draggingId.current
    draggingId.current = null
    setDragOverCol(null)
    if (!appId) return

    const app = applicants.find(a => a.app_id === appId)
    if (!app || app.app_status === colKey) return

    const prevStatus = app.app_status
    setApplicants(prev =>
      prev.map(a => a.app_id === appId ? { ...a, app_status: colKey } : a)
    )
    try {
      await axiosInstance.put(`/api/dashboard/applications/status/${appId}`, { status: colKey })
    } catch {
      setApplicants(prev =>
        prev.map(a => a.app_id === appId ? { ...a, app_status: prevStatus } : a)
      )
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm text-gray-400 animate-pulse">Loading kanban...</div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kanban Board</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {applicants.length} application{applicants.length !== 1 ? 's' : ''} — drag cards between columns to update status
        </p>
      </div>

      {/* Board */}
      <div className="flex gap-3 overflow-x-auto pb-4 min-h-[calc(100vh-14rem)]">
        {COLUMNS.map(col => {
          const cards = applicants.filter(a => a.app_status === col.key)
          const isOver = dragOverCol === col.key

          return (
            <div
              key={col.key}
              className={`shrink-0 w-64 flex flex-col rounded-2xl border-t-[3px] ${col.top} transition-all duration-150 ${
                isOver ? 'bg-indigo-50/60 ring-2 ring-indigo-300' : 'bg-gray-50'
              }`}
              onDragOver={e => { e.preventDefault(); setDragOverCol(col.key) }}
              onDragLeave={e => {
                if (!e.currentTarget.contains(e.relatedTarget)) setDragOverCol(null)
              }}
              onDrop={() => handleDrop(col.key)}
            >
              {/* Column header */}
              <div className="flex items-center justify-between px-4 pt-4 pb-3">
                <span className="text-sm font-bold text-gray-700">{col.label}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.countCls}`}>
                  {cards.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex-1 px-3 pb-3 space-y-2.5">
                {cards.map(app => {
                  const initials = app.candidate_name
                    ?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?'
                  const color = avatarColor(app.candidate_name || '')
                  const skills = app.candidate_skills
                    ?.split(',').map(s => s.trim()).filter(Boolean).slice(0, 3) || []

                  return (
                    <div
                      key={app.app_id}
                      draggable
                      onDragStart={() => { draggingId.current = app.app_id }}
                      onDragEnd={() => { draggingId.current = null; setDragOverCol(null) }}
                      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-grab active:cursor-grabbing active:shadow-md active:scale-[1.02] hover:shadow-md transition-all select-none"
                    >
                      {/* Candidate */}
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className={`h-8 w-8 ${color} rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate leading-tight">
                            {app.candidate_name}
                          </p>
                          <p className="text-[11px] text-gray-400 truncate">{app.job_title}</p>
                        </div>
                      </div>

                      {/* Skills */}
                      {skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {skills.map(s => (
                            <span key={s} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-md">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-2.5 border-t border-gray-50">
                        <span className="text-[10px] text-gray-400">{app.applied_at_formatted}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={e => { e.stopPropagation(); setSelectedApp(app) }}
                            title="View profile"
                            className="h-6 w-6 flex items-center justify-center rounded-lg hover:bg-indigo-50 transition"
                          >
                            <Eye size={12} className="text-indigo-500" />
                          </button>
                          {app.cv_file_id ? (
                            <button
                              onClick={e => { e.stopPropagation(); downloadCV(app.cv_file_id, app.cv_filename) }}
                              title="Download CV"
                              className="h-6 w-6 flex items-center justify-center rounded-lg hover:bg-indigo-50 transition"
                            >
                              <Download size={12} className="text-indigo-500" />
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  )
                })}

                {/* Empty column drop zone */}
                {cards.length === 0 && (
                  <div className={`flex items-center justify-center h-24 rounded-xl border-2 border-dashed transition-colors ${
                    isOver ? 'border-indigo-300 bg-indigo-50' : `${col.emptyRing} bg-transparent`
                  }`}>
                    <p className="text-xs text-gray-300">Drop here</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {selectedApp && (
        <ApplicantDetailModal
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
          onStatusUpdate={fetchApplicants}
        />
      )}
    </div>
  )
}

export default KanbanView
