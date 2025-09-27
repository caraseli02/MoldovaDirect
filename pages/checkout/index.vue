<template>
  <div class="checkout-page">
    <!-- Shipping Step Content -->
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

        <!-- Shipping Form Placeholder -->
        <div class="space-y-6">
          <!-- Guest/Login Options -->
          <div v-if="!user" class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
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

          <!-- Shipping Form Placeholder -->
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border-2 border-dashed border-gray-300 dark:border-gray-600">
            <div class="text-center">
              <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                {{ $t('checkout.shippingForm.title') }}
              </h3>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {{ $t('checkout.shippingForm.placeholder') }}
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
              :disabled="!canProceed"
              class="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-primary-600 dark:bg-primary-500 border border-transparent rounded-md hover:bg-primary-700 dark:hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ $t('checkout.continueToPayment') }}
              <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
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
const user = useSupabaseUser()
const checkoutStore = useCheckoutStore()

// State
const showGuestForm = ref(false)

// Computed
const canProceed = computed(() => {
  // For now, always allow proceeding (will be updated when shipping form is implemented)
  return true
})

// Methods
const continueAsGuest = () => {
  showGuestForm.value = true
  // In the actual implementation, this would show the guest checkout form
}

const proceedToPayment = async () => {
  try {
    // For now, just navigate to payment step
    // In the actual implementation, this would validate shipping info first
    await navigateTo(localePath('/checkout/payment'))
  } catch (error) {
    console.error('Failed to proceed to payment:', error)
  }
}

// Page meta
useHead({
  title: 'Shipping Information - Checkout',
  meta: [
    { name: 'description', content: 'Enter your shipping information to complete your order' }
  ]
})
</script>

<style scoped>
.checkout-page {
  @apply min-h-[60vh];
}

/* Ensure proper spacing on mobile */
@media (max-width: 640px) {
  .checkout-page {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
}
</style>