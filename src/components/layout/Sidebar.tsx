import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FolderKanban, CheckSquare, Clock,
  User, LogOut, Zap, ChevronRight,
} from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard'  },
  { to: '/projects',      icon: FolderKanban,    label: 'Projetos'   },
  { to: '/tasks',         icon: CheckSquare,     label: 'Tarefas'    },
  { to: '/time-tracking', icon: Clock,           label: 'Tempo'      },
  { to: '/profile',       icon: User,            label: 'Perfil'     },
]

export function Sidebar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Até logo!')
    navigate('/login')
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-card border-r border-border flex flex-col z-30">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
            <Zap className="w-4 h-4 text-black" strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-foreground tracking-tight">UpTask</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 group',
                isActive
                  ? 'bg-white/10 text-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-white' : 'text-muted-foreground group-hover:text-foreground')} />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="px-3 py-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors group">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
            {getInitials(user?.name ?? user?.email)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate">{user?.name ?? user?.email}</p>
            <p className="text-xs text-muted-foreground">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-400"
            title="Sair"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}
