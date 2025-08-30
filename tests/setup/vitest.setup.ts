import { vi } from 'vitest'
import { computed, ref, readonly, watch } from 'vue'

// Make Vue reactivity functions available globally
global.computed = computed
global.ref = ref
global.readonly = readonly
global.watch = watch

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
global.defineNuxtRouteMiddleware = vi.fn()
global.useSupabaseClient = vi.fn()
global.useSupabaseUser = vi.fn()