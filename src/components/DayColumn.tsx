import { useDroppable } from '@dnd-kit/core'
import { useMemo } from 'react'
import { useStore } from '@/store'
import {
  DAY_COL_WIDTH,
  HEADER_HEIGHT,
  HOUR_HEIGHT,
  MIN_HEIGHT,
} from '@/lib/constants'
import { formatDayHeader, isToday } from '@/lib/time'
import { ScheduledBlock } from './ScheduledBlock'
import type { ScheduledTask } from '@/types'
import { cn } from '@/lib/utils'

type Props = { date: string }

function assignLanes(blocks: ScheduledTask[]): Map<string, { lane: number; lanes: number }> {
  const overlap = (a: ScheduledTask, b: ScheduledTask) =>
    a.startMin < b.startMin + b.durationMin && b.startMin < a.startMin + a.durationMin

  const sorted = [...blocks].sort((a, b) => a.startMin - b.startMin)
  // Build transitive overlap clusters.
  const clusters: ScheduledTask[][] = []
  for (const b of sorted) {
    const matchIdx: number[] = []
    clusters.forEach((cluster, idx) => {
      if (cluster.some((c) => overlap(c, b))) matchIdx.push(idx)
    })
    if (matchIdx.length === 0) {
      clusters.push([b])
    } else if (matchIdx.length === 1) {
      clusters[matchIdx[0]].push(b)
    } else {
      const merged: ScheduledTask[] = [b]
      for (const i of matchIdx) merged.push(...clusters[i])
      matchIdx
        .slice()
        .sort((x, y) => y - x)
        .forEach((i) => clusters.splice(i, 1))
      clusters.push(merged)
    }
  }
  const result = new Map<string, { lane: number; lanes: number }>()
  for (const cluster of clusters) {
    const sortedCluster = [...cluster].sort((a, b) => a.startMin - b.startMin)
    const lanes: ScheduledTask[][] = []
    const laneOf = new Map<string, number>()
    for (const b of sortedCluster) {
      let placed = -1
      for (let i = 0; i < lanes.length; i++) {
        const arr = lanes[i]
        const last = arr[arr.length - 1]
        if (last.startMin + last.durationMin <= b.startMin) {
          placed = i
          arr.push(b)
          break
        }
      }
      if (placed === -1) {
        lanes.push([b])
        placed = lanes.length - 1
      }
      laneOf.set(b.id, placed)
    }
    const lanesCount = lanes.length
    for (const b of cluster) {
      result.set(b.id, { lane: laneOf.get(b.id)!, lanes: lanesCount })
    }
  }
  return result
}

export function DayColumn({ date }: Props) {
  const scheduled = useStore((s) => s.scheduled)
  const blocks = useMemo(() => scheduled.filter((b) => b.date === date), [scheduled, date])
  const laneMap = useMemo(() => assignLanes(blocks), [blocks])

  const { setNodeRef, isOver } = useDroppable({
    id: `day:${date}`,
    data: { type: 'day', date },
  })

  const today = isToday(date)
  const dayHeader = formatDayHeader(date)

  return (
    <div
      className="shrink-0 border-r border-slate-200"
      style={{ width: DAY_COL_WIDTH }}
    >
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
        {/* Hour & half-hour grid lines */}
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
        {/* Now line if today */}
        {today && <NowLine />}
        {/* Blocks */}
        {blocks.map((b) => {
          const info = laneMap.get(b.id) ?? { lane: 0, lanes: 1 }
          return <ScheduledBlock key={b.id} block={b} lane={info.lane} lanes={info.lanes} />
        })}
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
