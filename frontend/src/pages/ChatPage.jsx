export default function ChatPage({ onGoMeetings }) {
  return (
    <div className="mx-auto max-w-2xl p-6 lg:p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Chat with your meetings</h1>
      <div className="mt-5 rounded-xl border border-dashed border-ink-700 p-6">
        <h2 className="text-base font-semibold">Coming next</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-300">
          Ask questions such as “What did we decide about the database?” or “Which tasks are still pending?” and
          get answers with the matching lines from the transcript, so you can verify them.
        </p>
        <button
          type="button"
          onClick={onGoMeetings}
          className="mt-4 rounded-lg border border-ink-700 px-3.5 py-2 text-sm hover:bg-ink-800"
        >
          Back to meetings
        </button>
      </div>
    </div>
  )
}
