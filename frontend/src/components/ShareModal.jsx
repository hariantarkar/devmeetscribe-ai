import { useEffect, useRef, useState } from 'react'
import { Check, Copy, Loader2, Mail, Printer, Sparkles, X } from 'lucide-react'
import { api } from '../api'
import { printReport, reportText } from '../lib/report'

const TONES = [
  { id: 'professional', label: 'Professional' },
  { id: 'friendly', label: 'Friendly' },
  { id: 'brief', label: 'Brief' },
]

// Most mail apps cut off mailto links after about 2,000 characters.
const MAILTO_LIMIT = 1900

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

function CopyButton({ done, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg border border-ink-700 px-3.5 py-2 text-sm hover:bg-ink-800"
    >
      {done ? <Check className="size-4 text-ok" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
      {done ? 'Copied' : children}
    </button>
  )
}

export default function ShareModal({ meeting, onClose, onError }) {
  const [tab, setTab] = useState('email')
  const [tone, setTone] = useState('professional')
  const [draft, setDraft] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [includeTranscript, setIncludeTranscript] = useState(false)
  const [copied, setCopied] = useState(null)
  const firstTab = useRef(null)

  useEffect(() => {
    firstTab.current?.focus()
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function generate() {
    setGenerating(true)
    try {
      setDraft(await api.draftEmail(meeting.id, tone))
    } catch (e) {
      onError(e.message)
    } finally {
      setGenerating(false)
    }
  }

  async function copy(text, key) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)
      setTimeout(() => setCopied(null), 1800)
    } catch {
      onError('Could not copy. Select the text and copy it manually.')
    }
  }

  const mailto = draft
    ? `mailto:?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}`
    : ''
  const report = reportText(meeting, { includeTranscript })

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 sm:items-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-heading"
        className="flex max-h-full w-full max-w-2xl flex-col gap-4 overflow-y-auto rounded-t-2xl border border-ink-700 bg-ink-900 p-6 sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 id="share-heading" className="text-xl font-semibold tracking-tight">Share this meeting</h2>
            <p className="mt-0.5 truncate text-sm text-ink-300">{meeting.title}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1 text-ink-300 hover:text-ink-100">
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div role="tablist" aria-label="Share options" className="inline-flex gap-1 self-start rounded-lg bg-ink-950 p-1">
          <span ref={firstTab} tabIndex={-1} />
          <Tab active={tab === 'email'} onClick={() => setTab('email')}>Follow-up email</Tab>
          <Tab active={tab === 'report'} onClick={() => setTab('report')}>Report</Tab>
        </div>

        {tab === 'email' && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-end gap-3">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">Tone</span>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="rounded-lg border border-ink-700 bg-ink-950 px-3 py-2 text-sm [color-scheme:light]"
                >
                  {TONES.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={generate}
                disabled={generating}
                className="inline-flex items-center gap-1.5 rounded-lg bg-accent-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-accent-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {generating ? (
                  <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                ) : (
                  <Sparkles className="size-4" aria-hidden="true" />
                )}
                {generating ? 'Writing' : draft ? 'Write again' : 'Write email'}
              </button>
            </div>

            {!draft && !generating && (
              <p className="rounded-xl border border-dashed border-ink-700 p-5 text-sm leading-relaxed text-ink-300">
                The email is written from this meeting&rsquo;s summary, decisions and open tasks. You can edit it
                before using it, and nothing is sent from here.
              </p>
            )}

            {generating && (
              <p className="text-sm text-ink-300" role="status">Llama 3.2 is writing the draft. This can take a few seconds.</p>
            )}

            {draft && (
              <>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium">Subject</span>
                  <input
                    value={draft.subject}
                    onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
                    className="w-full rounded-lg border border-ink-700 bg-ink-950 px-3 py-2 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium">Message</span>
                  <textarea
                    value={draft.body}
                    onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                    rows={12}
                    className="scroll-thin w-full resize-y rounded-lg border border-ink-700 bg-ink-950 px-3 py-2 text-sm leading-relaxed"
                  />
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <CopyButton done={copied === 'email'} onClick={() => copy(`Subject: ${draft.subject}\n\n${draft.body}`, 'email')}>
                    Copy email
                  </CopyButton>
                  {mailto.length <= MAILTO_LIMIT ? (
                    <a
                      href={mailto}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-ink-700 px-3.5 py-2 text-sm hover:bg-ink-800"
                    >
                      <Mail className="size-4" aria-hidden="true" />
                      Open in email app
                    </a>
                  ) : (
                    <span className="text-sm text-ink-500">Too long for an email link. Use Copy email.</span>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {tab === 'report' && (
          <div className="flex flex-col gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={includeTranscript}
                onChange={(e) => setIncludeTranscript(e.target.checked)}
                className="size-4 accent-accent-500"
              />
              Include the full transcript
            </label>

            <pre className="scroll-thin max-h-72 overflow-auto whitespace-pre-wrap rounded-xl border border-ink-800 bg-ink-950 p-4 font-sans text-sm leading-relaxed">
              {report}
            </pre>

            <div className="flex flex-wrap items-center gap-2">
              <CopyButton done={copied === 'report'} onClick={() => copy(report, 'report')}>
                Copy text
              </CopyButton>
              <button
                type="button"
                onClick={() => printReport(meeting, { includeTranscript })}
                className="inline-flex items-center gap-1.5 rounded-lg bg-accent-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-accent-500"
              >
                <Printer className="size-4" aria-hidden="true" />
                Print or save as PDF
              </button>
            </div>
            <p className="text-xs text-ink-500">In the print window, choose &ldquo;Save as PDF&rdquo; as the destination.</p>
          </div>
        )}
      </div>
    </div>
  )
}
