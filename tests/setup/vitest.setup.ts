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
