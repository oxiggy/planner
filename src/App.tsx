import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { Toolbar } from './components/Toolbar'
import { Sidebar } from './components/Sidebar'
import { DayGrid } from './components/DayGrid'
import { useStore } from './store'
import { MIN_HEIGHT } from './lib/constants'
import { snapToSlot } from './lib/time'

function getEventClientY(e: Event | undefined): number | null {
  if (!e) return null
  const me = e as MouseEvent
  if (typeof me.clientY === 'number') return me.clientY
  const te = e as TouchEvent
  const t = te.touches?.[0] ?? te.changedTouches?.[0]
  return t ? t.clientY : null
}

export default function App() {
  const addScheduledFromTemplate = useStore((s) => s.addScheduledFromTemplate)
  const moveScheduled = useStore((s) => s.moveScheduled)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  )

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const overData = over.data.current as { type?: string; date?: string } | undefined
    if (overData?.type !== 'day' || !overData.date) return
    const date = overData.date

    const overRect = over.rect
    if (!overRect) return

    const startY = getEventClientY(event.activatorEvent)
    if (startY == null) return
    const dropY = startY + event.delta.y

    const activeData = active.data.current as { type?: string; blockId?: string; templateId?: string } | undefined

    if (activeData?.type === 'template' && activeData.templateId) {
      // Pointer corresponds to the top edge of the new block (predictable feeling).
      const localY = dropY - overRect.top
      const startMin = snapToSlot(localY / MIN_HEIGHT)
      addScheduledFromTemplate(activeData.templateId, date, startMin)
      return
    }

    if (activeData?.type === 'scheduled' && activeData.blockId) {
      const initial = active.rect.current.initial
      if (!initial) return
      // Preserve where the user grabbed the block: keep the relative offset stable.
      const pointerOffsetY = startY - initial.top
      const newBlockTopY = dropY - pointerOffsetY
      const localY = newBlockTopY - overRect.top
      const startMin = snapToSlot(localY / MIN_HEIGHT)
      moveScheduled(activeData.blockId, date, startMin)
      return
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
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
