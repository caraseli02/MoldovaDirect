/**
 * useStoreI18n Composable Tests
 * Tests for i18n access within Pinia stores
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useStoreI18n } from '~/composables/useStoreI18n'

// Mock useNuxtApp with i18n available
const mockNuxtApp = {
  $i18n: {
    t: vi.fn((key: string) => `translated:${key}`),
    locale: { value: 'es' },
  },
}

vi.stubGlobal('useNuxtApp', vi.fn(() => mockNuxtApp))

describe('useStoreI18n', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNuxtApp.$i18n.t.mockClear()
  })

  describe('With i18n Available', () => {
    it('should return t function', () => {
      const { t } = useStoreI18n()

      expect(typeof t).toBe('function')
    })

    it('should return locale ref', () => {
      const { locale: _locale } = useStoreI18n()

      expect(_locale).toBeDefined()
      expect(_locale.value).toBe('es')
    })

    it('should indicate availability', () => {
      const { available } = useStoreI18n()

      expect(available).toBe(true)
    })

    it('should translate keys', () => {
      const { t } = useStoreI18n()

      const result = t('cart.title')

      expect(result).toBe('translated:cart.title')
    })

    it('should use i18n t function', () => {
      const { t } = useStoreI18n()

      t('some.key')

      expect(mockNuxtApp.$i18n.t).toHaveBeenCalledWith('some.key')
    })
  })

  describe('Without i18n Available', () => {
    it('should return fallback t function that converts keys to readable format', () => {
      // Override mock to simulate missing i18n
      vi.mocked(useNuxtApp).mockReturnValueOnce({} as unknown)

      const { t, available } = useStoreI18n()

      expect(available).toBe(false)
      // Fallback converts "some.key" -> "Key" (extracts last segment, capitalizes)
      expect(t('some.key')).toBe('Key')
      // camelCase keys get spaces: "concurrentCheckout" -> "Concurrent Checkout"
      expect(t('checkout.warnings.concurrentCheckout')).toBe('Concurrent Checkout')
    })

    it('should return default locale', () => {
      vi.mocked(useNuxtApp).mockReturnValueOnce({} as unknown)

      const { locale, available } = useStoreI18n()

      expect(available).toBe(false)
      expect(locale.value).toBe('es')
    })

    it('should handle null nuxtApp', () => {
      vi.mocked(useNuxtApp).mockReturnValueOnce(null as unknown)

      const { t, locale: _locale, available } = useStoreI18n()

      expect(available).toBe(false)
      expect(typeof t).toBe('function')
      // Fallback capitalizes: "test" -> "Test"
      expect(t('test')).toBe('Test')
    })
  })

  describe('Return Value Structure', () => {
    it('should return expected properties', () => {
      const result = useStoreI18n()

      expect(result).toHaveProperty('t')
      expect(result).toHaveProperty('locale')
      expect(result).toHaveProperty('available')
    })

    it('should have correct types', () => {
      const { t, locale, available } = useStoreI18n()

      expect(typeof t).toBe('function')
      expect(typeof available).toBe('boolean')
      expect(locale).toBeDefined()
    })
  })
})
