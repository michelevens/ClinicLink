import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { spacing, fontSize, fontWeight } from '../../theme'
import { Card, Badge, Avatar } from '../../components/ui'
import { useSite } from '../../hooks/useApi'

export function SiteDetailScreen({ route, navigation }: { route: any; navigation: any }) {
  const { theme } = useTheme()
  const { siteId } = route.params ?? {}
  const { data, isLoading, refetch } = useSite(siteId ?? '')

  const site = data

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={theme.colors.primary} />}
    >
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]} numberOfLines={1}>
          {site?.name || 'Site Detail'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {site && (
        <>
          {/* Site Header */}
          <View style={styles.siteHeader}>
            <Ionicons name="business" size={48} color={theme.colors.primary} />
            <Text style={[styles.siteName, { color: theme.colors.text }]}>{site.name}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={16} color={theme.colors.warning} />
              <Text style={[styles.ratingText, { color: theme.colors.text }]}>
                {site.rating?.toFixed(1) ?? 'N/A'}
              </Text>
              <Text style={[styles.reviewCount, { color: theme.colors.textSecondary }]}>
                ({`${site.review_count ?? 0}`} reviews)
              </Text>
              {site.is_verified && <Badge variant="success" size="sm">Verified</Badge>}
            </View>
          </View>

          {/* Address */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textTertiary }]}>LOCATION</Text>
            <Card style={[styles.infoCard, { backgroundColor: theme.colors.card }]}>
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={18} color={theme.colors.primary} />
                <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                  {[site.address, site.city, site.state, site.zip].filter(Boolean).join(', ')}
                </Text>
              </View>
              {site.phone && (
                <View style={styles.infoRow}>
                  <Ionicons name="call-outline" size={18} color={theme.colors.primary} />
                  <Text style={[styles.infoValue, { color: theme.colors.text }]}>{site.phone}</Text>
                </View>
              )}
              {site.website && (
                <View style={styles.infoRow}>
                  <Ionicons name="globe-outline" size={18} color={theme.colors.primary} />
                  <Text style={[styles.infoValue, { color: theme.colors.primary }]} numberOfLines={1}>
                    {site.website}
                  </Text>
                </View>
              )}
            </Card>
          </View>

          {/* Description */}
          {site.description && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.textTertiary }]}>ABOUT</Text>
              <Card style={[styles.infoCard, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.descriptionText, { color: theme.colors.text }]}>
                  {site.description}
                </Text>
              </Card>
            </View>
          )}

          {/* Specialties */}
          {site.specialties?.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.textTertiary }]}>SPECIALTIES</Text>
              <View style={styles.tagsRow}>
                {site.specialties.map((s: string) => (
                  <Badge key={s} variant="primary" size="sm">{s}</Badge>
                ))}
              </View>
            </View>
          )}

          {/* EHR System */}
          {site.ehr_system && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.textTertiary }]}>EHR SYSTEM</Text>
              <Card style={[styles.infoCard, { backgroundColor: theme.colors.card }]}>
                <View style={styles.infoRow}>
                  <Ionicons name="desktop-outline" size={18} color={theme.colors.primary} />
                  <Text style={[styles.infoValue, { color: theme.colors.text }]}>{site.ehr_system}</Text>
                </View>
              </Card>
            </View>
          )}

          {/* Manager */}
          {site.manager && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.textTertiary }]}>SITE MANAGER</Text>
              <Card style={[styles.infoCard, { backgroundColor: theme.colors.card }]}>
                <View style={styles.managerRow}>
                  <Avatar
                    name={`${site.manager.first_name} ${site.manager.last_name}`}
                    size="md"
                    imageUrl={site.manager.avatar_url}
                  />
                  <View style={styles.managerInfo}>
                    <Text style={[styles.managerName, { color: theme.colors.text }]}>
                      {site.manager.first_name} {site.manager.last_name}
                    </Text>
                    <Text style={[styles.managerEmail, { color: theme.colors.textSecondary }]}>
                      {site.manager.email}
                    </Text>
                  </View>
                </View>
              </Card>
            </View>
          )}
        </>
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
    flex: 1,
    textAlign: 'center',
  },
  siteHeader: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  siteName: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginTop: spacing.sm,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  ratingText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  reviewCount: {
    fontSize: fontSize.sm,
  },
  section: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginLeft: 4,
  },
  infoCard: {},
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  infoValue: {
    fontSize: fontSize.sm,
    flex: 1,
  },
  descriptionText: {
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  managerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  managerInfo: {
    flex: 1,
  },
  managerName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  managerEmail: {
    fontSize: fontSize.sm,
    marginTop: 1,
  },
})
