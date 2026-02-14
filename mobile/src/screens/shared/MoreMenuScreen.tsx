import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../theme'
import { spacing, fontSize, fontWeight, radius } from '../../theme'
import { Avatar, Card } from '../../components/ui'
import type { UserRole } from '../../types'

interface MenuItem {
  label: string
  icon: string
  screen: string
  roles?: UserRole[]
}

const MENU_SECTIONS: { title: string; items: MenuItem[] }[] = [
  {
    title: 'Student',
    items: [
      { label: 'My Applications', icon: 'document-text-outline', screen: 'Applications', roles: ['student'] },
      { label: 'My Evaluations', icon: 'star-outline', screen: 'Evaluations', roles: ['student'] },
      { label: 'Certificates', icon: 'ribbon-outline', screen: 'Certificates', roles: ['student'] },
      { label: 'Bookmarks', icon: 'bookmark-outline', screen: 'Bookmarks', roles: ['student'] },
      { label: 'Saved Searches', icon: 'search-outline', screen: 'SavedSearches', roles: ['student'] },
      { label: 'My Profile', icon: 'person-outline', screen: 'StudentProfile', roles: ['student'] },
    ],
  },
  {
    title: 'Preceptor',
    items: [
      { label: 'My Students', icon: 'people-outline', screen: 'MyStudents', roles: ['preceptor'] },
      { label: 'Hour Review', icon: 'time-outline', screen: 'HourReview', roles: ['preceptor'] },
      { label: 'Create Evaluation', icon: 'create-outline', screen: 'CreateEvaluation', roles: ['preceptor'] },
      { label: 'Preceptor Profile', icon: 'person-circle-outline', screen: 'PreceptorProfile', roles: ['preceptor'] },
    ],
  },
  {
    title: 'Site Management',
    items: [
      { label: 'My Site', icon: 'business-outline', screen: 'MySite', roles: ['site_manager'] },
      { label: 'Slot Management', icon: 'calendar-outline', screen: 'SlotManagement', roles: ['site_manager'] },
      { label: 'Applications', icon: 'document-text-outline', screen: 'SiteApplications', roles: ['site_manager'] },
      { label: 'Preceptors', icon: 'people-outline', screen: 'SitePreceptors', roles: ['site_manager'] },
      { label: 'Compliance', icon: 'shield-checkmark-outline', screen: 'Compliance', roles: ['site_manager'] },
    ],
  },
  {
    title: 'University',
    items: [
      { label: 'Programs', icon: 'school-outline', screen: 'Programs', roles: ['coordinator', 'professor'] },
      { label: 'Placements', icon: 'briefcase-outline', screen: 'Placements', roles: ['coordinator', 'professor'] },
      { label: 'Agreements', icon: 'documents-outline', screen: 'Agreements', roles: ['coordinator'] },
      { label: 'Analytics', icon: 'analytics-outline', screen: 'Analytics', roles: ['coordinator', 'admin'] },
    ],
  },
  {
    title: 'Admin',
    items: [
      { label: 'Users', icon: 'people-outline', screen: 'AdminUsers', roles: ['admin'] },
      { label: 'Sites Directory', icon: 'business-outline', screen: 'SitesDirectory', roles: ['admin'] },
      { label: 'Universities', icon: 'school-outline', screen: 'Universities', roles: ['admin'] },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Settings', icon: 'settings-outline', screen: 'Settings' },
      { label: 'Notifications', icon: 'notifications-outline', screen: 'NotificationPrefs' },
      { label: 'Security (MFA)', icon: 'shield-outline', screen: 'MfaSettings' },
    ],
  },
]

export function MoreMenuScreen({ navigation }: { navigation: any }) {
  const { user, logout } = useAuth()
  const { theme } = useTheme()
  const role = user?.role as UserRole

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => logout() },
    ])
  }

  const visibleSections = MENU_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => !item.roles || item.roles.includes(role)),
  })).filter((section) => section.items.length > 0)

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Profile Header */}
      <View style={[styles.profileSection, { backgroundColor: theme.colors.surface }]}>
        <Avatar name={`${user?.firstName} ${user?.lastName}`} size="xl" />
        <Text style={[styles.profileName, { color: theme.colors.text }]}>
          {user?.firstName} {user?.lastName}
        </Text>
        <Text style={[styles.profileEmail, { color: theme.colors.textSecondary }]}>
          {user?.email}
        </Text>
        <Text style={[styles.profileRole, { color: theme.colors.primary }]}>
          {role?.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
        </Text>
      </View>

      {/* Menu Sections */}
      {visibleSections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textTertiary }]}>
            {section.title.toUpperCase()}
          </Text>
          <Card style={[styles.menuCard, { backgroundColor: theme.colors.card }]} padding="none">
            {section.items.map((item, i) => (
              <TouchableOpacity
                key={item.screen}
                style={[
                  styles.menuItem,
                  i < section.items.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.borderLight },
                ]}
                onPress={() => navigation.navigate(item.screen)}
              >
                <Ionicons name={item.icon as any} size={20} color={theme.colors.primary} />
                <Text style={[styles.menuLabel, { color: theme.colors.text }]}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
              </TouchableOpacity>
            ))}
          </Card>
        </View>
      ))}

      {/* Logout */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: theme.colors.dangerLight }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color={theme.colors.danger} />
          <Text style={[styles.logoutText, { color: theme.colors.danger }]}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: spacing['3xl'] }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  profileName: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginTop: spacing.sm,
  },
  profileEmail: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  profileRole: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginLeft: 4,
  },
  menuCard: {},
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  menuLabel: {
    fontSize: fontSize.base,
    flex: 1,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 14,
    borderRadius: radius.md,
  },
  logoutText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
})
