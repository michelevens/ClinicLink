import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Search, FileText, Clock, ClipboardCheck, ClipboardList,
  Building2, Users, CalendarDays, BookOpen, Settings, Handshake, ShieldCheck,
  GraduationCap, Stethoscope, LogOut, Menu, X, Award, UserCheck, BadgeCheck,
  MessageSquare, Calendar, BarChart3, FileBarChart, UserSearch,
  Bell, Command,
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext.tsx'
import { useMessageUnreadCount, useMyPendingSignatures } from '../../hooks/useApi.ts'
import type { UserRole } from '../../types/index.ts'

interface NavItem {
  label: string
  path: string
  icon: React.ReactNode
  roles: UserRole[]
  group: 'main' | 'manage' | 'tools' | 'admin'
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" />, roles: ['student', 'preceptor', 'site_manager', 'coordinator', 'professor', 'admin'], group: 'main' },
  { label: 'Search Rotations', path: '/rotations', icon: <Search className="w-4 h-4" />, roles: ['student'], group: 'main' },
  { label: 'My Applications', path: '/applications', icon: <FileText className="w-4 h-4" />, roles: ['student'], group: 'main' },
  { label: 'Hour Log', path: '/hours', icon: <Clock className="w-4 h-4" />, roles: ['student', 'preceptor'], group: 'main' },
  { label: 'Evaluations', path: '/evaluations', icon: <ClipboardCheck className="w-4 h-4" />, roles: ['student', 'preceptor'], group: 'main' },
  { label: 'Certificates', path: '/certificates', icon: <Award className="w-4 h-4" />, roles: ['student', 'preceptor', 'coordinator', 'admin'], group: 'tools' },
  { label: 'CE Credits', path: '/ce-credits', icon: <BadgeCheck className="w-4 h-4" />, roles: ['preceptor', 'coordinator', 'admin'], group: 'tools' },
  { label: 'Onboarding', path: '/onboarding-checklists', icon: <ClipboardList className="w-4 h-4" />, roles: ['student', 'site_manager'], group: 'tools' },
  { label: 'Agreements', path: '/agreements', icon: <Handshake className="w-4 h-4" />, roles: ['coordinator', 'site_manager', 'admin'], group: 'manage' },
  { label: 'Eval Templates', path: '/evaluation-templates', icon: <ClipboardCheck className="w-4 h-4" />, roles: ['coordinator', 'admin'], group: 'manage' },
  { label: 'Messages', path: '/messages', icon: <MessageSquare className="w-4 h-4" />, roles: ['student', 'preceptor', 'site_manager', 'coordinator', 'professor', 'admin'], group: 'tools' },
  { label: 'Calendar', path: '/calendar', icon: <Calendar className="w-4 h-4" />, roles: ['student', 'preceptor', 'site_manager', 'coordinator', 'professor', 'admin'], group: 'tools' },
  { label: 'Compliance', path: '/compliance', icon: <ShieldCheck className="w-4 h-4" />, roles: ['student', 'site_manager', 'coordinator', 'professor', 'admin'], group: 'tools' },
  { label: 'My Site', path: '/site', icon: <Building2 className="w-4 h-4" />, roles: ['site_manager'], group: 'manage' },
  { label: 'Rotation Slots', path: '/slots', icon: <CalendarDays className="w-4 h-4" />, roles: ['site_manager', 'admin'], group: 'manage' },
  { label: 'Preceptors', path: '/preceptors', icon: <UserCheck className="w-4 h-4" />, roles: ['site_manager'], group: 'manage' },
  { label: 'Applications', path: '/site-applications', icon: <FileText className="w-4 h-4" />, roles: ['site_manager', 'admin'], group: 'manage' },
  { label: 'My Students', path: '/students', icon: <Users className="w-4 h-4" />, roles: ['preceptor', 'coordinator', 'professor'], group: 'main' },
  { label: 'My University', path: '/programs', icon: <BookOpen className="w-4 h-4" />, roles: ['coordinator'], group: 'manage' },
  { label: 'Placements', path: '/placements', icon: <GraduationCap className="w-4 h-4" />, roles: ['coordinator', 'professor'], group: 'main' },
  { label: 'Sites Directory', path: '/sites', icon: <Stethoscope className="w-4 h-4" />, roles: ['coordinator', 'admin'], group: 'manage' },
  { label: 'Universities', path: '/universities', icon: <BookOpen className="w-4 h-4" />, roles: ['admin'], group: 'admin' },
  { label: 'All Users', path: '/admin/users', icon: <Users className="w-4 h-4" />, roles: ['admin'], group: 'admin' },
  { label: 'Preceptor Directory', path: '/preceptor-directory', icon: <UserSearch className="w-4 h-4" />, roles: ['student', 'preceptor', 'site_manager', 'coordinator', 'admin'], group: 'tools' },
  { label: 'Analytics', path: '/analytics', icon: <BarChart3 className="w-4 h-4" />, roles: ['coordinator', 'site_manager', 'admin'], group: 'admin' },
  { label: 'Reports', path: '/accreditation-reports', icon: <FileBarChart className="w-4 h-4" />, roles: ['coordinator', 'admin'], group: 'admin' },
  { label: 'Settings', path: '/settings', icon: <Settings className="w-4 h-4" />, roles: ['student', 'preceptor', 'site_manager', 'coordinator', 'professor', 'admin'], group: 'tools' },
]

const GROUP_LABELS: Record<string, string> = {
  main: 'Main',
  manage: 'Manage',
  tools: 'Tools',
  admin: 'Admin',
}

