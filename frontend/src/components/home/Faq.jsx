import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

const FAQ = [
  {
    q: 'Does my meeting data leave my computer?',
    a: 'No. Transcription runs locally with Whisper, the AI runs locally with Ollama, and meetings are stored in your own database. The one exception is when you choose to open a drafted email in Gmail or Outlook.',
  },
  {
    q: 'Which languages does it understand?',
    a: 'Whisper can transcribe many languages, including Hindi and Marathi. Summaries and task extraction work best in English, because the Llama 3.2 model is strongest there.',
  },
  {
    q: 'How long can a recording or transcript be?',
    a: 'A recording can be about 25 minutes and a transcript up to 20,000 characters. For longer meetings, split them into parts.',
  },
  {
    q: 'Can I correct what the AI produces?',
    a: 'Yes. Edit the transcript before saving, change any task title, owner or deadline, tick tasks off, and edit the email draft before you use it.',
  },
  {
    q: 'What do I need to run it?',
    a: 'Text meetings need the app and Ollama. Audio adds a one-time Whisper setup on your computer.',
  },
]

export default function Faq() {
  const [open, setOpen] = useState(0) // one answer open at a time

  return (
    <div className="mx-auto mt-10 flex max-w-3xl flex-col gap-3.5">
      {FAQ.map((item, i) => {
        const isOpen = open === i
        return (
          <div
            key={item.q}
            className={`tokens-light rounded-2xl shadow-lg transition-colors motion-reduce:transition-none ${isOpen ? 'bg-[#eef0fa]' : 'bg-[#f7f8fc]'}`}
          >
            <h3>
              <button
                type="button"
                id={`faq-button-${i}`}
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center gap-4 px-5 py-5 text-left sm:px-6"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent-600 text-sm font-semibold text-white" aria-hidden="true">
                  {i + 1}
                </span>
                <span className="flex-1 text-base font-medium sm:text-lg">{item.q}</span>
                <ChevronDown
                  className={`size-5 shrink-0 text-accent-600 transition-transform motion-reduce:transition-none ${isOpen ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
              </button>
            </h3>
            <div id={`faq-panel-${i}`} role="region" aria-labelledby={`faq-button-${i}`} hidden={!isOpen} className="px-5 pb-6 sm:px-6">
              <p className="flex gap-2 leading-relaxed text-ink-300 sm:pl-[3.25rem]">
                <ChevronRight className="mt-1 size-4 shrink-0 text-accent-600" aria-hidden="true" />
                {item.a}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
