<template>
  <section class="bg-gray-50 py-20 dark:bg-gray-900 md:py-28">
    <div class="container">
      <div class="mx-auto max-w-3xl text-center">
        <h2 class="text-3xl font-bold md:text-4xl">{{ t('home.howItWorks.title') }}</h2>
        <p class="mt-3 text-lg text-gray-600 dark:text-gray-400">{{ t('home.howItWorks.subtitle') }}</p>
      </div>
      <div class="mt-12 grid gap-8 md:grid-cols-3">
        <div
          v-for="(step, index) in steps"
          :key="step.key"
          class="relative overflow-hidden rounded-3xl bg-white p-8 text-left shadow-lg transition hover:-translate-y-1 hover:shadow-xl dark:bg-gray-950"
        >
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
            <commonIcon :name="step.icon" class="h-6 w-6" />
          </div>
          <div class="mt-6">
            <p class="text-sm font-semibold text-primary-600">{{ formatStep(index + 1) }}</p>
            <h3 class="mt-2 text-xl font-semibold">{{ step.title }}</h3>
            <p class="mt-3 text-sm text-gray-600 dark:text-gray-400">{{ step.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  steps: Array<{
    key: string
    title: string
    description: string
    icon: string
  }>
}>()

const { t } = useI18n()

const formatStep = (value: number) => value.toString().padStart(2, '0')
</script>
