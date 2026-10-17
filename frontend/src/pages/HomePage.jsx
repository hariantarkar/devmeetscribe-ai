import { useEffect, useState } from 'react'
import { ArrowRight, Check, FileText, ListChecks, Mail, MessagesSquare, Mic, ShieldCheck } from 'lucide-react'
import Constellation from '../components/home/Constellation'
import Faq from '../components/home/Faq'
import HeroCarousel from '../components/home/HeroCarousel'

const NAV = [
  { id: 'top', label: 'Home' },
  { id: 'features', label: 'Features' },
  { id: 'how', label: 'How it works' },
  { id: 'faq', label: 'FAQ' },
]
const NAV_IDS = NAV.map((n) => n.id)

const FEATURES = [
  { icon: FileText, title: 'Smart summaries', text: 'A short recap of the meeting, so nobody has to read the whole transcript.' },
  { icon: ListChecks, title: 'Decisions and tasks', text: 'Action items with owners and deadlines, only when the meeting names them.' },
  { icon: MessagesSquare, title: 'Ask your meeting', text: 'Ask in plain language. Every answer shows the transcript lines it came from.' },
  { icon: Mic, title: 'Audio to text', text: 'Record or upload a call. Whisper transcribes it on your computer.' },
  { icon: Mail, title: 'Email and PDF', text: 'Draft a follow-up email in your tone, or export a clean report to share.' },
  { icon: ShieldCheck, title: 'Private by design', text: 'Accounts keep meetings separate, and the AI runs on your own computer.' },
]

const OUTPUTS = [
  { icon: FileText, title: 'Summary', text: 'A short recap of what was discussed.' },
  { icon: Check, title: 'Decisions', text: 'Only what was clearly decided.' },
  { icon: ListChecks, title: 'Tasks', text: 'Owners and deadlines, when stated.' },
]

const STEPS = [
  { title: 'Add the meeting', text: 'Paste a transcript, upload a recording, or record straight from your browser.' },
  { title: 'Let the AI read it', text: 'A local Llama model writes the summary and pulls out decisions and tasks. Unknown owners stay empty.' },
  { title: 'Review, ask and share', text: 'Fix anything that is off, ask follow-up questions, then send an email or save a PDF.' },
]

const TRUST = [
  { title: 'Sources on every answer', text: 'Replies show the exact transcript lines they came from. The quotes are copied from your transcript, never written by the model.' },
  { title: 'No invented owners', text: 'If nobody was assigned a task, it says so. Low-confidence items carry a Verify badge so you know where to look twice.' },
  { title: 'You stay in control', text: 'Edit the transcript before you save, change any task, and rewrite the email draft. Nothing is sent without you.' },
]

const primaryButton =
  'inline-flex items-center justify-center gap-2 rounded-full bg-accent-600 px-6 py-3 text-sm font-medium text-white hover:bg-accent-500'

function Logo() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-xl bg-accent-600" aria-hidden="true">
        <svg viewBox="0 0 32 32" className="size-5" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 22V10l7 8 7-8v12" />
        </svg>
      </span>
      <span className="text-lg font-semibold tracking-tight">
        DevMeetScribe <span className="text-accent-600">AI</span>
      </span>
    </span>
  )
}

function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0])
  useEffect(() => {
    const elements = ids.map((id) => document.getElementById(id)).filter(Boolean)
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (hit) setActive(hit.target.id)
      },
      { rootMargin: '-30% 0px -60% 0px' },
    )
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [ids])
  return active
}

