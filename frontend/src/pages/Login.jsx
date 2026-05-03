import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/auth/AuthLayout'
import axiosInstance from '../api/axiosInstance'
import { validateLoginForm, hasErrors } from '../utils/validation'
import { getDashboardPath, storeAuthTokens } from '../utils/auth'

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

function InputField({ label, icon, type, placeholder, value, onChange, error }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <div className={`flex items-center gap-3 border rounded-lg px-4 py-3 focus-within:border-indigo-400 transition-colors ${error ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
        {icon}
        <input
          type={type}
          placeholder={placeholder}
          className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent"
          value={value}
          onChange={onChange}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')

    const errors = validateLoginForm(email, password)
    if (hasErrors(errors)) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors({})
    setLoading(true)

    try {
      const { data } = await axiosInstance.post('/auth/login', { email, password })
      storeAuthTokens(data)
      navigate(getDashboardPath(data.role))
    } catch (err) {
      setServerError(err.response?.data?.detail || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your JobMatch account">
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <form onSubmit={handleSubmit} noValidate>
          {serverError && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
              {serverError}
            </div>
          )}

          <InputField
            label="Email address"
            icon={<EnvelopeIcon />}
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            error={fieldErrors.email}
          />

          <div className="mb-6">
            <InputField
              label="Password"
              icon={<LockIcon />}
              type="password"
              placeholder="Your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              error={fieldErrors.password}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>
      </div>

      <p className="mt-6 text-sm text-gray-500 text-center">
        Don't have an account?{' '}
        <Link to="/register" className="text-indigo-600 font-semibold hover:underline">
          Sign up free
        </Link>
      </p>
    </AuthLayout>
  )
}
