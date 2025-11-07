<template>
  <section class="relative overflow-hidden bg-slate-950 text-white">
    <!-- Amazon-style carousel at the top -->
    <HomeHeroCarousel />

    <!-- Enhanced Video Hero Section -->
    <HomeVideoHero
      :video-url="heroContent.videoUrl"
      :fallback-image="heroContent.fallbackImage"
      :fallback-alt="heroContent.fallbackAlt"
      :title="t('home.hero.title')"
      :subtitle="t('home.hero.subtitle')"
      :urgency-message="heroContent.urgencyMessage"
      :primary-cta="{
        text: t('home.hero.primaryCta'),
        href: localePath('/products')
      }"
      :secondary-cta="{
        text: t('home.hero.secondaryCta'),
        href: localePath('/about')
      }"
      :trust-indicators="heroContent.trustIndicators"
    />

    <!-- Stats/Highlights Section -->
    <div class="relative bg-gradient-to-b from-slate-950 to-slate-900 py-12">
      <div class="container">
        <dl class="mx-auto grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-3">
          <div
            v-for="highlight in highlights"
            :key="highlight.label"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :visible="{ opacity: 1, y: 0 }"
            class="space-y-2 text-center"
          >
            <dt class="text-sm font-medium text-white/60">{{ highlight.label }}</dt>
            <dd class="text-3xl font-semibold">{{ highlight.value }}</dd>
          </div>
        </dl>

        <!-- Quiz CTA Banner (A/B Test Position) -->
        <div
          v-motion
          :initial="{ opacity: 0, y: 30 }"
          :visible="{ opacity: 1, y: 0 }"
          :delay="800"
          class="mx-auto mt-12 max-w-3xl"
        >
          <div class="overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 p-1 shadow-xl">
            <div class="flex flex-col items-center gap-4 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-center md:flex-row md:text-left">
              <div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <commonIcon name="lucide:sparkles" class="h-8 w-8 text-white" />
              </div>
              <div class="flex-1">
                <h3 class="text-xl font-bold text-white">
                  {{ t('home.hero.quizBanner.title') }}
                </h3>
                <p class="mt-1 text-sm text-white/90">
                  {{ t('home.hero.quizBanner.description') }}
                </p>
              </div>
              <button
                type="button"
                class="inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-primary-700 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-700"
                @click="openQuiz"
              >
                {{ t('home.hero.quizBanner.cta') }}
                <commonIcon name="lucide:arrow-right" class="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Product Quiz Modal -->
    <HomeProductQuiz :is-open="isQuizOpen" @close="closeQuiz" @complete="handleQuizComplete" />
  </section>
</template>

<script setup lang="ts">
import { useHomeContent } from '~/composables/useHomeContent'
import type { QuizAnswers } from '~/composables/useQuizRecommendations'

defineProps<{
  highlights: Array<{
    value: string
    label: string
  }>
}>()

const { t } = useI18n()
const localePath = useLocalePath()
const { heroContent } = useHomeContent()

// Quiz state
const isQuizOpen = ref(false)

const openQuiz = () => {
  isQuizOpen.value = true
}

const closeQuiz = () => {
  isQuizOpen.value = false
}

const handleQuizComplete = (answers: QuizAnswers) => {
  // Track quiz completion from hero section
  if (typeof window !== 'undefined' && (window as any).gtag) {
    ;(window as any).gtag('event', 'quiz_completed_from_hero', {
      category_id: answers.categoryId,
      experience_level: answers.experienceLevel,
      budget_range: answers.budgetRange,
      occasion: answers.occasion,
    })
  }
}
</script>
