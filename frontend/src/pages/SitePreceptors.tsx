import { useState, useRef } from 'react'
import { Card } from '../components/ui/Card.tsx'
import { Badge } from '../components/ui/Badge.tsx'
import { Button } from '../components/ui/Button.tsx'
import { Input } from '../components/ui/Input.tsx'
import { useSitePreceptors, useSiteInvites, useCreateInvite, useBulkCreateInvites, useResendInvite, useRevokeInvite, useMySites, useSiteJoinRequests, useApproveJoinRequest, useDenyJoinRequest } from '../hooks/useApi.ts'
import { toast } from 'sonner'
import {
  User, Mail, Phone, Calendar, Stethoscope, Loader2, UserX,
  Link2, Copy, Plus, Trash2, CheckCircle, Clock,
  Building2, Send, Upload, X, Users, AlertCircle, Download, AlertTriangle
} from 'lucide-react'

const MESSAGE_TEMPLATES = [
  {
    label: 'Preceptor Welcome',
    message: `We'd like to invite you to join our clinical rotation site on ClinicLink — a platform that simplifies rotation management, student matching, hour tracking, and evaluations.

Click the link below to create your account and get started. We look forward to working with you!`,
  },
  {
    label: 'School / Coordinator Outreach',
    message: `We're excited to introduce you to ClinicLink — a clinical rotation matching platform that connects nursing schools, clinical sites, and preceptors.

As a coordinator, you can manage student placements, track compliance, and streamline the rotation process. Click below to join and explore the platform!`,
  },
  {
    label: 'Site Manager Invitation',
    message: `You're invited to manage your clinical site on ClinicLink. Our platform helps you coordinate rotation slots, manage preceptors, track student hours, and ensure compliance — all in one place.

Click the link below to set up your account and start managing your site.`,
  },
  {
    label: 'General Platform Invite',
    message: `You're invited to try ClinicLink — a modern platform for managing clinical rotations, connecting students with preceptors, and streamlining the entire placement process.

Join us and see how ClinicLink can simplify your workflow. Click the link below to get started!`,
  },
]

