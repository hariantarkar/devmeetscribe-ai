import { useCallback, useEffect, useRef, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { api } from './api'
import AppSidebar, { SECTIONS } from './components/AppSidebar'
import NewMeetingModal from './components/NewMeetingModal'
import ShareModal from './components/ShareModal'
import OverviewPage from './pages/OverviewPage'
import MeetingsPage from './pages/MeetingsPage'
import TasksPage from './pages/TasksPage'
import ChatPage from './pages/ChatPage'

function initialSection() {
  const hash = window.location.hash.slice(1)
  return SECTIONS.some((s) => s.id === hash) ? hash : 'overview'
}

function initialCollapsed() {
  try {
    return localStorage.getItem('nav-collapsed') === '1'
  } catch {
    return false
  }
}

export default function App() {
  const [section, setSection] = useState(initialSection)
  const [collapsed, setCollapsed] = useState(initialCollapsed)
  const [mobileNav, setMobileNav] = useState(false)

  const [meetings, setMeetings] = useState([])
  const [listLoading, setListLoading] = useState(true)
  const [selectedId, setSelectedId] = useState(null)
  const [detail, setDetail] = useState(null)
  const [analyzingId, setAnalyzingId] = useState(null)
  const [showNew, setShowNew] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [toasts, setToasts] = useState([])

  const selectedRef = useRef(null)
  selectedRef.current = selectedId

  const notify = useCallback((message, tone = 'error') => {
    const id = crypto.randomUUID()
    setToasts((t) => [...t, { id, message, tone }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 6000)
  }, [])

  const selectSection = useCallback((id) => {
    setSection(id)
    setMobileNav(false)
  }, [])

  const openMeeting = useCallback(
    (id) => {
      setSelectedId(id)
      selectSection('meetings')
    },
    [selectSection],
  )

  function toggleCollapsed() {
    setCollapsed((c) => {
      try {
        localStorage.setItem('nav-collapsed', c ? '0' : '1')
      } catch {
        /* storage unavailable, keep the in-memory value */
      }
      return !c
    })
  }

  // Keep the URL hash in sync so a refresh stays on the same section.
  useEffect(() => {
    window.history.replaceState(null, '', `#${section}`)
  }, [section])

  const refreshList = useCallback(async () => {
    try {
      const list = await api.listMeetings()
      setMeetings(list)
      return list
    } catch (e) {
      notify(e.message)
      return null
    } finally {
      setListLoading(false)
    }
  }, [notify])

  // First load: fetch the list and pre-select the newest meeting.
  useEffect(() => {
    refreshList().then((list) => {
      if (list && list.length > 0) setSelectedId((cur) => cur ?? list[0].id)
    })
  }, [refreshList])

  // Load details whenever the selection changes.
  useEffect(() => {
    if (selectedId == null) {
      setDetail(null)
      return
    }
    let cancelled = false
    api
      .getMeeting(selectedId)
      .then((d) => !cancelled && setDetail(d))
      .catch((e) => !cancelled && notify(e.message))
    return () => {
      cancelled = true
    }
  }, [selectedId, notify])

  const analyze = useCallback(
    async (id) => {
      setAnalyzingId(id)
      try {
        const result = await api.analyzeMeeting(id)
        if (selectedRef.current === id) setDetail(result)
        await refreshList()
        notify('Analysis finished.', 'ok')
      } catch (e) {
        notify(e.message)
      } finally {
        setAnalyzingId((cur) => (cur === id ? null : cur))
      }
    },
    [notify, refreshList],
  )

  async function createMeeting({ title, transcript, analyzeNow }) {
    try {
      const created = await api.createMeeting({ title, transcript })
      await refreshList()
      setSelectedId(created.id)
      setDetail(created)
      setShowNew(false)
      selectSection('meetings')
      if (analyzeNow) analyze(created.id)
      return true
    } catch (e) {
      notify(e.message)
      return false
    }
  }

  async function deleteMeeting() {
    if (!detail || !window.confirm(`Delete "${detail.title}" and its tasks? This cannot be undone.`)) return
    try {
      await api.deleteMeeting(detail.id)
      const list = await refreshList()
      setSelectedId(list && list.length > 0 ? list[0].id : null)
      notify('Meeting deleted.', 'ok')
    } catch (e) {
      notify(e.message)
    }
  }

  const patchTasks = (fn) => setDetail((d) => (d ? { ...d, tasks: fn(d.tasks) } : d))

  async function addTask(title) {
    try {
      const task = await api.addTask(detail.id, { title })
      patchTasks((tasks) => [...tasks, task])
    } catch (e) {
      notify(e.message)
    }
  }

  async function updateTask(id, changes) {
    try {
      const task = await api.updateTask(id, changes)
      patchTasks((tasks) => tasks.map((t) => (t.id === id ? task : t)))
    } catch (e) {
      notify(e.message)
    }
  }

  async function deleteTask(id) {
    try {
      await api.deleteTask(id)
      patchTasks((tasks) => tasks.filter((t) => t.id !== id))
    } catch (e) {
      notify(e.message)
    }
  }

  const currentLabel = SECTIONS.find((s) => s.id === section)?.label

  return (
    <div className="flex h-dvh overflow-hidden">
      <AppSidebar
        section={section}
        onSelect={selectSection}
        collapsed={collapsed}
        onToggleCollapsed={toggleCollapsed}
        mobileOpen={mobileNav}
        onCloseMobile={() => setMobileNav(false)}
      />

      <div className="theme-light flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-ink-800 bg-ink-900 px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileNav(true)}
            aria-label="Open menu"
            aria-expanded={mobileNav}
            aria-controls="app-nav"
            className="rounded-lg p-1.5 text-ink-300 hover:bg-ink-800 hover:text-ink-100"
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
          <span className="font-semibold">{currentLabel}</span>
        </header>

        <main className="scroll-thin min-h-0 flex-1 overflow-y-auto">
          {section === 'overview' && (
            <OverviewPage
              meetings={meetings}
              loading={listLoading}
              onOpenMeeting={openMeeting}
              onNew={() => setShowNew(true)}
              onGoTasks={() => selectSection('tasks')}
            />
          )}
          {section === 'meetings' && (
            <MeetingsPage
              meetings={meetings}
              loading={listLoading}
              selectedId={selectedId}
              detail={detail}
              analyzingId={analyzingId}
              onSelect={setSelectedId}
              onNew={() => setShowNew(true)}
              onAnalyze={analyze}
              onDelete={deleteMeeting}
              onShare={() => setShowShare(true)}
              onAddTask={addTask}
              onUpdateTask={updateTask}
              onDeleteTask={deleteTask}
            />
          )}
          {section === 'tasks' && <TasksPage meetings={meetings} onOpenMeeting={openMeeting} onError={notify} />}
          {section === 'chat' && (
            <ChatPage
              meetings={meetings}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onError={notify}
              onGoMeetings={() => selectSection('meetings')}
            />
          )}
        </main>

      {showNew && <NewMeetingModal onClose={() => setShowNew(false)} onCreate={createMeeting} />}
        {showShare && detail && <ShareModal meeting={detail} onClose={() => setShowShare(false)} onError={notify} />}

      <div className="fixed bottom-4 right-4 z-50 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.tone === 'error' ? 'alert' : 'status'}
            className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg ${
              t.tone === 'error' ? 'border-bad/50 bg-ink-850 text-ink-100' : 'border-ok/50 bg-ink-850 text-ink-100'
            }`}
          >
            <span className="flex-1">{t.message}</span>
            <button
              type="button"
              onClick={() => setToasts((all) => all.filter((x) => x.id !== t.id))}
              aria-label="Dismiss"
              className="text-ink-500 hover:text-ink-100"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
      </div>

    </div>
  )
}
