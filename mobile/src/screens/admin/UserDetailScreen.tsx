import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { spacing, fontSize, fontWeight, radius } from '../../theme'
import { Card, Badge, Avatar, Button } from '../../components/ui'
import { useAdminUser, useUpdateUser, useResetUserPassword } from '../../hooks/useApi'

const ROLE_COLORS: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger' | 'default'> = {
  student: 'primary',
  preceptor: 'success',
  site_manager: 'warning',
  coordinator: 'info',
  professor: 'default',
  admin: 'danger',
}

export function UserDetailScreen({ route, navigation }: { route: any; navigation: any }) {
  const { theme } = useTheme()
  const { userId } = route.params ?? {}
  const { data, isLoading, refetch } = useAdminUser(userId)
  const updateUser = useUpdateUser()
  const resetPassword = useResetUserPassword()

  const user = data?.user

  const handleToggleActive = () => {
    if (!user) return
    const newStatus = !user.is_active
    Alert.alert(
      newStatus ? 'Activate User' : 'Deactivate User',
      `${newStatus ? 'Activate' : 'Deactivate'} ${user.first_name} ${user.last_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: newStatus ? 'default' : 'destructive',
          onPress: () => updateUser.mutate({ id: userId, data: { is_active: newStatus } }),
        },
      ],
    )
  }

  const handleResetPassword = () => {
    Alert.alert('Reset Password', 'Send a password reset email to this user?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        onPress: () =>
          resetPassword.mutate(userId, {
            onSuccess: () => Alert.alert('Success', 'Password reset email sent'),
            onError: () => Alert.alert('Error', 'Failed to send reset email'),
          }),
      },
    ])
  }

  const name = user ? `${user.first_name} ${user.last_name}` : 'User'

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={theme.colors.primary} />}
    >
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>User Detail</Text>
        <View style={{ width: 24 }} />
      </View>

      {user && (
        <>
          {/* Profile */}
          <View style={styles.profileSection}>
            <Avatar name={name} size="xl" imageUrl={user.avatar_url} />
            <Text style={[styles.profileName, { color: theme.colors.text }]}>{name}</Text>
            <Text style={[styles.profileEmail, { color: theme.colors.textSecondary }]}>{user.email}</Text>
            <View style={styles.badgeRow}>
              <Badge variant={ROLE_COLORS[user.role] || 'default'} size="sm">
                {user.role.replace('_', ' ')}
              </Badge>
              {!user.is_active && <Badge variant="danger" size="sm">Inactive</Badge>}
            </View>
          </View>

          {/* Account Info */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textTertiary }]}>ACCOUNT</Text>
            <Card style={[styles.infoCard, { backgroundColor: theme.colors.card }]}>
              {user.phone && (
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Phone</Text>
                  <Text style={[styles.infoValue, { color: theme.colors.text }]}>{user.phone}</Text>
                </View>
              )}
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Joined</Text>
                <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                  {new Date(user.created_at).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>MFA</Text>
                <Badge variant={user.mfa_enabled ? 'success' : 'default'} size="sm">
                  {user.mfa_enabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Onboarding</Text>
                <Badge variant={user.onboarding_completed ? 'success' : 'warning'} size="sm">
                  {user.onboarding_completed ? 'Complete' : 'Pending'}
                </Badge>
              </View>
            </Card>
          </View>

          {/* Sites (for preceptors) */}
          {(user.assigned_sites?.length ?? 0) > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.textTertiary }]}>SITES</Text>
              {user.assigned_sites!.map((site: any) => (
                <Card key={site.id} style={[styles.siteCard, { backgroundColor: theme.colors.card }]}>
                  <View style={styles.siteRow}>
                    <Ionicons name="business-outline" size={18} color={theme.colors.primary} />
                    <Text style={[styles.siteName, { color: theme.colors.text }]}>{site.name}</Text>
                  </View>
                </Card>
              ))}
            </View>
          )}

          {/* Actions */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textTertiary }]}>ACTIONS</Text>
            <View style={styles.actionsCol}>
              <Button
                variant="outline"
                onPress={handleResetPassword}
                loading={resetPassword.isPending}
                fullWidth
                icon={<Ionicons name="key-outline" size={16} color={theme.colors.primary} />}
              >
                Reset Password
              </Button>
              <Button
                variant={user.is_active ? 'danger' : 'primary'}
                onPress={handleToggleActive}
                loading={updateUser.isPending}
                fullWidth
                icon={
                  <Ionicons
                    name={user.is_active ? 'ban-outline' : 'checkmark-circle-outline'}
                    size={16}
                    color="#fff"
                  />
                }
              >
                {user.is_active ? 'Deactivate User' : 'Activate User'}
              </Button>
            </View>
          </View>
        </>
      )}

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
  profileSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
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
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
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
  infoCard: {},
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  infoLabel: {
    fontSize: fontSize.sm,
  },
  infoValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  siteCard: {
    marginBottom: spacing.xs,
  },
  siteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  siteName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  actionsCol: {
    gap: spacing.sm,
  },
})