export function SitePreceptors() {
  const { data, isLoading } = useSitePreceptors()
  const { data: invitesData } = useSiteInvites()
  const { data: sitesData } = useMySites()
  const { data: joinRequestsData } = useSiteJoinRequests({ status: 'pending' })
  const createInvite = useCreateInvite()
  const bulkCreateInvites = useBulkCreateInvites()
  const resendInvite = useResendInvite()
  const revokeInvite = useRevokeInvite()
  const approveJoinRequest = useApproveJoinRequest()
  const denyJoinRequest = useDenyJoinRequest()

  const preceptors = data?.preceptors || []
  const invites = invitesData?.invites || []
  const sites = sitesData?.sites || []
  const pendingJoinRequests = joinRequestsData?.join_requests || []

  // Single invite state
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteSiteId, setInviteSiteId] = useState('')
  const [inviteMessage, setInviteMessage] = useState('')
  const [copiedToken, setCopiedToken] = useState<string | null>(null)

  // Bulk invite state
  const [showBulkForm, setShowBulkForm] = useState(false)
  const [bulkEmails, setBulkEmails] = useState<string[]>([])
  const [bulkEmailInput, setBulkEmailInput] = useState('')
  const [bulkSiteId, setBulkSiteId] = useState('')
  const [bulkMessage, setBulkMessage] = useState('')
  const [bulkResults, setBulkResults] = useState<{ email: string; status: string; reason?: string }[] | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
        message: inviteMessage || undefined,
        expires_in_days: 30,
      })
      const url = res.invite.url
      await navigator.clipboard.writeText(url).catch(() => {})
      toast.success('Invite link created and copied to clipboard!')
      setInviteEmail('')
      setInviteMessage('')
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

  const handleResend = async (id: string) => {
    try {
      const res = await resendInvite.mutateAsync(id)
      toast.success(res.message || 'Invite resent')
    } catch {
      toast.error('Failed to resend invite')
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

  const handleDownloadTemplate = () => {
    const csv = 'email\njohn.doe@hospital.com\njane.smith@university.edu\ndr.preceptor@clinic.org\n'
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'invite_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  // CSV / bulk helpers
  const parseEmails = (text: string): string[] => {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
    const matches = text.match(emailRegex) || []
    return [...new Set(matches.map(e => e.toLowerCase()))]
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const emails = parseEmails(text)
      if (emails.length === 0) {
        toast.error('No valid email addresses found in file')
        return
      }
      setBulkEmails(prev => [...new Set([...prev, ...emails])])
      toast.success(`Found ${emails.length} email address${emails.length !== 1 ? 'es' : ''}`)
    }
    reader.readAsText(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleAddEmails = () => {
    const emails = parseEmails(bulkEmailInput)
    if (emails.length === 0) {
      toast.error('No valid email addresses found')
      return
    }
    setBulkEmails(prev => [...new Set([...prev, ...emails])])
    setBulkEmailInput('')
    toast.success(`Added ${emails.length} email${emails.length !== 1 ? 's' : ''}`)
  }

  const handleRemoveEmail = (email: string) => {
    setBulkEmails(prev => prev.filter(e => e !== email))
  }

  const handleBulkSend = async () => {
    const siteId = bulkSiteId || sites[0]?.id
    if (!siteId) {
      toast.error('No site available — create a site first')
      return
    }
    if (bulkEmails.length === 0) {
      toast.error('Add at least one email address')
      return
    }
    try {
      const res = await bulkCreateInvites.mutateAsync({
        site_id: siteId,
        emails: bulkEmails,
        message: bulkMessage || undefined,
        expires_in_days: 30,
      })
      setBulkResults(res.results)
      toast.success(res.message)
      setBulkEmails([])
    } catch {
      toast.error('Failed to send bulk invites')
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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Preceptors</h1>
          <p className="text-stone-500">Manage preceptors affiliated with your sites</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => { setShowBulkForm(!showBulkForm); setShowInviteForm(false) }}>
            <Users className="w-4 h-4" /> Bulk Invite
          </Button>
          <Button onClick={() => { setShowInviteForm(!showInviteForm); setShowBulkForm(false) }}>
            <Plus className="w-4 h-4" /> Invite Preceptor
          </Button>
        </div>
      </div>

      {/* Pending Join Requests — Prominent Banner */}
      {pendingJoinRequests.length > 0 && (
        <Card className="border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-amber-800 text-lg">
                {pendingJoinRequests.length} Pending Join Request{pendingJoinRequests.length !== 1 ? 's' : ''}
              </p>
              <p className="text-sm text-amber-700">Preceptors are requesting to join your site. Review and respond below.</p>
            </div>
          </div>
          <div className="space-y-3">
            {pendingJoinRequests.map(req => (
              <div key={req.id} className="flex items-start justify-between gap-4 p-3 bg-white/70 rounded-xl border border-amber-200">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-stone-900">
                      {req.preceptor?.first_name} {req.preceptor?.last_name}
                    </p>
                    <p className="text-xs text-stone-500">
                      {req.preceptor?.email}
                      <span className="mx-1">&middot;</span>
                      <Building2 className="w-3 h-3 inline" /> {req.site?.name}
                      <span className="mx-1">&middot;</span>
                      {new Date(req.created_at).toLocaleDateString()}
                    </p>
                    {req.message && (
                      <p className="text-xs text-stone-600 mt-1 italic">"{req.message}"</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    onClick={async () => {
                      try {
                        await approveJoinRequest.mutateAsync({ id: req.id })
                        toast.success(`Approved ${req.preceptor?.first_name}'s request`)
                      } catch { toast.error('Failed to approve') }
                    }}
                    isLoading={approveJoinRequest.isPending}
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Approve
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        await denyJoinRequest.mutateAsync({ id: req.id })
                        toast.success('Request denied')
                      } catch { toast.error('Failed to deny') }
                    }}
                    isLoading={denyJoinRequest.isPending}
                  >
                    Deny
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Single Invite Form */}
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
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-stone-700">Personal Message (optional)</label>
                <select
                  onChange={e => { if (e.target.value) setInviteMessage(e.target.value); e.target.value = '' }}
                  className="text-xs border border-stone-200 rounded-lg px-2 py-1 text-stone-500 bg-white"
                  defaultValue=""
                >
                  <option value="" disabled>Use template...</option>
                  {MESSAGE_TEMPLATES.map(t => (
                    <option key={t.label} value={t.message}>{t.label}</option>
                  ))}
                </select>
              </div>
              <textarea
                value={inviteMessage}
                onChange={e => setInviteMessage(e.target.value)}
                placeholder="Add a personal message to include in the invite email..."
                rows={4}
                className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none resize-none"
              />
            </div>
            <p className="text-xs text-stone-400">
              Leave email blank to create an open link anyone can use, or enter an email to restrict it.
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

      {/* Bulk Invite Form */}
      {showBulkForm && (
        <Card className="border-2 border-violet-200 bg-violet-50/30">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-violet-700">
                <Users className="w-5 h-5" />
                <h3 className="font-semibold">Bulk Invite</h3>
              </div>
              <button onClick={() => { setShowBulkForm(false); setBulkResults(null) }} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-stone-600">
              Import a list of email addresses via CSV file or paste them directly. Each person will receive a unique invite link.
            </p>

            {/* Site selector */}
            {sites.length > 1 && (
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-stone-700">Site</label>
                <select
                  value={bulkSiteId || sites[0]?.id || ''}
                  onChange={e => setBulkSiteId(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                >
                  {sites.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* CSV Upload + Manual Entry */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Upload CSV File</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-stone-300 rounded-xl text-sm text-stone-500 hover:border-violet-400 hover:text-violet-600 hover:bg-violet-50/50 transition-colors"
                >
                  <Upload className="w-5 h-5" />
                  <span>Click to upload CSV or text file</span>
                </button>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-stone-400">Emails will be extracted automatically from any column</p>
                  <button onClick={handleDownloadTemplate} className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-800 font-medium">
                    <Download className="w-3 h-3" /> Template
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Or paste emails</label>
                <textarea
                  value={bulkEmailInput}
                  onChange={e => setBulkEmailInput(e.target.value)}
                  placeholder={"john@hospital.com\njane@university.edu\ndr.smith@clinic.org"}
                  rows={4}
                  className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none resize-none"
                />
                <div className="flex justify-end mt-1">
                  <button
                    onClick={handleAddEmails}
                    className="text-xs font-medium text-violet-600 hover:text-violet-800"
                  >
                    + Add to list
                  </button>
                </div>
              </div>
            </div>

            {/* Email list */}
            {bulkEmails.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-stone-700">
                    {bulkEmails.length} recipient{bulkEmails.length !== 1 ? 's' : ''}
                  </label>
                  <button
                    onClick={() => setBulkEmails([])}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Clear all
                  </button>
                </div>
                <div className="max-h-40 overflow-y-auto rounded-xl border border-stone-200 bg-white divide-y divide-stone-100">
                  {bulkEmails.map(email => (
                    <div key={email} className="flex items-center justify-between px-3 py-2 text-sm">
                      <span className="text-stone-700 flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-stone-400" />
                        {email}
                      </span>
                      <button onClick={() => handleRemoveEmail(email)} className="text-stone-400 hover:text-red-500">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Message editor with templates */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-stone-700">Email Message (optional)</label>
                <select
                  onChange={e => { if (e.target.value) setBulkMessage(e.target.value); e.target.value = '' }}
                  className="text-xs border border-stone-200 rounded-lg px-2 py-1 text-stone-500 bg-white"
                  defaultValue=""
                >
                  <option value="" disabled>Use template...</option>
                  {MESSAGE_TEMPLATES.map(t => (
                    <option key={t.label} value={t.message}>{t.label}</option>
                  ))}
                </select>
              </div>
              <textarea
                value={bulkMessage}
                onChange={e => setBulkMessage(e.target.value)}
                placeholder="Add a personal message to include in all invite emails..."
                rows={5}
                className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none resize-none"
              />
            </div>

            {/* Send button */}
            <div className="flex items-center gap-3">
              <Button
                onClick={handleBulkSend}
                isLoading={bulkCreateInvites.isPending}
                disabled={bulkEmails.length === 0}
              >
                <Send className="w-4 h-4" /> Send {bulkEmails.length} Invite{bulkEmails.length !== 1 ? 's' : ''}
              </Button>
              <Button variant="ghost" onClick={() => { setShowBulkForm(false); setBulkResults(null) }}>Cancel</Button>
            </div>

            {/* Bulk results */}
            {bulkResults && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-stone-700">Results</h4>
                <div className="max-h-48 overflow-y-auto rounded-xl border border-stone-200 bg-white divide-y divide-stone-100">
                  {bulkResults.map((r, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 text-sm">
                      <span className="text-stone-700">{r.email}</span>
                      <span className={`flex items-center gap-1 text-xs font-medium ${
                        r.status === 'sent' ? 'text-green-600' :
                        r.status === 'skipped' ? 'text-amber-600' : 'text-stone-500'
                      }`}>
                        {r.status === 'sent' && <CheckCircle className="w-3.5 h-3.5" />}
                        {r.status === 'skipped' && <AlertCircle className="w-3.5 h-3.5" />}
                        {r.status === 'sent' ? 'Sent' : r.status === 'skipped' ? `Skipped: ${r.reason}` : `Created (${r.reason})`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                      <span className="mx-1">&middot;</span>
                      Expires {new Date(invite.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {invite.email && (
                    <button
                      onClick={() => handleResend(invite.id)}
                      disabled={resendInvite.isPending}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-lg transition-colors disabled:opacity-50"
                      title="Resend invite email"
                    >
                      <Send className="w-3.5 h-3.5" /> Resend
                    </button>
                  )}
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
                    {invite.accepted_by?.email} &middot; Joined {invite.accepted_at ? new Date(invite.accepted_at).toLocaleDateString() : ''}
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
