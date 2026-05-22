import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useStore } from '@/store'
import { getColor } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

type Props = {
  trigger: React.ReactNode
  currentTemplateId?: string
  onSelect: (templateId: string) => void
}

export function TemplatePicker({ trigger, currentTemplateId, onSelect }: Props) {
  const templates = useStore((s) => s.templates)

  return (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align="end"
        onPointerDown={(e) => e.stopPropagation()}
        className="w-64 p-1"
      >
        <div className="px-2 pb-1 pt-1 text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Выбрать задачу
        </div>
        {templates.length === 0 ? (
          <div className="px-2 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
            Список задач пуст. Добавьте задачу в боковой панели.
          </div>
        ) : (
          <div className="max-h-72 overflow-y-auto">
            {templates.map((t) => {
              const color = getColor(t.color)
              const active = t.id === currentTemplateId
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onSelect(t.id)}
                  onPointerDown={(e) => e.stopPropagation()}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-slate-800 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800',
                    active && 'bg-slate-100 dark:bg-slate-800',
                  )}
                >
                  <span
                    className="h-3 w-3 shrink-0 rounded-sm border"
                    style={{ background: color.bg, borderColor: color.border }}
                  />
                  {t.emoji && <span className="shrink-0 leading-none">{t.emoji}</span>}
                  <span className="min-w-0 flex-1 truncate">
                    {t.title || (
                      <span className="italic text-slate-400 dark:text-slate-500">Без названия</span>
                    )}
                  </span>
                  {active && <Check className="h-3.5 w-3.5 shrink-0 text-slate-500 dark:text-slate-400" />}
                </button>
              )
            })}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
