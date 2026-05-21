import { EMOJIS } from '@/lib/constants'
import { cn } from '@/lib/utils'

type Props = {
  value?: string
  onChange: (emoji: string | undefined) => void
}

export function EmojiPicker({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-8 gap-1">
        <button
          type="button"
          title="Без эмодзи"
          onClick={() => onChange(undefined)}
          onPointerDown={(e) => e.stopPropagation()}
          className={cn(
            'h-7 w-7 rounded-md border border-slate-200 text-xs text-slate-400 hover:bg-slate-50',
            !value ? 'ring-2 ring-offset-1 ring-slate-700' : '',
          )}
        >
          ✕
        </button>
        {EMOJIS.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => onChange(e)}
            onPointerDown={(ev) => ev.stopPropagation()}
            className={cn(
              'h-7 w-7 rounded-md text-base leading-none hover:bg-slate-100',
              value === e ? 'ring-2 ring-offset-1 ring-slate-700' : '',
            )}
          >
            {e}
          </button>
        ))}
      </div>
    </div>
  )
}
