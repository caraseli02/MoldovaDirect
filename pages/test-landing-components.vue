<template>
  <div class="min-h-screen bg-white">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-8 text-center">Landing Components Test</h1>

      <div class="space-y-4 mb-8">
        <h2 class="text-2xl font-semibold">Component Preview</h2>
        <p class="text-gray-600">
          Testing LandingTrustBadges and LandingStatsCounter components with animations.
        </p>
      </div>

      <!-- Trust Badges Component -->
      <div class="mb-8">
        <h3 class="text-xl font-semibold mb-4">1. Trust Badges</h3>
        <LandingTrustBadges />
      </div>

      <!-- Stats Counter Component -->
      <div class="mb-8">
        <h3 class="text-xl font-semibold mb-4">2. Stats Counter</h3>
        <LandingStatsCounter />
      </div>

      <!-- Language Switcher for Testing -->
      <div class="mt-12 p-6 bg-gray-50 rounded-lg">
        <h3 class="text-xl font-semibold mb-4">Language Switcher</h3>
        <div class="flex gap-4">
          <button
            v-for="locale in availableLocales"
            :key="locale.code"
            @click="setLocale(locale.code)"
            :class="[
              'px-4 py-2 rounded-lg font-medium transition-colors',
              currentLocale === locale.code
                ? 'bg-rose-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            ]"
          >
            {{ locale.name }}
          </button>
        </div>
      </div>

      <!-- Component Details -->
      <div class="mt-12 p-6 bg-blue-50 rounded-lg">
        <h3 class="text-xl font-semibold mb-4">Component Details</h3>
        <ul class="space-y-2 text-sm">
          <li><strong>TrustBadges:</strong> Shows security, shipping, guarantee, and support badges</li>
          <li><strong>StatsCounter:</strong> Animated counters for customers, products, rating, and countries</li>
          <li><strong>Animations:</strong> Fade-in and scale animations using @vueuse/motion</li>
          <li><strong>Responsive:</strong> Grid layout adapts from 2x2 on mobile to 4 columns on desktop</li>
          <li><strong>i18n:</strong> All text is translatable (EN, ES, RO, RU)</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { locale, setLocale } = useI18n()

const currentLocale = computed(() => locale.value)

const availableLocales = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'ro', name: 'Română' },
  { code: 'ru', name: 'Русский' }
]

// Set page meta
useHead({
  title: 'Landing Components Test',
  meta: [
    { name: 'description', content: 'Testing trust badges and stats counter components' }
  ]
})
</script>
