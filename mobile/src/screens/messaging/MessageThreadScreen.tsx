import { useState, useRef, useEffect } from 'react'
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { spacing, fontSize, fontWeight, radius } from '../../theme'
import { useConversation, useSendMessage } from '../../hooks/useApi'
import { useAuth } from '../../contexts/AuthContext'

export function MessageThreadScreen({ route, navigation }: { route: any; navigation: any }) {
  const { conversationId, name } = route.params
  const { theme } = useTheme()
  const { user } = useAuth()
  const { data, isLoading } = useConversation(conversationId)
  const sendMessage = useSendMessage()
  const [text, setText] = useState('')
  const listRef = useRef<FlatList>(null)

  const messages = data?.messages?.data ?? []
  const reversed = [...messages].reverse()

  useEffect(() => {
    navigation.setOptions?.({ title: name })
  }, [name])

  const handleSend = async () => {
    if (!text.trim()) return
    const body = text.trim()
    setText('')
    try {
      await sendMessage.mutateAsync({ conversationId, body })
    } catch {
      setText(body)
    }
  }

  const renderMessage = ({ item }: { item: any }) => {
    const isMine = item.sender_id === user?.id
    return (
      <View style={[styles.msgRow, isMine ? styles.msgRowRight : styles.msgRowLeft]}>
        <View
          style={[
            styles.bubble,
            isMine
              ? [styles.bubbleMine, { backgroundColor: theme.colors.primary }]
              : [styles.bubbleTheirs, { backgroundColor: theme.colors.surfaceSecondary }],
          ]}
        >
          {!isMine && item.sender && (
            <Text style={[styles.senderName, { color: theme.colors.primary }]}>
              {item.sender.first_name}
            </Text>
          )}
          <Text style={[styles.msgText, { color: isMine ? '#fff' : theme.colors.text }]}>
            {item.body}
          </Text>
          <Text style={[styles.msgTime, { color: isMine ? 'rgba(255,255,255,0.7)' : theme.colors.textTertiary }]}>
            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]} numberOfLines={1}>
          {name}
        </Text>
      </View>

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={reversed}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        inverted
        contentContainerStyle={styles.messageList}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.colors.textTertiary }]}>
                No messages yet. Say hello!
              </Text>
            </View>
          ) : null
        }
      />

      {/* Input */}
      <View style={[styles.inputBar, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
        <TextInput
          style={[styles.input, { backgroundColor: theme.colors.inputBackground, color: theme.colors.text }]}
          placeholder="Type a message..."
          placeholderTextColor={theme.colors.textTertiary}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={2000}
        />
        <TouchableOpacity
          style={[styles.sendBtn, { backgroundColor: text.trim() ? theme.colors.primary : theme.colors.surfaceSecondary }]}
          onPress={handleSend}
          disabled={!text.trim()}
        >
          <Ionicons name="send" size={18} color={text.trim() ? '#fff' : theme.colors.textTertiary} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    flex: 1,
  },
  messageList: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  msgRow: {
    marginBottom: spacing.xs,
  },
  msgRowRight: {
    alignItems: 'flex-end',
  },
  msgRowLeft: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
  },
  bubbleMine: {
    borderBottomRightRadius: 4,
  },
  bubbleTheirs: {
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    marginBottom: 2,
  },
  msgText: {
    fontSize: fontSize.base,
    lineHeight: 20,
  },
  msgTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
    transform: [{ scaleY: -1 }],
  },
  emptyText: {
    fontSize: fontSize.sm,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.lg,
    fontSize: fontSize.base,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
