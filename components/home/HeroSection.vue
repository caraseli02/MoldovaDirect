<template>
  <section class="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 text-white">
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.2),_rgba(30,64,175,0.05)_60%)]"></div>
    <div class="container relative py-24 md:py-32">
      <div class="grid items-center gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <div>
          <div class="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium ring-1 ring-white/30">
            <Icon name="heroicons:shield-check" class="h-4 w-4" />
            <span>{{ t('home.hero.trustBadge') }}</span>
          </div>
          <h1 class="mt-6 text-4xl font-bold tracking-tight md:text-6xl">{{ t('home.hero.title') }}</h1>
          <p class="mt-6 max-w-2xl text-lg text-primary-100 md:text-xl">{{ t('home.hero.subtitle') }}</p>
          <div class="mt-8 flex flex-wrap gap-4">
            <NuxtLink
              :to="localePath('/products')"
              class="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-primary-700 shadow-lg shadow-primary-900/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:bg-primary-50"
            >
              {{ t('home.hero.primaryCta') }}
              <Icon name="heroicons:arrow-right" class="h-5 w-5" />
            </NuxtLink>
            <NuxtLink
              :to="localePath('/about')"
              class="inline-flex items-center gap-2 rounded-full bg-primary-500/20 px-6 py-3 font-semibold text-white ring-1 ring-white/40 transition hover:bg-primary-500/30"
            >
              {{ t('home.hero.secondaryCta') }}
            </NuxtLink>
          </div>
          <dl class="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div v-for="highlight in highlights" :key="highlight.label" class="space-y-2">
              <dt class="text-sm font-medium text-primary-100">{{ highlight.label }}</dt>
              <dd class="text-3xl font-semibold">{{ highlight.value }}</dd>
            </div>
          </dl>
        </div>
        <div class="relative">
          <div class="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-primary-300/30 blur-3xl"></div>
          <div class="relative grid gap-6 sm:grid-cols-2">
            <div class="col-span-1 row-span-2 rounded-3xl bg-white/90 p-6 text-gray-900 shadow-2xl shadow-primary-900/10 backdrop-blur">
              <div class="flex items-center gap-3">
                <div class="rounded-full bg-primary-100 p-3 text-primary-600">
                  <Icon name="heroicons:sparkles" class="h-6 w-6" />
                </div>
                <p class="text-sm font-medium text-primary-600">{{ t('home.hero.cards.craft.title') }}</p>
              </div>
              <p class="mt-4 text-2xl font-semibold leading-tight">{{ t('home.hero.cards.craft.highlight') }}</p>
              <p class="mt-4 text-sm text-gray-600">{{ t('home.hero.cards.craft.description') }}</p>
              <NuxtImg
                src="/placeholder-product.svg"
                :alt="t('home.hero.cards.craft.alt')"
                class="mt-6 h-32 w-full rounded-2xl bg-gradient-to-tr from-primary-100 to-primary-50 object-contain p-6"
              />
            </div>
            <div class="rounded-3xl bg-white/80 p-6 text-gray-900 shadow-xl shadow-primary-900/10 backdrop-blur">
              <div class="flex items-center gap-3">
                <div class="rounded-full bg-amber-100 p-3 text-amber-600">
                  <Icon name="heroicons:gift-top" class="h-6 w-6" />
                </div>
                <p class="text-sm font-medium text-amber-600">{{ t('home.hero.cards.gift.title') }}</p>
              </div>
              <p class="mt-4 text-lg font-semibold leading-tight">{{ t('home.hero.cards.gift.highlight') }}</p>
              <p class="mt-4 text-sm text-gray-600">{{ t('home.hero.cards.gift.description') }}</p>
            </div>
            <div class="rounded-3xl bg-white/80 p-6 text-gray-900 shadow-xl shadow-primary-900/10 backdrop-blur">
              <div class="flex items-center gap-3">
                <div class="rounded-full bg-emerald-100 p-3 text-emerald-600">
                  <Icon name="heroicons:truck" class="h-6 w-6" />
                </div>
                <p class="text-sm font-medium text-emerald-600">{{ t('home.hero.cards.delivery.title') }}</p>
              </div>
              <p class="mt-4 text-lg font-semibold leading-tight">{{ t('home.hero.cards.delivery.highlight') }}</p>
              <p class="mt-4 text-sm text-gray-600">{{ t('home.hero.cards.delivery.description') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  highlights: Array<{
    value: string
    label: string
  }>
}>()

const { t } = useI18n()
const localePath = useLocalePath()
</script>
