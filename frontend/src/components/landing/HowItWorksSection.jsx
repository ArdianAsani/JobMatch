import { Link } from 'react-router-dom'
const steps = [
  {
    step: '1',
    emoji: '👤',
    title: 'Create Your Profile',
    desc: 'Sign up and build your profile with your skills, experience, and career preferences.',
  },
  {
    step: '2',
    emoji: '🔎',
    title: 'Explore Opportunities',
    desc: 'Browse thousands of job listings and use smart filters to find roles that fit your goals.',
  },
  {
    step: '3',
    emoji: '🚀',
    title: 'Apply and Track',
    desc: 'Apply in one click and track every application in your personal dashboard.',
  },
]

export default function HowItWorksSection() {
  return (
    <section className="bg-gray-50 py-20 border-t border-gray-100">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-gray-500 text-lg">Get matched with your ideal job in 3 simple steps.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map(s => (
            <div key={s.step} className="text-center">
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center text-3xl">
                  {s.emoji}
                </div>
                <div className="absolute -top-1 -right-1 w-7 h-7 bg-white border-2 border-indigo-600 rounded-full flex items-center justify-center text-xs font-bold text-indigo-600">
                  {s.step}
                </div>
              </div>
              <h3 className="font-bold text-gray-900 mb-3">{s.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-14">
          <Link to="/register" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
            Get Started Free
          </Link>
          <button className="border-2 border-indigo-600 text-indigo-600 px-8 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition-colors">
            Browse Jobs
          </button>
        </div>
      </div>
    </section>
  )
}
