<template>
  <section class="relative overflow-hidden bg-slate-950 text-white">
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_rgba(15,23,42,0.05)_65%)]"></div>
    <div class="absolute inset-y-0 right-[-10%] hidden w-[45%] rounded-full bg-primary-500/30 blur-3xl lg:block"></div>
    <div class="container relative py-24 md:py-32">
      <div class="grid items-center gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <div>
          <div class="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium ring-1 ring-white/30 backdrop-blur">
            <commonIcon name="lucide:shield-check" class="h-4 w-4" />
            <span>{{ t('home.hero.trustBadge') }}</span>
          </div>
          <h1 class="mt-6 text-4xl font-bold tracking-tight md:text-6xl">{{ t('home.hero.title') }}</h1>
          <p class="mt-6 max-w-2xl text-lg text-white/80 md:text-xl">{{ t('home.hero.subtitle') }}</p>
          <div class="mt-8 flex flex-wrap gap-4">
            <NuxtLink
              :to="localePath('/products')"
              class="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-primary-700 shadow-lg shadow-primary-900/20 transition hover:-translate-y-0.5 hover:bg-primary-50 hover:shadow-xl"
            >
              {{ t('home.hero.primaryCta') }}
              <commonIcon name="lucide:arrow-right" class="h-5 w-5" />
            </NuxtLink>
            <NuxtLink
              :to="localePath('/about')"
              class="inline-flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 font-semibold text-white ring-1 ring-white/30 transition hover:bg-white/15"
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
          <div class="relative overflow-hidden rounded-[36px] border border-white/10 bg-white/5 shadow-[0_40px_80px_-40px_rgba(15,23,42,0.6)]">
            <!--
              TODO: Replace placeholder with actual product photography
              Expected path: /public/images/home/hero.jpg
              Note: Image directory will be created when actual hero image is added
            -->
            <NuxtImg
              src="https://images.unsplash.com/photo-1499244571948-7ccddb3583f1?q=80&w=1200"
              :alt="t('home.hero.imageAlt')"
              format="webp"
              quality="85"
              width="700"
              height="700"
              sizes="sm:100vw md:50vw lg:45vw"
              class="h-full w-full object-cover"
              loading="eager"
              :img-attrs="{ class: 'aspect-square' }"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
         
            <div class="absolute bottom-6 right-6 rounded-3xl border border-white/10 bg-slate-950/75 p-6 text-white shadow-lg shadow-slate-900/40 backdrop-blur">
              <div class="flex items-center gap-3">
                <div class="rounded-full bg-emerald-500/20 p-3 text-emerald-300">
                  <commonIcon name="lucide:truck" class="h-6 w-6" />
                </div>
                <div>
                  <p class="text-sm font-semibold">{{ t('home.hero.cards.delivery.title') }}</p>
                  <p class="text-xs text-white/70">{{ t('home.hero.cards.delivery.highlight') }}</p>
                </div>
              </div>
              <p class="mt-3 text-xs text-white/70">{{ t('home.hero.cards.delivery.description') }}</p>
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
