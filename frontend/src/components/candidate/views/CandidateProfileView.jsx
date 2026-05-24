import { useState, useEffect, useRef } from 'react'
import { Edit3, Save, X, MapPin, FileText, Upload, CheckCircle, Sparkles, Download } from 'lucide-react'
import axiosInstance from '../../../api/axiosInstance'
import { useAuth } from '../../../contexts/AuthContext'

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

const Field = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-400 mb-1">{label}</p>
    <p className="text-sm text-gray-700 font-medium bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 min-h-[38px]">
      {value || <span className="text-gray-300 font-normal">—</span>}
    </p>
  </div>
)

const Input = ({ label, value, onChange, placeholder }) => (
  <div>
    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">{label}</label>
    <input
      type="text"
      placeholder={placeholder}
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-300 transition"
    />
  </div>
)

const CandidateProfileView = ({ onUpdate }) => {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [cvUploading, setCvUploading] = useState(false)
  const [cvError, setCvError] = useState('')
  const [cvDownloading, setCvDownloading] = useState(false)
  const fileInputRef = useRef(null)

  const fetchProfile = async () => {
    try {
      const res = await axiosInstance.get(`/api/dashboard/candidate/profile/${user.id}`)
      setProfile(res.data)
      setForm(res.data)
    } catch { /* silently fail */ }
  }

  useEffect(() => { fetchProfile() }, [user.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }))

  const handleSave = async () => {
    setError('')
    const trimmedSummary = (form.professional_summary || '').trim()
    const trimmedSkills = (form.skills || '').trim()
    if (trimmedSummary && trimmedSummary.length < 30) {
      setError('Professional summary must be at least 30 characters.')
      return
    }
    if (trimmedSkills && trimmedSkills.length < 5) {
      setError('Skills must be at least 5 characters.')
      return
    }
    setIsSaving(true)
    try {
      const { name, email, profile_strength, cv_file_id, cv_filename, cv_uploaded_at, ...updatable } = form
      await axiosInstance.put('/api/dashboard/candidate/profile/update', updatable)
      await fetchProfile()
      setIsEditing(false)
      if (onUpdate) onUpdate({ name: profile?.name, headline: form.headline })
    } catch (err) {
      const detail = err.response?.data?.detail
      const msg = Array.isArray(detail) ? detail[0]?.msg?.replace(/^Value error, /, '') : detail
      setError(msg || 'Failed to save.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCvUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCvError('')
    setCvUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      await axiosInstance.post('/api/files/cv', formData, {
        headers: { 'Content-Type': undefined },
      })
      await fetchProfile()
    } catch (err) {
      setCvError(err.response?.data?.detail || 'Upload failed. Try again.')
    } finally {
      setCvUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  if (!profile) {
    return <div className="flex items-center justify-center py-24"><div className="text-sm text-gray-400 animate-pulse">Loading...</div></div>
  }

  const initials = (profile.name || '').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'CA'

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">My Profile</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 border border-gray-200 text-gray-600 text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-50 transition"
          >
            <Edit3 size={14} /> Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => { setIsEditing(false); setForm(profile) }}
              className="flex items-center gap-2 border border-gray-200 text-gray-500 text-sm px-4 py-2 rounded-xl hover:bg-gray-50 transition"
            >
              <X size={14} /> Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-indigo-700 transition disabled:opacity-60"
            >
              <Save size={14} /> {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="space-y-4">
          {/* Avatar card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
            <div className="h-16 w-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold mx-auto mb-3">
              {initials}
            </div>
            <h3 className="font-bold text-gray-900">{profile.name}</h3>
            {profile.headline && (
              <p className="text-sm text-gray-500 mt-1">{profile.headline}</p>
            )}
            {profile.location && (
              <p className="text-xs text-gray-400 mt-1.5 flex items-center justify-center gap-1">
                <MapPin size={10} />{profile.location}
              </p>
            )}
          </div>

          {/* Skills card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h4 className="font-bold text-gray-900 text-sm mb-3">Skills</h4>
            {isEditing ? (
              <Input
                label="Skills (comma separated)"
                value={form.skills}
                onChange={set('skills')}
                placeholder="React, TypeScript, Node.js"
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {(profile.skills || '').split(',').filter(s => s.trim()).map(s => (
                  <span key={s} className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-full font-medium">
                    {s.trim()}
                  </span>
                ))}
                {!profile.skills && <p className="text-xs text-gray-300 italic">No skills added yet.</p>}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Personal Information */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h4 className="font-bold text-gray-900 mb-4">Personal Information</h4>
            {isEditing ? (
              <div className="grid grid-cols-2 gap-4">
                <Input label="Headline" value={form.headline} onChange={set('headline')} placeholder="Senior Frontend Developer" />
                <Input label="Phone" value={form.phone} onChange={set('phone')} placeholder="+1 (555) 234-5678" />
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Email</label>
                  <input disabled value={profile.email || ''} className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-400 cursor-not-allowed" />
                </div>
                <Input label="Location" value={form.location} onChange={set('location')} placeholder="San Francisco, CA" />
                <Input label="LinkedIn URL" value={form.linkedin_url} onChange={set('linkedin_url')} placeholder="linkedin.com/in/username" />
                <Input label="Experience Level" value={form.experience_level} onChange={set('experience_level')} placeholder="Senior" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <Field label="Headline" value={profile.headline} />
                <Field label="Phone" value={profile.phone} />
                <Field label="Email" value={profile.email} />
                <Field label="Location" value={profile.location} />
                <Field label="LinkedIn" value={profile.linkedin_url} />
                <Field label="Experience Level" value={profile.experience_level} />
              </div>
            )}
          </div>

          {/* Resume / CV */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h4 className="font-bold text-gray-900 mb-4">Resume / CV</h4>

            {profile.cv_filename ? (
              <div className="flex items-center gap-3 mb-4 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
                <CheckCircle size={16} className="text-green-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-green-800 break-all">{profile.cv_filename}</p>
                  {profile.cv_uploaded_at && (
                    <p className="text-xs text-green-600">Uploaded {profile.cv_uploaded_at}</p>
                  )}
                </div>
                <button
                  onClick={async () => {
                    setCvDownloading(true)
                    setCvError('')
                    try { await downloadCV(profile.cv_file_id, profile.cv_filename) }
                    catch { setCvError('Download failed. Please try again.') }
                    finally { setCvDownloading(false) }
                  }}
                  disabled={cvDownloading}
                  className="flex items-center gap-1.5 text-xs font-semibold text-green-700 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-100 transition disabled:opacity-50 shrink-0"
                >
                  <Download size={12} />{cvDownloading ? '…' : 'Download'}
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-5 flex flex-col items-center justify-center gap-2 mb-4">
                <div className="h-10 w-10 bg-gray-100 rounded-xl flex items-center justify-center">
                  <FileText size={18} className="text-gray-400" />
                </div>
                <p className="text-sm text-gray-400">No CV uploaded yet.</p>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleCvUpload}
                className="hidden"
                id="cv-file-input"
              />
              <label
                htmlFor="cv-file-input"
                className={`flex items-center gap-2 cursor-pointer border border-indigo-200 text-indigo-600 text-sm font-medium px-4 py-2 rounded-xl hover:bg-indigo-50 transition ${cvUploading ? 'opacity-60 pointer-events-none' : ''}`}
              >
                <Upload size={14} />
                {cvUploading ? 'Uploading...' : profile.cv_filename ? 'Replace CV' : 'Upload CV'}
              </label>
              <span className="text-xs text-gray-400">PDF, DOC, or DOCX · Max 5 MB</span>
            </div>
            {cvError && (
              <p className="text-xs text-red-500 mt-2">{cvError}</p>
            )}
          </div>

          {/* Professional Profile — primary AI matching field */}
          <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-bold text-gray-900">Professional Profile</h4>
              <span className="flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                <Sparkles size={10} /> AI Matching
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              This text is used by our AI to match you with relevant jobs. Write clearly and in detail.
            </p>

            {isEditing ? (
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                  Professional Summary
                </label>
                <textarea
                  placeholder={`Describe your professional background, technologies, experience, projects, and career interests.\n\nExample:\nFrontend developer with experience in React, TypeScript, TailwindCSS and scalable dashboard applications. Built responsive UI systems and modern web platforms.`}
                  value={form.professional_summary || ''}
                  onChange={e => setForm(f => ({ ...f, professional_summary: e.target.value }))}
                  style={{ minHeight: '200px' }}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition resize-y leading-relaxed"
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-400">
                    Tip: include technologies, project types, seniority, and domains you work in.
                  </p>
                  <span className={`text-xs shrink-0 ml-3 ${(form.professional_summary || '').trim().length < 30 && (form.professional_summary || '').trim().length > 0 ? 'text-amber-500' : 'text-gray-300'}`}>
                    {(form.professional_summary || '').trim().length} / 30 min
                  </span>
                </div>
              </div>
            ) : (
              <div>
                {profile.professional_summary ? (
                  <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-4">
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{profile.professional_summary}</p>
                  </div>
                ) : (
                  <div className="bg-indigo-50/40 border border-dashed border-indigo-200 rounded-xl px-4 py-6 text-center">
                    <Sparkles size={18} className="text-indigo-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 font-medium">No professional summary yet.</p>
                    <p className="text-xs text-gray-400 mt-1">Add a summary to enable AI-powered job matching.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CandidateProfileView
