import MeetingList from '../components/MeetingList'
import MeetingView from '../components/MeetingView'
import TaskPanel from '../components/TaskPanel'

export default function MeetingsPage({
  meetings, loading, selectedId, detail, analyzingId,
  onSelect, onNew, onAnalyze, onDelete, onAddTask, onUpdateTask, onDeleteTask,
}) {
  return (
    <div className="grid grid-cols-1 lg:h-full lg:grid-cols-[17rem_minmax(0,1fr)] lg:grid-rows-1 xl:grid-cols-[17rem_minmax(0,1fr)_21rem]">
      <MeetingList
        meetings={meetings}
        loading={loading}
        selectedId={selectedId}
        analyzingId={analyzingId}
        onSelect={onSelect}
        onNew={onNew}
      />

      {detail ? (
        <div className="min-w-0 lg:overflow-y-auto xl:contents">
          <MeetingView
            key={detail.id}
            meeting={detail}
            analyzing={analyzingId === detail.id}
            onAnalyze={() => onAnalyze(detail.id)}
            onDelete={onDelete}
          />
          <TaskPanel meeting={detail} onAddTask={onAddTask} onUpdateTask={onUpdateTask} onDeleteTask={onDeleteTask} />
        </div>
      ) : (
        <div className="flex items-center justify-center p-8 xl:col-span-2">
          <div className="max-w-sm text-center">
            <h2 className="text-xl font-semibold tracking-tight">
              {loading || selectedId != null ? 'Loading meeting' : 'Add your first meeting'}
            </h2>
            {!loading && selectedId == null && (
              <>
                <p className="mt-2 text-sm leading-relaxed text-ink-300">
                  Paste a transcript and get a summary, decisions and action items you can edit.
                </p>
                <button
                  type="button"
                  onClick={onNew}
                  className="mt-5 rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white hover:bg-accent-500"
                >
                  New meeting
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
