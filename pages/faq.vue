<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">{{ $t('faq.title') }}</h1>
    <div class="prose max-w-none">
      <p>{{ $t('faq.description') }}</p>
    </div>
  </div>
</template>

<script setup>
useHead({
  title: 'Frequently Asked Questions'
})
</script>