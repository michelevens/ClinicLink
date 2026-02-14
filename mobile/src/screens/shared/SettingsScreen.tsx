import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../theme'
import { spacing, fontSize, fontWeight, radius } from '../../theme'
import { Screen, Card } from '../../components/ui'

export function SettingsScreen({ navigation }: { navigation: any }) {
  const { theme, preference, setPreference } = useTheme()
  const { user } = useAuth()

  const themes = [
    { value: 'system' as const, label: 'System', icon: 'phone-portrait-outline' },
    { value: 'light' as const, label: 'Light', icon: 'sunny-outline' },
    { value: 'dark' as const, label: 'Dark', icon: 'moon-outline' },
  ]

  return (
    <Screen scroll>
      <View style={styles.content}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>

        <Text style={[styles.title, { color: theme.colors.text }]}>Settings</Text>

        {/* Theme */}
        <Card style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Appearance</Text>
          <View style={styles.themeRow}>
            {themes.map((t) => {
              const active = preference === t.value
              return (
                <TouchableOpacity
                  key={t.value}
                  style={[
                    styles.themeOption,
                    {
                      backgroundColor: active ? theme.colors.primaryLight : theme.colors.surfaceSecondary,
                      borderColor: active ? theme.colors.primary : theme.colors.border,
                    },
                  ]}
                  onPress={() => setPreference(t.value)}
                >
                  <Ionicons
                    name={t.icon as any}
                    size={22}
                    color={active ? theme.colors.primary : theme.colors.textSecondary}
                  />
                  <Text style={[styles.themeLabel, { color: active ? theme.colors.primary : theme.colors.textSecondary }]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </Card>

        {/* Account */}
        <Card style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Account</Text>
          {[
            { label: 'Edit Profile', icon: 'person-outline', screen: 'ProfileEdit' },
            { label: 'Notification Preferences', icon: 'notifications-outline', screen: 'NotificationPrefs' },
            { label: 'Security & MFA', icon: 'shield-checkmark-outline', screen: 'MfaSettings' },
          ].map((item, i) => (
            <TouchableOpacity
              key={item.screen}
              style={[styles.menuItem, i < 2 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.borderLight }]}
              onPress={() => navigation.navigate(item.screen)}
            >
              <Ionicons name={item.icon as any} size={20} color={theme.colors.primary} />
              <Text style={[styles.menuLabel, { color: theme.colors.text }]}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
            </TouchableOpacity>
          ))}
        </Card>

        {/* App Info */}
        <Card style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>About</Text>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Version</Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>1.0.0</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Logged in as</Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>{user?.email}</Text>
          </View>
        </Card>

        {/* Company */}
        <Card style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Company</Text>
          <View style={styles.companyInfo}>
            <Text style={[styles.companyName, { color: theme.colors.text }]}>Acsyom Analytics</Text>
            <Text style={[styles.companyDetail, { color: theme.colors.textSecondary }]}>
              Healthcare technology, clinical education, and enterprise software.
            </Text>
            <View style={styles.companyRow}>
              <Ionicons name="location-outline" size={14} color={theme.colors.textTertiary} />
              <Text style={[styles.companyDetail, { color: theme.colors.textSecondary }]}>Clermont, FL</Text>
            </View>
            <View style={styles.companyRow}>
              <Ionicons name="call-outline" size={14} color={theme.colors.textTertiary} />
              <Text style={[styles.companyDetail, { color: theme.colors.textSecondary }]}>407-462-7233</Text>
            </View>
            <View style={styles.companyRow}>
              <Ionicons name="person-outline" size={14} color={theme.colors.textTertiary} />
              <Text style={[styles.companyDetail, { color: theme.colors.textSecondary }]}>
                Founded by Evens Michel, MBA, MSEE
              </Text>
            </View>
          </View>
        </Card>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
  },
  backBtn: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    marginBottom: spacing.lg,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.md,
  },
  themeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
  },
  themeLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 14,
  },
  menuLabel: {
    fontSize: fontSize.base,
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    fontSize: fontSize.sm,
  },
  infoValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  companyInfo: {
    gap: spacing.sm,
  },
  companyName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  companyDetail: {
    fontSize: fontSize.sm,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
})
