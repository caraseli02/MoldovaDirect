import { vi } from 'vitest'
import { computed, readonly, watch, onMounted, onUnmounted } from 'vue'

// Mock import.meta.client to true for client-side code paths
Object.defineProperty(import.meta, 'client', { value: true, writable: true })

// Mock h3 module
vi.mock('h3', () => ({
  getQuery: vi.fn(() => ({})),
  getCookie: vi.fn(),
  getHeader: vi.fn(),
  getRequestIP: vi.fn(() => '127.0.0.1'),
  createError: vi.fn((error: any) => {
    const err = new Error(error.statusMessage || error.message) as unknown
    err.statusCode = error.statusCode
    err.statusMessage = error.statusMessage
    return err
  }),
}))

// Make Vue reactivity functions available globally
global.computed = computed
global.readonly = readonly
global.watch = watch
global.onMounted = onMounted
global.onUnmounted = onUnmounted

// Mock Nuxt composables
global.useI18n = vi.fn(() => ({
  t: vi.fn((key: string, params?: unknown) => {
    // Simple mock that returns the key for testing
    if (params) {
      let result = key
      Object.entries(params).forEach(([param, value]) => {
        result = result.replace(`{${param}}`, String(value))
      })
      return result
    }
    return key
  }),
  locale: { value: 'en' },
}))

global.useRoute = vi.fn(() => ({
  query: {},
}))

global.useRouter = vi.fn(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  currentRoute: { value: { query: {} } },
}))

global.useLocalePath = vi.fn(() => (path: any) => {
  if (typeof path === 'string') return path
  if (path?.name === 'products-slug') return `/products/${path.params?.slug || ''}`
  return path?.path || '/'
})

global.navigateTo = vi.fn()

// Mock other Nuxt utilities as needed
global.defineNuxtRouteMiddleware = vi.fn(middleware => middleware)
global.useSupabaseClient = vi.fn()
global.useSupabaseUser = vi.fn()
global.createError = vi.fn((error: any) => {
  const err = new Error(error.statusMessage)
  ;(err as unknown).statusCode = error.statusCode
  throw err
})

// Mock Nuxt app
global.useNuxtApp = vi.fn(() => ({
  $i18n: {
    t: vi.fn((key: string) => key),
    locale: { value: 'en' },
  },
}))

// Error utility functions (auto-imported from utils/errorUtils.ts)
global.getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  if (error && typeof error === 'object') {
    if ('data' in error) {
      const data = (error as { data?: { message?: string } }).data
      if (data?.message) return data.message
    }
    if ('message' in error) {
      const msg = (error as { message?: unknown }).message
      if (typeof msg === 'string') return msg
    }
    if ('statusMessage' in error) {
      const msg = (error as { statusMessage?: unknown }).statusMessage
      if (typeof msg === 'string') return msg
    }
  }
  return 'An unknown error occurred'
}

global.getErrorCode = (error: unknown): string | undefined => {
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

global.getErrorStatusCode = (error: unknown): number | undefined => {
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

global.isErrorWithMessage = (error: unknown): boolean => {
  return (
    typeof error === 'object'
    && error !== null
    && 'message' in error
    && typeof (error as { message: unknown }).message === 'string'
  )
}

global.isError = (error: unknown): boolean => {
  return error instanceof Error
}

// Server-side error utility functions (auto-imported from server/utils/errorUtils.ts)
global.getServerErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  if (error && typeof error === 'object') {
    if ('statusMessage' in error) {
      const msg = (error as { statusMessage?: unknown }).statusMessage
      if (typeof msg === 'string') return msg
    }
    if ('message' in error) {
      const msg = (error as { message?: unknown }).message
      if (typeof msg === 'string') return msg
    }
    if ('data' in error) {
      const data = (error as { data?: { message?: string } }).data
      if (data?.message) return data.message
    }
  }
  return 'An unknown error occurred'
}

global.getServerErrorStatusCode = (error: unknown): number => {
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

global.isServerError = (error: unknown): boolean => {
  return error instanceof Error
}

global.logServerError = (context: string, error: unknown): void => {
  const message = global.getServerErrorMessage(error)
  console.error(`[${context}] Error:`, message)
}

global.isH3Error = (error: unknown): boolean => {
  return (
    typeof error === 'object'
    && error !== null
    && 'statusCode' in error
    && typeof (error as { statusCode?: unknown }).statusCode === 'number'
  )
}

global.isDatabaseError = (error: unknown): boolean => {
  return (
    typeof error === 'object'
    && error !== null
    && 'code' in error
    && typeof (error as { code?: unknown }).code === 'string'
  )
}

global.getDatabaseErrorCode = (error: unknown): string | undefined => {
  if (global.isDatabaseError(error)) {
    return (error as { code: string }).code
  }
  return undefined
}

global.getDatabaseErrorDetail = (error: unknown): string | undefined => {
  if (global.isDatabaseError(error)) {
    return (error as { detail?: string }).detail
  }
  return undefined
}

// Mock useCookie for testing with shared storage
// This ensures all calls to useCookie with the same name get the same ref
// Export this so tests can access and manipulate cookie data
export const cookieStorage = new Map<string, any>()

// Track cookie saves for testing
let _cookieSaveCount = 0

export const getCookieSaveCount = () => _cookieSaveCount
export const resetCookieSaveCount = () => {
  _cookieSaveCount = 0
}

global.useCookie = vi.fn((name: string, _options?: unknown) => {
  return {
    get value() {
      return cookieStorage.get(name)
    },
    set value(val: any) {
      _cookieSaveCount++
      if (val === null || val === undefined) {
        cookieStorage.delete(name)
      }
      else {
        cookieStorage.set(name, val)
      }
    },
  }
})
