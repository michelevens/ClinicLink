import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { spacing, fontSize, fontWeight } from '../../theme'
import { Card, Badge, Avatar } from '../../components/ui'
import { useMyStudents } from '../../hooks/useApi'

export function MyStudentsScreen({ navigation }: { navigation: any }) {
  const { theme } = useTheme()
  const { data, isLoading, refetch } = useMyStudents()

  const students = data?.students ?? []

  const renderStudent = ({ item }: { item: any }) => {
    const name = `${item.first_name} ${item.last_name}`
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('StudentDetail', { studentId: item.id, name })}
        activeOpacity={0.7}
      >
        <Card style={[styles.studentCard, { backgroundColor: theme.colors.card }]}>
          <View style={styles.studentRow}>
            <Avatar name={name} size="md" imageUrl={item.avatar_url} />
            <View style={styles.studentInfo}>
              <Text style={[styles.studentName, { color: theme.colors.text }]}>{name}</Text>
              <Text style={[styles.studentMeta, { color: theme.colors.textSecondary }]}>
                {item.email}
              </Text>
              {item.university_name && (
                <Text style={[styles.studentMeta, { color: theme.colors.textTertiary }]}>
                  {item.university_name} — {item.program_name || 'No program'}
                </Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
          </View>
          {item.active_rotation && (
            <View style={styles.rotationInfo}>
              <Badge variant="primary" size="sm">{item.active_rotation.specialty || 'Active'}</Badge>
              <Text style={[styles.rotationText, { color: theme.colors.textSecondary }]}>
                {item.active_rotation.title}
              </Text>
            </View>
          )}
        </Card>
      </TouchableOpacity>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>My Students</Text>
        <Text style={[styles.headerCount, { color: theme.colors.textSecondary }]}>
          {students.length} student{students.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        renderItem={renderStudent}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={theme.colors.primary} />}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={48} color={theme.colors.textTertiary} />
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Students</Text>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                Students assigned to your rotations will appear here
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
  studentCard: {
    marginBottom: spacing.md,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  studentMeta: {
    fontSize: fontSize.sm,
    marginTop: 1,
  },
  rotationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  rotationText: {
    fontSize: fontSize.sm,
    flex: 1,
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
