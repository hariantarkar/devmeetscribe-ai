import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import { HERO_INTERVAL_MS, HERO_SLIDES } from '../../data/heroSlides'
import Constellation from './Constellation'
import { SCENES } from './HeroScenes'

function usePrefersReducedMotion() {
  const [reduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  return reduced
}

export default function HeroCarousel() {
  const reducedMotion = usePrefersReducedMotion()
  const [index, setIndex] = useState(0)
  const [userPaused, setUserPaused] = useState(reducedMotion)
  const [engaged, setEngaged] = useState(false) // pointer over the slider or focus inside it
  const paused = userPaused || engaged
  const count = HERO_SLIDES.length

  useEffect(() => {
    if (paused) return
    const timer = setTimeout(() => setIndex((i) => (i + 1) % count), HERO_INTERVAL_MS)
    return () => clearTimeout(timer)
  }, [index, paused, count])

  const go = (next) => setIndex((next + count) % count)

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="What DevMeetScribe does"
      className="relative h-[27rem] overflow-hidden bg-[radial-gradient(ellipse_at_50%_35%,#0f4a6e_0%,#071a33_55%,#030a1a_100%)] sm:h-[31rem] lg:h-[35rem]"
      onMouseEnter={() => setEngaged(true)}
      onMouseLeave={() => setEngaged(false)}
      onFocus={() => setEngaged(true)}
      onBlur={() => setEngaged(false)}
    >
      <Constellation seed={21} count={60} width={1600} height={700} maxDistance={190} className="absolute inset-0 size-full opacity-60" />

      <div aria-live={paused ? 'polite' : 'off'}>
        {HERO_SLIDES.map((slide, i) => {
          const active = i === index
          const Scene = slide.scene ? SCENES[slide.scene] : null
          return (
            <div
              key={slide.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              aria-hidden={!active}
              className={`absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none ${active ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
            >
              {slide.image ? (
                <img src={slide.image} alt={slide.alt || ''} className="absolute inset-0 size-full object-cover" />
              ) : (
                Scene && <Scene />
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent px-6 pb-12 pt-16 sm:px-10">
                <p className="text-lg font-semibold sm:text-xl">{slide.title}</p>
                <p className="mt-1 max-w-2xl text-white/80">{slide.text}</p>
              </div>
            </div>
          )
        })}
      </div>

      <button
        type="button"
        onClick={() => go(index - 1)}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-slate-800 shadow-lg hover:bg-white sm:left-5 sm:size-12"
      >
        <ChevronLeft className="size-6" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => go(index + 1)}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-slate-800 shadow-lg hover:bg-white sm:right-5 sm:size-12"
      >
        <ChevronRight className="size-6" aria-hidden="true" />
      </button>

      <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-3">
        <div className="flex items-center gap-2">
          {HERO_SLIDES.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => go(i)}
              aria-label={`Show slide ${i + 1}: ${slide.title}`}
              aria-current={i === index ? 'true' : undefined}
              className={`h-3 rounded-full transition-all motion-reduce:transition-none ${
                i === index ? 'w-7 bg-accent-400' : 'w-3 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => setUserPaused((p) => !p)}
          aria-label={userPaused ? 'Start automatic slides' : 'Pause automatic slides'}
          className="grid size-7 place-items-center rounded-full bg-white/20 text-white hover:bg-white/30"
        >
          {userPaused ? <Play className="size-3.5" aria-hidden="true" /> : <Pause className="size-3.5" aria-hidden="true" />}
        </button>
      </div>
    </div>
  )
}
