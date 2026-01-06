/**
 * Server-side error handling utilities
 * Type-safe error message extraction from unknown error types
 */

/**
 * Extract error message from unknown error type
 * Handles Error instances, strings, and objects with message property
 */
export function getServerErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  if (error && typeof error === 'object') {
    // Handle H3 error format
    if ('statusMessage' in error) {
      const msg = (error as { statusMessage?: unknown }).statusMessage
      if (typeof msg === 'string') return msg
    }
    // Handle objects with message property
    if ('message' in error) {
      const msg = (error as { message?: unknown }).message
      if (typeof msg === 'string') return msg
    }
    // Handle nested data.message
    if ('data' in error) {
      const data = (error as { data?: { message?: string } }).data
      if (data?.message) return data.message
    }
  }
  return 'An unknown error occurred'
}

/**
 * Extract status code from unknown error type
 */
export function getServerErrorStatusCode(error: unknown): number {
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
  return 500
}

/**
 * Check if error is an Error instance
 */
export function isServerError(error: unknown): error is Error {
  return error instanceof Error
}

/**
 * Log error with consistent format for server logs
 */
export function logServerError(context: string, error: unknown): void {
  const message = getServerErrorMessage(error)
  const stack = error instanceof Error ? error.stack : undefined
  console.error(`[${context}] Error:`, message)
  if (stack) {
    console.error(`[${context}] Stack:`, stack)
  }
}

/**
 * Check if error is an H3 error with statusCode
 * Use this to rethrow H3 errors that should propagate as-is
 */
export function isH3Error(error: unknown): error is { statusCode: number, statusMessage?: string } {
  return (
    typeof error === 'object'
    && error !== null
    && 'statusCode' in error
    && typeof (error as { statusCode?: unknown }).statusCode === 'number'
  )
}

/**
 * Check if error is a PostgreSQL database error with code
 * Common codes: 23505 (unique violation), 23503 (foreign key), 23502 (not null)
 */
export function isDatabaseError(error: unknown): error is { code: string, detail?: string, message?: string } {
  return (
    typeof error === 'object'
    && error !== null
    && 'code' in error
    && typeof (error as { code?: unknown }).code === 'string'
  )
}

/**
 * Get database error code from unknown error
 */
export function getDatabaseErrorCode(error: unknown): string | undefined {
  if (isDatabaseError(error)) {
    return error.code
  }
  return undefined
}

/**
 * Get database error detail from unknown error
 */
export function getDatabaseErrorDetail(error: unknown): string | undefined {
  if (isDatabaseError(error)) {
    return error.detail
  }
  return undefined
}
