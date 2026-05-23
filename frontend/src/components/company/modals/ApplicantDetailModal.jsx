import { X, CheckCircle, XCircle, Clock, Eye, RotateCcw, Download } from 'lucide-react'
import axiosInstance from '../../../api/axiosInstance'
import { useState } from 'react'

async function downloadCV(fileId, originalFilename) {
  const res = await axiosInstance.get(`/api/files/cv/${fileId}`, { responseType: 'blob' })
  const url = URL.createObjectURL(res.data)
  const a = document.createElement('a')
  a.href = url
  a.download = originalFilename || 'cv'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

const STATUS_CONFIG = {
  Pending:       { color: 'bg-yellow-50 text-yellow-700', icon: Clock },
  'Under Review':{ color: 'bg-blue-50 text-blue-700',   icon: Eye },
  Interview:     { color: 'bg-purple-50 text-purple-700',icon: RotateCcw },
  Accepted:      { color: 'bg-green-50 text-green-700',  icon: CheckCircle },
  Rejected:      { color: 'bg-red-50 text-red-600',      icon: XCircle },
}

const ApplicantDetailModal = ({ app, onClose, onStatusUpdate }) => {
  const [isUpdating, setIsUpdating] = useState(false)
  const [currentStatus, setCurrentStatus] = useState(app.app_status)
  const [error, setError] = useState('')
  const [downloadError, setDownloadError] = useState('')

  const skills = app.candidate_skills?.split(',').map(s => s.trim()).filter(Boolean) || []
  const initials = app.candidate_name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?'

  const handleStatus = async (newStatus) => {
    setIsUpdating(true)
    setError('')
    try {
      await axiosInstance.put(`/api/dashboard/applications/status/${app.app_id}`, { status: newStatus })
      setCurrentStatus(newStatus)
      if (onStatusUpdate) onStatusUpdate()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update status')
    } finally {
      setIsUpdating(false)
    }
  }

  const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || { color: 'bg-gray-100 text-gray-600', icon: Clock }
    const Icon = cfg.icon
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${cfg.color}`}>
        <Icon size={12} /> {status}
      </span>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Applicant Profile</h2>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Candidate info */}
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shrink-0">
              {initials}
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{app.candidate_name}</h3>
              {app.candidate_headline && (
                <p className="text-sm text-gray-400 mt-0.5">{app.candidate_headline}</p>
              )}
              <span className="text-xs text-indigo-600 font-semibold uppercase tracking-tight mt-1 block">
                → {app.job_title}
              </span>
            </div>
          </div>

          {/* Current status */}
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
            <span className="text-xs text-gray-500 font-medium">Current Status</span>
            <StatusBadge status={currentStatus} />
          </div>

          {/* Summary */}
          {app.candidate_summary && (
            <div className="bg-indigo-50/50 rounded-xl px-4 py-4">
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide mb-2">About</p>
              <p className="text-sm text-gray-600 leading-relaxed italic">"{app.candidate_summary}"</p>
            </div>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {skills.map(s => (
                  <span key={s} className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* CV Download */}
          {app.cv_file_id && (
            <div>
              <button
                onClick={async () => {
                  setDownloadError('')
                  try { await downloadCV(app.cv_file_id, app.cv_filename) }
                  catch { setDownloadError('Failed to download CV. Please try again.') }
                }}
                className="flex items-center justify-center gap-2 w-full py-2.5 border border-indigo-200 text-indigo-600 rounded-xl text-sm font-semibold hover:bg-indigo-50 transition"
              >
                <Download size={14} /> Download CV ({app.cv_filename})
              </button>
              {downloadError && (
                <p className="text-xs text-red-500 mt-1.5 text-center">{downloadError}</p>
              )}
            </div>
          )}

          {/* Applied on */}
          <p className="text-xs text-gray-300">Applied: {app.applied_at_formatted}</p>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-2">{error}</div>
          )}

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              disabled={isUpdating || currentStatus === 'Accepted'}
              onClick={() => handleStatus('Accepted')}
              className="flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-xl font-semibold text-sm hover:bg-green-600 transition disabled:opacity-40 shadow-sm"
            >
              <CheckCircle size={16} /> Accept
            </button>
            <button
              disabled={isUpdating || currentStatus === 'Rejected'}
              onClick={() => handleStatus('Rejected')}
              className="flex items-center justify-center gap-2 py-3 bg-red-500 text-white rounded-xl font-semibold text-sm hover:bg-red-600 transition disabled:opacity-40 shadow-sm"
            >
              <XCircle size={16} /> Reject
            </button>
          </div>

          {/* Pipeline actions */}
          <div className="grid grid-cols-2 gap-2">
            <button
              disabled={isUpdating}
              onClick={() => handleStatus('Under Review')}
              className="py-2 border border-blue-200 text-blue-600 rounded-xl text-xs font-semibold hover:bg-blue-50 transition disabled:opacity-40"
            >
              Move to Review
            </button>
            <button
              disabled={isUpdating}
              onClick={() => handleStatus('Interview')}
              className="py-2 border border-purple-200 text-purple-600 rounded-xl text-xs font-semibold hover:bg-purple-50 transition disabled:opacity-40"
            >
              Schedule Interview
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApplicantDetailModal
