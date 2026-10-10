import { useEffect } from 'react'
import { CalendarDays, LayoutDashboard, ListChecks, Menu, MessagesSquare, X } from 'lucide-react'
import HealthBadge from './HealthBadge'

// Shown in the profile card. Replace with the logged-in user once auth exists.
const USER = { name: 'Hari Antarkar', note: 'Local mode' }

export const SECTIONS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'meetings', label: 'Meetings', icon: CalendarDays },
  { id: 'tasks', label: 'Tasks', icon: ListChecks },
  { id: 'chat', label: 'Chat', icon: MessagesSquare },
]

export default function AppSidebar({ section, onSelect, collapsed, onToggleCollapsed, mobileOpen, onCloseMobile }) {
  // `hide` hides labels on desktop when collapsed. The mobile drawer is always expanded.
  const hide = collapsed ? 'lg:hidden' : ''

  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (e) => e.key === 'Escape' && onCloseMobile()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mobileOpen, onCloseMobile])

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={onCloseMobile} aria-hidden="true" />}

      <aside
        id="app-nav"
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col gap-6 bg-nav-900 p-4 transition-[transform,width] duration-200 motion-reduce:transition-none lg:static lg:z-auto lg:translate-x-0 lg:border-r lg:border-ink-800 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'lg:w-[4.75rem]' : 'lg:w-64'}`}
      >
        <div className={`flex items-center justify-between gap-2 ${collapsed ? 'lg:justify-center' : ''}`}>
          <div className={`min-w-0 ${hide}`}>
            <p className="truncate text-lg font-semibold leading-tight tracking-tight">DevMeetScribe</p>
            <p className="text-xs text-ink-300">AI Meeting Assistant</p>
          </div>
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
            aria-controls="app-nav"
            className="hidden rounded-lg p-2 text-ink-300 hover:bg-nav-800 hover:text-ink-100 lg:inline-flex"
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close menu"
            className="rounded-lg p-2 text-ink-300 hover:bg-nav-800 hover:text-ink-100 lg:hidden"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Main" className="flex-1">
          <ul className="flex flex-col gap-1.5">
            {SECTIONS.map(({ id, label, icon: Icon, soon }) => {
              const active = section === id
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => onSelect(id)}
                    aria-current={active ? 'page' : undefined}
                    title={collapsed ? label : undefined}
                    className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium ${
                      active ? 'bg-accent-600 text-white' : 'text-ink-300 hover:bg-nav-800 hover:text-ink-100'
                    } ${collapsed ? 'lg:justify-center lg:px-0' : ''}`}
                  >
                    <Icon className="size-5 shrink-0" aria-hidden="true" />
                    <span className={hide}>{label}</span>
                    {soon && (
                      <span className={`ml-auto rounded-full bg-nav-800 px-2 py-0.5 text-xs font-normal text-ink-300 ${hide}`}>
                        Soon
                      </span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="flex flex-col gap-3">
          <div className={collapsed ? 'lg:flex lg:justify-center' : ''}>
            <HealthBadge textClass={hide} />
          </div>

          <div className={`rounded-xl bg-nav-800 p-3 ${collapsed ? 'lg:bg-transparent lg:p-0' : ''}`}>
            <div className={`flex items-center gap-3 ${collapsed ? 'lg:justify-center' : ''}`}>
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent-600 text-sm font-semibold text-white" aria-hidden="true">
                {USER.name[0]}
              </span>
              <div className={`min-w-0 ${hide}`}>
                <p className="text-xs text-ink-300">Workspace</p>
                <p className="truncate text-sm font-semibold">{USER.name}</p>
                <p className="text-xs text-ink-500">{USER.note}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
