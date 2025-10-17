<template>
  <section class="py-16 md:py-24">
    <div class="container">
      <div class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 class="text-3xl font-bold md:text-4xl">{{ t('home.categories.title') }}</h2>
          <p class="mt-3 max-w-2xl text-lg text-gray-600 dark:text-gray-400">{{ t('home.categories.subtitle') }}</p>
        </div>
        <NuxtLink
          :to="localePath('/products')"
          class="inline-flex items-center gap-2 rounded-full border border-primary-200 px-5 py-2 text-sm font-semibold text-primary-700 transition hover:border-primary-400 hover:text-primary-800 dark:border-primary-700/40 dark:text-primary-200"
        >
          {{ t('home.categories.viewAll') }}
          <Icon name="heroicons:arrow-right" class="h-4 w-4" />
        </NuxtLink>
      </div>
      <div class="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <NuxtLink
          v-for="category in categories"
          :key="category.key"
          :to="category.href"
          class="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-8 transition hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900"
        >
          <div :class="['absolute inset-0 opacity-0 transition group-hover:opacity-100', category.accentBackground]"></div>
          <div class="relative flex h-full flex-col justify-between">
            <div>
              <span class="inline-flex items-center justify-center rounded-2xl bg-primary-50 p-3 text-primary-600 transition group-hover:scale-110">
                <Icon :name="category.icon" class="h-6 w-6" />
              </span>
              <h3 class="mt-6 text-2xl font-semibold">{{ category.title }}</h3>
              <p class="mt-3 text-sm text-gray-600 dark:text-gray-400">{{ category.description }}</p>
            </div>
            <span class="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary-700 transition group-hover:translate-x-1 dark:text-primary-200">
              {{ category.cta }}
              <Icon name="heroicons:arrow-right" class="h-4 w-4" />
            </span>
          </div>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  categories: Array<{
    key: string
    title: string
    description: string
    cta: string
    href: string
    icon: string
    accentBackground: string
  }>
}>()

const { t } = useI18n()
const localePath = useLocalePath()
</script>
