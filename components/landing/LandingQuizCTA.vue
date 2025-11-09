<template>
  <section class="quiz-cta landing-section bg-gradient-to-br from-purple-100 via-pink-50 to-rose-100 py-16 sm:py-20 md:py-24">
    <div class="container mx-auto px-8 sm:px-10 md:px-12 lg:px-16">
      <div class="mx-auto max-w-4xl text-center">
        <div
          class="mb-8 inline-flex items-center gap-2 rounded-full bg-white/90 px-5 py-2.5 text-sm font-medium text-purple-700 shadow-sm backdrop-blur-sm animate-fade-in sm:mb-10 sm:px-6 sm:py-3"
        >
          <commonIcon name="lucide:sparkles" class="h-4 w-4 sm:h-5 sm:w-5" />
          <span>{{ t('landing.quiz.badge') }}</span>
        </div>

        <h2
          class="landing-h2 mb-8 text-3xl font-bold leading-tight tracking-wide animate-fade-in-up sm:mb-10 sm:text-4xl md:mb-12 md:text-5xl"
        >
          {{ t('landing.quiz.heading') }}
        </h2>

        <p
          class="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-gray-600 animate-fade-in-up animation-delay-100 sm:mb-12 sm:text-lg md:mb-14 md:text-xl"
        >
          {{ t('landing.quiz.subheading') }}
        </p>

        <div class="mb-10 flex flex-col items-stretch justify-center gap-4 animate-fade-in-up animation-delay-200 sm:mb-12 sm:flex-row sm:items-center sm:gap-5">
          <button
            type="button"
            @click="emit('start-quiz')"
            class="group inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 font-semibold text-white shadow-lg transition-all duration-200 active:scale-[0.98] hover:from-purple-700 hover:to-pink-700 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2 sm:w-auto sm:px-10"
            :aria-label="t('landing.quiz.ctaButton')"
          >
            <commonIcon name="lucide:wand-2" class="h-5 w-5 transition-transform duration-200 group-hover:rotate-12" />
            {{ t('landing.quiz.ctaButton') }}
          </button>
        </div>

        <!-- Trust Indicators -->
        <div
          class="flex flex-wrap justify-center gap-5 text-sm text-gray-600 animate-fade-in animation-delay-300 sm:gap-8"
        >
          <div class="flex items-center gap-2">
            <commonIcon name="lucide:clock" class="h-4 w-4 text-purple-600 sm:h-5 sm:w-5" />
            <span class="whitespace-nowrap">{{ t('landing.quiz.duration') }}</span>
          </div>
          <div class="flex items-center gap-2">
            <commonIcon name="lucide:users" class="h-4 w-4 text-pink-600 sm:h-5 sm:w-5" />
            <span class="whitespace-nowrap">{{ t('landing.quiz.completion') }}</span>
          </div>
          <div class="flex items-center gap-2">
            <commonIcon name="lucide:shield-check" class="h-4 w-4 text-green-600 sm:h-5 sm:w-5" />
            <span class="whitespace-nowrap">{{ t('landing.quiz.privacy') }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()
const emit = defineEmits<{
  (e: 'start-quiz'): void
}>()
</script>

<style scoped>
/* Fast, GPU-accelerated animations */
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.4s ease-out forwards;
}

.animate-fade-in-up {
  animation: fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  will-change: opacity, transform;
}

.animation-delay-100 {
  animation-delay: 0.1s;
}

.animation-delay-200 {
  animation-delay: 0.2s;
}

.animation-delay-300 {
  animation-delay: 0.3s;
}

/* Section styles */
.quiz-cta {
  min-height: 420px;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
  padding-top: 4rem;
  padding-bottom: 4rem;
}

@media (min-width: 640px) {
  .quiz-cta {
    min-height: 480px;
    padding-top: 5rem;
    padding-bottom: 5rem;
  }
}

@media (min-width: 1024px) {
  .quiz-cta {
    min-height: 520px;
  }
}

.quiz-cta::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 30% 50%, rgba(168, 85, 247, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 70% 50%, rgba(236, 72, 153, 0.15) 0%, transparent 50%);
  pointer-events: none;
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
