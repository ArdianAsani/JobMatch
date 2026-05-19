import { Logo } from './LandingNavbar'

const socialLinks = ['Twitter', 'LinkedIn', 'GitHub', 'Instagram']

export default function LandingFooter() {
  return (
    <footer className="bg-gray-900 pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {/* Brand */}
          <div>
            <Logo light />
            <p className="text-gray-400 text-sm leading-relaxed mt-4 max-w-sm">
              JobMatch is a digital recruitment platform that helps candidates find opportunities and companies manage hiring in one place.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-white text-xs font-bold tracking-widest mb-4">
              PLATFORM
            </h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 text-sm hover:text-white transition-colors">Find Jobs</a></li>
              <li><a href="#" className="text-gray-400 text-sm hover:text-white transition-colors">Post a Job</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white text-xs font-bold tracking-widest mb-4">
              CONTACT
            </h4>
            <ul className="space-y-3">
              <li><a href="/about" className="text-gray-400 text-sm hover:text-white transition-colors">About JobMatch</a></li>
              <li className="text-gray-400 text-sm">+383 44 123 456</li>
              <li className="text-gray-400 text-sm">contact@jobmatch.com</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © 2026 JobMatch. All rights reserved.
          </p>

          <div className="flex gap-6">
            {socialLinks.map((s) => (
              <a
                key={s}
                href="#"
                className="text-gray-500 text-sm hover:text-white transition-colors"
              >
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}