import LandingNavbar from '../components/landing/LandingNavbar'
import LandingFooter from '../components/landing/LandingFooter'
import { Link } from 'react-router-dom'

const offerings = [
  {
    emoji: '👤',
    bg: 'bg-indigo-50',
    title: 'For Candidates',
    desc: 'Browse jobs, apply easily, and track all your applications from a single personal dashboard.',
  },
  {
    emoji: '🏢',
    bg: 'bg-purple-50',
    title: 'For Companies',
    desc: 'Post jobs, manage applicants, and streamline your entire recruitment workflow in one place.',
  },
  {
    emoji: '🎯',
    bg: 'bg-teal-50',
    title: 'Smart Matching',
    desc: 'Receive candidate-job compatibility insights as an additional support feature to guide better decisions.',
  },
]

const techStack = ['React', 'FastAPI', 'MySQL', 'Machine Learning']

export default function About() {
  return (
    <div className="min-h-screen font-sans antialiased">
      <LandingNavbar />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-white pt-20 pb-24">
        <div className="absolute -left-24 top-8 w-72 h-72 rounded-full bg-indigo-100 opacity-40" />
        <div className="absolute -right-20 top-16 w-80 h-80 rounded-full bg-purple-100 opacity-30" />

        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-indigo-100 rounded-full px-4 py-2 mb-8 shadow-sm">
            <span className="text-indigo-500 text-sm">ℹ️</span>
            <span className="text-sm text-gray-600 font-medium">About Us</span>
          </div>

          <h1 className="text-5xl font-extrabold text-gray-900 leading-tight mb-6">
            About <span className="text-indigo-600">JobMatch</span>
          </h1>

          <p className="text-lg text-gray-500 leading-relaxed">
            JobMatch is a digital recruitment platform designed to connect candidates with companies
            through a simple and efficient hiring experience.
          </p>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-start gap-12">
            <div className="shrink-0">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-3xl">
                🎯
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-5">Our Mission</h2>
              <p className="text-gray-500 text-lg leading-relaxed">
                Our goal is to simplify the recruitment process for both candidates and employers by
                providing a centralized platform for job discovery, application management, and hiring
                workflow. We believe finding a job — or the right hire — should be straightforward,
                transparent, and accessible to everyone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── What JobMatch Offers ── */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What JobMatch Offers</h2>
            <p className="text-gray-500 text-lg">Built for both sides of the hiring table.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {offerings.map(o => (
              <div key={o.title} className="bg-white rounded-2xl p-7 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 ${o.bg} rounded-xl flex items-center justify-center text-2xl mb-5`}>
                  {o.emoji}
                </div>
                <h3 className="font-bold text-gray-900 mb-3">{o.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{o.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-indigo-100 text-base mb-10">
            Join candidates and companies already using JobMatch.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition-colors">
              Find Jobs
            </Link>
            <Link to="/register" className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors">
              Post a Job
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
