import { useState } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { spacing, fontSize, fontWeight, radius, colors } from '../../theme'
import { Card, Badge, Button } from '../../components/ui'
import { useHourLogs, useHourSummary, useDeleteHourLog } from '../../hooks/useApi'

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'danger'> = {
  approved: 'success',
  pending: 'warning',
  rejected: 'danger',
}

const CATEGORY_LABELS: Record<string, string> = {
  direct_care: 'Direct Care',
  indirect_care: 'Indirect Care',
  simulation: 'Simulation',
  observation: 'Observation',
  other: 'Other',
}

export function HourLogScreen({ navigation }: { navigation: any }) {
  const { theme } = useTheme()
  const { data: logsData, isLoading, refetch } = useHourLogs()
  const { data: summaryData } = useHourSummary()
  const deleteLog = useDeleteHourLog()

  const logs = logsData?.data ?? []
  const summary = summaryData

  const handleDelete = (id: string) => {
    Alert.alert('Delete Hour Log', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteLog.mutate(id) },
    ])
  }

  const renderLog = ({ item }: { item: any }) => (
    <Card style={[styles.logCard, { backgroundColor: theme.colors.card }]}>
      <View style={styles.logHeader}>
        <View style={styles.logInfo}>
          <Text style={[styles.logDate, { color: theme.colors.text }]}>
            {new Date(item.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </Text>
          <Text style={[styles.logHours, { color: theme.colors.primary }]}>
            {item.hours_worked}h
          </Text>
        </View>
        <Badge variant={STATUS_COLORS[item.status] || 'default'} size="sm">
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Badge>
      </View>

      <View style={styles.logMeta}>
        <Badge variant="default" size="sm">{CATEGORY_LABELS[item.category] || item.category}</Badge>
        {item.slot?.title && (
          <Text style={[styles.slotName, { color: theme.colors.textSecondary }]} numberOfLines={1}>
            {item.slot.title}
          </Text>
        )}
      </View>

      {item.description && (
        <Text style={[styles.logDesc, { color: theme.colors.textSecondary }]} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      {item.status === 'rejected' && item.rejection_reason && (
        <View style={[styles.rejectionBanner, { backgroundColor: theme.colors.dangerLight }]}>
          <Ionicons name="alert-circle" size={14} color={theme.colors.danger} />
          <Text style={[styles.rejectionText, { color: theme.colors.danger }]}>
            {item.rejection_reason}
          </Text>
        </View>
      )}

      {item.status === 'pending' && (
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={16} color={theme.colors.danger} />
        </TouchableOpacity>
      )}
    </Card>
  )

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Summary */}
      {summary && (
        <View style={[styles.summarySection, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>Hour Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>
                {summary.approved_hours ?? 0}
              </Text>
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Approved</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: colors.warning }]}>
                {summary.pending_hours ?? 0}
              </Text>
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Pending</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                {summary.total_hours ?? 0}
              </Text>
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Total</Text>
            </View>
            {summary.hours_required != null && (
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: theme.colors.success }]}>
                  {Math.round(((summary.approved_hours ?? 0) / summary.hours_required) * 100)}%
                </Text>
                <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Progress</Text>
              </View>
            )}
          </View>

          {summary.hours_required != null && (
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBarBg, { backgroundColor: theme.colors.surfaceSecondary }]}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      backgroundColor: theme.colors.primary,
                      width: `${Math.min(((summary.approved_hours ?? 0) / summary.hours_required) * 100, 100)}%`,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
                {summary.approved_hours ?? 0} / {summary.hours_required} hours
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Log List */}
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        renderItem={renderLog}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={theme.colors.primary} />}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Ionicons name="time-outline" size={48} color={theme.colors.textTertiary} />
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Hours Logged</Text>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                Tap + to log your clinical hours
              </Text>
            </View>
          ) : null
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('HourLogEntry')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  summarySection: {
    padding: spacing.md,
    borderBottomWidth: 1,
  },
  summaryTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.sm,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  summaryLabel: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  progressBarContainer: {
    gap: 4,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: fontSize.xs,
    textAlign: 'right',
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 80,
  },
  logCard: {
    marginBottom: spacing.sm,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  logInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logDate: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  logHours: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
  logMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  slotName: {
    fontSize: fontSize.sm,
    flex: 1,
  },
  logDesc: {
    fontSize: fontSize.sm,
    lineHeight: 18,
  },
  rejectionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginTop: spacing.sm,
  },
  rejectionText: {
    fontSize: fontSize.xs,
    flex: 1,
  },
  deleteBtn: {
    alignSelf: 'flex-end',
    padding: spacing.xs,
    marginTop: spacing.xs,
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
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
})
