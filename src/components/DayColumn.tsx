import { useDroppable } from '@dnd-kit/core'
import { useMemo } from 'react'
import { useStore } from '@/store'
import {
  DAY_COL_WIDTH,
  HEADER_HEIGHT,
  HOUR_HEIGHT,
  MIN_HEIGHT,
} from '@/lib/constants'
import { formatDayHeader, formatHM, isToday } from '@/lib/time'
import { ScheduledBlock } from './ScheduledBlock'
import { cn } from '@/lib/utils'

type Props = { date: string }

export function DayColumn({ date }: Props) {
  const scheduled = useStore((s) => s.scheduled)
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
        className={cn('relative', isOver && 'bg-sky-50/40')}
        style={{ height: 24 * HOUR_HEIGHT }}
      >
        {Array.from({ length: 24 }).map((_, h) => (
          <div key={`h-${h}`}>
            <div
              className="pointer-events-none absolute left-0 right-0 border-t border-slate-200"
              style={{ top: h * HOUR_HEIGHT }}
            />
            <div
              className="pointer-events-none absolute left-0 right-0 border-t border-dashed border-slate-200/80"
              style={{ top: h * HOUR_HEIGHT + HOUR_HEIGHT / 2 }}
            />
          </div>
        ))}
        {today && <NowLine />}
        <DropGhost date={date} />
        {blocks.map((b, i) => (
          <ScheduledBlock key={b.id} block={b} stackIndex={i} />
        ))}
      </div>
    </div>
  )
}

function DropGhost({ date }: { date: string }) {
  const preview = useStore((s) =>
    s.dragPreview && s.dragPreview.date === date ? s.dragPreview : null,
  )
  if (!preview) return null
  return (
    <div
      className="pointer-events-none absolute left-1 right-1 z-[60] rounded-md border-2 border-dashed border-sky-500/70 bg-sky-500/15"
      style={{
        top: preview.startMin * MIN_HEIGHT,
        height: preview.durationMin * MIN_HEIGHT,
      }}
    >
      <div className="px-1 py-0.5 text-[10px] font-medium text-sky-800">
        {formatHM(preview.startMin)} — {formatHM(preview.startMin + preview.durationMin)}
      </div>
    </div>
  )
}

function NowLine() {
  const now = new Date()
  const min = now.getHours() * 60 + now.getMinutes()
  return (
    <div
      className="pointer-events-none absolute left-0 right-0 z-10"
      style={{ top: min * MIN_HEIGHT }}
    >
      <div className="h-px bg-red-500" />
    </div>
  )
}
