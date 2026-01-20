<template>
  <div class="rounded-2xl border border-red-100 bg-white p-10 text-center shadow-sm dark:border-red-900/40 dark:bg-gray-900">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="mx-auto mb-4 h-16 w-16 text-red-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
    <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
      {{ t('common.error') }}
    </h2>
    <p class="text-gray-600 dark:text-gray-400 mb-6">
      {{ errorMessage || t('common.errorGeneric') }}
    </p>
    <UiButton
      type="button"
      class="rounded-full"
      @click="$emit('retry')"
    >
      {{ t('common.tryAgain') }}
    </UiButton>
  </div>
</template>

<script setup lang="ts">
/**
 * Error State Component
 *
 * Displays error state with retry button.
 * Extracted from pages/products/index.vue to reduce component size.
 */
interface Props {
  errorMessage?: string
}

defineProps<Props>()

defineEmits<{
  retry: []
}>()

const { t } = useI18n()
</script>
