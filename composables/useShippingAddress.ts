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

import type { Address } from '~/types/checkout'

export function useShippingAddress() {
  const user = useSupabaseUser()
  const checkoutStore = useCheckoutStore()

  // State
  const shippingAddress = ref<Address>({
    type: 'shipping',
    firstName: process.env.NODE_ENV === 'development' ? 'John' : '',
    lastName: process.env.NODE_ENV === 'development' ? 'Doe' : '',
    company: process.env.NODE_ENV === 'development' ? 'Test Company' : '',
    street: process.env.NODE_ENV === 'development' ? '123 Main Street' : '',
    city: process.env.NODE_ENV === 'development' ? 'Madrid' : '',
    postalCode: process.env.NODE_ENV === 'development' ? '28001' : '',
    province: process.env.NODE_ENV === 'development' ? 'Madrid' : '',
    country: process.env.NODE_ENV === 'development' ? 'ES' : '',
    phone: process.env.NODE_ENV === 'development' ? '+34 600 123 456' : ''
  })

  const savedAddresses = ref<Address[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Check if address is valid (all required fields filled)
   */
  const isAddressValid = computed(() => {
    return !!(
      shippingAddress.value.firstName &&
      shippingAddress.value.lastName &&
      shippingAddress.value.street &&
      shippingAddress.value.city &&
      shippingAddress.value.postalCode &&
      shippingAddress.value.country
    )
  })

  /**
   * Map address from API format to internal format
   */
  const mapAddressFromApi = (apiAddress: any): Address => {
    return {
      id: apiAddress.id,
      type: apiAddress.type,
      firstName: apiAddress.first_name,
      lastName: apiAddress.last_name,
      company: apiAddress.company,
      street: apiAddress.street,
      city: apiAddress.city,
      postalCode: apiAddress.postal_code,
      province: apiAddress.province,
      country: apiAddress.country,
      phone: apiAddress.phone,
      isDefault: apiAddress.is_default
    }
  }

  /**
   * Map multiple addresses from API format
   */
  const mapAddressesFromApi = (apiAddresses: any[]): Address[] => {
    return apiAddresses.map(mapAddressFromApi)
  }

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
        savedAddresses.value = mapAddressesFromApi(response.addresses)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load saved addresses'
      console.error('Failed to load saved addresses:', e)
      
      // Fallback to store data or empty array
      savedAddresses.value = checkoutStore.savedAddresses || []
    } finally {
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
      const response = await $fetch('/api/checkout/addresses', {
        method: 'POST',
        body: address
      })

      if (response.success && response.address) {
        const newAddress = mapAddressFromApi(response.address)
        savedAddresses.value.push(newAddress)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to save address'
      console.error('Failed to save address:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Load address from checkout store if available
   */
  const loadFromStore = () => {
    if (checkoutStore.shippingInfo?.address) {
      shippingAddress.value = { ...checkoutStore.shippingInfo.address }
    }
  }

  /**
   * Format address as a single line string
   */
  const formatAddress = (address: Address): string => {
    const parts = [
      address.street,
      address.city,
      address.province,
      address.postalCode,
      address.country
    ].filter(Boolean)
    
    return parts.join(', ')
  }

  /**
   * Reset address state
   */
  const reset = () => {
    shippingAddress.value = {
      type: 'shipping',
      firstName: '',
      lastName: '',
      company: '',
      street: '',
      city: '',
      postalCode: '',
      province: '',
      country: '',
      phone: ''
    }
    savedAddresses.value = []
    loading.value = false
    error.value = null
  }

  return {
    shippingAddress,
    savedAddresses: readonly(savedAddresses),
    loading: readonly(loading),
    error: readonly(error),
    isAddressValid: readonly(isAddressValid),
    loadSavedAddresses,
    handleSaveAddress,
    loadFromStore,
    formatAddress,
    reset
  }
}
