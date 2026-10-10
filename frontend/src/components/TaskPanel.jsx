import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import InlineEdit from './InlineEdit'

export function TaskRow({ task, onUpdate, onDelete, meetingTitle, onOpenMeeting }) {
  const done = task.status === 'DONE'
  const lowConfidence = task.confidence != null && task.confidence < 0.6

  return (
    <li className="group rounded-lg px-2 py-2 hover:bg-ink-850">
      <div className="flex items-start gap-2.5">
        <input
          type="checkbox"
          checked={done}
          onChange={() => onUpdate(task.id, { status: done ? 'PENDING' : 'DONE' })}
          aria-label={`Mark "${task.title}" as ${done ? 'not done' : 'done'}`}
          className="mt-1 size-4 shrink-0 accent-accent-500"
        />
        <div className="min-w-0 flex-1">
          <InlineEdit
            value={task.title}
            label="Edit task title"
            onSave={(title) => title && onUpdate(task.id, { title })}
            className={`-ml-1.5 block w-full text-sm ${done ? 'text-ink-500 line-through' : ''}`}
            inputClassName="w-full text-sm"
          />
          <div className="mt-0.5 flex flex-wrap items-center gap-x-1 gap-y-0.5 text-xs">
            {meetingTitle && (
              <button
                type="button"
                onClick={() => onOpenMeeting(task.meetingId)}
                className="-ml-1.5 max-w-[14rem] truncate rounded-md px-1.5 py-0.5 text-accent-300 hover:underline"
              >
                {meetingTitle}
              </button>
            )}
            <InlineEdit
              value={task.assignee}
              placeholder="Add owner"
              label="Edit owner"
              onSave={(assignee) => onUpdate(task.id, { assignee })}
              className="-ml-1.5 text-ink-300"
              inputClassName="w-28 text-xs"
            />
            <InlineEdit
              value={task.deadline}
              placeholder="Add deadline"
              label="Edit deadline"
              onSave={(deadline) => onUpdate(task.id, { deadline })}
              className="text-ink-300"
              inputClassName="w-28 text-xs"
            />
            {lowConfidence && (
              <span className="rounded bg-warn/15 px-1.5 py-0.5 text-warn" title={`AI confidence ${Math.round(task.confidence * 100)}%`}>
                Verify
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => onDelete(task.id)}
          aria-label={`Delete task "${task.title}"`}
          className="rounded-md p-1 text-ink-500 opacity-0 hover:text-bad focus-visible:opacity-100 group-hover:opacity-100"
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      </div>
    </li>
  )
}

export default function TaskPanel({ meeting, onAddTask, onUpdateTask, onDeleteTask }) {
  const [title, setTitle] = useState('')
  const pending = meeting.tasks.filter((t) => t.status !== 'DONE').length

  function submit(e) {
    e.preventDefault()
    const clean = title.trim()
    if (!clean) return
    onAddTask(clean)
    setTitle('')
  }

  return (
    <aside className="scroll-thin flex min-h-0 flex-col gap-4 overflow-y-auto border-t border-ink-800 bg-ink-900 p-4 xl:border-l xl:border-t-0">
      <section aria-labelledby="decisions-heading" className="rounded-xl border border-ink-800 bg-ink-950/40 p-4">
        <h3 id="decisions-heading" className="mb-2 text-base font-semibold">Decisions</h3>
        {meeting.decisions.length === 0 ? (
          <p className="text-sm text-ink-300">
            {meeting.status === 'ANALYZED' ? 'No clear decisions were found in this meeting.' : 'Decisions appear here after analysis.'}
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {meeting.decisions.map((d) => (
              <li key={d.id} className="flex gap-2 text-sm leading-relaxed">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent-400" aria-hidden="true" />
                <span>{d.text}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="tasks-heading" className="rounded-xl border border-ink-800 bg-ink-950/40 p-4">
        <div className="mb-2 flex items-baseline justify-between">
          <h3 id="tasks-heading" className="text-base font-semibold">Tasks</h3>
          {meeting.tasks.length > 0 && <span className="text-xs text-ink-500">{pending} open</span>}
        </div>

        {meeting.tasks.length === 0 ? (
          <p className="mb-2 text-sm text-ink-300">
            {meeting.status === 'ANALYZED' ? 'No tasks were found. You can add one below.' : 'Tasks appear here after analysis, or add your own.'}
          </p>
        ) : (
          <ul className="-mx-2 mb-2 flex flex-col">
            {meeting.tasks.map((t) => (
              <TaskRow key={t.id} task={t} onUpdate={onUpdateTask} onDelete={onDeleteTask} />
            ))}
          </ul>
        )}

        <form onSubmit={submit} className="flex gap-2">
          <label className="min-w-0 flex-1">
            <span className="sr-only">New task</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add a task"
              maxLength={500}
              className="w-full rounded-lg border border-ink-700 bg-ink-950 px-3 py-2 text-sm placeholder:text-ink-500"
            />
          </label>
          <button
            type="submit"
            disabled={!title.trim()}
            aria-label="Add task"
            className="rounded-lg border border-ink-700 px-2.5 text-ink-300 hover:border-accent-500 hover:text-accent-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="size-4" aria-hidden="true" />
          </button>
        </form>
        <p className="mt-2 text-xs text-ink-500">
          Owners and deadlines stay empty unless the transcript names them. Click any field to edit it.
        </p>
      </section>
    </aside>
  )
}
