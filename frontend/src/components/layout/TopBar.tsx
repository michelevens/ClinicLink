import { NavLink } from 'react-router-dom'
import { Settings, LogOut } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext.tsx'
import { NotificationBell } from './NotificationBell.tsx'
import type { UserRole } from '../../types/index.ts'

const roleLabels: Record<UserRole, string> = {
  student: 'Student',
  preceptor: 'Preceptor',
  site_manager: 'Site Manager',
  coordinator: 'Coordinator',
  professor: 'Professor',
  admin: 'Admin',
}

export function TopBar() {
  const { user, logout } = useAuth()

  if (!user) return null

  return (
    <div className="flex items-center justify-end gap-3 mb-4">
      {/* Notification Bell */}
      <NotificationBell />

      {/* Settings */}
      <NavLink
        to="/settings"
        className={({ isActive }) =>
          `p-2 rounded-lg transition-colors ${
            isActive
              ? 'text-primary-600 bg-primary-50'
              : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
          }`
        }
        title="Settings"
      >
        <Settings className="w-5 h-5" />
      </NavLink>

      {/* Divider */}
      <div className="w-px h-6 bg-stone-200" />

      {/* User Info */}
      <div className="flex items-center gap-2.5">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-stone-900 leading-tight">{user.firstName} {user.lastName}</p>
          <p className="text-xs text-stone-500">{roleLabels[user.role]}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm shrink-0">
          {user.firstName[0]}{user.lastName[0]}
        </div>
      </div>

      {/* Logout - mobile only (desktop has sidebar logout) */}
      <button
        onClick={logout}
        className="lg:hidden p-2 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
        title="Logout"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  )
}
