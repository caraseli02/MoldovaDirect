<template>
  <div class="text-gray-900 dark:text-gray-100">
    <!-- Hero Section -->
    <section class="relative overflow-hidden bg-gradient-to-b from-primary/5 to-white py-20 md:py-32">
      <div class="container">
        <div
          v-motion
          :initial="{ opacity: 0, y: 30 }"
          :visible="{
            opacity: 1,
            y: 0,
            transition: { duration: 800 },
          }"
          class="mx-auto max-w-4xl text-center"
        >
          <div class="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
            <commonIcon name="lucide:wine" class="h-4 w-4" />
            {{ t('wineStory.hero.badge') }}
          </div>

          <h1 class="text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl md:text-7xl">
            {{ t('wineStory.hero.title') }}
          </h1>

          <p class="mx-auto mt-6 max-w-2xl text-xl leading-relaxed text-slate-600">
            {{ t('wineStory.hero.subtitle') }}
          </p>
        </div>
      </div>
    </section>

    <!-- Producer Stories -->
    <HomeProducerStoriesSection />

    <!-- Wine Regions Map -->
    <HomeWineRegionsMap />

    <!-- Wine & Food Pairings -->
    <HomePairingGuidesSection />

    <!-- Production Process Timeline -->
    <HomeProductionProcessSection />

    <!-- Gift Philosophy -->
    <HomeGiftPhilosophySection />

    <!-- CTA Back to Shop -->
    <section class="bg-slate-50 py-16 md:py-24">
      <div class="container">
        <div class="mx-auto max-w-3xl text-center">
          <h2 class="text-3xl font-bold text-slate-900 sm:text-4xl">
            {{ t('wineStory.cta.title') }}
          </h2>
          <p class="mt-4 text-lg text-slate-600">
            {{ t('wineStory.cta.subtitle') }}
          </p>
          <div class="mt-8 flex flex-wrap justify-center gap-4">
            <NuxtLink
              :to="localePath('/products')"
              class="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 font-semibold text-white shadow-lg transition-all hover:bg-primary/90 hover:scale-105"
            >
              {{ t('wineStory.cta.shopButton') }}
              <commonIcon name="lucide:arrow-right" class="h-5 w-5" />
            </NuxtLink>
            <NuxtLink
              :to="localePath('/about')"
              class="inline-flex items-center gap-2 rounded-full border-2 border-slate-300 bg-white px-8 py-4 font-semibold text-slate-900 transition-all hover:border-primary hover:text-primary"
            >
              {{ t('wineStory.cta.aboutButton') }}
              <commonIcon name="lucide:arrow-right" class="h-5 w-5" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

// SEO
useHead({
  title: t('wineStory.seo.title'),
  meta: [
    {
      name: 'description',
      content: t('wineStory.seo.description')
    }
  ]
})
</script>
