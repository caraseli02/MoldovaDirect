<template>
  <div class="hybrid-checkout">
    <!-- Express Checkout Banner for Returning Users -->
    <ExpressCheckoutBannerEnhanced
      v-if="showExpressCheckout"
      :default-address="defaultAddress"
      :preferred-shipping-method="preferredShippingMethod"
      :order-total="formattedTotal"
      :loading="processingOrder"
      @place-order="handleExpressPlaceOrder"
      @edit="dismissExpressCheckout"
      @dismiss="dismissExpressCheckout"
    />

    <!-- Main Checkout Form (shown when express is dismissed or for new users) -->
    <div
      v-show="!showExpressCheckout"
      class="checkout-form-container"
    >
      <!-- Guest/Login Options (for non-authenticated users) -->
      <GuestCheckoutPrompt
        v-if="!user && !showGuestForm"
        :show="true"
        @continue-as-guest="continueAsGuest"
      />

      <!-- Single Page Checkout Form -->
      <div
        v-if="user || showGuestForm"
        class="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        <!-- Left Column: Form Sections -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Guest Email Section -->
          <section
            v-if="!user && showGuestForm"
            class="checkout-section"
          >
            <div class="section-header">
              <div class="flex items-center">
                <span class="section-number">1</span>
                <h3 class="section-title">
                  {{ $t('checkout.hybrid.contact') }}
                </h3>
              </div>
            </div>
            <div class="section-content">
              <GuestInfoForm
                v-model="guestInfo"
                :errors="guestErrors"
                @validate="(field: string) => validateGuestField(field as keyof GuestInfo)"
                @clear-error="clearGuestFieldError"
              />
            </div>
          </section>

          <!-- Shipping Address Section -->
          <section class="checkout-section">
            <div class="section-header">
              <div class="flex items-center">
                <span class="section-number">{{ user ? '1' : '2' }}</span>
                <h3 class="section-title">
                  {{ $t('checkout.hybrid.shippingAddress') }}
                </h3>
              </div>
              <span
                v-if="isAddressComplete"
                class="section-complete"
              >
                <svg
                  class="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </span>
            </div>
            <div class="section-content">
              <AddressForm
                ref="addressFormRef"
                v-model="shippingAddress"
                type="shipping"
                :saved-addresses="[...savedAddresses]"
                :show-save-option="!!user"
                :show-header="false"
                :available-countries="availableCountries"
                @save-address="handleSaveAddress"
                @address-complete="onAddressComplete"
              />
            </div>
          </section>

          <!-- Shipping Method Section -->
          <section
            v-if="isAddressValid"
            class="checkout-section fade-in"
          >
            <div class="section-header">
              <div class="flex items-center">
                <span class="section-number">{{ user ? '2' : '3' }}</span>
                <h3 class="section-title">
                  {{ $t('checkout.hybrid.shippingMethod') }}
                </h3>
              </div>
              <span
                v-if="selectedMethod"
                class="section-complete"
              >
                <svg
                  class="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </span>
            </div>
            <div class="section-content">
              <ShippingMethodSelector
                v-model="selectedMethod"
                :available-methods="[...availableMethods]"
                :loading="loadingMethods"
                :error="methodsError"
                :validation-error="shippingMethodValidationError"
                :auto-selected="shippingMethodAutoSelected"
                @retry="retryLoadingMethods"
              />
            </div>
          </section>

          <!-- Payment Section -->
          <section
            v-if="isAddressValid && selectedMethod"
            class="checkout-section fade-in"
          >
            <div class="section-header">
              <div class="flex items-center">
                <span class="section-number">{{ user ? '3' : '4' }}</span>
                <h3 class="section-title">
                  {{ $t('checkout.hybrid.payment') }}
                </h3>
              </div>
              <span
                v-if="isPaymentValid"
                class="section-complete"
              >
                <svg
                  class="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </span>
            </div>
            <div class="section-content">
              <!-- Cash Payment (Active) -->
              <div class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                <label class="flex items-center cursor-pointer">
                  <input
                    v-model="paymentMethod.type"
                    type="radio"
                    value="cash"
                    class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                  />
                  <div class="ml-3 flex items-center">
                    <span class="text-xl mr-2">💵</span>
                    <div>
                      <p class="font-medium text-gray-900 dark:text-white">
                        {{ $t('checkout.payment.cash.label') }}
                      </p>
                      <p class="text-sm text-gray-600 dark:text-gray-400">
                        {{ $t('checkout.payment.cash.summary') }}
                      </p>
                    </div>
                  </div>
                </label>
              </div>

              <!-- Coming Soon Methods -->
              <div class="mt-3 space-y-2">
                <p class="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {{ $t('checkout.payment.comingSoon') }}
                </p>
                <div class="flex flex-wrap gap-2">
                  <span class="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    💳 {{ $t('checkout.payment.creditCard.label') }}
                  </span>
                  <span class="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    🅿️ {{ $t('checkout.payment.paypal.label') }}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <!-- Delivery Instructions (Optional) -->
          <section
            v-if="isAddressValid && selectedMethod"
            class="checkout-section fade-in"
          >
            <div class="section-header">
              <div class="flex items-center">
                <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {{ $t('checkout.shippingInstructions.title') }}
                  <span class="text-gray-500 text-xs ml-1">({{ $t('common.optional') }})</span>
                </h3>
              </div>
            </div>
            <div class="section-content">
              <ShippingInstructions v-model="shippingInstructions" />
            </div>
          </section>

          <!-- Terms & Place Order Section -->
          <section
            v-if="canShowPlaceOrder"
            class="checkout-section checkout-section-highlight fade-in"
          >
            <div class="section-content">
              <!-- Terms Checkboxes -->
              <div class="space-y-3 mb-6">
                <label class="flex items-start cursor-pointer">
                  <input
                    v-model="termsAccepted"
                    type="checkbox"
                    class="h-4 w-4 mt-0.5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {{ $t('checkout.review.acceptTerms') }}
                    <a
                      href="/terms"
                      target="_blank"
                      class="text-primary-600 hover:text-primary-700 underline"
                    >
                      {{ $t('checkout.review.termsOfService') }}
                    </a>
                    <span
                      v-if="showTermsError"
                      class="text-red-500 text-xs ml-1"
                    >*</span>
                  </span>
                </label>

                <label class="flex items-start cursor-pointer">
                  <input
                    v-model="privacyAccepted"
                    type="checkbox"
                    class="h-4 w-4 mt-0.5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {{ $t('checkout.review.acceptPrivacy') }}
                    <a
                      href="/privacy"
                      target="_blank"
                      class="text-primary-600 hover:text-primary-700 underline"
                    >
                      {{ $t('checkout.review.privacyPolicy') }}
                    </a>
                    <span
                      v-if="showPrivacyError"
                      class="text-red-500 text-xs ml-1"
                    >*</span>
                  </span>
                </label>

                <label class="flex items-start cursor-pointer">
                  <input
                    v-model="marketingConsent"
                    type="checkbox"
                    class="h-4 w-4 mt-0.5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span class="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    {{ $t('checkout.review.marketingConsent') }}
                  </span>
                </label>
              </div>

              <!-- Place Order Button (Desktop) -->
              <button
                :disabled="!canPlaceOrder || processingOrder"
                class="hidden lg:flex w-full items-center justify-center px-6 py-4 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                @click="handlePlaceOrder"
              >
                <span
                  v-if="processingOrder"
                  class="flex items-center"
                >
                  <svg
                    class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    />
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  {{ $t('checkout.processing') }}
                </span>
                <span
                  v-else
                  class="flex items-center"
                >
                  {{ $t('checkout.placeOrder') }} - {{ formattedTotal }}
                  <svg
                    class="ml-2 w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
              </button>
            </div>
          </section>
        </div>

        <!-- Right Column: Sticky Order Summary -->
        <div class="lg:col-span-1">
          <div class="sticky top-6">
            <OrderSummaryCard
              :items="cartItems"
              :subtotal="calculatedSubtotal"
              :shipping-cost="calculatedShippingCost"
              :tax="calculatedTax"
              :total="calculatedTotal"
              :shipping-method="selectedMethod"
              :loading="loadingOrder"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Sticky Footer -->
    <div
      v-if="(user || showGuestForm) && canShowPlaceOrder && !showExpressCheckout"
      class="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 z-50 shadow-lg"
    >
      <div class="flex items-center justify-between mb-3">
        <span class="text-sm text-gray-600 dark:text-gray-400">{{ $t('common.total') }}</span>
        <span class="text-lg font-bold text-gray-900 dark:text-white">{{ formattedTotal }}</span>
      </div>
      <button
        :disabled="!canPlaceOrder || processingOrder"
        class="w-full flex items-center justify-center px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
        @click="handlePlaceOrder"
      >
        <span
          v-if="processingOrder"
          class="flex items-center"
        >
          <svg
            class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {{ $t('checkout.processing') }}
        </span>
        <span v-else>{{ $t('checkout.placeOrder') }}</span>
      </button>
    </div>

    <!-- Back to Cart Link -->
    <div
      v-if="!showExpressCheckout && (user || showGuestForm)"
      class="mt-6 text-center lg:text-left"
    >
      <NuxtLink
        :to="localePath('/cart')"
        class="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
      >
        <svg
          class="w-4 h-4 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        {{ $t('checkout.backToCart') }}
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ShippingInformation, PaymentMethod as PaymentMethodType, ShippingMethod } from '~/types/checkout'
import type { GuestInfo } from '~/composables/useGuestCheckout'
import type { Address } from '~/types/address'
import { useCartStore } from '~/stores/cart'

