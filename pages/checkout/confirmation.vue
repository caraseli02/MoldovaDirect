<template>
  <div class="checkout-page">
    <div class="p-6 md:p-8">
      <div class="max-w-2xl mx-auto text-center">
        <!-- Success Icon -->
        <div class="mb-8">
          <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20">
            <svg class="h-8 w-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <!-- Success Message -->
        <div class="mb-8">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {{ $t('checkout.confirmation.title') }}
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-400 mb-2">
            {{ $t('checkout.confirmation.subtitle') }}
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-500">
            {{ $t('checkout.confirmation.emailSent') }}
          </p>
        </div>

        <!-- Order Details Placeholder -->
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600 mb-8">
          <div class="text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {{ $t('checkout.confirmation.orderDetails') }}
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ $t('checkout.confirmation.orderDetailsPlaceholder') }}
            </p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <NuxtLink 
            :to="localePath('/account/orders')"
            class="inline-flex items-center px-6 py-2 text-sm font-medium text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-md hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
          >
            {{ $t('checkout.confirmation.viewOrders') }}
          </NuxtLink>

          <NuxtLink 
            :to="localePath('/')"
            class="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-primary-600 dark:bg-primary-500 border border-transparent rounded-md hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
          >
            {{ $t('checkout.confirmation.continueShopping') }}
          </NuxtLink>
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

// Page meta
useHead({
  title: 'Order Confirmation - Checkout',
  meta: [
    { name: 'description', content: 'Your order has been successfully placed' }
  ]
})

// Clean up checkout session on confirmation page
onMounted(() => {
  // Clear checkout session after a delay to allow user to see confirmation
  setTimeout(() => {
    const checkoutStore = useCheckoutStore()
    checkoutStore.resetCheckout()
  }, 5000)
})
</script>

<style scoped>
.checkout-page {
  @apply min-h-[60vh];
}
</style>