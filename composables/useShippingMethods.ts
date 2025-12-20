/**
 * Shipping Methods Composable
 *
 * Manages shipping method loading, caching, and state.
 * Handles API calls with debouncing and error states.
 *
 * Requirements addressed:
 * - 2.1: Dedicated composable for shipping method loading
 * - 2.2: Debouncing and duplicate API call prevention
 * - 2.3: Loading states and error handling
 * - 2.4: Localized method names and descriptions
 */

import { ref } from 'vue'
import type { Ref } from 'vue'
import type { ShippingMethod, Address } from '~/types/checkout'
import { useDebounceFn } from '@vueuse/core'
import { fetchShippingMethods } from '~/lib/checkout/api'

export function useShippingMethods(address: Ref<Address>) {
  const { t } = useI18n()
  const checkoutStore = useCheckoutStore()

  // State
  const availableMethods = ref<ShippingMethod[]>([])
  const selectedMethod = ref<ShippingMethod | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Track last loaded address to prevent duplicate calls
  const lastLoadedAddress = ref<string>('')

  /**
   * Check if address is valid for loading shipping methods
   */
  const isValidAddress = (addr: Address): boolean => {
    return !!(
      addr.country
      && addr.postalCode
      && addr.city
    )
  }

  /**
   * Create address hash for comparison
   */
  const getAddressHash = (addr: Address): string => {
    return `${addr.country}-${addr.postalCode}-${addr.city}`
  }

  /**
   * Get fallback shipping methods when API fails
   */
  const getFallbackMethods = (): ShippingMethod[] => {
    return [
      {
        id: 'standard',
        name: t('checkout.shippingMethod.standard.name'),
        description: t('checkout.shippingMethod.standard.description'),
        price: 5.99,
        estimatedDays: 4,
      },
    ]
  }

  /**
   * Localize shipping method names and descriptions
   */
  const localizeShippingMethods = (methods: any[]): ShippingMethod[] => {
    return methods.map(method => ({
      ...method,
      name: t(`checkout.shippingMethod.${method.id}.name`, method.name),
      description: t(`checkout.shippingMethod.${method.id}.description`, method.description),
    }))
  }

  /**
   * Load shipping methods from API
   * Debounced to prevent excessive API calls
   */
  const loadShippingMethods = useDebounceFn(async () => {
    // Guard: Check if address is valid
    if (!isValidAddress(address.value)) {
      availableMethods.value = []
      selectedMethod.value = null
      return
    }

    // Guard: Check if address has changed
    const addressHash = getAddressHash(address.value)
    if (addressHash === lastLoadedAddress.value) {
      return
    }

    // Guard: Prevent concurrent calls
    if (loading.value) {
      return
    }

    loading.value = true
    error.value = null

    try {
      const orderTotal = (checkoutStore.orderData as { subtotal?: number })?.subtotal || 0

      const methods = await fetchShippingMethods({
        country: address.value.country,
        postalCode: address.value.postalCode,
        orderTotal,
      })

      availableMethods.value = localizeShippingMethods(methods)
      lastLoadedAddress.value = addressHash
    }
    catch (e: any) {
      error.value = e instanceof Error ? e.message : 'Failed to load shipping methods'
      availableMethods.value = getFallbackMethods()
      console.error('Failed to load shipping methods:', e)
    }
    finally {
      loading.value = false
    }
  }, 300)

  /**
   * Retry loading shipping methods
   */
  const retry = () => {
    lastLoadedAddress.value = ''
    loadShippingMethods()
  }

  /**
   * Reset state
   */
  const reset = () => {
    availableMethods.value = []
    selectedMethod.value = null
    loading.value = false
    error.value = null
    lastLoadedAddress.value = ''
  }

  return {
    availableMethods: readonly(availableMethods),
    selectedMethod,
    loading: readonly(loading),
    error: readonly(error),
    loadShippingMethods,
    retry,
    reset,
  }
}
