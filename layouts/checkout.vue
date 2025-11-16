<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Checkout Header -->
    <CheckoutHeader />
    
    <!-- Main Checkout Content -->
    <main class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <!-- Progress Indicator -->
        <CheckoutProgressIndicator 
          :current-step="currentStep"
          :steps="checkoutSteps"
          class="mb-8"
        />
        
        <!-- Checkout Content -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <slot />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { CheckoutStep } from '~/types/checkout'

// Define checkout steps for progress indicator
const checkoutSteps = [
  {
    id: 'shipping' as CheckoutStep,
    name: 'Shipping',
    description: 'Delivery information'
  },
  {
    id: 'payment' as CheckoutStep,
    name: 'Payment',
    description: 'Payment method'
  },
  {
    id: 'review' as CheckoutStep,
    name: 'Review',
    description: 'Order summary'
  },
  {
    id: 'confirmation' as CheckoutStep,
    name: 'Confirmation',
    description: 'Order complete'
  }
]

// Get current step from checkout store
const checkoutStore = useCheckoutStore()
const currentStep = computed(() => checkoutStore.currentStep)

// Set page meta
useHead({
  title: 'Checkout - Moldova Direct',
  meta: [
    { name: 'description', content: 'Complete your purchase securely' },
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})
</script>
