import { useMemo } from 'react'
import { ChevronsDown, ChevronsUp } from 'lucide-react'
import { useStore } from '@/store'
import { rangeDates } from '@/lib/time'
import {
  DAY_COL_WIDTH,
  GUTTER_WIDTH,
  HEADER_HEIGHT,
  HOUR_HEIGHT,
  VISIBLE_END_HOUR,
  getVisibleStartMin,
} from '@/lib/constants'
import { DayColumn } from './DayColumn'

export function DayGrid() {
  const startDate = useStore((s) => s.startDate)
  const dayCount = useStore((s) => s.dayCount)
  const showAllHours = useStore((s) => s.settings.showAllHours)
  const setShowAllHours = useStore((s) => s.setShowAllHours)
  const days = useMemo(() => rangeDates(startDate, dayCount), [startDate, dayCount])

  const visibleStartMin = getVisibleStartMin(showAllHours)
  const visibleStartHour = visibleStartMin / 60
  const hoursCount = VISIBLE_END_HOUR - visibleStartHour
  const dayHeight = hoursCount * HOUR_HEIGHT

  return (
    <div className="scrollbar-thin relative h-full flex-1 overflow-auto bg-white">
      <div
        className="flex"
        style={{ minWidth: GUTTER_WIDTH + days.length * DAY_COL_WIDTH }}
      >
        <div
          className="sticky left-0 z-30 shrink-0 border-r border-slate-200 bg-white"
          style={{ width: GUTTER_WIDTH }}
        >
          <div
            className="sticky top-0 z-30 flex items-center justify-center border-b border-slate-200 bg-white"
            style={{ height: HEADER_HEIGHT }}
          >
            <button
              onClick={() => setShowAllHours(!showAllHours)}
              title={showAllHours ? 'Скрыть ранние часы' : 'Показать остальные часы'}
              className="rounded p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              {showAllHours ? (
                <ChevronsDown className="h-4 w-4" />
              ) : (
                <ChevronsUp className="h-4 w-4" />
              )}
            </button>
          </div>
          <div className="relative" style={{ height: dayHeight }}>
            {Array.from({ length: hoursCount + 1 }).map((_, i) => {
              const h = visibleStartHour + i
              if (h > VISIBLE_END_HOUR) return null
              return (
                <div
                  key={h}
                  className="absolute left-0 right-0 select-none px-1 text-[10px] text-slate-500"
                  style={{ top: i * HOUR_HEIGHT - 6 }}
                >
                  {h.toString().padStart(2, '0')}:00
                </div>
              )
            })}
          </div>
        </div>
        <div className="flex">
          {days.map((d) => (
            <DayColumn key={d} date={d} />
          ))}
        </div>
      </div>
    </div>
  )
}
