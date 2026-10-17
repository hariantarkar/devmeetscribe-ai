// Settings for the slider at the top of the home page.

// How long each slide stays on screen, in milliseconds (1000 = 1 second).
// Around 4000 gives people time to read the caption.
export const HERO_INTERVAL_MS = 2500

// To use your own picture on a slide:
//   1. Copy the image into frontend/public/hero/  (for example ai-meeting.jpg)
//   2. Set  image: '/hero/ai-meeting.jpg'  and describe it in  alt
// A slide with an image shows the picture instead of the built-in illustration.
// To add a new slide, copy any entry and give it a new id. Use  scene: null  with an image.
// Scenes available: 'notes', 'chat', 'audio', 'tasks', 'share'
export const HERO_SLIDES = [
  {
    id: 'notes',
    scene: 'notes',
    image: null,
    alt: '',
    title: 'From transcript to notes',
    text: 'Paste text or record the call and get a summary, decisions and tasks.',
  },
  {
    id: 'chat',
    scene: 'chat',
    image: null,
    alt: '',
    title: 'Ask your meeting',
    text: 'Every answer shows the transcript lines it is based on.',
  },
  {
    id: 'audio',
    scene: 'audio',
    image: null,
    alt: '',
    title: 'Record or upload audio',
    text: 'Whisper transcribes on your computer, and you review the text before saving.',
  },
  {
    id: 'tasks',
    scene: 'tasks',
    image: null,
    alt: '',
    title: 'Decisions and action items',
    text: 'Owners and deadlines stay empty unless the meeting names them.',
  },
  {
    id: 'share',
    scene: 'share',
    image: null,
    alt: '',
    title: 'Share it in one click',
    text: 'Draft the follow-up email in your tone, or export a clean PDF report.',
  },
]
