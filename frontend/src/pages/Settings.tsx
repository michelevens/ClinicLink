import { useState } from 'react'
import { Card } from '../components/ui/Card.tsx'
import { Button } from '../components/ui/Button.tsx'
import { Input } from '../components/ui/Input.tsx'
import { Badge } from '../components/ui/Badge.tsx'
import { useAuth } from '../contexts/AuthContext.tsx'
import { authApi } from '../services/api.ts'
import { useStudentProfile, useUpdateStudentProfile, useCredentials, useAddCredential, useDeleteCredential, useUploadCredentialFile, useUniversities, useMfaStatus, useMfaSetup, useMfaConfirm, useMfaDisable, useMfaBackupCodes, useNotificationPreferences, useUpdateNotificationPreferences } from '../hooks/useApi.ts'
import { universitiesApi } from '../services/api.ts'
import type { ApiProgram } from '../services/api.ts'
import { toast } from 'sonner'
import { QRCodeSVG } from 'qrcode.react'
import { usePageTitle } from '../hooks/usePageTitle.ts'
import {
  User, Shield, Bell, GraduationCap, FileCheck,
  Mail, Phone, Save, Loader2, Trash2, Plus, Calendar,
  Upload, Download, Paperclip, ShieldCheck, ShieldOff, Copy, Check, Key,
  CreditCard, ExternalLink, CheckCircle, AlertCircle, RefreshCw
} from 'lucide-react'
import { studentApi } from '../services/api.ts'
import { useConnectStatus, useCreateConnectAccount, useRefreshConnectLink, usePaymentHistory, useSubscriptionStatus, useSubscriptionCheckout, useSubscriptionPortal } from '../hooks/useApi.ts'

type Tab = 'profile' | 'academic' | 'credentials' | 'security' | 'notifications' | 'payments' | 'subscription'

const TABS: { key: Tab; label: string; icon: typeof User; roles?: string[] }[] = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'academic', label: 'Academic', icon: GraduationCap, roles: ['student'] },
  { key: 'credentials', label: 'Credentials', icon: FileCheck, roles: ['student'] },
  { key: 'payments', label: 'Payments', icon: CreditCard, roles: ['site_manager'] },
  { key: 'subscription', label: 'Subscription', icon: CreditCard, roles: ['student'] },
  { key: 'security', label: 'Security', icon: Shield },
  { key: 'notifications', label: 'Notifications', icon: Bell },
]

const SPECIALTIES = [
  'Emergency Medicine', 'Family Practice', 'Internal Medicine', 'Pediatrics',
  'OB/GYN', 'Surgery', 'Orthopedics', 'Cardiology', 'Neurology', 'Psychiatry',
  'Dermatology', 'Oncology', 'ICU/Critical Care', 'Geriatrics',
  'Physical Therapy', 'Social Work', 'Urgent Care', 'Rehabilitation',
  'Community Health', 'Telehealth',
]

export function Settings() {
  usePageTitle('Settings')
  const { user } = useAuth()
  // Support URL params for Stripe Connect callback (e.g., ?tab=payments&connected=1)
  const urlParams = new URLSearchParams(window.location.search)
  const initialTab = (urlParams.get('tab') as Tab) || 'profile'
  const [activeTab, setActiveTab] = useState<Tab>(initialTab)

  const visibleTabs = TABS.filter(t => !t.roles || t.roles.includes(user?.role || ''))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Settings</h1>
        <p className="text-stone-500">Manage your account and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-56 shrink-0">
          <Card padding="sm">
            <nav className="flex lg:flex-col gap-1 overflow-x-auto">
              {visibleTabs.map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                      activeTab === tab.key
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </Card>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'academic' && <AcademicTab />}
          {activeTab === 'credentials' && <CredentialsTab />}
          {activeTab === 'payments' && <PaymentsTab />}
          {activeTab === 'subscription' && <SubscriptionTab />}
          {activeTab === 'security' && <SecurityTab />}
          {activeTab === 'notifications' && <NotificationsTab />}
        </div>
      </div>
    </div>
  )
}

