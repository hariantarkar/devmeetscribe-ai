import { useEffect, useRef, useState } from 'react'
import { Loader2, SendHorizontal, Trash2 } from 'lucide-react'
import { api } from '../api'

const SUGGESTIONS = [
  'What did we decide?',
  'Which tasks are still pending?',
  'What problems did the team discuss?',
]

function Sources({ sources }) {
  if (!sources || sources.length === 0) return null
  return (
    <details className="mt-2 text-sm">
      <summary className="cursor-pointer text-accent-300 hover:underline">
        From the transcript ({sources.length})
      </summary>
      <ul className="mt-2 flex flex-col gap-2">
        {sources.map((s) => (
          <li key={s.line} className="rounded-lg border-l-2 border-accent-500 bg-ink-950 px-3 py-2 text-ink-300">
            <span className="mr-2 text-xs text-ink-500">Line {s.line}</span>
            {s.text}
          </li>
        ))}
      </ul>
    </details>
  )
}

function Message({ message }) {
  const mine = message.role === 'USER'
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          mine ? 'bg-accent-600 text-white' : 'border border-ink-800 bg-ink-900 text-ink-100'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        {!mine && <Sources sources={message.sources} />}
      </div>
    </div>
  )
}

export default function ChatPage({ meetings, selectedId, onSelect, onError, onGoMeetings }) {
  const [messages, setMessages] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [asking, setAsking] = useState(false)
  const [input, setInput] = useState('')
  const endRef = useRef(null)
  const currentId = useRef(selectedId)
  currentId.current = selectedId

  useEffect(() => {
    if (selectedId == null) {
      setMessages([])
      return
    }
    let cancelled = false
    setLoadingHistory(true)
    api
      .chatHistory(selectedId)
      .then((m) => !cancelled && setMessages(m))
      .catch((e) => !cancelled && onError(e.message))
      .finally(() => !cancelled && setLoadingHistory(false))
    return () => {
      cancelled = true
    }
  }, [selectedId, onError])

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [messages, asking])

  async function send(text) {
    const question = text.trim()
    if (!question || asking || selectedId == null) return
    const id = selectedId
    const temp = { id: `tmp-${Date.now()}`, role: 'USER', content: question, sources: [] }

    setMessages((m) => [...m, temp])
    setInput('')
    setAsking(true)
    try {
      const { user, assistant } = await api.askMeeting(id, question)
      if (currentId.current === id) {
        setMessages((m) => [...m.filter((x) => x.id !== temp.id), user, assistant])
      }
    } catch (e) {
      onError(e.message)
      if (currentId.current === id) {
        setMessages((m) => m.filter((x) => x.id !== temp.id))
        setInput(question)
      }
    } finally {
      setAsking(false)
    }
  }

  async function clearChat() {
    if (!window.confirm('Clear the chat for this meeting?')) return
    try {
      await api.clearChat(selectedId)
      setMessages([])
    } catch (e) {
      onError(e.message)
    }
  }

  if (meetings.length === 0) {
    return (
      <div className="mx-auto max-w-2xl p-6 lg:p-8">
        <h1 className="text-2xl font-semibold tracking-tight">Chat with your meetings</h1>
        <p className="mt-2 text-sm text-ink-300">Add a meeting first, then ask questions about it here.</p>
        <button
          type="button"
          onClick={onGoMeetings}
          className="mt-4 rounded-lg bg-accent-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-accent-500"
        >
          Go to meetings
        </button>
      </div>
    )
  }

  const empty = messages.length === 0 && !loadingHistory && !asking

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col p-4 lg:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">Chat</h1>
          <p className="mt-1 text-sm text-ink-300">Ask about a meeting. Answers cite the transcript lines they come from.</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="block">
            <span className="sr-only">Meeting</span>
            <select
              value={selectedId ?? ''}
              onChange={(e) => onSelect(Number(e.target.value))}
              className="max-w-[14rem] rounded-lg border border-ink-700 bg-ink-950 px-3 py-2 text-sm [color-scheme:light]"
            >
              {meetings.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={clearChat}
            disabled={messages.length === 0 || asking}
            aria-label="Clear chat"
            title="Clear chat"
            className="rounded-lg border border-ink-700 p-2 text-ink-300 hover:border-bad/60 hover:text-bad disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="scroll-thin min-h-0 flex-1 overflow-y-auto py-5" aria-live="polite">
        {loadingHistory && <p className="text-sm text-ink-500">Loading chat</p>}

        {empty && (
          <div className="mx-auto mt-6 max-w-md text-center">
            <h2 className="text-lg font-semibold">Ask about this meeting</h2>
            <p className="mt-1 text-sm text-ink-300">Try one of these, or type your own question below.</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => send(q)}
                  className="rounded-full border border-ink-700 px-3.5 py-1.5 text-sm text-ink-300 hover:border-accent-500 hover:text-accent-300"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {messages.map((m) => (
            <Message key={m.id} message={m} />
          ))}
          {asking && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl border border-ink-800 bg-ink-900 px-4 py-2.5 text-sm text-ink-300" role="status">
                <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                Reading the transcript. This can take a few seconds.
              </div>
            </div>
          )}
        </div>
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          send(input)
        }}
        className="flex items-end gap-2 border-t border-ink-800 pt-4"
      >
        <label className="min-w-0 flex-1">
          <span className="sr-only">Your question</span>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault()
                send(input)
              }
            }}
            rows={2}
            maxLength={1000}
            placeholder="Ask a question about this meeting"
            className="w-full resize-none rounded-lg border border-ink-700 bg-ink-950 px-3 py-2 text-sm placeholder:text-ink-500"
          />
        </label>
        <button
          type="submit"
          disabled={!input.trim() || asking}
          aria-label="Send question"
          className="rounded-lg bg-accent-600 p-2.5 text-white hover:bg-accent-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <SendHorizontal className="size-5" aria-hidden="true" />
        </button>
      </form>
    </div>
  )
}
