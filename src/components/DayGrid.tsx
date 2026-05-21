import { useMemo, useRef, useEffect } from 'react'
import { useStore } from '@/store'
import { rangeDates } from '@/lib/time'
import {
  GUTTER_WIDTH,
  HEADER_HEIGHT,
  HOUR_HEIGHT,
} from '@/lib/constants'
import { DayColumn } from './DayColumn'

export function DayGrid() {
  const startDate = useStore((s) => s.startDate)
  const dayCount = useStore((s) => s.dayCount)
  const days = useMemo(() => rangeDates(startDate, dayCount), [startDate, dayCount])

  const scrollRef = useRef<HTMLDivElement>(null)

  // Scroll to ~8:00 on mount.
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = 8 * HOUR_HEIGHT - 20
  }, [])

  return (
    <div ref={scrollRef} className="scrollbar-thin relative h-full flex-1 overflow-auto bg-white">
      <div
        className="flex"
        style={{ minWidth: GUTTER_WIDTH + days.length * 220 }}
      >
        {/* Sticky-left time gutter */}
        <div
          className="sticky left-0 z-30 shrink-0 border-r border-slate-200 bg-white"
          style={{ width: GUTTER_WIDTH }}
        >
          <div
            className="sticky top-0 z-30 border-b border-slate-200 bg-white"
            style={{ height: HEADER_HEIGHT }}
          />
          <div className="relative" style={{ height: 24 * HOUR_HEIGHT }}>
            {Array.from({ length: 24 }).map((_, h) => (
              <div
                key={h}
                className="absolute left-0 right-0 select-none px-1 text-[10px] text-slate-500"
                style={{ top: h * HOUR_HEIGHT - 6 }}
              >
                {h.toString().padStart(2, '0')}:00
              </div>
            ))}
          </div>
        </div>
        {/* Day columns */}
        <div className="flex">
          {days.map((d) => (
            <DayColumn key={d} date={d} />
          ))}
        </div>
      </div>
    </div>
  )
}