// Components
const ExpressCheckoutBannerEnhanced = defineAsyncComponent(() =>
  import('~/components/checkout/ExpressCheckoutBannerEnhanced.vue'),
)
const AddressForm = defineAsyncComponent(() =>
  import('~/components/checkout/AddressForm.vue'),
)
const ShippingMethodSelector = defineAsyncComponent(() =>
  import('~/components/checkout/ShippingMethodSelector.vue'),
)
const GuestCheckoutPrompt = defineAsyncComponent(() =>
  import('~/components/checkout/GuestCheckoutPrompt.vue'),
)
const GuestInfoForm = defineAsyncComponent(() =>
  import('~/components/checkout/GuestInfoForm.vue'),
)
const ShippingInstructions = defineAsyncComponent(() =>
  import('~/components/checkout/ShippingInstructions.vue'),
)
const OrderSummaryCard = defineAsyncComponent(() =>
  import('~/components/checkout/OrderSummaryCard.vue'),
)

// Composables
const localePath = useLocalePath()
const user = useSupabaseUser()
const checkoutStore = useCheckoutStore()
const cartStore = useCartStore()
const { t } = useI18n()
const toast = useToast()

// Component refs
const addressFormRef = ref<{ validateForm: () => boolean } | null>(null)

// Guest checkout composable
const {
  showGuestForm,
  guestInfo,
  guestErrors,
  isGuestInfoValid,
  continueAsGuest,
  validateGuestField,
  clearGuestFieldError,
  validateAll: validateGuestInfo,
} = useGuestCheckout()