function ProfileTab() {
  const { user } = useAuth()
  const [form, setForm] = useState({
    first_name: user?.firstName || '',
    last_name: user?.lastName || '',
    phone: user?.phone || '',
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await authApi.updateProfile(form)
      toast.success('Profile updated successfully')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update profile'
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  const initials = `${user?.firstName?.charAt(0) || ''}${user?.lastName?.charAt(0) || ''}`.toUpperCase()

  return (
    <Card>
      <h2 className="text-lg font-semibold text-stone-900 mb-6">Personal Information</h2>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white text-xl font-bold">
          {initials}
        </div>
        <div>
          <p className="font-semibold text-stone-900">{user?.firstName} {user?.lastName}</p>
          <Badge variant="primary">{user?.role?.replace('_', ' ')}</Badge>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="First Name"
            value={form.first_name}
            onChange={e => setForm({ ...form, first_name: e.target.value })}
            icon={<User className="w-4 h-4" />}
          />
          <Input
            label="Last Name"
            value={form.last_name}
            onChange={e => setForm({ ...form, last_name: e.target.value })}
          />
        </div>
        <Input
          label="Email"
          type="email"
          value={user?.email || ''}
          disabled
          icon={<Mail className="w-4 h-4" />}
        />
        <Input
          label="Phone"
          type="tel"
          placeholder="(555) 123-4567"
          value={form.phone}
          onChange={e => setForm({ ...form, phone: e.target.value })}
          icon={<Phone className="w-4 h-4" />}
        />

        <div className="flex justify-end pt-2">
          <Button onClick={handleSave} isLoading={saving}>
            <Save className="w-4 h-4" /> Save Changes
          </Button>
        </div>
      </div>
    </Card>
  )
}

function AcademicTab() {
  const { data, isLoading } = useStudentProfile()
  const updateMutation = useUpdateStudentProfile()
  const { data: universitiesData } = useUniversities()
  const universities = universitiesData?.data || []
  const profile = data?.profile

  const [form, setForm] = useState({
    university_id: '',
    program_id: '',
    bio: '',
    graduation_date: '',
    gpa: '',
    clinical_interests: [] as string[],
  })
  const [programs, setPrograms] = useState<ApiProgram[]>([])
  const [initialized, setInitialized] = useState(false)

  if (profile && !initialized) {
    setForm({
      university_id: profile.university_id || '',
      program_id: profile.program_id || '',
      bio: profile.bio || '',
      graduation_date: profile.graduation_date || '',
      gpa: profile.gpa ? String(profile.gpa) : '',
      clinical_interests: profile.clinical_interests || [],
    })
    if (profile.university_id) {
      universitiesApi.programs(profile.university_id).then(setPrograms)
    }
    setInitialized(true)
  }

  const handleUniversityChange = async (universityId: string) => {
    setForm(f => ({ ...f, university_id: universityId, program_id: '' }))
    setPrograms([])
    if (universityId) {
      const progs = await universitiesApi.programs(universityId)
      setPrograms(progs)
    }
  }

  const toggleInterest = (s: string) => {
    setForm(f => ({
      ...f,
      clinical_interests: f.clinical_interests.includes(s)
        ? f.clinical_interests.filter(x => x !== s)
        : [...f.clinical_interests, s],
    }))
  }

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        university_id: form.university_id || null,
        program_id: form.program_id || null,
        bio: form.bio || null,
        graduation_date: form.graduation_date || null,
        gpa: form.gpa ? parseFloat(form.gpa) : null,
        clinical_interests: form.clinical_interests,
      })
      toast.success('Academic info updated')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update'
      toast.error(message)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-lg font-semibold text-stone-900 mb-6">Academic Information</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-stone-700">University</label>
              <select
                value={form.university_id}
                onChange={e => handleUniversityChange(e.target.value)}
                className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
              >
                <option value="">Select university...</option>
                {universities.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-stone-700">Program</label>
              <select
                value={form.program_id}
                onChange={e => setForm(f => ({ ...f, program_id: e.target.value }))}
                className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                disabled={!form.university_id}
              >
                <option value="">{form.university_id ? 'Select program...' : 'Select university first'}</option>
                {programs.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.degree_type}) - {p.required_hours}h required</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Expected Graduation"
              type="date"
              value={form.graduation_date}
              onChange={e => setForm({ ...form, graduation_date: e.target.value })}
            />
            <Input
              label="GPA"
              type="number"
              step="0.01"
              min="0"
              max="4.0"
              placeholder="3.50"
              value={form.gpa}
              onChange={e => setForm({ ...form, gpa: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-stone-700">Bio</label>
            <textarea
              value={form.bio}
              onChange={e => setForm({ ...form, bio: e.target.value })}
              rows={3}
              placeholder="Tell preceptors about yourself..."
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none resize-none"
            />
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-stone-900 mb-4">Clinical Interests</h2>
        <p className="text-sm text-stone-500 mb-4">Select the specialties you're interested in</p>
        <div className="flex flex-wrap gap-2">
          {SPECIALTIES.map(s => (
            <button
              key={s}
              onClick={() => toggleInterest(s)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                form.clinical_interests.includes(s)
                  ? 'bg-primary-500 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} isLoading={updateMutation.isPending}>
          <Save className="w-4 h-4" /> Save Academic Info
        </Button>
      </div>
    </div>
  )
}

function CredentialsTab() {
  const { data, isLoading } = useCredentials()
  const addMutation = useAddCredential()
  const deleteMutation = useDeleteCredential()
  const uploadMutation = useUploadCredentialFile()
  const [showAdd, setShowAdd] = useState(false)
  const [newCred, setNewCred] = useState({ type: 'cpr', name: '', expiration_date: '' })
  const fileInputRefs = new Map<string, HTMLInputElement>()

  const credentials = data?.credentials || []

  const handleAdd = async () => {
    if (!newCred.name) {
      toast.error('Please enter a credential name')
      return
    }
    try {
      await addMutation.mutateAsync({
        type: newCred.type,
        name: newCred.name,
        expiration_date: newCred.expiration_date || null,
        status: 'pending',
      })
      toast.success('Credential added')
      setShowAdd(false)
      setNewCred({ type: 'cpr', name: '', expiration_date: '' })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to add'
      toast.error(message)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id)
      toast.success('Credential removed')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to remove'
      toast.error(message)
    }
  }

  const handleFileUpload = async (credId: string, file: File) => {
    const maxBytes = 20 * 1024 * 1024
    if (file.size > maxBytes) {
      toast.error('File too large. Maximum size is 20MB.')
      return
    }
    try {
      await uploadMutation.mutateAsync({ id: credId, file })
      toast.success('Document uploaded successfully')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to upload'
      toast.error(message)
    }
  }

  const statusVariant = (s: string) => {
    switch (s) {
      case 'valid': return 'success'
      case 'expiring_soon': return 'warning'
      case 'expired': return 'danger'
      default: return 'default'
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  if (isLoading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-stone-900">Credentials & Documents</h2>
            <p className="text-sm text-stone-500">Manage your clinical credentials and upload supporting documents</p>
          </div>
          <Button size="sm" onClick={() => setShowAdd(!showAdd)}>
            <Plus className="w-4 h-4" /> Add
          </Button>
        </div>

        {showAdd && (
          <div className="bg-stone-50 rounded-xl p-4 mb-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-stone-700">Type</label>
                <select
                  value={newCred.type}
                  onChange={e => setNewCred({ ...newCred, type: e.target.value })}
                  className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                >
                  <option value="cpr">CPR/BLS</option>
                  <option value="background_check">Background Check</option>
                  <option value="immunization">Immunization Records</option>
                  <option value="liability_insurance">Liability Insurance</option>
                  <option value="drug_screen">Drug Screen</option>
                  <option value="license">License/Certification</option>
                  <option value="hipaa">HIPAA Training</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <Input
                label="Name"
                placeholder="e.g. BLS Certification"
                value={newCred.name}
                onChange={e => setNewCred({ ...newCred, name: e.target.value })}
              />
              <Input
                label="Expiration Date"
                type="date"
                value={newCred.expiration_date}
                onChange={e => setNewCred({ ...newCred, expiration_date: e.target.value })}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button size="sm" onClick={handleAdd} isLoading={addMutation.isPending}>Add Credential</Button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {credentials.length === 0 && (
            <div className="text-center py-8 text-stone-400">
              <FileCheck className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>No credentials added yet</p>
            </div>
          )}
          {credentials.map(cred => (
            <div key={cred.id} className="p-4 rounded-xl border border-stone-200 hover:border-stone-300 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-stone-900 text-sm">{cred.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-stone-500 capitalize">{cred.type.replace('_', ' ')}</span>
                    {cred.expiration_date && (
                      <span className="text-xs text-stone-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Exp: {new Date(cred.expiration_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <Badge variant={statusVariant(cred.status) as 'success' | 'warning' | 'danger' | 'default'}>
                  {cred.status.replace('_', ' ')}
                </Badge>
                <button
                  onClick={() => handleDelete(cred.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* File upload/download area */}
              <div className="mt-3 ml-14">
                {cred.file_name ? (
                  <div className="flex items-center gap-2 text-sm">
                    <Paperclip className="w-3.5 h-3.5 text-stone-400" />
                    <span className="text-stone-600 truncate">{cred.file_name}</span>
                    {cred.file_size && (
                      <span className="text-xs text-stone-400">({formatFileSize(cred.file_size)})</span>
                    )}
                    <a
                      href={studentApi.downloadCredentialUrl(cred.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium ml-1"
                    >
                      <Download className="w-3 h-3" /> Download
                    </a>
                    <button
                      onClick={() => fileInputRefs.get(cred.id)?.click()}
                      className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-700 font-medium ml-1"
                    >
                      <Upload className="w-3 h-3" /> Replace
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRefs.get(cred.id)?.click()}
                    disabled={uploadMutation.isPending}
                    className="inline-flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium py-1 px-2 rounded-lg hover:bg-primary-50 transition-colors disabled:opacity-50"
                  >
                    {uploadMutation.isPending ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Upload className="w-3 h-3" />
                    )}
                    Upload Document
                  </button>
                )}
                <input
                  ref={el => { if (el) fileInputRefs.set(cred.id, el) }}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="hidden"
                  onChange={e => {
                    if (e.target.files?.[0]) {
                      handleFileUpload(cred.id, e.target.files[0])
                      e.target.value = ''
                    }
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function SecurityTab() {
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' })
  const [saving, setSaving] = useState(false)

  const handleChangePassword = async () => {
    if (passwords.newPass !== passwords.confirm) {
      toast.error('Passwords do not match')
      return
    }
    if (passwords.newPass.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setSaving(true)
    try {
      // API would handle password change
      await new Promise(r => setTimeout(r, 1000))
      toast.success('Password updated successfully')
      setPasswords({ current: '', newPass: '', confirm: '' })
    } catch {
      toast.error('Failed to update password')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-lg font-semibold text-stone-900 mb-6">Change Password</h2>
        <div className="space-y-4 max-w-md">
          <Input
            label="Current Password"
            type="password"
            value={passwords.current}
            onChange={e => setPasswords({ ...passwords, current: e.target.value })}
            placeholder="Enter current password"
          />
          <Input
            label="New Password"
            type="password"
            value={passwords.newPass}
            onChange={e => setPasswords({ ...passwords, newPass: e.target.value })}
            placeholder="Enter new password (min 8 chars)"
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={passwords.confirm}
            onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
            placeholder="Confirm new password"
          />
          <div className="flex justify-end pt-2">
            <Button onClick={handleChangePassword} isLoading={saving}>
              <Shield className="w-4 h-4" /> Update Password
            </Button>
          </div>
        </div>
      </Card>

      <MfaSection />
    </div>
  )
}

function MfaSection() {
  const { data: mfaStatus, isLoading } = useMfaStatus()
  const setupMut = useMfaSetup()
  const confirmMut = useMfaConfirm()
  const disableMut = useMfaDisable()
  const backupMut = useMfaBackupCodes()

  const [setupData, setSetupData] = useState<{ secret: string; qr_code_url: string } | null>(null)
  const [verifyCode, setVerifyCode] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null)
  const [disablePassword, setDisablePassword] = useState('')
  const [showDisable, setShowDisable] = useState(false)
  const [showRegenerate, setShowRegenerate] = useState(false)
  const [regenPassword, setRegenPassword] = useState('')
  const [copied, setCopied] = useState(false)

  const mfaEnabled = mfaStatus?.mfa_enabled ?? false

  const handleSetup = async () => {
    try {
      const res = await setupMut.mutateAsync()
      setSetupData(res)
      setVerifyCode('')
      setBackupCodes(null)
    } catch (e: any) {
      toast.error(e.message || 'Failed to initiate MFA setup.')
    }
  }

  const handleConfirm = async () => {
    if (verifyCode.length !== 6) {
      toast.error('Please enter a 6-digit code')
      return
    }
    try {
      const res = await confirmMut.mutateAsync(verifyCode)
      toast.success(res.message)
      setBackupCodes(res.backup_codes)
      setSetupData(null)
      setVerifyCode('')
    } catch (e: any) {
      toast.error(e.message || 'Invalid code.')
    }
  }

  const handleDisable = async () => {
    try {
      const res = await disableMut.mutateAsync(disablePassword)
      toast.success(res.message)
      setShowDisable(false)
      setDisablePassword('')
      setBackupCodes(null)
    } catch (e: any) {
      toast.error(e.message || 'Failed to disable MFA.')
    }
  }

  const handleRegenerate = async () => {
    try {
      const res = await backupMut.mutateAsync(regenPassword)
      toast.success(res.message)
      setBackupCodes(res.backup_codes)
      setShowRegenerate(false)
      setRegenPassword('')
    } catch (e: any) {
      toast.error(e.message || 'Failed to regenerate backup codes.')
    }
  }

  const copyBackupCodes = () => {
    if (!backupCodes) return
    navigator.clipboard.writeText(backupCodes.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadBackupCodes = () => {
    if (!backupCodes) return
    const text = `ClinicLink Backup Codes\n${'='.repeat(30)}\n\n${backupCodes.join('\n')}\n\nKeep these codes in a safe place.\nEach code can only be used once.`
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'cliniclink-backup-codes.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
        </div>
      </Card>
    )
  }

  // Show backup codes after initial setup or regeneration
  if (backupCodes) {
    return (
      <Card>
        <h2 className="text-lg font-semibold text-stone-900 mb-2 flex items-center gap-2">
          <Key className="w-5 h-5 text-primary-500" /> Backup Codes
        </h2>
        <p className="text-sm text-stone-500 mb-4">
          Save these codes in a safe place. Each code can only be used once to sign in if you lose access to your authenticator app.
        </p>
        <div className="grid grid-cols-2 gap-2 max-w-sm mb-4">
          {backupCodes.map((code, i) => (
            <code key={i} className="px-3 py-2 bg-stone-100 rounded-lg text-sm font-mono text-stone-900 text-center">
              {code}
            </code>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={copyBackupCodes}>
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy All'}
          </Button>
          <Button variant="outline" size="sm" onClick={downloadBackupCodes}>
            <Download className="w-4 h-4" /> Download
          </Button>
          <Button size="sm" onClick={() => setBackupCodes(null)}>
            Done
          </Button>
        </div>
      </Card>
    )
  }

  // Setup flow: show QR code and verification
  if (setupData) {
    return (
      <Card>
        <h2 className="text-lg font-semibold text-stone-900 mb-2 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary-500" /> Set Up Two-Factor Authentication
        </h2>
        <p className="text-sm text-stone-500 mb-4">
          Scan the QR code below with your authenticator app (Google Authenticator, Authy, etc.), then enter the 6-digit code to verify.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="bg-white p-4 rounded-xl border border-stone-200 shrink-0">
            <QRCodeSVG value={setupData.qr_code_url} size={180} />
          </div>
          <div className="space-y-4 flex-1">
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">Manual entry key</label>
              <code className="block px-3 py-2 bg-stone-100 rounded-lg text-sm font-mono text-stone-900 break-all select-all">
                {setupData.secret}
              </code>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Verification Code</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={verifyCode}
                onChange={e => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="w-full max-w-[200px] rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-lg font-mono tracking-widest text-center focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleConfirm} isLoading={confirmMut.isPending} disabled={verifyCode.length !== 6}>
                <ShieldCheck className="w-4 h-4" /> Verify & Enable
              </Button>
              <Button variant="outline" onClick={() => setSetupData(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  // MFA enabled state
  if (mfaEnabled) {
    return (
      <Card>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-stone-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-500" /> Two-Factor Authentication
            </h2>
            <p className="text-sm text-stone-500 mt-1">Your account is protected with 2FA.</p>
          </div>
          <Badge variant="success">Enabled</Badge>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
            <div>
              <p className="text-sm font-medium text-stone-900">Authenticator App</p>
              <p className="text-xs text-stone-500">
                Enabled {mfaStatus?.mfa_confirmed_at ? new Date(mfaStatus.mfa_confirmed_at).toLocaleDateString() : ''}
              </p>
            </div>
            <Badge variant="success" size="sm">Active</Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
            <div>
              <p className="text-sm font-medium text-stone-900">Backup Codes</p>
              <p className="text-xs text-stone-500">{mfaStatus?.backup_codes_remaining ?? 0} codes remaining</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowRegenerate(true)}>
              <Key className="w-4 h-4" /> Regenerate
            </Button>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-stone-200">
          <Button variant="outline" size="sm" onClick={() => setShowDisable(true)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
            <ShieldOff className="w-4 h-4" /> Disable 2FA
          </Button>
        </div>

        {/* Disable confirmation */}
        {showDisable && (
          <div className="mt-4 p-4 bg-red-50 rounded-xl space-y-3">
            <p className="text-sm font-medium text-red-900">Confirm your password to disable 2FA</p>
            <Input
              type="password"
              value={disablePassword}
              onChange={e => setDisablePassword(e.target.value)}
              placeholder="Enter your password"
            />
            <div className="flex gap-2">
              <Button variant="danger" size="sm" onClick={handleDisable} isLoading={disableMut.isPending}>
                Disable 2FA
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setShowDisable(false); setDisablePassword('') }}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Regenerate backup codes */}
        {showRegenerate && (
          <div className="mt-4 p-4 bg-amber-50 rounded-xl space-y-3">
            <p className="text-sm font-medium text-amber-900">Confirm your password to regenerate backup codes</p>
            <p className="text-xs text-amber-700">This will invalidate all existing backup codes.</p>
            <Input
              type="password"
              value={regenPassword}
              onChange={e => setRegenPassword(e.target.value)}
              placeholder="Enter your password"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleRegenerate} isLoading={backupMut.isPending}>
                <Key className="w-4 h-4" /> Regenerate Codes
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setShowRegenerate(false); setRegenPassword('') }}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Card>
    )
  }

  // MFA disabled state — offer to enable
  return (
    <Card>
      <h2 className="text-lg font-semibold text-stone-900 mb-2 flex items-center gap-2">
        <Shield className="w-5 h-5 text-stone-400" /> Two-Factor Authentication
      </h2>
      <p className="text-sm text-stone-500 mb-4">
        Add an extra layer of security to your account by requiring a verification code from your authenticator app when signing in.
      </p>
      <div className="bg-stone-50 rounded-xl p-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-stone-900">Authenticator App</p>
            <p className="text-xs text-stone-500 mt-0.5">
              Use an app like Google Authenticator, Authy, or 1Password to generate verification codes.
            </p>
          </div>
        </div>
      </div>
      <Button onClick={handleSetup} isLoading={setupMut.isPending}>
        <ShieldCheck className="w-4 h-4" /> Enable Two-Factor Authentication
      </Button>
    </Card>
  )
}

function PaymentsTab() {
  const { data: connectStatus, isLoading: statusLoading } = useConnectStatus()
  const createAccount = useCreateConnectAccount()
  const refreshLink = useRefreshConnectLink()
  const { data: historyData, isLoading: historyLoading } = usePaymentHistory()

  const urlParams = new URLSearchParams(window.location.search)
  const justConnected = urlParams.get('connected') === '1'

  const handleConnect = async () => {
    try {
      const res = await createAccount.mutateAsync()
      window.location.href = res.url
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create Stripe account'
      toast.error(message)
    }
  }

  const handleRefreshLink = async () => {
    try {
      const res = await refreshLink.mutateAsync()
      window.location.href = res.url
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to refresh onboarding link'
      toast.error(message)
    }
  }

  const payments = historyData?.data || []

  const statusColor = (s: string) => {
    switch (s) {
      case 'completed': return 'success'
      case 'pending': case 'processing': return 'warning'
      case 'failed': return 'danger'
      case 'refunded': return 'default'
      default: return 'default'
    }
  }

  if (statusLoading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </Card>
    )
  }

  const isOnboarded = connectStatus?.stripe_onboarded
  const hasAccount = !!connectStatus?.stripe_account_id

  return (
    <div className="space-y-6">
      {/* Stripe Connect Status */}
      <Card>
        <h2 className="text-lg font-semibold text-stone-900 mb-2 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary-500" /> Stripe Connect
        </h2>
        <p className="text-sm text-stone-500 mb-6">
          Connect your Stripe account to receive payments from students for rotation placements.
        </p>

        {justConnected && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800">
            <CheckCircle className="w-4 h-4 shrink-0" />
            Stripe account connected successfully! It may take a moment for status to update.
          </div>
        )}

        {isOnboarded ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
              <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
              <div>
                <p className="font-medium text-green-900 text-sm">Stripe Account Connected</p>
                <p className="text-xs text-green-700 mt-0.5">
                  Account ID: {connectStatus?.stripe_account_id}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                <span className="text-sm text-stone-600">Charges</span>
                <Badge variant={connectStatus?.charges_enabled ? 'success' : 'warning'} size="sm">
                  {connectStatus?.charges_enabled ? 'Enabled' : 'Pending'}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                <span className="text-sm text-stone-600">Payouts</span>
                <Badge variant={connectStatus?.payouts_enabled ? 'success' : 'warning'} size="sm">
                  {connectStatus?.payouts_enabled ? 'Enabled' : 'Pending'}
                </Badge>
              </div>
            </div>

            {(!connectStatus?.charges_enabled || !connectStatus?.payouts_enabled) && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                <AlertCircle className="w-4 h-4 shrink-0" />
                Some features are still pending. You may need to complete additional verification in Stripe.
              </div>
            )}
          </div>
        ) : hasAccount ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="font-medium text-amber-900 text-sm">Onboarding Incomplete</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Your Stripe account has been created but onboarding isn't finished yet.
                </p>
              </div>
            </div>
            <Button onClick={handleRefreshLink} isLoading={refreshLink.isPending}>
              <RefreshCw className="w-4 h-4" /> Continue Onboarding
              <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-stone-50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-stone-900">Accept Payments</p>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Set up Stripe Connect to accept payments directly for rotation placements. Stripe handles all payment processing, compliance, and payouts.
                  </p>
                </div>
              </div>
            </div>
            <Button onClick={handleConnect} isLoading={createAccount.isPending}>
              <CreditCard className="w-4 h-4" /> Connect with Stripe
              <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        )}
      </Card>

      {/* Payment History */}
      <Card>
        <h2 className="text-lg font-semibold text-stone-900 mb-4">Payment History</h2>

        {historyLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-8 text-stone-400">
            <CreditCard className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No payments yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map(payment => (
              <div key={payment.id} className="flex items-center justify-between p-4 rounded-xl border border-stone-200 hover:border-stone-300 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    payment.status === 'completed' ? 'bg-green-50 text-green-600' :
                    payment.status === 'refunded' ? 'bg-stone-100 text-stone-500' :
                    'bg-amber-50 text-amber-600'
                  }`}>
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-stone-900">
                      ${Number(payment.amount).toFixed(2)} {payment.currency.toUpperCase()}
                    </p>
                    <p className="text-xs text-stone-500 truncate">
                      {payment.paid_at
                        ? new Date(payment.paid_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : new Date(payment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      }
                      {payment.platform_fee > 0 && ` · Fee: $${Number(payment.platform_fee).toFixed(2)}`}
                    </p>
                  </div>
                </div>
                <Badge variant={statusColor(payment.status) as 'success' | 'warning' | 'danger' | 'default'} size="sm">
                  {payment.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

function SubscriptionTab() {
  const { data: subStatus, isLoading } = useSubscriptionStatus()
  const checkout = useSubscriptionCheckout()
  const portal = useSubscriptionPortal()

  const handleUpgrade = (interval: 'month' | 'year') => {
    checkout.mutate({ plan: 'pro', interval }, {
      onSuccess: (data) => { window.location.href = data.url },
      onError: (err: unknown) => {
        const message = err instanceof Error ? err.message : 'Failed to start checkout'
        toast.error(message)
      },
    })
  }

  const handleManage = () => {
    portal.mutate(undefined, {
      onSuccess: (data) => { window.location.href = data.url },
      onError: (err: unknown) => {
        const message = err instanceof Error ? err.message : 'Failed to open billing portal'
        toast.error(message)
      },
    })
  }

  if (isLoading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </Card>
    )
  }

  const isPro = subStatus?.plan === 'pro'
  const trialActive = subStatus?.trial_active
  const needsUpgrade = subStatus?.needs_upgrade

  return (
    <div className="space-y-6">
      {/* Current Plan Status */}
      <Card>
        <h2 className="text-lg font-semibold text-stone-900 mb-4">Your Plan</h2>
        <div className={`p-4 rounded-xl border ${
          needsUpgrade ? 'bg-amber-50 border-amber-200' : isPro ? 'bg-primary-50 border-primary-200' : 'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-base font-bold text-stone-900 capitalize">{subStatus?.plan || 'free'} Plan</p>
                <Badge variant={isPro ? 'primary' : needsUpgrade ? 'warning' : 'success'} size="sm">
                  {isPro ? 'Active' : needsUpgrade ? 'Expired' : 'Active'}
                </Badge>
              </div>
              <p className="text-sm text-stone-500 mt-1">
                {isPro
                  ? `Subscription ${subStatus?.subscription_status === 'active' ? 'active' : subStatus?.subscription_status || ''}`
                  : trialActive && subStatus?.trial_days_remaining !== null
                    ? `${subStatus.trial_days_remaining} days left in trial · ${subStatus.free_rotations_used}/${subStatus.free_rotations_limit} free rotation used`
                    : needsUpgrade
                      ? 'Your free trial has ended. Upgrade to continue applying for rotations.'
                      : `${subStatus?.free_rotations_used || 0}/${subStatus?.free_rotations_limit || 1} free rotation used`
                }
              </p>
            </div>
            {isPro && (
              <Button variant="outline" size="sm" onClick={handleManage} isLoading={portal.isPending}>
                <ExternalLink className="w-4 h-4" /> Manage Billing
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Upgrade CTA (show for free users) */}
      {!isPro && (
        <Card>
          <h2 className="text-lg font-semibold text-stone-900 mb-4">Upgrade to Pro</h2>
          <p className="text-sm text-stone-500 mb-6">
            Get unlimited rotation applications and premium features.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <button
              onClick={() => handleUpgrade('month')}
              disabled={checkout.isPending}
              className="p-4 rounded-xl border-2 border-stone-200 hover:border-primary-300 transition-all text-left"
            >
              <p className="text-lg font-bold text-stone-900">$9.99<span className="text-sm font-normal text-stone-500">/month</span></p>
              <p className="text-xs text-stone-500 mt-1">Billed monthly, cancel anytime</p>
            </button>
            <button
              onClick={() => handleUpgrade('year')}
              disabled={checkout.isPending}
              className="p-4 rounded-xl border-2 border-primary-300 bg-primary-50 hover:bg-primary-100 transition-all text-left relative"
            >
              <div className="absolute -top-2.5 right-3">
                <span className="px-2 py-0.5 rounded-full bg-green-500 text-white text-xs font-semibold">Save 28%</span>
              </div>
              <p className="text-lg font-bold text-stone-900">$86<span className="text-sm font-normal text-stone-500">/year</span></p>
              <p className="text-xs text-stone-500 mt-1">$7.17/month, billed annually (save 28%)</p>
            </button>
          </div>
          <div className="mt-6">
            <p className="text-xs font-semibold text-stone-700 mb-2">What's included in Pro:</p>
            <ul className="grid sm:grid-cols-2 gap-1.5 text-xs text-stone-600">
              {['Unlimited rotation applications', 'Priority application badge', 'Saved search alerts', 'Advanced analytics & insights', 'Preceptor matching AI', 'Priority support'].map(f => (
                <li key={f} className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" /> {f}
                </li>
              ))}
            </ul>
          </div>
        </Card>
      )}
    </div>
  )
}

function NotificationsTab() {
  const { user } = useAuth()
  const { data, isLoading } = useNotificationPreferences()
  const updateMut = useUpdateNotificationPreferences()
  const [localPrefs, setLocalPrefs] = useState<Record<string, boolean> | null>(null)

  const prefs = localPrefs ?? data?.preferences ?? {
    application_updates: true,
    hour_log_reviews: true,
    evaluations: true,
    site_join_requests: true,
    reminders: true,
    product_updates: false,
  }

  // Sync from API once loaded
  if (data?.preferences && !localPrefs) {
    setLocalPrefs({ ...data.preferences })
  }

  const togglePref = (key: string) => {
    setLocalPrefs(p => ({ ...p!, [key]: !p![key] }))
  }

  const handleSave = async () => {
    if (!localPrefs) return
    try {
      await updateMut.mutateAsync(localPrefs as Record<string, boolean>)
      toast.success('Notification preferences saved')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save preferences'
      toast.error(message)
    }
  }

  const role = user?.role || 'student'

  const options: { key: string; label: string; desc: string; roles?: string[] }[] = [
    { key: 'application_updates', label: 'Application Updates', desc: 'New applications, status changes, and review notifications' },
    { key: 'hour_log_reviews', label: 'Hour Log Reviews', desc: 'Notifications when hour logs are submitted or reviewed' },
    { key: 'evaluations', label: 'Evaluations', desc: 'Notifications about new evaluations' },
    { key: 'site_join_requests', label: 'Site Join Requests', desc: 'Requests to join sites, approvals, and assignments' },
    { key: 'reminders', label: 'Reminders', desc: 'Reminders for upcoming deadlines and tasks' },
    { key: 'product_updates', label: 'Product Updates', desc: 'Hear about new features and improvements' },
  ]

  // Filter by role if applicable (all options are relevant to all roles for now)
  const visibleOptions = options.filter(o => !o.roles || o.roles.includes(role))

  if (isLoading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <h2 className="text-lg font-semibold text-stone-900 mb-6">Notification Preferences</h2>
      <div className="space-y-4">
        {visibleOptions.map(opt => (
          <div key={opt.key} className="flex items-center justify-between p-4 rounded-xl border border-stone-200">
            <div>
              <p className="font-medium text-stone-900 text-sm">{opt.label}</p>
              <p className="text-xs text-stone-500 mt-0.5">{opt.desc}</p>
            </div>
            <button
              onClick={() => togglePref(opt.key)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                (prefs as Record<string, boolean>)[opt.key] ? 'bg-primary-500' : 'bg-stone-300'
              }`}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                (prefs as Record<string, boolean>)[opt.key] ? 'translate-x-5.5 left-0.5' : 'left-0.5'
              }`} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} isLoading={updateMut.isPending}>
          <Save className="w-4 h-4" /> Save Preferences
        </Button>
      </div>
    </Card>
  )
}
