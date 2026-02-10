import { useState, useRef, useEffect } from 'react'
import { Bell, Check, CheckCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead } from '../../hooks/useApi.ts'

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const { data: unreadData } = useUnreadCount()
  const { data: notifData } = useNotifications()
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()

  const unreadCount = unreadData?.count ?? 0
  const notifications = notifData?.data ?? []

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  function handleNotificationClick(notif: typeof notifications[0]) {
    if (!notif.read_at) {
      markAsRead.mutate(notif.id)
    }
    if (notif.data.link) {
      navigate(notif.data.link)
    }
    setOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-stone-500 hover:text-stone-700 hover:bg-stone-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-stone-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
            <h3 className="font-semibold text-sm text-stone-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead.mutate()}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-stone-400">
                No notifications yet
              </div>
            ) : (
              notifications.map(notif => (
                <button
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`w-full text-left px-4 py-3 border-b border-stone-50 hover:bg-stone-50 transition-colors flex gap-3 ${
                    !notif.read_at ? 'bg-primary-50/40' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm truncate ${!notif.read_at ? 'font-semibold text-stone-900' : 'font-medium text-stone-700'}`}>
                        {notif.data.title}
                      </p>
                      {!notif.read_at && (
                        <span className="w-2 h-2 rounded-full bg-primary-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5 line-clamp-2">{notif.data.message}</p>
                    <p className="text-[11px] text-stone-400 mt-1">{timeAgo(notif.created_at)}</p>
                  </div>
                  {!notif.read_at && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        markAsRead.mutate(notif.id)
                      }}
                      className="shrink-0 p-1 rounded text-stone-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                      title="Mark as read"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
