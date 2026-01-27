<template>
  <UiCard v-if="reviewSummary">
    <UiCardHeader>
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <UiCardTitle>{{ $t('products.socialProof.title') }}</UiCardTitle>
          <UiCardDescription>{{ $t('products.socialProof.subtitle') }}</UiCardDescription>
        </div>
        <div
          class="flex items-center gap-2 rounded-full bg-yellow-100 px-4 py-2 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200"
        >
          <span class="text-lg font-semibold">{{ reviewSummary.rating }}</span>
          <div class="flex items-center">
            <svg
              v-for="star in 5"
              :key="`star-${star}`"
              xmlns="http://www.w3.org/2000/svg"
              :class="star <= Math.round(reviewSummary.rating) ? 'text-yellow-500' : 'text-yellow-300 dark:text-yellow-700'"
              class="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
              />
            </svg>
          </div>
        </div>
      </div>
    </UiCardHeader>
    <UiCardContent class="grid gap-4 sm:grid-cols-3">
      <div
        v-for="highlight in reviewSummary.highlights"
        :key="highlight"
        class="p-4 text-sm text-gray-700 dark:text-gray-300"
      >
        {{ highlight }}
      </div>
      <div class="p-4 text-sm font-medium text-blue-700 dark:text-blue-300">
        {{ $t('products.socialProof.rating', { rating: reviewSummary.rating, count: reviewSummary.count }) }}
      </div>
    </UiCardContent>
    <UiCardFooter>
      <UiButton
        type="button"
        variant="outline"
        size="sm"
        class="rounded-full"
      >
        {{ $t('products.socialProof.cta') }}
      </UiButton>
    </UiCardFooter>
  </UiCard>
</template>

<script setup lang="ts">
defineProps<{
  reviewSummary?: {
    rating: number
    count: number
    highlights: string[]
  }
}>()
</script>
