<template>
  <div class="checkout-page">
    <div class="p-6 md:p-8">
      <Suspense>
        <template #default>
          <PaymentStep />
        </template>
        <template #fallback>
          <div class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--md-wine)] dark:border-[var(--md-gold)]"></div>
            <span class="ml-3 text-[var(--md-gray-600)] dark:text-[var(--md-gray-400)]">Loading payment form...</span>
          </div>
        </template>
      </Suspense>
    </div>
  </div>
</template>

<script setup lang="ts">
// Lazy load the payment step component
const PaymentStep = defineAsyncComponent(() =>
  import('~/components/checkout/PaymentStep.vue'),
)

// Layout
definePageMeta({
  layout: 'checkout',
  middleware: ['checkout'],
})

// Page meta
useHead({
  title: 'Payment Method - Checkout',
  meta: [
    { name: 'description', content: 'Select your payment method to complete your order' },
  ],
})
</script>

<style scoped>
.checkout-page {
  min-height: 60vh;
}
</style>
