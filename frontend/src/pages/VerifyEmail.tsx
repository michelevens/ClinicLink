import { useState, useEffect } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Button } from '../components/ui/Button.tsx'
import { Card } from '../components/ui/Card.tsx'
import { Stethoscope, Mail, CheckCircle, XCircle, Loader2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { authApi } from '../services/api.ts'

/** Shown after registration — prompts user to check their email */
export function VerifyEmailPrompt() {
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') || ''
  const [isResending, setIsResending] = useState(false)
  const [resent, setResent] = useState(false)

  const handleResend = async () => {
    if (!email) return
    setIsResending(true)
    try {
      await authApi.resendVerification(email)
      setResent(true)
      toast.success('Verification email sent!')
    } catch {
      toast.error('Could not resend. Please try again later.')
    } finally {
      setIsResending(false)
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
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-primary-500" />
            </div>
            <h2 className="text-xl font-bold text-stone-900 mb-2">Check your email</h2>
            <p className="text-stone-500 text-sm mb-6">
              We sent a verification link to{' '}
              {email ? <strong>{email}</strong> : 'your email address'}.
              Click the link to verify your account.
            </p>

            <div className="bg-amber-50 text-amber-800 rounded-xl px-4 py-3 text-sm mb-6">
              Your account also needs admin approval. You'll be notified once both steps are complete.
            </div>

            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleResend}
                isLoading={isResending}
                disabled={resent}
              >
                {resent ? 'Email sent!' : 'Resend verification email'}
              </Button>
              <Link to="/login" className="block text-sm text-primary-600 hover:text-primary-700 font-medium">
                Back to Sign In
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

/** Handles the /verify-email/:token route — verifies on mount */
export function VerifyEmailCallback() {
  const { token } = useParams<{ token: string }>()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Invalid verification link.')
      return
    }

    authApi.verifyEmail(token)
      .then(res => {
        setStatus('success')
        setMessage(res.message || 'Email verified successfully!')
      })
      .catch((err: unknown) => {
        setStatus('error')
        setMessage(err instanceof Error ? err.message : 'Verification failed. The link may be expired.')
      })
  }, [token])

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
          <div className="text-center py-4">
            {status === 'loading' && (
              <>
                <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-4">
                  <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                </div>
                <h2 className="text-xl font-bold text-stone-900 mb-2">Verifying your email...</h2>
                <p className="text-stone-500 text-sm">Please wait a moment.</p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-xl font-bold text-stone-900 mb-2">Email verified!</h2>
                <p className="text-stone-500 text-sm mb-6">{message}</p>
                <Link to="/login">
                  <Button className="w-full">Go to Sign In</Button>
                </Link>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-stone-900 mb-2">Verification failed</h2>
                <p className="text-stone-500 text-sm mb-6">{message}</p>
                <div className="space-y-3">
                  <Link to="/login">
                    <Button variant="outline" className="w-full">
                      <ArrowLeft className="w-4 h-4 mr-1.5" />
                      Back to Sign In
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
