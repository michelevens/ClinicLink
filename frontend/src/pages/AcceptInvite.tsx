import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.tsx'
import { siteInvitesApi, type ApiInviteDetail } from '../services/api.ts'
import { Button } from '../components/ui/Button.tsx'
import { toast } from 'sonner'
import {
  Building2, MapPin, Stethoscope, CheckCircle, Loader2,
  AlertTriangle, LogIn, UserPlus, ArrowRight
} from 'lucide-react'

export function AcceptInvite() {
  const { token } = useParams<{ token: string }>()
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  const [invite, setInvite] = useState<ApiInviteDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [accepting, setAccepting] = useState(false)
  const [accepted, setAccepted] = useState(false)

  useEffect(() => {
    if (!token) return
    siteInvitesApi.validate(token)
      .then(res => { setInvite(res.invite); setLoading(false) })
      .catch(err => { setError(err.message || 'Invalid invite link'); setLoading(false) })
  }, [token])

  const handleAccept = async () => {
    if (!token) return
    setAccepting(true)
    try {
      const res = await siteInvitesApi.accept(token)
      toast.success(res.message)
      setAccepted(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to accept invite'
      toast.error(msg)
    }
    setAccepting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-stone-900 mb-2">Invalid Invite</h1>
          <p className="text-stone-500 mb-6">{error}</p>
          <Link to="/login">
            <Button>Go to Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (accepted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 text-green-500 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-stone-900 mb-2">You've Joined!</h1>
          <p className="text-stone-500 mb-2">
            You are now affiliated with <strong>{invite?.site.name}</strong>.
          </p>
          <p className="text-sm text-stone-400 mb-6">
            The site manager can now assign you to rotation slots.
          </p>
          <Button onClick={() => navigate('/dashboard')}>
            Go to Dashboard <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 px-8 py-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Stethoscope className="w-7 h-7" />
            </div>
            <span className="text-2xl font-bold">ClinicLink</span>
          </div>
          <p className="text-white/80 text-sm">You've been invited to join a clinical site</p>
        </div>

        {/* Site Info */}
        <div className="p-8">
          <div className="bg-stone-50 rounded-2xl p-5 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 text-white flex items-center justify-center flex-shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-stone-900">{invite?.site.name}</h2>
                {(invite?.site.city || invite?.site.state) && (
                  <p className="text-sm text-stone-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {[invite.site.city, invite.site.state].filter(Boolean).join(', ')}
                  </p>
                )}
                {invite?.site.specialties && invite.site.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {invite.site.specialties.slice(0, 4).map(s => (
                      <span key={s} className="text-xs bg-primary-100 text-primary-700 rounded-full px-2 py-0.5">{s}</span>
                    ))}
                    {invite.site.specialties.length > 4 && (
                      <span className="text-xs text-stone-400">+{invite.site.specialties.length - 4}</span>
                    )}
                  </div>
                )}
                {invite?.site.description && (
                  <p className="text-sm text-stone-600 mt-2 line-clamp-2">{invite.site.description}</p>
                )}
              </div>
            </div>
          </div>

          {invite?.invited_by && (
            <p className="text-sm text-stone-500 mb-6 text-center">
              Invited by <strong className="text-stone-700">{invite.invited_by}</strong>
            </p>
          )}

          {/* Actions */}
          {isAuthenticated && user?.role === 'preceptor' ? (
            <Button className="w-full" onClick={handleAccept} isLoading={accepting}>
              <CheckCircle className="w-4 h-4" /> Accept & Join This Site
            </Button>
          ) : isAuthenticated ? (
            <div className="text-center space-y-3">
              <div className="bg-amber-50 text-amber-800 rounded-xl px-4 py-3 text-sm">
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                Only preceptor accounts can accept site invites. You're logged in as <strong>{user?.role}</strong>.
              </div>
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-stone-600 text-center mb-4">
                Log in or register as a preceptor to join this site.
              </p>
              <Link to={`/login?redirect=/invite/${token}`} className="block">
                <Button className="w-full">
                  <LogIn className="w-4 h-4" /> Log In
                </Button>
              </Link>
              <Link to={`/register?redirect=/invite/${token}&role=preceptor${invite?.email ? `&email=${encodeURIComponent(invite.email)}` : ''}`} className="block">
                <Button variant="outline" className="w-full">
                  <UserPlus className="w-4 h-4" /> Create Account
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
