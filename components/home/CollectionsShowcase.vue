<template>
  <section class="bg-gray-50 py-20 dark:bg-gray-950 md:py-28">
    <div class="container">
      <div class="mx-auto max-w-3xl text-center">
        <span class="inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-2 text-sm font-semibold text-primary-700 dark:bg-primary-500/20 dark:text-primary-200">
          <commonIcon
            name="lucide:sparkles"
            class="h-4 w-4"
          />
          {{ t('home.collections.badge') }}
        </span>
        <h2 class="mt-4 text-4xl font-bold text-gray-900 dark:text-gray-50 md:text-5xl lg:text-6xl tracking-tight">
          {{ t('home.collections.title') }}
        </h2>
        <p class="mt-4 text-sm md:text-base text-gray-600 dark:text-gray-400">
          {{ t('home.collections.subtitle') }}
        </p>
      </div>

      <!-- Collections - Carousel on mobile, Bento grid on desktop -->
      <!-- Mobile: Horizontal carousel with native scroll -->
      <div class="mt-12 lg:hidden">
        <div
          class="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-6 -mx-4 px-4 scrollbar-hide"
        >
          <div
            v-for="card in cards"
            :key="card.key"
            class="flex-shrink-0 w-[85%] snap-center sm:w-[70%]"
          >
            <NuxtLink
              :to="card.href"
              class="group relative block overflow-hidden rounded-3xl border border-gray-200 bg-gray-900/95 shadow-xl transition hover:-translate-y-1 hover:shadow-2xl dark:border-gray-800 dark:bg-gray-900"
            >
              <NuxtImg
                :src="card.image"
                :alt="card.imageAlt"
                densities="1x 2x"
                class="absolute inset-0 h-full w-full object-cover brightness-105 transition duration-700 ease-out group-hover:scale-105"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/60 to-slate-900/20"></div>
              <div class="absolute inset-0 bg-gradient-to-br from-slate-900/0 via-slate-900/30 to-slate-950/70 mix-blend-soft-light"></div>
              <div class="relative flex h-full min-h-[20rem] flex-col justify-between p-8 text-white">
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
                  <commonIcon
                    name="lucide:arrow-right"
                    class="h-4 w-4"
                  />
                </span>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Desktop: Bento grid layout -->
      <div class="mt-12 hidden gap-6 lg:grid lg:auto-rows-[minmax(260px,1fr)] lg:grid-cols-12">
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
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/60 to-slate-900/20"></div>
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
              <commonIcon
                name="lucide:arrow-right"
                class="h-4 w-4"
              />
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

// TODO: Replace with actual product photography when available
// These are temporary placeholder images from Unsplash
const cards = computed<Card[]>(() => [
  {
    key: 'reserve',
    title: t('home.collections.cards.reserve.title'),
    description: t('home.collections.cards.reserve.description'),
    cta: t('home.collections.cards.reserve.cta'),
    href: localePath('/products?category=wine'),
    image: 'https://images.unsplash.com/photo-1566754436750-9393f43f02b3?q=80&w=1200',
    imageAlt: t('home.collections.cards.reserve.imageAlt'),
    tag: t('home.collections.cards.reserve.tag'),
    colSpan: 'lg:col-span-7',
    colStart: '',
    rowSpan: 'lg:row-span-2',
  },
  {
    key: 'artisan',
    title: t('home.collections.cards.artisan.title'),
    description: t('home.collections.cards.artisan.description'),
    cta: t('home.collections.cards.artisan.cta'),
    href: localePath('/products?category=gourmet'),
    image: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?q=80&w=1200',
    imageAlt: t('home.collections.cards.artisan.imageAlt'),
    tag: t('home.collections.cards.artisan.tag'),
    colSpan: 'lg:col-span-5',
    colStart: 'lg:col-start-8',
    rowSpan: '',
  },
  {
    key: 'experience',
    title: t('home.collections.cards.experience.title'),
    description: t('home.collections.cards.experience.description'),
    cta: t('home.collections.cards.experience.cta'),
    href: localePath('/products?category=subscription'),
    image: 'https://images.unsplash.com/photo-1554939437-ecc492c67b78?q=80&w=1200',
    imageAlt: t('home.collections.cards.experience.imageAlt'),
    tag: t('home.collections.cards.experience.tag'),
    colSpan: 'lg:col-span-5',
    colStart: 'lg:col-start-8',
    rowSpan: '',
  },
])
</script>

<style scoped>
/* Hide scrollbar for native scroll carousel */
.scrollbar-hide {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;  /* Chrome, Safari, Opera */
}
</style>
