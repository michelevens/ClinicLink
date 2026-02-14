import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { User, UserRole } from '../types'
import { authApi, type ApiUser } from '../api/api'
import { api } from '../api/client'
import { setOnUnauthorized } from '../api/client'
import { Alert } from 'react-native'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  isInitializing: boolean
  mfaPending: boolean
  mfaToken: string | null
}

interface AuthContextType extends AuthState {
  login: (loginId: string, password: string) => Promise<void>
  verifyMfa: (code: string) => Promise<void>
  cancelMfa: () => void
  register: (data: RegisterData) => Promise<void>
  logout: () => void
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

const DEFAULT_STATE: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isInitializing: true,
  mfaPending: false,
  mfaToken: null,
}

async function completeLogin(
  res: { user: ApiUser; token: string; accepted_invites?: { site_id: string; site_name: string }[] },
  setState: (s: AuthState | ((prev: AuthState) => AuthState)) => void
) {
  const user = mapApiUser(res.user)
  await api.setToken(res.token)
  await api.saveUser(user)
  setState({
    user,
    token: res.token,
    isAuthenticated: true,
    isLoading: false,
    isInitializing: false,
    mfaPending: false,
    mfaToken: null,
  })

  if (res.accepted_invites?.length) {
    const count = res.accepted_invites.length
    const names = res.accepted_invites.map(i => i.site_name).join(', ')
    Alert.alert(
      'Site Invitations Accepted',
      count === 1
        ? `Welcome to ${names}! You've been linked as a preceptor.`
        : `You've been linked to ${count} clinical sites: ${names}`
    )
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(DEFAULT_STATE)

  // Restore token from SecureStore on mount
  useEffect(() => {
    let mounted = true
    ;(async () => {
      const token = await api.loadToken()
      const savedUser = await api.getSavedUser()

      if (!token || !savedUser) {
        if (mounted) setState(s => ({ ...s, isInitializing: false }))
        return
      }

      // Set initial state from cache
      if (mounted) {
        setState(s => ({
          ...s,
          user: savedUser as User,
          token,
          isAuthenticated: true,
        }))
      }

      // Verify token with backend
      try {
        const res = await authApi.me()
        const user = mapApiUser(res)
        await api.saveUser(user)
        if (mounted) setState(s => ({ ...s, user, isInitializing: false }))
      } catch {
        await api.clearToken()
        if (mounted) setState({ ...DEFAULT_STATE, isInitializing: false })
      }
    })()

    return () => { mounted = false }
  }, [])

  // Wire up 401 handler to reset auth state
  useEffect(() => {
    setOnUnauthorized(() => {
      setState({ ...DEFAULT_STATE, isInitializing: false })
    })
  }, [])

  const login = useCallback(async (loginId: string, password: string) => {
    setState(s => ({ ...s, isLoading: true }))
    try {
      const res = await authApi.login({ login: loginId, password })

      if ('mfa_required' in res && res.mfa_required) {
        setState(s => ({ ...s, isLoading: false, mfaPending: true, mfaToken: res.mfa_token }))
        return
      }

      await completeLogin(
        res as { user: ApiUser; token: string; accepted_invites?: { site_id: string; site_name: string }[] },
        setState
      )
    } catch (err) {
      setState(s => ({ ...s, isLoading: false }))
      throw err
    }
  }, [])

  const verifyMfa = useCallback(async (code: string) => {
    if (!state.mfaToken) throw new Error('No MFA session active.')
    setState(s => ({ ...s, isLoading: true }))
    try {
      const res = await authApi.mfaVerify(state.mfaToken, code)
      await completeLogin(res, setState)
    } catch (err) {
      setState(s => ({ ...s, isLoading: false }))
      throw err
    }
  }, [state.mfaToken])

  const cancelMfa = useCallback(() => {
    setState(s => ({ ...s, mfaPending: false, mfaToken: null }))
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
      })
      setState(s => ({ ...s, isLoading: false }))
    } catch (err) {
      setState(s => ({ ...s, isLoading: false }))
      throw err
    }
  }, [])

  const logout = useCallback(async () => {
    const token = await api.loadToken()
    await api.clearToken()
    setState({ ...DEFAULT_STATE, isInitializing: false })
    if (token) {
      authApi.logout().catch(() => {})
    }
  }, [])

  const completeOnboarding = useCallback(async (data: Record<string, unknown>) => {
    const res = await authApi.completeOnboarding(data)
    const user = mapApiUser(res.user)
    await api.saveUser(user)
    setState(s => ({ ...s, user }))
  }, [])

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        verifyMfa,
        cancelMfa,
        register,
        logout,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