// Shipping address composable
const {
  shippingAddress,
  savedAddresses,
  defaultAddress,
  isAddressValid,
  loadSavedAddresses,
  handleSaveAddress,
  loadFromStore: loadAddressFromStore,
} = useShippingAddress()

// Shipping methods composable
const {
  availableMethods,
  selectedMethod,
  loading: loadingMethods,
  error: methodsError,
  autoSelected: shippingMethodAutoSelected,
  loadShippingMethods,
  retry: retryLoadingMethods,
} = useShippingMethods(shippingAddress)

// Local state
const processingOrder = ref(false)
const loadingOrder = ref(false)
const expressCheckoutDismissed = ref(false)
const shippingInstructions = ref('')

// Payment state
const paymentMethod = ref<PaymentMethodType>({
  type: 'cash',
  saveForFuture: false,
})

// Terms state
const termsAccepted = ref(false)
const privacyAccepted = ref(false)
const marketingConsent = ref(false)
const showTermsError = ref(false)
const showPrivacyError = ref(false)

// Countries with flags for display in dropdown
const availableCountries = ref([
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'RO', name: 'Romania', flag: '🇷🇴' },
  { code: 'MD', name: 'Moldova', flag: '🇲🇩' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
])

// Computed - map cart items to the format expected by OrderSummaryCard
const cartItems = computed(() => {
  return (cartStore.items || []).map(item => ({
    productId: item.product.id,
    name: item.product.name,
    quantity: item.quantity,
    price: item.product.price,
    images: item.product.images,
  }))
})

const orderData = computed(() => (checkoutStore as any).orderData)

// Calculate order totals directly from cart items (fallback for reactivity issues)
const calculatedSubtotal = computed(() => {
  return cartStore.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
})

const calculatedShippingCost = computed(() => {
  return selectedMethod.value?.price || 0
})

const calculatedTax = computed(() => {
  // 21% VAT for Spain
  return Math.round(calculatedSubtotal.value * 0.21 * 100) / 100
})

const calculatedTotal = computed(() => {
  return calculatedSubtotal.value + calculatedShippingCost.value + calculatedTax.value
})

const formattedTotal = computed(() => {
  const total = calculatedTotal.value || orderData.value?.total || 0
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(total)
})

const preferredShippingMethod = computed(() => {
  return (checkoutStore as any).preferences?.preferred_shipping_method || null
})

