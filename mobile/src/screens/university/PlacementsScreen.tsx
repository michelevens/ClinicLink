import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { spacing, fontSize, fontWeight } from '../../theme'
import { Card, Badge, Avatar } from '../../components/ui'
import { useApplications } from '../../hooks/useApi'

const STATUS_VARIANT: Record<string, 'warning' | 'success' | 'danger' | 'default' | 'info' | 'primary'> = {
  pending: 'warning',
  accepted: 'success',
  declined: 'danger',
  waitlisted: 'info',
  withdrawn: 'default',
  completed: 'primary',
}

export function PlacementsScreen({ navigation }: { navigation: any }) {
  const { theme } = useTheme()
  const { data, isLoading, refetch } = useApplications()

  const placements = (data?.data ?? []).filter(
    (a: any) => a.status === 'accepted' || a.status === 'completed'
  )

  const renderPlacement = ({ item }: { item: any }) => {
    const studentName = item.student
      ? `${item.student.first_name} ${item.student.last_name}`
      : 'Student'

    return (
      <Card style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <View style={styles.cardRow}>
          <Avatar name={studentName} size="md" imageUrl={item.student?.avatar_url} />
          <View style={styles.cardInfo}>
            <Text style={[styles.studentName, { color: theme.colors.text }]}>{studentName}</Text>
            <Text style={[styles.slotTitle, { color: theme.colors.textSecondary }]} numberOfLines={1}>
              {item.slot?.title || 'Rotation'}
            </Text>
            {item.slot?.site?.name && (
              <Text style={[styles.siteName, { color: theme.colors.textTertiary }]}>
                {item.slot.site.name}
              </Text>
            )}
          </View>
          <Badge variant={(STATUS_VARIANT[item.status] || 'default') as any} size="sm">
            {item.status}
          </Badge>
        </View>

        {item.slot && (
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={14} color={theme.colors.textTertiary} />
            <Text style={[styles.dateText, { color: theme.colors.textTertiary }]}>
              {new Date(item.slot.start_date).toLocaleDateString()} – {new Date(item.slot.end_date).toLocaleDateString()}
            </Text>
          </View>
        )}
      </Card>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Placements</Text>
        <Text style={[styles.headerCount, { color: theme.colors.textSecondary }]}>
          {placements.length} active placement{placements.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={placements}
        keyExtractor={(item) => item.id}
        renderItem={renderPlacement}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={theme.colors.primary} />}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Ionicons name="briefcase-outline" size={48} color={theme.colors.textTertiary} />
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Placements</Text>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                Active student placements will appear here
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
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  cardInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  slotTitle: {
    fontSize: fontSize.sm,
    marginTop: 1,
  },
  siteName: {
    fontSize: fontSize.xs,
    marginTop: 1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: fontSize.xs,
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
