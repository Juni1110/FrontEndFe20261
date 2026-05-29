import { API_BASE_URL } from './config'

export async function apiRequest(path: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${path}`

  const response = await fetch(url, options)

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
