import { useEffect, useMemo, useState } from 'react'
import { api } from '../api'
import { TaskRow } from '../components/TaskPanel'

const FILTERS = [
  { id: 'open', label: 'Open' },
  { id: 'done', label: 'Done' },
  { id: 'all', label: 'All' },
]

export default function TasksPage({ meetings, onOpenMeeting, onError }) {
  const [tasks, setTasks] = useState(undefined) // undefined = loading, null = failed
  const [filter, setFilter] = useState('open')

  useEffect(() => {
    let cancelled = false
    api
      .listTasks()
      .then((t) => !cancelled && setTasks(t))
      .catch((e) => {
        if (!cancelled) {
          setTasks(null)
          onError(e.message)
        }
      })
    return () => {
      cancelled = true
    }
  }, [onError])

  const titles = useMemo(() => Object.fromEntries(meetings.map((m) => [m.id, m.title])), [meetings])

  const isDone = (t) => t.status === 'DONE'
  const counts = tasks
    ? { open: tasks.filter((t) => !isDone(t)).length, done: tasks.filter(isDone).length, all: tasks.length }
    : { open: 0, done: 0, all: 0 }
  const visible = (tasks || []).filter((t) => (filter === 'all' ? true : filter === 'done' ? isDone(t) : !isDone(t)))

  async function update(id, changes) {
    try {
      const updated = await api.updateTask(id, changes)
      setTasks((all) => all.map((t) => (t.id === id ? updated : t)))
    } catch (e) {
      onError(e.message)
    }
  }

  async function remove(id) {
    try {
      await api.deleteTask(id)
      setTasks((all) => all.filter((t) => t.id !== id))
    } catch (e) {
      onError(e.message)
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-6 lg:p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
      <p className="mt-1 text-sm text-ink-300">Action items from all your meetings. Click a field to edit it.</p>

      <div role="tablist" aria-label="Task filter" className="mt-5 inline-flex gap-1 rounded-lg bg-ink-900 p-1">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              filter === f.id ? 'bg-ink-800 text-ink-100' : 'text-ink-300 hover:text-ink-100'
            }`}
          >
            {f.label} <span className="text-ink-500">{counts[f.id]}</span>
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tasks === undefined && <p className="text-sm text-ink-300">Loading tasks</p>}
        {tasks === null && <p className="text-sm text-ink-300">Could not load tasks. Is the backend running?</p>}
        {tasks && visible.length === 0 && (
          <p className="rounded-xl border border-dashed border-ink-700 p-6 text-sm text-ink-300">
            {filter === 'done' ? 'No completed tasks yet.' : filter === 'open' ? 'No open tasks. Nice.' : 'No tasks yet. Analyze a meeting to create some.'}
          </p>
        )}
        {visible.length > 0 && (
          <ul className="flex flex-col rounded-xl border border-ink-800 bg-ink-900 p-2">
            {visible.map((t) => (
              <TaskRow
                key={t.id}
                task={t}
                onUpdate={update}
                onDelete={remove}
                meetingTitle={titles[t.meetingId] || 'Meeting'}
                onOpenMeeting={onOpenMeeting}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
