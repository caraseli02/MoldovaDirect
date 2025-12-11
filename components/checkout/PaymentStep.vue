<template>
  <div class="payment-step">
    <!-- Step Header -->
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {{ $t('checkout.payment.title') }}
      </h2>
      <p class="text-gray-600 dark:text-gray-400">
        {{ $t('checkout.payment.subtitle') }}
      </p>
    </div>

    <!-- Payment Method Selection -->
    <div class="space-y-6">
      <!-- Saved Payment Methods (for authenticated users) -->
      <div
        v-if="savedPaymentMethods.length > 0"
        class="space-y-4"
      >
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ $t('checkout.payment.savedMethods') }}
        </h3>

        <div class="space-y-3">
          <div
            v-for="savedMethod in savedPaymentMethods"
            :key="savedMethod.id"
            class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 cursor-pointer transition-colors"
            :class="{
              'border-blue-500 bg-blue-50 dark:bg-blue-900/20': selectedSavedMethod === savedMethod.id,
              'hover:border-gray-300 dark:hover:border-gray-600': selectedSavedMethod !== savedMethod.id,
            }"
            @click="selectSavedMethod(savedMethod)"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <input
                  :id="`saved-${savedMethod.id}`"
                  v-model="selectedSavedMethod"
                  type="radio"
                  :value="savedMethod.id"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <div>
                  <div class="flex items-center space-x-2">
                    <commonIcon
                      :name="getPaymentMethodIcon(savedMethod.type)"
                      class="h-6 w-6"
                    />
                    <span class="font-medium text-gray-900 dark:text-white">
                      {{ getPaymentMethodLabel(savedMethod) }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ getPaymentMethodDescription(savedMethod) }}
                  </p>
                </div>
              </div>
              <span
                v-if="savedMethod.isDefault"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
              >
                {{ $t('checkout.payment.default') }}
              </span>
            </div>
          </div>
        </div>

        <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
          <UiButton
            type="button"
            variant="link"
            class="px-0"
            @click="showNewPaymentForm = true"
          >
            {{ $t('checkout.payment.useNewMethod') }}
          </UiButton>
        </div>
      </div>

      <!-- New Payment Method Form -->
      <div v-if="savedPaymentMethods.length === 0 || showNewPaymentForm">
        <h3
          v-if="savedPaymentMethods.length > 0"
          class="text-lg font-semibold text-gray-900 dark:text-white mb-4"
        >
          {{ $t('checkout.payment.newMethod') }}
        </h3>

        <!-- Payment Method Type Selection -->
        <div class="space-y-4 mb-6">
          <div class="grid grid-cols-1 gap-4">
            <!-- Cash Payment (Only Available Option) -->
            <div
              class="border border-green-200 dark:border-green-700 rounded-lg p-4 bg-green-50 dark:bg-green-900/20"
            >
              <div class="flex items-center space-x-3">
                <input
                  id="cash"
                  v-model="paymentMethod.type"
                  type="radio"
                  value="cash"
                  class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                  checked
                />
                <div>
                  <div class="flex items-center space-x-2">
                    <commonIcon
                      name="lucide:banknote"
                      class="h-6 w-6 text-green-600 dark:text-green-400"
                    />
                    <span class="font-medium text-gray-900 dark:text-white">
                      {{ $t('checkout.payment.cash.label') }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    {{ $t('checkout.payment.cash.summary') }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Disabled Online Payment Methods -->
            <div class="space-y-3">
              <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400">
                {{ $t('checkout.payment.comingSoon') }}
              </h4>

              <!-- Credit Card (Disabled) -->
              <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800/50">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <input
                      type="radio"
                      disabled
                      class="h-4 w-4 text-gray-400 border-gray-300"
                    />
                    <div>
                      <div class="flex items-center space-x-2">
                        <commonIcon
                          name="lucide:credit-card"
                          class="h-6 w-6 text-gray-400"
                        />
                        <span class="font-medium text-gray-500 dark:text-gray-400">
                          {{ $t('checkout.payment.creditCard.label') }}
                        </span>
                      </div>
                      <p class="text-sm text-gray-400">
                        {{ $t('checkout.payment.creditCard.summary') }}
                      </p>
                    </div>
                  </div>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                    {{ $t('checkout.payment.comingSoon') }}
                  </span>
                </div>
              </div>

              <!-- PayPal (Disabled) -->
              <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800/50">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <input
                      type="radio"
                      disabled
                      class="h-4 w-4 text-gray-400 border-gray-300"
                    />
                    <div>
                      <div class="flex items-center space-x-2">
                        <commonIcon
                          name="lucide:badge-dollar-sign"
                          class="h-6 w-6 text-gray-400"
                        />
                        <span class="font-medium text-gray-500 dark:text-gray-400">
                          {{ $t('checkout.payment.paypal.label') }}
                        </span>
                      </div>
                      <p class="text-sm text-gray-400">
                        {{ $t('checkout.payment.paypal.summary') }}
                      </p>
                    </div>
                  </div>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                    {{ $t('checkout.payment.comingSoon') }}
                  </span>
                </div>
              </div>

              <!-- Bank Transfer (Disabled) -->
              <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800/50">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <input
                      type="radio"
                      disabled
                      class="h-4 w-4 text-gray-400 border-gray-300"
                    />
                    <div>
                      <div class="flex items-center space-x-2">
                        <commonIcon
                          name="lucide:building-2"
                          class="h-6 w-6 text-gray-400"
                        />
                        <span class="font-medium text-gray-500 dark:text-gray-400">
                          {{ $t('checkout.payment.bankTransfer.label') }}
                        </span>
                      </div>
                      <p class="text-sm text-gray-400">
                        {{ $t('checkout.payment.bankTransfer.summary') }}
                      </p>
                    </div>
                  </div>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                    {{ $t('checkout.payment.comingSoon') }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Payment Form Component -->
        <Suspense>
          <template #default>
            <PaymentForm
              v-model="paymentMethod"
              :loading="loading"
              :errors="errors"
              @update:model-value="updatePaymentMethod"
            />
          </template>
          <template #fallback>
            <div class="h-48 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div>
          </template>
        </Suspense>

        <!-- Save Payment Method Option (for authenticated users) -->
        <div
          v-if="isAuthenticated && paymentMethod.type !== 'bank_transfer'"
          class="mt-4"
        >
          <label class="flex items-center space-x-2">
            <input
              v-model="paymentMethod.saveForFuture"
              type="checkbox"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span class="text-sm text-gray-700 dark:text-gray-300">
              {{ $t('checkout.payment.saveForFuture') }}
            </span>
          </label>
        </div>
      </div>

      <!-- Error Messages -->
      <div
        v-if="errors.payment"
        class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
      >
        <div class="flex">
          <commonIcon
            name="lucide:alert-triangle"
            class="h-5 w-5 text-red-400 mr-2 mt-0.5"
          />
          <div>
            <h3 class="text-sm font-medium text-red-800 dark:text-red-200">
              {{ $t('checkout.payment.error') }}
            </h3>
            <p class="text-sm text-red-700 dark:text-red-300 mt-1">
              {{ errors.payment }}
            </p>
          </div>
        </div>
      </div>

      <!-- Navigation Buttons -->
      <div class="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        <UiButton
          type="button"
          variant="outline"
          @click="goBack"
        >
          <commonIcon
            name="lucide:arrow-left"
            class="h-4 w-4 mr-2"
          />
          {{ $t('checkout.navigation.back') }}
        </UiButton>

        <UiButton
          type="button"
          :disabled="!canProceed || loading"
          @click="proceedToReview"
        >
          <template v-if="loading">
            <commonIcon
              name="lucide:loader-2"
              class="animate-spin h-4 w-4 mr-2"
            />
            {{ $t('checkout.navigation.processing') }}
          </template>
          <template v-else>
            {{ $t('checkout.navigation.reviewOrder') }}
            <commonIcon
              name="lucide:arrow-right"
              class="h-4 w-4 ml-2"
            />
          </template>
        </UiButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useCheckoutStore } from '~/stores/checkout'
import type { PaymentMethod, SavedPaymentMethod } from '~/types/checkout'
import { useAuthStore } from '~/stores/auth'

// Lazy load payment form component
const PaymentForm = defineAsyncComponent(() =>
  import('./PaymentForm.vue'),
)

// =============================================
// COMPOSABLES & STORES
// =============================================

const checkoutStore = useCheckoutStore()
const authStore = useAuthStore()
const _localePath = useLocalePath()

// =============================================
// REACTIVE STATE
// =============================================

const showNewPaymentForm = ref(false)
const selectedSavedMethod = ref<string | null>(null)

// Initialize payment method if not set
const paymentMethod = ref<PaymentMethod>({
  type: 'cash',
  saveForFuture: false,
})

// =============================================
// COMPUTED PROPERTIES
// =============================================

const isAuthenticated = computed(() => authStore.isAuthenticated)
const savedPaymentMethods = computed(() => (checkoutStore as Record<string, any>).savedPaymentMethods ?? [])
const loading = computed(() => (checkoutStore as Record<string, any>).loading ?? false)
const errors = computed(() => (checkoutStore as Record<string, any>).errors ?? {})

const canProceed = computed(() => {
  if (selectedSavedMethod.value) {
    return true
  }

  if (paymentMethod.value.type === 'cash') {
    return true // Cash payment is always valid
  }
  else if (paymentMethod.value.type === 'credit_card') {
    return !!(
      paymentMethod.value.creditCard?.number
      && paymentMethod.value.creditCard?.expiryMonth
      && paymentMethod.value.creditCard?.expiryYear
      && paymentMethod.value.creditCard?.cvv
      && paymentMethod.value.creditCard?.holderName
    )
  }
  else if (paymentMethod.value.type === 'paypal') {
    return !!paymentMethod.value.paypal?.email
  }
  else if (paymentMethod.value.type === 'bank_transfer') {
    return true // Bank transfer doesn't require additional validation
  }

  return false
})

// =============================================
// METHODS
// =============================================

const _selectPaymentType = (type: PaymentMethod['type']) => {
  // Only allow cash payment for now
  if (type !== 'cash') {
    return
  }

  paymentMethod.value = {
    type,
    saveForFuture: false,
  }
  selectedSavedMethod.value = null
  showNewPaymentForm.value = true
}

const selectSavedMethod = (savedMethod: SavedPaymentMethod) => {
  selectedSavedMethod.value = savedMethod.id
  showNewPaymentForm.value = false

  // Convert saved method to payment method format
  if (savedMethod.type === 'credit_card') {
    paymentMethod.value = {
      type: 'credit_card',
      creditCard: {
        number: '', // Will be handled by payment processor
        expiryMonth: savedMethod.expiryMonth?.toString() || '',
        expiryYear: savedMethod.expiryYear?.toString() || '',
        cvv: '', // Always required for security
        holderName: '', // Will be populated from saved data
      },
      saveForFuture: false,
    }
  }
  else if (savedMethod.type === 'paypal') {
    paymentMethod.value = {
      type: 'paypal',
      paypal: {
        email: '', // Will be handled by PayPal
      },
      saveForFuture: false,
    }
  }
}

const updatePaymentMethod = (newMethod: PaymentMethod) => {
  paymentMethod.value = newMethod
}

const getPaymentMethodIcon = (type: string) => {
  if (type === 'credit_card') {
    return 'lucide:credit-card'
  }
  if (type === 'paypal') {
    return 'lucide:badge-dollar-sign'
  }
  return 'lucide:credit-card'
}

const getPaymentMethodLabel = (savedMethod: SavedPaymentMethod) => {
  if (savedMethod.type === 'credit_card') {
    const brand = savedMethod.brand ? savedMethod.brand.charAt(0).toUpperCase() + savedMethod.brand.slice(1) : 'Card'
    return `${brand} •••• ${savedMethod.lastFour}`
  }
  else if (savedMethod.type === 'paypal') {
    return 'PayPal'
  }
  return 'Payment Method'
}

const getPaymentMethodDescription = (savedMethod: SavedPaymentMethod) => {
  if (savedMethod.type === 'credit_card' && savedMethod.expiryMonth && savedMethod.expiryYear) {
    return `Expires ${savedMethod.expiryMonth.toString().padStart(2, '0')}/${savedMethod.expiryYear}`
  }
  else if (savedMethod.type === 'paypal') {
    return 'PayPal account'
  }
  return ''
}

const goBack = async () => {
  const previousStep = (checkoutStore as Record<string, any>).goToPreviousStep?.()
  if (previousStep) {
    const localePath = useLocalePath()
    const stepPath = previousStep === 'shipping' ? '/checkout' : `/checkout/${previousStep}`
    await navigateTo(localePath(stepPath))
  }
}

const proceedToReview = async () => {
  try {
    let methodToSave: PaymentMethod

    if (selectedSavedMethod.value) {
      // Use saved payment method
      const savedMethod = savedPaymentMethods.value.find((m: SavedPaymentMethod) => m.id === selectedSavedMethod.value)
      if (!savedMethod) {
        throw new Error('Selected payment method not found')
      }

      // For saved methods, we still need some information (like CVV for credit cards)
      methodToSave = paymentMethod.value
    }
    else {
      // Use new payment method
      methodToSave = paymentMethod.value
    }

    await (checkoutStore as Record<string, any>).updatePaymentMethod?.(methodToSave)

    // Get the next step and navigate to it
    const nextStep = await (checkoutStore as Record<string, any>).proceedToNextStep?.()
    if (nextStep) {
      const localePath = useLocalePath()
      const stepPath = nextStep === 'shipping' ? '/checkout' : `/checkout/${nextStep}`
      await navigateTo(localePath(stepPath))
    }
  }
  catch (error) {
    console.error('Failed to proceed to review:', error)
  }
}

// =============================================
// LIFECYCLE
// =============================================

// Initialize with existing payment method if available
if ((checkoutStore as Record<string, any>).paymentMethod) {
  paymentMethod.value = { ...(checkoutStore as Record<string, any>).paymentMethod }
}

// Watch for changes in saved payment methods
watch(savedPaymentMethods, (newMethods) => {
  if (!newMethods || newMethods.length === 0) {
    showNewPaymentForm.value = true
  }
}, { immediate: true })
</script>

<style scoped>
.payment-step {
  max-width: 42rem;
  margin-left: auto;
  margin-right: auto;
}

/* Custom radio button styling */
input[type="radio"]:checked {
  background-color: rgb(37, 99, 235);
  border-color: rgb(37, 99, 235);
}

/* Loading animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
