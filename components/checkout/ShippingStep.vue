<template>
  <div class="shipping-step">
    <div class="p-6 md:p-8">
      <div class="max-w-2xl mx-auto">
        <!-- Step Header -->
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {{ $t('checkout.steps.shipping.title') }}
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            {{ $t('checkout.steps.shipping.subtitle') }}
          </p>
        </div>

        <!-- Express Checkout Banner (for authenticated users with saved data) -->
        <ExpressCheckoutBanner
          v-if="user && defaultAddress && !expressCheckoutDismissed"
          :default-address="defaultAddress"
          :preferred-shipping-method="checkoutStore.preferences?.preferred_shipping_method"
          @use-express="handleExpressCheckout"
          @dismiss="handleExpressCheckoutDismiss"
        />

        <!-- Guest/Login Options (for non-authenticated users) -->
        <Suspense>
          <template #default>
            <GuestCheckoutPrompt
              :show="!user && !showGuestForm"
              @continue-as-guest="continueAsGuest"
            />
          </template>
          <template #fallback>
            <div class="h-24 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse mb-8"></div>
          </template>
        </Suspense>

        <!-- Guest Contact Information (for guest checkout) -->
        <div
          v-if="!user && showGuestForm"
          class="mb-8"
        >
          <Suspense>
            <template #default>
              <GuestInfoForm
                v-model="guestInfo"
                :errors="guestErrors"
                @validate="(field: string) => validateGuestField(field as keyof GuestInfo)"
                @clear-error="clearGuestFieldError"
              />
            </template>
            <template #fallback>
              <div class="h-32 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div>
            </template>
          </Suspense>
        </div>

        <!-- Shipping Address Form -->
        <div
          v-if="user || showGuestForm"
          class="mb-8"
        >
          <Suspense>
            <template #default>
              <AddressForm
                ref="addressFormRef"
                v-model="shippingAddress"
                type="shipping"
                :saved-addresses="[...savedAddresses]"
                :show-save-option="!!user"
                :available-countries="availableCountries"
                @save-address="handleSaveAddress"
                @address-complete="loadShippingMethods"
              />
            </template>
            <template #fallback>
              <div class="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div>
            </template>
          </Suspense>
        </div>

        <!-- Shipping Method Selection -->
        <div
          v-if="(user || showGuestForm) && isAddressValid"
          class="mb-8"
        >
          <Suspense>
            <template #default>
              <ShippingMethodSelector
                v-model="selectedMethod"
                :available-methods="[...availableMethods]"
                :loading="loadingMethods"
                :error="methodsError"
                :validation-error="shippingMethodValidationError"
                @retry="retryLoadingMethods"
              />
            </template>
            <template #fallback>
              <div class="h-40 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div>
            </template>
          </Suspense>
        </div>

        <!-- Special Instructions (Optional) -->
        <div
          v-if="(user || showGuestForm) && isAddressValid"
          class="mb-8"
        >
          <Suspense>
            <template #default>
              <ShippingInstructions v-model="shippingInstructions" />
            </template>
            <template #fallback>
              <div class="h-24 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div>
            </template>
          </Suspense>
        </div>

        <!-- Navigation Buttons -->
        <Suspense>
          <template #default>
            <CheckoutNavigation
              :can-proceed="canProceed"
              :processing="processing"
              back-to="/cart"
              @proceed="proceedToPayment"
            />
          </template>
          <template #fallback>
            <div class="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div>
          </template>
        </Suspense>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ShippingInformation } from '~/types/checkout'
import type { CheckoutStore } from '~/stores/checkout'
import type { GuestInfo } from '~/composables/useGuestCheckout'

