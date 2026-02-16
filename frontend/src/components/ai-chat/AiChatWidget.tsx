import { useState, useRef, useEffect, useCallback, type KeyboardEvent, type MouseEvent } from 'react'
import { useLocation } from 'react-router-dom'
import { MessageCircle, X, Send, ArrowLeft, Trash2, Plus, Clock, Bot, Loader2 } from 'lucide-react'
import { useAiConversations, useAiMessages, useAiSendMessage, useAiDeleteConversation, useAiSuggestions } from '../../hooks/useApi.ts'
import type { AiChatConversation, AiChatMessage } from '../../services/api.ts'
import { useAuth } from '../../contexts/AuthContext.tsx'

type View = 'chat' | 'history'

export function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [view, setView] = useState<View>('chat')
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [localMessages, setLocalMessages] = useState<AiChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isWaiting, setIsWaiting] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const location = useLocation()
  const { user } = useAuth()

  const { data: conversationsData } = useAiConversations()
  const { data: messagesData } = useAiMessages(conversationId)
  const { data: suggestionsData } = useAiSuggestions(location.pathname)
  const sendMessage = useAiSendMessage()
  const deleteConversation = useAiDeleteConversation()

  const conversations = conversationsData?.conversations ?? []
  const suggestions = suggestionsData?.suggestions ?? []

  // Sync server messages to local state
  useEffect(() => {
    if (messagesData?.messages) {
      setLocalMessages(messagesData.messages)
    }
  }, [messagesData])

  // Clear local messages when starting new conversation
  useEffect(() => {
    if (!conversationId) {
      setLocalMessages([])
    }
  }, [conversationId])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [localMessages, isWaiting])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && view === 'chat') {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen, view])

  const handleSend = useCallback(async (text?: string) => {
    const messageText = text || input.trim()
    if (!messageText || isWaiting) return

    setInput('')

    // Optimistic add user message
    const tempUserMsg: AiChatMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: messageText,
      created_at: new Date().toISOString(),
    }
    setLocalMessages(prev => [...prev, tempUserMsg])
    setIsWaiting(true)

    try {
      const result = await sendMessage.mutateAsync({
        message: messageText,
        conversation_id: conversationId ?? undefined,
        current_page: location.pathname,
      })

      // Set conversation ID if new
      if (!conversationId) {
        setConversationId(result.conversation_id)
      }

      // Add assistant response
      setLocalMessages(prev => [...prev, result.message])
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setLocalMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: `Sorry, ${errorMessage}`,
          created_at: new Date().toISOString(),
        },
      ])
    } finally {
      setIsWaiting(false)
    }
  }, [input, isWaiting, conversationId, location.pathname, sendMessage])

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleNewChat = () => {
    setConversationId(null)
    setLocalMessages([])
    setView('chat')
  }

  const handleSelectConversation = (conv: AiChatConversation) => {
    setConversationId(conv.id)
    setView('chat')
  }

  const handleDeleteConversation = async (id: string, e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    await deleteConversation.mutateAsync(id)
    if (conversationId === id) {
      setConversationId(null)
      setLocalMessages([])
    }
  }

  const roleBadge = user?.role ? user.role.replace('_', ' ') : ''

  if (!user) return null

  return (
    <>
      {/* FAB Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center group"
          aria-label="Open AI Assistant"
        >
          <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-40 w-[400px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-4rem)] bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-stone-200/60 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-4 py-3 flex items-center gap-3 shrink-0">
            {view === 'history' && (
              <button onClick={() => setView('chat')} className="text-white/80 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-white font-semibold text-sm leading-tight truncate">
                  {view === 'history' ? 'Chat History' : 'ClinicLink Assistant'}
                </h3>
                {view === 'chat' && roleBadge && (
                  <span className="text-white/70 text-xs capitalize">{roleBadge}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {view === 'chat' && (
                <>
                  <button
                    onClick={handleNewChat}
                    className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                    title="New chat"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setView('history')}
                    className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                    title="Chat history"
                  >
                    <Clock className="w-4 h-4" />
                  </button>
                </>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {view === 'history' ? (
            /* History View */
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-stone-400 px-6">
                  <Clock className="w-10 h-10 mb-3 opacity-50" />
                  <p className="text-sm font-medium">No conversations yet</p>
                  <p className="text-xs mt-1">Start chatting to see your history</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {conversations.map(conv => (
                    <button
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv)}
                      className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-stone-100 transition-colors group flex items-start gap-3"
                    >
                      <MessageCircle className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-700 truncate">{conv.title || 'New conversation'}</p>
                        <p className="text-xs text-stone-400 mt-0.5">
                          {conv.message_count} messages &middot; {conv.last_message_at ? new Date(conv.last_message_at).toLocaleDateString() : ''}
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleDeleteConversation(conv.id, e)}
                        className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-red-500 p-1 transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Chat View */
            <>
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {/* Empty state with suggestions */}
                {localMessages.length === 0 && !isWaiting && (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mb-3">
                      <Bot className="w-6 h-6 text-primary-600" />
                    </div>
                    <p className="text-sm font-medium text-stone-700 mb-1">How can I help you?</p>
                    <p className="text-xs text-stone-400 mb-4 text-center">Ask me anything about ClinicLink</p>
                    {suggestions.length > 0 && (
                      <div className="w-full space-y-2">
                        {suggestions.map((s, i) => (
                          <button
                            key={i}
                            onClick={() => handleSend(s)}
                            className="w-full text-left px-3 py-2 rounded-xl bg-stone-50 hover:bg-primary-50 border border-stone-200 hover:border-primary-200 text-sm text-stone-600 hover:text-primary-700 transition-all"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Messages */}
                {localMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-primary-500 text-white rounded-br-md'
                          : 'bg-stone-100 text-stone-700 rounded-bl-md'
                      }`}
                    >
                      <MarkdownContent content={msg.content} isUser={msg.role === 'user'} />
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isWaiting && (
                  <div className="flex justify-start">
                    <div className="bg-stone-100 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
                      <Loader2 className="w-4 h-4 text-stone-400 animate-spin" />
                      <span className="text-xs text-stone-400">Thinking...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-stone-200 px-3 py-2.5 shrink-0">
                <div className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask a question..."
                    rows={1}
                    className="flex-1 resize-none rounded-xl border border-stone-200 focus:border-primary-400 focus:ring-1 focus:ring-primary-400 px-3 py-2 text-sm outline-none transition-colors max-h-24 placeholder:text-stone-400"
                    style={{ minHeight: '38px' }}
                    disabled={isWaiting}
                  />
                  <button
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isWaiting}
                    className="shrink-0 w-9 h-9 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:bg-stone-200 disabled:cursor-not-allowed text-white disabled:text-stone-400 flex items-center justify-center transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}

/** Simple markdown renderer for assistant messages */
function MarkdownContent({ content, isUser }: { content: string; isUser: boolean }) {
  if (isUser) {
    return <span className="whitespace-pre-wrap">{content}</span>
  }

  // Convert markdown to simple HTML
  const html = content
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-stone-200/80 px-1 py-0.5 rounded text-xs font-mono">$1</code>')
    // Unordered lists
    .replace(/^[-•] (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
    // Line breaks
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>')

  return (
    <span
      className="whitespace-pre-wrap [&_li]:my-0.5 [&_strong]:font-semibold"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
