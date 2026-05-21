import { useMemo } from 'react'
import { ChevronsDown, ChevronsLeft, ChevronsRight, ChevronsUp } from 'lucide-react'
import { useStore } from '@/store'
import { daysBetween, rangeDates, todayStr } from '@/lib/time'
import {
  DAY_COL_WIDTH,
  GUTTER_WIDTH,
  HEADER_HEIGHT,
  HOUR_HEIGHT,
  VISIBLE_END_HOUR,
  getVisibleStartMin,
} from '@/lib/constants'
import { DayColumn } from './DayColumn'
import { Button } from './ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'

export function DayGrid() {
  const startDate = useStore((s) => s.startDate)
  const dayCount = useStore((s) => s.dayCount)
  const showAllHours = useStore((s) => s.settings.showAllHours)
  const setShowAllHours = useStore((s) => s.setShowAllHours)
  const showPastDays = useStore((s) => s.showPastDays)
  const setShowPastDays = useStore((s) => s.setShowPastDays)

  const today = todayStr()
  const hiddenPastDays = startDate < today ? daysBetween(startDate, today) : 0
  const hasHiddenPastDays = hiddenPastDays > 0
  const visibleStartDate =
    showPastDays && hasHiddenPastDays ? startDate : (startDate < today ? today : startDate)
  const visibleDayCount = dayCount + (showPastDays && hasHiddenPastDays ? hiddenPastDays : 0)
  const days = useMemo(
    () => rangeDates(visibleStartDate, visibleDayCount),
    [visibleStartDate, visibleDayCount],
  )

  const visibleStartMin = getVisibleStartMin(showAllHours)
  const visibleStartHour = visibleStartMin / 60
  const hoursCount = VISIBLE_END_HOUR - visibleStartHour
  const dayHeight = hoursCount * HOUR_HEIGHT
  const hoursToggleLabel = showAllHours ? 'Скрыть ранние часы' : 'Показать остальные часы'
  const pastDaysToggleLabel = showPastDays ? 'Скрыть прошлые дни' : 'Показать прошлые дни'

  return (
    <div className="scrollbar-thin relative h-full flex-1 overflow-auto bg-white dark:bg-slate-950">
      <div
        className="flex"
        style={{ minWidth: GUTTER_WIDTH + days.length * DAY_COL_WIDTH }}
      >
        <div
          className="sticky left-0 z-30 shrink-0 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
          style={{ width: GUTTER_WIDTH }}
        >
          <div
            className="sticky top-0 z-30 flex items-center justify-center gap-1 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
            style={{ height: HEADER_HEIGHT }}
          >
            <TooltipProvider delayDuration={250}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="iconSm"
                    onClick={() => setShowAllHours(!showAllHours)}
                    aria-label={hoursToggleLabel}
                    className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    {showAllHours ? (
                      <ChevronsDown className="h-4 w-4" />
                    ) : (
                      <ChevronsUp className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{hoursToggleLabel}</TooltipContent>
              </Tooltip>
              {hasHiddenPastDays && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="iconSm"
                      onClick={() => setShowPastDays(!showPastDays)}
                      aria-label={pastDaysToggleLabel}
                      className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    >
                      {showPastDays ? (
                        <ChevronsRight className="h-4 w-4" />
                      ) : (
                        <ChevronsLeft className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{pastDaysToggleLabel}</TooltipContent>
                </Tooltip>
              )}
            </TooltipProvider>
          </div>
          <div className="relative" style={{ height: dayHeight }}>
            {Array.from({ length: hoursCount + 1 }).map((_, i) => {
              const h = visibleStartHour + i
              if (h > VISIBLE_END_HOUR) return null
              return (
                <div
                  key={h}
                  className="absolute left-0 right-0 select-none px-1 text-[10px] text-slate-500 dark:text-slate-400"
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
