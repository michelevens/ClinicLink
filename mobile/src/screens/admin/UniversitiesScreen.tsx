import { useState } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, TextInput } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { spacing, fontSize, fontWeight, radius } from '../../theme'
import { Card, Badge } from '../../components/ui'
import { useUniversities } from '../../hooks/useApi'

export function UniversitiesScreen({ navigation }: { navigation: any }) {
  const { theme } = useTheme()
  const [search, setSearch] = useState('')

  const { data, isLoading, refetch } = useUniversities({
    search: search || undefined,
  })

  const universities = data?.data ?? []

  const renderUniversity = ({ item }: { item: any }) => (
    <TouchableOpacity activeOpacity={0.7}>
      <Card style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <View style={styles.cardHeader}>
          <Ionicons name="school" size={24} color={theme.colors.primary} />
          <View style={styles.cardInfo}>
            <Text style={[styles.uniName, { color: theme.colors.text }]} numberOfLines={1}>
              {item.name}
            </Text>
            {item.address && (
              <Text style={[styles.uniAddress, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                {item.address}
              </Text>
            )}
          </View>
        </View>

        {item.programs?.length > 0 && (
          <View style={styles.programsList}>
            <Text style={[styles.programsLabel, { color: theme.colors.textTertiary }]}>
              {`${item.programs.length}`} program{item.programs.length !== 1 ? 's' : ''}
            </Text>
            <View style={styles.tagsRow}>
              {item.programs.slice(0, 4).map((p: any) => (
                <Badge key={p.id} variant="default" size="sm">
                  {p.degree_type || p.name}
                </Badge>
              ))}
              {item.programs.length > 4 && (
                <Badge variant="default" size="sm">{`+${item.programs.length - 4}`}</Badge>
              )}
            </View>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  )

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Universities</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}>
        <View style={[styles.searchInput, { backgroundColor: theme.colors.inputBackground }]}>
          <Ionicons name="search" size={16} color={theme.colors.textTertiary} />
          <TextInput
            style={[styles.searchText, { color: theme.colors.text }]}
            placeholder="Search universities..."
            placeholderTextColor={theme.colors.textTertiary}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <FlatList
        data={universities}
        keyExtractor={(item) => item.id}
        renderItem={renderUniversity}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={theme.colors.primary} />}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Ionicons name="school-outline" size={48} color={theme.colors.textTertiary} />
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Universities</Text>
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
  searchBar: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
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
  card: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  cardInfo: {
    flex: 1,
  },
  uniName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  uniAddress: {
    fontSize: fontSize.sm,
    marginTop: 1,
  },
  programsList: {
    gap: spacing.xs,
  },
  programsLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
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
