const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'

async function request(path, options = {}) {
  let res
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })
  } catch {
    throw new Error(`Cannot reach the backend at ${BASE}. Check that it is running.`)
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const body = await res.json()
      if (body.message) message = body.message
    } catch {
      /* response had no JSON body */
    }
    throw new Error(message)
  }
  return res.status === 204 ? null : res.json()
}

const json = (method, data) => ({ method, body: JSON.stringify(data) })

export const api = {
  health: () => request('/api/health'),
  listMeetings: () => request('/api/meetings'),
  getMeeting: (id) => request(`/api/meetings/${id}`),
  createMeeting: (data) => request('/api/meetings', json('POST', data)),
  deleteMeeting: (id) => request(`/api/meetings/${id}`, { method: 'DELETE' }),
  analyzeMeeting: (id) => request(`/api/meetings/${id}/analyze`, { method: 'POST' }),
  listTasks: (status) => request(`/api/tasks${status ? `?status=${status}` : ''}`),
  chatHistory: (id) => request(`/api/meetings/${id}/chat`),
  askMeeting: (id, question) => request(`/api/meetings/${id}/chat`, json('POST', { question })),
  clearChat: (id) => request(`/api/meetings/${id}/chat`, { method: 'DELETE' }),
  draftEmail: (id, tone) => request(`/api/meetings/${id}/email`, json('POST', { tone })),
  addTask: (meetingId, data) => request(`/api/meetings/${meetingId}/tasks`, json('POST', data)),
  updateTask: (id, data) => request(`/api/tasks/${id}`, json('PATCH', data)),
  deleteTask: (id) => request(`/api/tasks/${id}`, { method: 'DELETE' }),
}

export const MAX_TRANSCRIPT_CHARS = 20000

export function formatDate(iso) {
  if (!iso) return ''
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))
}
