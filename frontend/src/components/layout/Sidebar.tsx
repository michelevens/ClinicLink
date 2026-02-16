import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Search, FileText, Clock, ClipboardCheck, ClipboardList,
  Building2, Users, CalendarDays, BookOpen, Handshake, ShieldCheck,
  GraduationCap, Stethoscope, LogOut, Menu, X, Award, UserCheck, BadgeCheck,
  MessageSquare, Calendar, BarChart3, FileBarChart, UserSearch, KeyRound
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext.tsx'
import { useMessageUnreadCount, useMyPendingSignatures } from '../../hooks/useApi.ts'
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
  { label: 'Certificates', path: '/certificates', icon: <Award className="w-5 h-5" />, roles: ['student', 'preceptor', 'coordinator', 'admin'] },
  { label: 'CE Credits', path: '/ce-credits', icon: <BadgeCheck className="w-5 h-5" />, roles: ['preceptor', 'coordinator', 'admin'] },
  { label: 'Onboarding', path: '/onboarding-checklists', icon: <ClipboardList className="w-5 h-5" />, roles: ['student', 'site_manager'] },
  { label: 'Agreements', path: '/agreements', icon: <Handshake className="w-5 h-5" />, roles: ['coordinator', 'site_manager', 'admin'] },
  { label: 'Eval Templates', path: '/evaluation-templates', icon: <ClipboardCheck className="w-5 h-5" />, roles: ['coordinator', 'admin'] },
  { label: 'Messages', path: '/messages', icon: <MessageSquare className="w-5 h-5" />, roles: ['student', 'preceptor', 'site_manager', 'coordinator', 'professor', 'admin'] },
  { label: 'Calendar', path: '/calendar', icon: <Calendar className="w-5 h-5" />, roles: ['student', 'preceptor', 'site_manager', 'coordinator', 'professor', 'admin'] },
  { label: 'Compliance', path: '/compliance', icon: <ShieldCheck className="w-5 h-5" />, roles: ['student', 'site_manager', 'coordinator', 'professor', 'admin'] },
  { label: 'My Site', path: '/site', icon: <Building2 className="w-5 h-5" />, roles: ['site_manager'] },
  { label: 'Rotation Slots', path: '/slots', icon: <CalendarDays className="w-5 h-5" />, roles: ['site_manager', 'admin'] },
  { label: 'Preceptors', path: '/preceptors', icon: <UserCheck className="w-5 h-5" />, roles: ['site_manager'] },
  { label: 'Applications', path: '/site-applications', icon: <FileText className="w-5 h-5" />, roles: ['site_manager', 'admin'] },
  { label: 'My Students', path: '/students', icon: <Users className="w-5 h-5" />, roles: ['preceptor', 'coordinator', 'professor'] },
  { label: 'My University', path: '/programs', icon: <BookOpen className="w-5 h-5" />, roles: ['coordinator'] },
  { label: 'Placements', path: '/placements', icon: <GraduationCap className="w-5 h-5" />, roles: ['coordinator', 'professor'] },
  { label: 'Sites Directory', path: '/sites', icon: <Stethoscope className="w-5 h-5" />, roles: ['coordinator', 'admin'] },
  { label: 'Universities', path: '/universities', icon: <BookOpen className="w-5 h-5" />, roles: ['admin'] },
  { label: 'All Users', path: '/admin/users', icon: <Users className="w-5 h-5" />, roles: ['admin'] },
  { label: 'License Codes', path: '/admin/license-codes', icon: <KeyRound className="w-5 h-5" />, roles: ['admin'] },
  { label: 'Preceptor Directory', path: '/preceptor-directory', icon: <UserSearch className="w-5 h-5" />, roles: ['student', 'preceptor', 'site_manager', 'coordinator', 'admin'] },
  { label: 'Analytics', path: '/analytics', icon: <BarChart3 className="w-5 h-5" />, roles: ['coordinator', 'site_manager', 'admin'] },
  { label: 'Reports', path: '/accreditation-reports', icon: <FileBarChart className="w-5 h-5" />, roles: ['coordinator', 'admin'] },
]

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const { data: messageUnread } = useMessageUnreadCount()
  const { data: pendingSigs } = useMyPendingSignatures()
  const pendingSigCount = pendingSigs?.data?.length ?? 0
  const filteredItems = NAV_ITEMS.filter(item => user && item.roles.includes(user.role))

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-stone-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            ClinicLink
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {filteredItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-lg font-medium transition-all duration-200 ${
                isActive || location.pathname === item.path
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
              }`
            }
          >
            {item.icon}
            <span className="flex-1">{item.label}</span>
            {item.path === '/messages' && (messageUnread?.count ?? 0) > 0 && (
              <span className="w-5 h-5 rounded-full bg-primary-600 text-white text-xs font-bold flex items-center justify-center">
                {messageUnread!.count > 9 ? '9+' : messageUnread!.count}
              </span>
            )}
            {item.path === '/agreements' && pendingSigCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center" title="Pending signatures">
                {pendingSigCount > 9 ? '9+' : pendingSigCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom - pinned below scroll */}
      <div className="border-t border-stone-200 p-2 shrink-0">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-lg font-medium text-red-500 hover:bg-red-50 hover:text-red-700 transition-all w-full"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile top bar — only logo + hamburger, user info moved to TopBar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-stone-200 flex items-center justify-between px-4 z-30">
        <div className="flex items-center">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2 ml-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              ClinicLink
            </span>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`lg:hidden fixed left-0 top-0 h-screen w-72 bg-white flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-white border-r border-stone-200 flex-col z-40">
        {sidebarContent}
      </aside>
    </>
  )
}
