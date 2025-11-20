import { vi } from 'vitest'

// Mock vue-i18n for testing
export const useI18n = global.useI18n || vi.fn(() => ({
  t: vi.fn((key: string) => key),
  locale: { value: 'en' },
}))

export const createI18n = vi.fn()
