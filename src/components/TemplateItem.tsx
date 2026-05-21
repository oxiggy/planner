import { useDraggable, useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2, Pencil, StickyNote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InlineTitle } from './InlineTitle'
import { EditPopover } from './EditPopover'
import { useStore } from '@/store'
import { getColor } from '@/lib/constants'
import type { Task } from '@/types'
import { cn } from '@/lib/utils'

type Props = { task: Task }

export function TemplateItem({ task }: Props) {
  const updateTemplate = useStore((s) => s.updateTemplate)
  const deleteTemplate = useStore((s) => s.deleteTemplate)
  const color = getColor(task.color)

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `template:${task.id}`,
    data: { type: 'template', templateId: task.id },
  })
  const { setNodeRef: setDropRef, isOver, active } = useDroppable({
    id: `template-slot:${task.id}`,
    data: { type: 'template-slot', templateId: task.id },
  })
  const activeData = active?.data.current as { type?: string; templateId?: string } | undefined
  const isReorderTarget =
    isOver && activeData?.type === 'template' && activeData.templateId !== task.id

  return (
    <div
      ref={(node) => {
        setNodeRef(node)
        setDropRef(node)
      }}
      style={{
        background: color.bg,
        borderColor: color.border,
        color: color.text,
        transform: CSS.Translate.toString(transform),
      }}
      className={cn(
        'group flex items-center gap-1 rounded-md border px-1.5 py-1.5 text-sm',
        isDragging && 'opacity-40',
        isReorderTarget && 'ring-2 ring-sky-400',
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none text-slate-500 hover:text-slate-800"
        title="Перетащить"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      {task.emoji && <span className="text-base leading-none">{task.emoji}</span>}
      <InlineTitle
        value={task.title}
        onChange={(v) => updateTemplate(task.id, { title: v })}
        className="text-sm"
      />
      {task.note && (
        <span title={task.note} className="text-slate-500">
          <StickyNote className="h-3.5 w-3.5" />
        </span>
      )}
      <span className="text-[10px] text-slate-500">
        {Math.floor(task.durationMin / 60)}ч{task.durationMin % 60 ? `${task.durationMin % 60}м` : ''}
      </span>
      <div className="ml-auto flex items-center opacity-0 transition-opacity group-hover:opacity-100">
        <EditPopover
          trigger={
            <Button variant="ghost" size="iconSm" title="Редактировать">
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          }
          value={{
            color: task.color,
            emoji: task.emoji,
            note: task.note,
            noteLink: task.noteLink,
          }}
          onChange={(patch) => updateTemplate(task.id, patch)}
          showDuration
          durationMin={task.durationMin}
          onDurationChange={(d) => updateTemplate(task.id, { durationMin: Math.max(15, d) })}
        />
        <Button
          variant="ghost"
          size="iconSm"
          title="Удалить шаблон"
          onClick={() => deleteTemplate(task.id)}
          onPointerDown={(e) => e.stopPropagation()}
          className="text-red-600 hover:bg-red-100"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
