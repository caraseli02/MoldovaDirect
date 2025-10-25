<template>
  <section class="bg-gray-50 py-16 dark:bg-gray-950 md:py-24">
    <div class="container">
      <div class="mx-auto max-w-3xl text-center">
        <span class="inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-2 text-sm font-semibold text-primary-700 dark:bg-primary-500/20 dark:text-primary-200">
          <commonIcon name="lucide:sparkles" class="h-4 w-4" />
          {{ t('home.collections.badge') }}
        </span>
        <h2 class="mt-4 text-3xl font-bold text-gray-900 dark:text-gray-50 md:text-4xl">
          {{ t('home.collections.title') }}
        </h2>
        <p class="mt-4 text-lg text-gray-600 dark:text-gray-400">
          {{ t('home.collections.subtitle') }}
        </p>
      </div>

      <div class="mt-12 grid gap-6 lg:auto-rows-[minmax(260px,1fr)] lg:grid-cols-12">
        <NuxtLink
          v-for="card in cards"
          :key="card.key"
          :to="card.href"
          class="group relative block overflow-hidden rounded-3xl border border-gray-200 bg-gray-900/95 shadow-xl transition hover:-translate-y-1 hover:shadow-2xl dark:border-gray-800 dark:bg-gray-900"
          :class="[card.colSpan, card.rowSpan, card.colStart]"
        >
          <NuxtImg
            :src="card.image"
            :alt="card.imageAlt"
            densities="1x 2x"
            class="absolute inset-0 h-full w-full object-cover brightness-105 transition duration-700 ease-out group-hover:scale-105"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/35 to-transparent"></div>
          <div class="absolute inset-0 bg-gradient-to-br from-slate-900/0 via-slate-900/30 to-slate-950/70 mix-blend-soft-light"></div>
          <div class="relative flex h-full flex-col justify-between p-8 text-white">
            <div class="space-y-4">
              <span class="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-900 shadow-lg shadow-slate-900/10">
                {{ card.tag }}
              </span>
              <div class="space-y-3">
                <h3 class="text-2xl font-semibold leading-tight">{{ card.title }}</h3>
                <p class="text-sm text-white/85">{{ card.description }}</p>
              </div>
            </div>
            <span class="inline-flex items-center gap-2 text-sm font-semibold text-white transition group-hover:translate-x-1">
              {{ card.cta }}
              <commonIcon name="lucide:arrow-right" class="h-4 w-4" />
            </span>
          </div>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

type Card = {
  key: string
  title: string
  description: string
  cta: string
  href: string
  image: string
  imageAlt: string
  tag: string
  colSpan: string
  colStart: string
  rowSpan: string
}

const cards = computed<Card[]>(() => [
  {
    key: 'reserve',
    title: t('home.collections.cards.reserve.title'),
    description: t('home.collections.cards.reserve.description'),
    cta: t('home.collections.cards.reserve.cta'),
    href: localePath('/products?category=wine'),
    image: '/images/home/collections/reserve-cellar.jpg',
    imageAlt: t('home.collections.cards.reserve.imageAlt'),
    tag: t('home.collections.cards.reserve.tag'),
    colSpan: 'lg:col-span-7',
    colStart: '',
    rowSpan: 'lg:row-span-2'
  },
  {
    key: 'artisan',
    title: t('home.collections.cards.artisan.title'),
    description: t('home.collections.cards.artisan.description'),
    cta: t('home.collections.cards.artisan.cta'),
    href: localePath('/products?category=gourmet'),
    image: '/images/home/collections/artisan-pantry.jpg',
    imageAlt: t('home.collections.cards.artisan.imageAlt'),
    tag: t('home.collections.cards.artisan.tag'),
    colSpan: 'lg:col-span-5',
    colStart: 'lg:col-start-8',
    rowSpan: ''
  },
  {
    key: 'experience',
    title: t('home.collections.cards.experience.title'),
    description: t('home.collections.cards.experience.description'),
    cta: t('home.collections.cards.experience.cta'),
    href: localePath('/products?category=subscription'),
    image: '/images/home/collections/weekend-tasting.jpg',
    imageAlt: t('home.collections.cards.experience.imageAlt'),
    tag: t('home.collections.cards.experience.tag'),
    colSpan: 'lg:col-span-5',
    colStart: 'lg:col-start-8',
    rowSpan: ''
  }
])
</script>
