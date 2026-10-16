import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { api } from '../api'
import { setToken } from '../auth'

const POINTS = [
  'Summaries, decisions and action items from any transcript or recording',
  'Ask questions and get answers with quotes from the transcript',
  'Runs on local AI, so your meetings stay on your computer',
]

export default function AuthPage({ onAuthed }) {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const registering = mode === 'register'

  async function submit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = registering
        ? await api.register({ name: name.trim(), email: email.trim(), password })
        : await api.login({ email: email.trim(), password })
      setToken(data.token)
      onAuthed(data.user)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function switchMode() {
    setMode(registering ? 'login' : 'register')
    setError('')
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <section className="hidden flex-col justify-between bg-nav-900 p-10 lg:flex">
        <p className="text-lg font-semibold tracking-tight">DevMeetScribe</p>
        <div>
          <h1 className="max-w-md text-4xl font-semibold leading-tight tracking-tight">
            Every Meeting. Every Insight. One Intelligent Assistant.
          </h1>
          <ul className="mt-8 flex max-w-md flex-col gap-3">
            {POINTS.map((p) => (
              <li key={p} className="flex gap-3 text-ink-300">
                <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent-400" aria-hidden="true" />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-ink-500">AI meeting assistant</p>
      </section>

      <main className="theme-light flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <p className="mb-6 text-lg font-semibold tracking-tight lg:hidden">DevMeetScribe</p>

          <form onSubmit={submit} className="flex flex-col gap-4 rounded-2xl border border-ink-800 bg-ink-900 p-6 shadow-sm sm:p-8">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">{registering ? 'Create your account' : 'Sign in'}</h2>
              <p className="mt-1 text-sm text-ink-300">
                {registering ? 'Your meetings are private to your account.' : 'Welcome back. Pick up where you left off.'}
              </p>
            </div>

            {registering && (
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">Name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  maxLength={100}
                  required
                  className="w-full rounded-lg border border-ink-700 bg-ink-950 px-3 py-2"
                />
              </label>
            )}

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                className="w-full rounded-lg border border-ink-700 bg-ink-950 px-3 py-2"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={registering ? 'new-password' : 'current-password'}
                minLength={registering ? 8 : undefined}
                maxLength={72}
                required
                className="w-full rounded-lg border border-ink-700 bg-ink-950 px-3 py-2"
              />
              {registering && <span className="mt-1 block text-xs text-ink-500">At least 8 characters.</span>}
            </label>

            {error && (
              <p className="text-sm text-bad" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
              {registering ? 'Create account' : 'Sign in'}
            </button>

            <p className="text-center text-sm text-ink-300">
              {registering ? 'Already have an account?' : 'New here?'}{' '}
              <button type="button" onClick={switchMode} className="font-medium text-accent-300 hover:underline">
                {registering ? 'Sign in' : 'Create an account'}
              </button>
            </p>
          </form>
        </div>
      </main>
    </div>
  )
}
