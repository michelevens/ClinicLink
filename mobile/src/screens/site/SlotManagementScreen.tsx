import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { spacing, fontSize, fontWeight, radius } from '../../theme'
import { Card, Badge } from '../../components/ui'
import { useSlots, useDeleteSlot } from '../../hooks/useApi'

export function SlotManagementScreen({ navigation }: { navigation: any }) {
  const { theme } = useTheme()
  const { data, isLoading, refetch } = useSlots()
  const deleteSlot = useDeleteSlot()

  const slots = data?.data ?? []

  const handleDelete = (id: string, title: string) => {
    Alert.alert('Delete Slot', `Delete "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteSlot.mutate(id) },
    ])
  }

  const renderSlot = ({ item }: { item: any }) => (
    <Card style={[styles.slotCard, { backgroundColor: theme.colors.card }]}>
      <View style={styles.slotHeader}>
        <Text style={[styles.slotTitle, { color: theme.colors.text }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Badge
          variant={item.status === 'open' ? 'success' : item.status === 'filled' ? 'warning' : 'default'}
          size="sm"
        >
          {item.status}
        </Badge>
      </View>

      <View style={styles.slotMeta}>
        <Badge variant="primary" size="sm">{item.specialty}</Badge>
        <Text style={[styles.capacityText, { color: theme.colors.textSecondary }]}>
          {item.filled}/{item.capacity} filled
        </Text>
      </View>

      <View style={styles.dateRow}>
        <Ionicons name="calendar-outline" size={14} color={theme.colors.textTertiary} />
        <Text style={[styles.dateText, { color: theme.colors.textTertiary }]}>
          {new Date(item.start_date).toLocaleDateString()} – {new Date(item.end_date).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.colors.primaryLight }]}
          onPress={() => navigation.navigate('SlotEdit', { slotId: item.id })}
        >
          <Ionicons name="create-outline" size={16} color={theme.colors.primary} />
          <Text style={[styles.actionText, { color: theme.colors.primary }]}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.colors.dangerLight }]}
          onPress={() => handleDelete(item.id, item.title)}
        >
          <Ionicons name="trash-outline" size={16} color={theme.colors.danger} />
          <Text style={[styles.actionText, { color: theme.colors.danger }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </Card>
  )

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Slot Management</Text>
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
              <Ionicons name="calendar-outline" size={48} color={theme.colors.textTertiary} />
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Slots</Text>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                Create rotation slots for students to apply
              </Text>
            </View>
          ) : null
        }
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('SlotCreate')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
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
    paddingBottom: 80,
  },
  slotCard: {
    marginBottom: spacing.md,
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  slotTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    flex: 1,
    marginRight: spacing.sm,
  },
  slotMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  capacityText: {
    fontSize: fontSize.sm,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.md,
  },
  dateText: {
    fontSize: fontSize.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.md,
  },
  actionText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
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
