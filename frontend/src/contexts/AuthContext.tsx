import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { User, UserRole } from '../types/index.ts'
import { api, authApi, type ApiUser } from '../services/api.ts'
import { toast } from 'sonner'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  mfaPending: boolean
  mfaToken: string | null
  isDemo: boolean
}

interface AuthContextType extends AuthState {
  login: (loginId: string, password: string) => Promise<void>
  loginFromSession: () => Promise<void>
  verifyMfa: (code: string) => Promise<void>
  cancelMfa: () => void
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  demoLogin: (role: UserRole) => void
  completeOnboarding: (data: Record<string, unknown>) => Promise<void>
}

interface RegisterData {
  email: string
  username?: string
  password: string
  firstName: string
  lastName: string
  role: UserRole
  universityId?: string
  programId?: string
  siteId?: string
  licenseCode?: string
  npiNumber?: string
}

const AuthContext = createContext<AuthContextType | null>(null)

function mapApiUser(u: ApiUser): User {
  return {
    id: u.id,
    email: u.email,
    username: u.username || undefined,
    firstName: u.first_name,
    lastName: u.last_name,
    role: u.role as UserRole,
    phone: u.phone || undefined,
    avatar: u.avatar_url || undefined,
    createdAt: u.created_at,
    is_demo: u.is_demo || false,
    onboardingCompleted: u.onboarding_completed ?? false,
    universityId: u.student_profile?.university_id || undefined,
    programId: u.student_profile?.program_id || undefined,
    preceptorProfile: u.preceptor_profile ? {
      id: u.preceptor_profile.id,
      npi_number: u.preceptor_profile.npi_number || undefined,
      npi_verified_at: u.preceptor_profile.npi_verified_at || undefined,
      specialties: u.preceptor_profile.specialties,
    } : undefined,
    physicianProfile: u.physician_profile ? {
      id: u.physician_profile.id,
      licensed_states: u.physician_profile.licensed_states,
      specialties: u.physician_profile.specialties,
      stripe_connect_status: u.physician_profile.stripe_connect_status || undefined,
    } : undefined,
    practitionerProfile: u.practitioner_profile ? {
      id: u.practitioner_profile.id,
      profession_type: u.practitioner_profile.profession_type,
      licensed_states: u.practitioner_profile.licensed_states,
    } : undefined,
  }
}

const DEMO_USERS: Record<UserRole, User> = {
  student: { id: 'demo-student-1', email: 'student@cliniclink.health', firstName: 'Sarah', lastName: 'Chen', role: 'student', createdAt: new Date().toISOString(), onboardingCompleted: true },
  preceptor: { id: 'demo-preceptor-1', email: 'preceptor@cliniclink.health', firstName: 'Dr. James', lastName: 'Wilson', role: 'preceptor', createdAt: new Date().toISOString(), onboardingCompleted: true },
  site_manager: { id: 'demo-site-1', email: 'site@cliniclink.health', firstName: 'Maria', lastName: 'Garcia', role: 'site_manager', createdAt: new Date().toISOString(), onboardingCompleted: true },
  coordinator: { id: 'demo-coord-1', email: 'coordinator@cliniclink.health', firstName: 'Dr. Lisa', lastName: 'Thompson', role: 'coordinator', createdAt: new Date().toISOString(), onboardingCompleted: true },
  professor: { id: 'demo-prof-1', email: 'professor@cliniclink.health', firstName: 'Prof. Robert', lastName: 'Martinez', role: 'professor', createdAt: new Date().toISOString(), onboardingCompleted: true },
  admin: { id: 'demo-admin-1', email: 'admin@cliniclink.health', firstName: 'Admin', lastName: 'User', role: 'admin', createdAt: new Date().toISOString(), onboardingCompleted: true },
  practitioner: { id: 'demo-practitioner-1', email: 'practitioner@cliniclink.health', firstName: 'Emily', lastName: 'Reyes', role: 'practitioner', createdAt: new Date().toISOString(), onboardingCompleted: true },
}

const DEFAULT_STATE: AuthState = { user: null, isAuthenticated: false, isLoading: false, mfaPending: false, mfaToken: null, isDemo: false }

