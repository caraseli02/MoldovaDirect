<template>
  <div class="py-12">
    <div class="container">
      <h1 class="text-4xl font-bold mb-8">{{ $t('common.account') }}</h1>
      
      <div class="text-center py-20">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <h2 class="text-2xl font-semibold text-gray-900 mb-2">Account Features Coming Soon</h2>
        <p class="text-gray-600">User authentication and account management will be available soon!</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// SEO Meta
useHead({
  title: 'My Account - Moldova Direct',
  meta: [
    {
      name: 'description',
      content: 'Manage your Moldova Direct account, orders, and preferences.'
    }
  ]
})
</script>