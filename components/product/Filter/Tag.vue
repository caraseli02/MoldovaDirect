<template>
  <span class="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full">
    {{ label }}
    <UiButton
      @click="$emit('remove')"
      variant="ghost"
      size="icon"
      class="ml-1 h-5 w-5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800"
      :aria-label="$t('products.filters.removeFilter', { filter: label })"
    >
      <commonIcon name="lucide:x" class="h-3 w-3" />
    </UiButton>
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