import type { PlannerState } from '../types'

const KEY = 'vibe-planner-v1'

export function loadState(): Partial<PlannerState> | null {
  try {
    const s = localStorage.getItem(KEY)
    if (!s) return null
    return JSON.parse(s)
  } catch {
    return null
  }
}

export function saveState(state: PlannerState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // ignore quota or serialization errors
  }
}
