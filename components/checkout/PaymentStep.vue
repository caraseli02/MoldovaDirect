<template>
  <div class="payment-step">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {{ $t('checkout.payment.title') }}
      </h2>
      <p class="text-gray-600 dark:text-gray-400">
        {{ $t('checkout.payment.subtitle') }}
      </p>
    </div>

    <div class="space-y-6">
      <!-- Saved Payment Methods -->
      <SavedPaymentMethodsList
        v-if="savedPaymentMethods.length > 0"
        :saved-methods="savedPaymentMethods"
        :selected-id="selectedSavedMethod"
        @select="selectSavedMethod"
        @use-new="showNewPaymentForm = true"
      />

      <!-- New Payment Method Form -->
      <div v-if="savedPaymentMethods.length === 0 || showNewPaymentForm">
        <h3
          v-if="savedPaymentMethods.length > 0"
          class="text-lg font-semibold text-gray-900 dark:text-white mb-4"
        >
          {{ $t('checkout.payment.newMethod') }}
        </h3>

        <PaymentMethodSelector
          v-model="paymentMethod"
          :show-new="savedPaymentMethods.length > 0"
          :is-authenticated="isAuthenticated"
        />

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

        <div
          v-if="isAuthenticated && paymentMethod.type !== 'bank_transfer'"
          class="mt-4"
        >
          <div class="flex items-center gap-2">
            <UiCheckbox
              :checked="paymentMethod.saveForFuture"
              @update:checked="(val: boolean) => paymentMethod.saveForFuture = val"
            />
            <span class="text-sm text-gray-700 dark:text-gray-300">{{ $t('checkout.payment.saveForFuture') }}</span>
          </div>
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
          size="lg"
          class="h-12 px-6"
          :disabled="!canProceed || loading"
          @click="proceedToReview"
        >
          <template v-if="loading">
            <commonIcon
              name="lucide:loader-2"
              class="animate-spin h-5 w-5 mr-2"
            />
            {{ $t('checkout.navigation.processing') }}
          </template>
          <template v-else>
            {{ $t('checkout.continueToReview') }}
            <commonIcon
              name="lucide:arrow-right"
              class="h-5 w-5 ml-2"
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

const PaymentForm = defineAsyncComponent(() => import('./PaymentForm.vue'))

const checkoutStore = useCheckoutStore()
const authStore = useAuthStore()
const localePath = useLocalePath()

const showNewPaymentForm = ref(false)
const selectedSavedMethod = ref<string | null>(null)

const paymentMethod = ref<PaymentMethod>({ type: 'cash', saveForFuture: false })

const isAuthenticated = computed(() => authStore.isAuthenticated)
const savedPaymentMethods = computed(() => checkoutStore.savedPaymentMethods ?? [])
const loading = computed(() => checkoutStore.loading ?? false)
const errors = computed(() => checkoutStore.errors ?? {})

const canProceed = computed(() => {
  if (selectedSavedMethod.value) return true
  if (paymentMethod.value.type === 'cash') return true
  if (paymentMethod.value.type === 'credit_card') {
    return !!(paymentMethod.value.creditCard?.number && paymentMethod.value.creditCard?.expiryMonth && paymentMethod.value.creditCard?.expiryYear && paymentMethod.value.creditCard?.cvv && paymentMethod.value.creditCard?.holderName)
  }
  if (paymentMethod.value.type === 'paypal') return !!paymentMethod.value.paypal?.email
  if (paymentMethod.value.type === 'bank_transfer') return true
  return false
})

const selectSavedMethod = (savedMethod: SavedPaymentMethod) => {
  selectedSavedMethod.value = savedMethod.id
  showNewPaymentForm.value = false

  if (savedMethod.type === 'credit_card') {
    paymentMethod.value = {
      type: 'credit_card',
      creditCard: { number: '', expiryMonth: savedMethod.expiryMonth?.toString() || '', expiryYear: savedMethod.expiryYear?.toString() || '', cvv: '', holderName: '' },
      saveForFuture: false,
    }
  }
  else if (savedMethod.type === 'paypal') {
    paymentMethod.value = { type: 'paypal', paypal: { email: '' }, saveForFuture: false }
  }
}

const updatePaymentMethod = (newMethod: PaymentMethod) => {
  paymentMethod.value = newMethod
}

const goBack = async () => {
  const previousStep = checkoutStore.goToPreviousStep?.()
  if (previousStep) {
    const stepPath = previousStep === 'shipping' ? '/checkout' : `/checkout/${previousStep}`
    await navigateTo(localePath(stepPath))
  }
}

const proceedToReview = async () => {
  try {
    let methodToSave: PaymentMethod

    if (selectedSavedMethod.value) {
      const savedMethod = savedPaymentMethods.value.find((m: SavedPaymentMethod) => m.id === selectedSavedMethod.value)
      if (!savedMethod) throw new Error('Selected payment method not found')
      methodToSave = paymentMethod.value
    }
    else {
      methodToSave = paymentMethod.value
    }

    await checkoutStore.updatePaymentMethod?.(methodToSave)

    const nextStep = await checkoutStore.proceedToNextStep?.()
    if (nextStep) {
      const stepPath = nextStep === 'shipping' ? '/checkout' : `/checkout/${nextStep}`
      await navigateTo(localePath(stepPath))
    }
  }
  catch (error: unknown) {
    console.error('Failed to proceed to review:', error)
    const toast = useToast()
    const { t } = useI18n()
    toast.error(t('checkout.error.title') || 'Error', t('checkout.error.proceedToReview') || 'Failed to proceed to review. Please try again.')
  }
}

if (checkoutStore.paymentMethod) {
  paymentMethod.value = { ...checkoutStore.paymentMethod }
}

watch(savedPaymentMethods, (newMethods) => {
  if (!newMethods || newMethods.length === 0) showNewPaymentForm.value = true
}, { immediate: true })
</script>

<style scoped>
.payment-step { max-width: 42rem; margin-left: auto; margin-right: auto; }
.animate-spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
