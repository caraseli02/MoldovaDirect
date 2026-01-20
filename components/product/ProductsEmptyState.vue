<template>
  <div
    class="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm dark:border-gray-700 dark:bg-gray-900"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="mx-auto mb-4 h-16 w-16 text-gray-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
      />
    </svg>
    <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
      {{ hasActiveFilters ? t('products.noResults') : t('products.noProducts') }}
    </h2>
    <p class="text-gray-600 dark:text-gray-400">
      {{ hasActiveFilters ? t('products.tryDifferentFilters') : t('products.comingSoon') }}
    </p>
    <UiButton
      v-if="hasActiveFilters"
      type="button"
      class="mt-6 rounded-full"
      @click="$emit('clearFilters')"
    >
      {{ t('products.clearFilters') }}
    </UiButton>
  </div>
</template>

<script setup lang="ts">
/**
 * Products Empty State Component
 *
 * Displays empty state when no products are found.
 * Extracted from pages/products/index.vue to reduce component size.
 */
interface Props {
  hasActiveFilters: boolean
}

defineProps<Props>()

defineEmits<{
  clearFilters: []
}>()

const { t } = useI18n()
</script>
