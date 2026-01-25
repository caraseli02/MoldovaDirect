<template>
  <div class="checkout-page">
    <div class="p-4 md:p-6 lg:p-8">
      <!-- Error state when checkout fails to load -->
      <div
        v-if="loadError"
        class="max-w-md mx-auto text-center py-12"
      >
        <div class="mb-4">
          <svg
            class="w-16 h-16 mx-auto text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {{ $t('checkout.errors.loadFailed') }}
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          {{ $t('checkout.errors.pleaseTryAgain') }}
        </p>
        <UiButton @click="retryLoad">
          {{ $t('common.retry') }}
        </UiButton>
      </div>

      <!-- Normal checkout flow -->
      <Suspense v-else>
        <template #default>
          <HybridCheckout />
        </template>
        <template #fallback>
          <div class="max-w-4xl mx-auto">
            <div class="flex justify-center items-center py-12">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
              <span class="ml-3 text-gray-600 dark:text-gray-400">{{ $t('common.loading') }}</span>
            </div>
          </div>
        </template>
      </Suspense>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'

// Error state for error boundary
const loadError = ref<Error | null>(null)

// Capture errors from child components
onErrorCaptured((error) => {
  console.error('Checkout component error:', getErrorMessage(error))
  loadError.value = error
  return false // Prevent error propagation
})

// Retry loading the checkout
const retryLoad = () => {
  loadError.value = null
  window.location.reload()
}

// Import the hybrid checkout component
const HybridCheckout = defineAsyncComponent(() =>
  import('~/components/checkout/HybridCheckout.vue'),
)

// Layout
definePageMeta({
  layout: 'checkout-hybrid',
  middleware: ['checkout'],
})

// Page meta
useHead({
  title: 'Checkout - Moldova Direct',
  meta: [
    { name: 'description', content: 'Complete your purchase securely' },
  ],
})
</script>

<style scoped>
.checkout-page {
  min-height: 60vh;
}
</style>
