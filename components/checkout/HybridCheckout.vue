<template>
  <div class="hybrid-checkout">
    <a
      href="#checkout-main"
      class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:rounded focus:shadow-lg focus:ring-2 focus:ring-slate-500"
    >{{ $t('accessibility.skipToMainContent') }}</a>
    <a
      href="#order-summary"
      class="sr-only focus:not-sr-only focus:absolute focus:top-16 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:rounded focus:shadow-lg focus:ring-2 focus:ring-slate-500"
    >{{ $t('accessibility.skipToOrderSummary') }}</a>

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

    <div
      v-show="!showExpressCheckout"
      id="checkout-main"
      class="checkout-form-container"
    >
      <h1 class="sr-only">
        {{ $t('checkout.title') || 'Checkout' }}
      </h1>

      <div
        v-if="showExpressEligibilityHint"
        class="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-700 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-100"
      >
        <h2 class="text-sm font-semibold">
          {{ $t('checkout.expressCheckout.unavailableTitle') }}
        </h2>
        <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">
          {{ $t('checkout.expressCheckout.unavailableDescription') }}
        </p>
      </div>

      <form
        v-if="user || showGuestForm"
        class="grid grid-cols-1 lg:grid-cols-3 gap-8"
        @submit.prevent="handlePlaceOrderWithValidation"
      >
        <div class="lg:col-span-2 space-y-4">
          <CheckoutGuestSection
            :user="user"
            :show-guest-form="showGuestForm"
            :guest-info="guestInfo"
            :guest-errors="guestErrors"
            @continue-as-guest="continueAsGuest"
            @update:guest-info="guestInfo = $event"
            @validate-guest="handleValidateGuest"
            @clear-guest-error="handleClearGuestError"
          />

          <CheckoutShippingSection
            ref="shippingSectionRef"
            :step-number="user ? 1 : 2"
            :user="user"
            :shipping-address="shippingAddress"
            :saved-addresses="savedAddresses"
            :available-countries="availableCountries"
            :is-address-complete="isAddressComplete"
            :is-address-valid="isAddressValid"
            :available-methods="availableMethods"
            :selected-method="selectedMethod"
            :loading-methods="loadingMethods"
            :methods-error="methodsError"
            :shipping-method-validation-error="shippingMethodValidationError"
            :shipping-method-auto-selected="shippingMethodAutoSelected"
            :order-currency="orderCurrency"
            :shipping-instructions="shippingInstructions"
            @update:shipping-address="shippingAddress = $event"
            @save-address="handleSaveAddress"
            @address-complete="onAddressComplete"
            @update:selected-method="selectedMethod = $event"
            @retry-methods="retryLoadingMethods"
            @update:shipping-instructions="shippingInstructions = $event"
          />

          <CheckoutPaymentSection
            v-if="isAddressValid && selectedMethod"
            ref="paymentSectionRef"
            :model-value="paymentMethod"
            :section-number="user ? '3' : '4'"
            @update:model-value="paymentMethod = $event"
            @stripe-ready="onStripeReady"
            @stripe-error="onStripeError"
          />

          <CheckoutTermsSection
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

        <div class="lg:col-span-1">
          <div
            id="order-summary"
            class="sticky top-6"
          >
            <OrderSummaryCard
              :items="cartItems"
              :subtotal="subtotal"
              :shipping-cost="shippingCost"
              :tax="tax"
              :total="total"
              :shipping-method="selectedMethod"
              :loading="loadingOrder"
              :currency="orderCurrency"
            />
          </div>
        </div>
      </form>
    </div>

    <CheckoutMobileFooter
      v-if="(user || showGuestForm) && !showExpressCheckout"
      :can-place-order="canPlaceOrder"
      :processing-order="processingOrder"
      :formatted-total="formatted"
      @place-order="handlePlaceOrderWithValidation"
    />

    <div
      v-if="!showExpressCheckout && (user || showGuestForm)"
      class="mt-6 text-center lg:text-left pb-28 lg:pb-0"
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
import { useCheckoutInit } from '~/composables/checkout/useCheckoutInit'
import { useCheckoutState } from '~/composables/checkout/useCheckoutState'
import CheckoutGuestSection from '~/components/checkout/hybrid/GuestSection.vue'
import CheckoutShippingSection from '~/components/checkout/hybrid/ShippingSection.vue'
import CheckoutPaymentSection from '~/components/checkout/hybrid/PaymentSection.vue'
import CheckoutTermsSection from '~/components/checkout/hybrid/TermsSection.vue'
import CheckoutMobileFooter from '~/components/checkout/hybrid/MobileFooter.vue'
import OrderSummaryCard from '~/components/checkout/OrderSummaryCard.vue'
import ExpressCheckoutBannerEnhanced from '~/components/checkout/ExpressCheckoutBannerEnhanced.vue'

