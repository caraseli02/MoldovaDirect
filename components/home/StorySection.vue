<template>
  <section class="bg-gray-50 py-16 dark:bg-gray-900 md:py-24">
    <div class="container">
      <div class="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center">
        <div>
          <h2 class="text-3xl font-bold md:text-4xl">{{ t('home.story.title') }}</h2>
          <p class="mt-4 text-lg text-gray-600 dark:text-gray-400">{{ t('home.story.subtitle') }}</p>
          <dl class="mt-10 space-y-8">
            <div v-for="point in points" :key="point.title" class="flex gap-4">
              <div class="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
                <Icon :name="point.icon" class="h-6 w-6" />
              </div>
              <div>
                <dt class="text-xl font-semibold">{{ point.title }}</dt>
                <dd class="mt-2 text-sm text-gray-600 dark:text-gray-400">{{ point.description }}</dd>
              </div>
            </div>
          </dl>
          <NuxtLink
            :to="localePath('/about')"
            class="mt-10 inline-flex items-center gap-2 rounded-full bg-primary-600 px-6 py-3 font-semibold text-white transition hover:bg-primary-700"
          >
            {{ t('home.story.cta') }}
            <Icon name="heroicons:arrow-right" class="h-5 w-5" />
          </NuxtLink>
        </div>
        <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 to-primary-400 p-1">
          <div class="h-full w-full rounded-[22px] bg-white p-8 text-gray-900 shadow-2xl dark:bg-gray-950 dark:text-gray-100">
            <h3 class="text-2xl font-semibold">{{ t('home.story.timeline.title') }}</h3>
            <p class="mt-3 text-sm text-gray-600 dark:text-gray-400">{{ t('home.story.timeline.description') }}</p>
            <ul class="mt-6 space-y-4">
              <li v-for="item in timeline" :key="item.year" class="flex gap-4">
                <div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
                  <span class="text-lg font-semibold">{{ item.year }}</span>
                </div>
                <div>
                  <p class="font-semibold">{{ item.title }}</p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">{{ item.description }}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  points: Array<{
    title: string
    description: string
    icon: string
  }>
  timeline: Array<{
    year: string
    title: string
    description: string
  }>
}>()

const { t } = useI18n()
const localePath = useLocalePath()
</script>
