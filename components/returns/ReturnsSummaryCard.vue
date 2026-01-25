<template>
  <div class="rounded-xl bg-white/80 p-4 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900/60 dark:ring-gray-800">
    <p class="text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
      {{ title }}
    </p>
    <p class="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
      {{ metric }}
    </p>
    <p class="mt-1 text-gray-600 dark:text-gray-300">
      {{ description }}
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  metric: string
  description: string
}>()
</script>
