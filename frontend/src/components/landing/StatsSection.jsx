const pillars = [
  { value: 'AI-Powered', label: 'Semantic Matching' },
  { value: 'Secure', label: 'Candidate Profiles' },
  { value: 'Smart', label: 'Recruitment Platform' },
  { value: 'Precise', label: 'Job Discovery' },
]

export default function StatsSection() {
  return (
    <section className="bg-white py-16">
      <div className="max-w-4xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {pillars.map((pillar, i) => (
            <div
              key={pillar.label}
              className={`text-center py-6 ${i < pillars.length - 1 ? 'border-r border-gray-200' : ''}`}
            >
              <div className="text-xl font-bold text-indigo-600 mb-1">{pillar.value}</div>
              <div className="text-sm text-gray-500">{pillar.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
