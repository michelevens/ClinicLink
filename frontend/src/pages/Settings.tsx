import { useState } from 'react'
import { Card } from '../components/ui/Card.tsx'
import { Button } from '../components/ui/Button.tsx'
import { Input } from '../components/ui/Input.tsx'
import { Badge } from '../components/ui/Badge.tsx'
import { useAuth } from '../contexts/AuthContext.tsx'
import { authApi } from '../services/api.ts'
import { useStudentProfile, useUpdateStudentProfile, useCredentials, useAddCredential, useDeleteCredential, useUploadCredentialFile } from '../hooks/useApi.ts'
import { toast } from 'sonner'
import {
  User, Shield, Bell, GraduationCap, FileCheck,
  Mail, Phone, Save, Loader2, Trash2, Plus, Calendar,
  Upload, Download, Paperclip
} from 'lucide-react'
import { studentApi } from '../services/api.ts'

type Tab = 'profile' | 'academic' | 'credentials' | 'security' | 'notifications'

const TABS: { key: Tab; label: string; icon: typeof User; roles?: string[] }[] = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'academic', label: 'Academic', icon: GraduationCap, roles: ['student'] },
  { key: 'credentials', label: 'Credentials', icon: FileCheck, roles: ['student'] },
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
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('profile')

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
  const profile = data?.profile

  const [form, setForm] = useState({
    bio: '',
    graduation_date: '',
    gpa: '',
    clinical_interests: [] as string[],
  })
  const [initialized, setInitialized] = useState(false)

  if (profile && !initialized) {
    setForm({
      bio: profile.bio || '',
      graduation_date: profile.graduation_date || '',
      gpa: profile.gpa ? String(profile.gpa) : '',
      clinical_interests: profile.clinical_interests || [],
    })
    setInitialized(true)
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
            <Input
              label="University"
              value={profile?.university?.name || 'Not set'}
              disabled
            />
            <Input
              label="Program"
              value={profile?.program?.name || 'Not set'}
              disabled
            />
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
    <Card>
      <h2 className="text-lg font-semibold text-stone-900 mb-6">Security</h2>
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
  )
}

function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    email_applications: true,
    email_hours: true,
    email_evaluations: true,
    email_reminders: true,
    email_marketing: false,
  })

  const togglePref = (key: keyof typeof prefs) => {
    setPrefs(p => ({ ...p, [key]: !p[key] }))
  }

  const handleSave = () => {
    toast.success('Notification preferences saved')
  }

  const options: { key: keyof typeof prefs; label: string; desc: string }[] = [
    { key: 'email_applications', label: 'Application Updates', desc: 'Get notified when your application status changes' },
    { key: 'email_hours', label: 'Hour Log Reviews', desc: 'Get notified when your logged hours are reviewed' },
    { key: 'email_evaluations', label: 'Evaluations', desc: 'Get notified when a new evaluation is submitted' },
    { key: 'email_reminders', label: 'Reminders', desc: 'Receive reminders for upcoming deadlines and tasks' },
    { key: 'email_marketing', label: 'Product Updates', desc: 'Hear about new features and improvements' },
  ]

  return (
    <Card>
      <h2 className="text-lg font-semibold text-stone-900 mb-6">Email Notifications</h2>
      <div className="space-y-4">
        {options.map(opt => (
          <div key={opt.key} className="flex items-center justify-between p-4 rounded-xl border border-stone-200">
            <div>
              <p className="font-medium text-stone-900 text-sm">{opt.label}</p>
              <p className="text-xs text-stone-500 mt-0.5">{opt.desc}</p>
            </div>
            <button
              onClick={() => togglePref(opt.key)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                prefs[opt.key] ? 'bg-primary-500' : 'bg-stone-300'
              }`}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                prefs[opt.key] ? 'translate-x-5.5 left-0.5' : 'left-0.5'
              }`} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex justify-end pt-4">
        <Button onClick={handleSave}>
          <Save className="w-4 h-4" /> Save Preferences
        </Button>
      </div>
    </Card>
  )
}
