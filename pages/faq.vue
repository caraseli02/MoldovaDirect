<template>
  <div class="bg-gray-50 dark:bg-gray-900/50 py-12 md:py-16">
    <div class="container space-y-10">
      <div class="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div class="space-y-4 max-w-3xl">
          <div class="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-100">
            <span
              class="h-2 w-2 rounded-full bg-primary-500"
              aria-hidden="true"
            ></span>
            {{ $t('faqPage.badge') }}
          </div>
          <div class="space-y-3">
            <h1 class="text-4xl font-bold leading-tight text-gray-900 dark:text-white">
              {{ $t('faqPage.title') }}
            </h1>
            <p class="text-lg text-gray-700 dark:text-gray-300">
              {{ $t('faqPage.description') }}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ $t('faqPage.updated') }}
            </p>
          </div>
          <div class="flex flex-wrap gap-3">
            <NuxtLink
              :to="localePath('/contact')"
              class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-white shadow-sm transition hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              <span
                class="i-solar-headphones-round-bold-duotone h-5 w-5"
                aria-hidden="true"
              ></span>
              {{ $t('faqPage.ctaPrimary') }}
            </NuxtLink>
            <NuxtLink
              :to="localePath('/track-order')"
              class="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-gray-900 transition hover:border-primary-200 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:border-gray-700 dark:text-white dark:hover:border-primary-400"
            >
              <span
                class="i-solar-map-arrow-square-bold-duotone h-5 w-5"
                aria-hidden="true"
              ></span>
              {{ $t('faqPage.ctaSecondary') }}
            </NuxtLink>
          </div>
          <div class="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300">
            <div class="flex items-center gap-2">
              <span
                class="i-solar-clock-circle-bold-duotone h-5 w-5 text-primary-500"
                aria-hidden="true"
              ></span>
              {{ $t('faqPage.responseTime') }}
            </div>
            <div class="flex items-center gap-2">
              <span
                class="i-solar-user-chat-round-bold-duotone h-5 w-5 text-primary-500"
                aria-hidden="true"
              ></span>
              {{ $t('faqPage.languages') }}
            </div>
          </div>
        </div>
        <div class="w-full max-w-md lg:max-w-sm">
          <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ $t('faqPage.highlights.title') }}
            </h2>
            <ul class="mt-4 space-y-3 text-gray-700 dark:text-gray-300">
              <li
                v-for="highlight in supportHighlights"
                :key="highlight"
                class="flex items-start gap-3"
              >
                <span
                  class="mt-0.5 h-2.5 w-2.5 rounded-full bg-primary-500"
                  aria-hidden="true"
                ></span>
                <span>{{ highlight }}</span>
              </li>
            </ul>
            <div class="mt-6 rounded-lg bg-primary-50 px-4 py-3 text-sm text-primary-900 dark:bg-primary-900/30 dark:text-primary-100">
              <p class="font-medium">
                {{ $t('faqPage.highlights.turnaround.title') }}
              </p>
              <p>{{ $t('faqPage.highlights.turnaround.description') }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="grid gap-8 lg:grid-cols-3">
        <div class="space-y-8 lg:col-span-2">
          <section
            v-for="section in faqSections"
            :key="section.id"
            class="space-y-4"
          >
            <div class="flex items-center gap-3">
              <span
                class="i-solar-chat-square-2-bold-duotone h-6 w-6 text-primary-500"
                aria-hidden="true"
              ></span>
              <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">
                {{ section.title }}
              </h2>
            </div>
            <div class="grid gap-4">
              <article
                v-for="item in section.items"
                :key="item.question"
                class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
              >
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  {{ item.question }}
                </h3>
                <p class="mt-2 text-gray-700 dark:text-gray-300">
                  {{ item.answer }}
                </p>
              </article>
            </div>
          </section>
        </div>

        <aside class="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ $t('faqPage.needMore.title') }}
          </h2>
          <p class="text-gray-700 dark:text-gray-300">
            {{ $t('faqPage.needMore.description') }}
          </p>
          <div class="space-y-3">
            <NuxtLink
              v-for="link in quickLinks"
              :key="link.to"
              :to="link.to"
              class="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-gray-900 transition hover:border-primary-200 hover:bg-primary-50/40 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:border-gray-800 dark:text-white dark:hover:border-primary-400 dark:hover:bg-primary-900/20"
            >
              <div class="flex items-center gap-3">
                <span
                  class="i-solar-arrow-right-up-bold-duotone h-5 w-5 text-primary-500"
                  aria-hidden="true"
                ></span>
                <span>{{ link.label }}</span>
              </div>
              <span
                class="i-solar-alt-arrow-right-linear h-4 w-4 text-gray-400"
                aria-hidden="true"
              ></span>
            </NuxtLink>
          </div>
          <div class="rounded-lg bg-primary-50 px-4 py-3 text-sm text-primary-900 dark:bg-primary-900/30 dark:text-primary-100">
            <p class="font-medium">
              {{ $t('faqPage.needMore.commitment.title') }}
            </p>
            <p>{{ $t('faqPage.needMore.commitment.description') }}</p>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const { toAbsoluteUrl } = useSiteUrl()

const pageDescription = computed(() => t('faqPage.seo.description'))

const faqSections = computed(() => [
  {
    id: 'orders',
    title: t('faqPage.sections.orders.title'),
    items: [
      {
        question: t('faqPage.sections.orders.items.delivery.question'),
        answer: t('faqPage.sections.orders.items.delivery.answer'),
      },
      {
        question: t('faqPage.sections.orders.items.shippingCosts.question'),
        answer: t('faqPage.sections.orders.items.shippingCosts.answer'),
      },
      {
        question: t('faqPage.sections.orders.items.updates.question'),
        answer: t('faqPage.sections.orders.items.updates.answer'),
      },
    ],
  },
  {
    id: 'payments',
    title: t('faqPage.sections.payments.title'),
    items: [
      {
        question: t('faqPage.sections.payments.items.methods.question'),
        answer: t('faqPage.sections.payments.items.methods.answer'),
      },
      {
        question: t('faqPage.sections.payments.items.invoices.question'),
        answer: t('faqPage.sections.payments.items.invoices.answer'),
      },
      {
        question: t('faqPage.sections.payments.items.addresses.question'),
        answer: t('faqPage.sections.payments.items.addresses.answer'),
      },
    ],
  },
  {
    id: 'returns',
    title: t('faqPage.sections.returns.title'),
    items: [
      {
        question: t('faqPage.sections.returns.items.policy.question'),
        answer: t('faqPage.sections.returns.items.policy.answer'),
      },
      {
        question: t('faqPage.sections.returns.items.damaged.question'),
        answer: t('faqPage.sections.returns.items.damaged.answer'),
      },
      {
        question: t('faqPage.sections.returns.items.process.question'),
        answer: t('faqPage.sections.returns.items.process.answer'),
      },
    ],
  },
  {
    id: 'products',
    title: t('faqPage.sections.products.title'),
    items: [
      {
        question: t('faqPage.sections.products.items.authenticity.question'),
        answer: t('faqPage.sections.products.items.authenticity.answer'),
      },
      {
        question: t('faqPage.sections.products.items.storage.question'),
        answer: t('faqPage.sections.products.items.storage.answer'),
      },
      {
        question: t('faqPage.sections.products.items.allergens.question'),
        answer: t('faqPage.sections.products.items.allergens.answer'),
      },
    ],
  },
])

const quickLinks = computed(() => [
  { to: localePath('/shipping'), label: t('faqPage.quickLinks.shipping') },
  { to: localePath('/returns'), label: t('faqPage.quickLinks.returns') },
  { to: localePath('/track-order'), label: t('faqPage.quickLinks.tracking') },
  { to: localePath('/contact'), label: t('faqPage.quickLinks.contact') },
])

const supportHighlights = computed(() => [
  t('faqPage.highlights.items.dispatch'),
  t('faqPage.highlights.items.packaging'),
  t('faqPage.highlights.items.support'),
])

const structuredData = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  'url': toAbsoluteUrl('/faq'),
  'description': pageDescription.value,
  'mainEntity': faqSections.value.flatMap(section => section.items.map(item => ({
    '@type': 'Question',
    'name': item.question,
    'acceptedAnswer': {
      '@type': 'Answer',
      'text': item.answer,
    },
  }))),
}))

useLandingSeo({
  title: t('faqPage.seo.title'),
  description: pageDescription.value,
  image: '/icon.svg',
  imageAlt: t('faqPage.seo.imageAlt'),
  pageType: 'webpage',
  keywords: ['Moldova Direct FAQ', 'Moldova Direct shipping', 'Moldova Direct returns'],
  breadcrumbs: [
    { name: t('common.home'), path: '/' },
    { name: t('faqPage.title'), path: '/faq' },
  ],
  structuredData: structuredData.value,
})
</script>
