<template>
  <section class="bg-white py-16 dark:bg-gray-950 md:py-24">
    <div class="container">
      <div class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 class="text-3xl font-bold md:text-4xl">{{ t('home.services.title') }}</h2>
          <p class="mt-3 max-w-2xl text-lg text-gray-600 dark:text-gray-400">{{ t('home.services.subtitle') }}</p>
        </div>
        <NuxtLink
          :to="localePath('/contact')"
          class="inline-flex items-center gap-2 rounded-full border border-primary-200 px-5 py-2 text-sm font-semibold text-primary-700 transition hover:border-primary-400 hover:text-primary-800 dark:border-primary-700/40 dark:text-primary-200"
        >
          {{ t('home.services.contactCta') }}
          <Icon name="heroicons:arrow-right" class="h-4 w-4" />
        </NuxtLink>
      </div>
      <div class="mt-12 grid gap-6 md:grid-cols-2">
        <div
          v-for="service in services"
          :key="service.title"
          class="group relative overflow-hidden rounded-3xl border border-gray-200 bg-gray-50 p-8 transition hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900"
        >
          <div class="absolute inset-0 bg-gradient-to-br from-primary-500/0 via-primary-500/0 to-primary-500/5 transition group-hover:from-primary-500/10 group-hover:to-primary-500/20"></div>
          <div class="relative">
            <span class="inline-flex items-center justify-center rounded-2xl bg-primary-100 p-3 text-primary-600">
              <Icon :name="service.icon" class="h-6 w-6" />
            </span>
            <h3 class="mt-6 text-2xl font-semibold">{{ service.title }}</h3>
            <p class="mt-3 text-sm text-gray-600 dark:text-gray-400">{{ service.description }}</p>
            <NuxtLink
              :to="service.href"
              class="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary-700 transition group-hover:translate-x-1 dark:text-primary-200"
            >
              {{ service.cta }}
              <Icon name="heroicons:arrow-right" class="h-4 w-4" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  services: Array<{
    title: string
    description: string
    cta: string
    href: string
    icon: string
  }>
}>()

const { t } = useI18n()
const localePath = useLocalePath()
</script>
