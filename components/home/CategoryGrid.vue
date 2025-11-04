<template>
  <section class="py-20 md:py-28">
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
          <commonIcon name="lucide:arrow-right" class="h-4 w-4" />
        </NuxtLink>
      </div>
      <div class="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <NuxtLink
          v-for="category in categories"
          :key="category.key"
          :to="category.href"
          class="group relative overflow-hidden rounded-3xl border border-gray-200 bg-gray-900/95 transition hover:-translate-y-1 hover:shadow-2xl dark:border-gray-800 dark:bg-gray-900"
        >
          <NuxtImg
            :src="category.image"
            :alt="category.imageAlt"
            densities="1x 2x"
            class="absolute inset-0 h-full w-full object-cover brightness-[1.05] transition duration-700 ease-out group-hover:scale-105"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/35 to-transparent"></div>
          <div
            :class="[
              'absolute inset-0 opacity-45 mix-blend-soft-light transition group-hover:opacity-65',
              category.accentBackground
            ]"
          ></div>
          <div class="relative flex h-full min-h-[22rem] flex-col justify-between p-8 text-white">
            <div class="space-y-4">
              <span class="inline-flex items-center justify-center rounded-xl bg-white/90 p-3 text-slate-900 shadow-lg shadow-slate-900/15 transition group-hover:bg-white">
                <commonIcon :name="category.icon" class="h-6 w-6" />
              </span>
              <div class="space-y-3">
                <h3 class="text-2xl font-semibold leading-tight">{{ category.title }}</h3>
                <p class="text-sm text-white/85">{{ category.description }}</p>
              </div>
            </div>
            <span class="inline-flex items-center gap-2 text-sm font-semibold text-white transition group-hover:translate-x-1">
              {{ category.cta }}
              <commonIcon name="lucide:arrow-right" class="h-4 w-4" />
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
    image: string
    imageAlt: string
  }>
}>()

const { t } = useI18n()
const localePath = useLocalePath()
</script>
