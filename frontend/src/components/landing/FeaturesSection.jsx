const features = [
  {
    emoji: '🔍',
    bg: 'bg-indigo-50',
    title: 'Smart Job Search',
    desc: 'Advanced filters and keyword search help you find exactly the roles that match your skills and preferences.',
  },
  {
    emoji: '📋',
    bg: 'bg-teal-50',
    title: 'Easy Applications',
    desc: 'One-click apply with your saved profile. Track every application status in your personal dashboard.',
  },
  {
    emoji: '🏢',
    bg: 'bg-purple-50',
    title: 'Employer Dashboard',
    desc: 'Powerful tools for companies to post jobs, manage applicants, and find the best candidates faster.',
  },
  {
    emoji: '🔔',
    bg: 'bg-amber-50',
    title: 'Real-Time Notifications',
    desc: 'Instant alerts for application updates, interview requests, and new job openings — never miss an opportunity.',
  },
]

export default function FeaturesSection() {
  return (
    <section className="bg-gray-50 py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Why JobMatch?</h2>
          <p className="text-gray-500 text-lg">Everything you need to find your perfect role or hire the best talent.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(f => (
            <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center text-2xl mb-5`}>
                {f.emoji}
              </div>
              <h3 className="font-bold text-gray-900 mb-3 text-sm">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Secondary feature */}
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-indigo-50 flex items-center gap-5 max-w-xl mx-auto">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-2xl shrink-0">
            🎯
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-1 text-sm">Candidate–Job Match Indicator</h3>
            <p className="text-sm text-gray-500">
              See how well your profile aligns with each job before you apply.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
