import { useState } from 'react'
import { X } from 'lucide-react'
import axiosInstance from '../../../api/axiosInstance'

const JOB_TYPES = ['Full-time', 'Part-time', 'Remote', 'Contract', 'Internship']

const JobFormModal = ({ job, onClose, onSuccess }) => {
  const isEdit = !!job
  const [form, setForm] = useState({
    title: job?.title || '',
    description: job?.description || '',
    location: job?.location || 'Prishtina',
    job_type: job?.job_type || 'Full-time',
    salary: job?.salary || '',
    requirements: job?.requirements || '',
    skills_required: job?.skills_required || '',
    deadline: job?.deadline || '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      const payload = {
        ...form,
        salary: form.salary ? parseFloat(form.salary) : null,
        deadline: form.deadline || null,
      }
      if (isEdit) {
        await axiosInstance.put(`/api/dashboard/jobs/update/${job.id}`, payload)
      } else {
        await axiosInstance.post('/api/dashboard/jobs/create', payload)
      }
      onSuccess()
      onClose()
    } catch (err) {
      setError(err.response?.data?.detail || 'Action failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{isEdit ? 'Edit Position' : 'Post New Job'}</h2>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>
          )}

          {/* Job Title */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Job Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Senior Frontend Developer"
              value={form.title}
              onChange={set('title')}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-300 transition"
            />
          </div>

          {/* Location + Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Location</label>
              <input
                type="text"
                placeholder="e.g. Remote"
                value={form.location}
                onChange={set('location')}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-300 transition"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Job Type</label>
              <select
                value={form.job_type}
                onChange={set('job_type')}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-300 transition cursor-pointer"
              >
                {JOB_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Salary + Deadline */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Salary (USD/yr)</label>
              <input
                type="number"
                placeholder="e.g. 85000"
                value={form.salary}
                onChange={set('salary')}
                min="0"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-300 transition"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Application Deadline</label>
              <input
                type="date"
                value={form.deadline}
                onChange={set('deadline')}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-300 transition"
              />
            </div>
          </div>

          {/* Description — main AI semantic field */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
              Description *
            </label>
            <textarea
              required
              style={{ minHeight: '180px' }}
              placeholder={`Describe the role, technologies, responsibilities, team environment, and project context.\n\nExample:\nLooking for a Frontend Developer experienced with React, TypeScript, TailwindCSS and modern dashboard applications. The candidate will build scalable UI systems and collaborate closely with backend engineers and designers.`}
              value={form.description}
              onChange={set('description')}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-300 transition resize-y leading-relaxed"
            />
            <p className="text-xs text-gray-400 mt-1.5">
              A detailed description improves the quality of AI candidate matching.
            </p>
          </div>

          {/* Requirements */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Requirements</label>
            <textarea
              style={{ minHeight: '120px' }}
              placeholder="List expectations, required technologies, years of experience, qualifications, or important skills."
              value={form.requirements}
              onChange={set('requirements')}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-300 transition resize-y leading-relaxed"
            />
          </div>

          {/* Skills Required */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Skills Required</label>
            <input
              type="text"
              placeholder="e.g. React, TypeScript, Node.js, PostgreSQL"
              value={form.skills_required}
              onChange={set('skills_required')}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-300 transition"
            />
            <p className="text-xs text-gray-400 mt-1.5">Separate skills with commas.</p>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-gray-500 px-5 py-2.5 rounded-xl hover:bg-gray-100 transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="text-sm bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition shadow-sm disabled:opacity-60"
          >
            {isLoading ? 'Saving...' : isEdit ? 'Save Changes' : 'Publish Job'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default JobFormModal
