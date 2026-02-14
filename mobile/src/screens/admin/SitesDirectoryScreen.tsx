import { useState } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, TextInput } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { spacing, fontSize, fontWeight, radius } from '../../theme'
import { Card, Badge } from '../../components/ui'
import { useSites } from '../../hooks/useApi'

export function SitesDirectoryScreen({ navigation }: { navigation: any }) {
  const { theme } = useTheme()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading, refetch } = useSites({ search: search || undefined, page })
  const sites = data?.data ?? []

  const renderSite = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('SiteDetail', { siteId: item.id })}
      activeOpacity={0.7}
    >
      <Card style={[styles.siteCard, { backgroundColor: theme.colors.card }]}>
        <View style={styles.siteHeader}>
          <View style={[styles.siteIcon, { backgroundColor: theme.colors.primaryLight }]}>
            <Ionicons name="business" size={20} color={theme.colors.primary} />
          </View>
          <View style={styles.siteInfo}>
            <Text style={[styles.siteName, { color: theme.colors.text }]} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={[styles.siteLocation, { color: theme.colors.textSecondary }]}>
              {item.city}, {item.state}
            </Text>
          </View>
          {item.is_verified && (
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
          )}
        </View>
        <View style={styles.specialtyRow}>
          {(item.specialties ?? []).slice(0, 3).map((s: string) => (
            <Badge key={s} variant="default" size="sm">{s}</Badge>
          ))}
          {(item.specialties?.length ?? 0) > 3 && (
            <Text style={[styles.moreText, { color: theme.colors.textTertiary }]}>
              +{item.specialties.length - 3}
            </Text>
          )}
        </View>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Ionicons name="star" size={12} color="#f59e0b" />
            <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>{item.rating?.toFixed(1) ?? '—'}</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="chatbubble" size={12} color={theme.colors.textTertiary} />
            <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>{item.review_count ?? 0} reviews</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  )

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Clinical Sites</Text>
        <View style={[styles.searchInput, { backgroundColor: theme.colors.inputBackground }]}>
          <Ionicons name="search" size={16} color={theme.colors.textTertiary} />
          <TextInput
            style={[styles.searchText, { color: theme.colors.text }]}
            placeholder="Search sites..."
            placeholderTextColor={theme.colors.textTertiary}
            value={search}
            onChangeText={(t) => { setSearch(t); setPage(1) }}
          />
        </View>
      </View>

      <FlatList
        data={sites}
        keyExtractor={(item) => item.id}
        renderItem={renderSite}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={theme.colors.primary} />}
        onEndReached={() => {
          if (data && page < data.last_page) setPage(p => p + 1)
        }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Ionicons name="business-outline" size={48} color={theme.colors.textTertiary} />
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Sites Found</Text>
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
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.md,
  },
  searchText: {
    flex: 1,
    fontSize: fontSize.sm,
  },
  listContent: {
    padding: spacing.md,
  },
  siteCard: {
    marginBottom: spacing.md,
  },
  siteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  siteIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  siteInfo: {
    flex: 1,
  },
  siteName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  siteLocation: {
    fontSize: fontSize.sm,
  },
  specialtyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  moreText: {
    fontSize: fontSize.xs,
    alignSelf: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
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
})
