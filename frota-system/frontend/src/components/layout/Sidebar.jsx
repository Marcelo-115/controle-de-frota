import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Wrench, Droplets, Settings, Users,
  FileText, UserCog, LogOut, Truck,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', perfis: ['admin', 'mecanico', 'gerente', 'diretoria'] },
  { path: '/maquinas', icon: Truck, label: 'Máquinas', perfis: ['admin', 'mecanico', 'gerente', 'diretoria'] },
  { path: '/abastecimentos', icon: Droplets, label: 'Abastecimentos', perfis: ['admin', 'mecanico', 'gerente'] },
  { path: '/manutencoes', icon: Settings, label: 'Manutenções', perfis: ['admin', 'mecanico', 'gerente'] },
  { path: '/operadores', icon: Users, label: 'Operadores', perfis: ['admin', 'gerente'] },
  { path: '/relatorios', icon: FileText, label: 'Relatórios', perfis: ['admin', 'gerente', 'diretoria'] },
  { path: '/usuarios', icon: UserCog, label: 'Usuários', perfis: ['admin'] },
]

export default function Sidebar() {
  const { user, logout } = useAuth()

  return (
    <aside className="w-60 min-h-screen bg-[#1e3a5f] text-white flex flex-col">
      <div className="px-5 py-6 border-b border-blue-800">
        <div className="flex items-center gap-2">
          <Wrench size={22} className="text-blue-300" />
          <span className="text-lg font-bold">Gestão de Frota</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {menuItems
          .filter((item) => item.perfis.includes(user?.perfil))
          .map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-700 text-white font-medium'
                    : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
      </nav>

      <div className="px-3 pb-4 border-t border-blue-800 pt-4">
        <div className="px-3 py-2 mb-2">
          <p className="text-xs text-blue-400">Logado como</p>
          <p className="text-sm font-medium text-white truncate">{user?.nome}</p>
          <p className="text-xs text-blue-400 capitalize">{user?.perfil}</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-blue-200 hover:bg-blue-800 hover:text-white rounded-lg transition-colors"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </aside>
  )
}
