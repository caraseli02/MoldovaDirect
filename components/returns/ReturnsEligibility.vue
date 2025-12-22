<template>
  <div class="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <div class="flex items-center gap-3">
      <span class="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-100">
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
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </span>
      <div>
        <p class="text-sm font-semibold text-primary-700 dark:text-primary-100">
          {{ t('returns.eligibility.title') }}
        </p>
        <p class="text-gray-700 dark:text-gray-300">
          {{ t('returns.eligibility.subtitle') }}
        </p>
      </div>
    </div>
    <div class="grid gap-6 md:grid-cols-2">
      <div class="rounded-xl bg-primary-50/70 p-4 ring-1 ring-primary-100 dark:bg-primary-900/20 dark:ring-primary-800/40">
        <p class="mb-3 text-sm font-semibold text-primary-800 dark:text-primary-100">
          {{ t('returns.eligibility.allowedTitle') }}
        </p>
        <ul class="space-y-2 text-gray-800 dark:text-gray-200">
          <li
            v-for="item in allowedItems"
            :key="item"
            class="flex gap-2"
          >
            <span class="mt-1 h-2 w-2 rounded-full bg-primary-500" />
            <span>{{ item }}</span>
          </li>
        </ul>
      </div>
      <div class="rounded-xl bg-white p-4 ring-1 ring-gray-100 dark:bg-gray-950 dark:ring-gray-800">
        <p class="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
          {{ t('returns.eligibility.deniedTitle') }}
        </p>
        <ul class="space-y-2 text-gray-700 dark:text-gray-300">
          <li
            v-for="item in deniedItems"
            :key="item"
            class="flex gap-2"
          >
            <span class="mt-1 h-2 w-2 rounded-full bg-gray-400" />
            <span>{{ item }}</span>
          </li>
        </ul>
      </div>
    </div>
    <p class="text-sm text-gray-600 dark:text-gray-400">
      {{ t('returns.eligibility.note') }}
    </p>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

const allowedItems = computed(() => [
  t('returns.eligibility.allowed.damaged'),
  t('returns.eligibility.allowed.incorrect'),
  t('returns.eligibility.allowed.quality'),
  t('returns.eligibility.allowed.unopened'),
])

const deniedItems = computed(() => [
  t('returns.eligibility.denied.used'),
  t('returns.eligibility.denied.late'),
  t('returns.eligibility.denied.perishable'),
  t('returns.eligibility.denied.custom'),
])
</script>
