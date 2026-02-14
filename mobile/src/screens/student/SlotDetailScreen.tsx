import { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { spacing, fontSize, fontWeight, radius, colors } from '../../theme'
import { Screen, Card, Badge, Button } from '../../components/ui'
import { useSlot, useCreateApplication, useToggleBookmark } from '../../hooks/useApi'

export function SlotDetailScreen({ route, navigation }: { route: any; navigation: any }) {
  const { slotId } = route.params
  const { theme } = useTheme()
  const { data, isLoading } = useSlot(slotId)
  const createApp = useCreateApplication()
  const toggleBookmark = useToggleBookmark()
  const [coverLetter, setCoverLetter] = useState('')
  const [showApply, setShowApply] = useState(false)

  const slot = data?.slot

  const handleApply = async () => {
    try {
      await createApp.mutateAsync({ slot_id: slotId, cover_letter: coverLetter || undefined })
      Alert.alert('Application Submitted', 'Your application has been submitted successfully.')
      setShowApply(false)
      navigation.goBack()
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit application.')
    }
  }

  if (isLoading || !slot) {
    return (
      <Screen>
        <View style={styles.loadingContainer}>
          <Text style={{ color: theme.colors.textSecondary }}>Loading...</Text>
        </View>
      </Screen>
    )
  }

  const spotsLeft = slot.capacity - slot.filled

  return (
    <Screen scroll>
      <View style={styles.content}>
        {/* Back Button */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{slot.title}</Text>
          <View style={styles.metaRow}>
            <Badge variant="primary">{slot.specialty}</Badge>
            <Badge variant={slot.cost_type === 'free' ? 'success' : 'warning'}>
              {slot.cost_type === 'free' ? 'Free' : `$${slot.cost}`}
            </Badge>
            <Badge variant={spotsLeft > 0 ? 'default' : 'danger'}>
              {spotsLeft > 0 ? `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left` : 'Full'}
            </Badge>
          </View>
        </View>

        {/* Site Info */}
        {slot.site && (
          <Card style={[styles.infoCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="business" size={20} color={theme.colors.primary} />
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Clinical Site</Text>
            </View>
            <Text style={[styles.infoText, { color: theme.colors.text }]}>{slot.site.name}</Text>
            <Text style={[styles.infoSubtext, { color: theme.colors.textSecondary }]}>
              {slot.site.address}, {slot.site.city}, {slot.site.state} {slot.site.zip}
            </Text>
            {slot.site.phone && (
              <View style={styles.infoRow}>
                <Ionicons name="call-outline" size={14} color={theme.colors.textSecondary} />
                <Text style={[styles.infoSubtext, { color: theme.colors.textSecondary }]}>{slot.site.phone}</Text>
              </View>
            )}
            {slot.site.ehr_system && (
              <View style={styles.infoRow}>
                <Ionicons name="desktop-outline" size={14} color={theme.colors.textSecondary} />
                <Text style={[styles.infoSubtext, { color: theme.colors.textSecondary }]}>EHR: {slot.site.ehr_system}</Text>
              </View>
            )}
          </Card>
        )}

        {/* Dates & Schedule */}
        <Card style={[styles.infoCard, { backgroundColor: theme.colors.card }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="calendar" size={20} color={theme.colors.primary} />
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Schedule</Text>
          </View>
          <Text style={[styles.infoText, { color: theme.colors.text }]}>
            {new Date(slot.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} – {new Date(slot.end_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </Text>
          {slot.shift_schedule && (
            <Text style={[styles.infoSubtext, { color: theme.colors.textSecondary }]}>
              Shift: {slot.shift_schedule}
            </Text>
          )}
        </Card>

        {/* Preceptor */}
        {slot.preceptor && (
          <Card style={[styles.infoCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="person" size={20} color={theme.colors.primary} />
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Preceptor</Text>
            </View>
            <Text style={[styles.infoText, { color: theme.colors.text }]}>
              {slot.preceptor.first_name} {slot.preceptor.last_name}
            </Text>
          </Card>
        )}

        {/* Description */}
        <Card style={[styles.infoCard, { backgroundColor: theme.colors.card }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text" size={20} color={theme.colors.primary} />
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Description</Text>
          </View>
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            {slot.description}
          </Text>
        </Card>

        {/* Requirements */}
        {slot.requirements?.length > 0 && (
          <Card style={[styles.infoCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Requirements</Text>
            </View>
            {slot.requirements.map((req: string, i: number) => (
              <View key={i} style={styles.reqRow}>
                <Ionicons name="chevron-forward" size={14} color={theme.colors.textTertiary} />
                <Text style={[styles.reqText, { color: theme.colors.textSecondary }]}>{req}</Text>
              </View>
            ))}
          </Card>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            onPress={() => toggleBookmark.mutate(slot.id)}
            variant="outline"
            fullWidth
            icon={<Ionicons name="bookmark-outline" size={18} color={theme.colors.primary} />}
          >
            Bookmark
          </Button>
          {spotsLeft > 0 && slot.status === 'open' && (
            <Button onPress={handleApply} loading={createApp.isPending} fullWidth size="lg">
              Apply Now
            </Button>
          )}
        </View>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtn: {
    marginBottom: spacing.md,
  },
  titleSection: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    marginBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  infoCard: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  infoText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
  },
  infoSubtext: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  description: {
    fontSize: fontSize.base,
    lineHeight: 22,
  },
  reqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  reqText: {
    fontSize: fontSize.sm,
    flex: 1,
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing['2xl'],
  },
})
