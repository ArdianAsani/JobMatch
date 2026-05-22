import { Search, Menu } from 'lucide-react'

const CandidateTopbar = ({ candidateInfo, onNavigate, onMenuToggle }) => {
  const name = candidateInfo?.name || ''
  const initials = name
    ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : 'CA'

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 shrink-0">
      <button
        onClick={onMenuToggle}
        className="lg:hidden h-9 w-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition mr-2"
      >
        <Menu size={20} className="text-gray-500" />
      </button>

      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 w-72">
        <Search size={15} className="text-gray-400" />
        <input
          type="text"
          placeholder="Search jobs, companies..."
          className="bg-transparent text-sm text-gray-600 outline-none placeholder-gray-400 w-full"
        />
      </div>

      <button
        onClick={() => onNavigate('profile')}
        className="h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold hover:bg-indigo-700 transition"
      >
        {initials}
      </button>
    </header>
  )
}

export default CandidateTopbar
