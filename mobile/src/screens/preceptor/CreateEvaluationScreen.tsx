import { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { spacing, fontSize, fontWeight, radius } from '../../theme'
import { Card, Button, Input } from '../../components/ui'
import { useMyStudents, useCreateEvaluation } from '../../hooks/useApi'

const EVAL_TYPES: { value: 'mid_rotation' | 'final' | 'student_feedback'; label: string }[] = [
  { value: 'mid_rotation', label: 'Mid-Rotation' },
  { value: 'final', label: 'Final' },
  { value: 'student_feedback', label: 'Student Feedback' },
]

const RATING_CATEGORIES = [
  'Clinical Knowledge',
  'Professionalism',
  'Communication',
  'Critical Thinking',
  'Patient Care',
]

export function CreateEvaluationScreen({ route, navigation }: { route: any; navigation: any }) {
  const { theme } = useTheme()
  const { studentId: preselectedStudentId } = route.params ?? {}
  const { data: studentsData } = useMyStudents()
  const createEvaluation = useCreateEvaluation()

  const students = studentsData?.students ?? []

  const [selectedStudent, setSelectedStudent] = useState(preselectedStudentId || '')
  const [evalType, setEvalType] = useState<'mid_rotation' | 'final' | 'student_feedback'>('mid_rotation')
  const [ratings, setRatings] = useState<Record<string, number>>({})
  const [comments, setComments] = useState('')

  const setRating = (category: string, score: number) => {
    setRatings(prev => ({ ...prev, [category]: score }))
  }

  const overallScore = RATING_CATEGORIES.length > 0
    ? Object.values(ratings).reduce((sum, v) => sum + v, 0) / Math.max(Object.values(ratings).length, 1)
    : 0

  const handleSubmit = () => {
    if (!selectedStudent) {
      Alert.alert('Error', 'Please select a student')
      return
    }
    if (Object.keys(ratings).length < RATING_CATEGORIES.length) {
      Alert.alert('Error', 'Please rate all categories')
      return
    }

    createEvaluation.mutate(
      {
        student_id: selectedStudent,
        type: evalType,
        ratings,
        comments,
        overall_score: Math.round(overallScore * 10) / 10,
      },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Evaluation submitted', [
            { text: 'OK', onPress: () => navigation.goBack() },
          ])
        },
        onError: () => {
          Alert.alert('Error', 'Failed to submit evaluation')
        },
      },
    )
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Create Evaluation</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.form}>
        {/* Student Selection */}
        <View style={styles.field}>
          <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>Student</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipRow}>
              {students.map((s: any) => {
                const name = `${s.first_name} ${s.last_name}`
                const isSelected = selectedStudent === s.id
                return (
                  <TouchableOpacity
                    key={s.id}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected ? theme.colors.primary : theme.colors.surfaceSecondary,
                        borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                      },
                    ]}
                    onPress={() => setSelectedStudent(s.id)}
                  >
                    <Text style={[styles.chipText, { color: isSelected ? '#fff' : theme.colors.text }]}>
                      {name}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </ScrollView>
        </View>

        {/* Type */}
        <View style={styles.field}>
          <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>Evaluation Type</Text>
          <View style={styles.chipRow}>
            {EVAL_TYPES.map((t) => {
              const isSelected = evalType === t.value
              return (
                <TouchableOpacity
                  key={t.value}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected ? theme.colors.primary : theme.colors.surfaceSecondary,
                      borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                    },
                  ]}
                  onPress={() => setEvalType(t.value)}
                >
                  <Text style={[styles.chipText, { color: isSelected ? '#fff' : theme.colors.text }]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        {/* Ratings */}
        <View style={styles.field}>
          <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>Ratings</Text>
          {RATING_CATEGORIES.map((category) => (
            <Card key={category} style={[styles.ratingCard, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.ratingLabel, { color: theme.colors.text }]}>{category}</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setRating(category, star)}>
                    <Ionicons
                      name={(ratings[category] ?? 0) >= star ? 'star' : 'star-outline'}
                      size={28}
                      color={(ratings[category] ?? 0) >= star ? theme.colors.warning : theme.colors.textTertiary}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
          ))}
        </View>

        {/* Overall Score */}
        {Object.keys(ratings).length > 0 && (
          <Card style={[styles.overallCard, { backgroundColor: theme.colors.primaryLight }]}>
            <Text style={[styles.overallLabel, { color: theme.colors.primary }]}>Overall Score</Text>
            <Text style={[styles.overallScore, { color: theme.colors.primary }]}>
              {overallScore.toFixed(1)} / 5.0
            </Text>
          </Card>
        )}

        {/* Comments */}
        <Input
          label="Comments"
          placeholder="Write evaluation comments..."
          value={comments}
          onChangeText={setComments}
          multiline
          numberOfLines={4}
          style={{ minHeight: 100 }}
        />

        <Button
          onPress={handleSubmit}
          loading={createEvaluation.isPending}
          fullWidth
        >
          Submit Evaluation
        </Button>

        <View style={{ height: spacing['3xl'] }} />
      </View>
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
  },
  form: {
    padding: spacing.md,
    gap: spacing.lg,
  },
  field: {
    gap: spacing.sm,
  },
  fieldLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginLeft: 2,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  chipText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  ratingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  ratingLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    flex: 1,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  overallCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
  },
  overallLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  overallScore: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
})
