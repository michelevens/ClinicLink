import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, RefreshControl } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { spacing, fontSize, fontWeight } from '../../theme'
import { Card, Button } from '../../components/ui'
import { useNotificationPreferences, useUpdateNotificationPreferences } from '../../hooks/useApi'

interface PrefItem {
  key: string
  label: string
  description: string
  icon: string
}

const PREF_ITEMS: PrefItem[] = [
  { key: 'email_applications', label: 'Application Updates', description: 'Status changes for your applications', icon: 'document-text-outline' },
  { key: 'email_messages', label: 'New Messages', description: 'When someone sends you a message', icon: 'chatbubble-outline' },
  { key: 'email_hours', label: 'Hour Log Reviews', description: 'When hours are approved or rejected', icon: 'time-outline' },
  { key: 'email_evaluations', label: 'Evaluations', description: 'New evaluations and feedback', icon: 'star-outline' },
  { key: 'email_reminders', label: 'Reminders', description: 'Upcoming deadlines and tasks', icon: 'alarm-outline' },
  { key: 'push_enabled', label: 'Push Notifications', description: 'Mobile push notifications', icon: 'notifications-outline' },
]

export function NotificationPrefsScreen({ navigation }: { navigation: any }) {
  const { theme } = useTheme()
  const { data, isLoading, refetch } = useNotificationPreferences()
  const updatePrefs = useUpdateNotificationPreferences()

  const [prefs, setPrefs] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (data?.preferences) {
      setPrefs(data.preferences as unknown as Record<string, boolean>)
    }
  }, [data])

  const togglePref = (key: string) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = () => {
    updatePrefs.mutate(prefs, {
      onSuccess: () => {
        Alert.alert('Success', 'Notification preferences saved')
      },
      onError: () => {
        Alert.alert('Error', 'Failed to save preferences')
      },
    })
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={theme.colors.primary} />}
    >
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Card style={[styles.card, { backgroundColor: theme.colors.card }]} padding="none">
          {PREF_ITEMS.map((item, i) => (
            <View
              key={item.key}
              style={[
                styles.prefRow,
                i < PREF_ITEMS.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: theme.colors.borderLight,
                },
              ]}
            >
              <Ionicons name={item.icon as any} size={20} color={theme.colors.primary} />
              <View style={styles.prefInfo}>
                <Text style={[styles.prefLabel, { color: theme.colors.text }]}>{item.label}</Text>
                <Text style={[styles.prefDesc, { color: theme.colors.textSecondary }]}>
                  {item.description}
                </Text>
              </View>
              <Switch
                value={!!prefs[item.key]}
                onValueChange={() => togglePref(item.key)}
                trackColor={{ false: theme.colors.surfaceSecondary, true: theme.colors.primaryLight }}
                thumbColor={prefs[item.key] ? theme.colors.primary : theme.colors.textTertiary}
              />
            </View>
          ))}
        </Card>

        <Button
          onPress={handleSave}
          loading={updatePrefs.isPending}
          fullWidth
        >
          Save Preferences
        </Button>
      </View>

      <View style={{ height: spacing['3xl'] }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  content: {
    padding: spacing.md,
    gap: spacing.lg,
  },
  card: {},
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  prefInfo: {
    flex: 1,
  },
  prefLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
  },
  prefDesc: {
    fontSize: fontSize.xs,
    marginTop: 1,
  },
})
