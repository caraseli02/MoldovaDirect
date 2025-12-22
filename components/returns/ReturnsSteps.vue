<template>
  <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <div class="flex items-center gap-3">
      <span class="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-100">
        <svg
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M7 8h10M7 12h6m-2 8l4-4H9l-4 4V4a2 2 0 012-2h10a2 2 0 012 2v9"
          />
        </svg>
      </span>
      <div>
        <p class="text-sm font-semibold text-primary-700 dark:text-primary-100">
          {{ t('returns.steps.title') }}
        </p>
        <p class="text-gray-700 dark:text-gray-300">
          {{ t('returns.steps.subtitle') }}
        </p>
      </div>
    </div>
    <ol class="mt-6 space-y-4">
      <li
        v-for="(step, index) in steps"
        :key="step.title"
        class="flex gap-4"
      >
        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-sm font-semibold text-primary-700 ring-2 ring-primary-100 dark:bg-primary-900/30 dark:text-primary-100 dark:ring-primary-800/40">
          {{ index + 1 }}
        </div>
        <div class="space-y-1">
          <p class="text-base font-semibold text-gray-900 dark:text-white">
            {{ step.title }}
          </p>
          <p class="text-sm text-gray-700 dark:text-gray-300">
            {{ step.description }}
          </p>
        </div>
      </li>
    </ol>
    <div class="mt-6 grid gap-4 md:grid-cols-2">
      <div class="rounded-xl bg-gray-50 p-4 ring-1 ring-gray-100 dark:bg-gray-950 dark:ring-gray-800">
        <p class="text-sm font-semibold text-gray-900 dark:text-white">
          {{ t('returns.steps.documentsTitle') }}
        </p>
        <ul class="mt-2 space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li
            v-for="item in documents"
            :key="item"
            class="flex gap-2"
          >
            <span class="mt-1 h-2 w-2 rounded-full bg-primary-500" />
            <span>{{ item }}</span>
          </li>
        </ul>
      </div>
      <div class="rounded-xl bg-primary-50/70 p-4 ring-1 ring-primary-100 dark:bg-primary-900/20 dark:ring-primary-800/40">
        <p class="text-sm font-semibold text-primary-800 dark:text-primary-100">
          {{ t('returns.steps.packagingTitle') }}
        </p>
        <p class="mt-1 text-sm text-gray-800 dark:text-gray-100">
          {{ t('returns.steps.packagingDescription') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

const steps = computed(() => [
  {
    title: t('returns.steps.items.review.title'),
    description: t('returns.steps.items.review.description'),
  },
  {
    title: t('returns.steps.items.document.title'),
    description: t('returns.steps.items.document.description'),
  },
  {
    title: t('returns.steps.items.contact.title'),
    description: t('returns.steps.items.contact.description'),
  },
  {
    title: t('returns.steps.items.ship.title'),
    description: t('returns.steps.items.ship.description'),
  },
])

const documents = computed(() => [
  t('returns.steps.documents.order'),
  t('returns.steps.documents.photos'),
  t('returns.steps.documents.packaging'),
  t('returns.steps.documents.preference'),
])
</script>
