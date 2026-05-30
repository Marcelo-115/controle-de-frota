import { Bell } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Header({ title }) {
  const { user } = useAuth()

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6">
      <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Bell size={18} className="text-gray-600" />
        </button>
        <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center text-white text-sm font-medium">
          {user?.nome?.charAt(0)?.toUpperCase()}
        </div>
      </div>
    </header>
  )
}
