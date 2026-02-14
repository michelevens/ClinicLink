import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { spacing, fontSize, fontWeight, radius } from '../../theme'
import { Card, Badge, Avatar } from '../../components/ui'
import { useApplications, useReviewApplication } from '../../hooks/useApi'

const STATUS_VARIANT: Record<string, 'warning' | 'success' | 'danger' | 'default' | 'info'> = {
  pending: 'warning',
  accepted: 'success',
  declined: 'danger',
  waitlisted: 'info',
  withdrawn: 'default',
}

export function SiteApplicationsScreen({ navigation }: { navigation: any }) {
  const { theme } = useTheme()
  const { data, isLoading, refetch } = useApplications()
  const reviewApp = useReviewApplication()

  const applications = data?.data ?? []

  const handleReview = (id: string, status: 'accepted' | 'declined' | 'waitlisted') => {
    const labels = { accepted: 'Accept', declined: 'Decline', waitlisted: 'Waitlist' }
    Alert.alert(`${labels[status]} Application`, `Are you sure?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: labels[status],
        style: status === 'declined' ? 'destructive' : 'default',
        onPress: () => reviewApp.mutate({ id, data: { status } }),
      },
    ])
  }

  const renderApp = ({ item }: { item: any }) => {
    const studentName = item.student
      ? `${item.student.first_name} ${item.student.last_name}`
      : 'Unknown Student'

    return (
      <Card style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <View style={styles.cardHeader}>
          <Avatar name={studentName} size="md" imageUrl={item.student?.avatar_url} />
          <View style={styles.cardInfo}>
            <Text style={[styles.studentName, { color: theme.colors.text }]}>{studentName}</Text>
            <Text style={[styles.slotTitle, { color: theme.colors.textSecondary }]} numberOfLines={1}>
              {item.slot?.title || 'Rotation'}
            </Text>
          </View>
          <Badge variant={STATUS_VARIANT[item.status] || 'default'} size="sm">
            {item.status}
          </Badge>
        </View>

        {item.cover_letter && (
          <Text style={[styles.coverLetter, { color: theme.colors.textSecondary }]} numberOfLines={2}>
            {item.cover_letter}
          </Text>
        )}

        <Text style={[styles.dateText, { color: theme.colors.textTertiary }]}>
          Applied {new Date(item.submitted_at || item.created_at).toLocaleDateString()}
        </Text>

        {item.status === 'pending' && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: theme.colors.successLight }]}
              onPress={() => handleReview(item.id, 'accepted')}
            >
              <Ionicons name="checkmark" size={16} color={theme.colors.success} />
              <Text style={[styles.actionText, { color: theme.colors.success }]}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: theme.colors.warningLight }]}
              onPress={() => handleReview(item.id, 'waitlisted')}
            >
              <Ionicons name="time-outline" size={16} color={theme.colors.warning} />
              <Text style={[styles.actionText, { color: theme.colors.warning }]}>Waitlist</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: theme.colors.dangerLight }]}
              onPress={() => handleReview(item.id, 'declined')}
            >
              <Ionicons name="close" size={16} color={theme.colors.danger} />
              <Text style={[styles.actionText, { color: theme.colors.danger }]}>Decline</Text>
            </TouchableOpacity>
          </View>
        )}
      </Card>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Applications</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={applications}
        keyExtractor={(item) => item.id}
        renderItem={renderApp}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={theme.colors.primary} />}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Ionicons name="document-text-outline" size={48} color={theme.colors.textTertiary} />
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Applications</Text>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                Applications to your slots will appear here
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
  coverLetter: {
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
  },
  dateText: {
    fontSize: fontSize.xs,
    marginBottom: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.md,
    flex: 1,
    justifyContent: 'center',
  },
  actionText: {
    fontSize: fontSize.xs,
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
