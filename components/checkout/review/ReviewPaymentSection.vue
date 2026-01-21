<template>
  <section class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <header class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        {{ $t('checkout.review.paymentMethod') }}
      </h3>
      <UiButton @click="$emit('edit')">
        {{ $t('checkout.review.editPayment') }}
      </UiButton>
    </header>

    <div
      v-if="paymentMethod"
      class="space-y-3"
    >
      <div
        v-if="paymentMethod.type === 'cash'"
        class="flex items-center space-x-3"
      >
        <svg
          class="w-6 h-6 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <div>
          <p class="text-sm font-medium text-gray-900 dark:text-white">
            {{ $t('checkout.payment.cash.title') }}
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ $t('checkout.payment.cash.description') }}
          </p>
        </div>
      </div>

      <div
        v-else-if="paymentMethod.type === 'credit_card'"
        class="flex items-center space-x-3"
      >
        <svg
          class="w-6 h-6 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
        <div>
          <p class="text-sm font-medium text-gray-900 dark:text-white">
            {{ $t('checkout.payment.creditCard.title') }}
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            **** **** **** {{ paymentMethod.creditCard?.number?.slice(-4) || '****' }}
          </p>
        </div>
      </div>

      <div
        v-else-if="paymentMethod.type === 'paypal'"
        class="flex items-center space-x-3"
      >
        <svg
          class="w-6 h-6 text-blue-500"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.26-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81.394.45.67.96.824 1.507z" />
        </svg>
        <div>
          <p class="text-sm font-medium text-gray-900 dark:text-white">
            {{ $t('checkout.payment.paypal.title') }}
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ paymentMethod.paypal?.email || '' }}
          </p>
        </div>
      </div>

      <div
        v-else-if="paymentMethod.type === 'bank_transfer'"
        class="flex items-center space-x-3"
      >
        <svg
          class="w-6 h-6 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
        <div>
          <p class="text-sm font-medium text-gray-900 dark:text-white">
            {{ $t('checkout.payment.bankTransfer.title') }}
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ $t('checkout.payment.bankTransfer.description') }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { PaymentMethod } from '~/types/checkout'

interface Props {
  paymentMethod: PaymentMethod | null
}

defineProps<Props>()

defineEmits<{
  (e: 'edit'): void
}>()
</script>
