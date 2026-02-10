import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button.tsx'
import { Input } from '../components/ui/Input.tsx'
import { Card } from '../components/ui/Card.tsx'
import { Stethoscope, Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { authApi } from '../services/api.ts'

export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await authApi.forgotPassword(email)
      setSent(true)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
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
        </div>

        <Card>
          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-stone-900 mb-2">Check your email</h2>
              <p className="text-stone-500 text-sm mb-6">
                If an account exists for <strong>{email}</strong>, we sent a password reset link. Check your inbox (and spam folder).
              </p>
              <div className="space-y-3">
                <Button variant="outline" className="w-full" onClick={() => { setSent(false); setEmail('') }}>
                  Try another email
                </Button>
                <Link to="/login" className="block text-sm text-primary-600 hover:text-primary-700 font-medium">
                  Back to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-stone-900 mb-2">Forgot your password?</h2>
              <p className="text-stone-500 text-sm mb-6">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Email address"
                  type="email"
                  placeholder="you@university.edu"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  icon={<Mail className="w-4 h-4" />}
                  required
                />
                <Button type="submit" isLoading={isLoading} className="w-full">
                  Send Reset Link
                </Button>
              </form>
              <div className="mt-6 text-center">
                <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Sign In
                </Link>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
