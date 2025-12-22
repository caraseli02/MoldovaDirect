<template>
  <div class="bg-white dark:bg-gray-950">
    <div class="container mx-auto px-4 py-12">
      <div class="max-w-5xl mx-auto space-y-10">
        <div class="rounded-2xl border border-gray-200 bg-gradient-to-r from-primary-50 to-primary-100/60 p-6 shadow-sm dark:border-gray-800 dark:from-primary-900/20 dark:to-primary-800/10">
          <p class="mb-2 inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-700 shadow-sm ring-1 ring-primary-100 dark:bg-gray-900/60 dark:text-primary-100 dark:ring-primary-700/40">
            {{ t('returns.badge') }}
          </p>
          <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div class="space-y-3">
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
                {{ t('returns.title') }}
              </h1>
              <p class="text-lg text-gray-700 dark:text-gray-300">
                {{ t('returns.description') }}
              </p>
              <div class="flex flex-wrap gap-3">
                <NuxtLink
                  :to="localePath('/contact')"
                  class="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:ring-offset-gray-900"
                >
                  {{ t('returns.cta.start') }}
                </NuxtLink>
                <NuxtLink
                  :to="localePath('/account/orders')"
                  class="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-900 transition hover:border-primary-200 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:border-gray-700 dark:text-gray-100 dark:hover:border-primary-700/70 dark:hover:text-primary-100 dark:ring-offset-gray-900"
                >
                  {{ t('returns.cta.orders') }}
                </NuxtLink>
              </div>
            </div>
            <div class="grid w-full grid-cols-1 gap-3 text-sm md:w-auto md:grid-cols-2">
              <div
                v-for="item in summaryItems"
                :key="item.title"
                class="rounded-xl bg-white/80 p-4 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900/60 dark:ring-gray-800"
              >
                <p class="text-xs font-semibold uppercase tracking-wide text-primary-700 dark:text-primary-200">
                  {{ item.title }}
                </p>
                <p class="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {{ item.metric }}
                </p>
                <p class="mt-1 text-gray-600 dark:text-gray-300">
                  {{ item.description }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="grid gap-8 lg:grid-cols-2">
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
                    v-for="item in eligibility.allowed"
                    :key="item"
                    class="flex gap-2"
                  >
                    <span class="mt-1 h-2 w-2 rounded-full bg-primary-500"></span>
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
                    v-for="item in eligibility.denied"
                    :key="item"
                    class="flex gap-2"
                  >
                    <span class="mt-1 h-2 w-2 rounded-full bg-gray-400"></span>
                    <span>{{ item }}</span>
                  </li>
                </ul>
              </div>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ t('returns.eligibility.note') }}
            </p>
          </div>

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
        </div>

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
                  <span class="mt-1 h-2 w-2 rounded-full bg-primary-500"></span>
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

        <div class="grid gap-6 lg:grid-cols-3">
          <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <p class="text-sm font-semibold text-gray-900 dark:text-white">
              {{ t('returns.fees.title') }}
            </p>
            <p class="mt-2 text-sm text-gray-700 dark:text-gray-300">
              {{ t('returns.fees.description') }}
            </p>
            <ul class="mt-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li
                v-for="item in fees"
                :key="item"
                class="flex gap-2"
              >
                <span class="mt-1 h-2 w-2 rounded-full bg-primary-500"></span>
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>
          <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <p class="text-sm font-semibold text-gray-900 dark:text-white">
              {{ t('returns.expectations.title') }}
            </p>
            <p class="mt-2 text-sm text-gray-700 dark:text-gray-300">
              {{ t('returns.expectations.description') }}
            </p>
            <ul class="mt-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li
                v-for="item in expectations"
                :key="item"
                class="flex gap-2"
              >
                <span class="mt-1 h-2 w-2 rounded-full bg-primary-500"></span>
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>
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
                class="flex items-center justify-between rounded-lg bg-gray-50 p-3 text-sm font-semibold text-gray-900 ring-1 ring-gray-100 transition hover:bg-primary-50 hover:text-primary-800 hover:ring-primary-100 dark:bg-gray-950 dark:text-white dark:ring-gray-800 dark:hover:bg-primary-900/20 dark:hover:text-primary-100 dark:hover:ring-primary-800/40"
                :href="`mailto:${supportEmail}?subject=${encodeURIComponent(t('returns.support.emailSubject'))}`"
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
                class="flex items-center justify-between rounded-lg bg-primary-50 p-3 text-sm font-semibold text-primary-800 ring-1 ring-primary-100 transition hover:bg-primary-100 hover:ring-primary-200 dark:bg-primary-900/20 dark:text-primary-100 dark:ring-primary-800/40 dark:hover:bg-primary-900/30"
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const { toAbsoluteUrl, siteUrl } = useSiteUrl()

const supportEmail = 'support@moldovadirect.com'

const summaryItems = computed(() => [
  {
    title: t('returns.summary.window.title'),
    metric: t('returns.summary.window.metric'),
    description: t('returns.summary.window.description'),
  },
  {
    title: t('returns.summary.condition.title'),
    metric: t('returns.summary.condition.metric'),
    description: t('returns.summary.condition.description'),
  },
  {
    title: t('returns.summary.support.title'),
    metric: t('returns.summary.support.metric'),
    description: t('returns.summary.support.description'),
  },
  {
    title: t('returns.summary.refunds.title'),
    metric: t('returns.summary.refunds.metric'),
    description: t('returns.summary.refunds.description'),
  },
])

const eligibility = computed(() => ({
  allowed: [
    t('returns.eligibility.allowed.damaged'),
    t('returns.eligibility.allowed.incorrect'),
    t('returns.eligibility.allowed.quality'),
    t('returns.eligibility.allowed.unopened'),
  ],
  denied: [
    t('returns.eligibility.denied.used'),
    t('returns.eligibility.denied.late'),
    t('returns.eligibility.denied.perishable'),
    t('returns.eligibility.denied.custom'),
  ],
}))

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

const fees = computed(() => [
  t('returns.fees.items.ourError'),
  t('returns.fees.items.customerChoice'),
  t('returns.fees.items.inspection'),
])

const expectations = computed(() => [
  t('returns.expectations.items.scan'),
  t('returns.expectations.items.refundTimeline'),
  t('returns.expectations.items.updates'),
])

const description
  = 'Understand Moldova Direct return windows, refund eligibility, and how to request support for Moldovan food and wine orders.'

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  'name': 'Returns & Refunds',
  'url': toAbsoluteUrl('/returns'),
  description,
  'isPartOf': {
    '@type': 'WebSite',
    'name': 'Moldova Direct',
    'url': siteUrl,
  },
  'mainEntity': {
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': 'How long do I have to request a return?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Returns for unopened pantry items are available within 30 days of delivery. Damaged or incorrect deliveries should be reported within 7 days so we can arrange replacements.',
        },
      },
      {
        '@type': 'Question',
        'name': 'How do refunds work?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Approved refunds are issued to your original payment method or as store credit within 2-5 business days after the return is received and inspected.',
        },
      },
    ],
  },
}

useLandingSeo({
  title: 'Returns & Refunds - Moldova Direct',
  description,
  image: '/icon.svg',
  imageAlt: 'Customer rep assisting with Moldova Direct return request',
  pageType: 'webpage',
  keywords: ['Moldova Direct returns', 'Moldova Direct refund policy', 'Moldovan products returns'],
  breadcrumbs: [
    { name: 'Home', path: '/' },
    { name: 'Returns', path: '/returns' },
  ],
  structuredData,
})
</script>
