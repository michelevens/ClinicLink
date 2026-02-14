import { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { spacing, fontSize, fontWeight, radius } from '../../theme'
import { Screen, Button, Input } from '../../components/ui'
import { useCreateHourLog, useApplications } from '../../hooks/useApi'

const CATEGORIES = [
  { value: 'direct_care', label: 'Direct Care', icon: 'heart-outline' },
  { value: 'indirect_care', label: 'Indirect Care', icon: 'clipboard-outline' },
  { value: 'simulation', label: 'Simulation', icon: 'desktop-outline' },
  { value: 'observation', label: 'Observation', icon: 'eye-outline' },
  { value: 'other', label: 'Other', icon: 'ellipsis-horizontal-outline' },
]

export function HourLogEntryScreen({ navigation }: { navigation: any }) {
  const { theme } = useTheme()
  const createLog = useCreateHourLog()
  const { data: appsData } = useApplications()

  // Only show accepted applications as slot options
  const acceptedApps = (appsData?.data ?? []).filter((a: any) => a.status === 'accepted' || a.status === 'completed')

  const [slotId, setSlotId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [hours, setHours] = useState('')
  const [category, setCategory] = useState('direct_care')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setError('')
    if (!slotId) {
      setError('Please select a rotation.')
      return
    }
    const h = parseFloat(hours)
    if (isNaN(h) || h <= 0 || h > 24) {
      setError('Please enter valid hours (0.5–24).')
      return
    }
    if (!description.trim()) {
      setError('Please describe what you did.')
      return
    }
    try {
      await createLog.mutateAsync({
        slot_id: slotId,
        date,
        hours_worked: h,
        category,
        description: description.trim(),
      })
      Alert.alert('Hours Logged', 'Your hours have been submitted for approval.')
      navigation.goBack()
    } catch (err: any) {
      setError(err.message || 'Failed to log hours.')
    }
  }

  return (
    <Screen safeArea={false} scroll={false}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.colors.text }]}>Log Hours</Text>
          </View>

          {error ? (
            <View style={[styles.errorBanner, { backgroundColor: theme.colors.dangerLight }]}>
              <Ionicons name="alert-circle" size={18} color={theme.colors.danger} />
              <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text>
            </View>
          ) : null}

          {/* Rotation Picker */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Rotation</Text>
            {acceptedApps.length === 0 ? (
              <Text style={[styles.noSlots, { color: theme.colors.textSecondary }]}>
                No active rotations. Apply and get accepted first.
              </Text>
            ) : (
              <View style={styles.slotList}>
                {acceptedApps.map((app: any) => {
                  const selected = slotId === app.slot_id
                  return (
                    <TouchableOpacity
                      key={app.id}
                      style={[
                        styles.slotChip,
                        {
                          backgroundColor: selected ? theme.colors.primaryLight : theme.colors.surfaceSecondary,
                          borderColor: selected ? theme.colors.primary : theme.colors.border,
                        },
                      ]}
                      onPress={() => setSlotId(app.slot_id)}
                    >
                      <Text style={[styles.slotChipText, { color: selected ? theme.colors.primary : theme.colors.textSecondary }]}>
                        {app.slot?.title || 'Rotation'}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            )}
          </View>

          {/* Date */}
          <Input
            label="Date"
            placeholder="YYYY-MM-DD"
            value={date}
            onChangeText={setDate}
            icon={<Ionicons name="calendar-outline" size={20} color={theme.colors.textTertiary} />}
          />

          {/* Hours */}
          <Input
            label="Hours Worked"
            placeholder="e.g. 8"
            value={hours}
            onChangeText={setHours}
            keyboardType="decimal-pad"
            icon={<Ionicons name="time-outline" size={20} color={theme.colors.textTertiary} />}
          />

          {/* Category */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Category</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => {
                const selected = category === cat.value
                return (
                  <TouchableOpacity
                    key={cat.value}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor: selected ? theme.colors.primaryLight : theme.colors.surfaceSecondary,
                        borderColor: selected ? theme.colors.primary : theme.colors.border,
                      },
                    ]}
                    onPress={() => setCategory(cat.value)}
                  >
                    <Ionicons
                      name={cat.icon as any}
                      size={16}
                      color={selected ? theme.colors.primary : theme.colors.textSecondary}
                    />
                    <Text style={[styles.categoryText, { color: selected ? theme.colors.primary : theme.colors.textSecondary }]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>

          {/* Description */}
          <Input
            label="Description"
            placeholder="Describe what you did during this shift..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            style={{ minHeight: 100 }}
          />

          {/* Submit */}
          <Button onPress={handleSubmit} loading={createLog.isPending} fullWidth size="lg">
            Submit Hours
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing['3xl'],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  backBtn: {},
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  errorText: {
    fontSize: fontSize.sm,
    flex: 1,
  },
  field: {
    gap: spacing.sm,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  noSlots: {
    fontSize: fontSize.sm,
    fontStyle: 'italic',
  },
  slotList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  slotChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1.5,
  },
  slotChipText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1.5,
  },
  categoryText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
})