const showExpressCheckout = computed(() => {
  return user.value
    && defaultAddress.value
    && !expressCheckoutDismissed.value
    && savedAddresses.value.length > 0
})

const isAddressComplete = computed(() => {
  return isAddressValid.value && shippingAddress.value.firstName && shippingAddress.value.street
})

const isPaymentValid = computed(() => {
  return paymentMethod.value.type === 'cash'
})

const shippingMethodValidationError = computed(() => {
  if (!selectedMethod.value && isAddressValid.value) {
    return t('checkout.validation.shippingMethodRequired')
  }
  return null
})

const canShowPlaceOrder = computed(() => {
  return isAddressValid.value && selectedMethod.value && isPaymentValid.value
})

const canPlaceOrder = computed(() => {
  const guestCheckPassed = user.value ? true : isGuestInfoValid.value
  return guestCheckPassed
    && isAddressValid.value
    && selectedMethod.value !== null
    && isPaymentValid.value
    && termsAccepted.value
    && privacyAccepted.value
})

// Methods
const dismissExpressCheckout = () => {
  expressCheckoutDismissed.value = true
}

const onAddressComplete = () => {
  if (isAddressValid.value) {
    loadShippingMethods()
  }
}

const handleExpressPlaceOrder = async () => {
  if (!defaultAddress.value) return

  processingOrder.value = true

  try {
    // Get default shipping method
    const defaultMethod: ShippingMethod = {
      id: 'standard',
      name: t('checkout.shippingMethod.standard.name', 'Standard Shipping'),
      description: t('checkout.shippingMethod.standard.description', 'Delivery in 3-5 business days'),
      price: 5.99,
      estimatedDays: 4,
    }

    // Create shipping info
    const shippingInfo: ShippingInformation = {
      address: defaultAddress.value,
      method: defaultMethod,
      instructions: undefined,
    }

    // Update checkout store
    await (checkoutStore as any).updateShippingInfo(shippingInfo)
    await (checkoutStore as any).updatePaymentMethod({ type: 'cash', saveForFuture: false })

    // Process order
    await processOrder()
  }
  catch (error: any) {
    console.error('Express checkout failed:', error)

    // Provide actionable guidance based on error type
    const errorMessage = error?.message || ''
    const isNetworkError = errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('Failed to fetch')
    const isSessionError = errorMessage.includes('session') || errorMessage.includes('expired') || errorMessage.includes('unauthorized')

    if (isNetworkError) {
      toast.error(
        t('checkout.errors.networkError', 'Connection Error'),
        t('checkout.errors.checkConnection', 'Please check your internet connection and try again.'),
      )
    }
    else if (isSessionError) {
      toast.error(
        t('checkout.errors.sessionExpired', 'Session Expired'),
        t('checkout.errors.refreshPage', 'Your session has expired. Please refresh the page.'),
      )
    }
    else {
      toast.error(
        t('checkout.errors.expressCheckoutFailed', 'Express Checkout Failed'),
        t('checkout.errors.tryFullCheckout', 'Please use the full checkout form below.'),
      )
      // Offer to switch to full checkout
      dismissExpressCheckout()
    }
  }
  finally {
    processingOrder.value = false
  }
}

const handlePlaceOrder = async () => {
  // Validate terms
  showTermsError.value = !termsAccepted.value
  showPrivacyError.value = !privacyAccepted.value

  if (!termsAccepted.value || !privacyAccepted.value) {
    toast.error(
      t('checkout.validation.error'),
      t('checkout.validation.acceptTermsRequired'),
    )
    return
  }

  // Validate guest info if needed
  if (!user.value && showGuestForm.value) {
    if (!validateGuestInfo()) {
      toast.error(
        t('checkout.validation.error'),
        t('checkout.validation.guestInfoInvalid'),
      )
      return
    }
  }

  // Validate address form
  if (addressFormRef.value && !addressFormRef.value.validateForm()) {
    toast.error(
      t('checkout.validation.error'),
      t('checkout.validation.addressInvalid'),
    )
    return
  }

  processingOrder.value = true

  try {
    // Create shipping information
    const shippingInfo: ShippingInformation = {
      address: shippingAddress.value as Address,
      method: selectedMethod.value!,
      instructions: shippingInstructions.value || undefined,
    }

    // Update guest info if needed
    if (!user.value && showGuestForm.value) {
      await (checkoutStore as any).updateGuestInfo({
        email: guestInfo.value.email.trim(),
        emailUpdates: guestInfo.value.emailUpdates,
      })
    }

    // Update checkout store
    await (checkoutStore as any).updateShippingInfo(shippingInfo)
    await (checkoutStore as any).updatePaymentMethod(paymentMethod.value)

    // Process order
    await processOrder()
  }
  catch (error: any) {
    console.error('Failed to place order:', error)

    // Provide user-friendly error message without exposing technical details
    const errorMessage = error?.message || ''
    const isNetworkError = errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('Failed to fetch')
    const isValidationError = errorMessage.includes('validation') || errorMessage.includes('invalid')

    if (isNetworkError) {
      toast.error(
        t('checkout.errors.networkError', 'Connection Error'),
        t('checkout.errors.checkConnection', 'Please check your internet connection and try again.'),
      )
    }
    else if (isValidationError) {
      toast.error(
        t('checkout.errors.validationFailed', 'Please Check Your Information'),
        t('checkout.errors.reviewFields', 'Some fields may need to be corrected.'),
      )
    }
    else {
      toast.error(
        t('checkout.errors.orderFailed', 'Order Failed'),
        t('checkout.errors.pleaseTryAgain', 'Please try again or contact support if the issue persists.'),
      )
    }
  }
  finally {
    processingOrder.value = false
  }
}

