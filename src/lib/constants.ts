export const HOUR_HEIGHT = 64 // px per hour
export const MIN_HEIGHT = HOUR_HEIGHT / 60
export const SLOT_MIN = 15
export const SLOT_HEIGHT = HOUR_HEIGHT / 4

export const DAY_COL_WIDTH = 220
export const GUTTER_WIDTH = 56
export const HEADER_HEIGHT = 44

export const COMPACT_START_HOUR = 9
export const VISIBLE_END_HOUR = 24

export function getVisibleStartMin(showAllHours: boolean): number {
  return showAllHours ? 0 : COMPACT_START_HOUR * 60
}

export type ColorDef = {
  id: string
  label: string
  bg: string
  border: string
  text: string
  dot: string
}

export const COLORS: ColorDef[] = [
  { id: 'slate',   label: 'Серый',      bg: 'rgba(100,116,139,0.22)', border: '#64748b', text: '#0f172a', dot: '#64748b' },
  { id: 'red',     label: 'Красный',    bg: 'rgba(239,68,68,0.22)',   border: '#ef4444', text: '#7f1d1d', dot: '#ef4444' },
  { id: 'orange',  label: 'Оранжевый',  bg: 'rgba(249,115,22,0.22)',  border: '#f97316', text: '#7c2d12', dot: '#f97316' },
  { id: 'amber',   label: 'Янтарный',   bg: 'rgba(245,158,11,0.22)',  border: '#f59e0b', text: '#78350f', dot: '#f59e0b' },
  { id: 'yellow',  label: 'Жёлтый',     bg: 'rgba(234,179,8,0.22)',   border: '#eab308', text: '#713f12', dot: '#eab308' },
  { id: 'lime',    label: 'Лайм',       bg: 'rgba(132,204,22,0.22)',  border: '#84cc16', text: '#365314', dot: '#84cc16' },
  { id: 'green',   label: 'Зелёный',    bg: 'rgba(34,197,94,0.22)',   border: '#22c55e', text: '#14532d', dot: '#22c55e' },
  { id: 'teal',    label: 'Бирюзовый',  bg: 'rgba(20,184,166,0.22)',  border: '#14b8a6', text: '#134e4a', dot: '#14b8a6' },
  { id: 'cyan',    label: 'Циан',       bg: 'rgba(6,182,212,0.22)',   border: '#06b6d4', text: '#164e63', dot: '#06b6d4' },
  { id: 'sky',     label: 'Небесный',   bg: 'rgba(14,165,233,0.22)',  border: '#0ea5e9', text: '#0c4a6e', dot: '#0ea5e9' },
  { id: 'blue',    label: 'Синий',      bg: 'rgba(59,130,246,0.22)',  border: '#3b82f6', text: '#1e3a8a', dot: '#3b82f6' },
  { id: 'indigo',  label: 'Индиго',     bg: 'rgba(99,102,241,0.22)',  border: '#6366f1', text: '#312e81', dot: '#6366f1' },
  { id: 'violet',  label: 'Фиолетовый', bg: 'rgba(139,92,246,0.22)',  border: '#8b5cf6', text: '#4c1d95', dot: '#8b5cf6' },
  { id: 'fuchsia', label: 'Фуксия',     bg: 'rgba(217,70,239,0.22)',  border: '#d946ef', text: '#701a75', dot: '#d946ef' },
  { id: 'pink',    label: 'Розовый',    bg: 'rgba(236,72,153,0.22)',  border: '#ec4899', text: '#831843', dot: '#ec4899' },
  { id: 'rose',    label: 'Алый',       bg: 'rgba(244,63,94,0.22)',   border: '#f43f5e', text: '#881337', dot: '#f43f5e' },
]

export const COLOR_BY_ID: Record<string, ColorDef> = Object.fromEntries(
  COLORS.map((c) => [c.id, c]),
)

export const DEFAULT_COLOR = 'sky'
export const DEFAULT_SLOT_COLOR = 'slate'

export function getColor(id: string): ColorDef {
  return COLOR_BY_ID[id] ?? COLOR_BY_ID[DEFAULT_COLOR]
}

export const EMOJIS = [
  // Главные занятия: работа, учёба, мышление
  '💼','📚','💻','📝','🎨','💡','🎯','🧪',
  // Главные занятия: тело и здоровье
  '🏃','🧘','🏋️','🚲','💃','🏥','💊','🐾',
  // Главные занятия: быт, связь, отношения
  '🛒','🧹','🚗','🔧','📞','💬','📧','❤️',
  // Праздники + еда
  '🎉','🎂','🥪','🍽️','☕','🥗','📖','🎮',
  // Медиа + туризм
  '📺','🎵','🎬','✈️','🌊','🌳','🏔️','🗽',
  // Дом и сон
  '☀️','🌙','🏠','🧸','😴','🛌','⏰',
]
