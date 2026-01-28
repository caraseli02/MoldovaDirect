<template>
  <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-sm font-semibold text-gray-900 dark:text-white">
          {{ t('returns.support.title') }}
        </p>
        <p class="mt-2 text-sm text-gray-700 dark:text-gray-300">
          {{ t('returns.support.description') }}
        </p>
      </div>
      <span class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-100 dark:ring-emerald-800/40">
        {{ t('returns.support.badge') }}
      </span>
    </div>
    <div class="mt-4 space-y-3">
      <a
        class="flex items-center justify-between rounded-lg bg-gray-50 p-3 text-sm font-semibold text-gray-900 ring-1 ring-gray-100 transition hover:bg-slate-50 hover:text-slate-800 hover:ring-slate-200 dark:bg-gray-950 dark:text-white dark:ring-gray-800 dark:hover:bg-slate-900/20 dark:hover:text-slate-100 dark:hover:ring-slate-700/40"
        :href="`mailto:${supportEmail}?subject=${encodeURIComponent(t('returns.support.emailSubject'))}`"
        aria-label="Email customer support for return assistance"
      >
        <span>{{ supportEmail }}</span>
        <svg
          class="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17 8l4 4m0 0l-4 4m4-4H3"
          />
        </svg>
      </a>
      <NuxtLink
        :to="localePath('/contact')"
        class="flex items-center justify-between rounded-lg bg-slate-50 p-3 text-sm font-semibold text-slate-800 ring-1 ring-slate-200 transition hover:bg-slate-100 hover:ring-slate-300 dark:bg-slate-900/20 dark:text-slate-100 dark:ring-slate-700/40 dark:hover:bg-slate-900/30"
        aria-label="Navigate to contact form for return inquiries"
      >
        <span>{{ t('returns.support.contactLink') }}</span>
        <svg
          class="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17 8l4 4m0 0l-4 4m4-4H3"
          />
        </svg>
      </NuxtLink>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        {{ t('returns.support.responseTime') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const config = useRuntimeConfig()

const DEFAULT_SUPPORT_EMAIL = 'support@moldovadirect.com'

// Track if we've already logged the fallback warning (avoid spam)
let hasLoggedFallback = false

// Validate supportEmail with warning and fallback
const supportEmail = computed(() => {
  const email = config.public.supportEmail
  if (!email && !hasLoggedFallback) {
    hasLoggedFallback = true
    // Log in both dev and production so operators can detect misconfiguration
    console.warn('[ReturnsSupport] Using fallback email - set NUXT_PUBLIC_SUPPORT_EMAIL env var for production')
  }
  return email || DEFAULT_SUPPORT_EMAIL
})
</script>
