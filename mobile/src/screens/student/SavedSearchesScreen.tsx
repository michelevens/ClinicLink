import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { spacing, fontSize, fontWeight, radius } from '../../theme'
import { Card, Badge } from '../../components/ui'
import { useSavedSearches, useDeleteSavedSearch } from '../../hooks/useApi'

export function SavedSearchesScreen({ navigation }: { navigation: any }) {
  const { theme } = useTheme()
  const { data, isLoading, refetch } = useSavedSearches()
  const deleteSavedSearch = useDeleteSavedSearch()

  const searches = data ?? []

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Delete Search', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteSavedSearch.mutate(id) },
    ])
  }

  const handleRun = (item: any) => {
    navigation.navigate('Search', {
      screen: 'RotationSearch',
      params: item.filters,
    })
  }

  const renderSearch = ({ item }: { item: any }) => (
    <Card style={[styles.card, { backgroundColor: theme.colors.card }]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <Text style={[styles.searchName, { color: theme.colors.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          {item.filters?.specialty && (
            <Badge variant="primary" size="sm">{item.filters.specialty}</Badge>
          )}
        </View>
        <TouchableOpacity onPress={() => handleDelete(item.id, item.name)}>
          <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
        </TouchableOpacity>
      </View>

      <View style={styles.filtersRow}>
        {item.filters?.search && (
          <Text style={[styles.filterText, { color: theme.colors.textSecondary }]}>
            "{item.filters.search}"
          </Text>
        )}
        {item.filters?.cost_type && (
          <Badge variant="default" size="sm">{item.filters.cost_type}</Badge>
        )}
      </View>

      <TouchableOpacity
        style={[styles.runBtn, { backgroundColor: theme.colors.primaryLight }]}
        onPress={() => handleRun(item)}
      >
        <Ionicons name="search" size={16} color={theme.colors.primary} />
        <Text style={[styles.runText, { color: theme.colors.primary }]}>Run Search</Text>
      </TouchableOpacity>
    </Card>
  )

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Saved Searches</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={searches}
        keyExtractor={(item) => item.id}
        renderItem={renderSearch}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={theme.colors.primary} />}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={48} color={theme.colors.textTertiary} />
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Saved Searches</Text>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                Save your search filters to quickly find rotations later
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  cardInfo: {
    flex: 1,
    gap: spacing.xs,
    marginRight: spacing.sm,
  },
  searchName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  filterText: {
    fontSize: fontSize.sm,
  },
  runBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: 8,
    borderRadius: radius.md,
  },
  runText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
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
