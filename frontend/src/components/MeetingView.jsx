import { useState } from 'react'
import { FileText, Loader2, Sparkles, Trash2 } from 'lucide-react'
import { formatDate } from '../api'

function Tab({ active, onClick, children }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 text-sm font-medium ${
        active ? 'bg-ink-800 text-ink-100' : 'text-ink-300 hover:text-ink-100'
      }`}
    >
      {children}
    </button>
  )
}

export default function MeetingView({ meeting, analyzing, onAnalyze, onDelete }) {
  const [tab, setTab] = useState('summary')
  const analyzed = meeting.status === 'ANALYZED'

  return (
    <section className="flex min-h-0 flex-col" aria-label="Meeting notes">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-ink-800 px-6 py-5">
        <div className="min-w-0">
          <h2 className="truncate text-2xl font-semibold tracking-tight">{meeting.title}</h2>
          <p className="mt-1 text-sm text-ink-500">{formatDate(meeting.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onAnalyze}
            disabled={analyzing}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-accent-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {analyzing ? (
              <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
            ) : (
              <Sparkles className="size-4" aria-hidden="true" />
            )}
            {analyzing ? 'Analyzing' : analyzed ? 'Analyze again' : 'Analyze meeting'}
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label="Delete meeting"
            title="Delete meeting"
            className="rounded-lg border border-ink-700 p-2 text-ink-300 hover:border-bad/60 hover:text-bad"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className="px-6 pt-4">
        <div role="tablist" aria-label="Meeting content" className="inline-flex gap-1 rounded-lg bg-ink-900 p-1">
          <Tab active={tab === 'summary'} onClick={() => setTab('summary')}>Summary</Tab>
          <Tab active={tab === 'transcript'} onClick={() => setTab('transcript')}>Transcript</Tab>
        </div>
      </div>

      <div className="scroll-thin min-h-0 flex-1 overflow-y-auto px-6 py-5">
        {tab === 'summary' && (
          <>
            {analyzing && (
              <p className="mb-4 rounded-lg border border-accent-500/30 bg-accent-500/10 px-4 py-3 text-sm text-accent-300" role="status">
                Llama 3.2 is reading the transcript. This can take up to a minute the first time.
              </p>
            )}

            {analyzed ? (
              <div className="max-w-[68ch]">
                <h3 className="mb-2 text-base font-semibold">What happened</h3>
                <p className="leading-relaxed text-ink-100">{meeting.summary || 'The model did not return a summary.'}</p>
              </div>
            ) : (
              !analyzing && (
                <div className="max-w-[52ch] rounded-xl border border-dashed border-ink-700 p-6">
                  <h3 className="text-base font-semibold">This meeting has not been analyzed yet</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-300">
                    Analyze it to get a summary, the decisions that were made and the action items.
                  </p>
                  <button
                    type="button"
                    onClick={onAnalyze}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-accent-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-accent-500"
                  >
                    <Sparkles className="size-4" aria-hidden="true" />
                    Analyze meeting
                  </button>
                </div>
              )
            )}
          </>
        )}

        {tab === 'transcript' && (
          <div className="max-w-[72ch]">
            <p className="mb-3 flex items-center gap-1.5 text-sm text-ink-500">
              <FileText className="size-4" aria-hidden="true" />
              {meeting.transcript.length.toLocaleString()} characters
            </p>
            <p className="whitespace-pre-wrap leading-relaxed text-ink-300">{meeting.transcript}</p>
          </div>
        )}
      </div>
    </section>
  )
}
