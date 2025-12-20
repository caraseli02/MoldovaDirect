/**
 * Mock for h3 module used in tests
 */
import { vi } from 'vitest'

export const getQuery = vi.fn(() => ({}))
export const getCookie = vi.fn()
export const getHeader = vi.fn()
export const getRequestIP = vi.fn(() => '127.0.0.1')

export const createError = vi.fn((error) => {
  const err = new Error(error.statusMessage || error.message) as unknown
  err.statusCode = error.statusCode
  err.statusMessage = error.statusMessage
  return err
})
