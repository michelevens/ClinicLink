import { useState } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { spacing, fontSize, fontWeight, radius } from '../../theme'
import { Avatar, Card } from '../../components/ui'
import { useSearchMessageableUsers, useCreateConversation } from '../../hooks/useApi'

export function NewConversationScreen({ navigation }: { navigation: any }) {
  const { theme } = useTheme()
  const [search, setSearch] = useState('')
  const { data: usersData, isLoading } = useSearchMessageableUsers(search)
  const createConversation = useCreateConversation()

  const users = usersData ?? []

  const handleSelect = (userId: string, name: string) => {
    createConversation.mutate(
      { user_id: userId, body: 'Hello!' },
      {
        onSuccess: (data: any) => {
          const conversationId = data?.conversation?.id
          if (conversationId) {
            navigation.replace('MessageThread', { conversationId, name })
          } else {
            navigation.goBack()
          }
        },
      },
    )
  }

  const renderUser = ({ item }: { item: any }) => {
    const name = `${item.first_name} ${item.last_name}`
    return (
      <TouchableOpacity
        style={[styles.userRow, { borderBottomColor: theme.colors.borderLight }]}
        onPress={() => handleSelect(item.id, name)}
        activeOpacity={0.7}
      >
        <Avatar name={name} size="md" imageUrl={item.avatar_url} />
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: theme.colors.text }]}>{name}</Text>
          <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>{item.email}</Text>
        </View>
        <Text style={[styles.userRole, { color: theme.colors.textTertiary }]}>
          {(item.role || '').replace('_', ' ')}
        </Text>
      </TouchableOpacity>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>New Message</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}>
        <View style={[styles.searchInput, { backgroundColor: theme.colors.inputBackground }]}>
          <Ionicons name="search" size={16} color={theme.colors.textTertiary} />
          <TextInput
            style={[styles.searchText, { color: theme.colors.text }]}
            placeholder="Search by name or email..."
            placeholderTextColor={theme.colors.textTertiary}
            value={search}
            onChangeText={setSearch}
            autoFocus
          />
        </View>
      </View>

      {search.length < 2 ? (
        <View style={styles.hint}>
          <Ionicons name="search-outline" size={32} color={theme.colors.textTertiary} />
          <Text style={[styles.hintText, { color: theme.colors.textSecondary }]}>
            Type at least 2 characters to search
          </Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={renderUser}
          ListEmptyComponent={
            !isLoading ? (
              <View style={styles.hint}>
                <Text style={[styles.hintText, { color: theme.colors.textSecondary }]}>
                  No users found
                </Text>
              </View>
            ) : null
          }
        />
      )}
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
  searchBar: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.md,
  },
  searchText: {
    flex: 1,
    fontSize: fontSize.base,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  userEmail: {
    fontSize: fontSize.sm,
    marginTop: 1,
  },
  userRole: {
    fontSize: fontSize.xs,
    textTransform: 'capitalize',
  },
  hint: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
    gap: spacing.sm,
  },
  hintText: {
    fontSize: fontSize.base,
    textAlign: 'center',
  },
})
