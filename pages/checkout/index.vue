<template>
  <div class="checkout-page">
    <div class="p-6 md:p-8">
      <Suspense>
        <template #default>
          <ShippingStep />
        </template>
        <template #fallback>
          <div class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span class="ml-3 text-gray-600 dark:text-gray-400">Loading shipping form...</span>
          </div>
        </template>
      </Suspense>
    </div>
  </div>
</template>

<script setup lang="ts">
// Lazy load the shipping step component
const ShippingStep = defineAsyncComponent(() =>
  import('~/components/checkout/ShippingStep.vue')
)

// Layout
definePageMeta({
  layout: 'checkout',
  middleware: ['checkout']
})

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
  min-height: 60vh;
}
</style>