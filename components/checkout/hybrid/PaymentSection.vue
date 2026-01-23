<template>
  <section class="checkout-section fade-in">
    <div class="section-header">
      <div class="flex items-center">
        <span class="section-number">{{ sectionNumber }}</span>
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
      <!-- Payment Method Selection -->
      <div class="space-y-3">
        <!-- Cash Payment -->
        <div
          class="p-4 border rounded-lg cursor-pointer transition-colors"
          :class="modelValue.type === 'cash'
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'"
          @click="updatePaymentType('cash')"
        >
          <div class="flex items-start">
            <UiInput
              id="payment-cash"
              :checked="modelValue.type === 'cash'"
              type="radio"
              name="payment-type"
              value="cash"
              class="mt-1"
              @change="updatePaymentType('cash')"
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
          </div>
        </div>

        <!-- Credit Card Payment (Stripe) -->
        <div
          class="p-4 border rounded-lg cursor-pointer transition-colors"
          :class="modelValue.type === 'credit_card'
            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'"
          @click="updatePaymentType('credit_card')"
        >
          <div class="flex items-start">
            <UiInput
              id="payment-credit-card"
              :checked="modelValue.type === 'credit_card'"
              type="radio"
              name="payment-type"
              value="credit_card"
              class="mt-1"
              @change="updatePaymentType('credit_card')"
            />
            <div class="ml-3 flex items-center">
              <span class="text-xl mr-2">💳</span>
              <div>
                <p class="font-medium text-gray-900 dark:text-white">
                  {{ $t('checkout.payment.creditCard.label') }}
                </p>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ $t('checkout.payment.creditCard.summary') }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Payment Form for Selected Method -->
      <div
        v-if="modelValue.type !== 'cash'"
        class="mt-6"
      >
        <PaymentForm
          ref="paymentFormRef"
          :model-value="modelValue"
          :loading="loading"
          :errors="errors"
          @update:model-value="(value) => emit('update:modelValue', value)"
          @stripe-ready="onStripeReady"
          @stripe-error="onStripeError"
        />
      </div>

      <!-- Coming Soon Methods -->
      <div class="mt-6 space-y-2">
        <p class="text-xs text-gray-500 dark:text-gray-400 font-medium">
          {{ $t('checkout.payment.comingSoon') }}
        </p>
        <div class="flex flex-wrap gap-2">
          <span class="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-500 dark:text-gray-400 flex items-center">
            🅿️ {{ $t('checkout.payment.paypal.label') }}
          </span>
          <span class="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-500 dark:text-gray-400 flex items-center">
            🏦 {{ $t('checkout.payment.bankTransfer.label') }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { PaymentMethod as PaymentMethodType } from '~/types/checkout'
import PaymentForm from '~/components/checkout/PaymentForm.vue'

interface Props {
  modelValue: PaymentMethodType
  sectionNumber: string | number
  loading?: boolean
  errors?: Record<string, string>
}

interface Emits {
  (e: 'update:modelValue', value: PaymentMethodType): void
  (e: 'stripe-ready', ready: boolean): void
  (e: 'stripe-error', error: string | null): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  errors: () => ({}),
})
const emit = defineEmits<Emits>()

// Refs
const paymentFormRef = ref<{ validateForm: () => boolean, getStripeCardElement: () => any } | null>(null)

const isPaymentValid = computed(() => {
  if (props.modelValue.type === 'cash') {
    return true
  }
  if (props.modelValue.type === 'credit_card') {
    const card = props.modelValue.creditCard
    return !!(card?.holderName) // Stripe handles card validation
  }
  return false
})

const updatePaymentType = (type: 'cash' | 'credit_card' | 'paypal' | 'bank_transfer') => {
  emit('update:modelValue', {
    ...props.modelValue,
    type,
  })
}

const onStripeReady = (ready: boolean) => {
  emit('stripe-ready', ready)
}

const onStripeError = (error: string | null) => {
  emit('stripe-error', error)
}

// Expose methods for parent components
defineExpose({
  validateForm: () => {
    if (paymentFormRef.value) {
      return paymentFormRef.value.validateForm()
    }
    return true
  },
  getStripeCardElement: () => {
    if (paymentFormRef.value) {
      return paymentFormRef.value.getStripeCardElement()
    }
    return null
  },
})
</script>

<style scoped>
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
</style>
