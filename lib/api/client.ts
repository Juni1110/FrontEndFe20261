import { API_BASE_URL } from './config'

const STORAGE_KEY = 'finanzas-auth-token'

export async function apiRequest(path: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${path}`

  const headers = new Headers(options.headers as HeadersInit | undefined)

  const method = (options.method ?? 'GET').toUpperCase()
  const noBodyMethod = ['GET', 'HEAD', 'DELETE'].includes(method)
  if (!noBodyMethod && !headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  if (!headers.has('Authorization')) {
    const token = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
  }

  const response = await fetch(url, { ...options, headers })

  const responseText = await response.text()
  const parsed = responseText ? safeJsonParse(responseText) : null

  if (!response.ok) {
    const backendMessage = parsed && typeof parsed === 'object' && 'message' in parsed
      ? String((parsed as { message?: unknown }).message)
      : responseText

    throw new Error(
      backendMessage || `Error HTTP ${response.status}: ${response.statusText}`
    )
  }

  return parsed ?? undefined
}

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}
