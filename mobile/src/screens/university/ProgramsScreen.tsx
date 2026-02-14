import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { spacing, fontSize, fontWeight } from '../../theme'
import { Card, Badge } from '../../components/ui'
import { useUniversities } from '../../hooks/useApi'
import { useAuth } from '../../contexts/AuthContext'

export function ProgramsScreen({ navigation }: { navigation: any }) {
  const { theme } = useTheme()
  const { user } = useAuth()
  const { data, isLoading, refetch } = useUniversities()

  // Flatten programs from all universities
  const universities = data?.data ?? []
  const programs: any[] = []
  universities.forEach((uni: any) => {
    (uni.programs ?? []).forEach((prog: any) => {
      programs.push({ ...prog, university_name: uni.name, university_id: uni.id })
    })
  })

  const renderProgram = ({ item }: { item: any }) => (
    <Card style={[styles.card, { backgroundColor: theme.colors.card }]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <Text style={[styles.programName, { color: theme.colors.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.universityName, { color: theme.colors.textSecondary }]}>
            {item.university_name}
          </Text>
        </View>
        <Badge variant="primary" size="sm">{item.degree_type || 'Other'}</Badge>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="people-outline" size={14} color={theme.colors.textTertiary} />
          <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
            {`${item.student_count ?? 0}`} students
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={14} color={theme.colors.textTertiary} />
          <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
            {`${item.required_hours ?? 0}`}h required
          </Text>
        </View>
      </View>

      {item.specialties?.length > 0 && (
        <View style={styles.tagsRow}>
          {item.specialties.slice(0, 4).map((s: string) => (
            <Badge key={s} variant="default" size="sm">{s}</Badge>
          ))}
        </View>
      )}
    </Card>
  )

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Programs</Text>
        <Text style={[styles.headerCount, { color: theme.colors.textSecondary }]}>
          {programs.length} program{programs.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={programs}
        keyExtractor={(item) => item.id}
        renderItem={renderProgram}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={theme.colors.primary} />}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Ionicons name="school-outline" size={48} color={theme.colors.textTertiary} />
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Programs</Text>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                Academic programs will appear here
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  headerCount: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  listContent: {
    padding: spacing.md,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  cardInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  programName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  universityName: {
    fontSize: fontSize.sm,
    marginTop: 1,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: fontSize.sm,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  emptyText: {
    fontSize: fontSize.base,
    textAlign: 'center',
  },
})
