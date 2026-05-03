const stats = [
  { value: '50K+', label: 'Active Jobs' },
  { value: '120K+', label: 'Candidates' },
  { value: '8K+', label: 'Companies' },
  { value: '94%', label: 'Match Accuracy' },
]

export default function StatsSection() {
  return (
    <section className="bg-white py-16">
      <div className="max-w-4xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`text-center py-6 ${i < stats.length - 1 ? 'border-r border-gray-200' : ''}`}
            >
              <div className="text-3xl font-bold text-indigo-600 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