// Lazy load heavy sub-components
const ExpressCheckoutBanner = defineAsyncComponent(() =>
  import('~/components/checkout/ExpressCheckoutBanner.vue'),
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
const CheckoutNavigation = defineAsyncComponent(() =>
  import('~/components/checkout/CheckoutNavigation.vue'),
)

// Composables
const localePath = useLocalePath()
const user = useSupabaseUser()
const checkoutStore = useCheckoutStore() as CheckoutStore & {
  preferences?: { preferred_shipping_method?: string } | null
  guestInfo?: GuestInfo | null
  shippingInfo?: ShippingInformation | null
  updateGuestInfo: (info: GuestInfo) => Promise<void>
  updateShippingInfo: (info: ShippingInformation) => Promise<void>
}
const { t } = useI18n()
const toast = useToast()

// Component refs
const addressFormRef = ref<{ validateForm: () => boolean } | null>(null)

// Use composables for logic
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

const {
  shippingAddress,
  savedAddresses,
  defaultAddress,
  hasAddresses,
  isAddressValid,
  loadSavedAddresses,
  handleSaveAddress,
  loadFromStore: loadAddressFromStore,
} = useShippingAddress()

const {
  availableMethods,
  selectedMethod,
  loading: loadingMethods,
  error: methodsError,
  loadShippingMethods,
  retry: retryLoadingMethods,
} = useShippingMethods(shippingAddress)

// Local state
const processing = ref(false)
const expressCheckoutDismissed = ref(false)
const shippingInstructions = ref('')
const availableCountries = ref([
  { code: 'ES', name: 'Spain' },
  { code: 'RO', name: 'Romania' },
  { code: 'MD', name: 'Moldova' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'IT', name: 'Italy' },
])

// Computed properties
const canProceed = computed(() => {
  // For authenticated users, skip guest validation
  const guestCheckPassed = user.value ? true : isGuestInfoValid.value

  return guestCheckPassed
    && isAddressValid.value
    && selectedMethod.value !== null
})

const shippingMethodValidationError = computed(() => {
  if (!selectedMethod.value && isAddressValid.value) {
    return t('checkout.validation.shippingMethodRequired')
  }
  return null
})

// Methods
const handleExpressCheckout = () => {
  // Banner component handles the navigation
  // Just dismiss the banner
  expressCheckoutDismissed.value = true
}

const handleExpressCheckoutDismiss = () => {
  expressCheckoutDismissed.value = true
}

const proceedToPayment = async () => {
  if (!canProceed.value) return

  processing.value = true

  try {
    // Validate guest info if needed
    if (!user.value && showGuestForm.value) {
      if (!validateGuestInfo()) {
        toast.error(
          t('checkout.validation.error') || 'Validation Error',
          t('checkout.validation.guestInfoInvalid') || 'Please provide a valid email address',
        )
        processing.value = false
        return
      }
    }

    // Validate address form
    if (addressFormRef.value && !addressFormRef.value.validateForm()) {
      toast.error(
        t('checkout.validation.error') || 'Validation Error',
        t('checkout.validation.addressInvalid') || 'Please complete all required shipping address fields',
      )
      processing.value = false
      return
    }

    // Create shipping information object
    const shippingInfo: ShippingInformation = {
      address: shippingAddress.value,
      method: selectedMethod.value!,
      instructions: shippingInstructions.value || undefined,
    }

    if (!user.value && showGuestForm.value) {
      checkoutStore.updateGuestInfo({
        email: guestInfo.value.email.trim(),
        emailUpdates: guestInfo.value.emailUpdates,
      })
    }

    // Update checkout store
    await checkoutStore.updateShippingInfo(shippingInfo)

    // Navigate to payment step
    await navigateTo(localePath('/checkout/payment'))
  }
  catch (error) {
    console.error('Failed to proceed to payment:', error)
  }
  finally {
    processing.value = false
  }
}

// Initialize component
onMounted(async () => {
  // Load existing shipping info from store
  loadAddressFromStore()

  if (checkoutStore.shippingInfo) {
    selectedMethod.value = checkoutStore.shippingInfo.method
    shippingInstructions.value = checkoutStore.shippingInfo.instructions || ''
  }

  // Load saved addresses for authenticated users
  if (user.value) {
    await loadSavedAddresses()

    // Auto-select default address if no address is currently set
    if (defaultAddress.value && !shippingAddress.value.street) {
      shippingAddress.value = { ...defaultAddress.value }
      // Load shipping methods since we have a valid address
      if (shippingAddress.value.country && shippingAddress.value.postalCode) {
        loadShippingMethods()
      }
    }
  }

  if (!user.value && checkoutStore.guestInfo) {
    showGuestForm.value = true
    guestInfo.value = {
      email: checkoutStore.guestInfo.email,
      emailUpdates: checkoutStore.guestInfo.emailUpdates,
    }
  }

  // Load shipping methods if address is already valid (from restored session)
  if (isAddressValid.value && shippingAddress.value.country && shippingAddress.value.postalCode) {
    loadShippingMethods()
  }
})
</script>

<style scoped>
.shipping-step {
  min-height: 60vh;
}

/* Ensure proper spacing on mobile */
@media (max-width: 640px) {
  .shipping-step {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
}

/* Smooth transitions for form interactions */
.shipping-step input,
.shipping-step select,
.shipping-step textarea {
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

/* Form section animations */
.shipping-step>div>div>div {
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
