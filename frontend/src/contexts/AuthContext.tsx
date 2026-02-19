import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { User, UserRole } from '../types/index.ts'
import { authApi, type ApiUser } from '../services/api.ts'
import { toast } from 'sonner'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  mfaPending: boolean
  mfaToken: string | null
}

interface AuthContextType extends AuthState {
  login: (loginId: string, password: string) => Promise<void>
  loginWithToken: (token: string) => Promise<void>
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
    onboardingCompleted: u.onboarding_completed ?? false,
    universityId: u.student_profile?.university_id || undefined,
    programId: u.student_profile?.program_id || undefined,
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

const DEFAULT_STATE: AuthState = { user: null, token: null, isAuthenticated: false, isLoading: false, mfaPending: false, mfaToken: null }

function completeLogin(res: { user: ApiUser; token: string; accepted_invites?: { site_id: string; site_name: string }[] }, setState: (s: AuthState) => void) {
  const user = mapApiUser(res.user)
  localStorage.setItem('cliniclink_token', res.token)
  localStorage.setItem('cliniclink_user', JSON.stringify(user))
  setState({ user, token: res.token, isAuthenticated: true, isLoading: false, mfaPending: false, mfaToken: null })

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
    const token = localStorage.getItem('cliniclink_token')
    const userStr = localStorage.getItem('cliniclink_user')
    if (token && userStr) {
      try {
        return { ...DEFAULT_STATE, user: JSON.parse(userStr), token, isAuthenticated: true }
      } catch {
        localStorage.removeItem('cliniclink_token')
        localStorage.removeItem('cliniclink_user')
      }
    }
    return DEFAULT_STATE
  })

  // Verify token on mount (skip for demo tokens)
  useEffect(() => {
    if (state.token && !state.token.startsWith('demo-')) {
      authApi.me().then(res => {
        const user = mapApiUser(res)
        localStorage.setItem('cliniclink_user', JSON.stringify(user))
        setState(s => ({ ...s, user }))
      }).catch(() => {
        localStorage.removeItem('cliniclink_token')
        localStorage.removeItem('cliniclink_user')
        setState(DEFAULT_STATE)
      })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (loginId: string, password: string) => {
    setState(s => ({ ...s, isLoading: true }))
    try {
      const res = await authApi.login({ login: loginId, password })

      // MFA challenge — backend returned mfa_token instead of user/token
      if ('mfa_required' in res && res.mfa_required) {
        setState(s => ({ ...s, isLoading: false, mfaPending: true, mfaToken: res.mfa_token }))
        return
      }

      // Normal login (no MFA)
      completeLogin(res as { user: ApiUser; token: string; accepted_invites?: { site_id: string; site_name: string }[] }, setState)
    } catch (err) {
      setState(s => ({ ...s, isLoading: false }))
      throw err
    }
  }, [])

  const loginWithToken = useCallback(async (token: string) => {
    setState(s => ({ ...s, isLoading: true }))
    try {
      localStorage.setItem('cliniclink_token', token)
      const res = await authApi.me()
      const user = mapApiUser(res)
      localStorage.setItem('cliniclink_user', JSON.stringify(user))
      setState({ user, token, isAuthenticated: true, isLoading: false, mfaPending: false, mfaToken: null })
    } catch (err) {
      localStorage.removeItem('cliniclink_token')
      localStorage.removeItem('cliniclink_user')
      setState(DEFAULT_STATE)
      throw err
    }
  }, [])

  const verifyMfa = useCallback(async (code: string) => {
    if (!state.mfaToken) throw new Error('No MFA session active.')
    setState(s => ({ ...s, isLoading: true }))
    try {
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
      })
      // Registration no longer returns a token — account is pending approval
      setState(s => ({ ...s, isLoading: false }))
    } catch (err) {
      setState(s => ({ ...s, isLoading: false }))
      throw err
    }
  }, [])

  const logout = useCallback(() => {
    const token = localStorage.getItem('cliniclink_token')
    localStorage.removeItem('cliniclink_token')
    localStorage.removeItem('cliniclink_user')
    setState(DEFAULT_STATE)
    if (token && !token.startsWith('demo-')) {
      authApi.logout().catch(() => {})
    }
  }, [])

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
      const token = 'demo-token-' + Date.now()
      localStorage.setItem('cliniclink_token', token)
      localStorage.setItem('cliniclink_user', JSON.stringify(user))
      setState({ ...DEFAULT_STATE, user, token, isAuthenticated: true })
    }
  }, [])

  const completeOnboarding = useCallback(async (data: Record<string, unknown>) => {
    const res = await authApi.completeOnboarding(data)
    const user = mapApiUser(res.user)
    localStorage.setItem('cliniclink_user', JSON.stringify(user))
    setState(s => ({ ...s, user }))
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, loginWithToken, verifyMfa, cancelMfa, register, logout, demoLogin, completeOnboarding }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
