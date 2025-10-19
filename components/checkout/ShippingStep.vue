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

        <!-- Guest/Login Options (for non-authenticated users) -->
        <GuestCheckoutPrompt :show="!user && !showGuestForm" @continue-as-guest="continueAsGuest" />

        <!-- Guest Contact Information (for guest checkout) -->
        <div v-if="!user && showGuestForm" class="mb-8">
          <GuestInfoForm v-model="guestInfo" :errors="guestErrors" @validate="validateGuestField"
            @clear-error="clearGuestFieldError" />
        </div>

        <!-- Shipping Address Form -->
        <div v-if="user || showGuestForm" class="mb-8">
          <AddressForm v-model="shippingAddress" type="shipping" :saved-addresses="savedAddresses"
            :show-save-option="!!user" :available-countries="availableCountries" @save-address="handleSaveAddress"
            @address-complete="loadShippingMethods" ref="addressFormRef" />
        </div>

        <!-- Shipping Method Selection -->
        <div v-if="(user || showGuestForm) && isAddressValid" class="mb-8">
          <ShippingMethodSelector v-model="selectedMethod" :available-methods="availableMethods"
            :loading="loadingMethods" :error="methodsError" :validation-error="shippingMethodValidationError"
            @retry="retryLoadingMethods" />
        </div>

        <!-- Special Instructions (Optional) -->
        <div v-if="(user || showGuestForm) && isAddressValid" class="mb-8">
          <ShippingInstructions v-model="shippingInstructions" />
        </div>

        <!-- Navigation Buttons -->
        <CheckoutNavigation :can-proceed="canProceed" :processing="processing" back-to="/cart"
          @proceed="proceedToPayment" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AddressForm from '~/components/checkout/AddressForm.vue'
import ShippingMethodSelector from '~/components/checkout/ShippingMethodSelector.vue'
import GuestCheckoutPrompt from '~/components/checkout/GuestCheckoutPrompt.vue'
import GuestInfoForm from '~/components/checkout/GuestInfoForm.vue'
import ShippingInstructions from '~/components/checkout/ShippingInstructions.vue'
import CheckoutNavigation from '~/components/checkout/CheckoutNavigation.vue'
import type { ShippingInformation } from '~/types/checkout'

// Composables
const localePath = useLocalePath()
const user = useSupabaseUser()
const checkoutStore = useCheckoutStore()
const { t } = useI18n()

// Component refs
const addressFormRef = ref()

// Use composables for logic
const {
  showGuestForm,
  guestInfo,
  guestErrors,
  isGuestInfoValid,
  continueAsGuest,
  validateGuestField,
  clearGuestFieldError,
  validateAll: validateGuestInfo
} = useGuestCheckout()

const {
  shippingAddress,
  savedAddresses,
  isAddressValid,
  loadSavedAddresses,
  handleSaveAddress,
  loadFromStore: loadAddressFromStore
} = useShippingAddress()

const {
  availableMethods,
  selectedMethod,
  loading: loadingMethods,
  error: methodsError,
  loadShippingMethods,
  retry: retryLoadingMethods
} = useShippingMethods(shippingAddress)

// Local state
const processing = ref(false)
const shippingInstructions = ref('')
const availableCountries = ref([
  { code: 'ES', name: 'Spain' },
  { code: 'RO', name: 'Romania' },
  { code: 'MD', name: 'Moldova' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'IT', name: 'Italy' }
])

// Computed properties
const canProceed = computed(() => {
  return isGuestInfoValid.value &&
    isAddressValid.value &&
    selectedMethod.value !== null
})

const shippingMethodValidationError = computed(() => {
  if (!selectedMethod.value && isAddressValid.value) {
    return t('checkout.validation.shippingMethodRequired')
  }
  return null
})

// Methods
const proceedToPayment = async () => {
  if (!canProceed.value) return

  processing.value = true

  try {
    // Validate guest info if needed
    if (!user.value && showGuestForm.value) {
      if (!validateGuestInfo()) {
        processing.value = false
        return
      }
    }

    // Validate address form
    if (addressFormRef.value && !addressFormRef.value.validateForm()) {
      processing.value = false
      return
    }

    // Create shipping information object
    const shippingInfo: ShippingInformation = {
      address: shippingAddress.value,
      method: selectedMethod.value!,
      instructions: shippingInstructions.value || undefined
    }

    if (!user.value && showGuestForm.value) {
      checkoutStore.updateGuestInfo({
        email: guestInfo.value.email.trim(),
        emailUpdates: guestInfo.value.emailUpdates
      })
    }

    // Update checkout store
    await checkoutStore.updateShippingInfo(shippingInfo)

    // Navigate to payment step
    await navigateTo(localePath('/checkout/payment'))

  } catch (error) {
    console.error('Failed to proceed to payment:', error)
  } finally {
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
  }

  if (!user.value && checkoutStore.guestInfo) {
    showGuestForm.value = true
    guestInfo.value = {
      email: checkoutStore.guestInfo.email,
      emailUpdates: checkoutStore.guestInfo.emailUpdates
    }
  }

  // Load shipping methods if address is already valid (from restored session)
  if (isAddressValid.value && shippingAddress.value.country && shippingAddress.value.postalCode) {
    setTimeout(() => {
      loadShippingMethods()
    }, 1500)
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
