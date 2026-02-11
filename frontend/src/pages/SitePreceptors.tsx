import { useState } from 'react'
import { Card } from '../components/ui/Card.tsx'
import { Badge } from '../components/ui/Badge.tsx'
import { Button } from '../components/ui/Button.tsx'
import { Input } from '../components/ui/Input.tsx'
import { useSitePreceptors, useSiteInvites, useCreateInvite, useRevokeInvite, useMySites } from '../hooks/useApi.ts'
import { toast } from 'sonner'
import {
  User, Mail, Phone, Calendar, Stethoscope, Loader2, UserX,
  Link2, Copy, Plus, Trash2, CheckCircle, Clock,
  Building2, Send
} from 'lucide-react'

export function SitePreceptors() {
  const { data, isLoading } = useSitePreceptors()
  const { data: invitesData } = useSiteInvites()
  const { data: sitesData } = useMySites()
  const createInvite = useCreateInvite()
  const revokeInvite = useRevokeInvite()

  const preceptors = data?.preceptors || []
  const invites = invitesData?.invites || []
  const sites = sitesData?.sites || []

  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteSiteId, setInviteSiteId] = useState('')
  const [copiedToken, setCopiedToken] = useState<string | null>(null)

  const pendingInvites = invites.filter(i => i.status === 'pending')
  const acceptedInvites = invites.filter(i => i.status === 'accepted')

  const handleCreateInvite = async () => {
    const siteId = inviteSiteId || sites[0]?.id
    if (!siteId) {
      toast.error('No site available — create a site first')
      return
    }
    try {
      const res = await createInvite.mutateAsync({
        site_id: siteId,
        email: inviteEmail || undefined,
        expires_in_days: 30,
      })
      const url = res.invite.url
      await navigator.clipboard.writeText(url).catch(() => {})
      toast.success('Invite link created and copied to clipboard!')
      setInviteEmail('')
      setShowInviteForm(false)
    } catch {
      toast.error('Failed to create invite')
    }
  }

  const handleCopyLink = async (token: string) => {
    const frontendUrl = window.location.origin + (import.meta.env.BASE_URL || '/')
    const url = `${frontendUrl}invite/${token}`
    try {
      await navigator.clipboard.writeText(url)
      setCopiedToken(token)
      toast.success('Link copied!')
      setTimeout(() => setCopiedToken(null), 2000)
    } catch {
      toast.error('Failed to copy')
    }
  }

  const handleRevoke = async (id: string) => {
    try {
      await revokeInvite.mutateAsync(id)
      toast.success('Invite revoked')
    } catch {
      toast.error('Failed to revoke invite')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Preceptors</h1>
          <p className="text-stone-500">Manage preceptors affiliated with your sites</p>
        </div>
        <Button onClick={() => setShowInviteForm(!showInviteForm)}>
          <Plus className="w-4 h-4" /> Invite Preceptor
        </Button>
      </div>

      {/* Invite Form */}
      {showInviteForm && (
        <Card className="border-2 border-primary-200 bg-primary-50/30">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary-700">
              <Send className="w-5 h-5" />
              <h3 className="font-semibold">Create Invite Link</h3>
            </div>
            <p className="text-sm text-stone-600">
              Generate a unique link to share with a preceptor. They'll click the link to join your site.
            </p>
            {sites.length > 1 && (
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-stone-700">Site</label>
                <select
                  value={inviteSiteId || sites[0]?.id || ''}
                  onChange={e => setInviteSiteId(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                >
                  {sites.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}
            <Input
              label="Preceptor Email (optional)"
              type="email"
              placeholder="preceptor@hospital.com"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
            />
            <p className="text-xs text-stone-400">
              Leave blank to create an open link anyone can use, or enter an email to restrict it.
            </p>
            <div className="flex gap-3">
              <Button onClick={handleCreateInvite} isLoading={createInvite.isPending}>
                <Link2 className="w-4 h-4" /> Generate & Copy Link
              </Button>
              <Button variant="ghost" onClick={() => setShowInviteForm(false)}>Cancel</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Pending Invites */}
      {pendingInvites.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4" /> Pending Invites ({pendingInvites.length})
          </h2>
          {pendingInvites.map(invite => (
            <Card key={invite.id} className="!py-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                    <Link2 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-stone-900 truncate">
                      {invite.email || 'Open invite (anyone)'}
                    </p>
                    <p className="text-xs text-stone-500 flex items-center gap-1">
                      <Building2 className="w-3 h-3" /> {invite.site_name}
                      <span className="mx-1">·</span>
                      Expires {new Date(invite.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleCopyLink(invite.token)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors"
                  >
                    {copiedToken === invite.token ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedToken === invite.token ? 'Copied!' : 'Copy Link'}
                  </button>
                  <button
                    onClick={() => handleRevoke(invite.id)}
                    className="p-1.5 text-stone-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                    title="Revoke invite"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Accepted Invites */}
      {acceptedInvites.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" /> Joined via Invite ({acceptedInvites.length})
          </h2>
          {acceptedInvites.map(invite => (
            <Card key={invite.id} className="!py-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-stone-900">
                    {invite.accepted_by?.name || 'Unknown'}
                  </p>
                  <p className="text-xs text-stone-500">
                    {invite.accepted_by?.email} · Joined {invite.accepted_at ? new Date(invite.accepted_at).toLocaleDateString() : ''}
                  </p>
                </div>
                <span className="ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Joined</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Preceptor List (from slot assignments + invites) */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wider flex items-center gap-2">
          <User className="w-4 h-4" /> Your Preceptors ({preceptors.length})
        </h2>

        {preceptors.length === 0 && pendingInvites.length === 0 && acceptedInvites.length === 0 ? (
          <Card className="text-center py-12">
            <UserX className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-stone-700 mb-2">No preceptors yet</h3>
            <p className="text-stone-500 mb-4">Invite preceptors to join your site using the button above</p>
            <Button onClick={() => setShowInviteForm(true)}>
              <Plus className="w-4 h-4" /> Invite Preceptor
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {preceptors.map(preceptor => (
              <Card key={preceptor.id}>
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center shrink-0 text-lg font-semibold">
                      {preceptor.first_name[0]}{preceptor.last_name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-stone-900 text-lg">
                        {preceptor.first_name} {preceptor.last_name}
                      </h3>
                      <div className="flex flex-wrap gap-3 mt-1 text-sm text-stone-500">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" />
                          {preceptor.email}
                        </span>
                        {preceptor.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5" />
                            {preceptor.phone}
                          </span>
                        )}
                      </div>

                      {preceptor.slots.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs font-medium text-stone-400 uppercase tracking-wider">Assigned Rotations</p>
                          {preceptor.slots.map(slot => (
                            <div key={slot.id} className="flex flex-wrap items-center gap-2 text-sm">
                              <span className="flex items-center gap-1 text-stone-700 font-medium">
                                <Stethoscope className="w-3.5 h-3.5 text-primary-500" />
                                {slot.title}
                              </span>
                              <Badge variant="primary">{slot.specialty}</Badge>
                              <Badge variant={slot.status === 'open' ? 'success' : slot.status === 'filled' ? 'warning' : 'danger'}>
                                {slot.status}
                              </Badge>
                              <span className="flex items-center gap-1 text-xs text-stone-400">
                                <Calendar className="w-3 h-3" />
                                {new Date(slot.start_date).toLocaleDateString()} - {new Date(slot.end_date).toLocaleDateString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0">
                    <Badge variant="primary">
                      <User className="w-3.5 h-3.5 mr-1" />
                      {preceptor.slots.length} slot{preceptor.slots.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
