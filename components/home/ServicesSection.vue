<template>
  <section class="bg-white py-20 dark:bg-gray-950 md:py-28 lg:py-32">
    <div class="container px-6 md:px-8">
      <div class="flex flex-col gap-8 md:flex-row md:items-center md:justify-between mb-16">
        <div class="max-w-3xl">
          <h2 class="text-4xl font-bold md:text-5xl lg:text-6xl tracking-tight leading-[1.1]">
            {{ t('home.services.title') }}
          </h2>
          <p class="mt-4 text-sm text-gray-600 dark:text-gray-400 md:text-base">
            {{ t('home.services.subtitle') }}
          </p>
        </div>
        <NuxtLink
          :to="localePath('/contact')"
          class="inline-flex items-center gap-2 rounded-full border border-slate-200 px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700/40 dark:text-slate-200 dark:hover:bg-slate-950/30"
        >
          {{ t('home.services.contactCta') }}
          <commonIcon
            name="lucide:arrow-right"
            class="h-4 w-4"
          />
        </NuxtLink>
      </div>
      <div class="mt-12 grid gap-6 md:grid-cols-2">
        <div
          v-for="service in services"
          :key="service.title"
          class="group relative overflow-hidden rounded-3xl border border-gray-200 bg-gray-50 p-8 transition hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900"
        >
          <div class="absolute inset-0 bg-slate-500/0 transition group-hover:bg-slate-500/10"></div>
          <div class="relative">
            <span class="inline-flex items-center justify-center rounded-xl bg-slate-100 p-3 text-slate-600">
              <commonIcon
                :name="service.icon"
                class="h-6 w-6"
              />
            </span>
            <h3 class="mt-6 text-2xl font-semibold">
              {{ service.title }}
            </h3>
            <p class="mt-3 text-sm text-gray-600 dark:text-gray-400">
              {{ service.description }}
            </p>
            <NuxtLink
              :to="service.href"
              class="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition group-hover:translate-x-1 dark:text-slate-200"
            >
              {{ service.cta }}
              <commonIcon
                name="lucide:arrow-right"
                class="h-4 w-4"
              />
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
