<template>
  <div class="py-12">
    <div class="container">
      <h1 class="text-4xl font-bold mb-8">{{ $t('common.shop') }}</h1>
      
      <div class="text-center py-20">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <h2 class="text-2xl font-semibold text-gray-900 mb-2">Products Coming Soon</h2>
        <p class="text-gray-600">We're preparing our product catalog. Check back soon!</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// SEO Meta
useHead({
  title: 'Shop - Moldova Direct',
  meta: [
    {
      name: 'description',
      content: 'Browse authentic Moldovan food and wine products. Premium quality directly from Moldova to Spain.'
    }
  ]
})
</script>