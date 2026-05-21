import { Button } from '@/components/ui/button'
import { useStore } from '@/store'
import { Plus, CalendarPlus, Upload, Download } from 'lucide-react'
import { TemplateItem } from './TemplateItem'
import { download, pickFile, readFile, type TemplatesExport } from '@/lib/json-io'

export function Sidebar() {
  const templates = useStore((s) => s.templates)
  const addTemplate = useStore((s) => s.addTemplate)
  const addSlotToToday = useStore((s) => s.addSlotToToday)
  const importTemplates = useStore((s) => s.importTemplates)

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
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Задачи
        </div>
        <div className="flex flex-col gap-1.5">
          <Button variant="outline" size="sm" onClick={() => addTemplate()}>
            <Plus className="h-3.5 w-3.5" />
            Добавить задачу
          </Button>
          <Button variant="outline" size="sm" onClick={addSlotToToday}>
            <CalendarPlus className="h-3.5 w-3.5" />
            Добавить слот
          </Button>
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
