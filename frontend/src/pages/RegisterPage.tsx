import { useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.tsx'
import { Button } from '../components/ui/Button.tsx'
import { Input } from '../components/ui/Input.tsx'
import { Card } from '../components/ui/Card.tsx'
import { Stethoscope, Mail, Lock, User, AtSign, Wand2, Eye, EyeOff, Check, X, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import type { UserRole } from '../types/index.ts'

const ROLE_OPTIONS: { value: UserRole; label: string; desc: string }[] = [
  { value: 'student', label: 'Student', desc: 'I need clinical rotation hours' },
  { value: 'site_manager', label: 'Site Manager', desc: 'I manage a clinical facility' },
  { value: 'preceptor', label: 'Preceptor', desc: 'I supervise students clinically' },
  { value: 'coordinator', label: 'University Coordinator', desc: 'I manage student placements' },
  { value: 'professor', label: 'Professor / Faculty', desc: 'I oversee students in my program' },
]

function generateStrongPassword(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const lower = 'abcdefghjkmnpqrstuvwxyz'
  const digits = '23456789'
  const symbols = '!@#$%&*?'
  const all = upper + lower + digits + symbols

  let pw = ''
  pw += upper[Math.floor(Math.random() * upper.length)]
  pw += lower[Math.floor(Math.random() * lower.length)]
  pw += digits[Math.floor(Math.random() * digits.length)]
  pw += symbols[Math.floor(Math.random() * symbols.length)]

  for (let i = 4; i < 16; i++) {
    pw += all[Math.floor(Math.random() * all.length)]
  }

  return pw.split('').sort(() => Math.random() - 0.5).join('')
}

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: '', color: '' }

  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^a-zA-Z0-9]/.test(pw)) score++

  if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500' }
  if (score <= 2) return { score: 2, label: 'Fair', color: 'bg-orange-500' }
  if (score <= 3) return { score: 3, label: 'Good', color: 'bg-amber-500' }
  if (score <= 4) return { score: 4, label: 'Strong', color: 'bg-green-500' }
  return { score: 5, label: 'Very Strong', color: 'bg-emerald-500' }
}

export function RegisterPage() {
  const [searchParams] = useSearchParams()
  const prefillEmail = searchParams.get('email') || ''
  const prefillRole = (searchParams.get('role') as UserRole) || 'student'

  const [form, setForm] = useState({ firstName: '', lastName: '', email: prefillEmail, username: '', password: '', role: prefillRole })
  const [showPassword, setShowPassword] = useState(false)
  const [pendingApproval, setPendingApproval] = useState(false)
  const { register, isLoading } = useAuth()

  const strength = useMemo(() => getPasswordStrength(form.password), [form.password])

  const passwordChecks = useMemo(() => [
    { label: 'At least 8 characters', pass: form.password.length >= 8 },
    { label: 'Uppercase letter', pass: /[A-Z]/.test(form.password) },
    { label: 'Lowercase letter', pass: /[a-z]/.test(form.password) },
    { label: 'Number', pass: /\d/.test(form.password) },
    { label: 'Special character (!@#$%)', pass: /[^a-zA-Z0-9]/.test(form.password) },
  ], [form.password])

  const handleGeneratePassword = () => {
    const pw = generateStrongPassword()
    setForm(f => ({ ...f, password: pw }))
    setShowPassword(true)
    toast.success('Strong password generated! Make sure to save it.')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    try {
      await register(form)
      setPendingApproval(true)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.'
      toast.error(message)
    }
  }

  if (pendingApproval) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 text-green-500 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold text-stone-900 mb-2">Registration Submitted!</h1>
            <p className="text-stone-600 mb-4">
              Thank you for registering, <strong>{form.firstName}</strong>. Your account is pending approval by an administrator.
            </p>
            <div className="bg-amber-50 text-amber-800 rounded-xl px-4 py-3 text-sm mb-6">
              You will receive an email at <strong>{form.email}</strong> once your account has been approved and activated.
            </div>
            <Link to="/login">
              <Button variant="outline" className="w-full">Go to Login</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 px-4 py-12">
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
          <h1 className="text-2xl font-bold text-stone-900">Create your account</h1>
          <p className="text-stone-500 mt-1">Join the clinical placement network</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="First Name" placeholder="Sarah" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} icon={<User className="w-4 h-4" />} required />
              <Input label="Last Name" placeholder="Chen" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} required />
            </div>
            <Input label="Username" placeholder="sarahchen" value={form.username} onChange={e => setForm({ ...form, username: e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, '') })} icon={<AtSign className="w-4 h-4" />} required />
            <Input label="Email" type="email" placeholder="you@university.edu" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} icon={<Mail className="w-4 h-4" />} required />

            {/* Password with strength meter */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-stone-700">Password</label>
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
                >
                  <Wand2 className="w-3 h-3" /> Suggest strong password
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password (min 8 chars)"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
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

              {/* Strength Meter */}
              {form.password && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-stone-200 rounded-full overflow-hidden flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div
                          key={i}
                          className={`flex-1 rounded-full transition-colors ${
                            i <= strength.score ? strength.color : 'bg-stone-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`text-xs font-medium ${
                      strength.score <= 1 ? 'text-red-600' :
                      strength.score <= 2 ? 'text-orange-600' :
                      strength.score <= 3 ? 'text-amber-600' :
                      'text-green-600'
                    }`}>{strength.label}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {passwordChecks.map(check => (
                      <div key={check.label} className="flex items-center gap-1.5">
                        {check.pass
                          ? <Check className="w-3 h-3 text-green-500" />
                          : <X className="w-3 h-3 text-stone-300" />
                        }
                        <span className={`text-xs ${check.pass ? 'text-green-600' : 'text-stone-400'}`}>{check.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-stone-700">I am a...</label>
              <div className="space-y-2">
                {ROLE_OPTIONS.map(opt => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      form.role === opt.value
                        ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500/20'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={opt.value}
                      checked={form.role === opt.value}
                      onChange={() => setForm({ ...form, role: opt.value })}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      form.role === opt.value ? 'border-primary-500' : 'border-stone-300'
                    }`}>
                      {form.role === opt.value && <div className="w-2 h-2 rounded-full bg-primary-500" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-stone-900">{opt.label}</p>
                      <p className="text-xs text-stone-500">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <Button type="submit" isLoading={isLoading} className="w-full">
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-stone-500">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">Sign in</Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
