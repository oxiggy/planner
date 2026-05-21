import { COLORS } from '@/lib/constants'
import { cn } from '@/lib/utils'

type Props = {
  value: string
  onChange: (id: string) => void
}

export function ColorPicker({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-8 gap-1">
      {COLORS.map((c) => (
        <button
          key={c.id}
          type="button"
          title={c.label}
          onClick={() => onChange(c.id)}
          onPointerDown={(e) => e.stopPropagation()}
          className={cn(
            'h-6 w-6 rounded-md border transition-transform hover:scale-110',
            value === c.id
              ? 'ring-2 ring-offset-1 ring-slate-700 dark:ring-slate-200 dark:ring-offset-slate-900'
              : '',
          )}
          style={{ background: c.bg, borderColor: c.border }}
        />
      ))}
    </div>
  )
}
