import { useState, useEffect } from 'react'
import { CheckCircle, Edit3, X, Save } from 'lucide-react'
import axiosInstance from '../../../api/axiosInstance'
import { useAuth } from '../../../contexts/AuthContext'

const Field = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-400 mb-1">{label}</p>
    <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm text-gray-700">
      {value || '—'}
    </div>
  </div>
)

const CompanyProfileView = ({ companyInfo: initialInfo, onUpdate }) => {
  const { user } = useAuth()
  const [info, setInfo] = useState(initialInfo)
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({ active_listings: 0, total_applicants: 0 })

  useEffect(() => {
    if (initialInfo) setInfo(initialInfo)
  }, [initialInfo])

  useEffect(() => {
    axiosInstance.get(`/api/dashboard/company/${user.id}`)
      .then(res => {
        const d = res.data
        setInfo(d.company_info)
        setStats({
          active_listings: d.stats.active_listings,
          total_applicants: d.stats.total_applicants,
        })
      })
      .catch(() => {})
  }, [user.id])

  const openEdit = () => {
    setForm({
      company_name: info?.name || '',
      industry: info?.industry || '',
      description: info?.description || '',
      website: info?.website || '',
      company_size: info?.company_size || '',
      founded_year: info?.founded_year || '',
      hq_location: info?.hq_location || '',
    })
    setIsEditing(true)
    setError('')
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError('')
    try {
      await axiosInstance.put('/api/dashboard/company/profile/update', form)
      // Refetch updated info
      const res = await axiosInstance.get(`/api/dashboard/company/${user.id}`)
      setInfo(res.data.company_info)
      if (onUpdate) onUpdate(res.data.company_info)
      setIsEditing(false)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save profile')
    } finally {
      setIsSaving(false)
    }
  }

  const initials = info?.name
    ? info.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : 'CO'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
        {!isEditing ? (
          <button
            onClick={openEdit}
            className="flex items-center gap-2 text-sm border border-indigo-300 text-indigo-600 px-4 py-2 rounded-xl font-medium hover:bg-indigo-50 transition"
          >
            <Edit3 size={14} /> Edit Profile
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-2 text-sm border border-gray-200 text-gray-500 px-4 py-2 rounded-xl font-medium hover:bg-gray-50 transition"
            >
              <X size={14} /> Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 text-sm bg-indigo-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-indigo-700 transition disabled:opacity-60"
            >
              <Save size={14} /> {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-5 py-3">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Profile card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center">
          {/* Avatar */}
          <div className="h-20 w-20 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-4">
            {initials}
          </div>
          <h2 className="text-lg font-bold text-gray-900">{info?.name || 'Company Name'}</h2>
          <p className="text-sm text-gray-400 mt-1">
            {[info?.industry, info?.hq_location].filter(Boolean).join(' · ') || 'No info yet'}
          </p>

          {/* Mini stats */}
          <div className="flex gap-6 mt-6 pt-5 border-t border-gray-50 w-full justify-center">
            <div className="text-center">
              <p className="text-xl font-bold text-indigo-600">{stats.active_listings}</p>
              <p className="text-xs text-gray-400 mt-0.5">Active Jobs</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-indigo-600">{stats.total_applicants}</p>
              <p className="text-xs text-gray-400 mt-0.5">Applicants</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-indigo-600">—</p>
              <p className="text-xs text-gray-400 mt-0.5">Views</p>
            </div>
          </div>

          {/* Verified badge */}
          {info?.is_approved && (
            <div className="mt-5 flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-semibold px-4 py-1.5 rounded-full">
              <CheckCircle size={13} /> Verified Company
            </div>
          )}
        </div>

        {/* Right — Details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Company Information card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Company Information</h3>
            {!isEditing ? (
              <div className="grid grid-cols-2 gap-4">
                <Field label="Company Name" value={info?.name} />
                <Field label="Industry" value={info?.industry} />
                <Field label="Company Size" value={info?.company_size} />
                <Field label="Founded" value={info?.founded_year} />
                <Field label="Website" value={info?.website} />
                <Field label="HQ Location" value={info?.hq_location} />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'company_name', label: 'Company Name' },
                  { key: 'industry', label: 'Industry' },
                  { key: 'company_size', label: 'Company Size', placeholder: 'e.g. 50-200 employees' },
                  { key: 'founded_year', label: 'Founded', placeholder: 'e.g. 2018' },
                  { key: 'website', label: 'Website', placeholder: 'e.g. company.io' },
                  { key: 'hq_location', label: 'HQ Location', placeholder: 'e.g. Prishtina, Kosovo' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="text-xs text-gray-400 mb-1 block">{label}</label>
                    <input
                      type="text"
                      placeholder={placeholder || label}
                      value={form[key] || ''}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-300 transition"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Description card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Company Description</h3>
            {!isEditing ? (
              <p className="text-sm text-gray-500 leading-relaxed">
                {info?.description || 'No description added yet. Click "Edit Profile" to add one.'}
              </p>
            ) : (
              <textarea
                rows={4}
                placeholder="Describe your company, mission, culture..."
                value={form.description || ''}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-300 transition resize-none"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CompanyProfileView
