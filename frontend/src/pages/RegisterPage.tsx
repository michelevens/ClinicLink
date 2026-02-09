import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.tsx'
import { Button } from '../components/ui/Button.tsx'
import { Input } from '../components/ui/Input.tsx'
import { Card } from '../components/ui/Card.tsx'
import { Stethoscope, Mail, Lock, User } from 'lucide-react'
import { toast } from 'sonner'
import type { UserRole } from '../types/index.ts'

const ROLE_OPTIONS: { value: UserRole; label: string; desc: string }[] = [
  { value: 'student', label: 'Student', desc: 'I need clinical rotation hours' },
  { value: 'site_manager', label: 'Site Manager', desc: 'I manage a clinical facility' },
  { value: 'preceptor', label: 'Preceptor', desc: 'I supervise students clinically' },
  { value: 'coordinator', label: 'University Coordinator', desc: 'I manage student placements' },
  { value: 'professor', label: 'Professor / Faculty', desc: 'I oversee students in my program' },
]

export function RegisterPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'student' as UserRole })
  const { register, isLoading } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await register(form)
      toast.success('Account created successfully!')
      navigate('/onboarding')
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
            <Input label="Email" type="email" placeholder="you@university.edu" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} icon={<Mail className="w-4 h-4" />} required />
            <Input label="Password" type="password" placeholder="Create a password (min 8 chars)" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} icon={<Lock className="w-4 h-4" />} required />

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
