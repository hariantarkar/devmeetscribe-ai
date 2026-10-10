import { useEffect, useRef, useState } from 'react'

/**
 * Click-to-edit text. Enter or blur saves, Escape cancels.
 * Shows `placeholder` (as a quiet button) when the value is empty.
 */
export default function InlineEdit({ value, placeholder, onSave, className = '', inputClassName = '', label }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value || '')
  const inputRef = useRef(null)

  useEffect(() => {
    if (editing) inputRef.current?.select()
  }, [editing])

  function start() {
    setDraft(value || '')
    setEditing(true)
  }

  function commit() {
    setEditing(false)
    const next = draft.trim()
    if (next !== (value || '')) onSave(next)
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        aria-label={label}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur()
          if (e.key === 'Escape') setEditing(false)
        }}
        className={`min-w-0 rounded-md border border-ink-700 bg-ink-950 px-1.5 py-0.5 text-inherit ${inputClassName}`}
      />
    )
  }

  return (
    <button
      type="button"
      onClick={start}
      aria-label={label}
      className={`cursor-text rounded-md px-1.5 py-0.5 text-left hover:bg-ink-700/60 ${value ? '' : 'text-ink-500'} ${className}`}
    >
      {value || placeholder}
    </button>
  )
}