export function TopNavV2() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const [commandQuery, setCommandQuery] = useState('')
  const { user, logout } = useAuth()
  const location = useLocation()
  const commandRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMobileOpen(false)
    setCommandOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  useEffect(() => {
    if (commandOpen) {
      setTimeout(() => commandRef.current?.focus(), 50)
    }
  }, [commandOpen])

  // Keyboard shortcut: Ctrl+K to open command palette
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandOpen(prev => !prev)
        setCommandQuery('')
      }
      if (e.key === 'Escape') setCommandOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const { data: messageUnread } = useMessageUnreadCount()
  const { data: pendingSigs } = useMyPendingSignatures()
  const pendingSigCount = pendingSigs?.data?.length ?? 0
  const unreadCount = messageUnread?.count ?? 0

  const filteredItems = NAV_ITEMS.filter(item => user && item.roles.includes(user.role))

  const commandFiltered = commandQuery
    ? filteredItems.filter(i => i.label.toLowerCase().includes(commandQuery.toLowerCase()))
    : filteredItems

  const groups = Object.entries(GROUP_LABELS)
    .map(([key, label]) => ({
      key,
      label,
      items: commandFiltered.filter(i => i.group === key),
    }))
    .filter(g => g.items.length > 0)

  // Top-level nav: show first 5 items from "main" group
  const topItems = filteredItems.filter(i => i.group === 'main').slice(0, 5)

  const roleLabels: Record<UserRole, string> = {
    student: 'Student',
    preceptor: 'Preceptor',
    site_manager: 'Site Manager',
    coordinator: 'Coordinator',
    professor: 'Professor',
    admin: 'Admin',
  }

  return (
    <>
      {/* Desktop Top Navigation */}
      <header className="hidden lg:flex fixed top-0 left-0 right-0 h-14 bg-slate-900 border-b border-slate-700/50 items-center justify-between px-6 z-40">
        {/* Left: Logo + Primary Nav */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base text-white tracking-tight">
              ClinicLink
            </span>
          </div>

          <nav className="flex items-center gap-1">
            {topItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Center: Command Palette Trigger */}
        <button
          onClick={() => { setCommandOpen(true); setCommandQuery('') }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-300 hover:border-slate-600 transition-all text-xs min-w-[220px]"
        >
          <Command className="w-3.5 h-3.5" />
          <span className="flex-1 text-left">Navigate...</span>
          <kbd className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded font-mono">Ctrl+K</kbd>
        </button>

        {/* Right: Notifications + User */}
        <div className="flex items-center gap-3">
          <NavLink
            to="/messages"
            className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </NavLink>

          <button className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <Bell className="w-4 h-4" />
            {pendingSigCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                {pendingSigCount > 9 ? '9+' : pendingSigCount}
              </span>
            )}
          </button>

          <div className="w-px h-6 bg-slate-700" />

          {user && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-white font-semibold text-[10px]">
                {user.firstName[0]}{user.lastName[0]}
              </div>
              <div className="hidden xl:block">
                <p className="text-xs font-medium text-white leading-none">{user.firstName} {user.lastName}</p>
                <p className="text-[10px] text-slate-500">{roleLabels[user.role]}</p>
              </div>
            </div>
          )}

          <button
            onClick={logout}
            className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-slate-900 border-b border-slate-700/50 flex items-center justify-between px-4 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 rounded-lg text-slate-400 hover:bg-white/5 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
              <Stethoscope className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-sm text-white">ClinicLink</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <NavLink to="/messages" className="relative p-2 rounded-lg text-slate-400 hover:text-white">
            <MessageSquare className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </NavLink>
          <button onClick={logout} className="p-2 rounded-lg text-slate-500 hover:text-red-400">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Overlay + Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setMobileOpen(false)} />
      )}
      <aside className={`lg:hidden fixed left-0 top-0 h-screen w-72 bg-slate-900 flex flex-col z-50 transform transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-14 flex items-center justify-between px-4 border-b border-slate-700/50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base text-white">ClinicLink</span>
          </div>
          <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg text-slate-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        {user && (
          <div className="px-4 py-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-white font-semibold text-xs">
                {user.firstName[0]}{user.lastName[0]}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-slate-500">{roleLabels[user.role]}</p>
              </div>
            </div>
          </div>
        )}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {filteredItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-800 p-2">
          <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 w-full">
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Command Palette */}
      {commandOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]" onClick={() => setCommandOpen(false)} />
          <div className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-lg z-[101]">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800">
                <Command className="w-4 h-4 text-slate-500" />
                <input
                  ref={commandRef}
                  type="text"
                  placeholder="Type to navigate..."
                  value={commandQuery}
                  onChange={e => setCommandQuery(e.target.value)}
                  className="flex-1 bg-transparent text-white text-sm placeholder-slate-500 outline-none"
                />
                <kbd className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded font-mono">ESC</kbd>
              </div>
              <div className="max-h-80 overflow-y-auto py-2">
                {groups.map(group => (
                  <div key={group.key}>
                    <p className="px-4 py-1.5 text-[10px] font-semibold text-slate-600 uppercase tracking-wider">{group.label}</p>
                    {group.items.map(item => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setCommandOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-2 text-sm transition-all ${
                            isActive ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                          }`
                        }
                      >
                        {item.icon}
                        <span>{item.label}</span>
                        {item.path === '/messages' && unreadCount > 0 && (
                          <span className="ml-auto w-5 h-5 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>
                        )}
                      </NavLink>
                    ))}
                  </div>
                ))}
                {commandFiltered.length === 0 && (
                  <p className="px-4 py-6 text-sm text-slate-600 text-center">No matching pages found.</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
