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
      <!-- Cash Payment (Active) -->
      <div class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
        <label class="flex items-center cursor-pointer">
          <input
            :checked="modelValue.type === 'cash'"
            type="radio"
            value="cash"
            class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
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
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PaymentMethod as PaymentMethodType } from '~/types/checkout'

interface Props {
  modelValue: PaymentMethodType
  sectionNumber: string | number
}

interface Emits {
  (e: 'update:modelValue', value: PaymentMethodType): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isPaymentValid = computed(() => {
  return props.modelValue.type === 'cash'
})

const updatePaymentType = (type: 'cash' | 'credit_card' | 'paypal' | 'bank_transfer') => {
  emit('update:modelValue', {
    ...props.modelValue,
    type,
  })
}
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
