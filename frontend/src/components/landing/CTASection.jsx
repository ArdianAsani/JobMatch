export default function CTASection() {
  return (
    <section className="bg-gradient-to-r from-indigo-600 to-purple-600 py-20">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold text-white mb-4">
          Start Your Recruitment Journey with JobMatch
        </h2>
        <p className="text-indigo-100 text-lg mb-10">
          A simple platform for candidates to apply and companies to manage hiring.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition-colors">
            Get Started Free
          </button>
          <button className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors">
            Post a Job
          </button>
        </div>
      </div>
    </section>
  )
}
