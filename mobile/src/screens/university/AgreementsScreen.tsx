import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { spacing, fontSize, fontWeight } from '../../theme'
import { Card, Badge } from '../../components/ui'
import { useAgreements } from '../../hooks/useApi'

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'danger' | 'default' | 'info' | 'primary'> = {
  active: 'success',
  pending: 'warning',
  expired: 'danger',
  draft: 'default',
  pending_signatures: 'info',
}

export function AgreementsScreen({ navigation }: { navigation: any }) {
  const { theme } = useTheme()
  const { data, isLoading, refetch } = useAgreements()

  const agreements = data?.agreements ?? []

  const renderAgreement = ({ item }: { item: any }) => (
    <Card style={[styles.card, { backgroundColor: theme.colors.card }]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
            {item.title || 'Agreement'}
          </Text>
          <Text style={[styles.parties, { color: theme.colors.textSecondary }]}>
            {item.university_name || 'University'} ↔ {item.site_name || 'Site'}
          </Text>
        </View>
        <Badge variant={STATUS_VARIANT[item.status] || 'default'} size="sm">
          {(item.status || 'draft').replace('_', ' ')}
        </Badge>
      </View>

      <View style={styles.metaRow}>
        {item.start_date && (
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={14} color={theme.colors.textTertiary} />
            <Text style={[styles.metaText, { color: theme.colors.textTertiary }]}>
              {new Date(item.start_date).toLocaleDateString()}
              {item.end_date ? ` – ${new Date(item.end_date).toLocaleDateString()}` : ''}
            </Text>
          </View>
        )}
      </View>

      {item.signatures_required > 0 && (
        <View style={styles.sigRow}>
          <Ionicons name="create-outline" size={14} color={theme.colors.primary} />
          <Text style={[styles.sigText, { color: theme.colors.primary }]}>
            {`${item.signatures_completed ?? 0}/${item.signatures_required}`} signatures
          </Text>
        </View>
      )}
    </Card>
  )

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Agreements</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={agreements}
        keyExtractor={(item) => item.id}
        renderItem={renderAgreement}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={theme.colors.primary} />}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Ionicons name="documents-outline" size={48} color={theme.colors.textTertiary} />
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Agreements</Text>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                Clinical affiliation agreements will appear here
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
    marginRight: spacing.sm,
  },
  title: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  parties: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  metaRow: {
    marginBottom: spacing.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: fontSize.xs,
  },
  sigRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
  },
  sigText: {
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
})
