/**
 * Checkout State Composable
 *
 * Computed properties and state management for checkout flow.
 * Extracted from HybridCheckout.vue to reduce component size.
 *
 * @see {CODE_DESIGN_PRINCIPLES.md} Three-layer separation
 */

import type { Ref } from 'vue'
import type { Address } from '~/types/checkout'

export interface UseCheckoutStateOptions {
  user: Ref<any>
  defaultAddress: Ref<Address | null>
  savedAddresses: Ref<ReadonlyArray<Address>>
  expressCheckoutDismissed: Ref<boolean>
  checkoutStore: ReturnType<typeof useCheckoutStore>
}

export function useCheckoutState(options: UseCheckoutStateOptions) {
  const {
    user,
    defaultAddress,
    savedAddresses,
    expressCheckoutDismissed,
    checkoutStore,
  } = options

  const preferredShippingMethod = computed(() =>
    checkoutStore.preferences?.preferred_shipping_method || null)

  const orderCurrency = computed(() => checkoutStore.orderData?.currency || 'EUR')

  const showExpressCheckout = computed(() =>
    user.value
    && defaultAddress.value
    && !expressCheckoutDismissed.value
    && savedAddresses.value.length > 0)

  const showExpressEligibilityHint = computed(() => !!user.value && !showExpressCheckout.value)

  return {
    preferredShippingMethod,
    orderCurrency,
    showExpressCheckout,
    showExpressEligibilityHint,
  }
}
