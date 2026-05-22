import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useStore } from '@/store'
import {
  Upload,
  Download,
  LayoutTemplate,
  Sun,
  Moon,
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Settings,
  Trash2,
  Menu,
  Check,
} from 'lucide-react'
import { download, pickFile, readFile, type PlannerExport } from '@/lib/json-io'
import { cn } from '@/lib/utils'
import type { ScheduledTask } from '@/types'

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

function dateFromString(value: string) {
  return new Date(`${value}T00:00:00`)
}

function formatDateValue(date: Date) {
  const y = date.getFullYear()
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const d = date.getDate().toString().padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatDateLabel(value: string) {
  return dateFromString(value).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function getCalendarDays(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const start = new Date(first)
  const mondayOffset = (first.getDay() + 6) % 7
  start.setDate(first.getDate() - mondayOffset)

  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    return date
  })
}

function HeaderDatePicker({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const selectedDate = dateFromString(value)
  const [open, setOpen] = React.useState(false)
  const [month, setMonth] = React.useState(() => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1))

  React.useEffect(() => {
    setMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1))
  }, [selectedDate.getFullYear(), selectedDate.getMonth()])

  const monthLabel = month.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
  const days = getCalendarDays(month)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-[136px] justify-start px-2.5 text-left font-normal"
        >
          <CalendarIcon className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
          <span className="tabular-nums">{formatDateLabel(value)}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-2">
        <div className="mb-2 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="iconSm"
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <div className="text-sm font-medium capitalize text-slate-900 dark:text-slate-100">
            {monthLabel}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="iconSm"
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
            aria-label="Next month"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-slate-500 dark:text-slate-400">
          {WEEKDAYS.map((day) => (
            <div key={day} className="h-6 leading-6">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const dateValue = formatDateValue(day)
            const selected = dateValue === value
            const outside = day.getMonth() !== month.getMonth()

            return (
              <button
                key={dateValue}
                type="button"
                onClick={() => {
                  onChange(dateValue)
                  setOpen(false)
                }}
                className={cn(
                  'grid h-7 w-7 place-items-center rounded-md text-xs tabular-nums transition-colors',
                  'hover:bg-slate-100 dark:hover:bg-slate-800',
                  outside && 'text-slate-400 dark:text-slate-600',
                  selected &&
                    'bg-slate-900 text-white hover:bg-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-100',
                )}
              >
                {day.getDate()}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function Toolbar() {
  const [clearTarget, setClearTarget] = React.useState<'tasks' | 'planner' | null>(null)
  const startDate = useStore((s) => s.startDate)
  const dayCount = useStore((s) => s.dayCount)
  const preventOverlap = useStore((s) => s.settings.preventOverlap)
  const theme = useStore((s) => s.settings.theme)
  const setStartDate = useStore((s) => s.setStartDate)
  const setDayCount = useStore((s) => s.setDayCount)
  const setPreventOverlap = useStore((s) => s.setPreventOverlap)
  const setTheme = useStore((s) => s.setTheme)
  const scheduled = useStore((s) => s.scheduled)
  const importPlanner = useStore((s) => s.importPlanner)
  const clearTemplates = useStore((s) => s.clearTemplates)
  const clearPlanner = useStore((s) => s.clearPlanner)
  const themeLabel =
    theme === 'dark'
      ? 'Светлая тема'
      : 'Тёмная тема'
  const settingsLabel = 'Настройки'
  const clearDialog =
    clearTarget === 'tasks'
      ? {
          title:
            'Очистить все задачи?',
          description:
            'Это удалит все задачи из боковой панели. Запланированные блоки останутся.',
        }
      : {
          title:
            'Очистить планнер?',
          description:
            'Это удалит все запланированные блоки. Список задач останется.',
        }
  const startDateLabel = 'Дата старта'
  const dayCountLabel = 'Количество дней'
  const preventOverlapLabel = 'Запретить пересечения'

  const onExport = () => {
    const data: PlannerExport = { version: 1, startDate, dayCount, scheduled }
    download('planner.json', data)
  }

  const onImport = async () => {
    const file = await pickFile()
    if (!file) return
    try {
      const data = await readFile<PlannerExport>(file)
      if (Array.isArray(data?.scheduled)) {
        importPlanner({
          startDate: data.startDate,
          dayCount: data.dayCount,
          scheduled: data.scheduled as ScheduledTask[],
        })
      } else {
        alert('Неверный формат файла планнера')
      }
    } catch (e) {
      alert('Не удалось прочитать файл: ' + (e as Error).message)
    }
  }

  const onConfirmClear = () => {
    if (clearTarget === 'tasks') clearTemplates()
    if (clearTarget === 'planner') clearPlanner()
    setClearTarget(null)
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
        <span>Planner</span>
      </div>

      {/* Desktop toolbar — >= lg */}
      <div className="hidden flex-1 items-center gap-3 lg:flex">
        <div className="flex items-center gap-2">
          <TooltipProvider delayDuration={250}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <HeaderDatePicker value={startDate} onChange={setStartDate} />
                </div>
              </TooltipTrigger>
              <TooltipContent>{startDateLabel}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider delayDuration={250}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Input
                  type="number"
                  min={1}
                  max={60}
                  value={dayCount}
                  onChange={(e) => setDayCount(Number(e.target.value))}
                  aria-label={dayCountLabel}
                  className="h-8 w-[104px]"
                />
              </TooltipTrigger>
              <TooltipContent>{dayCountLabel}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <TooltipProvider delayDuration={250}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={preventOverlapLabel}
                aria-pressed={preventOverlap}
                onClick={() => setPreventOverlap(!preventOverlap)}
                className="ml-1 text-slate-600 dark:text-slate-400"
              >
                <span className="relative grid h-4 w-4 place-items-center" aria-hidden="true">
                  <LayoutTemplate className="h-4 w-4" />
                  {preventOverlap && (
                    <span className="absolute h-[1.5px] w-5 rotate-45 rounded-full bg-current" />
                  )}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{preventOverlapLabel}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div className="ml-auto flex items-center gap-1.5">
          <TooltipProvider delayDuration={250}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  aria-label={themeLabel}
                  title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
                >
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{themeLabel}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DropdownMenu>
            <TooltipProvider delayDuration={250}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label={settingsLabel}>
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>{settingsLabel}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setClearTarget('tasks')}>
                <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                Очистить задачи
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setClearTarget('planner')}>
                <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                Очистить планнер
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" onClick={onImport}>
            <Upload className="h-3.5 w-3.5" />
            Загрузить JSON
          </Button>
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="h-3.5 w-3.5" />
            Выгрузить JSON
          </Button>
        </div>
      </div>

      {/* Mobile / tablet menu — < lg */}
      <div className="ml-auto lg:hidden">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Меню">
              <Menu className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" collisionPadding={8} className="w-80 space-y-3">
            <div className="space-y-1.5">
              <div className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {startDateLabel}
              </div>
              <div className="[&_button]:h-9 [&_button]:w-full [&_button]:justify-start">
                <HeaderDatePicker value={startDate} onChange={setStartDate} />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {dayCountLabel}
              </div>
              <Input
                type="number"
                min={1}
                max={60}
                value={dayCount}
                onChange={(e) => setDayCount(Number(e.target.value))}
                aria-label={dayCountLabel}
                className="h-9 w-full"
              />
            </div>
            <div className="flex flex-col gap-1.5 border-t border-slate-200 pt-2 dark:border-slate-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreventOverlap(!preventOverlap)}
                aria-pressed={preventOverlap}
                className="justify-start"
              >
                <LayoutTemplate className="h-4 w-4" />
                {preventOverlapLabel}
                {preventOverlap && <Check className="ml-auto h-3.5 w-3.5" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="justify-start"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {themeLabel}
              </Button>
            </div>
            <div className="flex flex-col gap-1.5 border-t border-slate-200 pt-2 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={onImport} className="justify-start">
                <Upload className="h-3.5 w-3.5" />
                Загрузить JSON
              </Button>
              <Button variant="outline" size="sm" onClick={onExport} className="justify-start">
                <Download className="h-3.5 w-3.5" />
                Выгрузить JSON
              </Button>
            </div>
            <div className="flex flex-col gap-1.5 border-t border-slate-200 pt-2 dark:border-slate-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setClearTarget('tasks')}
                className="justify-start text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Очистить задачи
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setClearTarget('planner')}
                className="justify-start text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Очистить планнер
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Clear confirmation dialog — shared by both desktop and mobile triggers */}
      <AlertDialog
        open={clearTarget !== null}
        onOpenChange={(open) => !open && setClearTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{clearDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>{clearDialog.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmClear}>Очистить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  )
}
