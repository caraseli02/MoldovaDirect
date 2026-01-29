<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <UiCard
        v-for="n in skeletonCount"
        :key="`skeleton-${n}`"
      >
        <UiCardContent class="p-4">
          <UiSkeleton class="mb-4 aspect-square rounded-xl" />
          <UiSkeleton class="mb-2 h-4 w-full" />
          <UiSkeleton class="h-3 w-2/3" />
        </UiCardContent>
      </UiCard>
    </div>

    <div
      v-if="showMessage"
      class="rounded-xl border border-slate-200/70 bg-white/70 px-4 py-3 text-sm text-slate-600 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/40 dark:text-slate-200"
      role="status"
      aria-live="polite"
    >
      {{ message }}
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Loading State Component
 *
 * Displays loading skeletons while products are being fetched.
 * Extracted from pages/products/index.vue to reduce component size.
 */
interface Props {
  skeletonCount?: number
  showMessage?: boolean
  message?: string
}

withDefaults(defineProps<Props>(), {
  skeletonCount: 8,
  showMessage: false,
  message: '',
})
</script>
