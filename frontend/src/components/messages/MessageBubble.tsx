import type { ApiMessage } from '../../services/api.ts'

interface Props {
  message: ApiMessage
  isMine: boolean
  showSender: boolean
}

export function MessageBubble({ message, isMine, showSender }: Props) {
  const time = new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} ${showSender ? 'mt-2' : 'mt-0.5'}`}>
      <div className={`max-w-[75%] ${isMine ? 'items-end' : 'items-start'}`}>
        {showSender && !isMine && message.sender && (
          <p className="text-xs text-stone-500 mb-1 ml-1">
            {message.sender.first_name} {message.sender.last_name}
          </p>
        )}
        <div
          className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
            isMine
              ? 'bg-primary-600 text-white rounded-br-md'
              : 'bg-white border border-stone-200 text-stone-800 rounded-bl-md'
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{message.body}</p>
          <p className={`text-[10px] mt-1 ${isMine ? 'text-primary-200' : 'text-stone-400'}`}>
            {time}
          </p>
        </div>
      </div>
    </div>
  )
}
