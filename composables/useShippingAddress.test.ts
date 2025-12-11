import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { ref } from 'vue'
import type { Address } from '~/types/checkout'

// Mock Nuxt composables BEFORE imports
const mockUser = ref(null)
const mockFetch = vi.fn()

// Mock as global function (Nuxt auto-imports it)
global.useSupabaseUser = vi.fn(() => mockUser)

// Mock global $fetch
global.$fetch = mockFetch as unknown

// Mock checkout store
const mockCheckoutStore = {
  shippingInfo: null as unknown,
  savedAddresses: [] as Address[],
}

// Mock as global function (Nuxt auto-imports it)
global.useCheckoutStore = vi.fn(() => mockCheckoutStore)

// Import AFTER mocks are set up
const { useShippingAddress } = await import('./useShippingAddress')

describe('useShippingAddress', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockUser.value = null
    mockCheckoutStore.shippingInfo = null
    mockCheckoutStore.savedAddresses = []

    // Set NODE_ENV to test to avoid dev mode defaults
    process.env.NODE_ENV = 'test'
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initialization', () => {
    it('initializes with empty state in test environment', () => {
      const { shippingAddress, savedAddresses, loading, error } = useShippingAddress()

      expect(shippingAddress.value).toEqual({
        type: 'shipping',
        firstName: '',
        lastName: '',
        company: '',
        street: '',
        city: '',
        postalCode: '',
        province: '',
        country: '',
        phone: '',
        isDefault: false,
      })
      expect(savedAddresses.value).toEqual([])
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
    })

    it('initializes with development defaults when in development mode', () => {
      process.env.NODE_ENV = 'development'

      const { shippingAddress } = useShippingAddress()

      expect(shippingAddress.value.firstName).toBe('John')
      expect(shippingAddress.value.lastName).toBe('Doe')
      expect(shippingAddress.value.company).toBe('Test Company')
      expect(shippingAddress.value.street).toBe('123 Main Street')
      expect(shippingAddress.value.city).toBe('Madrid')
      expect(shippingAddress.value.postalCode).toBe('28001')
      expect(shippingAddress.value.province).toBe('Madrid')
      expect(shippingAddress.value.country).toBe('ES')
      expect(shippingAddress.value.phone).toBe('+34 600 123 456')
    })
  })

  describe('Address Validation', () => {
    it('validates complete address as valid', () => {
      const { shippingAddress, isAddressValid } = useShippingAddress()

      shippingAddress.value = {
        type: 'shipping',
        firstName: 'John',
        lastName: 'Doe',
        company: 'Test Company',
        street: '123 Main Street',
        city: 'Madrid',
        postalCode: '28001',
        province: 'Madrid',
        country: 'ES',
        phone: '+34 600 123 456',
      }

      expect(isAddressValid.value).toBe(true)
    })

    it('validates address without optional fields as valid', () => {
      const { shippingAddress, isAddressValid } = useShippingAddress()

      shippingAddress.value = {
        type: 'shipping',
        firstName: 'John',
        lastName: 'Doe',
        street: '123 Main Street',
        city: 'Madrid',
        postalCode: '28001',
        country: 'ES',
      }

      expect(isAddressValid.value).toBe(true)
    })

    it('validates address as invalid when missing firstName', () => {
      const { shippingAddress, isAddressValid } = useShippingAddress()

      shippingAddress.value = {
        type: 'shipping',
        firstName: '',
        lastName: 'Doe',
        street: '123 Main Street',
        city: 'Madrid',
        postalCode: '28001',
        country: 'ES',
      }

      expect(isAddressValid.value).toBe(false)
    })

    it('validates address as invalid when missing lastName', () => {
      const { shippingAddress, isAddressValid } = useShippingAddress()

      shippingAddress.value = {
        type: 'shipping',
        firstName: 'John',
        lastName: '',
        street: '123 Main Street',
        city: 'Madrid',
        postalCode: '28001',
        country: 'ES',
      }

      expect(isAddressValid.value).toBe(false)
    })

    it('validates address as invalid when missing street', () => {
      const { shippingAddress, isAddressValid } = useShippingAddress()

      shippingAddress.value = {
        type: 'shipping',
        firstName: 'John',
        lastName: 'Doe',
        street: '',
        city: 'Madrid',
        postalCode: '28001',
        country: 'ES',
      }

      expect(isAddressValid.value).toBe(false)
    })

    it('validates address as invalid when missing city', () => {
      const { shippingAddress, isAddressValid } = useShippingAddress()

      shippingAddress.value = {
        type: 'shipping',
        firstName: 'John',
        lastName: 'Doe',
        street: '123 Main Street',
        city: '',
        postalCode: '28001',
        country: 'ES',
      }

      expect(isAddressValid.value).toBe(false)
    })

    it('validates address as invalid when missing postalCode', () => {
      const { shippingAddress, isAddressValid } = useShippingAddress()

      shippingAddress.value = {
        type: 'shipping',
        firstName: 'John',
        lastName: 'Doe',
        street: '123 Main Street',
        city: 'Madrid',
        postalCode: '',
        country: 'ES',
      }

      expect(isAddressValid.value).toBe(false)
    })

    it('validates address as invalid when missing country', () => {
      const { shippingAddress, isAddressValid } = useShippingAddress()

      shippingAddress.value = {
        type: 'shipping',
        firstName: 'John',
        lastName: 'Doe',
        street: '123 Main Street',
        city: 'Madrid',
        postalCode: '28001',
        country: '',
      }

      expect(isAddressValid.value).toBe(false)
    })
  })

  describe('Loading Saved Addresses', () => {
    it('does not load addresses when user is not authenticated', async () => {
      mockUser.value = null

      const { loadSavedAddresses, savedAddresses } = useShippingAddress()

      await loadSavedAddresses()

      expect(mockFetch).not.toHaveBeenCalled()
      expect(savedAddresses.value).toEqual([])
    })

    it('loads saved addresses for authenticated users', async () => {
      mockUser.value = { id: 'user-123', email: 'test@example.com' } as unknown

      const mockApiAddresses = [
        {
          id: 1,
          type: 'shipping',
          first_name: 'John',
          last_name: 'Doe',
          company: 'Test Co',
          street: '123 Main St',
          city: 'Madrid',
          postal_code: '28001',
          province: 'Madrid',
          country: 'ES',
          phone: '+34 600 123 456',
          is_default: true,
        },
        {
          id: 2,
          type: 'shipping',
          first_name: 'Jane',
          last_name: 'Smith',
          company: '',
          street: '456 Oak Ave',
          city: 'Barcelona',
          postal_code: '08001',
          province: 'Barcelona',
          country: 'ES',
          phone: '+34 600 654 321',
          is_default: false,
        },
      ]

      mockFetch.mockResolvedValue({
        success: true,
        addresses: mockApiAddresses,
      })

      const { loadSavedAddresses, savedAddresses, loading } = useShippingAddress()

      await loadSavedAddresses()

      expect(mockFetch).toHaveBeenCalledWith('/api/checkout/addresses')
      expect(loading.value).toBe(false)
      expect(savedAddresses.value).toHaveLength(2)
      expect(savedAddresses.value[0]).toEqual({
        id: 1,
        type: 'shipping',
        firstName: 'John',
        lastName: 'Doe',
        company: 'Test Co',
        street: '123 Main St',
        city: 'Madrid',
        postalCode: '28001',
        province: 'Madrid',
        country: 'ES',
        phone: '+34 600 123 456',
        isDefault: true,
      })
    })

    it('sets loading state during address fetch', async () => {
      mockUser.value = { id: 'user-123' } as unknown

      let resolvePromise: (value: unknown) => void
      mockFetch.mockReturnValue(new Promise((resolve) => {
        resolvePromise = resolve
      }))

      const { loadSavedAddresses, loading } = useShippingAddress()

      const promise = loadSavedAddresses()

      // Should be loading immediately
      expect(loading.value).toBe(true)

      // Resolve the promise
      resolvePromise!({ success: true, addresses: [] })
      await promise

      // Should not be loading after completion
      expect(loading.value).toBe(false)
    })

    it('handles API error with Error object', async () => {
      mockUser.value = { id: 'user-123' } as unknown

      const errorMessage = 'Network error occurred'
      mockFetch.mockRejectedValue(new Error(errorMessage))

      const { loadSavedAddresses, error, savedAddresses } = useShippingAddress()

      await loadSavedAddresses()

      expect(error.value).toBe(errorMessage)
      expect(savedAddresses.value).toEqual([])
    })

    it('handles API error with non-Error object', async () => {
      mockUser.value = { id: 'user-123' } as unknown

      mockFetch.mockRejectedValue('String error')

      const { loadSavedAddresses, error } = useShippingAddress()

      await loadSavedAddresses()

      expect(error.value).toBe('Failed to load saved addresses')
    })

    it('falls back to store data on API failure', async () => {
      mockUser.value = { id: 'user-123' } as unknown

      const storeAddresses: Address[] = [{
        type: 'shipping',
        firstName: 'Store',
        lastName: 'Address',
        street: 'Store St',
        city: 'Madrid',
        postalCode: '28001',
        country: 'ES',
      }]

      mockCheckoutStore.savedAddresses = storeAddresses
      mockFetch.mockRejectedValue(new Error('API error'))

      const { loadSavedAddresses, savedAddresses } = useShippingAddress()

      await loadSavedAddresses()

      expect(savedAddresses.value).toEqual(storeAddresses)
    })

    it('handles missing addresses in API response', async () => {
      mockUser.value = { id: 'user-123' } as unknown

      mockFetch.mockResolvedValue({
        success: true,
        addresses: null,
      })

      const { loadSavedAddresses, savedAddresses } = useShippingAddress()

      await loadSavedAddresses()

      // Should not update savedAddresses if API returns null
      expect(savedAddresses.value).toEqual([])
    })

    it('handles unsuccessful API response', async () => {
      mockUser.value = { id: 'user-123' } as unknown

      mockFetch.mockResolvedValue({
        success: false,
        error: 'Database error',
      })

      const { loadSavedAddresses, savedAddresses } = useShippingAddress()

      await loadSavedAddresses()

      // Should not update savedAddresses on unsuccessful response
      expect(savedAddresses.value).toEqual([])
    })
  })

  describe('Saving Addresses', () => {
    it('does not save address when user is not authenticated', async () => {
      mockUser.value = null

      const address: Address = {
        type: 'shipping',
        firstName: 'John',
        lastName: 'Doe',
        street: '123 Main St',
        city: 'Madrid',
        postalCode: '28001',
        country: 'ES',
      }

      const { handleSaveAddress } = useShippingAddress()

      await handleSaveAddress(address)

      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('saves address for authenticated users', async () => {
      mockUser.value = { id: 'user-123' } as unknown

      const address: Address = {
        type: 'shipping',
        firstName: 'John',
        lastName: 'Doe',
        street: '123 Main St',
        city: 'Madrid',
        postalCode: '28001',
        country: 'ES',
      }

      const mockApiAddress = {
        id: 1,
        type: 'shipping',
        first_name: 'John',
        last_name: 'Doe',
        company: '',
        street: '123 Main St',
        city: 'Madrid',
        postal_code: '28001',
        province: '',
        country: 'ES',
        phone: '',
        is_default: false,
      }

      mockFetch.mockResolvedValue({
        success: true,
        address: mockApiAddress,
      })

      const { handleSaveAddress, savedAddresses } = useShippingAddress()

      await handleSaveAddress(address)

      expect(mockFetch).toHaveBeenCalledWith('/api/checkout/addresses', {
        method: 'POST',
        body: address,
      })
      expect(savedAddresses.value).toHaveLength(1)
      expect(savedAddresses.value[0].id).toBe(1)
    })

    it('sets loading state during address save', async () => {
      mockUser.value = { id: 'user-123' } as unknown

      let resolvePromise: (value: unknown) => void
      mockFetch.mockReturnValue(new Promise((resolve) => {
        resolvePromise = resolve
      }))

      const address: Address = {
        type: 'shipping',
        firstName: 'John',
        lastName: 'Doe',
        street: '123 Main St',
        city: 'Madrid',
        postalCode: '28001',
        country: 'ES',
      }

      const { handleSaveAddress, loading } = useShippingAddress()

      const promise = handleSaveAddress(address)

      // Should be loading immediately
      expect(loading.value).toBe(true)

      // Resolve the promise
      resolvePromise!({ success: true, address: {} })
      await promise

      // Should not be loading after completion
      expect(loading.value).toBe(false)
    })

    it('handles save error with Error object', async () => {
      mockUser.value = { id: 'user-123' } as unknown

      const errorMessage = 'Failed to save'
      mockFetch.mockRejectedValue(new Error(errorMessage))

      const address: Address = {
        type: 'shipping',
        firstName: 'John',
        lastName: 'Doe',
        street: '123 Main St',
        city: 'Madrid',
        postalCode: '28001',
        country: 'ES',
      }

      const { handleSaveAddress, error } = useShippingAddress()

      await expect(handleSaveAddress(address)).rejects.toThrow(errorMessage)
      expect(error.value).toBe(errorMessage)
    })

    it('handles save error with non-Error object', async () => {
      mockUser.value = { id: 'user-123' } as unknown

      mockFetch.mockRejectedValue('String error')

      const address: Address = {
        type: 'shipping',
        firstName: 'John',
        lastName: 'Doe',
        street: '123 Main St',
        city: 'Madrid',
        postalCode: '28001',
        country: 'ES',
      }

      const { handleSaveAddress, error } = useShippingAddress()

      await expect(handleSaveAddress(address)).rejects.toBe('String error')
      expect(error.value).toBe('Failed to save address')
    })
  })

  describe('Address Format Mapping', () => {
    it('maps API address format to internal format correctly', async () => {
      mockUser.value = { id: 'user-123' } as unknown

      const mockApiAddress = {
        id: 1,
        type: 'shipping',
        first_name: 'John',
        last_name: 'Doe',
        company: 'Test Company',
        street: '123 Main St',
        city: 'Madrid',
        postal_code: '28001',
        province: 'Madrid',
        country: 'ES',
        phone: '+34 600 123 456',
        is_default: true,
      }

      mockFetch.mockResolvedValue({
        success: true,
        addresses: [mockApiAddress],
      })

      const { loadSavedAddresses, savedAddresses } = useShippingAddress()

      await loadSavedAddresses()

      expect(savedAddresses.value[0]).toEqual({
        id: 1,
        type: 'shipping',
        firstName: 'John',
        lastName: 'Doe',
        company: 'Test Company',
        street: '123 Main St',
        city: 'Madrid',
        postalCode: '28001',
        province: 'Madrid',
        country: 'ES',
        phone: '+34 600 123 456',
        isDefault: true,
      })
    })

    it('handles optional fields in API mapping', async () => {
      mockUser.value = { id: 'user-123' } as unknown

      const mockApiAddress = {
        id: 1,
        type: 'shipping',
        first_name: 'John',
        last_name: 'Doe',
        street: '123 Main St',
        city: 'Madrid',
        postal_code: '28001',
        country: 'ES',
      }

      mockFetch.mockResolvedValue({
        success: true,
        addresses: [mockApiAddress],
      })

      const { loadSavedAddresses, savedAddresses } = useShippingAddress()

      await loadSavedAddresses()

      expect(savedAddresses.value[0]).toEqual({
        id: 1,
        type: 'shipping',
        firstName: 'John',
        lastName: 'Doe',
        company: undefined,
        street: '123 Main St',
        city: 'Madrid',
        postalCode: '28001',
        province: undefined,
        country: 'ES',
        phone: undefined,
        isDefault: undefined,
      })
    })
  })

  describe('Format Address Utility', () => {
    it('formats complete address as single line string', () => {
      const { formatAddress } = useShippingAddress()

      const address: Address = {
        type: 'shipping',
        firstName: 'John',
        lastName: 'Doe',
        street: '123 Main St',
        city: 'Madrid',
        postalCode: '28001',
        province: 'Madrid',
        country: 'ES',
      }

      const formatted = formatAddress(address)

      expect(formatted).toBe('123 Main St, Madrid, Madrid, 28001, ES')
    })

    it('formats address without optional province', () => {
      const { formatAddress } = useShippingAddress()

      const address: Address = {
        type: 'shipping',
        firstName: 'John',
        lastName: 'Doe',
        street: '123 Main St',
        city: 'Madrid',
        postalCode: '28001',
        country: 'ES',
      }

      const formatted = formatAddress(address)

      expect(formatted).toBe('123 Main St, Madrid, 28001, ES')
    })

    it('handles empty optional fields gracefully', () => {
      const { formatAddress } = useShippingAddress()

      const address: Address = {
        type: 'shipping',
        firstName: 'John',
        lastName: 'Doe',
        street: '123 Main St',
        city: 'Madrid',
        postalCode: '28001',
        province: '',
        country: 'ES',
      }

      const formatted = formatAddress(address)

      expect(formatted).toBe('123 Main St, Madrid, 28001, ES')
    })
  })

  describe('Load From Store', () => {
    it('loads address from checkout store when available', () => {
      const storeAddress: Address = {
        type: 'shipping',
        firstName: 'Store',
        lastName: 'User',
        street: '456 Store St',
        city: 'Barcelona',
        postalCode: '08001',
        country: 'ES',
      }

      mockCheckoutStore.shippingInfo = { address: storeAddress } as unknown

      const { loadFromStore, shippingAddress } = useShippingAddress()

      loadFromStore()

      expect(shippingAddress.value).toEqual(storeAddress)
      // Ensure it's a copy, not the same reference
      expect(shippingAddress.value).not.toBe(storeAddress)
    })

    it('does not load when store has no shipping info', () => {
      mockCheckoutStore.shippingInfo = null

      const { loadFromStore, shippingAddress } = useShippingAddress()

      const initialAddress = { ...shippingAddress.value }
      loadFromStore()

      expect(shippingAddress.value).toEqual(initialAddress)
    })
  })

  describe('Reset Functionality', () => {
    it('resets all state to initial values', async () => {
      mockUser.value = { id: 'user-123' } as unknown

      mockFetch.mockResolvedValue({
        success: true,
        addresses: [{
          id: 1,
          type: 'shipping',
          first_name: 'John',
          last_name: 'Doe',
          street: '123 Main St',
          city: 'Madrid',
          postal_code: '28001',
          country: 'ES',
        }],
      })

      const { shippingAddress, loadSavedAddresses, reset, savedAddresses, loading, error } = useShippingAddress()

      // Modify state
      shippingAddress.value.firstName = 'Modified'
      await loadSavedAddresses()

      // Reset
      reset()

      expect(shippingAddress.value).toEqual({
        type: 'shipping',
        firstName: '',
        lastName: '',
        company: '',
        street: '',
        city: '',
        postalCode: '',
        province: '',
        country: '',
        phone: '',
        isDefault: false,
      })
      expect(savedAddresses.value).toEqual([])
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
    })
  })

  describe('Edge Cases', () => {
    it('handles concurrent load operations', async () => {
      mockUser.value = { id: 'user-123' } as unknown

      let callCount = 0
      mockFetch.mockImplementation(() => {
        callCount++
        return Promise.resolve({ success: true, addresses: [] })
      })

      const { loadSavedAddresses } = useShippingAddress()

      // Fire multiple concurrent calls
      await Promise.all([
        loadSavedAddresses(),
        loadSavedAddresses(),
        loadSavedAddresses(),
      ])

      // Should call API for each request (no built-in deduplication)
      expect(callCount).toBe(3)
    })

    it('handles null user value', async () => {
      mockUser.value = null

      const { loadSavedAddresses, savedAddresses } = useShippingAddress()

      await loadSavedAddresses()

      expect(savedAddresses.value).toEqual([])
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('clears error on successful operation after previous error', async () => {
      mockUser.value = { id: 'user-123' } as unknown

      // First call fails
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const { loadSavedAddresses, error } = useShippingAddress()

      await loadSavedAddresses()
      expect(error.value).toBe('Network error')

      // Second call succeeds
      mockFetch.mockResolvedValueOnce({ success: true, addresses: [] })

      await loadSavedAddresses()
      expect(error.value).toBeNull()
    })
  })

  describe('Readonly Properties', () => {
    it('exposes savedAddresses as readonly ref', () => {
      const { savedAddresses } = useShippingAddress()

      // Verify it's a readonly ref by checking its properties
      expect(savedAddresses).toBeDefined()
      expect(Array.isArray(savedAddresses.value)).toBe(true)

      // Attempting to modify will be prevented by Vue's readonly wrapper
      const originalValue = savedAddresses.value
      // @ts-expect-error - intentionally testing readonly behavior
      savedAddresses.value = []
      // Value should remain unchanged due to readonly
      expect(savedAddresses.value).toBe(originalValue)
    })

    it('exposes loading as readonly ref', () => {
      const { loading } = useShippingAddress()

      expect(loading).toBeDefined()
      expect(typeof loading.value).toBe('boolean')

      const originalValue = loading.value
      // @ts-expect-error - intentionally testing readonly behavior
      loading.value = true
      expect(loading.value).toBe(originalValue)
    })

    it('exposes error as readonly ref', () => {
      const { error } = useShippingAddress()

      expect(error).toBeDefined()

      const originalValue = error.value
      // @ts-expect-error - intentionally testing readonly behavior
      error.value = 'test'
      expect(error.value).toBe(originalValue)
    })

    it('exposes isAddressValid as readonly computed', () => {
      const { isAddressValid } = useShippingAddress()

      expect(isAddressValid).toBeDefined()
      expect(typeof isAddressValid.value).toBe('boolean')

      const originalValue = isAddressValid.value
      // @ts-expect-error - intentionally testing readonly behavior
      isAddressValid.value = true
      expect(isAddressValid.value).toBe(originalValue)
    })
  })
})
