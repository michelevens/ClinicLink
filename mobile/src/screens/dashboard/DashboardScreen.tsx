import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../theme'
import { spacing, fontSize, fontWeight, colors } from '../../theme'
import { Screen, StatCard, Card, Avatar } from '../../components/ui'
import { useDashboardStats } from '../../hooks/useApi'

export function DashboardScreen() {
  const { user } = useAuth()
  const { theme } = useTheme()
  const { data: stats, isLoading, refetch } = useDashboardStats()

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const roleLabel: Record<string, string> = {
    student: 'Student',
    preceptor: 'Preceptor',
    site_manager: 'Site Manager',
    coordinator: 'Coordinator',
    professor: 'Professor',
    admin: 'Administrator',
  }

  return (
    <Screen
      refreshing={isLoading}
      onRefresh={refetch}
    >
      {/* Greeting */}
      <View style={styles.greeting}>
        <View style={styles.greetingText}>
          <Text style={[styles.greetingLabel, { color: theme.colors.textSecondary }]}>
            {greeting()},
          </Text>
          <Text style={[styles.greetingName, { color: theme.colors.text }]}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={[styles.roleLabel, { color: theme.colors.primary }]}>
            {roleLabel[user?.role ?? ''] ?? user?.role}
          </Text>
        </View>
        <Avatar
          name={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`}
          imageUrl={user?.avatar}
          size="lg"
        />
      </View>

      {/* Stats Grid */}
      {stats && (
        <View style={styles.statsGrid}>
          {user?.role === 'student' && (
            <>
              <View style={styles.statsRow}>
                <StatCard
                  label="Hours Completed"
                  value={stats.total_hours ?? 0}
                  icon={<Ionicons name="time-outline" size={20} color={colors.primary[600]} />}
                  color={colors.primary[600]}
                />
                <StatCard
                  label="Active Rotations"
                  value={stats.active_rotations ?? 0}
                  icon={<Ionicons name="pulse-outline" size={20} color={colors.accent[600]} />}
                  color={colors.accent[600]}
                />
              </View>
              <View style={styles.statsRow}>
                <StatCard
                  label="Applications"
                  value={stats.applications_count ?? 0}
                  icon={<Ionicons name="document-text-outline" size={20} color={colors.secondary[500]} />}
                  color={colors.secondary[500]}
                />
                <StatCard
                  label="Pending Hours"
                  value={stats.pending_hours ?? 0}
                  icon={<Ionicons name="hourglass-outline" size={20} color={colors.accent[500]} />}
                  color={colors.accent[500]}
                />
              </View>
              {stats.hours_required ? (
                <Card padding="md">
                  <Text style={[styles.progressLabel, { color: theme.colors.textSecondary }]}>
                    Hours Progress
                  </Text>
                  <View style={[styles.progressBar, { backgroundColor: theme.colors.surfaceSecondary }]}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          backgroundColor: theme.colors.primary,
                          width: `${Math.min(100, (stats.hours_progress ?? 0))}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
                    {stats.total_hours ?? 0} / {stats.hours_required} hours ({Math.round(stats.hours_progress ?? 0)}%)
                  </Text>
                </Card>
              ) : null}
            </>
          )}

          {user?.role === 'preceptor' && (
            <View style={styles.statsRow}>
              <StatCard
                label="Active Students"
                value={stats.active_students ?? 0}
                icon={<Ionicons name="people-outline" size={20} color={colors.primary[600]} />}
                color={colors.primary[600]}
              />
              <StatCard
                label="Pending Reviews"
                value={stats.pending_hour_reviews ?? 0}
                icon={<Ionicons name="checkmark-circle-outline" size={20} color={colors.accent[500]} />}
                color={colors.accent[500]}
              />
            </View>
          )}

          {(user?.role === 'site_manager' || user?.role === 'admin') && (
            <View style={styles.statsRow}>
              <StatCard
                label="Open Slots"
                value={stats.open_slots ?? 0}
                icon={<Ionicons name="calendar-outline" size={20} color={colors.primary[600]} />}
                color={colors.primary[600]}
              />
              <StatCard
                label="Applications"
                value={stats.recent_applications ?? stats.pending_applications ?? 0}
                icon={<Ionicons name="document-text-outline" size={20} color={colors.secondary[500]} />}
                color={colors.secondary[500]}
              />
            </View>
          )}

          {user?.role === 'coordinator' && (
            <View style={styles.statsRow}>
              <StatCard
                label="Total Students"
                value={stats.total_students ?? 0}
                icon={<Ionicons name="school-outline" size={20} color={colors.primary[600]} />}
                color={colors.primary[600]}
              />
              <StatCard
                label="Active Placements"
                value={stats.active_placements ?? 0}
                icon={<Ionicons name="briefcase-outline" size={20} color={colors.accent[500]} />}
                color={colors.accent[500]}
              />
            </View>
          )}
        </View>
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  greeting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  greetingText: { flex: 1 },
  greetingLabel: {
    fontSize: fontSize.base,
    marginBottom: 2,
  },
  greetingName: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginBottom: 4,
  },
  roleLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  statsGrid: {
    gap: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  progressLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: fontSize.xs,
  },
})
