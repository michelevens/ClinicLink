import { useCallback } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { spacing, fontSize, fontWeight, colors } from '../../theme'
import { Card, Badge } from '../../components/ui'
import { useBookmarkedSlots, useToggleBookmark } from '../../hooks/useApi'

export function BookmarksScreen({ navigation }: { navigation: any }) {
  const { theme } = useTheme()
  const { data, isLoading, refetch } = useBookmarkedSlots()
  const toggleBookmark = useToggleBookmark()

  const slots = data?.data ?? []

  const renderSlot = useCallback(({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('SlotDetail', { slotId: item.id })}
      activeOpacity={0.7}
    >
      <Card style={[styles.slotCard, { backgroundColor: theme.colors.card }]}>
        <View style={styles.slotHeader}>
          <Text style={[styles.slotTitle, { color: theme.colors.text }]} numberOfLines={1}>
            {item.title}
          </Text>
          <TouchableOpacity onPress={() => toggleBookmark.mutate(item.id)}>
            <Ionicons name="bookmark" size={20} color={colors.primary[500]} />
          </TouchableOpacity>
        </View>
        {item.site && (
          <Text style={[styles.siteName, { color: theme.colors.textSecondary }]} numberOfLines={1}>
            {item.site.name} — {item.site.city}, {item.site.state}
          </Text>
        )}
        <View style={styles.metaRow}>
          <Badge variant="primary" size="sm">{item.specialty}</Badge>
          <Badge variant={item.cost_type === 'free' ? 'success' : 'warning'} size="sm">
            {item.cost_type === 'free' ? 'Free' : `$${item.cost}`}
          </Badge>
        </View>
      </Card>
    </TouchableOpacity>
  ), [theme, toggleBookmark])

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Bookmarks</Text>
      </View>
      <FlatList
        data={slots}
        keyExtractor={(item) => item.id}
        renderItem={renderSlot}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={theme.colors.primary} />}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Ionicons name="bookmark-outline" size={48} color={theme.colors.textTertiary} />
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Bookmarks</Text>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                Bookmark rotations to save them for later
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
  listContent: {
    padding: spacing.md,
  },
  slotCard: {
    marginBottom: spacing.md,
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  slotTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    flex: 1,
    marginRight: spacing.sm,
  },
  siteName: {
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
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
