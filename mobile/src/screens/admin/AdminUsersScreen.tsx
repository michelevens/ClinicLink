import { useState } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, TextInput } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { spacing, fontSize, fontWeight, radius } from '../../theme'
import { Card, Badge, Avatar } from '../../components/ui'
import { useAdminUsers } from '../../hooks/useApi'

const ROLE_COLORS: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger' | 'default'> = {
  student: 'primary',
  preceptor: 'success',
  site_manager: 'warning',
  coordinator: 'info',
  professor: 'default',
  admin: 'danger',
}

export function AdminUsersScreen({ navigation }: { navigation: any }) {
  const { theme } = useTheme()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading, refetch } = useAdminUsers({
    search: search || undefined,
    role: roleFilter || undefined,
    page,
  })

  const users = data?.data ?? []

  const renderUser = ({ item }: { item: any }) => {
    const name = `${item.first_name} ${item.last_name}`
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('UserDetail', { userId: item.id })}
        activeOpacity={0.7}
      >
        <Card style={[styles.userCard, { backgroundColor: theme.colors.card }]}>
          <View style={styles.userRow}>
            <Avatar name={name} size="md" imageUrl={item.avatar_url} />
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: theme.colors.text }]}>{name}</Text>
              <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>{item.email}</Text>
            </View>
            <View style={styles.userMeta}>
              <Badge variant={ROLE_COLORS[item.role] || 'default'} size="sm">
                {item.role.replace('_', ' ')}
              </Badge>
              {!item.is_active && <Badge variant="danger" size="sm">Inactive</Badge>}
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Users</Text>
        <View style={[styles.searchInput, { backgroundColor: theme.colors.inputBackground }]}>
          <Ionicons name="search" size={16} color={theme.colors.textTertiary} />
          <TextInput
            style={[styles.searchText, { color: theme.colors.text }]}
            placeholder="Search users..."
            placeholderTextColor={theme.colors.textTertiary}
            value={search}
            onChangeText={(t) => { setSearch(t); setPage(1) }}
          />
        </View>
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={renderUser}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={theme.colors.primary} />}
        onEndReached={() => {
          if (data && page < data.last_page) setPage(p => p + 1)
        }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Ionicons name="person-outline" size={48} color={theme.colors.textTertiary} />
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Users Found</Text>
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
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
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
    fontSize: fontSize.sm,
  },
  listContent: {
    padding: spacing.md,
  },
  userCard: {
    marginBottom: spacing.sm,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
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
  },
  userMeta: {
    alignItems: 'flex-end',
    gap: 4,
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
})
