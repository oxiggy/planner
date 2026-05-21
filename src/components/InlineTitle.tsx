import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

type Props = {
  value: string
  onChange: (v: string) => void
  className?: string
  placeholder?: string
}

export function InlineTitle({ value, onChange, className, placeholder = 'Без названия' }: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setDraft(value)
  }, [value])

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  const commit = () => {
    const v = draft.trim()
    if (v !== value) onChange(v)
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onPointerDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            commit()
          } else if (e.key === 'Escape') {
            setDraft(value)
            setEditing(false)
          }
        }}
        placeholder={placeholder}
        className={cn(
          'min-w-0 flex-1 rounded bg-white/70 px-1 text-inherit outline-none ring-1 ring-slate-400 placeholder:text-slate-400',
          className,
        )}
      />
    )
  }

  return (
    <span
      onClick={(e) => {
        e.stopPropagation()
        setEditing(true)
      }}
      onPointerDown={(e) => e.stopPropagation()}
      className={cn(
        'min-w-0 flex-1 cursor-text truncate rounded px-1 hover:bg-black/5',
        !value && 'italic text-slate-400',
        className,
      )}
      title={value || placeholder}
    >
      {value || placeholder}
    </span>
  )
}
