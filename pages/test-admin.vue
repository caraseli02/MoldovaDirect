<!--
  Test Admin Dashboard Page (for testing purposes)
  This page bypasses authentication to test the dashboard components
-->

<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard Test</h1>
      
      <!-- Test Dashboard Components -->
      <AdminDashboardOverview />
    </div>
  </div>
</template>

<script setup lang="ts">
// No authentication required for testing
definePageMeta({
  layout: false
})

// SEO
useHead({
  title: 'Test Admin Dashboard - Moldova Direct',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})
</script>