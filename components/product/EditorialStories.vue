<template>
  <section class="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
          {{ title }}
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ subtitle }}
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
        <button
          type="button"
          class="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-700 transition hover:text-blue-800 dark:text-blue-200 dark:hover:text-blue-100"
        >
          {{ ctaText }}
          <span aria-hidden="true">→</span>
        </button>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Story {
  id: string
  title: string
  description: string
  tag: string
}

interface Props {
  title: string
  subtitle: string
  ctaText: string
  stories: Story[]
}

defineProps<Props>()
</script>
