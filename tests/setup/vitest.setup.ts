import { vi } from 'vitest'
import { computed, ref, readonly, watch, onMounted, onUnmounted } from 'vue'

// Mock h3 module
vi.mock('h3', () => ({
  createError: vi.fn((error: any) => {
    const err = new Error(error.statusMessage)
    ;(err as any).statusCode = error.statusCode
    ;(err as any).statusMessage = error.statusMessage
    throw err
  })
}))

// Make Vue reactivity functions available globally
global.computed = computed
global.ref = ref
global.readonly = readonly
global.watch = watch
global.onMounted = onMounted
global.onUnmounted = onUnmounted

// Mock Nuxt composables
global.useI18n = vi.fn(() => ({
  t: vi.fn((key: string, params?: any) => {
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
  locale: { value: 'en' }
}))

global.useRoute = vi.fn(() => ({
  query: {}
}))

global.useLocalePath = vi.fn(() => (path: string) => path)

global.navigateTo = vi.fn()

// Mock other Nuxt utilities as needed
global.defineNuxtRouteMiddleware = vi.fn((middleware) => middleware)
global.useSupabaseClient = vi.fn()
global.useSupabaseUser = vi.fn()
global.createError = vi.fn((error: any) => {
  const err = new Error(error.statusMessage)
  ;(err as any).statusCode = error.statusCode
  throw err
})

// Mock useCookie for testing
global.useCookie = vi.fn((name: string, options?: any) => {
  let value: any = null
  return {
    get value() { return value },
    set value(val: any) { value = val }
  }
})