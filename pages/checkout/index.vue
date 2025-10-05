<template>
  <div class="checkout-page">
    <div class="p-6 md:p-8">
      <ShippingStep />
    </div>
  </div>
</template>

<script setup lang="ts">
import ShippingStep from '~/components/checkout/ShippingStep.vue'

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