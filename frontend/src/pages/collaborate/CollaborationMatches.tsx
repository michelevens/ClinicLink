import { useState, useEffect } from 'react'
import { usePageTitle } from '../../hooks/usePageTitle.ts'
import { useAuth } from '../../contexts/AuthContext.tsx'
import { collaborateApi, type ApiCollaborationMatch } from '../../services/api.ts'
import { Button } from '../../components/ui/Button.tsx'
import { toast } from 'sonner'
import {
  Users, CheckCircle, X, Loader2, Star, MapPin, Stethoscope, Clock
} from 'lucide-react'

export default function CollaborationMatches() {
  usePageTitle('Collaboration Matches')
  const { user } = useAuth()
  const [matches, setMatches] = useState<ApiCollaborationMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [respondingId, setRespondingId] = useState<string | null>(null)

  useEffect(() => { loadMatches() }, [])

  const loadMatches = () => {
    setLoading(true)
    collaborateApi.listMatches().then(res => {
      setMatches(res.data || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }

  const handleRespond = async (matchId: string, status: 'accepted' | 'declined') => {
    setRespondingId(matchId)
    try {
      await collaborateApi.respondToMatch(matchId, status)
      toast.success(status === 'accepted' ? 'Match accepted!' : 'Match declined')
      loadMatches()
    } catch {
      toast.error('Failed to respond to match')
    } finally {
      setRespondingId(null)
    }
  }

  const statusStyles: Record<string, { bg: string; icon: React.ReactNode }> = {
    pending: { bg: 'bg-amber-100 text-amber-700', icon: <Clock className="w-3.5 h-3.5" /> },
    accepted: { bg: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle className="w-3.5 h-3.5" /> },
    declined: { bg: 'bg-red-100 text-red-700', icon: <X className="w-3.5 h-3.5" /> },
  }

  const isPhysician = user?.role === 'preceptor'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Collaboration Matches</h1>
        <p className="text-stone-500 mt-1">
          {isPhysician ? 'Review incoming match requests from NPs/PAs' : 'Track your matches with supervising physicians'}
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-stone-200 p-6 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-stone-200" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-stone-200 rounded w-1/3" />
                  <div className="h-3 bg-stone-100 rounded w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : matches.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
          <Users className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <h3 className="font-semibold text-stone-700 mb-1">No Matches Yet</h3>
          <p className="text-sm text-stone-500">
            {isPhysician
              ? 'You\'ll see incoming match requests here once NPs/PAs are matched with your profile'
              : 'Create a collaboration request to start receiving physician matches'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map(match => {
            const style = statusStyles[match.status] || statusStyles.pending
            const profile = match.physician_profile
            const request = match.request

            return (
              <div key={match.id} className="bg-white rounded-2xl border border-stone-200 p-6 hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {isPhysician
                        ? (request?.specialty?.[0] || '?')
                        : `${profile?.first_name?.[0] || ''}${profile?.last_name?.[0] || ''}`}
                    </div>
                    <div>
                      {isPhysician ? (
                        <>
                          <h3 className="font-semibold text-stone-900">{request?.specialty || 'Unknown'} — {request?.profession_type?.toUpperCase()}</h3>
                          <div className="flex items-center gap-3 text-sm text-stone-500 mt-0.5">
                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {request?.states_requested?.join(', ')}</span>
                            <span className="capitalize">{request?.practice_model?.replace('_', ' ')}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <h3 className="font-semibold text-stone-900">Dr. {profile?.first_name} {profile?.last_name}</h3>
                          <div className="flex items-center gap-3 text-sm text-stone-500 mt-0.5">
                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {profile?.licensed_states?.join(', ')}</span>
                            <span className="flex items-center gap-1"><Stethoscope className="w-3.5 h-3.5" /> {profile?.specialties?.slice(0, 2).join(', ')}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-1 rounded-lg text-xs font-medium">
                      <Star className="w-3 h-3" /> {match.match_score}%
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${style.bg}`}>
                      {style.icon} {match.status}
                    </div>
                  </div>
                </div>

                {/* Match reasons */}
                {match.match_reasons.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {match.match_reasons.map((reason, i) => (
                      <span key={i} className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-lg">{reason}</span>
                    ))}
                  </div>
                )}

                {/* Actions — physicians can accept/decline pending matches */}
                {isPhysician && match.status === 'pending' && (
                  <div className="flex gap-3 mt-4 pt-4 border-t border-stone-100">
                    <Button size="sm" onClick={() => handleRespond(match.id, 'accepted')} disabled={respondingId === match.id}
                      className="!rounded-xl bg-emerald-600 hover:bg-emerald-700">
                      {respondingId === match.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Accept
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleRespond(match.id, 'declined')} disabled={respondingId === match.id}
                      className="!rounded-xl text-red-600 border-red-200 hover:bg-red-50">
                      <X className="w-4 h-4" /> Decline
                    </Button>
                  </div>
                )}

                {match.responded_at && (
                  <p className="text-xs text-stone-400 mt-3">
                    Responded {new Date(match.responded_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
