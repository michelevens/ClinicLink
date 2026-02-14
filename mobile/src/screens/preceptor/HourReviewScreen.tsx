import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { spacing, fontSize, fontWeight, radius } from '../../theme'
import { Card, Badge } from '../../components/ui'
import { useHourLogs, useReviewHourLog } from '../../hooks/useApi'

export function HourReviewScreen({ navigation }: { navigation: any }) {
  const { theme } = useTheme()
  const { data, isLoading, refetch } = useHourLogs()
  const reviewHourLog = useReviewHourLog()

  const logs = (data?.data ?? []).filter((l: any) => l.status === 'pending')

  const handleApprove = (id: string) => {
    Alert.alert('Approve Hours', 'Approve this hour log entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Approve',
        onPress: () => reviewHourLog.mutate({ id, data: { status: 'approved' } }),
      },
    ])
  }

  const handleReject = (id: string) => {
    Alert.alert('Reject Hours', 'Reject this hour log entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: () => reviewHourLog.mutate({ id, data: { status: 'rejected' } }),
      },
    ])
  }

  const renderLog = ({ item }: { item: any }) => (
    <Card style={[styles.card, { backgroundColor: theme.colors.card }]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <Text style={[styles.studentName, { color: theme.colors.text }]}>
            {item.student_name || 'Student'}
          </Text>
          <Text style={[styles.dateText, { color: theme.colors.textSecondary }]}>
            {new Date(item.date).toLocaleDateString()}
          </Text>
        </View>
        <Badge variant="warning" size="sm">Pending</Badge>
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.detail}>
          <Ionicons name="time-outline" size={14} color={theme.colors.textTertiary} />
          <Text style={[styles.detailText, { color: theme.colors.text }]}>
            {`${item.hours_worked}h`}
          </Text>
        </View>
        <Badge variant="default" size="sm">
          {(item.category || 'other').replace('_', ' ')}
        </Badge>
      </View>

      {item.description && (
        <Text style={[styles.description, { color: theme.colors.textSecondary }]} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.colors.successLight }]}
          onPress={() => handleApprove(item.id)}
        >
          <Ionicons name="checkmark" size={16} color={theme.colors.success} />
          <Text style={[styles.actionText, { color: theme.colors.success }]}>Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.colors.dangerLight }]}
          onPress={() => handleReject(item.id)}
        >
          <Ionicons name="close" size={16} color={theme.colors.danger} />
          <Text style={[styles.actionText, { color: theme.colors.danger }]}>Reject</Text>
        </TouchableOpacity>
      </View>
    </Card>
  )

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Hour Review</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        renderItem={renderLog}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={theme.colors.primary} />}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Ionicons name="checkmark-circle-outline" size={48} color={theme.colors.textTertiary} />
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>All Caught Up</Text>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                No pending hour logs to review
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
  },
  studentName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  dateText: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  description: {
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.md,
    flex: 1,
    justifyContent: 'center',
  },
  actionText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
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
