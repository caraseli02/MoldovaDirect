<template>
  <div class="checkout-page">
    <div class="p-6 md:p-8">
      <div class="max-w-2xl mx-auto">
        <!-- Step Header -->
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {{ $t('checkout.steps.review.title') }}
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            {{ $t('checkout.steps.review.subtitle') }}
          </p>
        </div>

        <!-- Order Review Placeholder -->
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border-2 border-dashed border-gray-300 dark:border-gray-600">
          <div class="text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              {{ $t('checkout.orderReview.title') }}
            </h3>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {{ $t('checkout.orderReview.placeholder') }}
            </p>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700 space-y-3 sm:space-y-0 mt-8">
          <button 
            @click="goBack"
            class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            {{ $t('checkout.backToPayment') }}
          </button>

          <button 
            @click="placeOrder"
            class="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-green-600 dark:bg-green-500 border border-transparent rounded-md hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
          >
            {{ $t('checkout.placeOrder') }}
            <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Layout
definePageMeta({
  layout: 'checkout',
  middleware: ['checkout']
})

// Composables
const localePath = useLocalePath()

// Methods
const goBack = async () => {
  await navigateTo(localePath('/checkout/payment'))
}

const placeOrder = async () => {
  // In the actual implementation, this would process the payment
  await navigateTo(localePath('/checkout/confirmation'))
}

// Page meta
useHead({
  title: 'Review Order - Checkout',
  meta: [
    { name: 'description', content: 'Review your order details before completing your purchase' }
  ]
})
</script>

<style scoped>
.checkout-page {
  @apply min-h-[60vh];
}
</style>