import { useDroppable } from '@dnd-kit/core'
import { useMemo } from 'react'
import { useStore } from '@/store'
import {
  DAY_COL_WIDTH,
  HEADER_HEIGHT,
  HOUR_HEIGHT,
  MIN_HEIGHT,
  VISIBLE_END_HOUR,
  getVisibleStartMin,
} from '@/lib/constants'
import { formatDayHeader, formatHM, isToday } from '@/lib/time'
import { ScheduledBlock } from './ScheduledBlock'
import { cn } from '@/lib/utils'

type Props = { date: string }

export function DayColumn({ date }: Props) {
  const scheduled = useStore((s) => s.scheduled)
  const showAllHours = useStore((s) => s.settings.showAllHours)
  const visibleStartMin = getVisibleStartMin(showAllHours)
  const visibleStartHour = visibleStartMin / 60
  const hoursCount = VISIBLE_END_HOUR - visibleStartHour
  const dayHeight = hoursCount * HOUR_HEIGHT

  const blocks = useMemo(
    () => scheduled.filter((b) => b.date === date).sort((a, b) => a.startMin - b.startMin),
    [scheduled, date],
  )

  const { setNodeRef, isOver } = useDroppable({
    id: `day:${date}`,
    data: { type: 'day', date },
  })

  const today = isToday(date)
  const dayHeader = formatDayHeader(date)

  return (
    <div className="shrink-0 border-r border-slate-200" style={{ width: DAY_COL_WIDTH }}>
      <div
        className={cn(
          'sticky top-0 z-20 flex items-center justify-center border-b border-slate-200 bg-white px-2 text-sm font-medium',
          today && 'bg-sky-50 text-sky-800',
        )}
        style={{ height: HEADER_HEIGHT }}
      >
        {dayHeader}
      </div>
      <div
        ref={setNodeRef}
        className={cn('relative overflow-hidden', isOver && 'bg-sky-50/40')}
        style={{ height: dayHeight }}
      >
        {Array.from({ length: hoursCount }).map((_, i) => (
          <div key={`h-${i}`}>
            <div
              className="pointer-events-none absolute left-0 right-0 border-t border-slate-200"
              style={{ top: i * HOUR_HEIGHT }}
            />
            <div
              className="pointer-events-none absolute left-0 right-0 border-t border-dashed border-slate-200/80"
              style={{ top: i * HOUR_HEIGHT + HOUR_HEIGHT / 2 }}
            />
          </div>
        ))}
        {today && <NowLine visibleStartMin={visibleStartMin} />}
        <DropGhost date={date} visibleStartMin={visibleStartMin} />
        {blocks.map((b, i) => (
          <ScheduledBlock
            key={b.id}
            block={b}
            stackIndex={i}
            visibleStartMin={visibleStartMin}
          />
        ))}
      </div>
    </div>
  )
}

function DropGhost({ date, visibleStartMin }: { date: string; visibleStartMin: number }) {
  const preview = useStore((s) =>
    s.dragPreview && s.dragPreview.date === date ? s.dragPreview : null,
  )
  if (!preview) return null
  return (
    <div
      className="pointer-events-none absolute left-1 right-1 z-[60] rounded-md border-2 border-dashed border-sky-500/70 bg-sky-500/15"
      style={{
        top: (preview.startMin - visibleStartMin) * MIN_HEIGHT,
        height: preview.durationMin * MIN_HEIGHT,
      }}
    >
      <div className="px-1 py-0.5 text-[10px] font-medium text-sky-800">
        {formatHM(preview.startMin)} — {formatHM(preview.startMin + preview.durationMin)}
      </div>
    </div>
  )
}

function NowLine({ visibleStartMin }: { visibleStartMin: number }) {
  const now = new Date()
  const min = now.getHours() * 60 + now.getMinutes()
  return (
    <div
      className="pointer-events-none absolute left-0 right-0 z-10"
      style={{ top: (min - visibleStartMin) * MIN_HEIGHT }}
    >
      <div className="h-px bg-red-500" />
    </div>
  )
}
