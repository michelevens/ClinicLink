import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { spacing, fontSize, fontWeight } from '../../theme'
import { Card, Badge } from '../../components/ui'
import { useEvaluations } from '../../hooks/useApi'

const TYPE_LABELS: Record<string, string> = {
  mid_rotation: 'Mid-Rotation',
  final: 'Final',
  student_feedback: 'Student Feedback',
}

function ScoreBar({ score, theme }: { score: number; theme: any }) {
  const pct = Math.min((score / 5) * 100, 100)
  const color = score >= 4 ? theme.colors.success : score >= 3 ? theme.colors.warning : theme.colors.danger
  return (
    <View style={styles.scoreBarContainer}>
      <View style={[styles.scoreBarBg, { backgroundColor: theme.colors.surfaceSecondary }]}>
        <View style={[styles.scoreBarFill, { backgroundColor: color, width: `${pct}%` }]} />
      </View>
      <Text style={[styles.scoreText, { color }]}>{score.toFixed(1)}/5</Text>
    </View>
  )
}

export function EvaluationsScreen({ navigation }: { navigation: any }) {
  const { theme } = useTheme()
  const { data, isLoading, refetch } = useEvaluations()

  const evaluations = data?.data ?? []

  const renderEvaluation = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('EvaluationDetail', { evaluationId: item.id })}
      activeOpacity={0.7}
    >
      <Card style={[styles.evalCard, { backgroundColor: theme.colors.card }]}>
        <View style={styles.evalHeader}>
          <Badge variant="primary" size="sm">{TYPE_LABELS[item.type] || item.type}</Badge>
          <Text style={[styles.evalDate, { color: theme.colors.textTertiary }]}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>

        <Text style={[styles.slotTitle, { color: theme.colors.text }]} numberOfLines={1}>
          {item.slot?.title || 'Rotation'}
        </Text>

        {item.preceptor && (
          <View style={styles.personRow}>
            <Ionicons name="person-outline" size={14} color={theme.colors.textSecondary} />
            <Text style={[styles.personText, { color: theme.colors.textSecondary }]}>
              {item.type === 'student_feedback' ? 'About' : 'By'}: {item.preceptor.first_name} {item.preceptor.last_name}
            </Text>
          </View>
        )}

        <ScoreBar score={item.overall_score} theme={theme} />

        {item.comments && (
          <Text style={[styles.comments, { color: theme.colors.textSecondary }]} numberOfLines={2}>
            {item.comments}
          </Text>
        )}
      </Card>
    </TouchableOpacity>
  )

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Evaluations</Text>
      </View>

      <FlatList
        data={evaluations}
        keyExtractor={(item) => item.id}
        renderItem={renderEvaluation}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={theme.colors.primary} />}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Ionicons name="star-outline" size={48} color={theme.colors.textTertiary} />
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Evaluations Yet</Text>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                Evaluations will appear here once completed
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
  evalCard: {
    marginBottom: spacing.md,
  },
  evalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  evalDate: {
    fontSize: fontSize.xs,
  },
  slotTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    marginBottom: 4,
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.sm,
  },
  personText: {
    fontSize: fontSize.sm,
  },
  scoreBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  scoreBarBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  scoreText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    minWidth: 36,
    textAlign: 'right',
  },
  comments: {
    fontSize: fontSize.sm,
    lineHeight: 18,
    fontStyle: 'italic',
    marginTop: 4,
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
