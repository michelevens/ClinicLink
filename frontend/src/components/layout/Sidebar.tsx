import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Search, FileText, Clock, ClipboardCheck, ClipboardList,
  Building2, Users, CalendarDays, BookOpen, Handshake, ShieldCheck,
  GraduationCap, Stethoscope, LogOut, Menu, X, Award, UserCheck, BadgeCheck,
  BarChart3, FileBarChart, KeyRound, Map, ChevronDown, FolderOpen, ShieldAlert
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext.tsx'
import { useMyPendingSignatures } from '../../hooks/useApi.ts'
import { DesignToggle } from '../ui/DesignToggle.tsx'
import { ThemeToggle } from '../ui/ThemeToggle.tsx'
import type { UserRole } from '../../types/index.ts'

interface NavItem {
  label: string
  i18nKey?: string
  path: string
  icon: React.ReactNode
  roles: UserRole[]
  group?: string
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', i18nKey: 'nav.dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, roles: ['student', 'preceptor', 'site_manager', 'coordinator', 'professor', 'practitioner', 'admin'] },
  { label: 'Search Rotations', i18nKey: 'nav.searchRotations', path: '/rotations', icon: <Search className="w-5 h-5" />, roles: ['student'], group: 'Clinical' },
  { label: 'My Applications', i18nKey: 'nav.myApplications', path: '/applications', icon: <FileText className="w-5 h-5" />, roles: ['student'], group: 'Clinical' },
  { label: 'Hour Log', i18nKey: 'nav.hourLog', path: '/hours', icon: <Clock className="w-5 h-5" />, roles: ['student', 'preceptor'], group: 'Clinical' },
  { label: 'Evaluations', i18nKey: 'nav.evaluations', path: '/evaluations', icon: <ClipboardCheck className="w-5 h-5" />, roles: ['student', 'preceptor'], group: 'Clinical' },
  { label: 'Document Vault', i18nKey: 'nav.documentVault', path: '/documents', icon: <FolderOpen className="w-5 h-5" />, roles: ['student', 'preceptor', 'site_manager', 'coordinator', 'professor', 'practitioner', 'admin'], group: 'Credentials' },
  { label: 'Certificates', i18nKey: 'nav.certificates', path: '/certificates', icon: <Award className="w-5 h-5" />, roles: ['student', 'preceptor', 'coordinator', 'admin'], group: 'Credentials' },
  { label: 'CE Credits', i18nKey: 'nav.ceCredits', path: '/ce-credits', icon: <BadgeCheck className="w-5 h-5" />, roles: ['preceptor', 'coordinator', 'admin'], group: 'Credentials' },
  { label: 'Onboarding', i18nKey: 'nav.onboarding', path: '/onboarding-checklists', icon: <ClipboardList className="w-5 h-5" />, roles: ['student', 'site_manager'], group: 'Clinical' },
  { label: 'Agreements', i18nKey: 'nav.agreements', path: '/agreements', icon: <Handshake className="w-5 h-5" />, roles: ['coordinator', 'site_manager', 'admin'], group: 'Academic' },
  { label: 'Eval Templates', i18nKey: 'nav.evalTemplates', path: '/evaluation-templates', icon: <ClipboardCheck className="w-5 h-5" />, roles: ['coordinator', 'admin'], group: 'Credentials' },
  { label: 'Compliance', i18nKey: 'nav.compliance', path: '/compliance', icon: <ShieldCheck className="w-5 h-5" />, roles: ['student', 'site_manager', 'coordinator', 'professor', 'admin'], group: 'Credentials' },
  { label: 'Exclusion Screening', i18nKey: 'nav.exclusionScreening', path: '/exclusion-screening', icon: <ShieldAlert className="w-5 h-5" />, roles: ['admin', 'site_manager', 'coordinator'], group: 'Credentials' },
  { label: 'My Site', i18nKey: 'nav.mySite', path: '/site', icon: <Building2 className="w-5 h-5" />, roles: ['site_manager'], group: 'Sites' },
  { label: 'Rotation Slots', i18nKey: 'nav.rotationSlots', path: '/slots', icon: <CalendarDays className="w-5 h-5" />, roles: ['site_manager', 'admin'], group: 'Sites' },
  { label: 'Preceptors', i18nKey: 'nav.preceptors', path: '/preceptors', icon: <UserCheck className="w-5 h-5" />, roles: ['site_manager'], group: 'Sites' },
  { label: 'Applications', i18nKey: 'nav.applications', path: '/site-applications', icon: <FileText className="w-5 h-5" />, roles: ['site_manager', 'admin'], group: 'Sites' },
  { label: 'My Students', i18nKey: 'nav.myStudents', path: '/students', icon: <Users className="w-5 h-5" />, roles: ['preceptor', 'coordinator', 'professor'], group: 'Academic' },
  { label: 'My University', i18nKey: 'nav.myUniversity', path: '/programs', icon: <BookOpen className="w-5 h-5" />, roles: ['coordinator'], group: 'Academic' },
  { label: 'Placements', i18nKey: 'nav.placements', path: '/placements', icon: <GraduationCap className="w-5 h-5" />, roles: ['coordinator', 'professor'], group: 'Academic' },
  { label: 'Sites Directory', i18nKey: 'nav.sitesDirectory', path: '/sites', icon: <Stethoscope className="w-5 h-5" />, roles: ['coordinator', 'admin'], group: 'Sites' },
  { label: 'Sites Map', i18nKey: 'nav.sitesMap', path: '/sites-map', icon: <Map className="w-5 h-5" />, roles: ['coordinator', 'admin'], group: 'Sites' },
  { label: 'Universities', i18nKey: 'nav.universities', path: '/universities', icon: <BookOpen className="w-5 h-5" />, roles: ['admin'], group: 'Admin' },
  { label: 'All Users', i18nKey: 'nav.allUsers', path: '/admin/users', icon: <Users className="w-5 h-5" />, roles: ['admin'], group: 'Admin' },
  { label: 'License Codes', i18nKey: 'nav.licenseCodes', path: '/admin/license-codes', icon: <KeyRound className="w-5 h-5" />, roles: ['admin'], group: 'Admin' },
  { label: 'Analytics', i18nKey: 'nav.analytics', path: '/analytics', icon: <BarChart3 className="w-5 h-5" />, roles: ['coordinator', 'site_manager', 'admin'], group: 'Admin' },
  { label: 'Reports', i18nKey: 'nav.reports', path: '/accreditation-reports', icon: <FileBarChart className="w-5 h-5" />, roles: ['coordinator', 'admin'], group: 'Admin' },
  { label: 'Collaborate', i18nKey: 'nav.collaborate', path: '/collaborate', icon: <Handshake className="w-5 h-5" />, roles: ['practitioner', 'preceptor', 'admin'], group: 'Collaborate' },
  { label: 'Physician Directory', i18nKey: 'nav.physicianDirectory', path: '/collaborate/directory', icon: <Search className="w-5 h-5" />, roles: ['practitioner', 'preceptor', 'admin'], group: 'Collaborate' },
  { label: 'My Requests', i18nKey: 'nav.myRequests', path: '/collaborate/requests', icon: <FileText className="w-5 h-5" />, roles: ['practitioner'], group: 'Collaborate' },
  { label: 'Physician Profile', i18nKey: 'nav.physicianProfile', path: '/collaborate/profile', icon: <Stethoscope className="w-5 h-5" />, roles: ['preceptor'], group: 'Collaborate' },
  { label: 'Matches', i18nKey: 'nav.matches', path: '/collaborate/matches', icon: <Users className="w-5 h-5" />, roles: ['practitioner', 'preceptor', 'admin'], group: 'Collaborate' },
]

