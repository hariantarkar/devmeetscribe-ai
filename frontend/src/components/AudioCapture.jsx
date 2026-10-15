import { useEffect, useRef, useState } from 'react'
import { Mic, Square, Upload } from 'lucide-react'
import { formatDuration } from '../lib/audio'

/** Lets the user pick an audio file or record from the microphone. Calls onReady(blob, name). */
export default function AudioCapture({ onReady, disabled }) {
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [error, setError] = useState('')
  const fileRef = useRef(null)
  const recorderRef = useRef(null)
  const streamRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)

  useEffect(
    () => () => {
      clearInterval(timerRef.current)
      streamRef.current?.getTracks().forEach((t) => t.stop())
    },
    [],
  )

  function pickFile(e) {
    const file = e.target.files?.[0]
    e.target.value = '' // allows choosing the same file again
    if (!file) return
    setError('')
    onReady(file, file.name.replace(/\.[^.]+$/, ''))
  }

  async function start() {
    setError('')
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('Recording is not supported in this browser. Upload a file instead.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data)
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop())
        onReady(new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' }), 'Voice recording')
      }
      recorder.start()
      recorderRef.current = recorder
      setSeconds(0)
      setRecording(true)
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
    } catch {
      setError('Microphone access was blocked. Allow it in the address bar, or upload a file instead.')
    }
  }

  function stop() {
    clearInterval(timerRef.current)
    recorderRef.current?.stop()
    setRecording(false)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <input ref={fileRef} type="file" accept="audio/*,.mp3,.m4a,.wav,.ogg,.webm,.flac,.aac" onChange={pickFile} hidden />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={disabled || recording}
          className="inline-flex items-center gap-1.5 rounded-lg border border-ink-700 px-3.5 py-2 text-sm hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Upload className="size-4" aria-hidden="true" />
          Choose audio file
        </button>

        {recording ? (
          <button
            type="button"
            onClick={stop}
            className="inline-flex items-center gap-2 rounded-lg bg-bad px-3.5 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            <Square className="size-4" aria-hidden="true" />
            Stop <span className="tabular-nums">{formatDuration(seconds)}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={start}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 rounded-lg border border-ink-700 px-3.5 py-2 text-sm hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Mic className="size-4" aria-hidden="true" />
            Record with microphone
          </button>
        )}
      </div>
      {recording && (
        <p className="mt-2 text-sm text-ink-300" role="status">
          Recording. Press Stop when the meeting is over.
        </p>
      )}
      {error && (
        <p className="mt-2 text-sm text-bad" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
