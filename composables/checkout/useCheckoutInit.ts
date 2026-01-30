/**
 * Checkout Initialization Composable
 *
 * Handles the complex initialization logic for the checkout flow.
 * Extracted from HybridCheckout.vue for better testability.
 *
 * @see {CODE_DESIGN_PRINCIPLES.md} Three-layer separation
 */

import type { Ref } from 'vue'
import type { Address, ShippingMethod } from '~/types/checkout'
import { useCartStore } from '~/stores/cart'

export interface UseCheckoutInitOptions {
  user: Ref<any>
  shippingAddress: Ref<Address>
  selectedMethod: Ref<ShippingMethod | null>
  savedAddresses: Ref<ReadonlyArray<Address>>
  defaultAddress: Ref<Address | null>
  showGuestForm: Ref<boolean>
  guestInfo: Ref<{ email: string, emailUpdates: boolean }>
  shippingInstructions: Ref<string>
  isAddressValid: Ref<boolean>
}

export function useCheckoutInit(options: UseCheckoutInitOptions) {
  const {
    user,
    shippingAddress,
    selectedMethod,
    defaultAddress,
    showGuestForm,
    guestInfo,
    shippingInstructions,
    isAddressValid,
  } = options

  const checkoutStore = useCheckoutStore()
  const cartStore = useCartStore()
  const { t } = useI18n()
  const toast = useToast()

  // Composables
  const {
    loadSavedAddresses,
    handleSaveAddress,
    loadFromStore: loadAddressFromStore,
  } = useShippingAddress()

  const {
    loadShippingMethods,
  } = useShippingMethods(shippingAddress)

  const loadingOrder = ref(false)

  /**
   * Initialize checkout data
   */
  const initializeCheckout = async () => {
    loadingOrder.value = true

    try {
      // Ensure cart is loaded from storage first (required for SSR hydration)
      await cartStore.loadFromStorage()

      // Calculate order data from cart items
      await checkoutStore.calculateOrderData()

      // Load existing data from store
      loadAddressFromStore()

      // Load saved addresses for authenticated users
      if (user.value) {
        await loadSavedAddresses()

        // Auto-select default address if available
        if (defaultAddress.value && !shippingAddress.value.street) {
          shippingAddress.value = { ...defaultAddress.value }
          if (shippingAddress.value.country && shippingAddress.value.postalCode) {
            loadShippingMethods()
          }
        }
      }

      // Load guest info if available
      const storedGuestInfo = checkoutStore.guestInfo
      if (!user.value && storedGuestInfo) {
        showGuestForm.value = true
        guestInfo.value = {
          email: storedGuestInfo.email,
          emailUpdates: storedGuestInfo.emailUpdates,
        }
      }

      // Load shipping info from store if available
      const storedShippingInfo = checkoutStore.shippingInfo
      if (storedShippingInfo) {
        if (storedShippingInfo.method) {
          selectedMethod.value = storedShippingInfo.method
        }
        if (storedShippingInfo.instructions) {
          shippingInstructions.value = storedShippingInfo.instructions
        }
      }

      // Load shipping methods if address is valid
      if (isAddressValid.value && shippingAddress.value.country && shippingAddress.value.postalCode) {
        loadShippingMethods()
      }
    }
    catch (error) {
      console.error('Failed to initialize checkout:', error)
      toast.error(
        t('checkout.errors.initFailed'),
        t('checkout.errors.pleaseTryAgain'),
      )
    }
    finally {
      loadingOrder.value = false
    }
  }

  return {
    loadingOrder,
    initializeCheckout,
    handleSaveAddress,
    loadShippingMethods,
  }
}
