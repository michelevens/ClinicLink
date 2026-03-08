import { useState, useEffect } from 'react'
import { Settings, Mail, Bell, Save, Check } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../components/ui/Button'
import { useAppSettings, useUpdateAppSettings } from '../hooks/useApi'
import type { AppSettingItem } from '../services/api'

type SettingsGroup = 'notifications' | 'general'

const GROUPS: { key: SettingsGroup; label: string; icon: React.ReactNode }[] = [
  { key: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
  { key: 'general', label: 'General', icon: <Settings className="w-4 h-4" /> },
]

export default function AdminSettings() {
  const [activeGroup, setActiveGroup] = useState<SettingsGroup>('notifications')
  const { data, isLoading } = useAppSettings(activeGroup)
  const updateSettings = useUpdateAppSettings()
  const [editValues, setEditValues] = useState<Record<string, string | boolean | null>>({})
  const [hasChanges, setHasChanges] = useState(false)

  const settings = data?.settings ?? []

  // Reset edit values when settings load
  useEffect(() => {
    if (settings.length > 0) {
      const values: Record<string, string | boolean | null> = {}
      settings.forEach(s => { values[s.key] = typeof s.value === 'number' ? String(s.value) : s.value })
      setEditValues(values)
      setHasChanges(false)
    }
  }, [data]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (key: string, value: string | boolean | null) => {
    setEditValues(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    const changedSettings = settings
      .filter(s => editValues[s.key] !== s.value)
      .map(s => ({ key: s.key, value: editValues[s.key] as string | boolean | null }))

    if (changedSettings.length === 0) {
      toast.info('No changes to save')
      return
    }

    try {
      await updateSettings.mutateAsync(changedSettings)
      toast.success('Settings saved')
      setHasChanges(false)
    } catch {
      toast.error('Failed to save settings')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Platform Settings</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            Configure platform-wide settings and notification preferences
          </p>
        </div>
        {hasChanges && (
          <Button size="sm" onClick={handleSave} isLoading={updateSettings.isPending}>
            <Save className="w-4 h-4 mr-1" />
            Save Changes
          </Button>
        )}
      </div>

      {/* Group Tabs */}
      <div className="flex gap-2 border-b border-stone-200 dark:border-stone-700 pb-px">
        {GROUPS.map(g => (
          <button
            key={g.key}
            onClick={() => setActiveGroup(g.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeGroup === g.key
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-stone-500 hover:text-stone-700 dark:text-stone-400'
            }`}
          >
            {g.icon}
            {g.label}
          </button>
        ))}
      </div>

      {/* Settings List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-5 animate-pulse">
              <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-48 mb-2" />
              <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded w-96" />
            </div>
          ))}
        </div>
      ) : settings.length === 0 ? (
        <div className="text-center py-12 text-stone-400">
          No settings found for this group.
        </div>
      ) : (
        <div className="space-y-4">
          {settings.map(setting => (
            <SettingRow
              key={setting.key}
              setting={setting}
              value={editValues[setting.key]}
              onChange={(val) => handleChange(setting.key, val)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function SettingRow({ setting, value, onChange }: {
  setting: AppSettingItem
  value: string | boolean | null | undefined
  onChange: (value: string | boolean | null) => void
}) {
  const isEmail = setting.key.includes('email')

  return (
    <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {isEmail && <Mail className="w-4 h-4 text-primary-500" />}
            <h3 className="font-semibold text-stone-900 dark:text-stone-100">
              {setting.label || setting.key}
            </h3>
          </div>
          {setting.description && (
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">{setting.description}</p>
          )}
        </div>
        <div className="sm:w-80 flex-shrink-0">
          {setting.type === 'boolean' ? (
            <button
              onClick={() => onChange(!value)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                value ? 'bg-green-500' : 'bg-stone-300 dark:bg-stone-600'
              }`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                value ? 'translate-x-6' : 'translate-x-1'
              }`}>
                {value && <Check className="w-3 h-3 text-green-500 m-1" />}
              </span>
            </button>
          ) : (
            <input
              type={isEmail ? 'email' : 'text'}
              value={(value as string) || ''}
              onChange={e => onChange(e.target.value || null)}
              placeholder={isEmail ? 'email@example.com' : 'Enter value...'}
              className="w-full px-3 py-2 text-sm border border-stone-200 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          )}
        </div>
      </div>
    </div>
  )
}
