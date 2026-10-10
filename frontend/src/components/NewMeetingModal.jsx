import { useEffect, useRef, useState } from 'react'
import { Loader2, X } from 'lucide-react'
import { MAX_TRANSCRIPT_CHARS } from '../api'

export default function NewMeetingModal({ onClose, onCreate }) {
  const [title, setTitle] = useState('')
  const [transcript, setTranscript] = useState('')
  const [analyzeNow, setAnalyzeNow] = useState(true)
  const [saving, setSaving] = useState(false)
  const titleRef = useRef(null)

  useEffect(() => {
    titleRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && !saving && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, saving])

  const tooLong = transcript.length > MAX_TRANSCRIPT_CHARS
  const canSave = title.trim() && transcript.trim() && !tooLong && !saving

  async function submit(e) {
    e.preventDefault()
    if (!canSave) return
    setSaving(true)
    const ok = await onCreate({ title: title.trim(), transcript: transcript.trim(), analyzeNow })
    if (!ok) setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && !saving && onClose()}>
      <form
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-meeting-heading"
        className="flex max-h-full w-full max-w-2xl flex-col gap-4 overflow-y-auto rounded-t-2xl border border-ink-700 bg-ink-900 p-6 sm:rounded-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 id="new-meeting-heading" className="text-xl font-semibold tracking-tight">New meeting</h2>
          <button type="button" onClick={onClose} disabled={saving} aria-label="Close" className="rounded-md p-1 text-ink-300 hover:text-ink-100">
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Title</span>
          <input
            ref={titleRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={255}
            placeholder="Sprint sync"
            className="w-full rounded-lg border border-ink-700 bg-ink-950 px-3 py-2 placeholder:text-ink-500"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 flex items-baseline justify-between text-sm font-medium">
            Transcript
            <span className={`text-xs font-normal ${tooLong ? 'text-bad' : 'text-ink-500'}`}>
              {transcript.length.toLocaleString()} / {MAX_TRANSCRIPT_CHARS.toLocaleString()}
            </span>
          </span>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={10}
            placeholder="Paste the meeting transcript here"
            className="scroll-thin w-full resize-y rounded-lg border border-ink-700 bg-ink-950 px-3 py-2 leading-relaxed placeholder:text-ink-500"
          />
          {tooLong && (
            <span className="mt-1 block text-xs text-bad">
              This transcript is too long. Shorten it to {MAX_TRANSCRIPT_CHARS.toLocaleString()} characters or fewer.
            </span>
          )}
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={analyzeNow} onChange={(e) => setAnalyzeNow(e.target.checked)} className="size-4 accent-accent-500" />
          Analyze right after saving
        </label>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} disabled={saving} className="rounded-lg border border-ink-700 px-4 py-2 text-sm hover:bg-ink-800">
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSave}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white hover:bg-accent-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving && <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
            {analyzeNow ? 'Save and analyze' : 'Save meeting'}
          </button>
        </div>
      </form>
    </div>
  )
}
