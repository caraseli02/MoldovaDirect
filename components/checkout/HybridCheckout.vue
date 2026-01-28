<template>
  <div class="hybrid-checkout">
    <!-- Express Checkout Banner for Returning Users -->
    <ExpressCheckoutBannerEnhanced
      v-if="showExpressCheckout"
      :default-address="defaultAddress"
      :preferred-shipping-method="preferredShippingMethod"
      :order-total="formatted"
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
        <div class="lg:col-span-2 space-y-4">
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
          <CheckoutPaymentSection
            v-if="isAddressValid && selectedMethod"
            ref="paymentSectionRef"
            v-model="paymentMethod"
            :section-number="user ? '3' : '4'"
            @stripe-ready="onStripeReady"
            @stripe-error="onStripeError"
          />

          <!-- Delivery Instructions (Optional) -->
          <section
            v-if="isAddressValid && selectedMethod"
            class="checkout-section fade-in"
          >
            <div class="section-content">
              <ShippingInstructions v-model="shippingInstructions" />
            </div>
          </section>

          <!-- Terms & Place Order Section -->
          <CheckoutTermsSection
            v-if="true"
            v-model:terms-accepted="termsAccepted"
            v-model:privacy-accepted="privacyAccepted"
            v-model:marketing-consent="marketingConsent"
            :can-place-order="canPlaceOrder"
            :processing-order="processingOrder"
            :formatted-total="formatted"
            :show-terms-error="showTermsError"
            :show-privacy-error="showPrivacyError"
            @place-order="handlePlaceOrderWithValidation"
          />
        </div>

        <!-- Right Column: Sticky Order Summary -->
        <div class="lg:col-span-1">
          <div class="sticky top-6">
            <OrderSummaryCard
              :items="cartItems"
              :subtotal="subtotal"
              :shipping-cost="shippingCost"
              :tax="tax"
              :total="total"
              :shipping-method="selectedMethod"
              :loading="loadingOrder"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Sticky Footer -->
    <CheckoutMobileFooter
      v-if="(user || showGuestForm) && !showExpressCheckout"
      :can-place-order="canPlaceOrder"
      :processing-order="processingOrder"
      :formatted-total="formatted"
      @place-order="handlePlaceOrderWithValidation"
    />

    <!-- Back to Cart Link -->
    <div
      v-if="!showExpressCheckout && (user || showGuestForm)"
      class="mt-6 text-center lg:text-left"
    >
      <NuxtLink
        :to="localePath('/cart')"
        class="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-slate-600 dark:hover:text-slate-400 transition-colors"
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
import type { PaymentMethod } from '~/types/checkout'
import type { ValidatableForm, PaymentForm } from '~/composables/useCheckoutOrder'
import { useCartStore } from '~/stores/cart'

/**
 * HybridCheckout Component
 *
 * Orchestrates the checkout flow by coordinating child components and composables.
 * Follows the principle of separating business logic from UI presentation.
 *
 * @see {CODE_DESIGN_PRINCIPLES.md} Component size limits & three-layer separation
 */

// Components - with error handling for async loading failures
const createAsyncComponent = (loader: () => Promise<unknown>, name: string) =>
  defineAsyncComponent({
    loader: loader as () => Promise<{ default: object }>,
    onError(error, retry, fail, attempts) {
      console.error(`[Checkout] Failed to load ${name} (attempt ${attempts}):`, error)
      if (attempts <= 2) {
        retry()
      }
      else {
        fail()
      }
    },
  })

