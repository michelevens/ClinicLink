import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays } from 'lucide-react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import { useCalendarEvents } from '../hooks/useApi.ts'
import type { CalendarEvent } from '../services/api.ts'
import type { DatesSetArg, EventClickArg } from '@fullcalendar/core'

const EVENT_TYPES = [
  { key: 'rotation', label: 'Rotations', color: '#3b82f6' },
  { key: 'hour_log', label: 'Hour Logs', color: '#22c55e' },
  { key: 'evaluation', label: 'Evaluations', color: '#f97316' },
  { key: 'deadline', label: 'Deadlines', color: '#ef4444' },
  { key: 'application', label: 'Applications', color: '#f59e0b' },
] as const

export function Calendar() {
  const navigate = useNavigate()
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null)
  const [hiddenTypes, setHiddenTypes] = useState<Set<string>>(new Set())

  const { data: events } = useCalendarEvents(dateRange?.start ?? null, dateRange?.end ?? null)

  const handleDatesSet = useCallback((arg: DatesSetArg) => {
    setDateRange({
      start: arg.startStr.split('T')[0],
      end: arg.endStr.split('T')[0],
    })
  }, [])

  const handleEventClick = useCallback((info: EventClickArg) => {
    const meta = (info.event.extendedProps as CalendarEvent['meta'] & { type: string })
    const link = meta?.link
    if (link) navigate(link)
  }, [navigate])

  const toggleType = (type: string) => {
    setHiddenTypes(prev => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }

  const filteredEvents = (events ?? [])
    .filter(e => !hiddenTypes.has(e.type))
    .map(e => ({
      id: e.id,
      title: e.title,
      start: e.start,
      end: e.end,
      allDay: e.allDay,
      color: e.color,
      extendedProps: { ...e.meta, type: e.type },
    }))

  // Detect mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  return (
    <div className="p-4 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarDays className="w-6 h-6 text-primary-600" />
          <h1 className="text-xl font-bold text-stone-900">Calendar</h1>
        </div>
      </div>

      {/* Filters + Legend */}
      <div className="flex flex-wrap items-center gap-2">
        {EVENT_TYPES.map(t => (
          <button
            key={t.key}
            onClick={() => toggleType(t.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
              hiddenTypes.has(t.key)
                ? 'border-stone-200 text-stone-400 bg-white'
                : 'border-transparent text-white'
            }`}
            style={!hiddenTypes.has(t.key) ? { backgroundColor: t.color } : undefined}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-2 sm:p-4 shadow-sm">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          initialView={isMobile ? 'listWeek' : 'dayGridMonth'}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,listWeek',
          }}
          events={filteredEvents}
          datesSet={handleDatesSet}
          eventClick={handleEventClick}
          height="auto"
          eventDisplay="block"
          dayMaxEvents={3}
          nowIndicator
          eventTimeFormat={{ hour: '2-digit', minute: '2-digit', meridiem: 'short' }}
        />
      </div>
    </div>
  )
}
