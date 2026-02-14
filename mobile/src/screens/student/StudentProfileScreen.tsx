import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { spacing, fontSize, fontWeight, radius } from '../../theme'
import { Card, Badge, Avatar } from '../../components/ui'
import { useAuth } from '../../contexts/AuthContext'
import { useStudentProfile, useCredentials, useHourSummary } from '../../hooks/useApi'

export function StudentProfileScreen({ navigation }: { navigation: any }) {
  const { theme } = useTheme()
  const { user } = useAuth()
  const { data: profile, isLoading, refetch } = useStudentProfile()
  const { data: credentialsData } = useCredentials()
  const { data: hourData } = useHourSummary()

  const credentials = credentialsData?.credentials ?? []
  const summary = hourData

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

      {/* Profile Card */}
      <View style={styles.profileSection}>
        <Avatar name={`${user?.firstName} ${user?.lastName}`} size="xl" />
        <Text style={[styles.profileName, { color: theme.colors.text }]}>
          {user?.firstName} {user?.lastName}
        </Text>
        <Text style={[styles.profileEmail, { color: theme.colors.textSecondary }]}>
          {user?.email}
        </Text>
      </View>

      {/* Academic Info */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textTertiary }]}>ACADEMIC</Text>
        <Card style={[styles.infoCard, { backgroundColor: theme.colors.card }]}>
          {profile?.profile?.university?.name && (
            <View style={styles.infoRow}>
              <Ionicons name="school-outline" size={18} color={theme.colors.primary} />
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>University</Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]} numberOfLines={1}>
                {profile.profile.university.name}
              </Text>
            </View>
          )}
          {profile?.profile?.program?.name && (
            <View style={styles.infoRow}>
              <Ionicons name="book-outline" size={18} color={theme.colors.primary} />
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Program</Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]} numberOfLines={1}>
                {profile.profile.program.name}
              </Text>
            </View>
          )}
          {profile?.profile?.graduation_date && (
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={18} color={theme.colors.primary} />
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Graduation</Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {new Date(profile.profile.graduation_date).toLocaleDateString()}
              </Text>
            </View>
          )}
        </Card>
      </View>

      {/* Hours Summary */}
      {summary && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textTertiary }]}>CLINICAL HOURS</Text>
          <Card style={[styles.infoCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.hoursGrid}>
              <View style={styles.hoursStat}>
                <Text style={[styles.hoursNumber, { color: theme.colors.primary }]}>
                  {summary.approved_hours ?? 0}
                </Text>
                <Text style={[styles.hoursLabel, { color: theme.colors.textSecondary }]}>Approved</Text>
              </View>
              <View style={styles.hoursStat}>
                <Text style={[styles.hoursNumber, { color: theme.colors.warning }]}>
                  {summary.pending_hours ?? 0}
                </Text>
                <Text style={[styles.hoursLabel, { color: theme.colors.textSecondary }]}>Pending</Text>
              </View>
              <View style={styles.hoursStat}>
                <Text style={[styles.hoursNumber, { color: theme.colors.text }]}>
                  {summary.hours_required ?? 0}
                </Text>
                <Text style={[styles.hoursLabel, { color: theme.colors.textSecondary }]}>Required</Text>
              </View>
            </View>
            {summary.hours_required > 0 && (
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { backgroundColor: theme.colors.surfaceSecondary }]}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        backgroundColor: theme.colors.primary,
                        width: `${Math.min(100, summary.progress_percent ?? 0)}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
                  {`${Math.round(summary.progress_percent ?? 0)}%`} complete
                </Text>
              </View>
            )}
          </Card>
        </View>
      )}

      {/* Credentials */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textTertiary }]}>CREDENTIALS</Text>
        <Card style={[styles.infoCard, { backgroundColor: theme.colors.card }]}>
          {credentials.length === 0 ? (
            <Text style={[styles.noData, { color: theme.colors.textSecondary }]}>
              No credentials uploaded yet
            </Text>
          ) : (
            credentials.map((cred: any) => (
              <View key={cred.id} style={styles.credRow}>
                <Ionicons
                  name={cred.status === 'valid' ? 'checkmark-circle' : cred.status === 'expired' ? 'close-circle' : 'time'}
                  size={18}
                  color={cred.status === 'valid' ? theme.colors.success : cred.status === 'expired' ? theme.colors.danger : theme.colors.warning}
                />
                <Text style={[styles.credName, { color: theme.colors.text }]} numberOfLines={1}>
                  {cred.name}
                </Text>
                <Badge
                  variant={cred.status === 'valid' ? 'success' : cred.status === 'expired' ? 'danger' : 'warning'}
                  size="sm"
                >
                  {cred.status}
                </Badge>
              </View>
            ))
          )}
        </Card>
      </View>

      {/* Clinical Interests */}
      {(profile?.profile?.clinical_interests?.length ?? 0) > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textTertiary }]}>CLINICAL INTERESTS</Text>
          <View style={styles.tagsRow}>
            {profile!.profile.clinical_interests!.map((interest: string) => (
              <Badge key={interest} variant="primary" size="sm">{interest}</Badge>
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
  infoCard: {},
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  infoLabel: {
    fontSize: fontSize.sm,
    width: 80,
  },
  infoValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    flex: 1,
  },
  hoursGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  hoursStat: {
    alignItems: 'center',
  },
  hoursNumber: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  hoursLabel: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  progressContainer: {
    gap: spacing.xs,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
  credRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  credName: {
    fontSize: fontSize.sm,
    flex: 1,
  },
  noData: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
})
