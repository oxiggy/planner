import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useStore } from '@/store'
import { CalendarDays, Upload, Download, Layers } from 'lucide-react'
import { download, pickFile, readFile, type PlannerExport } from '@/lib/json-io'
import type { ScheduledTask } from '@/types'

export function Toolbar() {
  const startDate = useStore((s) => s.startDate)
  const dayCount = useStore((s) => s.dayCount)
  const preventOverlap = useStore((s) => s.settings.preventOverlap)
  const setStartDate = useStore((s) => s.setStartDate)
  const setDayCount = useStore((s) => s.setDayCount)
  const setPreventOverlap = useStore((s) => s.setPreventOverlap)
  const scheduled = useStore((s) => s.scheduled)
  const importPlanner = useStore((s) => s.importPlanner)

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

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4">
      <div className="flex items-center gap-2 font-semibold">
        <CalendarDays className="h-5 w-5 text-slate-700" />
        <span>Vibe Planner</span>
      </div>
      <div className="ml-4 flex items-center gap-2">
        <label className="text-xs text-slate-600">С даты</label>
        <Input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="h-8 w-[150px]"
        />
        <label className="text-xs text-slate-600">Дней</label>
        <Input
          type="number"
          min={1}
          max={60}
          value={dayCount}
          onChange={(e) => setDayCount(Number(e.target.value))}
          className="h-8 w-[80px]"
        />
      </div>
      <label className="ml-2 flex cursor-pointer items-center gap-1.5 text-xs text-slate-600">
        <input
          type="checkbox"
          checked={preventOverlap}
          onChange={(e) => setPreventOverlap(e.target.checked)}
          className="h-3.5 w-3.5"
        />
        <Layers className="h-3.5 w-3.5" />
        Запретить пересечения
      </label>
      <div className="ml-auto flex items-center gap-1.5">
        <Button variant="outline" size="sm" onClick={onImport}>
          <Upload className="h-3.5 w-3.5" />
          Загрузить JSON
        </Button>
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="h-3.5 w-3.5" />
          Выгрузить JSON
        </Button>
      </div>
    </header>
  )
}
