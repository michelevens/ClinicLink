import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { User, UserRole } from '../types/index.ts'
import { authApi, type ApiUser } from '../services/api.ts'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthContextType extends AuthState {
  login: (loginId: string, password: string) => Promise<void>
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
  student: { id: 'demo-student-1', email: 'student@cliniclink.com', firstName: 'Sarah', lastName: 'Chen', role: 'student', createdAt: new Date().toISOString(), onboardingCompleted: true },
  preceptor: { id: 'demo-preceptor-1', email: 'preceptor@cliniclink.com', firstName: 'Dr. James', lastName: 'Wilson', role: 'preceptor', createdAt: new Date().toISOString(), onboardingCompleted: true },
  site_manager: { id: 'demo-site-1', email: 'site@cliniclink.com', firstName: 'Maria', lastName: 'Garcia', role: 'site_manager', createdAt: new Date().toISOString(), onboardingCompleted: true },
  coordinator: { id: 'demo-coord-1', email: 'coordinator@cliniclink.com', firstName: 'Dr. Lisa', lastName: 'Thompson', role: 'coordinator', createdAt: new Date().toISOString(), onboardingCompleted: true },
  professor: { id: 'demo-prof-1', email: 'professor@cliniclink.com', firstName: 'Prof. Robert', lastName: 'Martinez', role: 'professor', createdAt: new Date().toISOString(), onboardingCompleted: true },
  admin: { id: 'demo-admin-1', email: 'admin@cliniclink.com', firstName: 'Admin', lastName: 'User', role: 'admin', createdAt: new Date().toISOString(), onboardingCompleted: true },
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const token = localStorage.getItem('cliniclink_token')
    const userStr = localStorage.getItem('cliniclink_user')
    if (token && userStr) {
      try {
        return { user: JSON.parse(userStr), token, isAuthenticated: true, isLoading: false }
      } catch {
        localStorage.removeItem('cliniclink_token')
        localStorage.removeItem('cliniclink_user')
      }
    }
    return { user: null, token: null, isAuthenticated: false, isLoading: false }
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
        setState({ user: null, token: null, isAuthenticated: false, isLoading: false })
      })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (loginId: string, password: string) => {
    setState(s => ({ ...s, isLoading: true }))
    try {
      const res = await authApi.login({ login: loginId, password })
      const user = mapApiUser(res.user)
      localStorage.setItem('cliniclink_token', res.token)
      localStorage.setItem('cliniclink_user', JSON.stringify(user))
      setState({ user, token: res.token, isAuthenticated: true, isLoading: false })
    } catch (err) {
      setState(s => ({ ...s, isLoading: false }))
      throw err
    }
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
    setState({ user: null, token: null, isAuthenticated: false, isLoading: false })
    if (token && !token.startsWith('demo-')) {
      authApi.logout().catch(() => {})
    }
  }, [])

  const demoLogin = useCallback(async (role: UserRole) => {
    setState(s => ({ ...s, isLoading: true }))
    const emailMap: Record<UserRole, string> = {
      student: 'student@cliniclink.com',
      preceptor: 'preceptor@cliniclink.com',
      site_manager: 'site@cliniclink.com',
      coordinator: 'coordinator@cliniclink.com',
      professor: 'professor@cliniclink.com',
      admin: 'admin@cliniclink.com',
    }
    try {
      const res = await authApi.login({ login: emailMap[role], password: 'password' })
      const user = mapApiUser(res.user)
      localStorage.setItem('cliniclink_token', res.token)
      localStorage.setItem('cliniclink_user', JSON.stringify(user))
      setState({ user, token: res.token, isAuthenticated: true, isLoading: false })
    } catch {
      // Fallback to demo mode if API is unreachable
      const user = DEMO_USERS[role]
      const token = 'demo-token-' + Date.now()
      localStorage.setItem('cliniclink_token', token)
      localStorage.setItem('cliniclink_user', JSON.stringify(user))
      setState({ user, token, isAuthenticated: true, isLoading: false })
    }
  }, [])

  const completeOnboarding = useCallback(async (data: Record<string, unknown>) => {
    const res = await authApi.completeOnboarding(data)
    const user = mapApiUser(res.user)
    localStorage.setItem('cliniclink_user', JSON.stringify(user))
    setState(s => ({ ...s, user }))
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, demoLogin, completeOnboarding }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
