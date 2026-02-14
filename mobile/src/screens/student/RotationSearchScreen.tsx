import { useState, useCallback } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, RefreshControl } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { spacing, fontSize, fontWeight, radius, colors } from '../../theme'
import { Card, Badge, Button } from '../../components/ui'
import { useSlots, useToggleBookmark } from '../../hooks/useApi'

const SPECIALTIES = [
  'All', 'Family Medicine', 'Pediatrics', 'Internal Medicine', 'Emergency Medicine',
  'Surgery', 'OB/GYN', 'Psychiatry', 'Cardiology', 'Orthopedics', 'Dermatology',
]

export function RotationSearchScreen({ navigation }: { navigation: any }) {
  const { theme } = useTheme()
  const [search, setSearch] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [costFilter, setCostFilter] = useState<string>('')
  const [page, setPage] = useState(1)

  const { data, isLoading, refetch } = useSlots({
    search: search || undefined,
    specialty: specialty || undefined,
    cost_type: costFilter || undefined,
    status: 'open',
    page,
  })

  const toggleBookmark = useToggleBookmark()
  const slots = data?.data ?? []

  const handleSlotPress = (slotId: string) => {
    navigation.navigate('SlotDetail', { slotId })
  }

  const handleBookmark = (slotId: string) => {
    toggleBookmark.mutate(slotId)
  }

  const renderSlot = useCallback(({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => handleSlotPress(item.id)} activeOpacity={0.7}>
      <Card style={[styles.slotCard, { backgroundColor: theme.colors.card }]}>
        <View style={styles.slotHeader}>
          <View style={styles.slotTitleRow}>
            <Text style={[styles.slotTitle, { color: theme.colors.text }]} numberOfLines={1}>
              {item.title}
            </Text>
            <TouchableOpacity onPress={() => handleBookmark(item.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons
                name={item.is_bookmarked ? 'bookmark' : 'bookmark-outline'}
                size={20}
                color={item.is_bookmarked ? colors.primary[500] : theme.colors.textTertiary}
              />
            </TouchableOpacity>
          </View>
          {item.site && (
            <View style={styles.siteRow}>
              <Ionicons name="business-outline" size={14} color={theme.colors.textSecondary} />
              <Text style={[styles.siteName, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                {item.site.name} — {item.site.city}, {item.site.state}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.slotMeta}>
          <Badge variant="primary" size="sm">{item.specialty}</Badge>
          <Badge variant={item.cost_type === 'free' ? 'success' : 'warning'} size="sm">
            {item.cost_type === 'free' ? 'Free' : `$${item.cost}`}
          </Badge>
          <Badge variant={item.filled < item.capacity ? 'default' : 'danger'} size="sm">
            {`${item.capacity - item.filled} spot${item.capacity - item.filled !== 1 ? 's' : ''} left`}
          </Badge>
        </View>

        <View style={styles.slotDates}>
          <Ionicons name="calendar-outline" size={14} color={theme.colors.textTertiary} />
          <Text style={[styles.dateText, { color: theme.colors.textTertiary }]}>
            {new Date(item.start_date).toLocaleDateString()} – {new Date(item.end_date).toLocaleDateString()}
          </Text>
        </View>

        {item.preceptor && (
          <View style={styles.preceptorRow}>
            <Ionicons name="person-outline" size={14} color={theme.colors.textSecondary} />
            <Text style={[styles.preceptorText, { color: theme.colors.textSecondary }]}>
              {item.preceptor.first_name} {item.preceptor.last_name}
            </Text>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  ), [theme, toggleBookmark])

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Search Bar */}
      <View style={[styles.searchBar, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <View style={[styles.searchInput, { backgroundColor: theme.colors.inputBackground }]}>
          <Ionicons name="search" size={18} color={theme.colors.textTertiary} />
          <TextInput
            style={[styles.searchText, { color: theme.colors.text }]}
            placeholder="Search rotations..."
            placeholderTextColor={theme.colors.textTertiary}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={theme.colors.textTertiary} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Cost Filter */}
        <View style={styles.filterRow}>
          {['', 'free', 'paid'].map((f) => (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterChip,
                {
                  backgroundColor: costFilter === f ? theme.colors.primaryLight : theme.colors.surfaceSecondary,
                  borderColor: costFilter === f ? theme.colors.primary : theme.colors.border,
                },
              ]}
              onPress={() => setCostFilter(f)}
            >
              <Text style={[styles.filterChipText, { color: costFilter === f ? theme.colors.primary : theme.colors.textSecondary }]}>
                {f === '' ? 'All' : f === 'free' ? 'Free' : 'Paid'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Specialty Chips */}
      <FlatList
        horizontal
        data={SPECIALTIES}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.specialtyList}
        renderItem={({ item }) => {
          const active = (item === 'All' && !specialty) || specialty === item
          return (
            <TouchableOpacity
              style={[
                styles.specialtyChip,
                {
                  backgroundColor: active ? theme.colors.primary : theme.colors.surfaceSecondary,
                  borderColor: active ? theme.colors.primary : theme.colors.border,
                },
              ]}
              onPress={() => setSpecialty(item === 'All' ? '' : item)}
            >
              <Text style={[styles.specialtyChipText, { color: active ? '#fff' : theme.colors.textSecondary }]}>
                {item}
              </Text>
            </TouchableOpacity>
          )
        }}
      />

      {/* Results */}
      <FlatList
        data={slots}
        keyExtractor={(item) => item.id}
        renderItem={renderSlot}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={theme.colors.primary} />}
        onEndReached={() => {
          if (data && page < data.last_page) setPage(p => p + 1)
        }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={48} color={theme.colors.textTertiary} />
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Rotations Found</Text>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                Try adjusting your filters or search terms
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
  searchBar: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.md,
  },
  searchText: {
    flex: 1,
    fontSize: fontSize.base,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  specialtyList: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  specialtyChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginRight: spacing.sm,
  },
  specialtyChipText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  listContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
  slotCard: {
    marginBottom: spacing.sm,
  },
  slotHeader: {
    marginBottom: spacing.sm,
  },
  slotTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  slotTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    flex: 1,
  },
  siteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  siteName: {
    fontSize: fontSize.sm,
    flex: 1,
  },
  slotMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  slotDates: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: fontSize.xs,
  },
  preceptorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  preceptorText: {
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
