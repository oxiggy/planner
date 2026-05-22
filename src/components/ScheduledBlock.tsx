import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { X, StickyNote, Pencil, Minus, Plus, ExternalLink, ListChecks } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InlineTitle } from './InlineTitle'
import { EditPopover } from './EditPopover'
import { TemplatePicker } from './TemplatePicker'
import { getColor, MIN_HEIGHT } from '@/lib/constants'
import { formatHM } from '@/lib/time'
import { useStore } from '@/store'
import type { ScheduledTask } from '@/types'
import { cn } from '@/lib/utils'
import { useRef, useState } from 'react'

type Props = {
  block: ScheduledTask
  stackIndex: number
  visibleStartMin: number
}

export function ScheduledBlock({ block, stackIndex, visibleStartMin }: Props) {
  const [hovered, setHovered] = useState(false)
  const updateScheduled = useStore((s) => s.updateScheduled)
  const deleteScheduled = useStore((s) => s.deleteScheduled)
  const resizeScheduled = useStore((s) => s.resizeScheduled)
  const applyTemplateToScheduled = useStore((s) => s.applyTemplateToScheduled)
  const theme = useStore((s) => s.settings.theme)

  const color = getColor(block.color)
  const textColor = theme === 'dark' ? '#f1f5f9' : color.text

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `scheduled:${block.id}`,
    data: { type: 'scheduled', blockId: block.id },
  })

  const heightPx = block.durationMin * MIN_HEIGHT
  const compact = heightPx < 56
  const tiny = heightPx < 32

  const resizingRef = useRef(false)
  const onResizeStart = (e: React.PointerEvent) => {
    e.stopPropagation()
    e.preventDefault()
    resizingRef.current = true
    const startY = e.clientY
    const startDur = block.durationMin
    const move = (ev: PointerEvent) => {
      const delta = ev.clientY - startY
      const newDur = Math.round((startDur + delta / MIN_HEIGHT) / 15) * 15
      if (newDur >= 15 && newDur !== block.durationMin) {
        resizeScheduled(block.id, newDur)
      }
    }
    const up = () => {
      resizingRef.current = false
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  const zIndex = isDragging ? 100 : hovered ? 50 : 10 + stackIndex

  return (
    <div
      ref={setNodeRef}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      style={{
        position: 'absolute',
        top: (block.startMin - visibleStartMin) * MIN_HEIGHT,
        height: heightPx,
        left: 2,
        right: 2,
        background: color.bg,
        borderColor: color.border,
        color: textColor,
        transform: CSS.Translate.toString(transform),
        zIndex,
      }}
      className={cn(
        'group select-none rounded-md border text-xs shadow-sm backdrop-blur-[1px] transition-shadow hover:shadow-md',
        isDragging && 'opacity-40',
      )}
      {...attributes}
      {...listeners}
    >
      <div className="flex h-full flex-col px-1.5 py-1">
        <div className="flex items-start gap-1">
          {block.emoji && <span className="shrink-0 text-sm leading-tight">{block.emoji}</span>}
          <InlineTitle
            value={block.title}
            onChange={(v) => updateScheduled(block.id, { title: v })}
            className={cn('text-xs font-medium', tiny && 'truncate')}
          />
          <div
            className={cn(
              'ml-auto flex shrink-0 items-center gap-0.5',
              compact ? 'opacity-0 group-hover:opacity-100' : '',
            )}
          >
            {!compact && (
              <>
                <button
                  title="-15 мин"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() =>
                    resizeScheduled(block.id, Math.max(15, block.durationMin - 15))
                  }
                  className="rounded p-0.5 hover:bg-black/10"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <button
                  title="+15 мин"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => resizeScheduled(block.id, block.durationMin + 15)}
                  className="rounded p-0.5 hover:bg-black/10"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </>
            )}
            <TemplatePicker
              currentTemplateId={block.templateId}
              onSelect={(tplId) => applyTemplateToScheduled(block.id, tplId)}
              trigger={
                <button
                  title="Выбрать задачу"
                  onPointerDown={(e) => e.stopPropagation()}
                  className="rounded p-0.5 hover:bg-black/10"
                >
                  <ListChecks className="h-3 w-3" />
                </button>
              }
            />
            <EditPopover
              trigger={
                <button
                  title="Редактировать"
                  onPointerDown={(e) => e.stopPropagation()}
                  className="rounded p-0.5 hover:bg-black/10"
                >
                  <Pencil className="h-3 w-3" />
                </button>
              }
              value={{
                color: block.color,
                emoji: block.emoji,
                note: block.note,
                noteLink: block.noteLink,
              }}
              onChange={(patch) => updateScheduled(block.id, patch)}
              showDuration
              durationMin={block.durationMin}
              startMin={block.startMin}
              onDurationChange={(d) => resizeScheduled(block.id, d)}
            />
            <button
              title="Убрать с дня"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => deleteScheduled(block.id)}
              className="rounded p-0.5 hover:bg-red-500/30"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
        {!tiny && (
          <div className="mt-auto flex items-center gap-1 text-[10px] opacity-70">
            <span>
              {formatHM(block.startMin)} — {formatHM(block.startMin + block.durationMin)}
            </span>
            {block.note && (
              <span title={block.note} className="ml-auto">
                <StickyNote className="h-3 w-3" />
              </span>
            )}
            {block.noteLink && (
              <a
                href={block.noteLink}
                target="_blank"
                rel="noreferrer"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                title={block.noteLink}
                className="text-inherit hover:opacity-100"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        )}
      </div>
      <div
        onPointerDown={onResizeStart}
        className="absolute bottom-0 left-0 right-0 h-1.5 cursor-ns-resize bg-transparent hover:bg-black/15"
        title="Растянуть"
      />
    </div>
  )
}
