import { create } from 'zustand'
import type { PlannerState, ScheduledTask, Task, Theme } from './types'
import { DEFAULT_COLOR, DEFAULT_SLOT_COLOR } from './lib/constants'
import { loadState, saveState } from './lib/storage'
import { uid } from './lib/utils'
import { snapToSlot, todayStr } from './lib/time'

export type DragPreview = {
  date: string
  startMin: number
  durationMin: number
}

type Store = PlannerState & {
  dragPreview: DragPreview | null
  setDragPreview: (p: DragPreview | null) => void
  showPastDays: boolean
  setShowPastDays: (b: boolean) => void

  setStartDate: (s: string) => void
  setDayCount: (n: number) => void
  setPreventOverlap: (b: boolean) => void
  setShowAllHours: (b: boolean) => void
  setTheme: (t: Theme) => void

  addTemplate: (init?: Partial<Task>) => Task
  updateTemplate: (id: string, patch: Partial<Task>) => void
  deleteTemplate: (id: string) => void
  reorderTemplate: (activeId: string, overId: string) => void

  addScheduledFromTemplate: (
    templateId: string,
    date: string,
    startMin: number,
  ) => ScheduledTask | null
  addScheduled: (block: Omit<ScheduledTask, 'id'>) => ScheduledTask | null
  updateScheduled: (id: string, patch: Partial<ScheduledTask>) => void
  deleteScheduled: (id: string) => void
  moveScheduled: (id: string, date: string, startMin: number) => boolean
  copyScheduled: (id: string, date: string, startMin: number) => ScheduledTask | null
  resizeScheduled: (id: string, durationMin: number) => boolean
  clearTemplates: () => void
  clearPlanner: () => void

  importTemplates: (templates: Task[]) => void
  importPlanner: (p: { startDate: string; dayCount: number; scheduled: ScheduledTask[] }) => void

  addSlotToToday: (durationMin?: number) => void
}

function conflictsWith(
  scheduled: ScheduledTask[],
  date: string,
  startMin: number,
  durationMin: number,
  ignoreId?: string,
): boolean {
  const end = startMin + durationMin
  for (const s of scheduled) {
    if (s.id === ignoreId) continue
    if (s.date !== date) continue
    const sEnd = s.startMin + s.durationMin
    if (startMin < sEnd && s.startMin < end) return true
  }
  return false
}

function defaultState(): PlannerState {
  return {
    startDate: todayStr(),
    dayCount: 7,
    templates: [],
    scheduled: [],
    settings: { preventOverlap: false, showAllHours: false, theme: 'light' },
  }
}

const initial = (() => {
  const def = defaultState()
  const loaded = loadState()
  if (!loaded) return def
  return {
    ...def,
    ...loaded,
    settings: { ...def.settings, ...(loaded.settings ?? {}) },
    templates: loaded.templates ?? def.templates,
    scheduled: loaded.scheduled ?? def.scheduled,
  }
})()

