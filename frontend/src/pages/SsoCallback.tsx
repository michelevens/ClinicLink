import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.tsx'
import { Stethoscope, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export function SsoCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { loginWithToken } = useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = searchParams.get('token')
    const errorMsg = searchParams.get('error')

    if (errorMsg) {
      setError(errorMsg)
      return
    }

    if (!token) {
      setError('No authentication token received.')
      return
    }

    loginWithToken(token)
      .then(() => {
        toast.success('Signed in via SSO')
        navigate('/dashboard', { replace: true })
      })
      .catch(() => {
        setError('Failed to complete SSO login. Please try again.')
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-stone-900 mb-2">SSO Login Failed</h1>
          <p className="text-stone-500 mb-6">{error}</p>
          <button
            onClick={() => navigate('/login', { replace: true })}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 px-4">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center mx-auto mb-4">
          <Stethoscope className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-stone-900 mb-2">Signing you in...</h1>
        <p className="text-stone-500 mb-6">Completing your university SSO authentication</p>
        <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
      </div>
    </div>
  )
}
