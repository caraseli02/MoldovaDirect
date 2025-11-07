<template>
  <div class="quiz-results text-center">
    <div class="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
      <Icon name="lucide:sparkles" class="w-10 h-10 text-purple-600" />
    </div>

    <h2 class="text-3xl font-bold mb-4">{{ t('quiz.results.title') }}</h2>
    <p class="text-gray-600 mb-8 text-lg">{{ t('quiz.results.subtitle') }}</p>

    <!-- Recommendations -->
    <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 mb-8">
      <h3 class="font-semibold text-lg mb-4">{{ t('quiz.results.recommendations') }}</h3>
      <div class="space-y-4">
        <div
          v-for="(rec, index) in recommendations"
          :key="index"
          class="bg-white rounded-lg p-4 flex items-center gap-4 text-left"
        >
          <div class="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
            <Icon :name="rec.icon" class="w-6 h-6 text-purple-600" />
          </div>
          <div class="flex-1">
            <div class="font-semibold text-gray-900">{{ rec.title }}</div>
            <div class="text-sm text-gray-600">{{ rec.description }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <button
        @click="emit('view-products')"
        class="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center justify-center gap-2"
      >
        {{ t('quiz.results.viewProducts') }}
        <Icon name="lucide:arrow-right" class="w-5 h-5" />
      </button>
      <button
        @click="emit('restart')"
        class="px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg border-2 border-gray-200 transition-all duration-300 inline-flex items-center justify-center gap-2"
      >
        <Icon name="lucide:refresh-cw" class="w-5 h-5" />
        {{ t('quiz.results.retake') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  answers: string[]
}

interface Recommendation {
  title: string
  description: string
  icon: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'restart'): void
  (e: 'view-products'): void
}>()

const { t } = useI18n()

// Generate recommendations based on answers
const recommendations = computed<Recommendation[]>(() => {
  const recs: Recommendation[] = []

  // Analyze first answer (product type)
  if (props.answers[0] === 'wine') {
    recs.push({
      title: t('quiz.results.rec.wine.title'),
      description: t('quiz.results.rec.wine.desc'),
      icon: 'lucide:wine'
    })
  } else if (props.answers[0] === 'food') {
    recs.push({
      title: t('quiz.results.rec.food.title'),
      description: t('quiz.results.rec.food.desc'),
      icon: 'lucide:utensils'
    })
  } else if (props.answers[0] === 'both') {
    recs.push({
      title: t('quiz.results.rec.both.title'),
      description: t('quiz.results.rec.both.desc'),
      icon: 'lucide:sparkles'
    })
  } else if (props.answers[0] === 'gifts') {
    recs.push({
      title: t('quiz.results.rec.gifts.title'),
      description: t('quiz.results.rec.gifts.desc'),
      icon: 'lucide:gift'
    })
  }

  // Analyze second answer (experience level)
  if (props.answers[1] === 'beginner') {
    recs.push({
      title: t('quiz.results.rec.beginner.title'),
      description: t('quiz.results.rec.beginner.desc'),
      icon: 'lucide:sprout'
    })
  } else if (props.answers[1] === 'connoisseur') {
    recs.push({
      title: t('quiz.results.rec.expert.title'),
      description: t('quiz.results.rec.expert.desc'),
      icon: 'lucide:crown'
    })
  }

  // Analyze budget
  if (props.answers[2] === 'over100') {
    recs.push({
      title: t('quiz.results.rec.premium.title'),
      description: t('quiz.results.rec.premium.desc'),
      icon: 'lucide:gem'
    })
  }

  return recs
})
</script>