function Heading({ children, sub, center = false }) {
  return (
    <div className={center ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      <h2 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">{children}</h2>
      {sub && <p className="mt-3 text-lg leading-relaxed text-ink-300">{sub}</p>}
    </div>
  )
}

export default function HomePage({ onSignIn, onGetStarted }) {
  const active = useActiveSection(NAV_IDS)

  return (
    <div className="landing tokens-dark relative isolate min-h-dvh">
      {/* Background: deep indigo with a faint network */}
      <div aria-hidden="true" className="fixed inset-0 -z-10 bg-[linear-gradient(160deg,#171c66_0%,#232c8a_50%,#1b3796_100%)]">
        <Constellation seed={7} count={52} className="size-full" />
      </div>

      <a
        href="#main"
        className="sr-only rounded-lg bg-white px-4 py-2 text-slate-900 focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50"
      >
        Skip to content
      </a>

      {/* Top bar */}
      <header className="tokens-light sticky top-0 z-40 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-8">
          <a href="#top" aria-label="DevMeetScribe AI home">
            <Logo />
          </a>
          <nav aria-label="Page sections" className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                aria-current={active === item.id ? 'true' : undefined}
                className={`border-b-2 px-3.5 py-2 text-sm font-medium ${
                  active === item.id
                    ? 'rounded-t-md border-accent-600 bg-accent-500/10 text-accent-600'
                    : 'border-transparent text-ink-300 hover:text-ink-100'
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onSignIn} className="rounded-full px-4 py-2 text-sm font-medium hover:bg-ink-800">
              Sign in
            </button>
            <button type="button" onClick={onGetStarted} className="rounded-full bg-accent-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-500">
              Get started
            </button>
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-8">
        {/* Hero slider */}
        <section id="top" aria-label="Introduction" className="scroll-mt-24 overflow-hidden rounded-3xl bg-white shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-5 bg-[linear-gradient(90deg,#33278c_0%,#4b2a9c_100%)] px-6 py-7 sm:px-10">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">Every meeting, written up.</h1>
              <p className="mt-2 text-lg text-white/80">See what DevMeetScribe does after the call ends.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onGetStarted}
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-[#2a2f93] hover:bg-indigo-50"
              >
                Create your account
                <ArrowRight className="size-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={onSignIn}
                className="rounded-full border border-white/40 px-6 py-3 text-sm font-medium text-white hover:bg-white/10"
              >
                Sign in
              </button>
            </div>
          </div>
          <HeroCarousel />
        </section>

        {/* About */}
        <section aria-labelledby="about-heading" className="tokens-light rounded-3xl bg-gradient-to-br from-white to-[#e8edff] p-8 shadow-xl sm:p-12">
          <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <h2 id="about-heading" className="max-w-xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                Meetings end. The follow-up shouldn&rsquo;t take another hour.
              </h2>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-300">
                Notes get lost, decisions get forgotten, and nobody remembers who agreed to what. DevMeetScribe turns
                a transcript or recording into a summary, the decisions, and a task list, and lets you ask the meeting
                questions. It all runs on your own computer.
              </p>
              <button type="button" onClick={onGetStarted} className={`${primaryButton} mt-7`}>
                Create your account
                <ArrowRight className="size-4" aria-hidden="true" />
              </button>
            </div>
            <ul className="grid gap-3">
              {OUTPUTS.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-md">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent-500/10 text-accent-600" aria-hidden="true">
                    <Icon className="size-5" />
                  </span>
                  <span>
                    <span className="block font-semibold">{title}</span>
                    <span className="text-sm text-ink-300">{text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Features */}
        <section id="features" aria-labelledby="features-heading" className="scroll-mt-24 rounded-3xl border border-white/15 bg-white/10 p-6 shadow-xl backdrop-blur-sm sm:p-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <Heading sub="Everything a meeting leaves behind, handled in one place.">
              <span id="features-heading">Core features</span>
            </Heading>
            <button type="button" onClick={onGetStarted} className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-[#2a2f93] hover:bg-indigo-50">
              Try it now
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          </div>
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <li
                key={title}
                className="tokens-light rounded-2xl bg-white p-6 shadow-lg transition-transform hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                <span className="grid size-12 place-items-center rounded-full bg-[linear-gradient(135deg,#4f46e5,#2757d1)] text-white" aria-hidden="true">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-5 text-xl font-semibold tracking-tight">{title}</h3>
                <p className="mt-2 leading-relaxed text-ink-300">{text}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* How it works */}
        <section id="how" aria-labelledby="how-heading" className="tokens-light scroll-mt-24 rounded-3xl bg-gradient-to-br from-white to-[#e8edff] p-8 shadow-xl sm:p-12">
          <div className="text-center">
            <h2 id="how-heading" className="text-3xl font-semibold tracking-tight sm:text-4xl">How it works</h2>
            <p className="mx-auto mt-3 max-w-xl text-lg text-ink-300">From a recording to action items in three steps.</p>
          </div>
          <div className="relative mt-12">
            <div aria-hidden="true" className="absolute left-[16.66%] right-[16.66%] top-6 hidden h-px bg-ink-700 md:block" />
            <ol className="relative grid gap-10 md:grid-cols-3">
              {STEPS.map((step, i) => (
                <li key={step.title} className="text-center">
                  <span className="mx-auto grid size-12 place-items-center rounded-full bg-[linear-gradient(135deg,#4f46e5,#2757d1)] text-lg font-semibold text-white shadow-lg">
                    {i + 1}
                  </span>
                  <h3 className="mt-5 text-xl font-semibold tracking-tight">{step.title}</h3>
                  <p className="mx-auto mt-2 max-w-[32ch] leading-relaxed text-ink-300">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Trust */}
        <section aria-labelledby="trust-heading" className="rounded-3xl border border-white/10 bg-[#0c1244]/80 p-8 shadow-xl sm:p-12">
          <Heading>
            <span id="trust-heading">Built to be checked, not just trusted.</span>
          </Heading>
          <ul className="mt-10 grid gap-8 md:grid-cols-3 md:gap-0 md:divide-x md:divide-white/10">
            {TRUST.map((item) => (
              <li key={item.title} className="md:px-8 md:first:pl-0 md:last:pr-0">
                <span className="grid size-9 place-items-center rounded-full bg-ok/15 text-ok" aria-hidden="true">
                  <Check className="size-5" />
                </span>
                <h3 className="mt-4 text-xl font-semibold tracking-tight">{item.title}</h3>
                <p className="mt-2 leading-relaxed text-ink-300">{item.text}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* FAQ */}
        <section id="faq" aria-labelledby="faq-heading" className="scroll-mt-24 rounded-3xl border border-white/15 bg-white/10 p-6 shadow-xl backdrop-blur-sm sm:p-12">
          <div className="text-center">
            <h2 id="faq-heading" className="text-3xl font-semibold tracking-tight sm:text-5xl">Frequently Asked Questions</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-ink-300">
              Curious how <span className="font-medium text-accent-300">DevMeetScribe</span> handles your meetings?
              Here are the answers to what people ask first.
            </p>
          </div>
          <Faq />
        </section>

        {/* Final call to action */}
        <section className="rounded-3xl bg-[linear-gradient(120deg,#33278c_0%,#2757d1_100%)] px-6 py-14 text-center shadow-xl">
          <h2 className="mx-auto max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">
            Your next meeting, already written up.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-lg text-white/80">Create an account and turn your first transcript into notes in a minute.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={onGetStarted} className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-[#2a2f93] hover:bg-indigo-50">
              Create your account
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
            <button type="button" onClick={onSignIn} className="rounded-full border border-white/40 px-6 py-3 text-sm font-medium text-white hover:bg-white/10">
              I already have an account
            </button>
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-7xl px-4 pb-8 sm:px-8">
        <div className="tokens-light rounded-3xl bg-white p-8 shadow-xl">
          <div className="flex flex-col gap-8 md:flex-row md:justify-between">
            <div className="max-w-xs">
              <Logo />
              <p className="mt-3 text-sm leading-relaxed text-ink-300">An AI meeting assistant. Summaries, decisions and tasks from every meeting.</p>
            </div>
            <div className="flex gap-16 text-sm">
              <nav aria-label="Product" className="flex flex-col gap-2.5">
                <p className="font-semibold">Product</p>
                <a href="#features" className="text-ink-300 hover:text-ink-100">Features</a>
                <a href="#how" className="text-ink-300 hover:text-ink-100">How it works</a>
                <a href="#faq" className="text-ink-300 hover:text-ink-100">FAQ</a>
              </nav>
              <div className="flex flex-col items-start gap-2.5">
                <p className="font-semibold">Account</p>
                <button type="button" onClick={onSignIn} className="text-ink-300 hover:text-ink-100">Sign in</button>
                <button type="button" onClick={onGetStarted} className="text-ink-300 hover:text-ink-100">Create account</button>
              </div>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-ink-800 pt-5 text-sm text-ink-500">
            <p>
              Built by Hari Antarkar.{' '}
              <a href="https://github.com/hariantarkar" target="_blank" rel="noopener noreferrer" className="text-accent-600 hover:underline">
                GitHub
              </a>
            </p>
            <p>{new Date().getFullYear()} DevMeetScribe AI</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
