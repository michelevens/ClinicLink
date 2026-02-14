import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { spacing, fontSize, fontWeight, radius } from '../../theme'
import { Button, Input, Card } from '../../components/ui'
import { useSlot, useCreateSlot, useUpdateSlot, usePreceptors } from '../../hooks/useApi'

const SPECIALTIES = [
  'Family Medicine', 'Pediatrics', 'Internal Medicine', 'OB/GYN',
  'Psychiatry', 'Emergency Medicine', 'Surgery', 'Cardiology', 'Other',
]

export function SlotFormScreen({ route, navigation }: { route: any; navigation: any }) {
  const { theme } = useTheme()
  const { slotId } = route.params ?? {}
  const isEdit = !!slotId

  const { data: slotData } = useSlot(slotId ?? '')
  const { data: preceptorsData } = usePreceptors()
  const createSlot = useCreateSlot()
  const updateSlot = useUpdateSlot()

  const preceptors = preceptorsData?.preceptors ?? []

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [capacity, setCapacity] = useState('1')
  const [cost, setCost] = useState('0')
  const [shiftSchedule, setShiftSchedule] = useState('')
  const [selectedPreceptor, setSelectedPreceptor] = useState('')
  const [requirements, setRequirements] = useState('')

  useEffect(() => {
    if (slotData?.slot && isEdit) {
      const s = slotData.slot
      setTitle(s.title ?? '')
      setDescription(s.description ?? '')
      setSpecialty(s.specialty ?? '')
      setStartDate(s.start_date ?? '')
      setEndDate(s.end_date ?? '')
      setCapacity(String(s.capacity ?? 1))
      setCost(String(s.cost ?? 0))
      setShiftSchedule(s.shift_schedule ?? '')
      setSelectedPreceptor(s.preceptor_id ?? '')
      setRequirements((s.requirements ?? []).join('\n'))
    }
  }, [slotData, isEdit])

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Title is required')
      return
    }
    if (!specialty) {
      Alert.alert('Error', 'Select a specialty')
      return
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      specialty,
      start_date: startDate,
      end_date: endDate,
      capacity: parseInt(capacity) || 1,
      cost: parseFloat(cost) || 0,
      cost_type: (parseFloat(cost) > 0 ? 'paid' : 'free') as 'paid' | 'free',
      shift_schedule: shiftSchedule.trim(),
      preceptor_id: selectedPreceptor || undefined,
      requirements: requirements.split('\n').map(r => r.trim()).filter(Boolean),
    }

    const mutation = isEdit
      ? updateSlot.mutateAsync({ id: slotId, data: payload })
      : createSlot.mutateAsync(payload)

    mutation
      .then(() => {
        Alert.alert('Success', isEdit ? 'Slot updated' : 'Slot created', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ])
      })
      .catch(() => {
        Alert.alert('Error', 'Failed to save slot')
      })
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {isEdit ? 'Edit Slot' : 'Create Slot'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.form}>
        <Input
          label="Title"
          placeholder="e.g., Family Medicine Rotation"
          value={title}
          onChangeText={setTitle}
        />

        <Input
          label="Description"
          placeholder="Describe the rotation opportunity..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />

        {/* Specialty Chips */}
        <View style={styles.field}>
          <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>Specialty</Text>
          <View style={styles.chipRow}>
            {SPECIALTIES.map((s) => {
              const isSelected = specialty === s
              return (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected ? theme.colors.primary : theme.colors.surfaceSecondary,
                      borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                    },
                  ]}
                  onPress={() => setSpecialty(s)}
                >
                  <Text style={[styles.chipText, { color: isSelected ? '#fff' : theme.colors.text }]}>{s}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfField}>
            <Input
              label="Start Date"
              placeholder="YYYY-MM-DD"
              value={startDate}
              onChangeText={setStartDate}
            />
          </View>
          <View style={styles.halfField}>
            <Input
              label="End Date"
              placeholder="YYYY-MM-DD"
              value={endDate}
              onChangeText={setEndDate}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfField}>
            <Input
              label="Capacity"
              placeholder="1"
              value={capacity}
              onChangeText={setCapacity}
              keyboardType="number-pad"
            />
          </View>
          <View style={styles.halfField}>
            <Input
              label="Cost ($)"
              placeholder="0"
              value={cost}
              onChangeText={setCost}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <Input
          label="Shift Schedule"
          placeholder="e.g., Mon-Fri 8am-5pm"
          value={shiftSchedule}
          onChangeText={setShiftSchedule}
        />

        {/* Preceptor Selection */}
        {preceptors.length > 0 && (
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>Preceptor</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipRow}>
                <TouchableOpacity
                  style={[
                    styles.chip,
                    {
                      backgroundColor: !selectedPreceptor ? theme.colors.primary : theme.colors.surfaceSecondary,
                      borderColor: !selectedPreceptor ? theme.colors.primary : theme.colors.border,
                    },
                  ]}
                  onPress={() => setSelectedPreceptor('')}
                >
                  <Text style={[styles.chipText, { color: !selectedPreceptor ? '#fff' : theme.colors.text }]}>
                    None
                  </Text>
                </TouchableOpacity>
                {preceptors.map((p: any) => {
                  const isSelected = selectedPreceptor === p.id
                  return (
                    <TouchableOpacity
                      key={p.id}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: isSelected ? theme.colors.primary : theme.colors.surfaceSecondary,
                          borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                        },
                      ]}
                      onPress={() => setSelectedPreceptor(p.id)}
                    >
                      <Text style={[styles.chipText, { color: isSelected ? '#fff' : theme.colors.text }]}>
                        {p.first_name} {p.last_name}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            </ScrollView>
          </View>
        )}

        <Input
          label="Requirements (one per line)"
          placeholder="e.g., CPR certification&#10;Background check"
          value={requirements}
          onChangeText={setRequirements}
          multiline
          numberOfLines={3}
        />

        <Button
          onPress={handleSubmit}
          loading={createSlot.isPending || updateSlot.isPending}
          fullWidth
        >
          {isEdit ? 'Update Slot' : 'Create Slot'}
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
    gap: spacing.md,
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
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfField: {
    flex: 1,
  },
})
