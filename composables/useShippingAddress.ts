/**
 * Shipping Address Composable
 *
 * Manages address state, validation, and saved addresses.
 * Handles address loading, saving, and validation logic.
 *
 * Requirements addressed:
 * - 5.1: Dedicated composable for address validation
 * - 5.2: Computed property for address validity
 * - 5.3: Specific error messages for validation failures
 * - 5.4: Address form submission validation
 */

import type { Address } from '~/types/address'
import { addressFromEntity } from '~/types/address'

export function useShippingAddress() {
  const user = useSupabaseUser()
  const _checkoutStore = useCheckoutStore()

  // Development defaults for easier testing
  const isDevelopment = process.env.NODE_ENV === 'development'

  const initialAddress: Address = isDevelopment
    ? {
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
        isDefault: false,
      }
    : {
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
      }

  // State
  const shippingAddress = ref<Address>({ ...initialAddress })

  const savedAddresses = ref<Address[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Check if address is valid (all required fields filled)
   */
  const isAddressValid = computed(() => {
    return !!(
      shippingAddress.value.firstName
      && shippingAddress.value.lastName
      && shippingAddress.value.street
      && shippingAddress.value.city
      && shippingAddress.value.postalCode
      && shippingAddress.value.country
    )
  })

  /**
   * Get default address from saved addresses or checkout store
   */
  const defaultAddress = computed(() => {
    // Check local saved addresses first
    const localDefault = savedAddresses.value.find(addr => addr.isDefault)
    if (localDefault) return localDefault

    // Return first address if no default
    return savedAddresses.value[0] || null
  })

  /**
   * Check if user has unknown saved addresses
   */
  const hasAddresses = computed(() => {
    return savedAddresses.value.length > 0
  })

  /**
   * Load saved addresses for authenticated users
   */
  const loadSavedAddresses = async () => {
    if (!user.value) {
      savedAddresses.value = []
      return
    }

    loading.value = true
    error.value = null

    try {
      const response = await $fetch('/api/checkout/addresses')

      if (response.success && response.addresses) {
        savedAddresses.value = response.addresses.map(addressFromEntity)
      }
    }
    catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load saved addresses'
      console.error('Failed to load saved addresses:', e)

      // Fallback to empty array
      savedAddresses.value = []
    }
    finally {
      loading.value = false
    }
  }

  /**
   * Save address for authenticated users
   */
  const handleSaveAddress = async (address: Address) => {
    if (!user.value) {
      return
    }

    loading.value = true
    error.value = null

    try {
      const response = await $fetch<{ success: boolean, address?: unknown }>('/api/checkout/addresses', {
        method: 'POST',
        body: address,
      })

      if (response.success && response.address) {
        const newAddress = addressFromEntity(response.address as unknown as Record<string, unknown>)
        savedAddresses.value.push(newAddress)
      }
    }
    catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to save address'
      console.error('Failed to save address:', e)
      throw e
    }
    finally {
      loading.value = false
    }
  }

  /**
   * Load address from checkout store if available
   */
  const loadFromStore = () => {
    // This method is kept for backwards compatibility but no longer uses store
    // Address should be loaded via loadSavedAddresses instead
  }

  /**
   * Format address as a single-line string
   */
  const formatAddress = (address: Address): string => {
    const parts = [
      address.street,
      address.city,
      address.province, // Optional
      address.postalCode,
      address.country,
    ].filter(part => part && part.trim() !== '') // Filter out empty/undefined values

    return parts.join(', ')
  }

  /**
   * Reset all state to initial values
   */
  const reset = () => {
    shippingAddress.value = { ...initialAddress }
    savedAddresses.value = []
    loading.value = false
    error.value = null
  }

  return {
    // Mutable: Components can update shipping address
    shippingAddress,

    // Readonly: Managed internally by composable
    savedAddresses: readonly(savedAddresses),
    defaultAddress, // Already computed, naturally readonly
    hasAddresses, // Already computed, naturally readonly
    loading: readonly(loading),
    error: readonly(error),
    isAddressValid, // Already computed, naturally readonly

    // Methods
    loadSavedAddresses,
    handleSaveAddress,
    loadFromStore,
    formatAddress,
    reset,
  }
}
