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
        <div v-if="!user && !showGuestForm" class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div class="flex items-start space-x-3">
            <svg class="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
            <div class="flex-1">
              <h3 class="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                {{ $t('checkout.guestCheckout.title') }}
              </h3>
              <p class="text-sm text-blue-700 dark:text-blue-300 mb-3">
                {{ $t('checkout.guestCheckout.description') }}
              </p>
              <div class="flex flex-col sm:flex-row gap-2">
                <NuxtLink 
                  :to="localePath('/auth/login')"
                  class="inline-flex items-center px-3 py-2 border border-blue-300 dark:border-blue-600 text-sm font-medium rounded-md text-blue-700 dark:text-blue-300 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                >
                  {{ $t('auth.login') }}
                </NuxtLink>
                <button 
                  @click="continueAsGuest"
                  class="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
                >
                  {{ $t('checkout.continueAsGuest') }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Guest Contact Information (for guest checkout) -->
        <div v-if="!user && showGuestForm" class="mb-8">
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {{ $t('checkout.guestInfo.title') }}
            </h3>
            <div class="space-y-4">
              <div>
                <label for="guestEmail" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {{ $t('checkout.guestInfo.email') }}
                  <span class="text-red-500">*</span>
                </label>
                <input
                  id="guestEmail"
                  v-model="guestInfo.email"
                  type="email"
                  :placeholder="$t('checkout.guestInfo.emailPlaceholder')"
                  class="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  :class="getGuestFieldClasses('email')"
                  @blur="validateGuestField('email')"
                  @input="clearGuestFieldError('email')"
                />
                <p v-if="guestErrors.email" class="mt-1 text-sm text-red-600 dark:text-red-400">
                  {{ guestErrors.email }}
                </p>
              </div>
              
              <div class="flex items-center space-x-2">
                <input
                  id="emailUpdates"
                  v-model="guestInfo.emailUpdates"
                  type="checkbox"
                  class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label for="emailUpdates" class="text-sm text-gray-700 dark:text-gray-300">
                  {{ $t('checkout.guestInfo.emailUpdates') }}
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Shipping Address Form -->
        <div v-if="user || showGuestForm" class="mb-8">
          <CheckoutAddressForm
            v-model="shippingAddress"
            type="shipping"
            :saved-addresses="savedAddresses"
            :show-save-option="!!user"
            :available-countries="availableCountries"
            @save-address="handleSaveAddress"
            ref="addressFormRef"
          />
        </div>

        <!-- Shipping Method Selection -->
        <div v-if="(user || showGuestForm) && isAddressValid" class="mb-8">
          <CheckoutShippingMethodSelector
            v-model="selectedShippingMethod"
            :available-methods="availableShippingMethods"
            :loading="loadingShippingMethods"
            :error="shippingMethodError"
            :validation-error="shippingMethodValidationError"
            @retry="loadShippingMethods"
          />
        </div>

        <!-- Special Instructions (Optional) -->
        <div v-if="(user || showGuestForm) && isAddressValid" class="mb-8">
          <div>
            <label for="instructions" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ $t('checkout.shippingInstructions.title') }}
              <span class="text-gray-500 text-xs">({{ $t('common.optional') }})</span>
            </label>
            <textarea
              id="instructions"
              v-model="shippingInstructions"
              rows="3"
              :placeholder="$t('checkout.shippingInstructions.placeholder')"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors resize-none"
            />
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {{ $t('checkout.shippingInstructions.help') }}
            </p>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700 space-y-3 sm:space-y-0">
          <NuxtLink 
            :to="localePath('/cart')"
            class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            {{ $t('checkout.backToCart') }}
          </NuxtLink>

          <button 
            @click="proceedToPayment"
            :disabled="!canProceed || processing"
            class="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-primary-600 dark:bg-primary-500 border border-transparent rounded-md hover:bg-primary-700 dark:hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="processing" class="inline-flex items-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ $t('checkout.processing') }}
            </span>
            <span v-else class="inline-flex items-center">
              {{ $t('checkout.continueToPayment') }}
              <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Address, ShippingMethod, ShippingInformation } from '~/stores/checkout'

// Composables
const localePath = useLocalePath()
const user = useSupabaseUser()
const checkoutStore = useCheckoutStore()
const { t } = useI18n()

// Component refs
const addressFormRef = ref()

// Local state
const showGuestForm = ref(false)
const processing = ref(false)
const loadingShippingMethods = ref(false)
const shippingMethodError = ref<string | null>(null)

// Guest information
const guestInfo = ref({
  email: '',
  emailUpdates: false
})
const guestErrors = ref<Record<string, string>>({})

// Shipping data
const shippingAddress = ref<Address>({
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
})

const selectedShippingMethod = ref<ShippingMethod | null>(null)
const shippingInstructions = ref('')

// Available data
const savedAddresses = ref<Address[]>([])
const availableShippingMethods = ref<ShippingMethod[]>([])
const availableCountries = ref([
  { code: 'ES', name: 'Spain' },
  { code: 'RO', name: 'Romania' },
  { code: 'MD', name: 'Moldova' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'IT', name: 'Italy' }
])

// Computed properties
const isAddressValid = computed(() => {
  return shippingAddress.value.firstName &&
         shippingAddress.value.lastName &&
         shippingAddress.value.street &&
         shippingAddress.value.city &&
         shippingAddress.value.postalCode &&
         shippingAddress.value.country
})

