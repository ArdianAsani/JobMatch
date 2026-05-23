import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function SearchIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
}

export default function HeroSection() {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const navigate = useNavigate()

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    if (location.trim()) params.set('location', location.trim())
    navigate(`/find-jobs${params.toString() ? `?${params}` : ''}`)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-white pt-20 pb-28">
      <div className="absolute -left-24 top-8 w-72 h-72 rounded-full bg-indigo-100 opacity-50" />
      <div className="absolute -right-20 top-16 w-96 h-96 rounded-full bg-purple-100 opacity-40" />
      <div className="absolute right-1/3 bottom-0 w-52 h-52 rounded-full bg-indigo-100 opacity-30" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white border border-indigo-100 rounded-full px-4 py-2 mb-8 shadow-sm">
          <span className="text-orange-500 text-sm">⚡</span>
          <span className="text-sm text-gray-600 font-medium">
            Digital Recruitment Platform for Candidates and Companies
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
          Find the Right Job.{' '}
          <span className="text-indigo-600">Connect with the Right Company.</span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          JobMatch helps candidates discover opportunities, apply easily, and track applications
          while companies manage recruitment from one unified platform.
        </p>

        {/* Search bar */}
        <div className="bg-white rounded-2xl shadow-lg p-2 flex flex-col md:flex-row gap-2 max-w-3xl mx-auto mb-6">
          <div className="flex items-center gap-3 flex-1 px-4 py-1">
            <SearchIcon className="w-5 h-5 text-indigo-400 shrink-0" />
            <input
              type="text"
              placeholder="Job title, keywords, or company"
              className="flex-1 outline-none text-gray-600 text-sm placeholder-gray-400 py-2"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKey}
            />
          </div>
          <div className="hidden md:block w-px bg-gray-200 my-2" />
          <div className="flex items-center gap-3 px-4 md:w-44 py-1">
            <span className="text-red-400 text-base shrink-0">📍</span>
            <input
              type="text"
              placeholder="Location"
              className="flex-1 outline-none text-gray-600 text-sm placeholder-gray-400 py-2 w-full"
              value={location}
              onChange={e => setLocation(e.target.value)}
              onKeyDown={handleKey}
            />
          </div>
          <button
            onClick={handleSearch}
            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors whitespace-nowrap"
          >
            Search Jobs
          </button>
        </div>
      </div>
    </section>
  )
}
