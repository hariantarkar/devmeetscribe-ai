import { clearToken, getToken } from './auth'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'

let unauthorizedHandler = null

/** App registers a function that returns the user to the sign-in page when a token stops working. */
export function setUnauthorizedHandler(fn) {
  unauthorizedHandler = fn
}

async function request(path, options = {}) {
  // FormData sets its own multipart Content-Type, so it must not be overridden.
  const headers = options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let res
  try {
    res = await fetch(`${BASE}${path}`, { ...options, headers })
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
    if (res.status === 401 && token) {
      clearToken()
      unauthorizedHandler?.()
      message = 'Your session has expired. Please sign in again.'
    }
    throw new Error(message)
  }
  return res.status === 204 ? null : res.json()
}

const json = (method, data) => ({ method, body: JSON.stringify(data) })

export const api = {
  register: (data) => request('/api/auth/register', json('POST', data)),
  login: (data) => request('/api/auth/login', json('POST', data)),
  me: () => request('/api/auth/me'),
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
  transcribe: (wavBlob) => {
    const form = new FormData()
    form.append('file', wavBlob, 'audio.wav')
    return request('/api/transcribe', { method: 'POST', body: form })
  },
  addTask: (meetingId, data) => request(`/api/meetings/${meetingId}/tasks`, json('POST', data)),
  updateTask: (id, data) => request(`/api/tasks/${id}`, json('PATCH', data)),
  deleteTask: (id) => request(`/api/tasks/${id}`, { method: 'DELETE' }),
}

export const MAX_TRANSCRIPT_CHARS = 20000

export function formatDate(iso) {
  if (!iso) return ''
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))
}
