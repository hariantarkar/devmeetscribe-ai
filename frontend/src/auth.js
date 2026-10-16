// Keeps the login token in the browser so a refresh does not sign the user out.
const KEY = 'devmeetscribe-token'

export function getToken() {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

export function setToken(token) {
  try {
    localStorage.setItem(KEY, token)
  } catch {
    /* storage unavailable: the user signs in again after a refresh */
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* nothing to clear */
  }
}
