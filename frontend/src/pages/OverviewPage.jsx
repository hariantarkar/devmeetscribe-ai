import { useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { api, formatDate } from '../api'

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border border-ink-800 bg-ink-900 p-4">
      <p className="text-sm text-ink-300">{label}</p>
      <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight">{value}</p>
    </div>
  )
}

export default function OverviewPage({ meetings, loading, onOpenMeeting, onNew, onGoTasks }) {
  // undefined = loading, null = failed, array = loaded
  const [tasks, setTasks] = useState(undefined)

  useEffect(() => {
    let cancelled = false
    api
      .listTasks()
      .then((t) => !cancelled && setTasks(t))
      .catch(() => !cancelled && setTasks(null))
    return () => {
      cancelled = true
    }
  }, [])

  const titles = useMemo(() => Object.fromEntries(meetings.map((m) => [m.id, m.title])), [meetings])
  const open = tasks ? tasks.filter((t) => t.status !== 'DONE') : []
  const count = (n) => (tasks === undefined || tasks === null ? '–' : n)

  return (
    <div className="mx-auto max-w-5xl p-6 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
          <p className="mt-1 text-sm text-ink-300">Your meetings, decisions and tasks at a glance.</p>
        </div>
        <button
          type="button"
          onClick={onNew}
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-accent-500"
        >
          <Plus className="size-4" aria-hidden="true" />
          New meeting
        </button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Meetings" value={loading ? '–' : meetings.length} />
        <Stat label="Analyzed" value={loading ? '–' : meetings.filter((m) => m.status === 'ANALYZED').length} />
        <Stat label="Open tasks" value={count(open.length)} />
        <Stat label="Completed tasks" value={count(tasks ? tasks.length - open.length : 0)} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section aria-labelledby="recent-heading" className="rounded-xl border border-ink-800 bg-ink-900 p-4">
          <h2 id="recent-heading" className="mb-2 text-base font-semibold">Recent meetings</h2>
          {meetings.length === 0 ? (
            <p className="text-sm text-ink-300">{loading ? 'Loading meetings' : 'No meetings yet. Add your first transcript.'}</p>
          ) : (
            <ul className="flex flex-col">
              {meetings.slice(0, 5).map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => onOpenMeeting(m.id)}
                    className="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-2.5 text-left hover:bg-ink-850"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{m.title}</span>
                      <span className="text-xs text-ink-500">{formatDate(m.createdAt)}</span>
                    </span>
                    <span className={`shrink-0 text-xs ${m.status === 'ANALYZED' ? 'text-ok' : 'text-ink-500'}`}>
                      {m.status === 'ANALYZED' ? 'Analyzed' : 'Not analyzed'}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="open-heading" className="rounded-xl border border-ink-800 bg-ink-900 p-4">
          <div className="mb-2 flex items-baseline justify-between">
            <h2 id="open-heading" className="text-base font-semibold">Open tasks</h2>
            {open.length > 0 && (
              <button type="button" onClick={onGoTasks} className="text-sm text-accent-300 hover:underline">
                View all
              </button>
            )}
          </div>
          {tasks === undefined && <p className="text-sm text-ink-300">Loading tasks</p>}
          {tasks === null && <p className="text-sm text-ink-300">Could not load tasks. Is the backend running?</p>}
          {tasks && open.length === 0 && <p className="text-sm text-ink-300">Nothing open. Tasks from analyzed meetings show up here.</p>}
          {open.length > 0 && (
            <ul className="flex flex-col">
              {open.slice(0, 6).map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => onOpenMeeting(t.meetingId)}
                    className="w-full rounded-lg px-2 py-2.5 text-left hover:bg-ink-850"
                  >
                    <span className="block truncate text-sm">{t.title}</span>
                    <span className="text-xs text-ink-500">
                      {titles[t.meetingId] || 'Meeting'}
                      {t.deadline ? `, due ${t.deadline}` : ''}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
