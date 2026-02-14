import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { spacing, fontSize, fontWeight, radius } from '../../theme'
import { Card, Badge, Avatar } from '../../components/ui'
import { useAuth } from '../../contexts/AuthContext'
import { usePreceptorProfile, usePreceptorReviewStats } from '../../hooks/useApi'

export function PreceptorProfileScreen({ navigation }: { navigation: any }) {
  const { theme } = useTheme()
  const { user } = useAuth()
  const { data: profileData, isLoading, refetch } = usePreceptorProfile(user?.id ?? null)
  const { data: statsData } = usePreceptorReviewStats(user?.id ?? null)

  const profile = profileData?.profile
  const stats = statsData

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={theme.colors.primary} />}
    >
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>My Profile</Text>
        <TouchableOpacity onPress={() => navigation.navigate('ProfileEdit')}>
          <Ionicons name="create-outline" size={22} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Profile Header */}
      <View style={styles.profileSection}>
        <Avatar name={`${user?.firstName} ${user?.lastName}`} size="xl" />
        <Text style={[styles.profileName, { color: theme.colors.text }]}>
          {user?.firstName} {user?.lastName}
        </Text>
        <Text style={[styles.profileEmail, { color: theme.colors.textSecondary }]}>
          {user?.email}
        </Text>
      </View>

      {/* Review Stats */}
      {stats && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textTertiary }]}>REVIEW STATS</Text>
          <Card style={[styles.statsCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Ionicons name="star" size={20} color={theme.colors.warning} />
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {stats.average_score?.toFixed(1) ?? 'N/A'}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Rating</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="chatbubble-outline" size={20} color={theme.colors.primary} />
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {`${stats.review_count ?? 0}`}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Reviews</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="people-outline" size={20} color={theme.colors.success} />
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {`${profile?.total_students_mentored ?? 0}`}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Students</Text>
              </View>
            </View>
          </Card>
        </View>
      )}

      {/* Specialties */}
      {(profile?.specialties?.length ?? 0) > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textTertiary }]}>SPECIALTIES</Text>
          <View style={styles.tagsRow}>
            {profile!.specialties.map((s: string) => (
              <Badge key={s} variant="primary" size="sm">{s}</Badge>
            ))}
          </View>
        </View>
      )}

      {/* Details */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textTertiary }]}>DETAILS</Text>
        <Card style={[styles.infoCard, { backgroundColor: theme.colors.card }]}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Experience</Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
              {profile?.years_experience ?? 0} years
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Max Students</Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
              {`${profile?.max_students ?? 0}`}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Availability</Text>
            <Badge variant={profile?.availability_status === 'available' ? 'success' : 'default'} size="sm">
              {profile?.availability_status ?? 'Unknown'}
            </Badge>
          </View>
        </Card>
      </View>

      {/* Badges */}
      {(profile?.badges?.length ?? 0) > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textTertiary }]}>BADGES</Text>
          <View style={styles.tagsRow}>
            {profile!.badges.map((badge: string) => (
              <Card key={badge} style={[styles.badgeCard, { backgroundColor: theme.colors.card }]}>
                <Ionicons name="ribbon" size={20} color={theme.colors.warning} />
                <Text style={[styles.badgeName, { color: theme.colors.text }]}>{badge}</Text>
              </Card>
            ))}
          </View>
        </View>
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
  statsCard: {},
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  statLabel: {
    fontSize: fontSize.xs,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
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
  badgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  badgeName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
})
