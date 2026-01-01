/**
 * Shared error handling utilities
 * Type-safe error message extraction from unknown error types
 */

/**
 * Extract error message from unknown error type
 * Handles Error instances, strings, and objects with message property
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  if (error && typeof error === 'object') {
    // Handle Nuxt/H3 error format with data.message
    if ('data' in error) {
      const data = (error as { data?: { message?: string } }).data
      if (data?.message) return data.message
    }
    // Handle objects with message property
    if ('message' in error) {
      const msg = (error as { message?: unknown }).message
      if (typeof msg === 'string') return msg
    }
    // Handle statusMessage for H3 errors
    if ('statusMessage' in error) {
      const msg = (error as { statusMessage?: unknown }).statusMessage
      if (typeof msg === 'string') return msg
    }
  }
  return 'An unknown error occurred'
}

/**
 * Extract error code from unknown error type
 * Handles Error instances with code property and objects
 */
export function getErrorCode(error: unknown): string | undefined {
  if (error && typeof error === 'object') {
    if ('code' in error) {
      const code = (error as { code?: unknown }).code
      if (typeof code === 'string') return code
    }
    if ('statusCode' in error) {
      const code = (error as { statusCode?: unknown }).statusCode
      if (typeof code === 'number') return String(code)
    }
  }
  return undefined
}

/**
 * Extract status code from unknown error type
 */
export function getErrorStatusCode(error: unknown): number | undefined {
  if (error && typeof error === 'object') {
    if ('statusCode' in error) {
      const code = (error as { statusCode?: unknown }).statusCode
      if (typeof code === 'number') return code
    }
    if ('status' in error) {
      const code = (error as { status?: unknown }).status
      if (typeof code === 'number') return code
    }
  }
  return undefined
}

/**
 * Check if error is of a specific type
 */
export function isErrorWithMessage(error: unknown): error is { message: string } {
  return (
    typeof error === 'object'
    && error !== null
    && 'message' in error
    && typeof (error as { message: unknown }).message === 'string'
  )
}

/**
 * Check if error is an Error instance
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error
}
