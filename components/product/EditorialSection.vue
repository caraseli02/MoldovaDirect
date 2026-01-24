<template>
  <section class="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
          {{ t('products.editorial.title') }}
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ t('products.editorial.subtitle') }}
        </p>
      </div>
    </div>
    <div class="grid gap-4 md:grid-cols-3">
      <article
        v-for="story in stories"
        :key="story.id"
        class="group relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6 transition hover:-translate-y-1 hover:shadow-lg dark:border-gray-800 dark:from-gray-900 dark:to-gray-800"
      >
        <span class="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-800 dark:bg-blue-900/60 dark:text-blue-200">
          {{ story.tag }}
        </span>
        <h4 class="mt-4 text-lg font-semibold text-gray-900 transition group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-200">
          {{ story.title }}
        </h4>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {{ story.description }}
        </p>
        <UiButton type="button">
          {{ t('products.editorial.cta') }}
          <span aria-hidden="true">→</span>
        </UiButton>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * Editorial Section Component
 *
 * Displays editorial content stories about wines, pairings, and heritage.
 * Extracted from pages/products/index.vue to reduce component size.
 */
import { useI18n } from 'vue-i18n'

interface EditorialStory {
  id: string
  title: string
  description: string
  tag: string
}

interface Props {
  stories: EditorialStory[]
}

defineProps<Props>()

const { t } = useI18n()
</script>
