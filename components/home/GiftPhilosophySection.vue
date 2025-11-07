<template>
  <section class="relative overflow-hidden bg-slate-900 py-16 text-white md:py-24">
    <!-- Background Pattern -->
    <div class="absolute inset-0 opacity-10">
      <div class="absolute h-full w-full bg-[radial-gradient(circle_at_30%_50%,_rgba(255,255,255,0.15),_transparent_50%)]"></div>
      <div class="absolute h-full w-full bg-[radial-gradient(circle_at_70%_50%,_rgba(255,255,255,0.15),_transparent_50%)]"></div>
    </div>

    <div class="container relative">
      <!-- Section Header -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :visible="{
          opacity: 1,
          y: 0,
          transition: { duration: 600 },
        }"
        class="mx-auto max-w-3xl text-center"
      >
        <h2 class="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          {{ t('wineStory.giftPhilosophy.title') }}
        </h2>
        <p class="mt-4 text-xl text-white/80">
          {{ t('wineStory.giftPhilosophy.subtitle') }}
        </p>
        <p class="mx-auto mt-6 max-w-2xl leading-relaxed text-white/70">
          {{ t('wineStory.giftPhilosophy.description') }}
        </p>
      </div>

      <!-- Reasons Grid -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 40 }"
        :visible="{
          opacity: 1,
          y: 0,
          transition: { duration: 600, delay: 200 },
        }"
        class="mt-12"
      >
        <h3 class="mb-8 text-center text-2xl font-bold">
          {{ t('wineStory.giftPhilosophy.reasons.title') }}
        </h3>

        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <!-- Authenticity -->
          <div class="group rounded-2xl bg-white/10 p-6 backdrop-blur transition-all hover:bg-white/15">
            <div class="mb-4 inline-flex rounded-full bg-primary-500/20 p-3">
              <commonIcon name="lucide:heart" class="h-6 w-6 text-primary-400" />
            </div>
            <h4 class="mb-2 text-lg font-bold">
              {{ t('wineStory.giftPhilosophy.reasons.authenticity.title') }}
            </h4>
            <p class="text-sm leading-relaxed text-white/70">
              {{ t('wineStory.giftPhilosophy.reasons.authenticity.description') }}
            </p>
          </div>

          <!-- Quality -->
          <div class="group rounded-2xl bg-white/10 p-6 backdrop-blur transition-all hover:bg-white/15">
            <div class="mb-4 inline-flex rounded-full bg-primary-500/20 p-3">
              <commonIcon name="lucide:award" class="h-6 w-6 text-primary-400" />
            </div>
            <h4 class="mb-2 text-lg font-bold">
              {{ t('wineStory.giftPhilosophy.reasons.quality.title') }}
            </h4>
            <p class="text-sm leading-relaxed text-white/70">
              {{ t('wineStory.giftPhilosophy.reasons.quality.description') }}
            </p>
          </div>

          <!-- Sustainability -->
          <div class="group rounded-2xl bg-white/10 p-6 backdrop-blur transition-all hover:bg-white/15">
            <div class="mb-4 inline-flex rounded-full bg-primary-500/20 p-3">
              <commonIcon name="lucide:leaf" class="h-6 w-6 text-primary-400" />
            </div>
            <h4 class="mb-2 text-lg font-bold">
              {{ t('wineStory.giftPhilosophy.reasons.sustainability.title') }}
            </h4>
            <p class="text-sm leading-relaxed text-white/70">
              {{ t('wineStory.giftPhilosophy.reasons.sustainability.description') }}
            </p>
          </div>

          <!-- Unique -->
          <div class="group rounded-2xl bg-white/10 p-6 backdrop-blur transition-all hover:bg-white/15">
            <div class="mb-4 inline-flex rounded-full bg-primary-500/20 p-3">
              <commonIcon name="lucide:sparkles" class="h-6 w-6 text-primary-400" />
            </div>
            <h4 class="mb-2 text-lg font-bold">
              {{ t('wineStory.giftPhilosophy.reasons.unique.title') }}
            </h4>
            <p class="text-sm leading-relaxed text-white/70">
              {{ t('wineStory.giftPhilosophy.reasons.unique.description') }}
            </p>
          </div>
        </div>
      </div>

      <!-- Gift Scenarios -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 40 }"
        :visible="{
          opacity: 1,
          y: 0,
          transition: { duration: 600, delay: 400 },
        }"
        class="mt-16"
      >
        <h3 class="mb-8 text-center text-2xl font-bold">
          {{ t('wineStory.giftPhilosophy.scenarios.title') }}
        </h3>

        <div class="grid gap-6 md:grid-cols-2">
          <!-- Corporate Gifts -->
          <div class="group rounded-2xl border border-white/20 bg-white/5 p-8 backdrop-blur transition-all hover:border-white/30 hover:bg-white/10">
            <div class="mb-4 flex items-center gap-3">
              <div class="rounded-full bg-primary-500/20 p-2">
                <commonIcon name="lucide:briefcase" class="h-5 w-5 text-primary-400" />
              </div>
              <h4 class="text-xl font-bold">
                {{ t('wineStory.giftPhilosophy.scenarios.corporate.title') }}
              </h4>
            </div>
            <p class="leading-relaxed text-white/70">
              {{ t('wineStory.giftPhilosophy.scenarios.corporate.description') }}
            </p>
          </div>

          <!-- Celebrations -->
          <div class="group rounded-2xl border border-white/20 bg-white/5 p-8 backdrop-blur transition-all hover:border-white/30 hover:bg-white/10">
            <div class="mb-4 flex items-center gap-3">
              <div class="rounded-full bg-primary-500/20 p-2">
                <commonIcon name="lucide:party-popper" class="h-5 w-5 text-primary-400" />
              </div>
              <h4 class="text-xl font-bold">
                {{ t('wineStory.giftPhilosophy.scenarios.celebration.title') }}
              </h4>
            </div>
            <p class="leading-relaxed text-white/70">
              {{ t('wineStory.giftPhilosophy.scenarios.celebration.description') }}
            </p>
          </div>

          <!-- Gratitude -->
          <div class="group rounded-2xl border border-white/20 bg-white/5 p-8 backdrop-blur transition-all hover:border-white/30 hover:bg-white/10">
            <div class="mb-4 flex items-center gap-3">
              <div class="rounded-full bg-primary-500/20 p-2">
                <commonIcon name="lucide:gift" class="h-5 w-5 text-primary-400" />
              </div>
              <h4 class="text-xl font-bold">
                {{ t('wineStory.giftPhilosophy.scenarios.gratitude.title') }}
              </h4>
            </div>
            <p class="leading-relaxed text-white/70">
              {{ t('wineStory.giftPhilosophy.scenarios.gratitude.description') }}
            </p>
          </div>

          <!-- Exploration -->
          <div class="group rounded-2xl border border-white/20 bg-white/5 p-8 backdrop-blur transition-all hover:border-white/30 hover:bg-white/10">
            <div class="mb-4 flex items-center gap-3">
              <div class="rounded-full bg-primary-500/20 p-2">
                <commonIcon name="lucide:compass" class="h-5 w-5 text-primary-400" />
              </div>
              <h4 class="text-xl font-bold">
                {{ t('wineStory.giftPhilosophy.scenarios.exploration.title') }}
              </h4>
            </div>
            <p class="leading-relaxed text-white/70">
              {{ t('wineStory.giftPhilosophy.scenarios.exploration.description') }}
            </p>
          </div>
        </div>
      </div>

      <!-- CTA -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :visible="{
          opacity: 1,
          y: 0,
          transition: { duration: 600, delay: 600 },
        }"
        class="mt-16 text-center"
      >
        <h3 class="mb-3 text-2xl font-bold">
          {{ t('wineStory.giftPhilosophy.cta.title') }}
        </h3>
        <p class="mb-6 text-white/70">
          {{ t('wineStory.giftPhilosophy.cta.description') }}
        </p>
        <NuxtLink
          :to="localePath('/products')"
          class="cta-button inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 font-semibold text-slate-900 shadow-lg transition-all hover:bg-white/90"
        >
          {{ t('wineStory.giftPhilosophy.cta.button') }}
          <commonIcon name="lucide:arrow-right" class="h-5 w-5" />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<style scoped>
/* Ensure backdrop blur works consistently */
.backdrop-blur {
  backdrop-filter: blur(12px);
}

/* Focus styles for accessibility */
a:focus-visible {
  @apply outline-none ring-2 ring-white ring-offset-2 ring-offset-slate-900;
}
</style>
