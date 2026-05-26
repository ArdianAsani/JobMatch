import { Menu } from 'lucide-react'

const CompanyTopbar = ({ companyInfo, onNavigate, onMenuToggle }) => {
  const initials = companyInfo?.name
    ? companyInfo.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : 'CO'

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 shrink-0">
      <button onClick={onMenuToggle} className="lg:hidden h-9 w-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition mr-2">
        <Menu size={20} className="text-gray-500" />
      </button>

      <button
        onClick={() => onNavigate('profile')}
        className="h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold hover:bg-indigo-700 transition"
      >
        {initials}
      </button>
    </header>
  )
}

export default CompanyTopbar
