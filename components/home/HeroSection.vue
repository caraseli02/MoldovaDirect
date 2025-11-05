<template>
  <section class="relative overflow-hidden bg-slate-950 text-white">
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_rgba(15,23,42,0.05)_65%)]"></div>
    <div class="absolute inset-y-0 right-[-10%] hidden w-[45%] rounded-full bg-primary-500/30 blur-3xl lg:block"></div>
    <div class="container relative py-20 md:py-28">
      <div class="grid items-center gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <div>
          <div class="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium ring-1 ring-white/30 backdrop-blur">
            <commonIcon name="lucide:shield-check" class="h-4 w-4" />
            <span>{{ t('home.hero.trustBadge') }}</span>
          </div>
          <h1 class="mt-6 text-4xl font-bold tracking-tight md:text-6xl">{{ t('home.hero.title') }}</h1>
          <p class="mt-6 max-w-2xl text-lg text-white/80 md:text-xl">{{ t('home.hero.subtitle') }}</p>
          <div class="mt-8 flex flex-wrap gap-4">
            <NuxtLink
              :to="localePath('/products')"
              class="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-primary-700 shadow-lg shadow-primary-900/20 transition hover:-translate-y-0.5 hover:bg-primary-50 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              {{ t('home.hero.primaryCta') }}
              <commonIcon name="lucide:arrow-right" class="h-5 w-5" />
            </NuxtLink>
            <NuxtLink
              :to="localePath('/about')"
              class="inline-flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 font-semibold text-white ring-1 ring-white/30 transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              {{ t('home.hero.secondaryCta') }}
            </NuxtLink>
          </div>
          <dl class="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div v-for="highlight in highlights" :key="highlight.label" class="space-y-2">
              <dt class="text-sm font-medium text-white/60">{{ highlight.label }}</dt>
              <dd class="text-3xl font-semibold">{{ highlight.value }}</dd>
            </div>
          </dl>
        </div>
        <div class="relative">
          <div class="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-primary-400/20 blur-3xl"></div>
          <!-- Amazon-style carousel gallery -->
          <HomeHeroCarousel />
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
