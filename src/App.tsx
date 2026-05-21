import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragMoveEvent,
} from '@dnd-kit/core'
import { Toolbar } from './components/Toolbar'
import { Sidebar } from './components/Sidebar'
import { DayGrid } from './components/DayGrid'
import { useStore } from './store'
import { MIN_HEIGHT, getVisibleStartMin } from './lib/constants'
import { snapToSlot } from './lib/time'

function getEventClientY(e: Event | undefined): number | null {
  if (!e) return null
  const me = e as MouseEvent
  if (typeof me.clientY === 'number') return me.clientY
  const te = e as TouchEvent
  const t = te.touches?.[0] ?? te.changedTouches?.[0]
  return t ? t.clientY : null
}

type Target = {
  date: string
  startMin: number
  durationMin: number
  ignoreId?: string
}

function computeTarget(event: DragMoveEvent | DragEndEvent): Target | null {
  const { active, over } = event
  if (!over) return null
  const overData = over.data.current as { type?: string; date?: string } | undefined
  if (overData?.type !== 'day' || !overData.date) return null
  const overRect = over.rect
  if (!overRect) return null
  const startY = getEventClientY(event.activatorEvent)
  if (startY == null) return null
  const dropY = startY + event.delta.y
  const activeData = active.data.current as
    | { type?: string; blockId?: string; templateId?: string }
    | undefined
  const state = useStore.getState()
  const visibleStartMin = getVisibleStartMin(state.settings.showAllHours)

  if (activeData?.type === 'template' && activeData.templateId) {
    const tpl = state.templates.find((t) => t.id === activeData.templateId)
    if (!tpl) return null
    const localY = dropY - overRect.top
    const startMin = snapToSlot(localY / MIN_HEIGHT) + visibleStartMin
    return { date: overData.date, startMin, durationMin: tpl.durationMin }
  }

  if (activeData?.type === 'scheduled' && activeData.blockId) {
    const block = state.scheduled.find((b) => b.id === activeData.blockId)
    if (!block) return null
    const initial = active.rect.current.initial
    if (!initial) return null
    const pointerOffsetY = startY - initial.top
    const newBlockTopY = dropY - pointerOffsetY
    const localY = newBlockTopY - overRect.top
    const startMin = snapToSlot(localY / MIN_HEIGHT) + visibleStartMin
    return {
      date: overData.date,
      startMin,
      durationMin: block.durationMin,
      ignoreId: block.id,
    }
  }
  return null
}

function isValidTarget(t: Target): boolean {
  const end = t.startMin + t.durationMin
  if (t.startMin < 0 || end > 1440) return false
  const s = useStore.getState()
  if (!s.settings.preventOverlap) return true
  return !s.scheduled.some(
    (b) =>
      b.id !== t.ignoreId &&
      b.date === t.date &&
      b.startMin < end &&
      t.startMin < b.startMin + b.durationMin,
  )
}

export default function App() {
  const addScheduledFromTemplate = useStore((s) => s.addScheduledFromTemplate)
  const moveScheduled = useStore((s) => s.moveScheduled)
  const reorderTemplate = useStore((s) => s.reorderTemplate)
  const setDragPreview = useStore((s) => s.setDragPreview)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  )

  const onDragMove = (event: DragMoveEvent) => {
    const overData = event.over?.data.current as { type?: string } | undefined
    if (overData?.type === 'template-slot') {
      setDragPreview(null)
      return
    }
    const target = computeTarget(event)
    if (!target || !isValidTarget(target)) {
      setDragPreview(null)
      return
    }
    setDragPreview({
      date: target.date,
      startMin: target.startMin,
      durationMin: target.durationMin,
    })
  }

  const onDragEnd = (event: DragEndEvent) => {
    setDragPreview(null)
    const activeData = event.active.data.current as
      | { type?: string; blockId?: string; templateId?: string }
      | undefined
    const overData = event.over?.data.current as
      | { type?: string; templateId?: string }
      | undefined
    if (
      activeData?.type === 'template' &&
      activeData.templateId &&
      overData?.type === 'template-slot' &&
      overData.templateId
    ) {
      reorderTemplate(activeData.templateId, overData.templateId)
      return
    }
    const target = computeTarget(event)
    if (!target) return
    if (activeData?.type === 'template' && activeData.templateId) {
      addScheduledFromTemplate(activeData.templateId, target.date, target.startMin)
    } else if (activeData?.type === 'scheduled' && activeData.blockId) {
      moveScheduled(activeData.blockId, target.date, target.startMin)
    }
  }

  const onDragCancel = () => setDragPreview(null)

  return (
    <DndContext
      sensors={sensors}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      <div className="flex h-screen flex-col">
        <Toolbar />
        <div className="flex min-h-0 flex-1">
          <Sidebar />
          <DayGrid />
        </div>
      </div>
    </DndContext>
  )
}
