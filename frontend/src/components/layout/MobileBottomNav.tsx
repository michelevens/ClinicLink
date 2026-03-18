import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Search, Clock, MessageSquare, Menu,
  Building2, Users, GraduationCap, ClipboardCheck, Handshake,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext.tsx'
import { useMessageUnreadCount } from '../../hooks/useApi.ts'
import type { UserRole } from '../../types/index.ts'

interface TabItem {
  label: string
  path: string
  icon: React.ReactNode
}

const TAB_CONFIGS: Record<UserRole, TabItem[]> = {
  student: [
    { label: 'Home', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Search', path: '/rotations', icon: <Search className="w-5 h-5" /> },
    { label: 'Hours', path: '/hours', icon: <Clock className="w-5 h-5" /> },
    { label: 'Messages', path: '/messages', icon: <MessageSquare className="w-5 h-5" /> },
  ],
  preceptor: [
    { label: 'Home', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Students', path: '/students', icon: <Users className="w-5 h-5" /> },
    { label: 'Hours', path: '/hours', icon: <Clock className="w-5 h-5" /> },
    { label: 'Messages', path: '/messages', icon: <MessageSquare className="w-5 h-5" /> },
  ],
  site_manager: [
    { label: 'Home', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Site', path: '/site', icon: <Building2 className="w-5 h-5" /> },
    { label: 'Apps', path: '/site-applications', icon: <ClipboardCheck className="w-5 h-5" /> },
    { label: 'Messages', path: '/messages', icon: <MessageSquare className="w-5 h-5" /> },
  ],
  coordinator: [
    { label: 'Home', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Students', path: '/students', icon: <Users className="w-5 h-5" /> },
    { label: 'Programs', path: '/programs', icon: <GraduationCap className="w-5 h-5" /> },
    { label: 'Messages', path: '/messages', icon: <MessageSquare className="w-5 h-5" /> },
  ],
  professor: [
    { label: 'Home', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Students', path: '/students', icon: <Users className="w-5 h-5" /> },
    { label: 'Placements', path: '/placements', icon: <GraduationCap className="w-5 h-5" /> },
    { label: 'Messages', path: '/messages', icon: <MessageSquare className="w-5 h-5" /> },
  ],
  practitioner: [
    { label: 'Home', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Collaborate', path: '/collaborate', icon: <Handshake className="w-5 h-5" /> },
    { label: 'Messages', path: '/messages', icon: <MessageSquare className="w-5 h-5" /> },
  ],
  admin: [
    { label: 'Home', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Users', path: '/admin/users', icon: <Users className="w-5 h-5" /> },
    { label: 'Sites', path: '/sites', icon: <Building2 className="w-5 h-5" /> },
    { label: 'Messages', path: '/messages', icon: <MessageSquare className="w-5 h-5" /> },
  ],
}

export function MobileBottomNav({ onMorePress }: { onMorePress: () => void }) {
  const { user } = useAuth()
  const { data: messageUnread } = useMessageUnreadCount()
  const unreadCount = messageUnread?.count ?? 0

  if (!user) return null

  const tabs = TAB_CONFIGS[user.role] ?? TAB_CONFIGS.student

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-lg border-t border-stone-200 dark:border-stone-700 safe-area-bottom">
      <div className="flex items-center justify-around h-14">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                isActive
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-stone-400 dark:text-stone-500'
              }`
            }
          >
            <div className="relative">
              {tab.icon}
              {tab.path === '/messages' && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-primary-600 text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-semibold leading-tight">{tab.label}</span>
          </NavLink>
        ))}
        {/* More tab — opens drawer */}
        <button
          onClick={onMorePress}
          className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-stone-400 dark:text-stone-500"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] font-semibold leading-tight">More</span>
        </button>
      </div>
    </nav>
  )
}
