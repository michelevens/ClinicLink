import { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.tsx'
import { Button } from '../components/ui/Button.tsx'
import { Input } from '../components/ui/Input.tsx'
import { Card } from '../components/ui/Card.tsx'
import { Stethoscope, User, Lock, Eye, EyeOff, ShieldCheck, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { usePageTitle } from '../hooks/usePageTitle.ts'

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

        <p className="text-center text-xs text-stone-400 mt-6">
          Demo: student@cliniclink.health / ClinicLink2026! (or any demo role email)
        </p>
      </div>
    </div>
  )
}
