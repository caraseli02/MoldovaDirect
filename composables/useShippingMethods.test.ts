import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { ref, nextTick } from 'vue'
import type { Address } from '~/types/checkout'

// Mock dependencies BEFORE imports
vi.mock('@vueuse/core', () => ({
  useDebounceFn: (fn: Function) => fn, // No debouncing in tests for speed
}))

vi.mock('~/lib/checkout/api', () => ({
  fetchShippingMethods: vi.fn(),
}))

const mockT = vi.fn((key: string, fallback?: string) => fallback || key)

// Override global mock with test-specific mock
global.useI18n = vi.fn(() => ({
  t: mockT,
  locale: { value: 'en' },
}))

// Mock checkout store
const mockCheckoutStore = {
  orderData: { subtotal: 100 },
}

// Mock as global function (Nuxt auto-imports it)
global.useCheckoutStore = vi.fn(() => mockCheckoutStore)

// Import AFTER mocks are set up
const { useShippingMethods } = await import('./useShippingMethods')

describe('useShippingMethods', () => {
  let address: ReturnType<typeof ref<Address>>

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()

    // Initialize with valid address
    address = ref<Address>({
      type: 'shipping',
      firstName: 'John',
      lastName: 'Doe',
      company: '',
      street: '123 Main St',
      city: 'Madrid',
      postalCode: '28001',
      province: 'Madrid',
      country: 'ES',
      phone: '+34 600 123 456',
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initialization', () => {
    it('initializes with empty state', () => {
      const { availableMethods, selectedMethod, loading, error } = useShippingMethods(address)

      expect(availableMethods.value).toEqual([])
      expect(selectedMethod.value).toBeNull()
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
    })
  })

  describe('Address Validation', () => {
    it('does not load methods for invalid address (missing country)', async () => {
      const { fetchShippingMethods } = await import('~/lib/checkout/api')
      const mockFetch = vi.mocked(fetchShippingMethods)

      address.value.country = ''
      const { loadShippingMethods, availableMethods } = useShippingMethods(address)

      await loadShippingMethods()

      expect(mockFetch).not.toHaveBeenCalled()
      expect(availableMethods.value).toEqual([])
    })

    it('does not load methods for invalid address (missing postal code)', async () => {
      const { fetchShippingMethods } = await import('~/lib/checkout/api')
      const mockFetch = vi.mocked(fetchShippingMethods)

      address.value.postalCode = ''
      const { loadShippingMethods, availableMethods } = useShippingMethods(address)

      await loadShippingMethods()

      expect(mockFetch).not.toHaveBeenCalled()
      expect(availableMethods.value).toEqual([])
    })

    it('does not load methods for invalid address (missing city)', async () => {
      const { fetchShippingMethods } = await import('~/lib/checkout/api')
      const mockFetch = vi.mocked(fetchShippingMethods)

      address.value.city = ''
      const { loadShippingMethods, availableMethods } = useShippingMethods(address)

      await loadShippingMethods()

      expect(mockFetch).not.toHaveBeenCalled()
      expect(availableMethods.value).toEqual([])
    })

    it('loads methods for valid address', async () => {
      const { fetchShippingMethods } = await import('~/lib/checkout/api')
      const mockFetch = vi.mocked(fetchShippingMethods)

      const mockMethods = [
        { id: 'standard', name: 'Standard', description: 'Standard shipping', price: 5.99, estimatedDays: 4 },
        { id: 'express', name: 'Express', description: 'Express shipping', price: 15.99, estimatedDays: 2 },
      ]
      mockFetch.mockResolvedValue(mockMethods)

      const { loadShippingMethods, availableMethods } = useShippingMethods(address)

      await loadShippingMethods()

      expect(mockFetch).toHaveBeenCalledWith({
        country: 'ES',
        postalCode: '28001',
        orderTotal: 100,
      })
      expect(availableMethods.value).toHaveLength(2)
    })
  })

  describe('Loading State', () => {
    it('sets loading state during fetch', async () => {
      const { fetchShippingMethods } = await import('~/lib/checkout/api')
      const mockFetch = vi.mocked(fetchShippingMethods)

      let resolvePromise: Function
      mockFetch.mockReturnValue(new Promise((resolve) => {
        resolvePromise = resolve
      }))

      const { loadShippingMethods, loading } = useShippingMethods(address)

      const promise = loadShippingMethods()

      // Should be loading immediately
      await nextTick()
      expect(loading.value).toBe(true)

      // Resolve the promise
      resolvePromise!([])
      await promise

      // Should not be loading after completion
      expect(loading.value).toBe(false)
    })

    it('prevents concurrent calls', async () => {
      const { fetchShippingMethods } = await import('~/lib/checkout/api')
      const mockFetch = vi.mocked(fetchShippingMethods)

      let resolveCount = 0
      mockFetch.mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolveCount++
            resolve([])
          }, 50)
        })
      })

      const { loadShippingMethods } = useShippingMethods(address)

      // Fire multiple concurrent calls
      const promises = [
        loadShippingMethods(),
        loadShippingMethods(),
        loadShippingMethods(),
      ]

      await Promise.all(promises)

      // Should only call API once despite 3 concurrent requests
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('Caching and Deduplication', () => {
    it('does not reload methods for same address', async () => {
      const { fetchShippingMethods } = await import('~/lib/checkout/api')
      const mockFetch = vi.mocked(fetchShippingMethods)

      mockFetch.mockResolvedValue([])

      const { loadShippingMethods } = useShippingMethods(address)

      // Load methods twice with same address
      await loadShippingMethods()
      await loadShippingMethods()

      // Should only call API once
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('reloads methods when address changes', async () => {
      const { fetchShippingMethods } = await import('~/lib/checkout/api')
      const mockFetch = vi.mocked(fetchShippingMethods)

      mockFetch.mockResolvedValue([])

      const { loadShippingMethods } = useShippingMethods(address)

      // Load methods with initial address
      await loadShippingMethods()

      // Change address
      address.value.postalCode = '28002'

      // Load methods again
      await loadShippingMethods()

      // Should call API twice
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })

  describe('Error Handling', () => {
    it('handles API errors and provides fallback methods', async () => {
      const { fetchShippingMethods } = await import('~/lib/checkout/api')
      const mockFetch = vi.mocked(fetchShippingMethods)

      mockFetch.mockRejectedValue(new Error('Network error'))

      const { loadShippingMethods, error, availableMethods } = useShippingMethods(address)

      await loadShippingMethods()

      expect(error.value).toBe('Network error')
      expect(availableMethods.value).toHaveLength(1) // Fallback method
      expect(availableMethods.value[0].id).toBe('standard')
    })

    it('handles non-Error exceptions', async () => {
      const { fetchShippingMethods } = await import('~/lib/checkout/api')
      const mockFetch = vi.mocked(fetchShippingMethods)

      mockFetch.mockRejectedValue('String error')

      const { loadShippingMethods, error, availableMethods } = useShippingMethods(address)

      await loadShippingMethods()

      expect(error.value).toBe('Failed to load shipping methods')
      expect(availableMethods.value).toHaveLength(1) // Fallback method
    })
  })

  describe('Localization', () => {
    it('localizes shipping method names and descriptions', async () => {
      const { fetchShippingMethods } = await import('~/lib/checkout/api')
      const mockFetch = vi.mocked(fetchShippingMethods)

      const mockMethods = [
        { id: 'standard', name: 'Standard', description: 'Standard shipping', price: 5.99, estimatedDays: 4 },
      ]
      mockFetch.mockResolvedValue(mockMethods)

      const { loadShippingMethods } = useShippingMethods(address)

      await loadShippingMethods()

      expect(mockT).toHaveBeenCalledWith('checkout.shippingMethod.standard.name', 'Standard')
      expect(mockT).toHaveBeenCalledWith('checkout.shippingMethod.standard.description', 'Standard shipping')
    })
  })

  describe('Retry Functionality', () => {
    it('retries loading shipping methods', async () => {
      const { fetchShippingMethods } = await import('~/lib/checkout/api')
      const mockFetch = vi.mocked(fetchShippingMethods)

      mockFetch.mockResolvedValue([])

      const { loadShippingMethods, retry } = useShippingMethods(address)

      // Initial load
      await loadShippingMethods()
      expect(mockFetch).toHaveBeenCalledTimes(1)

      // Retry should clear cache and reload
      retry()
      await nextTick()

      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })

  describe('Reset Functionality', () => {
    it('resets all state', async () => {
      const { fetchShippingMethods } = await import('~/lib/checkout/api')
      const mockFetch = vi.mocked(fetchShippingMethods)

      const mockMethods = [
        { id: 'standard', name: 'Standard', description: 'Standard shipping', price: 5.99, estimatedDays: 4 },
      ]
      mockFetch.mockResolvedValue(mockMethods)

      const { loadShippingMethods, reset, availableMethods, selectedMethod, loading, error } = useShippingMethods(address)

      // Load methods
      await loadShippingMethods()
      selectedMethod.value = mockMethods[0]

      // Reset
      reset()

      expect(availableMethods.value).toEqual([])
      expect(selectedMethod.value).toBeNull()
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
    })
  })

  describe('Fallback Methods', () => {
    it('provides standard shipping as fallback', async () => {
      const { fetchShippingMethods } = await import('~/lib/checkout/api')
      const mockFetch = vi.mocked(fetchShippingMethods)

      mockFetch.mockRejectedValue(new Error('API error'))

      const { loadShippingMethods, availableMethods } = useShippingMethods(address)

      await loadShippingMethods()

      expect(availableMethods.value).toHaveLength(1)
      expect(availableMethods.value[0]).toMatchObject({
        id: 'standard',
        price: 5.99,
        estimatedDays: 4,
      })
    })
  })

  describe('Integration with Checkout Store', () => {
    it('uses order total from checkout store', async () => {
      const { fetchShippingMethods } = await import('~/lib/checkout/api')
      const mockFetch = vi.mocked(fetchShippingMethods)

      mockFetch.mockResolvedValue([])
      mockCheckoutStore.orderData.subtotal = 250

      const { loadShippingMethods } = useShippingMethods(address)

      await loadShippingMethods()

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          orderTotal: 250,
        }),
      )
    })

    it('handles missing order total', async () => {
      const { fetchShippingMethods } = await import('~/lib/checkout/api')
      const mockFetch = vi.mocked(fetchShippingMethods)

      mockFetch.mockResolvedValue([])
      mockCheckoutStore.orderData = null

      const { loadShippingMethods } = useShippingMethods(address)

      await loadShippingMethods()

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          orderTotal: 0,
        }),
      )
    })
  })
})
