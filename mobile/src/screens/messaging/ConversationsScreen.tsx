import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { spacing, fontSize, fontWeight, radius } from '../../theme'
import { Avatar } from '../../components/ui'
import { useConversations, useMessageUnreadCount } from '../../hooks/useApi'
import { useAuth } from '../../contexts/AuthContext'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`
  return new Date(dateStr).toLocaleDateString()
}

export function ConversationsScreen({ navigation }: { navigation: any }) {
  const { theme } = useTheme()
  const { user } = useAuth()
  const { data, isLoading, refetch } = useConversations()
  const { data: unread } = useMessageUnreadCount()

  const conversations = data?.data ?? []

  const getOtherUser = (conv: any) => {
    const other = conv.users?.find((u: any) => u.id !== user?.id)
    return other || conv.users?.[0]
  }

  const renderConversation = ({ item }: { item: any }) => {
    const other = getOtherUser(item)
    const name = other ? `${other.first_name} ${other.last_name}` : item.subject || 'Conversation'
    const isUnread = item.unread_count > 0

    return (
      <TouchableOpacity
        style={[styles.convItem, { backgroundColor: isUnread ? theme.colors.primaryLight : 'transparent' }]}
        onPress={() => navigation.navigate('MessageThread', { conversationId: item.id, name })}
        activeOpacity={0.7}
      >
        <Avatar name={name} size="lg" imageUrl={other?.avatar_url} />
        <View style={styles.convContent}>
          <View style={styles.convHeader}>
            <Text
              style={[
                styles.convName,
                { color: theme.colors.text, fontWeight: isUnread ? fontWeight.bold : fontWeight.medium },
              ]}
              numberOfLines={1}
            >
              {name}
            </Text>
            <Text style={[styles.convTime, { color: theme.colors.textTertiary }]}>
              {item.latest_message ? timeAgo(item.latest_message.created_at) : ''}
            </Text>
          </View>
          <Text
            style={[
              styles.convPreview,
              { color: isUnread ? theme.colors.text : theme.colors.textSecondary },
            ]}
            numberOfLines={1}
          >
            {item.latest_message?.body || 'No messages yet'}
          </Text>
        </View>
        {isUnread && (
          <View style={[styles.unreadBadge, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.unreadText}>{item.unread_count}</Text>
          </View>
        )}
      </TouchableOpacity>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Messages</Text>
        {unread?.count ? (
          <View style={[styles.headerBadge, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.headerBadgeText}>{unread.count}</Text>
          </View>
        ) : null}
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={renderConversation}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={theme.colors.primary} />}
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: theme.colors.borderLight }]} />
        )}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Ionicons name="chatbubble-outline" size={48} color={theme.colors.textTertiary} />
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Messages</Text>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                Start a conversation to connect with others
              </Text>
            </View>
          ) : null
        }
      />

      {/* New Message FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('NewConversation')}
      >
        <Ionicons name="create-outline" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  headerBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  headerBadgeText: {
    color: '#fff',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  convItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  convContent: {
    flex: 1,
  },
  convHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  convName: {
    fontSize: fontSize.base,
    flex: 1,
  },
  convTime: {
    fontSize: fontSize.xs,
    marginLeft: spacing.sm,
  },
  convPreview: {
    fontSize: fontSize.sm,
  },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: fontWeight.bold,
  },
  separator: {
    height: 1,
    marginLeft: 78,
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