const GROUP_ORDER = ['Clinical', 'Credentials', 'Sites', 'Academic', 'Admin', 'Collaborate']

function SidebarSection({ label, items, location, pendingSigCount, collapsed, onToggle }: {
  label: string; items: NavItem[]; location: ReturnType<typeof useLocation>
  pendingSigCount: number; collapsed: boolean; onToggle: () => void
}) {
  const { t } = useTranslation()
  const hasActive = items.some(i => location.pathname === i.path)
  return (
    <div>
      <button
        onClick={onToggle}
        className={`flex items-center justify-between w-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors ${
          hasActive ? 'text-primary-600 dark:text-primary-400' : 'text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300'
        }`}
      >
        {label}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${collapsed ? '-rotate-90' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-200 ${collapsed ? 'max-h-0' : 'max-h-[500px]'}`}>
        <div className="mt-0.5 space-y-0.5">
          {items.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive || location.pathname === item.path
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-700/50 dark:hover:text-stone-200'
                }`
              }
            >
              {item.icon}
              <span className="flex-1">{item.i18nKey ? t(item.i18nKey) : item.label}</span>
              {item.path === '/agreements' && pendingSigCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">
                  {pendingSigCount > 9 ? '9+' : pendingSigCount}
                </span>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  )
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({})
  const { user, logout } = useAuth()
  const location = useLocation()
  const { t } = useTranslation()

  const toggleSection = (group: string) => {
    setCollapsedSections(prev => ({ ...prev, [group]: !prev[group] }))
  }

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

  const { data: pendingSigs } = useMyPendingSignatures()
  const pendingSigCount = pendingSigs?.data?.length ?? 0

  // Filter nav items by role, with special handling for Collaborate (preceptors need physician_profile)
  const filteredItems = NAV_ITEMS.filter(item => {
    if (!user) return false
    if (!item.roles.includes(user.role)) return false

    // Collaborate module: preceptors must have physician_profile (MD/DO only)
    if (item.group === 'Collaborate' && user.role === 'preceptor') {
      return !!user.physicianProfile
    }

    return true
  })

  const ungrouped = filteredItems.filter(i => !i.group)
  const groups = GROUP_ORDER
    .map(g => ({ label: g, items: filteredItems.filter(i => i.group === g) }))
    .filter(g => g.items.length > 0)

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-stone-200 dark:border-stone-700">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            ClinicLink
          </span>
          <DesignToggle />
          <ThemeToggle />
        </div>
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-3">
        {/* Ungrouped items (Dashboard) */}
        <div className="space-y-0.5">
          {ungrouped.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive || location.pathname === item.path
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-700/50 dark:hover:text-stone-200'
                }`
              }
            >
              {item.icon}
              <span className="flex-1">{item.i18nKey ? t(item.i18nKey) : item.label}</span>
            </NavLink>
          ))}
        </div>

        {/* Grouped sections */}
        {groups.map(g => (
          <SidebarSection
            key={g.label}
            label={g.label}
            items={g.items}
            location={location}
            pendingSigCount={pendingSigCount}
            collapsed={!!collapsedSections[g.label]}
            onToggle={() => toggleSection(g.label)}
          />
        ))}
      </nav>

      {/* Bottom - pinned below scroll */}
      <div className="border-t border-stone-200 dark:border-stone-700 p-2 shrink-0">
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
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between px-4 z-30">
        <div className="flex items-center">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
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
        className={`lg:hidden fixed left-0 top-0 h-screen w-72 bg-white dark:bg-stone-900 flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-700 flex-col z-40">
        {sidebarContent}
      </aside>
    </>
  )
}
