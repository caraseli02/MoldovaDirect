<template>
  <section class="relative overflow-hidden bg-slate-950 text-white">
    <!-- Amazon-style carousel at the top -->
    <HomeHeroCarousel />

    <!-- Hero content below carousel -->
    <div class="relative bg-gradient-to-b from-slate-950/95 to-slate-950">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_rgba(15,23,42,0.05)_65%)]"></div>
      <div class="absolute inset-y-0 right-[-10%] hidden w-[45%] rounded-full bg-primary-500/30 blur-3xl lg:block"></div>
      <div class="container relative py-16 md:py-20">
        <div class="mx-auto max-w-5xl text-center">
          <!-- Trust Badge with fade-in animation -->
          <div
            v-motion
            :initial="{ opacity: 0, y: -20 }"
            :enter="{
              opacity: 1,
              y: 0,
              transition: { duration: 500 },
            }"
            class="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium ring-1 ring-white/30 backdrop-blur"
          >
            <commonIcon
              name="lucide:shield-check"
              class="h-4 w-4"
            />
            <span>{{ t('home.hero.trustBadge') }}</span>
          </div>

          <!-- Title with slide-up animation -->
          <h1
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :enter="{
              opacity: 1,
              y: 0,
              transition: { duration: 600, delay: 100 },
            }"
            class="mt-6 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl"
          >
            {{ t('home.hero.title') }}
          </h1>

          <!-- Subtitle with fade-in -->
          <p
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{
              opacity: 1,
              y: 0,
              transition: { duration: 600, delay: 200 },
            }"
            class="mx-auto mt-6 max-w-3xl text-lg text-white/80 md:text-xl"
          >
            {{ t('home.hero.subtitle') }}
          </p>

          <!-- CTAs with stagger animation -->
          <div
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{
              opacity: 1,
              y: 0,
              transition: { duration: 500, delay: 300 },
            }"
            class="mt-8 flex flex-wrap justify-center gap-4"
          >
            <NuxtLink
              :to="localePath('/products')"
              class="cta-button inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-primary-700 shadow-lg shadow-primary-900/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              {{ t('home.hero.primaryCta') }}
              <commonIcon
                name="lucide:arrow-right"
                class="h-5 w-5"
              />
            </NuxtLink>
            <NuxtLink
              :to="localePath('/about')"
              class="cta-button inline-flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 font-semibold text-white ring-1 ring-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              {{ t('home.hero.secondaryCta') }}
            </NuxtLink>
          </div>

          <!-- Highlights with stagger animation -->
          <dl class="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div
              v-for="(highlight, index) in highlights"
              :key="highlight.label"
              v-motion
              :initial="{ opacity: 0, scale: 0.9 }"
              :enter="{
                opacity: 1,
                scale: 1,
                transition: { duration: 400, delay: 400 + index * 100 },
              }"
              class="space-y-2"
            >
              <dt class="text-sm font-medium text-white/60">
                {{ highlight.label }}
              </dt>
              <dd class="text-3xl font-semibold">
                {{ highlight.value }}
              </dd>
            </div>
          </dl>
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
