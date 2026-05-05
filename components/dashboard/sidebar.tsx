"use client"

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { 
  Wallet, 
  LayoutDashboard, 
  PlusCircle, 
  History,
  Target,
  BarChart3,
  PiggyBank,
  LogOut 
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Perfil', icon: LayoutDashboard },
  { href: '/dashboard/transaccion', label: 'Transaccion', icon: PlusCircle },
  { href: '/dashboard/historial', label: 'Historial de Transaccion', icon: History },
  { href: '/dashboard/metas', label: 'Metas de Ahorro', icon: Target },
  { href: '/dashboard/reporte', label: 'Reporte Mensual', icon: BarChart3 },
  { href: '/dashboard/presupuesto', label: 'Presupuesto', icon: PiggyBank },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <aside className="flex flex-col h-screen w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="flex items-center gap-3 p-6 border-b border-sidebar-border">
        <div className="flex items-center justify-center size-10 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Wallet className="size-5" />
        </div>
        <span className="text-xl font-bold">Finanzas</span>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    isActive 
                      ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                      : "hover:bg-sidebar-accent/50"
                  )}
                >
                  <Icon className="size-5 shrink-0" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-4 py-2 mb-3">
          <div className="flex items-center justify-center size-8 rounded-full bg-sidebar-accent text-sidebar-accent-foreground font-semibold">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium truncate">{user?.name || 'Usuario'}</span>
            <span className="text-xs text-sidebar-foreground/60 truncate">{user?.email || ''}</span>
          </div>
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent/50"
          onClick={handleLogout}
        >
          <LogOut className="size-5" />
          Salir
        </Button>
      </div>
    </aside>
  )
}
