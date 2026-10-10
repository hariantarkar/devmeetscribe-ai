import { useMemo, useState } from 'react'
import { Loader2, Plus, Search } from 'lucide-react'
import { formatDate } from '../api'

export default function MeetingList({ meetings, loading, selectedId, analyzingId, onSelect, onNew }) {
  const [query, setQuery] = useState('')

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? meetings.filter((m) => m.title.toLowerCase().includes(q)) : meetings
  }, [meetings, query])

  return (
    <section
      aria-label="Meeting list"
      className="flex max-h-[22rem] min-h-0 flex-col gap-4 border-b border-ink-800 bg-ink-900 p-4 lg:max-h-none lg:border-b-0 lg:border-r"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight">Meetings</h2>
        <button
          type="button"
          onClick={onNew}
          className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-accent-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-500"
        >
          <Plus className="size-4" aria-hidden="true" />
          New meeting
        </button>
      </div>

      <label className="relative block">
        <span className="sr-only">Search meetings</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-500" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search meetings"
          className="w-full rounded-lg border border-ink-700 bg-ink-950 py-2 pl-9 pr-3 text-sm placeholder:text-ink-500"
        />
      </label>

      <nav aria-label="Meetings" className="scroll-thin -mx-1 min-h-0 flex-1 overflow-y-auto px-1">
        {loading && <p className="px-2 py-3 text-sm text-ink-500">Loading meetings</p>}

        {!loading && meetings.length === 0 && (
          <p className="px-2 py-3 text-sm text-ink-300">
            No meetings yet. Add a transcript to get a summary, decisions and tasks.
          </p>
        )}

        {!loading && meetings.length > 0 && visible.length === 0 && (
          <p className="px-2 py-3 text-sm text-ink-300">No meeting matches “{query}”.</p>
        )}

        <ul className="flex flex-col gap-1">
          {visible.map((m) => {
            const active = m.id === selectedId
            return (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => onSelect(m.id)}
                  aria-current={active ? 'true' : undefined}
                  className={`w-full rounded-lg px-3 py-2.5 text-left ${
                    active ? 'bg-ink-800 ring-1 ring-ink-700' : 'hover:bg-ink-850'
                  }`}
                >
                  <span className="block truncate text-sm font-medium">{m.title}</span>
                  <span className="mt-0.5 flex items-center justify-between gap-2 text-xs text-ink-500">
                    <span>{formatDate(m.createdAt)}</span>
                    {analyzingId === m.id ? (
                      <span className="inline-flex items-center gap-1 text-accent-300">
                        <Loader2 className="size-3 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                        Analyzing
                      </span>
                    ) : (
                      <span className={m.status === 'ANALYZED' ? 'text-ok' : ''}>
                        {m.status === 'ANALYZED' ? 'Analyzed' : 'Not analyzed'}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </section>
  )
}
