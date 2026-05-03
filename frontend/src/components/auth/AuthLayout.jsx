import { Link } from 'react-router-dom'

function SearchIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
}

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-indigo-50 flex flex-col items-center justify-center px-4 py-12">
      <Link to="/" className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
          <SearchIcon className="w-5 h-5 text-white" />
        </div>
        <span className="text-2xl font-bold">
          <span className="text-gray-900">Job</span>
          <span className="text-indigo-600">Match</span>
        </span>
      </Link>

      <div className="w-full max-w-md">
        <h1 className={`text-3xl font-bold text-gray-900 text-center ${subtitle ? 'mb-2' : 'mb-8'}`}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-gray-500 text-sm text-center mb-8">{subtitle}</p>
        )}
        {children}
      </div>
    </div>
  )
}
