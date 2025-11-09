<template>
  <div class="text-gray-900 dark:text-gray-100">
    <!-- Hero Section -->
    <section class="relative overflow-hidden bg-gradient-to-br from-primary/10 via-gold-50/30 to-terracotta/5 py-24 md:py-40">
      <!-- Decorative Background Elements -->
      <div class="absolute inset-0 overflow-hidden opacity-30">
        <!-- Wine Grapes Pattern -->
        <div class="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl" />
        <div class="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-gradient-to-tr from-gold-500/20 to-transparent blur-3xl" />
        <!-- Subtle Grid Pattern -->
        <div class="absolute inset-0" style="background-image: radial-gradient(circle at 2px 2px, rgba(139, 69, 69, 0.05) 1px, transparent 0); background-size: 40px 40px;" />
      </div>

      <div class="container relative z-10">
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
          <div class="mb-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold-500/20 to-gold-600/20 px-6 py-3 text-sm font-bold text-gold-700 shadow-lg backdrop-blur-sm ring-1 ring-gold-500/30">
            <commonIcon name="lucide:wine" class="h-5 w-5" />
            {{ t('wineStory.hero.badge') }}
          </div>

          <h1 class="bg-gradient-to-br from-primary via-slate-900 to-primary/80 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-6xl md:text-7xl lg:text-8xl">
            {{ t('wineStory.hero.title') }}
          </h1>

          <p class="mx-auto mt-8 max-w-3xl text-xl leading-relaxed text-slate-700 sm:text-2xl">
            {{ t('wineStory.hero.subtitle') }}
          </p>

          <!-- Decorative Wine Glass Icons -->
          <div class="mt-12 flex items-center justify-center gap-4 text-gold-600/40">
            <commonIcon name="lucide:wine" class="h-6 w-6" />
            <div class="h-px w-16 bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />
            <commonIcon name="lucide:grape" class="h-6 w-6" />
            <div class="h-px w-16 bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />
            <commonIcon name="lucide:wine" class="h-6 w-6" />
          </div>
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
    <section class="relative overflow-hidden bg-gradient-to-br from-primary/5 via-gold-50/20 to-slate-50 py-20 md:py-32">
      <!-- Decorative Elements -->
      <div class="absolute inset-0 overflow-hidden opacity-20">
        <div class="absolute -right-24 top-0 h-80 w-80 rounded-full bg-gradient-to-bl from-gold-500/30 to-transparent blur-3xl" />
        <div class="absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-gradient-to-tr from-primary/30 to-transparent blur-3xl" />
      </div>

      <div class="container relative z-10">
        <div class="mx-auto max-w-4xl text-center">
          <div class="mb-6 inline-flex items-center gap-2 rounded-full bg-gold-500/10 px-5 py-2 text-sm font-bold text-gold-700 ring-1 ring-gold-500/20">
            <commonIcon name="lucide:sparkles" class="h-4 w-4" />
            <span>Descubre Más</span>
          </div>

          <h2 class="bg-gradient-to-br from-primary via-slate-900 to-primary/80 bg-clip-text text-4xl font-extrabold text-transparent sm:text-5xl md:text-6xl">
            {{ t('wineStory.cta.title') }}
          </h2>
          <p class="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-700 sm:text-xl">
            {{ t('wineStory.cta.subtitle') }}
          </p>
          <div class="mt-10 flex flex-wrap justify-center gap-4">
            <NuxtLink
              :to="localePath('/products')"
              class="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary/90 px-10 py-5 font-bold text-white shadow-xl transition-all hover:scale-105 hover:shadow-2xl hover:shadow-primary/20"
            >
              {{ t('wineStory.cta.shopButton') }}
              <commonIcon name="lucide:arrow-right" class="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </NuxtLink>
            <NuxtLink
              :to="localePath('/about')"
              class="group inline-flex items-center gap-2 rounded-full border-2 border-slate-300 bg-white/80 px-10 py-5 font-bold text-slate-900 backdrop-blur-sm transition-all hover:border-gold-500 hover:bg-gold-50/50 hover:text-gold-700 hover:scale-105"
            >
              {{ t('wineStory.cta.aboutButton') }}
              <commonIcon name="lucide:arrow-right" class="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </NuxtLink>
          </div>

          <!-- Decorative Divider -->
          <div class="mt-12 flex items-center justify-center gap-4 text-gold-600/30">
            <div class="h-px w-20 bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />
            <commonIcon name="lucide:grape" class="h-5 w-5" />
            <div class="h-px w-20 bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />
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
