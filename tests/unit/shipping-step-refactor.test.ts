/**
 * Tests for Shipping Step Refactor
 * 
 * Verifies that the refactored composables and components work correctly.
 * Tests cover:
 * - useShippingMethods composable
 * - useGuestCheckout composable
 * - useShippingAddress composable
 * - Integration between composables
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { useShippingMethods } from '~/composables/useShippingMethods'
import { useGuestCheckout } from '~/composables/useGuestCheckout'
import { useShippingAddress } from '~/composables/useShippingAddress'
import type { Address } from '~/types/checkout'

// Mock dependencies
vi.mock('#app', () => ({
  useI18n: () => ({
    t: (key: string, fallback?: string) => fallback || key
  })
}))

vi.mock('~/stores/checkout', () => ({
  useCheckoutStore: () => ({
    orderData: { subtotal: 100 },
    shippingInfo: null,
    savedAddresses: []
  })
}))

vi.mock('#imports', () => ({
  useSupabaseUser: () => ref(null)
}))

global.$fetch = vi.fn()

describe('useGuestCheckout', () => {
  it('should initialize with default state', () => {
    const { showGuestForm, guestInfo, isGuestInfoValid } = useGuestCheckout()
    
    expect(showGuestForm.value).toBe(process.env.NODE_ENV === 'development')
    expect(guestInfo.value.email).toBeDefined()
    expect(guestInfo.value.emailUpdates).toBe(process.env.NODE_ENV === 'development')
    expect(isGuestInfoValid.value).toBe(process.env.NODE_ENV === 'development')
  })

  it('should show guest form when continueAsGuest is called', () => {
    const { showGuestForm, continueAsGuest } = useGuestCheckout()
    
    showGuestForm.value = false
    continueAsGuest()
    
    expect(showGuestForm.value).toBe(true)
  })

  it('should validate email correctly', () => {
    const { guestInfo, guestErrors, validateGuestField } = useGuestCheckout()
    
    // Test empty email
    guestInfo.value.email = ''
    validateGuestField('email')
    expect(guestErrors.value.email).toBeTruthy()
    
    // Test invalid email
    guestInfo.value.email = 'invalid-email'
    validateGuestField('email')
    expect(guestErrors.value.email).toBeTruthy()
    
    // Test valid email
    guestInfo.value.email = 'test@example.com'
    validateGuestField('email')
    expect(guestErrors.value.email).toBeUndefined()
  })

  it('should clear field errors', () => {
    const { guestErrors, clearGuestFieldError } = useGuestCheckout()
    
    guestErrors.value.email = 'Some error'
    clearGuestFieldError('email')
    
    expect(guestErrors.value.email).toBeUndefined()
  })

  it('should validate all fields', () => {
    const { guestInfo, validateAll } = useGuestCheckout()
    
    // Invalid state
    guestInfo.value.email = ''
    expect(validateAll()).toBe(false)
    
    // Valid state
    guestInfo.value.email = 'test@example.com'
    expect(validateAll()).toBe(true)
  })
})

describe('useShippingAddress', () => {
  it('should initialize with default address', () => {
    const { shippingAddress, isAddressValid } = useShippingAddress()
    
    expect(shippingAddress.value.type).toBe('shipping')
    expect(isAddressValid.value).toBe(process.env.NODE_ENV === 'development')
  })

  it('should validate address correctly', () => {
    const { shippingAddress, isAddressValid } = useShippingAddress()
    
    // Empty address should be invalid
    shippingAddress.value = {
      type: 'shipping',
      firstName: '',
      lastName: '',
      street: '',
      city: '',
      postalCode: '',
      country: '',
      phone: ''
    }
    expect(isAddressValid.value).toBe(false)
    
    // Complete address should be valid
    shippingAddress.value = {
      type: 'shipping',
      firstName: 'John',
      lastName: 'Doe',
      street: '123 Main St',
      city: 'Madrid',
      postalCode: '28001',
      country: 'ES',
      phone: '+34 600 123 456'
    }
    expect(isAddressValid.value).toBe(true)
  })

  it('should format address correctly', () => {
    const { formatAddress } = useShippingAddress()
    
    const address: Address = {
      type: 'shipping',
      firstName: 'John',
      lastName: 'Doe',
      street: '123 Main St',
      city: 'Madrid',
      province: 'Madrid',
      postalCode: '28001',
      country: 'ES',
      phone: '+34 600 123 456'
    }
    
    const formatted = formatAddress(address)
    expect(formatted).toContain('123 Main St')
    expect(formatted).toContain('Madrid')
    expect(formatted).toContain('28001')
    expect(formatted).toContain('ES')
  })
})

describe('useShippingMethods', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with empty methods', () => {
    const address = ref<Address>({
      type: 'shipping',
      firstName: '',
      lastName: '',
      street: '',
      city: '',
      postalCode: '',
      country: '',
      phone: ''
    })
    
    const { availableMethods, selectedMethod, loading, error } = useShippingMethods(address)
    
    expect(availableMethods.value).toEqual([])
    expect(selectedMethod.value).toBeNull()
    expect(loading.value).toBe(false)
    expect(error.value).toBeNull()
  })

  it('should not load methods for invalid address', async () => {
    const address = ref<Address>({
      type: 'shipping',
      firstName: 'John',
      lastName: 'Doe',
      street: '123 Main St',
      city: '',
      postalCode: '',
      country: '',
      phone: ''
    })
    
    const { loadShippingMethods, availableMethods } = useShippingMethods(address)
    
    await loadShippingMethods()
    
    expect(availableMethods.value).toEqual([])
    expect(global.$fetch).not.toHaveBeenCalled()
  })

  it('should load methods for valid address', async () => {
    const mockMethods = [
      {
        id: 'standard',
        name: 'Standard Shipping',
        description: '4-5 business days',
        price: 5.99,
        estimatedDays: 4
      }
    ]
    
    ;(global.$fetch as any).mockResolvedValueOnce({
      success: true,
      methods: mockMethods
    })
    
    const address = ref<Address>({
      type: 'shipping',
      firstName: 'John',
      lastName: 'Doe',
      street: '123 Main St',
      city: 'Madrid',
      postalCode: '28001',
      country: 'ES',
      phone: '+34 600 123 456'
    })
    
    const { loadShippingMethods, availableMethods, loading } = useShippingMethods(address)
    
    await loadShippingMethods()
    
    // Wait for debounce
    await new Promise(resolve => setTimeout(resolve, 450))
    
    expect(global.$fetch).toHaveBeenCalledWith('/api/checkout/shipping-methods', {
      query: {
        country: 'ES',
        postalCode: '28001',
        orderTotal: '100'
      }
    })
  })

  it('should handle API errors gracefully', async () => {
    ;(global.$fetch as any).mockRejectedValueOnce(new Error('API Error'))
    
    const address = ref<Address>({
      type: 'shipping',
      firstName: 'John',
      lastName: 'Doe',
      street: '123 Main St',
      city: 'Madrid',
      postalCode: '28001',
      country: 'ES',
      phone: '+34 600 123 456'
    })
    
    const { loadShippingMethods, error, availableMethods } = useShippingMethods(address)
    
    await loadShippingMethods()
    
    // Wait for debounce
    await new Promise(resolve => setTimeout(resolve, 450))
    
    expect(error.value).toBeTruthy()
    expect(availableMethods.value.length).toBeGreaterThan(0) // Should have fallback methods
  })

  it('should reset state correctly', () => {
    const address = ref<Address>({
      type: 'shipping',
      firstName: 'John',
      lastName: 'Doe',
      street: '123 Main St',
      city: 'Madrid',
      postalCode: '28001',
      country: 'ES',
      phone: '+34 600 123 456'
    })
    
    const { selectedMethod, reset, availableMethods } = useShippingMethods(address)
    
    selectedMethod.value = {
      id: 'standard',
      name: 'Standard',
      description: 'Test',
      price: 5.99,
      estimatedDays: 4
    }
    
    reset()
    
    expect(selectedMethod.value).toBeNull()
    expect(availableMethods.value).toEqual([])
  })
})

describe('Integration Tests', () => {
  it('should work together for guest checkout flow', () => {
    const { showGuestForm, guestInfo, isGuestInfoValid, continueAsGuest, validateAll } = useGuestCheckout()
    const { shippingAddress, isAddressValid } = useShippingAddress()
    const { selectedMethod } = useShippingMethods(shippingAddress)
    
    // Step 1: User continues as guest
    continueAsGuest()
    expect(showGuestForm.value).toBe(true)
    
    // Step 2: User fills in email
    guestInfo.value.email = 'test@example.com'
    expect(validateAll()).toBe(true)
    expect(isGuestInfoValid.value).toBe(true)
    
    // Step 3: User fills in address
    shippingAddress.value = {
      type: 'shipping',
      firstName: 'John',
      lastName: 'Doe',
      street: '123 Main St',
      city: 'Madrid',
      postalCode: '28001',
      country: 'ES',
      phone: '+34 600 123 456'
    }
    expect(isAddressValid.value).toBe(true)
    
    // Step 4: User selects shipping method
    selectedMethod.value = {
      id: 'standard',
      name: 'Standard Shipping',
      description: '4-5 business days',
      price: 5.99,
      estimatedDays: 4
    }
    
    // All conditions met for proceeding to payment
    expect(isGuestInfoValid.value).toBe(true)
    expect(isAddressValid.value).toBe(true)
    expect(selectedMethod.value).not.toBeNull()
  })
})
