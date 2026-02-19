import { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.tsx'
import { Button } from '../components/ui/Button.tsx'
import { Input } from '../components/ui/Input.tsx'
import { Card } from '../components/ui/Card.tsx'
import { Stethoscope, User, Lock, Eye, EyeOff, ShieldCheck, ArrowLeft, Building2, Search, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { usePageTitle } from '../hooks/usePageTitle.ts'
import { ssoApi } from '../services/api.ts'
import { API_URL } from '../services/api.ts'

export function LoginPage() {
  usePageTitle('Sign In')
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { login, verifyMfa, cancelMfa, mfaPending, isLoading, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect')

  // MFA verification state
  const [mfaCode, setMfaCode] = useState('')
  const [useBackupCode, setUseBackupCode] = useState(false)
  const [pendingApproval, setPendingApproval] = useState(false)

  // Navigate on successful auth (including after MFA)
  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirect || '/dashboard')
    }
  }, [isAuthenticated, navigate, redirect])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(loginId, password)
      // If MFA is required, login won't throw but mfaPending will become true
      // Navigation happens via useEffect when isAuthenticated becomes true
    } catch (err: unknown) {
      const apiError = err as Error & { body?: { email_not_verified?: boolean; email?: string; pending_approval?: boolean } }
      if (apiError.body?.email_not_verified && apiError.body?.email) {
        navigate('/verify-email?email=' + encodeURIComponent(apiError.body.email))
        return
      }
      if (apiError.body?.pending_approval) {
        setPendingApproval(true)
        return
      }
      const message = err instanceof Error ? err.message : 'Login failed. Please check your credentials.'
      toast.error(message)
    }
  }

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mfaCode.trim()) return
    try {
      await verifyMfa(mfaCode.trim())
      // Navigation happens via useEffect
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid verification code.'
      toast.error(message)
    }
  }

  const handleMfaCodeChange = (value: string) => {
    if (useBackupCode) {
      setMfaCode(value)
    } else {
      // Only allow digits for TOTP
      setMfaCode(value.replace(/\D/g, '').slice(0, 6))
    }
  }

  // MFA verification screen
  if (mfaPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-stone-900">Two-Factor Authentication</h1>
            <p className="text-stone-500 mt-1">
              {useBackupCode
                ? 'Enter one of your backup codes'
                : 'Enter the 6-digit code from your authenticator app'
              }
            </p>
          </div>

          <Card>
            <form onSubmit={handleMfaSubmit} className="space-y-4">
              {useBackupCode ? (
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Backup Code</label>
                  <input
                    type="text"
                    value={mfaCode}
                    onChange={e => handleMfaCodeChange(e.target.value)}
                    placeholder="XXXX-XXXX"
                    autoFocus
                    className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base font-mono tracking-wider text-center focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Verification Code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={mfaCode}
                    onChange={e => handleMfaCodeChange(e.target.value)}
                    placeholder="000000"
                    maxLength={6}
                    autoFocus
                    className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-2xl font-mono tracking-[0.5em] text-center focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                  />
                </div>
              )}

              <Button type="submit" isLoading={isLoading} className="w-full" disabled={!mfaCode.trim()}>
                <ShieldCheck className="w-4 h-4" /> Verify
              </Button>
            </form>

            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={() => { cancelMfa(); setMfaCode(''); setUseBackupCode(false) }}
                className="text-sm text-stone-500 hover:text-stone-700 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to login
              </button>
              <button
                onClick={() => { setUseBackupCode(!useBackupCode); setMfaCode('') }}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                {useBackupCode ? 'Use authenticator app' : 'Use a backup code'}
              </button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              ClinicLink
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-stone-900">Welcome back</h1>
          <p className="text-stone-500 mt-1">Sign in to your account</p>
        </div>

        {pendingApproval && (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-base font-bold text-stone-900">Account Pending Approval</h3>
            <p className="text-sm text-stone-600">
              Your registration has been received and is awaiting admin review. You'll receive an email once your account is activated.
            </p>
          </div>
        )}

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email, Username, or Phone"
              type="text"
              placeholder="you@university.edu, username, or phone"
              value={loginId}
              onChange={e => setLoginId(e.target.value)}
              icon={<User className="w-4 h-4" />}
              required
            />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-stone-700">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-stone-300 bg-white pl-10 pr-10 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                Forgot password?
              </Link>
            </div>
            <Button type="submit" isLoading={isLoading} className="w-full">
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-stone-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">Register</Link>
            </p>
          </div>
        </Card>

        <SsoSection />

        <p className="text-center text-xs text-stone-400 mt-6">
          Demo: student@cliniclink.health / ClinicLink2026! (or any demo role email)
        </p>
      </div>
    </div>
  )
}

function SsoSection() {
  const [universities, setUniversities] = useState<{ id: string; name: string }[]>([])
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    ssoApi.universities().then(setUniversities).catch(() => {})
  }, [])

  if (universities.length === 0) return null

  const filtered = search
    ? universities.filter(u => u.name.toLowerCase().includes(search.toLowerCase()))
    : universities

  return (
    <div className="mt-4">
      <div className="relative flex items-center my-4">
        <div className="flex-1 border-t border-stone-200" />
        <span className="px-3 text-xs text-stone-400 uppercase tracking-wider">Or</span>
        <div className="flex-1 border-t border-stone-200" />
      </div>

      {!expanded ? (
        <button
          onClick={() => setExpanded(true)}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 hover:border-stone-400 transition-all duration-200"
        >
          <Building2 className="w-4 h-4 text-primary-600" />
          Sign in with University SSO
        </button>
      ) : (
        <Card>
          <div className="space-y-3">
            <p className="text-sm font-medium text-stone-700">Select your university</p>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search universities..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-white pl-10 pr-4 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
              />
            </div>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {filtered.map(u => (
                <button
                  key={u.id}
                  onClick={() => setSelectedId(u.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedId === u.id
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  {u.name}
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="text-sm text-stone-400 text-center py-2">No universities found</p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setExpanded(false); setSearch(''); setSelectedId('') }}
                className="flex-1 text-sm text-stone-500 hover:text-stone-700 py-2"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!selectedId) return
                  window.location.href = `${API_URL}/sso/login/${selectedId}`
                }}
                disabled={!selectedId}
                className="flex-1 rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Continue with SSO
              </button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
