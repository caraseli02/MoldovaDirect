<template>
  <section class="bg-white py-16 dark:bg-gray-950 md:py-24">
    <div class="container">
      <div class="mx-auto max-w-3xl text-center">
        <h2 class="text-3xl font-bold md:text-4xl">{{ t('home.faqPreview.title') }}</h2>
        <p class="mt-3 text-lg text-gray-600 dark:text-gray-400">{{ t('home.faqPreview.subtitle') }}</p>
      </div>
      <div class="mt-12 grid gap-6 md:grid-cols-2">
        <details
          v-for="item in items"
          :key="item.question"
          class="group rounded-3xl border border-gray-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg open:border-primary-300 open:bg-primary-50/30 dark:border-gray-800 dark:bg-gray-900"
        >
          <summary class="flex cursor-pointer items-center justify-between text-left text-lg font-semibold">
            <span>{{ item.question }}</span>
            <commonIcon name="lucide:chevron-down" class="h-5 w-5 transition group-open:rotate-180" />
          </summary>
          <p class="mt-4 text-sm text-gray-600 dark:text-gray-400">{{ item.answer }}</p>
        </details>
      </div>
      <div class="mt-12 text-center">
        <NuxtLink
          :to="localePath('/faq')"
          class="inline-flex items-center gap-2 rounded-full bg-primary-600 px-6 py-3 font-semibold text-white transition hover:bg-primary-700"
        >
          {{ t('home.faqPreview.cta') }}
          <commonIcon name="lucide:arrow-right" class="h-5 w-5" />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  items: Array<{
    question: string
    answer: string
  }>
}>()

const { t } = useI18n()
const localePath = useLocalePath()
</script>
