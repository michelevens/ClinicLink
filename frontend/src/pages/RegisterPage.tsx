import { useState, useMemo, useEffect, useRef } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.tsx'
import { Button } from '../components/ui/Button.tsx'
import { Input } from '../components/ui/Input.tsx'
import { Card } from '../components/ui/Card.tsx'
import { Stethoscope, Mail, Lock, User, AtSign, Wand2, Eye, EyeOff, Check, X, Building2, Search, Loader2, BookOpen, ShieldCheck, MapPin, KeyRound } from 'lucide-react'
import { toast } from 'sonner'
import type { UserRole } from '../types/index.ts'
import { universitiesApi, sitesApi, api } from '../services/api.ts'
import type { ApiProgram } from '../services/api.ts'

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
  if (pw.length >= 12) score++
  if (pw.length >= 16) score++
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
  const prefillCode = searchParams.get('code') || ''

  const navigate = useNavigate()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: prefillEmail, username: '', password: '', role: prefillRole, universityId: '', programId: '', npiNumber: '', siteId: '', licenseCode: prefillCode })
  const [showPassword, setShowPassword] = useState(false)
  const { register, isLoading } = useAuth()

  // University search
  const [uniSearch, setUniSearch] = useState('')
  const [uniResults, setUniResults] = useState<{ id: string; name: string; city: string | null; state: string | null }[]>([])
  const [uniLoading, setUniLoading] = useState(false)
  const [selectedUni, setSelectedUni] = useState<{ id: string; name: string } | null>(null)
  const [showUniDropdown, setShowUniDropdown] = useState(false)
  const uniRef = useRef<HTMLDivElement>(null)
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(null)

  // Site search (for preceptors)
  const [siteSearch, setSiteSearch] = useState('')
  const [siteResults, setSiteResults] = useState<{ id: string; name: string; city: string | null; state: string | null }[]>([])
  const [siteLoading, setSiteLoading] = useState(false)
  const [selectedSite, setSelectedSite] = useState<{ id: string; name: string } | null>(null)
  const [showSiteDropdown, setShowSiteDropdown] = useState(false)
  const siteRef = useRef<HTMLDivElement>(null)
  const siteSearchTimer = useRef<ReturnType<typeof setTimeout>>(null)

  // Program selection (loads when university is selected for students)
  const [programs, setPrograms] = useState<ApiProgram[]>([])
  const [programsLoading, setProgramsLoading] = useState(false)

  const needsOrg = ['student', 'preceptor', 'coordinator', 'professor'].includes(form.role)
  const needsSite = form.role === 'preceptor'
  const showProgramSelect = form.role === 'student' && form.universityId

  // Fetch programs when a university is selected (for students)
  useEffect(() => {
    if (!form.universityId || form.role !== 'student') {
      setPrograms([])
      return
    }
    setProgramsLoading(true)
    api.get<ApiProgram[]>(`/universities/${form.universityId}/programs`)
      .then(data => setPrograms(Array.isArray(data) ? data : []))
      .catch(() => setPrograms([]))
      .finally(() => setProgramsLoading(false))
  }, [form.universityId, form.role])

  useEffect(() => {
    if (!uniSearch.trim() || uniSearch.length < 2) {
      setUniResults([])
      return
    }
    setUniLoading(true)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await universitiesApi.list({ search: uniSearch })
        setUniResults((res.data || []).map(u => ({ id: u.id, name: u.name, city: u.city, state: u.state })))
      } catch {
        setUniResults([])
      } finally {
        setUniLoading(false)
      }
    }, 300)
  }, [uniSearch])

  // Site search for preceptors
  useEffect(() => {
    if (!siteSearch.trim() || siteSearch.length < 2) {
      setSiteResults([])
      return
    }
    setSiteLoading(true)
    if (siteSearchTimer.current) clearTimeout(siteSearchTimer.current)
    siteSearchTimer.current = setTimeout(async () => {
      try {
        const res = await sitesApi.list({ search: siteSearch })
        setSiteResults((res.data || []).map(s => ({ id: s.id, name: s.name, city: s.city, state: s.state })))
      } catch {
        setSiteResults([])
      } finally {
        setSiteLoading(false)
      }
    }, 300)
  }, [siteSearch])

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (uniRef.current && !uniRef.current.contains(e.target as Node)) setShowUniDropdown(false)
      if (siteRef.current && !siteRef.current.contains(e.target as Node)) setShowSiteDropdown(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const strength = useMemo(() => getPasswordStrength(form.password), [form.password])

  const passwordChecks = useMemo(() => [
    { label: 'At least 12 characters', pass: form.password.length >= 12 },
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
    if (form.password.length < 12) {
      toast.error('Password must be at least 12 characters')
      return
    }
    try {
      await register({ ...form, universityId: form.universityId || undefined, programId: form.programId || undefined, siteId: form.siteId || undefined, licenseCode: form.licenseCode || undefined })
      navigate('/verify-email?email=' + encodeURIComponent(form.email))
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.'
      toast.error(message)
    }
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
                  placeholder="Create a password (min 12 chars)"
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

            {/* Clinical Site Search (required for preceptors) */}
            {needsSite && (
              <div className="space-y-1.5" ref={siteRef}>
                <label className="block text-sm font-medium text-stone-700">Clinical Site</label>
                {selectedSite ? (
                  <div className="flex items-center justify-between p-3 rounded-xl border border-primary-300 bg-primary-50">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary-600" />
                      <span className="text-sm font-medium text-stone-900">{selectedSite.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setSelectedSite(null); setForm(f => ({ ...f, siteId: '' })); setSiteSearch('') }}
                      className="text-stone-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                      {siteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    </div>
                    <input
                      type="text"
                      value={siteSearch}
                      onChange={e => { setSiteSearch(e.target.value); setShowSiteDropdown(true) }}
                      onFocus={() => siteResults.length > 0 && setShowSiteDropdown(true)}
                      placeholder="Search for your clinical site..."
                      className="w-full rounded-xl border border-stone-300 bg-white pl-10 pr-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all duration-200"
                    />
                    {showSiteDropdown && siteResults.length > 0 && (
                      <div className="absolute z-50 mt-1 w-full bg-white border border-stone-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                        {siteResults.map(s => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => {
                              setSelectedSite({ id: s.id, name: s.name })
                              setForm(f => ({ ...f, siteId: s.id }))
                              setShowSiteDropdown(false)
                              setSiteSearch('')
                            }}
                            className="w-full text-left px-4 py-2.5 hover:bg-primary-50 transition-colors border-b border-stone-100 last:border-0"
                          >
                            <p className="text-sm font-medium text-stone-900">{s.name}</p>
                            {(s.city || s.state) && (
                              <p className="text-xs text-stone-500">{[s.city, s.state].filter(Boolean).join(', ')}</p>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                    {showSiteDropdown && siteSearch.length >= 2 && !siteLoading && siteResults.length === 0 && (
                      <div className="absolute z-50 mt-1 w-full bg-white border border-stone-200 rounded-xl shadow-lg p-4 text-center">
                        <p className="text-sm text-stone-500">No sites found for "{siteSearch}"</p>
                        <p className="text-xs text-stone-400 mt-1">Contact your site manager if your site isn't listed</p>
                      </div>
                    )}
                  </div>
                )}
                <p className="text-xs text-stone-400">Select the clinical site where you practice</p>
              </div>
            )}

            {/* Organization Search */}
            {needsOrg && (
              <div className="space-y-1.5" ref={uniRef}>
                <label className="block text-sm font-medium text-stone-700">
                  {form.role === 'student' ? 'Your School / University' : form.role === 'preceptor' ? 'University Affiliation (Optional)' : 'Affiliated Organization'}
                </label>
                {selectedUni ? (
                  <div className="flex items-center justify-between p-3 rounded-xl border border-primary-300 bg-primary-50">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-primary-600" />
                      <span className="text-sm font-medium text-stone-900">{selectedUni.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setSelectedUni(null); setForm(f => ({ ...f, universityId: '', programId: '' })); setUniSearch(''); setPrograms([]) }}
                      className="text-stone-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                      {uniLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    </div>
                    <input
                      type="text"
                      value={uniSearch}
                      onChange={e => { setUniSearch(e.target.value); setShowUniDropdown(true) }}
                      onFocus={() => uniResults.length > 0 && setShowUniDropdown(true)}
                      placeholder={form.role === 'preceptor' ? 'Search for a university (optional)...' : 'Search for your school or organization...'}
                      className="w-full rounded-xl border border-stone-300 bg-white pl-10 pr-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all duration-200"
                    />
                    {showUniDropdown && uniResults.length > 0 && (
                      <div className="absolute z-50 mt-1 w-full bg-white border border-stone-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                        {uniResults.map(u => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => {
                              setSelectedUni({ id: u.id, name: u.name })
                              setForm(f => ({ ...f, universityId: u.id, programId: '' }))
                              setShowUniDropdown(false)
                              setUniSearch('')
                            }}
                            className="w-full text-left px-4 py-2.5 hover:bg-primary-50 transition-colors border-b border-stone-100 last:border-0"
                          >
                            <p className="text-sm font-medium text-stone-900">{u.name}</p>
                            {(u.city || u.state) && (
                              <p className="text-xs text-stone-500">{[u.city, u.state].filter(Boolean).join(', ')}</p>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                    {showUniDropdown && uniSearch.length >= 2 && !uniLoading && uniResults.length === 0 && (
                      <div className="absolute z-50 mt-1 w-full bg-white border border-stone-200 rounded-xl shadow-lg p-4 text-center">
                        <p className="text-sm text-stone-500">No organizations found for "{uniSearch}"</p>
                        <p className="text-xs text-stone-400 mt-1">You can add your organization after registration</p>
                      </div>
                    )}
                  </div>
                )}
                <p className="text-xs text-stone-400">
                  {form.role === 'student'
                    ? 'Select the school you are enrolled in'
                    : form.role === 'preceptor'
                    ? 'Optionally select a university you are affiliated with'
                    : 'Select the school or organization you are affiliated with'}
                </p>
              </div>
            )}

            {/* Optional NPI for preceptors */}
            {form.role === 'preceptor' && (
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-stone-700">NPI Number (Optional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={form.npiNumber}
                    onChange={e => {
                      const v = e.target.value.replace(/\D/g, '').slice(0, 10)
                      setForm(f => ({ ...f, npiNumber: v }))
                    }}
                    placeholder="10-digit NPI number"
                    maxLength={10}
                    className="w-full rounded-xl border border-stone-300 bg-white pl-10 pr-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all duration-200"
                  />
                </div>
                <p className="text-xs text-stone-400">If you have an NPI, enter it here. You can also add it later during onboarding.</p>
                {form.npiNumber && form.npiNumber.length > 0 && form.npiNumber.length !== 10 && (
                  <p className="text-xs text-amber-600">NPI must be exactly 10 digits</p>
                )}
              </div>
            )}

            {/* Program Selection (students only, after university selected) */}
            {showProgramSelect && (
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-stone-700">Your Program</label>
                {programsLoading ? (
                  <div className="flex items-center gap-2 p-3 rounded-xl border border-stone-200">
                    <Loader2 className="w-4 h-4 animate-spin text-stone-400" />
                    <span className="text-sm text-stone-500">Loading programs...</span>
                  </div>
                ) : programs.length === 0 ? (
                  <div className="p-3 rounded-xl border border-stone-200 bg-stone-50">
                    <p className="text-sm text-stone-500">No programs found for this university.</p>
                    <p className="text-xs text-stone-400 mt-1">Your coordinator can assign you to a program later.</p>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <select
                      value={form.programId}
                      onChange={e => setForm(f => ({ ...f, programId: e.target.value }))}
                      className="w-full rounded-xl border border-stone-300 bg-white pl-10 pr-4 py-2.5 text-sm text-stone-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all duration-200 appearance-none"
                    >
                      <option value="">-- Select your program --</option>
                      {programs.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.degree_type}) - {p.required_hours}h
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <p className="text-xs text-stone-400">Select the clinical program you are enrolled in</p>
              </div>
            )}

            {/* University License Code (students only) */}
            {form.role === 'student' && (
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-stone-700">University License Code (Optional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={form.licenseCode}
                    onChange={e => setForm(f => ({ ...f, licenseCode: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 20) }))}
                    placeholder="Enter your university code"
                    maxLength={20}
                    className="w-full rounded-xl border border-stone-300 bg-white pl-10 pr-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all duration-200 uppercase tracking-wider"
                  />
                </div>
                <p className="text-xs text-stone-400">If your university provided a license code, enter it here to get Pro access automatically.</p>
              </div>
            )}

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