const localePath = useLocalePath()
const user = useSupabaseUser()
const checkoutStore = useCheckoutStore()
const { t } = useI18n()
const toast = useToast()

// Component refs
const addressFormRef = ref<ValidatableForm | null>(null)
const paymentSectionRef = ref<PaymentForm | null>(null)
const shippingSectionRef = ref<{ addressFormRef: ValidatableForm | null } | null>(null)

// Guest checkout
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

// Shipping address
const {
  shippingAddress,
  savedAddresses,
  defaultAddress,
  isAddressValid,
} = useShippingAddress()

// Shipping methods
const {
  availableMethods,
  selectedMethod,
  loading: loadingMethods,
  error: methodsError,
  autoSelected: shippingMethodAutoSelected,
  retry: retryLoadingMethods,
} = useShippingMethods(shippingAddress)

// Local state
const expressCheckoutDismissed = ref(false)
const shippingInstructions = ref('')
const stripeReady = ref(false)
const stripeError = ref<string | null>(null)
const paymentMethod = ref<PaymentMethod>({ type: 'cash', saveForFuture: false })

// Countries with flags
const availableCountries = ref([
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'RO', name: 'Romania', flag: '🇷🇴' },
  { code: 'MD', name: 'Moldova', flag: '🇲🇩' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
])

// Composables
const { subtotal, shippingCost, tax, total, formatted, cartItems } = useCheckoutTotals(selectedMethod)

const {
  termsAccepted,
  privacyAccepted,
  marketingConsent,
  showTermsError,
  showPrivacyError,
  validateTerms,
} = useCheckoutTerms()

const { isAddressComplete, shippingMethodValidationError, canPlaceOrder } = useCheckoutValidation({
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

const {
  loadingOrder,
  initializeCheckout,
  handleSaveAddress,
  loadShippingMethods,
} = useCheckoutInit({
  user,
  shippingAddress,
  selectedMethod,
  savedAddresses,
  defaultAddress,
  showGuestForm,
  guestInfo,
  shippingInstructions,
  isAddressValid,
})

const {
  preferredShippingMethod,
  orderCurrency,
  showExpressCheckout,
  showExpressEligibilityHint,
} = useCheckoutState({
  user,
  defaultAddress,
  savedAddresses,
  expressCheckoutDismissed,
  checkoutStore,
})

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

watchEffect(() => {
  addressFormRef.value = shippingSectionRef.value?.addressFormRef ?? null
})

// Methods
const dismissExpressCheckout = () => {
  expressCheckoutDismissed.value = true
}

const onAddressComplete = () => {
  if (isAddressValid.value) loadShippingMethods()
}

const onStripeReady = (ready: boolean) => {
  stripeReady.value = ready
}

const onStripeError = (error: string | null) => {
  stripeError.value = error
}

// Wrapper functions to match emit signatures (accept string instead of keyof GuestInfo)
const handleValidateGuest = (field: string) => validateGuestField(field as keyof GuestInfo)
const handleClearGuestError = (field: string) => clearGuestFieldError(field)

const handlePlaceOrderWithValidation = async () => {
  if (!validateTerms()) {
    toast.error(t('checkout.validation.error'), t('checkout.validation.acceptTermsRequired'))
    return
  }
  if (!user.value && showGuestForm.value && !validateGuestInfo()) {
    toast.error(t('checkout.validation.error'), t('checkout.validation.guestInfoInvalid'))
    return
  }
  if (!(await validateForms())) return
  await handlePlaceOrder(guestInfo.value)
}

onMounted(() => initializeCheckout())
</script>

<style scoped>
.hybrid-checkout, .checkout-form-container { width: 100%; }
@media (max-width: 1024px) { .checkout-form-container { padding-bottom: 120px; } }
</style>
