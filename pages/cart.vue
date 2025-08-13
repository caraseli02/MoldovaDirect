<template>
  <div class="py-12">
    <div class="container">
      <h1 class="text-4xl font-bold mb-8">{{ $t('common.cart') }}</h1>
      
      <div class="text-center py-20">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h2 class="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
        <p class="text-gray-600 mb-6">Start shopping to add items to your cart</p>
        <NuxtLink 
          :to="localePath('/products')" 
          class="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
        >
          {{ $t('common.continueShopping') }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const localePath = useLocalePath()

// SEO Meta
useHead({
  title: 'Shopping Cart - Moldova Direct',
  meta: [
    {
      name: 'description',
      content: 'Review your selected Moldovan products and proceed to checkout.'
    }
  ]
})
</script>