<template>
  <CheckoutShippingStep />
</template>

<script setup lang="ts">
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