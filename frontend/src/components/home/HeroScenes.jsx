import { ArrowRight } from 'lucide-react'

// Built-in slide illustrations, drawn with HTML and CSS. All are decorative (hidden from screen readers);
// the slide caption carries the meaning.

const glass = 'tokens-dark rounded-2xl border border-white/15 bg-white/10 backdrop-blur'
const paper = 'tokens-light rounded-2xl bg-white shadow-2xl'

function Frame({ children }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center px-5 pb-28 pt-8 sm:px-16" aria-hidden="true">
      {children}
    </div>
  )
}

function Chip({ tone = 'muted', children }) {
  const tones = {
    muted: 'bg-ink-800 text-ink-300',
    warn: 'bg-warn/15 text-warn',
    ok: 'bg-ok/15 text-ok',
    accent: 'bg-accent-500/10 text-accent-300',
  }
  return <span className={`rounded-md px-1.5 py-0.5 text-xs ${tones[tone]}`}>{children}</span>
}

function TaskRow({ done, title, chips }) {
  return (
    <li className="flex items-start gap-2.5">
      {done ? (
        <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded bg-accent-600">
          <svg viewBox="0 0 16 16" className="size-3" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3.5 8.5l3 3 6-7" />
          </svg>
        </span>
      ) : (
        <span className="mt-0.5 size-4 shrink-0 rounded border border-ink-700 bg-ink-950" />
      )}
      <span className="min-w-0">
        <span className={done ? 'text-ink-500 line-through' : ''}>{title}</span>
        <span className="mt-1 flex flex-wrap gap-1.5">{chips}</span>
      </span>
    </li>
  )
}

function NotesScene() {
  return (
    <Frame>
      <div className="grid w-full max-w-4xl items-center gap-5 sm:grid-cols-[1fr_auto_1fr]">
        <div className={`${glass} hidden p-4 text-sm sm:block`}>
          <p className="mb-2 text-xs text-ink-300">Transcript</p>
          <ul className="space-y-2 leading-relaxed">
            <li><span className="font-medium text-accent-300">Rahul</span> <span className="text-ink-300">We need the login API by Friday.</span></li>
            <li><span className="font-medium text-accent-300">Priya</span> <span className="text-ink-300">I will test the registration endpoint by Thursday.</span></li>
            <li><span className="font-medium text-accent-300">Amit</span> <span className="text-ink-300">We decided to use MySQL.</span></li>
          </ul>
        </div>
        <ArrowRight className="mx-auto hidden size-7 text-white/70 sm:block" />
        <div className={`${paper} p-4 text-sm`}>
          <div className="flex items-center justify-between">
            <span className="font-semibold">Meeting notes</span>
            <Chip tone="accent">Analyzed</Chip>
          </div>
          <p className="mt-2 leading-relaxed text-ink-300">The team settled on the database. The login API is due Friday.</p>
          <p className="mt-3 text-xs font-medium text-ink-500">Decision</p>
          <p className="mt-1 flex gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent-400" />Use MySQL as the database</p>
          <p className="mt-3 text-xs font-medium text-ink-500">Tasks</p>
          <ul className="mt-2 space-y-2">
            <TaskRow title="Finish the login API" chips={<><Chip>Owner not assigned</Chip><Chip>Due Friday</Chip><Chip tone="warn">Verify</Chip></>} />
            <TaskRow done title="Test the registration endpoint" chips={<><Chip>Priya</Chip><Chip>Due Thursday</Chip></>} />
          </ul>
        </div>
      </div>
    </Frame>
  )
}

function ChatScene() {
  return (
    <Frame>
      <div className="flex w-full max-w-xl flex-col gap-3 text-sm">
        <div className="ml-auto max-w-[85%] rounded-2xl bg-accent-600 px-4 py-2.5 text-white">What did we decide about the database?</div>
        <div className={`${paper} max-w-[95%] px-4 py-3`}>
          <p>You decided to use MySQL instead of PostgreSQL.</p>
          <p className="mt-2.5 rounded-lg border-l-2 border-accent-500 bg-ink-950 px-3 py-2 text-ink-300">
            <span className="mr-2 text-xs text-ink-500">Line 3</span>
            Amit: We decided to go with MySQL instead of PostgreSQL.
          </p>
        </div>
        <div className="ml-auto max-w-[85%] rounded-2xl bg-accent-600 px-4 py-2.5 text-white">Which tasks are still pending?</div>
      </div>
    </Frame>
  )
}

