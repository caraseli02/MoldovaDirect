<template>
  <section class="quiz-cta landing-section bg-gradient-to-br from-purple-100 via-pink-50 to-rose-100">
    <div class="container mx-auto px-4">
      <div class="max-w-4xl mx-auto text-center">
        <div
          v-motion
          :initial="{ opacity: 0, scale: 0.9 }"
          :visible="{ opacity: 1, scale: 1 }"
          class="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sm font-medium text-purple-700 mb-6"
        >
          <Icon name="lucide:sparkles" class="w-4 h-4" />
          <span>{{ t('landing.quiz.badge') }}</span>
        </div>

        <h2
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :visible="{ opacity: 1, y: 0 }"
          :delay="200"
          class="landing-h2 mb-6"
        >
          {{ t('landing.quiz.heading') }}
        </h2>

        <p
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :visible="{ opacity: 1, y: 0 }"
          :delay="400"
          class="text-lg text-gray-600 mb-8 max-w-2xl mx-auto"
        >
          {{ t('landing.quiz.subheading') }}
        </p>

        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <button
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :visible="{ opacity: 1, y: 0 }"
            :delay="600"
            @click="emit('start-quiz')"
            class="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center gap-2"
            :aria-label="t('landing.quiz.ctaButton')"
          >
            <Icon name="lucide:wand-2" class="w-5 h-5" />
            {{ t('landing.quiz.ctaButton') }}
          </button>
        </div>

        <!-- Trust Indicators -->
        <div
          v-motion
          :initial="{ opacity: 0 }"
          :visible="{ opacity: 1 }"
          :delay="800"
          class="flex flex-wrap gap-6 justify-center text-sm text-gray-600"
        >
          <div class="flex items-center gap-2">
            <Icon name="lucide:clock" class="w-4 h-4 text-purple-600" />
            <span>{{ t('landing.quiz.duration') }}</span>
          </div>
          <div class="flex items-center gap-2">
            <Icon name="lucide:users" class="w-4 h-4 text-pink-600" />
            <span>{{ t('landing.quiz.completion') }}</span>
          </div>
          <div class="flex items-center gap-2">
            <Icon name="lucide:shield-check" class="w-4 h-4 text-green-600" />
            <span>{{ t('landing.quiz.privacy') }}</span>
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
.quiz-cta {
  min-height: 400px;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
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
</style>
