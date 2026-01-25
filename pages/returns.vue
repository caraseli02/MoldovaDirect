<template>
  <div class="bg-white dark:bg-gray-950">
    <div class="container mx-auto px-4 py-12">
      <div class="max-w-5xl mx-auto space-y-10">
        <div class="rounded-2xl border border-gray-200 bg-gradient-to-r from-primary-50 to-primary-100/60 p-6 shadow-sm dark:border-gray-800 dark:from-primary-900/20 dark:to-primary-800/10">
          <p class="mb-2 inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700 shadow-sm ring-1 ring-primary-100 dark:bg-gray-900/60 dark:text-slate-100 dark:ring-primary-700/40">
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
                  class="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:ring-offset-gray-900"
                  aria-label="Start a return request by contacting customer support"
                >
                  {{ t('returns.cta.start') }}
                </NuxtLink>
                <NuxtLink
                  :to="localePath('/account/orders')"
                  class="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-900 transition hover:border-slate-200 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:border-gray-700 dark:text-gray-100 dark:hover:border-slate-700/70 dark:hover:text-slate-100 dark:ring-offset-gray-900"
                  aria-label="View your order history to select items for return"
                >
                  {{ t('returns.cta.orders') }}
                </NuxtLink>
              </div>
            </div>
            <div class="grid w-full grid-cols-1 gap-3 text-sm md:w-auto md:grid-cols-2">
              <ReturnsSummaryCard
                v-for="item in summaryItems"
                :key="item.title"
                :title="item.title"
                :metric="item.metric"
                :description="item.description"
              />
            </div>
          </div>
        </div>

        <div class="grid gap-8 lg:grid-cols-2">
          <ReturnsEligibility />
          <ReturnsResolution />
        </div>

        <ReturnsSteps />

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
                <span class="mt-1 h-2 w-2 rounded-full bg-slate-500"></span>
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
                <span class="mt-1 h-2 w-2 rounded-full bg-slate-500"></span>
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>
          <ReturnsSupport />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const { toAbsoluteUrl, siteUrl } = useSiteUrl()

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
