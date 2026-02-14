import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { spacing, fontSize, fontWeight } from '../../theme'
import { Card, Badge } from '../../components/ui'
import { useCertificates } from '../../hooks/useApi'

export function CertificatesScreen() {
  const { theme } = useTheme()
  const { data, isLoading, refetch } = useCertificates()

  const certificates = data?.certificates ?? []

  const renderCert = ({ item }: { item: any }) => (
    <Card style={[styles.certCard, { backgroundColor: theme.colors.card }]}>
      <View style={styles.certHeader}>
        <View style={[styles.certIcon, { backgroundColor: theme.colors.primaryLight }]}>
          <Ionicons name="ribbon" size={24} color={theme.colors.primary} />
        </View>
        <View style={styles.certInfo}>
          <Text style={[styles.certTitle, { color: theme.colors.text }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[styles.certNumber, { color: theme.colors.textTertiary }]}>
            #{item.certificate_number}
          </Text>
        </View>
        <Badge variant={item.status === 'issued' ? 'success' : 'danger'} size="sm">
          {item.status === 'issued' ? 'Valid' : 'Revoked'}
        </Badge>
      </View>

      <View style={styles.certDetails}>
        {item.slot?.title && (
          <View style={styles.detailRow}>
            <Ionicons name="medical-outline" size={14} color={theme.colors.textSecondary} />
            <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
              {item.slot.title}
            </Text>
          </View>
        )}
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={14} color={theme.colors.textSecondary} />
          <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
            {item.total_hours} clinical hours
          </Text>
        </View>
        {item.overall_score != null && (
          <View style={styles.detailRow}>
            <Ionicons name="star-outline" size={14} color={theme.colors.textSecondary} />
            <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
              Score: {item.overall_score}/5
            </Text>
          </View>
        )}
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={14} color={theme.colors.textSecondary} />
          <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
            Issued {new Date(item.issued_date).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </Card>
  )

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Certificates</Text>
      </View>

      <FlatList
        data={certificates}
        keyExtractor={(item) => item.id}
        renderItem={renderCert}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={theme.colors.primary} />}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Ionicons name="ribbon-outline" size={48} color={theme.colors.textTertiary} />
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Certificates</Text>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                Certificates are earned upon completing rotations
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
  certCard: {
    marginBottom: spacing.md,
  },
  certHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  certIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  certInfo: {
    flex: 1,
  },
  certTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  certNumber: {
    fontSize: fontSize.xs,
  },
  certDetails: {
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: fontSize.sm,
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
