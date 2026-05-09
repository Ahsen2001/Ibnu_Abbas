import axios from 'axios'

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.') {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as
      | { message?: string; errors?: Record<string, string[] | string> }
      | string
      | undefined

    const validationMessage = typeof payload === 'object' && payload?.errors
      ? Object.values(payload.errors)
          .flat()
          .find(Boolean)
      : null

    if (validationMessage) {
      return validationMessage
    }

    if (typeof payload === 'object' && payload?.message) {
      return payload.message
    }

    if (typeof payload === 'string' && payload.trim() !== '') {
      const titleMatch = payload.match(/<title>(.*?)<\/title>/i)
      const headingMatch = payload.match(/<h[1-3][^>]*>(.*?)<\/h[1-3]>/i)
      const extracted = titleMatch?.[1] ?? headingMatch?.[1]

      if (extracted) {
        return extracted.replace(/\s+/g, ' ').trim()
      }
    }

    if (error.response?.status) {
      return `Request failed with status ${error.response.status}.`
    }

    return fallback
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}
