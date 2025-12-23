import { vi } from 'vitest'

// Mock Nuxt auto-imports for testing
export const useHead = global.useHead || vi.fn()
export const useRoute = global.useRoute || vi.fn()
export const useRouter = global.useRouter || vi.fn(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  currentRoute: { value: { query: {} } },
}))
export const navigateTo = global.navigateTo || vi.fn()
export const useI18n = global.useI18n || vi.fn()
export const useLocalePath = global.useLocalePath || vi.fn(() => (path: any) => {
  if (typeof path === 'string') return path
  return path?.path || '/'
})
export const useSupabaseClient = global.useSupabaseClient || vi.fn()
export const useSupabaseUser = global.useSupabaseUser || vi.fn()
export const createError = global.createError || vi.fn()