function completeLogin(res: { user: ApiUser; token: string; accepted_invites?: { site_id: string; site_name: string }[] }, setState: (s: AuthState) => void) {
  const user = mapApiUser(res.user)
  localStorage.setItem('cliniclink_user', JSON.stringify(user))
  setState({ user, isAuthenticated: true, isLoading: false, mfaPending: false, mfaToken: null, isDemo: false })

  if (res.accepted_invites?.length) {
    const count = res.accepted_invites.length
    const names = res.accepted_invites.map(i => i.site_name).join(', ')
    toast.success(
      count === 1
        ? `Welcome to ${names}! You've been linked as a preceptor.`
        : `You've been linked to ${count} clinical sites: ${names}`,
      { duration: 6000, description: 'Your pending site invitations were automatically accepted.' }
    )
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    // Use cached user for instant UI while we verify the session
    const userStr = localStorage.getItem('cliniclink_user')
    if (userStr) {
      try {
        const isDemo = localStorage.getItem('cliniclink_demo') === '1'
        return { ...DEFAULT_STATE, user: JSON.parse(userStr), isAuthenticated: true, isDemo }
      } catch {
        localStorage.removeItem('cliniclink_user')
      }
    }
    return DEFAULT_STATE
  })

  // Verify session on mount (skip for demo users)
  useEffect(() => {
    if (!state.isAuthenticated || state.isDemo) return

    authApi.me().then(res => {
      const user = mapApiUser(res)
      localStorage.setItem('cliniclink_user', JSON.stringify(user))
      setState(s => ({ ...s, user }))
    }).catch(() => {
      localStorage.removeItem('cliniclink_user')
      setState(DEFAULT_STATE)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (loginId: string, password: string) => {
    setState(s => ({ ...s, isLoading: true }))
    try {
      // Fetch CSRF cookie before login
      await api.csrfCookie()
      const res = await authApi.login({ login: loginId, password })

      // MFA challenge — backend returned mfa_token instead of user/token
      if ('mfa_required' in res && res.mfa_required) {
        setState(s => ({ ...s, isLoading: false, mfaPending: true, mfaToken: res.mfa_token }))
        return
      }

      // Normal login — session cookie is set by the server
      completeLogin(res as { user: ApiUser; token: string; accepted_invites?: { site_id: string; site_name: string }[] }, setState)
    } catch (err) {
      setState(s => ({ ...s, isLoading: false }))
      throw err
    }
  }, [])

  const loginFromSession = useCallback(async () => {
    setState(s => ({ ...s, isLoading: true }))
    try {
      const res = await authApi.me()
      const user = mapApiUser(res)
      localStorage.setItem('cliniclink_user', JSON.stringify(user))
      setState({ user, isAuthenticated: true, isLoading: false, mfaPending: false, mfaToken: null, isDemo: false })
    } catch (err) {
      localStorage.removeItem('cliniclink_user')
      setState(DEFAULT_STATE)
      throw err
    }
  }, [])

  const verifyMfa = useCallback(async (code: string) => {
    if (!state.mfaToken) throw new Error('No MFA session active.')
    setState(s => ({ ...s, isLoading: true }))
    try {
      await api.csrfCookie()
      const res = await authApi.mfaVerify(state.mfaToken, code)
      completeLogin(res, setState)
    } catch (err) {
      setState(s => ({ ...s, isLoading: false }))
      throw err
    }
  }, [state.mfaToken])

  const cancelMfa = useCallback(() => {
    setState(DEFAULT_STATE)
  }, [])

  const register = useCallback(async (data: RegisterData) => {
    setState(s => ({ ...s, isLoading: true }))
    try {
      await api.csrfCookie()
      await authApi.register({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        username: data.username,
        password: data.password,
        password_confirmation: data.password,
        role: data.role,
        university_id: data.universityId,
        program_id: data.programId,
        site_id: data.siteId,
        license_code: data.licenseCode,
        npi_number: data.npiNumber,
      })
      // Registration no longer returns a token — account is pending approval
      setState(s => ({ ...s, isLoading: false }))
    } catch (err) {
      setState(s => ({ ...s, isLoading: false }))
      throw err
    }
  }, [])

  const logout = useCallback(() => {
    const wasDemo = state.isDemo
    localStorage.removeItem('cliniclink_user')
    localStorage.removeItem('cliniclink_demo')
    setState(DEFAULT_STATE)
    if (!wasDemo) {
      authApi.logout().catch(() => {})
    }
  }, [state.isDemo])

  const demoLogin = useCallback(async (role: UserRole) => {
    setState(s => ({ ...s, isLoading: true }))
    const emailMap: Record<UserRole, string> = {
      student: 'student@cliniclink.health',
      preceptor: 'preceptor@cliniclink.health',
      site_manager: 'site@cliniclink.health',
      coordinator: 'coordinator@cliniclink.health',
      professor: 'professor@cliniclink.health',
      admin: 'admin@cliniclink.health',
      practitioner: 'practitioner@cliniclink.health',
    }
    try {
      await api.csrfCookie()
      const res = await authApi.login({ login: emailMap[role], password: 'ClinicLink2026!' })
      // Demo users shouldn't have MFA, but handle it gracefully
      if ('mfa_required' in res && res.mfa_required) {
        setState(s => ({ ...s, isLoading: false, mfaPending: true, mfaToken: res.mfa_token }))
        return
      }
      completeLogin(res as { user: ApiUser; token: string }, setState)
    } catch {
      // Fallback to demo mode if API is unreachable
      const user = DEMO_USERS[role]
      localStorage.setItem('cliniclink_user', JSON.stringify(user))
      localStorage.setItem('cliniclink_demo', '1')
      setState({ ...DEFAULT_STATE, user, isAuthenticated: true, isDemo: true })
    }
  }, [])

  const completeOnboarding = useCallback(async (data: Record<string, unknown>) => {
    const res = await authApi.completeOnboarding(data)
    const user = mapApiUser(res.user)
    localStorage.setItem('cliniclink_user', JSON.stringify(user))
    setState(s => ({ ...s, user }))
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, loginFromSession, verifyMfa, cancelMfa, register, logout, demoLogin, completeOnboarding }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