const BARS = Array.from({ length: 44 }, (_, i) => Math.round(18 + Math.abs(Math.sin(i * 0.7)) * 62 + (i % 5) * 3))

function AudioScene() {
  return (
    <Frame>
      <div className="flex w-full max-w-2xl flex-col gap-5">
        <div className={`${glass} flex h-28 items-center justify-center gap-1 px-6`}>
          {BARS.map((h, i) => (
            <span key={i} className="w-1.5 rounded-full bg-gradient-to-t from-accent-500 to-cyan-300" style={{ height: `${h}%` }} />
          ))}
        </div>
        <div className={`${paper} p-4 text-sm`}>
          <div className="flex items-center justify-between">
            <span className="font-semibold">Voice recording</span>
            <Chip tone="ok">Transcribed locally</Chip>
          </div>
          <p className="mt-2 leading-relaxed text-ink-300">
            Rahul: Good morning everyone. Let&rsquo;s go over the sprint status.
            <br />
            Priya: The registration module is done, but two login bugs remain.
          </p>
        </div>
      </div>
    </Frame>
  )
}

function TasksScene() {
  return (
    <Frame>
      <div className="flex w-full max-w-xl flex-col gap-3">
        <div className={`${glass} px-4 py-3 text-sm`}>
          <span className="mr-2 text-xs text-ink-300">Decision</span>
          Use MySQL as the project database
        </div>
        <div className={`${paper} p-4 text-sm`}>
          <div className="flex items-center justify-between">
            <span className="font-semibold">Tasks</span>
            <span className="text-xs text-ink-500">2 open</span>
          </div>
          <ul className="mt-3 space-y-3">
            <TaskRow title="Finish the student login API" chips={<><Chip>Owner not assigned</Chip><Chip>Due Friday</Chip><Chip tone="warn">Verify</Chip></>} />
            <TaskRow done title="Test the registration endpoint" chips={<><Chip>Priya</Chip><Chip>Due Thursday</Chip></>} />
            <TaskRow title="Update the API documentation" chips={<><Chip>Owner not assigned</Chip><Chip tone="warn">Verify</Chip></>} />
          </ul>
        </div>
      </div>
    </Frame>
  )
}

function ShareScene() {
  const bar = 'h-2 rounded-full bg-ink-800'
  return (
    <Frame>
      <div className="flex w-full max-w-3xl items-center justify-center gap-6">
        <div className={`${paper} w-full max-w-sm p-4 text-sm`}>
          <p className="text-xs text-ink-500">Subject</p>
          <p className="font-medium">Follow-up on Sprint sync</p>
          <hr className="my-3 border-ink-800" />
          <p className="leading-relaxed text-ink-300">Hi all,</p>
          <p className="mt-1 leading-relaxed text-ink-300">- Use MySQL as the database</p>
          <p className="leading-relaxed text-ink-300">- Finish the login API by Friday</p>
          <p className="mt-1 leading-relaxed text-ink-300">Best,</p>
        </div>
        <div className={`${paper} hidden w-52 rotate-3 p-4 sm:block`}>
          <div className="h-3 w-24 rounded-full bg-accent-600" />
          <div className="mt-4 space-y-2">
            <div className={bar} />
            <div className={`${bar} w-4/5`} />
            <div className={`${bar} w-2/3`} />
          </div>
          <div className="mt-5 h-2.5 w-16 rounded-full bg-ink-700" />
          <div className="mt-3 space-y-2">
            <div className={bar} />
            <div className={`${bar} w-3/4`} />
          </div>
          <p className="mt-5 text-xs text-ink-500">Report.pdf</p>
        </div>
      </div>
    </Frame>
  )
}

export const SCENES = {
  notes: NotesScene,
  chat: ChatScene,
  audio: AudioScene,
  tasks: TasksScene,
  share: ShareScene,
}
