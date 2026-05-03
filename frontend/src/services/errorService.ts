import axios from 'axios'

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.') {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as
      | { message?: string; errors?: Record<string, string[] | string> }
      | undefined

    const validationMessage = payload?.errors
      ? Object.values(payload.errors)
          .flat()
          .find(Boolean)
      : null

    return validationMessage ?? payload?.message ?? fallback
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}
