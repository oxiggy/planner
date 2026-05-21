import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useStore } from '@/store'
import { Plus, CalendarPlus, Upload, Download, ChevronDown, Minus, SmilePlus } from 'lucide-react'
import { TemplateItem } from './TemplateItem'
import { download, pickFile, readFile, type TemplatesExport } from '@/lib/json-io'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { ColorPicker } from './ColorPicker'
import { EmojiPicker } from './EmojiPicker'
import { DEFAULT_COLOR } from '@/lib/constants'

const slotDurations = [
  { label: '30 минут', minutes: 30 },
  { label: '1 час', minutes: 60 },
  { label: '2 часа', minutes: 120 },
  { label: '5 часов', minutes: 300 },
]

export function Sidebar() {
  const templates = useStore((s) => s.templates)
  const addTemplate = useStore((s) => s.addTemplate)
  const addSlotToToday = useStore((s) => s.addSlotToToday)
  const importTemplates = useStore((s) => s.importTemplates)
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [isEmojiOpen, setIsEmojiOpen] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskEmoji, setNewTaskEmoji] = useState<string | undefined>()
  const [newTaskColor, setNewTaskColor] = useState(DEFAULT_COLOR)
  const [newTaskDurationMin, setNewTaskDurationMin] = useState(60)

  const onAddTask = () => {
    addTemplate({
      title: newTaskTitle,
      emoji: newTaskEmoji,
      color: newTaskColor,
      durationMin: newTaskDurationMin,
    })
    setNewTaskTitle('')
    setNewTaskEmoji(undefined)
    setNewTaskColor(DEFAULT_COLOR)
    setNewTaskDurationMin(60)
    setIsEmojiOpen(false)
    setIsAddTaskOpen(false)
  }

  const onExport = () => {
    const data: TemplatesExport = { version: 1, templates }
    download('templates.json', data)
  }

  const onImport = async () => {
    const file = await pickFile()
    if (!file) return
    try {
      const data = await readFile<TemplatesExport>(file)
      if (Array.isArray(data?.templates)) importTemplates(data.templates)
      else alert('Неверный формат файла шаблонов')
    } catch (e) {
      alert('Не удалось прочитать файл: ' + (e as Error).message)
    }
  }

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-200 p-3 dark:border-slate-800">
        <div className="flex flex-col gap-1.5">
          <Popover open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-3.5 w-3.5" />
                Добавить задачу
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              collisionPadding={8}
              className="w-72 space-y-3"
            >
              <div className="flex gap-2">
                <Popover open={isEmojiOpen} onOpenChange={setIsEmojiOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label="Выбрать смайлик"
                      title="Выбрать смайлик"
                      className="h-9 shrink-0"
                    >
                      {newTaskEmoji ? (
                        <span className="text-base leading-none">{newTaskEmoji}</span>
                      ) : (
                        <SmilePlus className="h-4 w-4" />
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" collisionPadding={8} className="w-72">
                    <EmojiPicker
                      value={newTaskEmoji}
                      onChange={(emoji) => {
                        setNewTaskEmoji(emoji)
                        setIsEmojiOpen(false)
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <Input
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Название задачи"
                  autoFocus
                />
              </div>
              <div>
                <div className="mb-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                  Цвет
                </div>
                <ColorPicker value={newTaskColor} onChange={setNewTaskColor} />
              </div>
              <div>
                <div className="mb-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                  Длительность
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setNewTaskDurationMin((min) => Math.max(15, min - 15))}
                  >
                    <Minus className="h-3.5 w-3.5" />
                    15 мин
                  </Button>
                  <div className="min-w-[60px] text-center text-sm">
                    {Math.floor(newTaskDurationMin / 60)}ч {newTaskDurationMin % 60}м
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setNewTaskDurationMin((min) => min + 15)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    15 мин
                  </Button>
                </div>
              </div>
              <Button size="sm" className="w-full" onClick={onAddTask}>
                Добавить
              </Button>
            </PopoverContent>
          </Popover>
          <div className="flex">
            <Button
              variant="outline"
              size="sm"
              onClick={() => addSlotToToday()}
              className="flex-1 rounded-r-none"
            >
              <CalendarPlus className="h-3.5 w-3.5" />
              Добавить слот
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-9 rounded-l-none border-l-0 px-0"
                  aria-label="Выбрать длительность слота"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {slotDurations.map((duration) => (
                  <DropdownMenuItem
                    key={duration.minutes}
                    onClick={() => addSlotToToday(duration.minutes)}
                  >
                    {duration.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <div className="scrollbar-thin flex-1 space-y-1 overflow-y-auto p-2">
        {templates.length === 0 && (
          <div className="px-2 py-8 text-center text-xs text-slate-400 dark:text-slate-500">
            Пока пусто.<br />Нажмите «Добавить задачу».
          </div>
        )}
        {templates.map((t) => (
          <TemplateItem key={t.id} task={t} />
        ))}
      </div>
      <div className="flex items-center gap-1.5 border-t border-slate-200 p-2 dark:border-slate-800">
        <Button variant="ghost" size="xs" onClick={onImport} className="flex-1">
          <Upload className="h-3.5 w-3.5" />
          Загрузить JSON
        </Button>
        <Button variant="ghost" size="xs" onClick={onExport} className="flex-1">
          <Download className="h-3.5 w-3.5" />
          Выгрузить JSON
        </Button>
      </div>
    </aside>
  )
}
