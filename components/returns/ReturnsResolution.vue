<template>
  <div class="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <div class="flex items-center gap-3">
      <span class="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-100">
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
            d="M12 8c-1.657 0-3 1.343-3 3v1a3 3 0 106 0v-1c0-1.657-1.343-3-3-3z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 11v1a7 7 0 11-14 0v-1"
          />
        </svg>
      </span>
      <div>
        <p class="text-sm font-semibold text-emerald-700 dark:text-emerald-100">
          {{ t('returns.resolution.title') }}
        </p>
        <p class="text-gray-700 dark:text-gray-300">
          {{ t('returns.resolution.subtitle') }}
        </p>
      </div>
    </div>
    <div class="grid gap-4">
      <div
        v-for="option in resolutionOptions"
        :key="option.title"
        class="rounded-xl bg-gray-50 p-4 ring-1 ring-gray-100 dark:bg-gray-950 dark:ring-gray-800"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-sm font-semibold text-gray-900 dark:text-white">
              {{ option.title }}
            </p>
            <p class="text-sm text-gray-700 dark:text-gray-300">
              {{ option.description }}
            </p>
          </div>
          <span class="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-100 dark:ring-emerald-800/40">
            {{ option.badge }}
          </span>
        </div>
      </div>
    </div>
    <p class="text-sm text-gray-600 dark:text-gray-400">
      {{ t('returns.resolution.note') }}
    </p>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

const resolutionOptions = computed(() => [
  {
    title: t('returns.resolution.options.refund.title'),
    description: t('returns.resolution.options.refund.description'),
    badge: t('returns.resolution.options.refund.badge'),
  },
  {
    title: t('returns.resolution.options.replacement.title'),
    description: t('returns.resolution.options.replacement.description'),
    badge: t('returns.resolution.options.replacement.badge'),
  },
  {
    title: t('returns.resolution.options.credit.title'),
    description: t('returns.resolution.options.credit.description'),
    badge: t('returns.resolution.options.credit.badge'),
  },
])
</script>
