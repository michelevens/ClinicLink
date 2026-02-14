import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { spacing, fontSize, fontWeight, radius } from '../../theme'
import { Card, Badge } from '../../components/ui'
import { useApplications, useWithdrawApplication } from '../../hooks/useApi'

const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'danger' | 'info' | 'default' | 'primary'; label: string }> = {
  pending: { variant: 'warning', label: 'Pending' },
  accepted: { variant: 'success', label: 'Accepted' },
  declined: { variant: 'danger', label: 'Declined' },
  waitlisted: { variant: 'info', label: 'Waitlisted' },
  withdrawn: { variant: 'default', label: 'Withdrawn' },
  completed: { variant: 'primary', label: 'Completed' },
}

export function ApplicationsScreen({ navigation }: { navigation: any }) {
  const { theme } = useTheme()
  const { data, isLoading, refetch } = useApplications()
  const withdrawApp = useWithdrawApplication()

  const applications = data?.data ?? []

  const handleWithdraw = (id: string) => {
    Alert.alert(
      'Withdraw Application',
      'Are you sure you want to withdraw this application?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Withdraw',
          style: 'destructive',
          onPress: () => withdrawApp.mutate(id),
        },
      ]
    )
  }

  const renderApplication = ({ item }: { item: any }) => {
    const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending
    const slot = item.slot

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('SlotDetail', { slotId: item.slot_id })}
        activeOpacity={0.7}
      >
        <Card style={[styles.appCard, { backgroundColor: theme.colors.card }]}>
          <View style={styles.appHeader}>
            <Text style={[styles.appTitle, { color: theme.colors.text }]} numberOfLines={1}>
              {slot?.title || 'Rotation Slot'}
            </Text>
            <Badge variant={status.variant} size="sm">{status.label}</Badge>
          </View>

          {slot?.site && (
            <View style={styles.siteRow}>
              <Ionicons name="business-outline" size={14} color={theme.colors.textSecondary} />
              <Text style={[styles.siteText, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                {slot.site.name}
              </Text>
            </View>
          )}

          {slot && (
            <View style={styles.siteRow}>
              <Ionicons name="medical-outline" size={14} color={theme.colors.textSecondary} />
              <Text style={[styles.siteText, { color: theme.colors.textSecondary }]}>
                {slot.specialty}
              </Text>
            </View>
          )}

          <View style={styles.dateRow}>
            <Ionicons name="time-outline" size={14} color={theme.colors.textTertiary} />
            <Text style={[styles.dateText, { color: theme.colors.textTertiary }]}>
              Applied {new Date(item.submitted_at || item.created_at).toLocaleDateString()}
            </Text>
          </View>

          {item.notes && (
            <Text style={[styles.notes, { color: theme.colors.textSecondary }]} numberOfLines={2}>
              Note: {item.notes}
            </Text>
          )}

          {item.status === 'pending' && (
            <TouchableOpacity
              style={[styles.withdrawBtn, { borderColor: theme.colors.danger }]}
              onPress={() => handleWithdraw(item.id)}
            >
              <Text style={[styles.withdrawText, { color: theme.colors.danger }]}>Withdraw</Text>
            </TouchableOpacity>
          )}
        </Card>
      </TouchableOpacity>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>My Applications</Text>
        <Text style={[styles.headerCount, { color: theme.colors.textSecondary }]}>
          {applications.length} application{applications.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={applications}
        keyExtractor={(item) => item.id}
        renderItem={renderApplication}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={theme.colors.primary} />}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Ionicons name="document-text-outline" size={48} color={theme.colors.textTertiary} />
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Applications</Text>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                Search for rotations and apply to get started
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
  appCard: {
    marginBottom: spacing.md,
  },
  appHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  appTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    flex: 1,
    marginRight: spacing.sm,
  },
  siteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  siteText: {
    fontSize: fontSize.sm,
    flex: 1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
  },
  dateText: {
    fontSize: fontSize.xs,
  },
  notes: {
    fontSize: fontSize.sm,
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
  withdrawBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: spacing.sm,
  },
  withdrawText: {
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
