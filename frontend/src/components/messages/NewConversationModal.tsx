import { useState } from 'react'
import { X, Search, Send, Loader2 } from 'lucide-react'
import { useSearchMessageableUsers, useCreateConversation } from '../../hooks/useApi.ts'
import { MessageTemplateSelector } from './MessageTemplateSelector.tsx'

interface Props {
  onClose: () => void
  onCreated: (conversationId: string) => void
}

const roleLabels: Record<string, string> = {
  student: 'Student',
  preceptor: 'Preceptor',
  site_manager: 'Site Manager',
  coordinator: 'Coordinator',
  professor: 'Professor',
  admin: 'Admin',
}

export function NewConversationModal({ onClose, onCreated }: Props) {
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<{ id: string; first_name: string; last_name: string; role: string } | null>(null)
  const [body, setBody] = useState('')
  const [error, setError] = useState('')

  const { data: users, isLoading: searching } = useSearchMessageableUsers(search)
  const createConversation = useCreateConversation()

  function handleSend() {
    if (!selectedUser || !body.trim()) return
    setError('')
    createConversation.mutate(
      { user_id: selectedUser.id, body: body.trim() },
      {
        onSuccess: (data) => onCreated(data.conversation.id),
        onError: (err: Error) => setError(err.message),
      }
    )
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200">
          <h2 className="text-lg font-bold text-stone-900">New Message</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {!selectedUser ? (
            <>
              {/* Search for user */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search for a person..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  autoFocus
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>

              {/* User list */}
              <div className="max-h-64 overflow-y-auto space-y-1">
                {searching && search.length >= 2 ? (
                  <div className="text-center py-4 text-stone-400 text-sm">Searching...</div>
                ) : search.length < 2 ? (
                  <div className="text-center py-4 text-stone-400 text-sm">Type at least 2 characters to search</div>
                ) : !users?.length ? (
                  <div className="text-center py-4 text-stone-400 text-sm">No users found</div>
                ) : (
                  users.map(u => (
                    <button
                      key={u.id}
                      onClick={() => setSelectedUser(u)}
                      className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-stone-50 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm">
                        {u.first_name[0]}{u.last_name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-stone-900">{u.first_name} {u.last_name}</p>
                        <p className="text-xs text-stone-500">{roleLabels[u.role] || u.role}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </>
          ) : (
            <>
              {/* Selected user */}
              <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm">
                  {selectedUser.first_name[0]}{selectedUser.last_name[0]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-stone-900">{selectedUser.first_name} {selectedUser.last_name}</p>
                  <p className="text-xs text-stone-500">{roleLabels[selectedUser.role] || selectedUser.role}</p>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  Change
                </button>
              </div>

              {/* Message input */}
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <MessageTemplateSelector onSelect={text => setBody(prev => prev ? prev + '\n' + text : text)} />
                  <span className="text-xs text-stone-400">Insert a template</span>
                </div>
                <textarea
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  placeholder="Type your message..."
                  rows={3}
                  autoFocus
                  className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none"
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                onClick={handleSend}
                disabled={!body.trim() || createConversation.isPending}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {createConversation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Send Message
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
