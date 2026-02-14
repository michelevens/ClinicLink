import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { spacing, fontSize, fontWeight, radius } from '../../theme'
import { Screen, Card, Badge, StatCard } from '../../components/ui'
import { useMySites } from '../../hooks/useApi'

export function MySiteScreen({ navigation }: { navigation: any }) {
  const { theme } = useTheme()
  const { data, isLoading, refetch } = useMySites()

  const sites = data?.sites ?? []
  const site = sites[0] // Primary managed site

  if (isLoading) {
    return (
      <Screen>
        <View style={styles.loading}>
          <Text style={{ color: theme.colors.textSecondary }}>Loading...</Text>
        </View>
      </Screen>
    )
  }

  if (!site) {
    return (
      <Screen>
        <View style={styles.empty}>
          <Ionicons name="business-outline" size={48} color={theme.colors.textTertiary} />
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Site</Text>
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            You are not managing any clinical sites yet
          </Text>
        </View>
      </Screen>
    )
  }

  return (
    <Screen scroll onRefresh={refetch} refreshing={isLoading}>
      <View style={styles.content}>
        {/* Site Header */}
        <View style={styles.siteHeader}>
          <View style={[styles.siteIcon, { backgroundColor: theme.colors.primaryLight }]}>
            <Ionicons name="business" size={32} color={theme.colors.primary} />
          </View>
          <Text style={[styles.siteName, { color: theme.colors.text }]}>{site.name}</Text>
          <Text style={[styles.siteAddress, { color: theme.colors.textSecondary }]}>
            {site.address}, {site.city}, {site.state} {site.zip}
          </Text>
          <View style={styles.badgeRow}>
            {site.is_verified && <Badge variant="success" size="sm">Verified</Badge>}
            {site.specialties?.map((s: string) => (
              <Badge key={s} variant="default" size="sm">{s}</Badge>
            ))}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <StatCard
            icon={<Ionicons name="calendar" size={20} color={theme.colors.primary} />}
            value={site.slots?.length ?? 0}
            label="Active Slots"
          />
          <StatCard
            icon={<Ionicons name="star" size={20} color="#f59e0b" />}
            value={site.rating?.toFixed(1) ?? '—'}
            label="Rating"
          />
        </View>

        {/* Contact Info */}
        <Card style={[styles.infoCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Contact Info</Text>
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>{site.phone}</Text>
          </View>
          {site.website && (
            <View style={styles.infoRow}>
              <Ionicons name="globe-outline" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>{site.website}</Text>
            </View>
          )}
          {site.ehr_system && (
            <View style={styles.infoRow}>
              <Ionicons name="desktop-outline" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>EHR: {site.ehr_system}</Text>
            </View>
          )}
        </Card>

        {/* Quick Actions */}
        <Card style={[styles.infoCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Quick Actions</Text>
          {[
            { label: 'Manage Slots', icon: 'calendar-outline', screen: 'SlotManagement' },
            { label: 'View Applications', icon: 'document-text-outline', screen: 'SiteApplications' },
            { label: 'Preceptors', icon: 'people-outline', screen: 'SitePreceptors' },
            { label: 'Compliance', icon: 'shield-checkmark-outline', screen: 'Compliance' },
          ].map((action) => (
            <TouchableOpacity
              key={action.screen}
              style={[styles.actionRow, { borderBottomColor: theme.colors.borderLight }]}
              onPress={() => navigation.navigate(action.screen)}
            >
              <Ionicons name={action.icon as any} size={20} color={theme.colors.primary} />
              <Text style={[styles.actionText, { color: theme.colors.text }]}>{action.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
            </TouchableOpacity>
          ))}
        </Card>

        {/* Description */}
        {site.description && (
          <Card style={[styles.infoCard, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>About</Text>
            <Text style={[styles.descText, { color: theme.colors.textSecondary }]}>{site.description}</Text>
          </Card>
        )}
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  siteHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  siteIcon: {
    width: 72,
    height: 72,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  siteName: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    textAlign: 'center',
  },
  siteAddress: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    marginTop: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
    justifyContent: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  infoCard: {
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 6,
  },
  infoText: {
    fontSize: fontSize.sm,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  actionText: {
    fontSize: fontSize.base,
    flex: 1,
  },
  descText: {
    fontSize: fontSize.base,
    lineHeight: 22,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
