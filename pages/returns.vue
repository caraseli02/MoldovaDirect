<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">{{ $t('returns.title') }}</h1>
    <div class="prose max-w-none">
      <p>{{ $t('returns.description') }}</p>
    </div>
  </div>
</template>

<script setup>
useHead({
  title: 'Returns & Refunds'
})
</script>