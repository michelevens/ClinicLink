import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { User, UserRole } from '../types/index.ts'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  demoLogin: (role: UserRole) => void
}

interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  role: UserRole
}

const AuthContext = createContext<AuthContextType | null>(null)

const DEMO_USERS: Record<UserRole, User> = {
  student: {
    id: 'demo-student-1',
    email: 'student@cliniclink.com',
    firstName: 'Sarah',
    lastName: 'Chen',
    role: 'student',
    createdAt: new Date().toISOString(),
  },
  preceptor: {
    id: 'demo-preceptor-1',
    email: 'preceptor@cliniclink.com',
    firstName: 'Dr. James',
    lastName: 'Wilson',
    role: 'preceptor',
    createdAt: new Date().toISOString(),
  },
  site_manager: {
    id: 'demo-site-1',
    email: 'site@cliniclink.com',
    firstName: 'Maria',
    lastName: 'Garcia',
    role: 'site_manager',
    createdAt: new Date().toISOString(),
  },
  coordinator: {
    id: 'demo-coord-1',
    email: 'coordinator@cliniclink.com',
    firstName: 'Dr. Lisa',
    lastName: 'Thompson',
    role: 'coordinator',
    createdAt: new Date().toISOString(),
  },
  professor: {
    id: 'demo-prof-1',
    email: 'professor@cliniclink.com',
    firstName: 'Prof. Robert',
    lastName: 'Martinez',
    role: 'professor',
    createdAt: new Date().toISOString(),
  },
  admin: {
    id: 'demo-admin-1',
    email: 'admin@cliniclink.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    createdAt: new Date().toISOString(),
  },
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

  const login = useCallback(async (email: string, _password: string) => {
    setState(s => ({ ...s, isLoading: true }))
    // TODO: Replace with real API call
    await new Promise(r => setTimeout(r, 800))
    const role = email.includes('student') ? 'student' :
                 email.includes('preceptor') ? 'preceptor' :
                 email.includes('site') ? 'site_manager' :
                 email.includes('coord') ? 'coordinator' :
                 email.includes('prof') ? 'professor' : 'admin'
    const user = DEMO_USERS[role as UserRole]
    const token = 'demo-token-' + Date.now()
    localStorage.setItem('cliniclink_token', token)
    localStorage.setItem('cliniclink_user', JSON.stringify(user))
    setState({ user, token, isAuthenticated: true, isLoading: false })
  }, [])

  const register = useCallback(async (data: RegisterData) => {
    setState(s => ({ ...s, isLoading: true }))
    await new Promise(r => setTimeout(r, 800))
    const user: User = {
      id: 'user-' + Date.now(),
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      createdAt: new Date().toISOString(),
    }
    const token = 'demo-token-' + Date.now()
    localStorage.setItem('cliniclink_token', token)
    localStorage.setItem('cliniclink_user', JSON.stringify(user))
    setState({ user, token, isAuthenticated: true, isLoading: false })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('cliniclink_token')
    localStorage.removeItem('cliniclink_user')
    setState({ user: null, token: null, isAuthenticated: false, isLoading: false })
  }, [])

  const demoLogin = useCallback((role: UserRole) => {
    const user = DEMO_USERS[role]
    const token = 'demo-token-' + Date.now()
    localStorage.setItem('cliniclink_token', token)
    localStorage.setItem('cliniclink_user', JSON.stringify(user))
    setState({ user, token, isAuthenticated: true, isLoading: false })
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, demoLogin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