const processOrder = async () => {
  // Set terms acceptance in store before processing
  ;(checkoutStore as any).setTermsAccepted(true)
  ;(checkoutStore as any).setPrivacyAccepted(true)
  ;(checkoutStore as any).setMarketingConsent(marketingConsent.value)

  // Set step to review for checkout flow
  ;(checkoutStore as any).currentStep = 'review'

  try {
    // Process payment - this handles the full checkout flow:
    // 1. Creates order record
    // 2. Processes payment by type
    // 3. Calls completeCheckout with order data
    await (checkoutStore as any).processPayment()
  }
  catch (paymentError: any) {
    // Log error for debugging (production would use proper error tracking)
    console.error('Payment processing failed:', paymentError)
    throw paymentError // Re-throw to be handled by caller
  }

  try {
    // Navigate to confirmation after successful payment
    await navigateTo(localePath('/checkout/confirmation'))
  }
  catch (navError: any) {
    // Payment succeeded but navigation failed - critical scenario
    console.error('Navigation to confirmation failed after successful payment:', navError)

    toast.warning(
      t('checkout.success.orderCompleted'),
      t('checkout.errors.redirectManually', 'Please navigate to your orders to see confirmation.'),
    )

    // Attempt recovery by using window.location
    setTimeout(() => {
      window.location.href = localePath('/checkout/confirmation')
    }, 2000)
  }
}

// Initialize
onMounted(async () => {
  loadingOrder.value = true

  try {
    // Ensure cart is loaded from storage first (required for SSR hydration)
    await cartStore.loadFromStorage()

    // Calculate order data from cart items
    await (checkoutStore as any).calculateOrderData()

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
    const storedGuestInfo = (checkoutStore as any).guestInfo
    if (!user.value && storedGuestInfo) {
      showGuestForm.value = true
      guestInfo.value = {
        email: storedGuestInfo.email,
        emailUpdates: storedGuestInfo.emailUpdates,
      }
    }

    // Load shipping info from store if available
    const storedShippingInfo = (checkoutStore as any).shippingInfo
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
})
</script>

<style scoped>
.hybrid-checkout {
  width: 100%;
}

.checkout-section {
  background-color: white;
  border-radius: 0.5rem;
  border: 1px solid rgb(229 231 235);
  overflow: hidden;
}

:root.dark .checkout-section,
.dark .checkout-section {
  background-color: rgb(31 41 55);
  border-color: rgb(55 65 81);
}

.checkout-section-highlight {
  border-color: rgb(191 219 254);
  background-color: rgb(239 246 255 / 0.5);
}

:root.dark .checkout-section-highlight,
.dark .checkout-section-highlight {
  border-color: rgb(30 64 175);
  background-color: rgb(30 58 138 / 0.1);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgb(243 244 246);
}

:root.dark .section-header,
.dark .section-header {
  border-bottom-color: rgb(55 65 81);
}

.section-number {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 9999px;
  background-color: rgb(79 70 229);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 500;
  margin-right: 0.75rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: rgb(17 24 39);
}

:root.dark .section-title,
.dark .section-title {
  color: white;
}

.section-complete {
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 9999px;
  background-color: rgb(34 197 94);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-content {
  padding: 1.5rem;
}

.fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Mobile bottom padding for sticky footer */
@media (max-width: 1024px) {
  .checkout-form-container {
    padding-bottom: 120px;
  }
}
</style>
