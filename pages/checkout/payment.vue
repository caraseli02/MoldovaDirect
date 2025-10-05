<template>
  <div class="checkout-page">
    <div class="p-6 md:p-8">
      <PaymentStep />
    </div>
  </div>
</template>

<script setup lang="ts">
import PaymentStep from '~/components/checkout/PaymentStep.vue'

// Layout
definePageMeta({
  layout: 'checkout',
  middleware: ['checkout']
})

// Page meta
useHead({
  title: 'Payment Method - Checkout',
  meta: [
    { name: 'description', content: 'Select your payment method to complete your order' }
  ]
})
</script>

<style scoped>
.checkout-page {
  min-height: 60vh;
}
</style>