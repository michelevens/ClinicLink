import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MessageSquare, Plus, Megaphone } from 'lucide-react'
import { ConversationList } from '../components/messages/ConversationList.tsx'
import { MessageThread } from '../components/messages/MessageThread.tsx'
import { NewConversationModal } from '../components/messages/NewConversationModal.tsx'
import { BroadcastModal } from '../components/messages/BroadcastModal.tsx'
import { useAuth } from '../contexts/AuthContext.tsx'
import { usePageTitle } from '../hooks/usePageTitle.ts'
import { universitiesApi } from '../services/api.ts'

export function Messages() {
  usePageTitle('Messages')
  const { id: conversationId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [showNewModal, setShowNewModal] = useState(false)
  const [showBroadcast, setShowBroadcast] = useState(false)
  const canBroadcast = user?.role === 'coordinator' || user?.role === 'admin'
  const [programs, setPrograms] = useState<{ id: string; name: string }[]>([])

  // Fetch programs for broadcast audience targeting (coordinators)
  useEffect(() => {
    if (!canBroadcast || !user?.universityId) return
    universitiesApi.programs(user.universityId).then(data => {
      setPrograms(data.map(p => ({ id: p.id, name: p.name })))
    }).catch(() => {})
  }, [canBroadcast, user?.universityId])

  return (
    <div className="h-[calc(100vh-4rem)] lg:h-[calc(100vh-0rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-stone-200 bg-white">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-primary-600" />
          <h1 className="text-xl font-bold text-stone-900">Messages</h1>
        </div>
        <div className="flex items-center gap-2">
          {canBroadcast && (
            <button
              onClick={() => setShowBroadcast(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600 transition-colors"
            >
              <Megaphone className="w-4 h-4" />
              <span className="hidden sm:inline">Broadcast</span>
            </button>
          )}
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Message</span>
          </button>
        </div>
      </div>

      {/* Two-panel layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel - conversation list */}
        <div className={`${conversationId ? 'hidden lg:flex' : 'flex'} w-full lg:w-80 flex-col border-r border-stone-200 bg-white`}>
          <ConversationList
            selectedId={conversationId || null}
            onSelect={(id) => navigate(`/messages/${id}`)}
          />
        </div>

        {/* Right panel - message thread */}
        <div className={`${conversationId ? 'flex' : 'hidden lg:flex'} flex-1 flex-col bg-stone-50`}>
          {conversationId ? (
            <MessageThread
              conversationId={conversationId}
              onBack={() => navigate('/messages')}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-stone-400">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-3 opacity-30" />
                <p className="text-lg font-medium">Select a conversation</p>
                <p className="text-sm mt-1">Choose from existing conversations or start a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showNewModal && (
        <NewConversationModal
          onClose={() => setShowNewModal(false)}
          onCreated={(id) => {
            setShowNewModal(false)
            navigate(`/messages/${id}`)
          }}
        />
      )}

      {showBroadcast && (
        <BroadcastModal
          open={showBroadcast}
          onClose={() => setShowBroadcast(false)}
          onSent={(id) => {
            setShowBroadcast(false)
            navigate(`/messages/${id}`)
          }}
          programs={programs}
        />
      )}
    </div>
  )
}