export const useStore = create<Store>((set, get) => {
  const persist = () => {
    const s = get()
    saveState({
      startDate: s.startDate,
      dayCount: s.dayCount,
      templates: s.templates,
      scheduled: s.scheduled,
      settings: s.settings,
    })
  }

  return {
    ...initial,

    dragPreview: null,
    setDragPreview(p) {
      set({ dragPreview: p })
    },
    showPastDays: false,
    setShowPastDays(b) {
      set({ showPastDays: b })
    },

    setStartDate(startDate) {
      set({ startDate })
      persist()
    },
    setDayCount(n) {
      set({ dayCount: Math.max(1, Math.min(60, Math.round(n) || 1)) })
      persist()
    },
    setPreventOverlap(b) {
      set((state) => ({ settings: { ...state.settings, preventOverlap: b } }))
      persist()
    },
    setShowAllHours(b) {
      set((state) => ({ settings: { ...state.settings, showAllHours: b } }))
      persist()
    },
    setTheme(t) {
      set((state) => ({ settings: { ...state.settings, theme: t } }))
      persist()
    },

    addTemplate(init) {
      const t: Task = {
        id: uid(),
        title: init?.title ?? '',
        emoji: init?.emoji,
        color: init?.color ?? DEFAULT_COLOR,
        durationMin: init?.durationMin ?? 60,
        note: init?.note,
        noteLink: init?.noteLink,
      }
      set((state) => ({ templates: [...state.templates, t] }))
      persist()
      return t
    },
    updateTemplate(id, patch) {
      set((state) => ({
        templates: state.templates.map((t) => (t.id === id ? { ...t, ...patch } : t)),
      }))
      persist()
    },
    deleteTemplate(id) {
      set((state) => ({ templates: state.templates.filter((t) => t.id !== id) }))
      persist()
    },
    reorderTemplate(activeId, overId) {
      if (activeId === overId) return
      set((state) => {
        const from = state.templates.findIndex((t) => t.id === activeId)
        const to = state.templates.findIndex((t) => t.id === overId)
        if (from === -1 || to === -1) return state
        const next = state.templates.slice()
        const [moved] = next.splice(from, 1)
        next.splice(to, 0, moved)
        return { templates: next }
      })
      persist()
    },

    addScheduledFromTemplate(templateId, date, startMin) {
      const tpl = get().templates.find((t) => t.id === templateId)
      if (!tpl) return null
      return get().addScheduled({
        templateId: tpl.id,
        title: tpl.title,
        emoji: tpl.emoji,
        color: tpl.color,
        note: tpl.note,
        noteLink: tpl.noteLink,
        date,
        startMin: snapToSlot(startMin),
        durationMin: tpl.durationMin,
      })
    },

    addScheduled(block) {
      const s = get()
      const startMin = snapToSlot(block.startMin)
      const dur = Math.max(15, snapToSlot(block.durationMin))
      if (startMin + dur > 1440) return null
      if (s.settings.preventOverlap && conflictsWith(s.scheduled, block.date, startMin, dur)) {
        return null
      }
      const newBlock: ScheduledTask = { ...block, id: uid(), startMin, durationMin: dur }
      set((state) => ({ scheduled: [...state.scheduled, newBlock] }))
      persist()
      return newBlock
    },

    updateScheduled(id, patch) {
      set((state) => ({
        scheduled: state.scheduled.map((b) => (b.id === id ? { ...b, ...patch } : b)),
      }))
      persist()
    },

    deleteScheduled(id) {
      set((state) => ({ scheduled: state.scheduled.filter((b) => b.id !== id) }))
      persist()
    },

    moveScheduled(id, date, startMin) {
      const s = get()
      const block = s.scheduled.find((b) => b.id === id)
      if (!block) return false
      const snapped = snapToSlot(startMin)
      if (snapped + block.durationMin > 1440 || snapped < 0) return false
      if (
        s.settings.preventOverlap &&
        conflictsWith(s.scheduled, date, snapped, block.durationMin, id)
      ) {
        return false
      }
      set((state) => ({
        scheduled: state.scheduled.map((b) =>
          b.id === id ? { ...b, date, startMin: snapped } : b,
        ),
      }))
      persist()
      return true
    },

    copyScheduled(id, date, startMin) {
      const block = get().scheduled.find((b) => b.id === id)
      if (!block) return null
      const { id: _id, ...copy } = block
      return get().addScheduled({
        ...copy,
        date,
        startMin,
      })
    },

    resizeScheduled(id, durationMin) {
      const s = get()
      const block = s.scheduled.find((b) => b.id === id)
      if (!block) return false
      const dur = Math.max(15, snapToSlot(durationMin))
      if (block.startMin + dur > 1440) return false
      if (
        s.settings.preventOverlap &&
        conflictsWith(s.scheduled, block.date, block.startMin, dur, id)
      ) {
        return false
      }
      set((state) => ({
        scheduled: state.scheduled.map((b) => (b.id === id ? { ...b, durationMin: dur } : b)),
      }))
      persist()
      return true
    },

    clearTemplates() {
      set({ templates: [] })
      persist()
    },

    clearPlanner() {
      set({ scheduled: [] })
      persist()
    },

    importTemplates(templates) {
      const cleaned: Task[] = (templates ?? []).map((t) => ({
        id: t.id || uid(),
        title: t.title ?? '',
        emoji: t.emoji,
        color: t.color || DEFAULT_COLOR,
        durationMin: t.durationMin || 60,
        note: t.note,
        noteLink: t.noteLink,
      }))
      set({ templates: cleaned })
      persist()
    },

    importPlanner(p) {
      const cleaned: ScheduledTask[] = (p.scheduled ?? []).map((b) => ({
        id: b.id || uid(),
        templateId: b.templateId,
        title: b.title ?? '',
        emoji: b.emoji,
        color: b.color || DEFAULT_COLOR,
        note: b.note,
        noteLink: b.noteLink,
        date: b.date,
        startMin: snapToSlot(b.startMin),
        durationMin: Math.max(15, snapToSlot(b.durationMin)),
      }))
      set({
        startDate: p.startDate || todayStr(),
        dayCount: Math.max(1, Math.min(60, p.dayCount || 7)),
        scheduled: cleaned,
      })
      persist()
    },

    addSlotToToday(durationMin = 60) {
      const today = todayStr()
      const dur = Math.max(15, snapToSlot(durationMin))
      const s = get()
      const now = new Date()
      let baseMin = now.getHours() * 60 + now.getMinutes()
      if (baseMin < 9 * 60) baseMin = 9 * 60
      baseMin = snapToSlot(baseMin)
      for (let m = baseMin; m + dur <= 1440; m += 15) {
        if (!conflictsWith(s.scheduled, today, m, dur)) {
          get().addScheduled({
            title: '',
            color: DEFAULT_SLOT_COLOR,
            date: today,
            startMin: m,
            durationMin: dur,
          })
          return
        }
      }
    },
  }
})
