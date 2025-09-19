<template>
  <span class="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full">
    {{ label }}
    <button
      @click="$emit('remove')"
      class="ml-1 p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full transition-colors"
      :aria-label="$t('products.filters.removeFilter', { filter: label })"
    >
      <commonIcon name="heroicons:x-mark" class="w-3 h-3" />
    </button>
  </span>
</template>

<script setup lang="ts">
interface Props {
  label: string
}

interface Emits {
  (e: 'remove'): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>