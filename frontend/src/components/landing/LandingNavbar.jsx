import { Link } from 'react-router-dom'

function SearchIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
}

export function Logo({ light }) {
  return (
    <Link to="/" className="flex items-center gap-2">
      <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center">
        <SearchIcon className="w-5 h-5 text-white" />
      </div>
      <span className="text-xl font-bold">
        <span className={light ? 'text-white' : 'text-gray-900'}>Job</span>
        <span className={light ? 'text-indigo-300' : 'text-indigo-600'}>Match</span>
      </span>
    </Link>
  )
}

const navLinks = [
  { label: 'Find Jobs', to: '#' },
  { label: 'Post a Job', to: '#' },
  { label: 'About', to: '/about' },
]

export default function LandingNavbar() {
  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Logo />

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(({ label, to }) => (
            <Link key={label} to={to} className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors">
              {label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors">
            Sign In
          </Link>
          <Link to="/register" className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors">
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  )
}
