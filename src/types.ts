export type Task = {
  id: string
  title: string
  emoji?: string
  color: string // ColorDef id
  durationMin: number // default duration when placing onto a day
  note?: string
  noteLink?: string
}

export type ScheduledTask = {
  id: string
  templateId?: string // optional reference to template it was created from
  title: string
  emoji?: string
  color: string
  note?: string
  noteLink?: string
  date: string // YYYY-MM-DD
  startMin: number // 0..1440, multiple of 15
  durationMin: number // multiple of 15
}

export type Settings = {
  preventOverlap: boolean
}

export type PlannerState = {
  startDate: string
  dayCount: number
  templates: Task[]
  scheduled: ScheduledTask[]
  settings: Settings
}
