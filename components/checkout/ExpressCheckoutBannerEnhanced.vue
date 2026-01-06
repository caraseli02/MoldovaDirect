<template>
  <div
    data-testid="express-checkout-banner"
    class="express-checkout-enhanced bg-primary-100/50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-700 rounded-xl p-6 mb-6"
  >
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center">
        <span class="text-2xl mr-3">⚡</span>
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ $t('checkout.expressCheckout.title', 'Express Checkout') }}
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ $t('checkout.expressCheckout.oneClickDescription', 'Complete your order with one click') }}
          </p>
        </div>
      </div>
      <button
        class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
        :aria-label="$t('common.close')"
        @click="$emit('dismiss')"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>

    <!-- Saved Details Card -->
    <div class="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 border border-gray-100 dark:border-gray-700">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Shipping Address -->
        <div>
          <p class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
            {{ $t('checkout.expressCheckout.shippingTo', 'Shipping to') }}
          </p>
          <p class="font-medium text-gray-900 dark:text-white">
            {{ defaultAddress?.firstName }} {{ defaultAddress?.lastName }}
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ defaultAddress?.street }}
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ defaultAddress?.city }}, {{ defaultAddress?.postalCode }}
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ defaultAddress?.country }}
          </p>
        </div>

        <!-- Payment & Shipping Method -->
        <div>
          <div class="mb-3">
            <p class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              {{ $t('checkout.expressCheckout.paymentMethod', 'Payment') }}
            </p>
            <p class="text-sm text-gray-900 dark:text-white flex items-center">
              <span class="mr-2">💵</span>
              {{ $t('checkout.payment.cash.label', 'Cash on Delivery') }}
            </p>
          </div>
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              {{ $t('checkout.expressCheckout.shipping', 'Shipping') }}
            </p>
            <p class="text-sm text-gray-900 dark:text-white">
              {{ preferredShippingMethod || $t('checkout.shippingMethod.standard.name', 'Standard Shipping') }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Order Total -->
    <div class="flex items-center justify-between py-3 border-t border-primary-200 dark:border-primary-700 mb-4">
      <span class="text-gray-700 dark:text-gray-300">{{ $t('common.total') }}</span>
      <span class="text-xl font-bold text-gray-900 dark:text-white">{{ orderTotal }}</span>
    </div>

    <!-- Action Buttons -->
    <div class="flex flex-col sm:flex-row gap-3">
      <button
        :disabled="loading"
        class="flex-1 flex items-center justify-center px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
        @click="$emit('place-order')"
      >
        <span
          v-if="loading"
          class="flex items-center"
        >
          <svg
            class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {{ $t('checkout.processing', 'Processing...') }}
        </span>
        <span
          v-else
          class="flex items-center"
        >
          <svg
            class="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          {{ $t('checkout.expressCheckout.placeOrderNow', 'Place Order Now') }}
        </span>
      </button>

      <button
        class="px-6 py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-medium"
        @click="$emit('edit')"
      >
        {{ $t('checkout.expressCheckout.editDetails', 'Edit Details') }}
      </button>
    </div>

    <!-- Trust Badges -->
    <div class="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-primary-100 dark:border-primary-800">
      <span class="flex items-center text-xs text-gray-500 dark:text-gray-400">
        <svg
          class="w-4 h-4 mr-1 text-green-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clip-rule="evenodd"
          />
        </svg>
        {{ $t('checkout.trustBadges.secure', 'Secure') }}
      </span>
      <span class="flex items-center text-xs text-gray-500 dark:text-gray-400">
        <svg
          class="w-4 h-4 mr-1 text-green-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clip-rule="evenodd"
          />
        </svg>
        {{ $t('checkout.trustBadges.guaranteed', 'Guaranteed') }}
      </span>
      <span class="flex items-center text-xs text-gray-500 dark:text-gray-400">
        <svg
          class="w-4 h-4 mr-1 text-green-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
          <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7h4.05a1 1 0 01.95 1.316l-1.5 4.5A1 1 0 0116.55 13H14v-6z" />
        </svg>
        {{ $t('checkout.trustBadges.fastDelivery', 'Fast Delivery') }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Address } from '~/types/address'

defineProps<{
  defaultAddress: Address | null
  preferredShippingMethod?: string | null
  orderTotal: string
  loading?: boolean
}>()

defineEmits<{
  (e: 'place-order'): void
  (e: 'edit'): void
  (e: 'dismiss'): void
}>()
</script>

<style scoped>
.express-checkout-enhanced {
  animation: slideInDown 0.3s ease-out;
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
