import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Search, FileText, Clock, ClipboardCheck,
  Building2, Users, CalendarDays, BookOpen, Settings,
  GraduationCap, Stethoscope, ChevronLeft, ChevronRight, LogOut
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext.tsx'
import type { UserRole } from '../../types/index.ts'

interface NavItem {
  label: string
  path: string
  icon: React.ReactNode
  roles: UserRole[]
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, roles: ['student', 'preceptor', 'site_manager', 'coordinator', 'professor', 'admin'] },
  { label: 'Search Rotations', path: '/rotations', icon: <Search className="w-5 h-5" />, roles: ['student'] },
  { label: 'My Applications', path: '/applications', icon: <FileText className="w-5 h-5" />, roles: ['student'] },
  { label: 'Hour Log', path: '/hours', icon: <Clock className="w-5 h-5" />, roles: ['student', 'preceptor'] },
  { label: 'Evaluations', path: '/evaluations', icon: <ClipboardCheck className="w-5 h-5" />, roles: ['student', 'preceptor'] },
  { label: 'My Site', path: '/site', icon: <Building2 className="w-5 h-5" />, roles: ['site_manager'] },
  { label: 'Rotation Slots', path: '/slots', icon: <CalendarDays className="w-5 h-5" />, roles: ['site_manager'] },
  { label: 'Applications', path: '/site-applications', icon: <FileText className="w-5 h-5" />, roles: ['site_manager'] },
  { label: 'My Students', path: '/students', icon: <Users className="w-5 h-5" />, roles: ['preceptor', 'coordinator', 'professor'] },
  { label: 'Programs', path: '/programs', icon: <BookOpen className="w-5 h-5" />, roles: ['coordinator'] },
  { label: 'Placements', path: '/placements', icon: <GraduationCap className="w-5 h-5" />, roles: ['coordinator', 'professor'] },
  { label: 'Sites Directory', path: '/sites', icon: <Stethoscope className="w-5 h-5" />, roles: ['coordinator', 'admin'] },
  { label: 'All Users', path: '/admin/users', icon: <Users className="w-5 h-5" />, roles: ['admin'] },
  { label: 'Settings', path: '/settings', icon: <Settings className="w-5 h-5" />, roles: ['student', 'preceptor', 'site_manager', 'coordinator', 'professor', 'admin'] },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()

  const filteredItems = NAV_ITEMS.filter(item => user && item.roles.includes(user.role))

  const roleLabels: Record<UserRole, string> = {
    student: 'Student',
    preceptor: 'Preceptor',
    site_manager: 'Site Manager',
    coordinator: 'Coordinator',
    professor: 'Professor',
    admin: 'Admin',
  }

  return (
    <aside className={`fixed left-0 top-0 h-screen bg-white border-r border-stone-200 flex flex-col transition-all duration-300 z-40 ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-stone-200">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              ClinicLink
            </span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center mx-auto">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
        )}
      </div>

      {/* User */}
      {!collapsed && user && (
        <div className="px-4 py-3 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-stone-900 truncate">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-stone-500">{roleLabels[user.role]}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {filteredItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive || location.pathname === item.path
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
              } ${collapsed ? 'justify-center' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            {item.icon}
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-stone-200 p-2 space-y-1">
        <button
          onClick={logout}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-600 hover:bg-red-50 hover:text-red-600 transition-all w-full ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Logout</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-1.5 text-stone-400 hover:text-stone-600 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  )
}
