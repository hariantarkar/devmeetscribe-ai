import { useEffect, useState } from 'react'
import { api } from '../api'

function describe(health, offline) {
  if (offline) return { tone: 'bad', text: 'Backend offline. Start the Spring Boot app.' }
  if (!health) return { tone: 'idle', text: 'Checking services' }
  if (health.status === 'UP') return { tone: 'ok', text: `Ready (${health.model})` }
  if (health.database !== 'UP') return { tone: 'bad', text: 'Database is down. Check MySQL.' }
  if (health.ollama === 'MODEL_NOT_PULLED') return { tone: 'warn', text: `Run: ollama pull ${health.model}` }
  return { tone: 'warn', text: 'Ollama is not running. Start it to analyze meetings.' }
}

const dot = { ok: 'bg-ok', warn: 'bg-warn', bad: 'bg-bad', idle: 'bg-ink-500' }

export default function HealthBadge({ textClass = '' }) {
  const [health, setHealth] = useState(null)
  const [offline, setOffline] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function check() {
      try {
        const h = await api.health()
        if (!cancelled) {
          setHealth(h)
          setOffline(false)
        }
      } catch {
        if (!cancelled) setOffline(true)
      }
    }
    check()
    const id = setInterval(check, 30000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  const { tone, text } = describe(health, offline)
  return (
    <div className="flex items-start gap-2 text-sm text-ink-300" role="status" title={text}>
      <span className={`mt-1.5 size-2 shrink-0 rounded-full ${dot[tone]}`} />
      <span className={textClass}>{text}</span>
    </div>
  )
}
