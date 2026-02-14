import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { spacing, fontSize, fontWeight, radius } from '../../theme'
import { Card, Badge, Avatar } from '../../components/ui'
import { useAdminUser } from '../../hooks/useApi'

export function StudentDetailScreen({ route, navigation }: { route: any; navigation: any }) {
  const { theme } = useTheme()
  const { studentId, name } = route.params ?? {}
  const { data, isLoading, refetch } = useAdminUser(studentId)

  const student = data?.user

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={theme.colors.primary} />}
    >
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]} numberOfLines={1}>
          {name || 'Student Detail'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Profile Header */}
      <View style={styles.profileSection}>
        <Avatar
          name={student ? `${student.first_name} ${student.last_name}` : (name || '?')}
          size="xl"
          imageUrl={student?.avatar_url}
        />
        <Text style={[styles.profileName, { color: theme.colors.text }]}>
          {student ? `${student.first_name} ${student.last_name}` : name}
        </Text>
        {student?.email && (
          <Text style={[styles.profileEmail, { color: theme.colors.textSecondary }]}>{student.email}</Text>
        )}
      </View>

      {/* Contact Info */}
      {student && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textTertiary }]}>CONTACT</Text>
          <Card style={[styles.infoCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={18} color={theme.colors.primary} />
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>{student.email}</Text>
            </View>
            {student.phone && (
              <View style={styles.infoRow}>
                <Ionicons name="call-outline" size={18} color={theme.colors.primary} />
                <Text style={[styles.infoValue, { color: theme.colors.text }]}>{student.phone}</Text>
              </View>
            )}
          </Card>
        </View>
      )}

      {/* Academic Info */}
      {student?.student_profile && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textTertiary }]}>ACADEMIC</Text>
          <Card style={[styles.infoCard, { backgroundColor: theme.colors.card }]}>
            {student.student_profile.university?.name && (
              <View style={styles.infoRow}>
                <Ionicons name="school-outline" size={18} color={theme.colors.primary} />
                <View style={styles.infoColumn}>
                  <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>University</Text>
                  <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                    {student.student_profile.university.name}
                  </Text>
                </View>
              </View>
            )}
            {student.student_profile.program?.name && (
              <View style={styles.infoRow}>
                <Ionicons name="book-outline" size={18} color={theme.colors.primary} />
                <View style={styles.infoColumn}>
                  <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Program</Text>
                  <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                    {student.student_profile.program.name}
                  </Text>
                </View>
              </View>
            )}
          </Card>
        </View>
      )}

      {/* Active Rotations */}
      {((student as any)?.active_rotations?.length ?? 0) > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textTertiary }]}>ACTIVE ROTATIONS</Text>
          {(student as any).active_rotations.map((rotation: any) => (
            <Card key={rotation.id} style={[styles.rotationCard, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.rotationTitle, { color: theme.colors.text }]}>{rotation.title}</Text>
              <View style={styles.rotationMeta}>
                <Badge variant="primary" size="sm">{rotation.specialty || 'General'}</Badge>
                <Text style={[styles.rotationDate, { color: theme.colors.textSecondary }]}>
                  {new Date(rotation.start_date).toLocaleDateString()} – {new Date(rotation.end_date).toLocaleDateString()}
                </Text>
              </View>
            </Card>
          ))}
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textTertiary }]}>ACTIONS</Text>
        <Card style={[styles.infoCard, { backgroundColor: theme.colors.card }]} padding="none">
          <TouchableOpacity
            style={[styles.actionRow, { borderBottomColor: theme.colors.borderLight }]}
            onPress={() => navigation.navigate('CreateEvaluation', { studentId })}
          >
            <Ionicons name="star-outline" size={20} color={theme.colors.primary} />
            <Text style={[styles.actionText, { color: theme.colors.text }]}>Create Evaluation</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => navigation.navigate('HourReview', { studentId })}
          >
            <Ionicons name="time-outline" size={20} color={theme.colors.primary} />
            <Text style={[styles.actionText, { color: theme.colors.text }]}>Review Hours</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        </Card>
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
    flex: 1,
    textAlign: 'center',
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
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  infoColumn: {
    flex: 1,
  },
  infoLabel: {
    fontSize: fontSize.xs,
  },
  infoValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  rotationCard: {
    marginBottom: spacing.sm,
  },
  rotationTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  rotationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rotationDate: {
    fontSize: fontSize.xs,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  actionText: {
    fontSize: fontSize.base,
    flex: 1,
  },
})
