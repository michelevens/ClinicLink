import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { spacing, fontSize, fontWeight, radius } from '../../theme'
import { Card, Badge } from '../../components/ui'
import { useComplianceOverview } from '../../hooks/useApi'

export function ComplianceScreen({ navigation }: { navigation: any }) {
  const { theme } = useTheme()
  const { data, isLoading, refetch } = useComplianceOverview()

  const sites = data?.sites ?? []

  // Compute aggregates from sites array
  const totalStudents = sites.reduce((sum, s) => sum + s.total_students, 0)
  const compliantStudents = sites.reduce((sum, s) => sum + s.compliant_students, 0)
  const nonCompliant = totalStudents - compliantStudents
  const overallRate = totalStudents > 0 ? (compliantStudents / totalStudents) * 100 : 0

  const getComplianceColor = (rate: number) => {
    if (rate >= 90) return theme.colors.success
    if (rate >= 70) return theme.colors.warning
    return theme.colors.danger
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={theme.colors.primary} />}
    >
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Compliance</Text>
        <View style={{ width: 24 }} />
      </View>

      {sites.length > 0 && (
        <View style={styles.content}>
          {/* Overall Rate */}
          <Card style={[styles.overallCard, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.overallLabel, { color: theme.colors.textSecondary }]}>
              Overall Compliance Rate
            </Text>
            <Text
              style={[
                styles.overallRate,
                { color: getComplianceColor(overallRate) },
              ]}
            >
              {`${Math.round(overallRate)}%`}
            </Text>
            <View style={[styles.progressBar, { backgroundColor: theme.colors.surfaceSecondary }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: getComplianceColor(overallRate),
                    width: `${Math.min(100, overallRate)}%`,
                  },
                ]}
              />
            </View>
          </Card>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <Card style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
              <Ionicons name="people-outline" size={24} color={theme.colors.primary} />
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {`${totalStudents}`}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Students</Text>
            </Card>
            <Card style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
              <Ionicons name="checkmark-circle-outline" size={24} color={theme.colors.success} />
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {`${compliantStudents}`}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Compliant</Text>
            </Card>
            <Card style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
              <Ionicons name="close-circle-outline" size={24} color={theme.colors.danger} />
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {`${nonCompliant}`}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Non-Compliant</Text>
            </Card>
            <Card style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
              <Ionicons name="business-outline" size={24} color={theme.colors.primary} />
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {`${sites.length}`}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Sites</Text>
            </Card>
          </View>

          {/* Per-Site Breakdown */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textTertiary }]}>
              SITE COMPLIANCE
            </Text>
            {sites.map((site) => (
              <Card key={site.site_id} style={[styles.siteCard, { backgroundColor: theme.colors.card }]}>
                <View style={styles.siteHeader}>
                  <View style={styles.siteInfo}>
                    <Text style={[styles.siteName, { color: theme.colors.text }]} numberOfLines={1}>
                      {site.site_name}
                    </Text>
                    <Text style={[styles.siteLocation, { color: theme.colors.textSecondary }]}>
                      {site.site_city}, {site.site_state}
                    </Text>
                  </View>
                  <Badge
                    variant={site.compliance_percentage >= 90 ? 'success' : site.compliance_percentage >= 70 ? 'warning' : 'danger'}
                    size="sm"
                  >
                    {`${Math.round(site.compliance_percentage)}%`}
                  </Badge>
                </View>
                <View style={[styles.siteProgress, { backgroundColor: theme.colors.surfaceSecondary }]}>
                  <View
                    style={[
                      styles.siteProgressFill,
                      {
                        backgroundColor: getComplianceColor(site.compliance_percentage),
                        width: `${Math.min(100, site.compliance_percentage)}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.siteStats, { color: theme.colors.textTertiary }]}>
                  {site.compliant_students}/{site.total_students} students compliant
                </Text>
              </Card>
            ))}
          </View>
        </View>
      )}

      {sites.length === 0 && !isLoading && (
        <View style={styles.empty}>
          <Ionicons name="shield-checkmark-outline" size={48} color={theme.colors.textTertiary} />
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Data</Text>
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            Compliance data will appear once students are placed
          </Text>
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
  content: {
    padding: spacing.md,
  },
  overallCard: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  overallLabel: {
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  overallRate: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
    marginBottom: spacing.md,
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
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
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  siteCard: {
    marginBottom: spacing.xs,
  },
  siteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  siteInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  siteName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  siteLocation: {
    fontSize: fontSize.xs,
    marginTop: 1,
  },
  siteProgress: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  siteProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  siteStats: {
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
