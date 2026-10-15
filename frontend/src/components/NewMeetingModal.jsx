import { useEffect, useRef, useState } from 'react'
import { Loader2, X } from 'lucide-react'
import { api, MAX_TRANSCRIPT_CHARS } from '../api'
import { formatDuration, formatSize, toWav16kMono } from '../lib/audio'
import AudioCapture from './AudioCapture'

// The backend accepts up to 50 MB by default. 16 kHz WAV is about 1.9 MB per minute.
const MAX_WAV_BYTES = 48 * 1024 * 1024

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

export default function NewMeetingModal({ onClose, onCreate }) {
  const [tab, setTab] = useState('text')
  const [title, setTitle] = useState('')
  const [transcript, setTranscript] = useState('')
  const [analyzeNow, setAnalyzeNow] = useState(true)
  const [saving, setSaving] = useState(false)

  const [audio, setAudio] = useState(null) // { blob, name }
  const [busy, setBusy] = useState('') // progress text while converting or transcribing
  const [elapsed, setElapsed] = useState(0)
  const [audioError, setAudioError] = useState('')
  const [fromAudio, setFromAudio] = useState(false)
  const [whisper, setWhisper] = useState(null) // null = unknown

  const titleRef = useRef(null)
  const working = saving || Boolean(busy)

  useEffect(() => {
    titleRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && !working && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, working])

  useEffect(() => {
    if (!busy) return
    setElapsed(0)
    const id = setInterval(() => setElapsed((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [busy])

  function checkWhisper() {
    setWhisper(null)
    api
      .health()
      .then((h) => setWhisper(h.whisper ?? 'DOWN'))
      .catch(() => setWhisper('DOWN'))
  }

  useEffect(() => {
    if (tab === 'audio') checkWhisper()
  }, [tab])

  const tooLong = transcript.length > MAX_TRANSCRIPT_CHARS
  const canSave = title.trim() && transcript.trim() && !tooLong && !working

  async function submit(e) {
    e.preventDefault()
    if (!canSave) return
    setSaving(true)
    const ok = await onCreate({ title: title.trim(), transcript: transcript.trim(), analyzeNow })
    if (!ok) setSaving(false)
  }

  async function transcribeAudio() {
    setAudioError('')
    try {
      setBusy('Converting the audio')
      const wav = await toWav16kMono(audio.blob)
      if (wav.size > MAX_WAV_BYTES) {
        throw new Error('This audio is too long (about 25 minutes is the limit). Trim it and try again.')
      }
      setBusy('Transcribing with Whisper')
      const { text } = await api.transcribe(wav)
      setTranscript(text)
      setFromAudio(true)
      if (!title.trim()) setTitle(audio.name || 'Voice recording')
      setAudio(null)
      setTab('text')
    } catch (e) {
      setAudioError(e.message)
      checkWhisper()
    } finally {
      setBusy('')
    }
  }

  const whisperDown = tab === 'audio' && whisper !== null && whisper !== 'UP'

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && !working && onClose()}
    >
      <form
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-meeting-heading"
        className="flex max-h-full w-full max-w-2xl flex-col gap-4 overflow-y-auto rounded-t-2xl border border-ink-700 bg-ink-900 p-6 sm:rounded-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 id="new-meeting-heading" className="text-xl font-semibold tracking-tight">New meeting</h2>
          <button type="button" onClick={onClose} disabled={working} aria-label="Close" className="rounded-md p-1 text-ink-300 hover:text-ink-100">
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

        <div role="tablist" aria-label="Meeting source" className="inline-flex gap-1 self-start rounded-lg bg-ink-950 p-1">
          <Tab active={tab === 'text'} onClick={() => !working && setTab('text')}>Transcript</Tab>
          <Tab active={tab === 'audio'} onClick={() => !working && setTab('audio')}>Audio</Tab>
        </div>

        {tab === 'text' && (
          <label className="block">
            <span className="mb-1.5 flex items-baseline justify-between text-sm font-medium">
              Transcript
              <span className={`text-xs font-normal ${tooLong ? 'text-bad' : 'text-ink-500'}`}>
                {transcript.length.toLocaleString()} / {MAX_TRANSCRIPT_CHARS.toLocaleString()}
              </span>
            </span>
            {fromAudio && (
              <span className="mb-2 block rounded-lg border border-accent-500/30 bg-accent-500/10 px-3 py-2 text-sm text-accent-300">
                Transcribed from audio. Read it through and fix any mistakes before saving.
              </span>
            )}
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={10}
              placeholder="Paste the meeting transcript here, or use the Audio tab to transcribe a recording"
              className="scroll-thin w-full resize-y rounded-lg border border-ink-700 bg-ink-950 px-3 py-2 leading-relaxed placeholder:text-ink-500"
            />
            {tooLong && (
              <span className="mt-1 block text-xs text-bad">
                This transcript is too long. Shorten it to {MAX_TRANSCRIPT_CHARS.toLocaleString()} characters or fewer.
              </span>
            )}
          </label>
        )}

        {tab === 'audio' && (
          <div className="flex flex-col gap-4">
            {whisperDown && (
              <div className="rounded-xl border border-warn/40 bg-warn/10 p-4 text-sm leading-relaxed" role="status">
                <p className="font-medium">
                  {whisper === 'LOADING' ? 'Whisper is still loading its model.' : 'Whisper (speech to text) is not running.'}
                </p>
                <p className="mt-1 text-ink-300">
                  {whisper === 'LOADING'
                    ? 'Give it a few seconds, then check again.'
                    : 'Start it from the Whisper folder, then check again. The one-time setup is in docs/audio-setup.md.'}
                </p>
                {whisper !== 'LOADING' && (
                  <code className="mt-2 block overflow-x-auto rounded-md bg-ink-950 px-3 py-2 text-xs">
                    whisper-server.exe -m C:\whisper\models\ggml-base.bin --port 8081
                  </code>
                )}
                <button type="button" onClick={checkWhisper} className="mt-3 rounded-lg border border-ink-700 px-3 py-1.5 text-sm hover:bg-ink-800">
                  Check again
                </button>
              </div>
            )}

            <AudioCapture
              disabled={Boolean(busy)}
              onReady={(blob, name) => {
                setAudio({ blob, name })
                setAudioError('')
              }}
            />

            {audio && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-800 bg-ink-950 px-4 py-3">
                <p className="min-w-0 truncate text-sm">
                  <span className="font-medium">{audio.name}</span>{' '}
                  <span className="text-ink-500">({formatSize(audio.blob.size)})</span>
                </p>
                <button
                  type="button"
                  onClick={transcribeAudio}
                  disabled={Boolean(busy) || whisper === 'DOWN'}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-accent-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-accent-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy && <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
                  {busy ? 'Working' : 'Transcribe'}
                </button>
              </div>
            )}

            {busy && (
              <p className="text-sm text-ink-300" role="status">
                {busy}. {busy.startsWith('Transcribing') ? 'Long recordings can take a few minutes. ' : ''}
                <span className="tabular-nums">{formatDuration(elapsed)}</span>
              </p>
            )}
            {audioError && (
              <p className="text-sm text-bad" role="alert">
                {audioError}
              </p>
            )}
            {!audio && !busy && (
              <p className="text-sm leading-relaxed text-ink-300">
                Upload a recording or record now. It is transcribed on your computer, and you can edit the text before
                saving. Audio up to about 25 minutes works.
              </p>
            )}
          </div>
        )}

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={analyzeNow} onChange={(e) => setAnalyzeNow(e.target.checked)} className="size-4 accent-accent-500" />
          Analyze right after saving
        </label>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} disabled={working} className="rounded-lg border border-ink-700 px-4 py-2 text-sm hover:bg-ink-800">
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
