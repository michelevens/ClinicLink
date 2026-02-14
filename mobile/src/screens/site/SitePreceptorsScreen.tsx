import { useState } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { spacing, fontSize, fontWeight, radius } from '../../theme'
import { Card, Badge, Avatar, Input, Button } from '../../components/ui'
import { useSitePreceptors, useSiteInvites, useCreateInvite, useRevokeInvite } from '../../hooks/useApi'

export function SitePreceptorsScreen({ navigation }: { navigation: any }) {
  const { theme } = useTheme()
  const { data: preceptorsData, isLoading, refetch } = useSitePreceptors()
  const { data: invitesData, refetch: refetchInvites } = useSiteInvites()
  const createInvite = useCreateInvite()
  const revokeInvite = useRevokeInvite()

  const preceptors = preceptorsData?.preceptors ?? []
  const invites = invitesData?.invites ?? []

  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')

  const handleInvite = () => {
    if (!inviteEmail.trim()) return
    createInvite.mutate(
      { site_id: '', email: inviteEmail.trim() },
      {
        onSuccess: () => {
          setInviteEmail('')
          setShowInvite(false)
          refetchInvites()
          Alert.alert('Success', 'Invitation sent')
        },
        onError: () => Alert.alert('Error', 'Failed to send invitation'),
      },
    )
  }

  const handleRevoke = (id: string) => {
    Alert.alert('Revoke Invite', 'Revoke this invitation?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Revoke', style: 'destructive', onPress: () => revokeInvite.mutate(id) },
    ])
  }

  const renderPreceptor = ({ item }: { item: any }) => {
    const name = `${item.first_name} ${item.last_name}`
    return (
      <Card style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <View style={styles.row}>
          <Avatar name={name} size="md" imageUrl={item.avatar_url} />
          <View style={styles.info}>
            <Text style={[styles.name, { color: theme.colors.text }]}>{name}</Text>
            <Text style={[styles.email, { color: theme.colors.textSecondary }]}>{item.email}</Text>
          </View>
          <Badge variant="success" size="sm">Active</Badge>
        </View>
        {item.specialties?.length > 0 && (
          <View style={styles.tagsRow}>
            {item.specialties.map((s: string) => (
              <Badge key={s} variant="primary" size="sm">{s}</Badge>
            ))}
          </View>
        )}
      </Card>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Preceptors</Text>
        <TouchableOpacity onPress={() => setShowInvite(!showInvite)}>
          <Ionicons name={showInvite ? 'close' : 'person-add-outline'} size={22} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {showInvite && (
        <View style={[styles.inviteBar, { backgroundColor: theme.colors.surface }]}>
          <Input
            placeholder="Email address"
            value={inviteEmail}
            onChangeText={setInviteEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={{ flex: 1 }}
          />
          <Button onPress={handleInvite} loading={createInvite.isPending} size="sm">
            Send
          </Button>
        </View>
      )}

      {/* Pending Invites */}
      {invites.filter((i: any) => i.status === 'pending').length > 0 && (
        <View style={styles.invitesSection}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textTertiary }]}>PENDING INVITES</Text>
          {invites
            .filter((i: any) => i.status === 'pending')
            .map((invite: any) => (
              <View key={invite.id} style={[styles.inviteRow, { backgroundColor: theme.colors.card }]}>
                <Ionicons name="mail-outline" size={18} color={theme.colors.warning} />
                <Text style={[styles.inviteEmail, { color: theme.colors.text }]}>{invite.email}</Text>
                <TouchableOpacity onPress={() => handleRevoke(invite.id)}>
                  <Ionicons name="close-circle" size={20} color={theme.colors.danger} />
                </TouchableOpacity>
              </View>
            ))}
        </View>
      )}

      <FlatList
        data={preceptors}
        keyExtractor={(item) => item.id}
        renderItem={renderPreceptor}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => { refetch(); refetchInvites() }} tintColor={theme.colors.primary} />}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={48} color={theme.colors.textTertiary} />
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Preceptors</Text>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                Invite preceptors to join your clinical site
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
  inviteBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  invitesSection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  sectionLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  inviteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
  },
  inviteEmail: {
    fontSize: fontSize.sm,
    flex: 1,
  },
  listContent: {
    padding: spacing.md,
  },
  card: {
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  email: {
    fontSize: fontSize.sm,
    marginTop: 1,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
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
