import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/auth/AuthLayout'
import axiosInstance from '../api/axiosInstance'
import { validateRegisterForm, hasErrors, normalizeUrl } from '../utils/validation'

function PersonIcon() {
  return (
    <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}

function EnvelopeIcon() {
  return (
    <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  )
}

function BuildingIcon() {
  return (
    <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  )
}

function GlobeIcon() {
  return (
    <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  )
}

// Ordered list of industry options shown in the dropdown
const INDUSTRIES = [
  'Technology', 'Finance', 'Healthcare', 'Education', 'Marketing',
  'E-Commerce', 'Manufacturing', 'Real Estate', 'Media', 'Consulting',
  'Telecommunications', 'Transportation', 'Hospitality', 'Other',
]

function Field({ label, icon, type, placeholder, value, onChange, error, disabled }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <div className={`flex items-center gap-3 border rounded-lg px-4 py-3 transition-colors ${
        error ? 'border-red-300 bg-red-50'
        : disabled ? 'border-gray-100 bg-gray-50'
        : 'border-gray-200 focus-within:border-indigo-400'
      }`}>
        {icon}
        <input
          type={type}
          placeholder={placeholder}
          className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent disabled:text-gray-400"
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

// Dropdown wrapper that matches the Field visual style
function SelectField({ label, value, onChange, error, options, placeholder }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <div className={`flex items-center border rounded-lg px-4 py-3 focus-within:border-indigo-400 transition-colors ${error ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
        <select
          className="flex-1 outline-none text-sm text-gray-700 bg-transparent appearance-none cursor-pointer"
          value={value}
          onChange={onChange}
        >
          <option value="">{placeholder || 'Select an option'}</option>
          {options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        {/* Chevron icon */}
        <svg className="w-4 h-4 text-gray-400 shrink-0 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

const roles = [
  {
    key: 'CANDIDATE',
    title: 'Job Seeker / Candidate',
    desc: 'Find jobs, track applications, and connect with companies.',
    icon: (
      <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    key: 'COMPANY',
    title: 'Employer / Company',
    desc: 'Post jobs, manage applicants, and hire top talent faster.',
    icon: (
      <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
]

const initialForm = {
  // Candidates: full name ("John Doe"). Companies: company name ("TechNova").
  // Both submit as `name` — no more firstName/lastName split.
  name: '', companyName: '',
  email: '', password: '',
  // Company-specific fields
  industry: '', customIndustry: '',
  website: '', noWebsite: false,
}

export default function Register() {
  const [step, setStep] = useState(1)
  const [role, setRole] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [fieldErrors, setFieldErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const setField = key => e => setForm(f => ({ ...f, [key]: e.target.value }))
  // Checkbox fields carry a boolean value via e.target.checked
  const setCheck = key => e => setForm(f => ({ ...f, [key]: e.target.checked }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')

    const errors = validateRegisterForm(form, role)
    if (hasErrors(errors)) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors({})
    setLoading(true)

    try {
      // Resolve effective website: null when "no website" is checked or field is empty
      const resolvedWebsite = (role === 'COMPANY' && !form.noWebsite && form.website.trim())
        ? normalizeUrl(form.website)   // auto-prepend https:// if missing
        : null

      await axiosInstance.post('/auth/register', {
        // Both roles send a single `name` field — companies use their company name
        name: role === 'COMPANY' ? form.companyName : form.name,
        email: form.email,
        password: form.password,
        role_name: role,
        // Only include company fields for COMPANY role registrations
        ...(role === 'COMPANY' && {
          industry: form.industry,
          custom_industry: form.industry === 'Other' ? form.customIndustry : undefined,
          website: resolvedWebsite,
        }),
      })
      navigate('/login')
    } catch (err) {
      setServerError(err.response?.data?.detail || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Create your account">
      {/* Progress bar */}
      <div className="flex gap-2 mb-5">
        <div className="h-1 flex-1 rounded-full bg-indigo-600" />
        <div className={`h-1 flex-1 rounded-full transition-colors ${step === 2 ? 'bg-indigo-600' : 'bg-gray-200'}`} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-8">
        {step === 1 ? (
          <>
            <h2 className="text-lg font-bold text-gray-900 mb-1">I am a...</h2>
            <p className="text-sm text-gray-500 mb-6">Choose your role to get started.</p>

            <div className="space-y-3 mb-6">
              {roles.map(r => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setRole(r.key)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                    role === r.key
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                    {r.icon}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{r.title}</div>
                    <div className="text-xs text-indigo-500 mt-0.5">{r.desc}</div>
                  </div>
                </button>
              ))}
            </div>

            <button
              type="button"
              disabled={!role}
              onClick={() => setStep(2)}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue →
            </button>
          </>
        ) : (
          <>
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              {role === 'COMPANY' ? 'Company details' : 'Your details'}
            </h2>
            <p className="text-sm text-gray-500 mb-6">Fill in your information to get started.</p>

            {serverError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {role === 'COMPANY' ? (
                <>
                  <Field
                    label="Company Name"
                    icon={<BuildingIcon />}
                    type="text"
                    placeholder="e.g. TechCorp Inc."
                    value={form.companyName}
                    onChange={setField('companyName')}
                    error={fieldErrors.companyName}
                  />

                  {/* Industry dropdown — required for companies */}
                  <SelectField
                    label="Industry"
                    value={form.industry}
                    onChange={setField('industry')}
                    error={fieldErrors.industry}
                    options={INDUSTRIES}
                    placeholder="Select your industry"
                  />

                  {/* Conditional text input shown only when "Other" is selected */}
                  {form.industry === 'Other' && (
                    <Field
                      label="Specify Industry"
                      icon={<BuildingIcon />}
                      type="text"
                      placeholder="e.g. Renewable Energy"
                      value={form.customIndustry}
                      onChange={setField('customIndustry')}
                      error={fieldErrors.customIndustry}
                    />
                  )}

                  {/* Website field — optional; disabled when "no website" checkbox is checked */}
                  <Field
                    label="Website (optional)"
                    icon={<GlobeIcon />}
                    type="text"
                    placeholder="e.g. company.com"
                    value={form.website}
                    onChange={setField('website')}
                    error={fieldErrors.website}
                    disabled={form.noWebsite}
                  />
                  <label className="flex items-center gap-2 mb-4 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-indigo-600 rounded"
                      checked={form.noWebsite}
                      onChange={setCheck('noWebsite')}
                    />
                    <span className="text-sm text-gray-600">We do not have a website</span>
                  </label>
                </>
              ) : (
                // Single full-name field for candidates — replaces First Name + Last Name
                <Field
                  label="Full Name"
                  icon={<PersonIcon />}
                  type="text"
                  placeholder="e.g. Sarah Johnson"
                  value={form.name}
                  onChange={setField('name')}
                  error={fieldErrors.name}
                />
              )}
              <Field
                label="Email address"
                icon={<EnvelopeIcon />}
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={setField('email')}
                error={fieldErrors.email}
              />
              <Field
                label="Password"
                icon={<LockIcon />}
                type="password"
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={setField('password')}
                error={fieldErrors.password}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Create Account →'}
              </button>
            </form>
          </>
        )}
      </div>

      <p className="mt-6 text-sm text-gray-500 text-center">
        Already have an account?{' '}
        <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