const ExpressCheckoutBannerEnhanced = createAsyncComponent(
  () => import('~/components/checkout/ExpressCheckoutBannerEnhanced.vue'),
  'ExpressCheckoutBanner',
)
const AddressForm = createAsyncComponent(
  () => import('~/components/checkout/AddressForm.vue'),
  'AddressForm',
)
const ShippingMethodSelector = createAsyncComponent(
  () => import('~/components/checkout/ShippingMethodSelector.vue'),
  'ShippingMethodSelector',
)
const GuestCheckoutPrompt = createAsyncComponent(
  () => import('~/components/checkout/GuestCheckoutPrompt.vue'),
  'GuestCheckoutPrompt',
)
const GuestInfoForm = createAsyncComponent(
  () => import('~/components/checkout/GuestInfoForm.vue'),
  'GuestInfoForm',
)
const ShippingInstructions = createAsyncComponent(
  () => import('~/components/checkout/ShippingInstructions.vue'),
  'ShippingInstructions',
)
const OrderSummaryCard = createAsyncComponent(
  () => import('~/components/checkout/OrderSummaryCard.vue'),
  'OrderSummaryCard',
)
const CheckoutPaymentSection = createAsyncComponent(
  () => import('~/components/checkout/hybrid/PaymentSection.vue'),
  'PaymentSection',
)
const CheckoutTermsSection = createAsyncComponent(
  () => import('~/components/checkout/hybrid/TermsSection.vue'),
  'TermsSection',
)
const CheckoutMobileFooter = createAsyncComponent(
  () => import('~/components/checkout/hybrid/MobileFooter.vue'),
  'MobileFooter',
)

// Composables
const localePath = useLocalePath()
const user = useSupabaseUser()
const checkoutStore = useCheckoutStore()
const cartStore = useCartStore()
const { t } = useI18n()
const toast = useToast()

// Component refs with proper types
const addressFormRef = ref<ValidatableForm | null>(null)
const paymentSectionRef = ref<PaymentForm | null>(null)

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
const loadingOrder = ref(false)
const expressCheckoutDismissed = ref(false)
const shippingInstructions = ref('')
const stripeReady = ref(false)
const stripeError = ref<string | null>(null)

// Payment state
const paymentMethod = ref<PaymentMethod>({
  type: 'cash',
  saveForFuture: false,
})

// Countries with flags for display in dropdown
const availableCountries = ref([
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'RO', name: 'Romania', flag: '🇷🇴' },
  { code: 'MD', name: 'Moldova', flag: '🇲🇩' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
])

// Checkout totals composable
const { subtotal, shippingCost, tax, total, formatted, cartItems } = useCheckoutTotals(selectedMethod)

// Checkout terms composable
const {
  termsAccepted,
  privacyAccepted,
  marketingConsent,
  showTermsError,
  showPrivacyError,
  validateTerms,
} = useCheckoutTerms()

// Checkout validation composable
const {
  isAddressComplete,
  isPaymentValid,
  shippingMethodValidationError,
  canShowPlaceOrder,
  canPlaceOrder,
} = useCheckoutValidation({
  isAddressValid,
  shippingAddress,
  selectedMethod,
  isGuestInfoValid,
  paymentMethod,
  stripeReady,
  stripeError,
  termsAccepted,
  privacyAccepted,
  isAuthenticated: computed(() => !!user.value),
})

// Checkout order processing composable
const {
  processingOrder,
  handleExpressPlaceOrder,
  handlePlaceOrder,
  validateForms,
} = useCheckoutOrder({
  total,
  shippingAddress,
  selectedMethod,
  shippingInstructions,
  paymentMethod,
  marketingConsent,
  defaultAddress,
  addressFormRef,
  paymentSectionRef,
})

// Computed
const preferredShippingMethod = computed(() => {
  return checkoutStore.preferences?.preferred_shipping_method || null
})

const showExpressCheckout = computed(() => {
  return user.value
    && defaultAddress.value
    && !expressCheckoutDismissed.value
    && savedAddresses.value.length > 0
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

const onStripeReady = (ready: boolean) => {
  stripeReady.value = ready
}

const onStripeError = (error: string | null) => {
  stripeError.value = error
}

/**
 * Wrapper for handlePlaceOrder that validates forms and terms first
 */
const handlePlaceOrderWithValidation = async () => {
  // Validate terms
  if (!validateTerms()) {
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

  // Validate forms
  if (!(await validateForms())) {
    return
  }

  // Process order
  await handlePlaceOrder(guestInfo.value)
}

// Initialize
onMounted(async () => {
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
  border-color: rgb(254 205 211);
  background-color: rgb(255 241 242 / 0.5);
}

:root.dark .checkout-section-highlight,
.dark .checkout-section-highlight {
  border-color: rgb(159 18 57);
  background-color: rgb(145 26 48 / 0.1);
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
  background-color: rgb(225 29 72);
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
