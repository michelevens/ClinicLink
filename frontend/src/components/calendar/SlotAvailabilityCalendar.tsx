import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import { useSlots } from '../../hooks/useApi.ts'

interface Props {
  siteId: string
  selectedStartDate?: string
  selectedEndDate?: string
}

export function SlotAvailabilityCalendar({ siteId, selectedStartDate, selectedEndDate }: Props) {
  const { data } = useSlots({ site_id: siteId })
  const slots = data?.data || []

  const events: Array<{ id: string; title: string; start: string; end: string; color: string; display: string }> = slots.map(slot => ({
    id: slot.id,
    title: `${slot.title} (${slot.filled}/${slot.capacity})`,
    start: slot.start_date,
    end: slot.end_date,
    color: slot.status === 'open' ? '#3b82f6' : slot.status === 'filled' ? '#22c55e' : '#9ca3af',
    display: 'block',
  }))

  // Highlight selected date range
  if (selectedStartDate && selectedEndDate) {
    events.push({
      id: 'selected-range',
      title: 'New Slot',
      start: selectedStartDate,
      end: selectedEndDate,
      color: '#f59e0b',
      display: 'background' as const,
    })
  }

  return (
    <div className="border border-stone-200 rounded-xl p-3 bg-white">
      <p className="text-xs font-medium text-stone-500 mb-2">Site Slot Calendar</p>
      <div className="text-xs [&_.fc-toolbar-title]:text-sm [&_.fc-button]:text-xs [&_.fc-button]:px-2 [&_.fc-button]:py-1 [&_.fc-daygrid-day-number]:text-xs">
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          events={events}
          height={280}
          headerToolbar={{ left: 'prev', center: 'title', right: 'next' }}
          dayMaxEvents={2}
        />
      </div>
      <div className="flex items-center gap-4 mt-2 text-xs text-stone-500">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500" />Open</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-green-500" />Filled</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-stone-400" />Closed</span>
        {selectedStartDate && <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />New Slot</span>}
      </div>
    </div>
  )
}