const isGuestInfoValid = computed(() => {
  if (user.value) return true
  if (!showGuestForm.value) return false
  return guestInfo.value.email && !guestErrors.value.email
})

const canProceed = computed(() => {
  return isGuestInfoValid.value && 
         isAddressValid.value && 
         selectedShippingMethod.value !== null
})

const shippingMethodValidationError = computed(() => {
  if (!selectedShippingMethod.value && isAddressValid.value) {
    return t('checkout.validation.shippingMethodRequired')
  }
  return null
})

// Methods
const continueAsGuest = () => {
  showGuestForm.value = true
}

const validateGuestField = (fieldName: string) => {
  const value = guestInfo.value[fieldName as keyof typeof guestInfo.value]
  
  switch (fieldName) {
    case 'email':
      if (!value || !value.toString().trim()) {
        guestErrors.value.email = t('checkout.validation.emailRequired')
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.toString())) {
        guestErrors.value.email = t('checkout.validation.emailInvalid')
      }
      break
  }
}

const clearGuestFieldError = (fieldName: string) => {
  if (guestErrors.value[fieldName]) {
    delete guestErrors.value[fieldName]
  }
}

const getGuestFieldClasses = (fieldName: string) => {
  const hasError = !!guestErrors.value[fieldName]
  return {
    'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500': hasError,
    'border-gray-300 dark:border-gray-600': !hasError,
    'bg-white dark:bg-gray-700 text-gray-900 dark:text-white': true
  }
}

const loadShippingMethods = async () => {
  if (!isAddressValid.value) return

  loadingShippingMethods.value = true
  shippingMethodError.value = null

  try {
    const orderTotal = checkoutStore.orderData?.subtotal || 0
    
    const { data } = await $fetch('/api/checkout/shipping-methods', {
      query: {
        country: shippingAddress.value.country,
        postalCode: shippingAddress.value.postalCode,
        orderTotal: orderTotal.toString()
      }
    })

    if (data.success) {
      // Localize the shipping method names and descriptions
      availableShippingMethods.value = data.methods.map((method: any) => ({
        ...method,
        name: t(`checkout.shippingMethod.${method.id}.name`) || method.name,
        description: t(`checkout.shippingMethod.${method.id}.description`) || method.description
      }))
    } else {
      throw new Error('Failed to load shipping methods')
    }

  } catch (error) {
    shippingMethodError.value = error instanceof Error ? error.message : 'Failed to load shipping methods'
    // Fallback to basic methods
    availableShippingMethods.value = [
      {
        id: 'standard',
        name: t('checkout.shippingMethod.standard.name'),
        description: t('checkout.shippingMethod.standard.description'),
        price: 5.99,
        estimatedDays: 4
      }
    ]
  } finally {
    loadingShippingMethods.value = false
  }
}

const handleSaveAddress = async (address: Address) => {
  try {
    if (!user.value) return

    const { data } = await $fetch('/api/checkout/addresses', {
      method: 'POST',
      body: address
    })

    if (data.success) {
      savedAddresses.value.push(data.address)
    }
  } catch (error) {
    console.error('Failed to save address:', error)
  }
}

const proceedToPayment = async () => {
  if (!canProceed.value) return

  processing.value = true

  try {
    // Validate guest info if needed
    if (!user.value && showGuestForm.value) {
      validateGuestField('email')
      if (guestErrors.value.email) {
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
      method: selectedShippingMethod.value!,
      instructions: shippingInstructions.value || undefined
    }

    // Update checkout store
    await checkoutStore.updateShippingInfo(shippingInfo)

    // Navigate to payment step
    await navigateTo(localePath('/checkout/payment'))

  } catch (error) {
    console.error('Failed to proceed to payment:', error)
    // Error handling is done by the checkout store
  } finally {
    processing.value = false
  }
}

// Watchers
watch(isAddressValid, (isValid) => {
  if (isValid) {
    loadShippingMethods()
  } else {
    availableShippingMethods.value = []
    selectedShippingMethod.value = null
  }
})

// Initialize component
onMounted(async () => {
  // Load existing shipping info from store
  if (checkoutStore.shippingInfo) {
    shippingAddress.value = { ...checkoutStore.shippingInfo.address }
    selectedShippingMethod.value = checkoutStore.shippingInfo.method
    shippingInstructions.value = checkoutStore.shippingInfo.instructions || ''
  }

  // Load saved addresses for authenticated users
  if (user.value) {
    try {
      const { data } = await $fetch('/api/checkout/addresses')
      if (data.success) {
        savedAddresses.value = data.addresses.map((addr: any) => ({
          id: addr.id,
          type: addr.type,
          firstName: addr.first_name,
          lastName: addr.last_name,
          company: addr.company,
          street: addr.street,
          city: addr.city,
          postalCode: addr.postal_code,
          province: addr.province,
          country: addr.country,
          phone: addr.phone,
          isDefault: addr.is_default
        }))
      }
    } catch (error) {
      console.error('Failed to load saved addresses:', error)
      // Fallback to store data
      savedAddresses.value = checkoutStore.savedAddresses
    }
  }

  // Load shipping methods if address is already valid
  if (isAddressValid.value) {
    await loadShippingMethods()
  }
})
</script>

<style scoped>
.shipping-step {
  @apply min-h-[60vh];
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

/* Loading spinner animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Form section animations */
.shipping-step > div > div > div {
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