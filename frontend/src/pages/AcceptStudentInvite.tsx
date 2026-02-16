import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.tsx'
import { studentInvitesApi, type ApiStudentInviteDetail } from '../services/api.ts'
import { Button } from '../components/ui/Button.tsx'
import { toast } from 'sonner'
import {
  GraduationCap, MapPin, BookOpen, CheckCircle, Loader2,
  AlertTriangle, LogIn, UserPlus, ArrowRight
} from 'lucide-react'

export function AcceptStudentInvite() {
  const { token } = useParams<{ token: string }>()
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  const [invite, setInvite] = useState<ApiStudentInviteDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [accepting, setAccepting] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [alreadyAcceptedUni, setAlreadyAcceptedUni] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    studentInvitesApi.validate(token)
      .then(res => {
        if (res.already_accepted) {
          setAlreadyAcceptedUni(res.university_name || 'the university')
        } else {
          setInvite(res.invite)
        }
        setLoading(false)
      })
      .catch(err => { setError(err.message || 'Invalid invite link'); setLoading(false) })
  }, [token])

  const handleAccept = async () => {
    if (!token) return
    setAccepting(true)
    try {
      const res = await studentInvitesApi.accept(token)
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

  if (accepted || alreadyAcceptedUni) {
    const uniName = accepted ? invite?.university.name : alreadyAcceptedUni
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 text-green-500 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-stone-900 mb-2">
            {alreadyAcceptedUni ? "You're Already Enrolled!" : "You've Joined!"}
          </h1>
          <p className="text-stone-500 mb-2">
            You are now a student at <strong>{uniName}</strong>.
          </p>
          {invite?.program && (
            <p className="text-sm text-stone-400 mb-2">
              Program: <strong>{invite.program.name}</strong> ({invite.program.degree_type})
            </p>
          )}
          <p className="text-sm text-stone-400 mb-6">
            Your coordinator can now manage your program placement and track your progress.
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
              <GraduationCap className="w-7 h-7" />
            </div>
            <span className="text-2xl font-bold">ClinicLink</span>
          </div>
          <p className="text-white/80 text-sm">You've been invited to join a university</p>
        </div>

        {/* University Info */}
        <div className="p-8">
          <div className="bg-stone-50 rounded-2xl p-5 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 text-white flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-stone-900">{invite?.university.name}</h2>
                {(invite?.university.city || invite?.university.state) && (
                  <p className="text-sm text-stone-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {[invite.university.city, invite.university.state].filter(Boolean).join(', ')}
                  </p>
                )}
                {invite?.program && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <BookOpen className="w-3.5 h-3.5 text-primary-500" />
                    <span className="text-sm text-stone-700 font-medium">
                      {invite.program.name} ({invite.program.degree_type})
                    </span>
                  </div>
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
          {isAuthenticated && user?.role === 'student' ? (
            <Button className="w-full" onClick={handleAccept} isLoading={accepting}>
              <CheckCircle className="w-4 h-4" /> Accept & Join University
            </Button>
          ) : isAuthenticated ? (
            <div className="text-center space-y-3">
              <div className="bg-amber-50 text-amber-800 rounded-xl px-4 py-3 text-sm">
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                Only student accounts can accept student invites. You're logged in as <strong>{user?.role}</strong>.
              </div>
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-stone-600 text-center mb-4">
                Log in or register as a student to join this university.
              </p>
              <Link to={`/login?redirect=/student-invite/${token}`} className="block">
                <Button className="w-full">
                  <LogIn className="w-4 h-4" /> Log In
                </Button>
              </Link>
              <Link to={`/register?redirect=/student-invite/${token}&role=student${invite?.email ? `&email=${encodeURIComponent(invite.email)}` : ''}`} className="block">
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
