import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Send } from 'lucide-react'
import { useConversation, useSendMessage } from '../../hooks/useApi.ts'
import { useAuth } from '../../contexts/AuthContext.tsx'
import { MessageBubble } from './MessageBubble.tsx'
import { MessageTemplateSelector } from './MessageTemplateSelector.tsx'

interface Props {
  conversationId: string
  onBack: () => void
}

export function MessageThread({ conversationId, onBack }: Props) {
  const { user } = useAuth()
  const { data, isLoading } = useConversation(conversationId)
  const sendMessage = useSendMessage()
  const [body, setBody] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [prevCount, setPrevCount] = useState(0)

  const messages = data?.messages?.data ?? []
  const conversation = data?.conversation
  const otherUser = conversation?.users?.find(u => u.id !== user?.id) || conversation?.users?.[0]

  // Auto-scroll on new messages
  useEffect(() => {
    if (messages.length > prevCount) {
      messagesEndRef.current?.scrollIntoView({ behavior: prevCount === 0 ? 'auto' : 'smooth' })
      setPrevCount(messages.length)
    }
  }, [messages.length, prevCount])

  // Reset on conversation change
  useEffect(() => {
    setPrevCount(0)
  }, [conversationId])

  function handleSend() {
    const trimmed = body.trim()
    if (!trimmed || sendMessage.isPending) return
    sendMessage.mutate(
      { conversationId, body: trimmed },
      { onSuccess: () => setBody('') }
    )
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-stone-200 bg-white">
        <button
          onClick={onBack}
          className="lg:hidden p-1.5 rounded-lg hover:bg-stone-100 text-stone-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        {otherUser && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm">
              {otherUser.first_name[0]}{otherUser.last_name[0]}
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-900">
                {otherUser.first_name} {otherUser.last_name}
              </p>
              <p className="text-xs text-stone-500 capitalize">{otherUser.role?.replace('_', ' ')}</p>
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {isLoading ? (
          <div className="text-center text-stone-400 text-sm py-8">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-stone-400 text-sm py-8">No messages yet. Say hello!</div>
        ) : (
          messages.map((msg, i) => {
            const prevMsg = messages[i - 1]
            const showDate = !prevMsg || new Date(msg.created_at).toDateString() !== new Date(prevMsg.created_at).toDateString()

            return (
              <div key={msg.id}>
                {showDate && (
                  <div className="flex items-center justify-center py-3">
                    <span className="text-xs text-stone-400 bg-stone-100 px-3 py-1 rounded-full">
                      {new Date(msg.created_at).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                )}
                <MessageBubble
                  message={msg}
                  isMine={msg.sender_id === user?.id}
                  showSender={msg.sender_id !== prevMsg?.sender_id || showDate}
                />
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Send input */}
      <div className="border-t border-stone-200 bg-white px-4 py-3">
        <div className="flex items-end gap-2">
          <MessageTemplateSelector onSelect={text => setBody(prev => prev ? prev + '\n' + text : text)} />
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 max-h-32"
            style={{ minHeight: '42px' }}
          />
          <button
            onClick={handleSend}
            disabled={!body.trim() || sendMessage.isPending}
            className="p-2.5 rounded-xl bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
