import { useState } from 'react'
import { Search, Megaphone, Users } from 'lucide-react'
import { useConversations } from '../../hooks/useApi.ts'
import { useAuth } from '../../contexts/AuthContext.tsx'
import type { ApiConversation } from '../../services/api.ts'

interface Props {
  selectedId: string | null
  onSelect: (id: string) => void
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (days === 1) return 'Yesterday'
  if (days < 7) return date.toLocaleDateString([], { weekday: 'short' })
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

const roleColors: Record<string, string> = {
  student: 'bg-blue-100 text-blue-700',
  preceptor: 'bg-green-100 text-green-700',
  site_manager: 'bg-purple-100 text-purple-700',
  coordinator: 'bg-amber-100 text-amber-700',
  professor: 'bg-teal-100 text-teal-700',
  admin: 'bg-red-100 text-red-700',
}

export function ConversationList({ selectedId, onSelect }: Props) {
  const [search, setSearch] = useState('')
  const { user } = useAuth()
  const { data, isLoading } = useConversations()

  const conversations = data?.data ?? []

  const filtered = conversations.filter(c => {
    if (!search) return true
    const otherUsers = c.users.filter(u => u.id !== user?.id)
    return otherUsers.some(u =>
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(search.toLowerCase())
    )
  })

  function getOtherUser(conv: ApiConversation) {
    return conv.users.find(u => u.id !== user?.id) || conv.users[0]
  }

  return (
    <>
      {/* Search */}
      <div className="p-3 border-b border-stone-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-stone-400 text-sm">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-4 text-center text-stone-400 text-sm">
            {search ? 'No conversations found' : 'No conversations yet'}
          </div>
        ) : (
          filtered.map(conv => {
            const other = getOtherUser(conv)
            const isSelected = conv.id === selectedId
            const hasUnread = conv.unread_count > 0
            const isBroadcast = conv.is_broadcast

            return (
              <button
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={`w-full text-left px-3 py-3 flex items-start gap-3 transition-colors border-b border-stone-50 ${
                  isSelected ? 'bg-primary-50' : hasUnread ? 'bg-stone-50 hover:bg-stone-100' : 'hover:bg-stone-50'
                }`}
              >
                {/* Avatar */}
                {isBroadcast ? (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 bg-amber-100 text-amber-700">
                    <Megaphone className="w-5 h-5" />
                  </div>
                ) : conv.is_group ? (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 bg-purple-100 text-purple-700">
                    <Users className="w-5 h-5" />
                  </div>
                ) : (
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${roleColors[other?.role || 'student']}`}>
                    {other?.first_name?.[0]}{other?.last_name?.[0]}
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`text-sm truncate ${hasUnread ? 'font-semibold text-stone-900' : 'font-medium text-stone-700'}`}>
                        {isBroadcast ? (conv.subject || 'Broadcast') : `${other?.first_name} ${other?.last_name}`}
                      </span>
                      {isBroadcast && (
                        <span className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                          Broadcast
                        </span>
                      )}
                    </div>
                    {conv.latest_message && (
                      <span className="text-xs text-stone-400 shrink-0 ml-2">
                        {formatTime(conv.latest_message.created_at)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className={`text-xs truncate flex-1 ${hasUnread ? 'text-stone-700 font-medium' : 'text-stone-500'}`}>
                      {conv.latest_message
                        ? (conv.latest_message.sender_id === user?.id ? 'You: ' : '') + conv.latest_message.body
                        : 'No messages yet'
                      }
                    </p>
                    {hasUnread && (
                      <span className="shrink-0 w-5 h-5 rounded-full bg-primary-600 text-white text-xs font-bold flex items-center justify-center">
                        {conv.unread_count > 9 ? '9+' : conv.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>
    </>
  )
}
