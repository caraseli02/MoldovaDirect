<template>
  <main class="bg-gray-50 dark:bg-gray-900">
    <div class="container px-4 py-12 sm:py-16 lg:py-20">
      <!-- Hero Section -->
      <section
        aria-labelledby="hero-title"
        class="grid gap-10 lg:grid-cols-[1.6fr,1fr] items-start"
      >
        <div>
          <p class="inline-flex items-center rounded-full bg-primary-100 px-4 py-1.5 text-sm font-semibold text-primary-800 dark:bg-primary-900/40 dark:text-primary-100">
            {{ $t('shippingPage.hero.badge') }}
          </p>
          <h1
            id="hero-title"
            class="mt-4 text-4xl font-bold leading-tight text-gray-900 dark:text-white sm:text-5xl"
          >
            {{ $t('shippingPage.hero.title') }}
          </h1>
          <p class="mt-4 text-lg text-gray-700 dark:text-gray-300">
            {{ $t('shippingPage.hero.description') }}
          </p>

          <div class="mt-6 flex flex-wrap gap-4">
            <NuxtLink
              :to="localePath('/track-order')"
              :aria-label="$t('shippingPage.ctas.track')"
              class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-3 text-base font-semibold text-white transition hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
            >
              <Icon
                name="package"
                class="h-5 w-5"
                aria-hidden="true"
              />
              <span>{{ $t('shippingPage.ctas.track') }}</span>
            </NuxtLink>
            <NuxtLink
              :to="localePath('/contact')"
              :aria-label="$t('shippingPage.ctas.contact')"
              class="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-5 py-3 text-base font-semibold text-gray-800 transition hover:border-gray-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:border-gray-700 dark:text-white dark:hover:border-gray-600 dark:hover:bg-gray-800 dark:focus-visible:ring-offset-gray-900"
            >
              <Icon
                name="message-circle"
                class="h-5 w-5"
                aria-hidden="true"
              />
              <span>{{ $t('shippingPage.ctas.contact') }}</span>
            </NuxtLink>
          </div>

          <div class="mt-6 flex flex-col gap-4 rounded-xl border border-primary-100 bg-white p-4 text-sm text-gray-700 shadow-sm dark:border-primary-900/40 dark:bg-gray-800 dark:text-gray-200 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-100">
                <Icon
                  name="truck"
                  class="h-6 w-6"
                  aria-hidden="true"
                />
              </div>
              <p class="font-semibold text-gray-900 dark:text-white">
                {{ $t('shippingPage.hero.notice') }}
              </p>
            </div>
            <p class="text-gray-600 dark:text-gray-300">
              {{ $t('shippingPage.hero.secondaryNotice') }}
            </p>
          </div>
        </div>

        <!-- Highlights Sidebar -->
        <aside
          aria-labelledby="highlights-title"
          class="space-y-4"
        >
          <div class="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
            <h2
              id="highlights-title"
              class="text-xl font-semibold text-gray-900 dark:text-white"
            >
              {{ $t('shippingPage.highlights.title') }}
            </h2>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-300">
              {{ $t('shippingPage.highlights.subtitle') }}
            </p>
            <ul class="mt-4 space-y-4">
              <li
                v-for="item in highlightItems"
                :key="item.title"
                class="flex gap-4 rounded-xl border border-gray-100 p-4 dark:border-gray-700"
              >
                <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-900/40">
                  <Icon
                    :name="item.icon"
                    class="h-5 w-5 text-primary-700 dark:text-primary-200"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <p class="font-semibold text-gray-900 dark:text-white">
                    {{ item.title }}
                  </p>
                  <p class="text-sm text-gray-600 dark:text-gray-300">
                    {{ item.description }}
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </aside>
      </section>

      <!-- Shipping Methods and Coverage -->
      <div class="mt-12 grid gap-8 lg:grid-cols-[1.5fr,1fr]">
        <section
          aria-labelledby="methods-title"
          class="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <h2
                id="methods-title"
                class="text-2xl font-semibold text-gray-900 dark:text-white"
              >
                {{ $t('shippingPage.methods.title') }}
              </h2>
              <p class="mt-2 text-gray-600 dark:text-gray-300">
                {{ $t('shippingPage.methods.subtitle') }}
              </p>
            </div>
            <span class="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-800 dark:bg-primary-900/40 dark:text-primary-100">
              {{ $t('shippingPage.methods.tag') }}
            </span>
          </div>

          <div class="mt-6 grid gap-4 md:grid-cols-3">
            <article
              v-for="method in methods"
              :key="method.title"
              class="flex flex-col gap-3 rounded-xl border border-gray-100 p-4 dark:border-gray-700"
            >
              <div class="flex items-center gap-2 text-sm font-semibold text-primary-700 dark:text-primary-200">
                <Icon
                  :name="method.icon"
                  class="h-4 w-4"
                  aria-hidden="true"
                />
                {{ method.speed }}
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ method.title }}
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-300">
                {{ method.description }}
              </p>
              <div class="mt-auto flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-200">
                <Icon
                  name="arrow-up-right"
                  class="h-3 w-3"
                  aria-hidden="true"
                />
                {{ method.note }}
              </div>
            </article>
          </div>
        </section>

        <div class="space-y-6">
          <!-- Coverage Section -->
          <section
            aria-labelledby="coverage-title"
            class="rounded-2xl bg-primary-50 p-6 shadow-lg dark:bg-primary-900/30"
          >
            <h3
              id="coverage-title"
              class="text-xl font-semibold text-gray-900 dark:text-white"
            >
              {{ $t('shippingPage.coverage.title') }}
            </h3>
            <p class="mt-2 text-sm text-gray-700 dark:text-gray-200">
              {{ $t('shippingPage.coverage.subtitle') }}
            </p>
            <ul class="mt-4 space-y-3">
              <li
                v-for="region in coverage"
                :key="region.title"
                class="rounded-xl border border-primary-100 bg-white px-4 py-3 text-sm shadow-sm dark:border-primary-800 dark:bg-gray-800 dark:text-gray-200"
              >
                <p class="flex items-center justify-between font-semibold text-gray-900 dark:text-white">
                  {{ region.title }}
                  <span class="text-xs text-primary-700 dark:text-primary-200">{{ region.badge }}</span>
                </p>
                <p class="mt-1 text-gray-600 dark:text-gray-300">
                  {{ region.description }}
                </p>
              </li>
            </ul>
          </section>

          <!-- Extras Section -->
          <section
            aria-labelledby="extras-title"
            class="rounded-2xl border border-dashed border-gray-200 p-6 dark:border-gray-700"
          >
            <h3
              id="extras-title"
              class="text-lg font-semibold text-gray-900 dark:text-white"
            >
              {{ $t('shippingPage.extras.title') }}
            </h3>
            <ul class="mt-3 space-y-3">
              <li
                v-for="item in extras"
                :key="item.title"
                class="flex gap-3 text-sm text-gray-700 dark:text-gray-300"
              >
                <div class="mt-0.5 flex-shrink-0">
                  <Icon
                    :name="item.icon"
                    class="h-5 w-5 text-primary-700 dark:text-primary-200"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <p class="font-semibold text-gray-900 dark:text-white">
                    {{ item.title }}
                  </p>
                  <p>
                    {{ item.description }}
                  </p>
                </div>
              </li>
            </ul>
          </section>
        </div>
      </div>

      <!-- Timeline Section -->
      <section
        aria-labelledby="timeline-title"
        class="mt-12 rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800"
      >
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2
              id="timeline-title"
              class="text-2xl font-semibold text-gray-900 dark:text-white"
            >
              {{ $t('shippingPage.timeline.title') }}
            </h2>
            <p class="text-gray-600 dark:text-gray-300">
              {{ $t('shippingPage.timeline.subtitle') }}
            </p>
          </div>
          <div class="rounded-full bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-800 dark:bg-primary-900/40 dark:text-primary-100">
            {{ $t('shippingPage.timeline.reminder') }}
          </div>
        </div>

        <ol class="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <li
            v-for="(step, index) in timeline"
            :key="step.title"
            class="relative rounded-xl border border-gray-100 p-4 dark:border-gray-700"
          >
            <div
              class="flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-lg font-bold text-white"
              :aria-label="`Step ${index + 1}`"
            >
              {{ index + 1 }}
            </div>
            <h3 class="mt-3 text-lg font-semibold text-gray-900 dark:text-white">
              {{ step.title }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-300">
              {{ step.description }}
            </p>
          </li>
        </ol>
      </section>

      <!-- Contact Card Section -->
      <section
        aria-labelledby="contact-title"
        class="mt-12 rounded-2xl border border-gray-200 bg-gradient-to-r from-primary-50 via-white to-primary-50 p-6 shadow-lg dark:border-gray-700 dark:from-primary-900/30 dark:via-gray-800 dark:to-primary-900/30"
      >
        <div class="grid gap-6 md:grid-cols-[1.5fr,1fr] md:items-center">
          <div>
            <h3
              id="contact-title"
              class="text-2xl font-semibold text-gray-900 dark:text-white"
            >
              {{ $t('shippingPage.contactCard.title') }}
            </h3>
            <p class="mt-2 text-gray-700 dark:text-gray-200">
              {{ $t('shippingPage.contactCard.description') }}
            </p>
            <div class="mt-4 flex flex-wrap gap-3">
              <NuxtLink
                :to="localePath('/contact')"
                :aria-label="$t('shippingPage.contactCard.cta')"
                class="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
              >
                {{ $t('shippingPage.contactCard.cta') }}
              </NuxtLink>
              <NuxtLink
                :to="localePath('/faq')"
                :aria-label="$t('shippingPage.contactCard.secondary')"
                class="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 transition hover:border-gray-300 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:border-gray-600 dark:hover:bg-gray-700 dark:focus-visible:ring-offset-gray-900"
              >
                {{ $t('shippingPage.contactCard.secondary') }}
              </NuxtLink>
            </div>
          </div>
          <aside class="rounded-xl border border-dashed border-primary-200 bg-white/80 p-4 text-sm text-gray-700 shadow-sm dark:border-primary-800 dark:bg-gray-900/60 dark:text-gray-200">
            <p class="font-semibold text-gray-900 dark:text-white">
              {{ $t('shippingPage.contactCard.noteTitle') }}
            </p>
            <p class="mt-1">
              {{ $t('shippingPage.contactCard.noteDescription') }}
            </p>
          </aside>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
const localePath = useLocalePath()
const { t } = useI18n()
const { toAbsoluteUrl, siteUrl } = useSiteUrl()

const highlightItems = computed(() => [
  {
    icon: 'clock',
    title: t('shippingPage.highlights.items.fast.title'),
    description: t('shippingPage.highlights.items.fast.description'),
  },
  {
    icon: 'globe-2',
    title: t('shippingPage.highlights.items.coverage.title'),
    description: t('shippingPage.highlights.items.coverage.description'),
  },
  {
    icon: 'snowflake',
    title: t('shippingPage.highlights.items.packaging.title'),
    description: t('shippingPage.highlights.items.packaging.description'),
  },
  {
    icon: 'bell',
    title: t('shippingPage.highlights.items.updates.title'),
    description: t('shippingPage.highlights.items.updates.description'),
  },
])

const methods = computed(() => [
  {
    icon: 'zap',
    speed: t('shippingPage.methods.cards.express.speed'),
    title: t('shippingPage.methods.cards.express.title'),
    description: t('shippingPage.methods.cards.express.description'),
    note: t('shippingPage.methods.cards.express.note'),
  },
  {
    icon: 'package',
    speed: t('shippingPage.methods.cards.standard.speed'),
    title: t('shippingPage.methods.cards.standard.title'),
    description: t('shippingPage.methods.cards.standard.description'),
    note: t('shippingPage.methods.cards.standard.note'),
  },
  {
    icon: 'briefcase',
    speed: t('shippingPage.methods.cards.refrigerated.speed'),
    title: t('shippingPage.methods.cards.refrigerated.title'),
    description: t('shippingPage.methods.cards.refrigerated.description'),
    note: t('shippingPage.methods.cards.refrigerated.note'),
  },
])

const coverage = computed(() => [
  {
    title: t('shippingPage.coverage.regions.mainland.title'),
    description: t('shippingPage.coverage.regions.mainland.description'),
    badge: t('shippingPage.coverage.regions.mainland.badge'),
  },
  {
    title: t('shippingPage.coverage.regions.balearic.title'),
    description: t('shippingPage.coverage.regions.balearic.description'),
    badge: t('shippingPage.coverage.regions.balearic.badge'),
  },
  {
    title: t('shippingPage.coverage.regions.canary.title'),
    description: t('shippingPage.coverage.regions.canary.description'),
    badge: t('shippingPage.coverage.regions.canary.badge'),
  },
  {
    title: t('shippingPage.coverage.regions.eu.title'),
    description: t('shippingPage.coverage.regions.eu.description'),
    badge: t('shippingPage.coverage.regions.eu.badge'),
  },
])

const extras = computed(() => [
  {
    icon: 'clipboard-list',
    title: t('shippingPage.extras.items.instructions.title'),
    description: t('shippingPage.extras.items.instructions.description'),
  },
  {
    icon: 'leaf',
    title: t('shippingPage.extras.items.sustainability.title'),
    description: t('shippingPage.extras.items.sustainability.description'),
  },
  {
    icon: 'life-buoy',
    title: t('shippingPage.extras.items.support.title'),
    description: t('shippingPage.extras.items.support.description'),
  },
])

const timeline = computed(() => [
  {
    title: t('shippingPage.timeline.steps.method.title'),
    description: t('shippingPage.timeline.steps.method.description'),
  },
  {
    title: t('shippingPage.timeline.steps.pack.title'),
    description: t('shippingPage.timeline.steps.pack.description'),
  },
  {
    title: t('shippingPage.timeline.steps.handoff.title'),
    description: t('shippingPage.timeline.steps.handoff.description'),
  },
  {
    title: t('shippingPage.timeline.steps.delivery.title'),
    description: t('shippingPage.timeline.steps.delivery.description'),
  },
])

const seoTitle = computed(() => t('shippingPage.seo.title'))
const seoDescription = computed(() => t('shippingPage.seo.description'))

const structuredData = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  'name': seoTitle.value,
  'url': toAbsoluteUrl('/shipping'),
  'description': seoDescription.value,
  'isPartOf': {
    '@type': 'WebSite',
    'name': 'Moldova Direct',
    'url': siteUrl,
  },
}))

useLandingSeo({
  title: seoTitle.value,
  description: seoDescription.value,
  image: '/icon.svg',
  imageAlt: t('shippingPage.hero.title'),
  pageType: 'webpage',
  keywords: [t('shippingPage.seo.title'), 'Moldova Direct', t('shippingPage.hero.badge')],
  breadcrumbs: [
    { name: t('common.home'), path: '/' },
    { name: t('shippingPage.hero.badge'), path: '/shipping' },
  ],
  structuredData: structuredData.value,
})
</script>
