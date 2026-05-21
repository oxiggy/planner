import { SLOT_MIN } from './constants'

export function snapToSlot(min: number) {
  return Math.max(0, Math.min(1440, Math.round(min / SLOT_MIN) * SLOT_MIN))
}

export function formatHM(min: number) {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

export function formatDate(d: Date) {
  const y = d.getFullYear()
  const m = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function addDays(dateStr: string, days: number) {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return formatDate(d)
}

export function todayStr() {
  return formatDate(new Date())
}

const WEEKDAYS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
const MONTHS = [
  'янв', 'фев', 'мар', 'апр', 'мая', 'июн',
  'июл', 'авг', 'сен', 'окт', 'ноя', 'дек',
]

export function formatDayHeader(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`
}

export function isToday(dateStr: string) {
  return dateStr === todayStr()
}

export function daysBetween(startDate: string, endDate: string) {
  const start = new Date(startDate + 'T00:00:00').getTime()
  const end = new Date(endDate + 'T00:00:00').getTime()
  return Math.max(0, Math.round((end - start) / 86_400_000))
}

export function rangeDates(startDate: string, count: number): string[] {
  const out: string[] = []
  for (let i = 0; i < count; i++) out.push(addDays(startDate, i))
  return out
}
