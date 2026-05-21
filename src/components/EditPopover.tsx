import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ColorPicker } from './ColorPicker'
import { EmojiPicker } from './EmojiPicker'
import { Minus, Plus } from 'lucide-react'
import { formatHM } from '@/lib/time'

type EditableFields = {
  color: string
  emoji?: string
  note?: string
  noteLink?: string
}

type Props = {
  trigger: React.ReactNode
  value: EditableFields
  onChange: (patch: Partial<EditableFields>) => void
  showDuration?: boolean
  durationMin?: number
  onDurationChange?: (min: number) => void
  startMin?: number
}

export function EditPopover({
  trigger,
  value,
  onChange,
  showDuration,
  durationMin,
  onDurationChange,
  startMin,
}: Props) {
  return (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align="end"
        onPointerDown={(e) => e.stopPropagation()}
        className="w-80 space-y-3"
      >
        <div>
          <div className="mb-1.5 text-xs font-medium text-slate-600">Цвет</div>
          <ColorPicker value={value.color} onChange={(c) => onChange({ color: c })} />
        </div>
        <div>
          <div className="mb-1.5 text-xs font-medium text-slate-600">Эмодзи</div>
          <EmojiPicker value={value.emoji} onChange={(e) => onChange({ emoji: e })} />
        </div>
        {showDuration && durationMin !== undefined && onDurationChange && (
          <div>
            <div className="mb-1.5 text-xs font-medium text-slate-600">
              Длительность{' '}
              {startMin !== undefined && (
                <span className="text-slate-400">
                  {formatHM(startMin)} — {formatHM(startMin + durationMin)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDurationChange(Math.max(15, durationMin - 15))}
              >
                <Minus className="h-3.5 w-3.5" />
                15 мин
              </Button>
              <div className="min-w-[60px] text-center text-sm">
                {Math.floor(durationMin / 60)}ч {durationMin % 60}м
              </div>
              <Button variant="outline" size="sm" onClick={() => onDurationChange(durationMin + 15)}>
                <Plus className="h-3.5 w-3.5" />
                15 мин
              </Button>
            </div>
          </div>
        )}
        <div>
          <div className="mb-1.5 text-xs font-medium text-slate-600">Заметка</div>
          <textarea
            value={value.note ?? ''}
            onChange={(e) => onChange({ note: e.target.value })}
            placeholder="Любой текст..."
            rows={3}
            className="w-full resize-y rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-slate-400"
          />
        </div>
        <div>
          <div className="mb-1.5 text-xs font-medium text-slate-600">Ссылка</div>
          <Input
            value={value.noteLink ?? ''}
            onChange={(e) => onChange({ noteLink: e.target.value })}
            placeholder="https://..."
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
