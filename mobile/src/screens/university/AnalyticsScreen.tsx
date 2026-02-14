import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { spacing, fontSize, fontWeight, radius } from '../../theme'
import { Card } from '../../components/ui'
import { useAnalyticsSummary, useSpecialtyDemand } from '../../hooks/useApi'

export function AnalyticsScreen({ navigation }: { navigation: any }) {
  const { theme } = useTheme()
  const { data: summaryData, isLoading, refetch } = useAnalyticsSummary()
  const { data: demandData } = useSpecialtyDemand()

  const summary = summaryData
  const demand = demandData?.specialties ?? []

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={theme.colors.primary} />}
    >
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Analytics</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {/* Key Metrics */}
        {summary && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.colors.textTertiary }]}>KEY METRICS</Text>
            <View style={styles.statsGrid}>
              <Card style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
                <Ionicons name="people-outline" size={24} color={theme.colors.primary} />
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {`${(summary.active_students as number) ?? 0}`}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Active Students</Text>
              </Card>
              <Card style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
                <Ionicons name="checkmark-circle-outline" size={24} color={theme.colors.success} />
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {`${(summary.total_placements as number) ?? 0}`}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Placements</Text>
              </Card>
              <Card style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
                <Ionicons name="calendar-outline" size={24} color={theme.colors.warning} />
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {`${Math.round(((summary.slot_fill_rate as number) ?? 0) * 100)}%`}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Fill Rate</Text>
              </Card>
              <Card style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
                <Ionicons name="time-outline" size={24} color={theme.colors.primary} />
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {`${(summary.total_hours as number) ?? 0}`}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Total Hours</Text>
              </Card>
            </View>

            {summary.placement_rate !== undefined && (
              <Card style={[styles.completionCard, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.completionLabel, { color: theme.colors.textSecondary }]}>
                  Placement Rate
                </Text>
                <Text style={[styles.completionValue, { color: theme.colors.success }]}>
                  {`${Math.round((summary.placement_rate as number) ?? 0)}%`}
                </Text>
                <View style={[styles.progressBar, { backgroundColor: theme.colors.surfaceSecondary }]}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        backgroundColor: theme.colors.success,
                        width: `${Math.min(100, (summary.placement_rate as number) ?? 0)}%`,
                      },
                    ]}
                  />
                </View>
              </Card>
            )}
          </>
        )}

        {/* Specialty Demand */}
        {demand.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.colors.textTertiary }]}>SPECIALTY DEMAND</Text>
            <Card style={[styles.demandCard, { backgroundColor: theme.colors.card }]}>
              {demand.slice(0, 10).map((item: any, index: number) => {
                const maxCount = demand[0]?.count ?? 1
                const barWidth = Math.max(10, (item.count / maxCount) * 100)
                return (
                  <View key={item.specialty || index} style={styles.demandRow}>
                    <Text style={[styles.demandName, { color: theme.colors.text }]} numberOfLines={1}>
                      {item.specialty}
                    </Text>
                    <View style={styles.demandBarContainer}>
                      <View
                        style={[
                          styles.demandBar,
                          {
                            backgroundColor: theme.colors.primaryLight,
                            width: `${barWidth}%`,
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.demandCount, { color: theme.colors.textSecondary }]}>
                      {`${item.count}`}
                    </Text>
                  </View>
                )
              })}
            </Card>
          </>
        )}

        {!summary && !isLoading && (
          <View style={styles.empty}>
            <Ionicons name="analytics-outline" size={48} color={theme.colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Data</Text>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              Analytics data will populate as the platform is used
            </Text>
          </View>
        )}
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
  },
  content: {
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
    marginLeft: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    flexGrow: 1,
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  completionCard: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  completionLabel: {
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  completionValue: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    width: '100%',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  demandCard: {},
  demandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  demandName: {
    fontSize: fontSize.sm,
    width: 100,
  },
  demandBarContainer: {
    flex: 1,
    height: 12,
    borderRadius: 6,
  },
  demandBar: {
    height: 12,
    borderRadius: 6,
  },
  demandCount: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    width: 30,
    textAlign: 'right',
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
