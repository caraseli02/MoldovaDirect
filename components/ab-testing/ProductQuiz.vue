<template>
  <div class="bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-16">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Quiz Header -->
      <div v-if="currentStep === 0" class="text-center space-y-6">
        <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
          Encuentra Tu Producto Perfecto
        </h2>
        <p class="text-lg text-gray-600 dark:text-gray-300">
          Responde 4 preguntas rápidas y te recomendaremos los mejores productos moldavos para ti
        </p>

        <div class="flex items-center justify-center gap-8 text-sm text-gray-600 dark:text-gray-400">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>2 minutos</span>
          </div>
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Personalizado</span>
          </div>
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>Gratis</span>
          </div>
        </div>

        <UiButton size="lg" class="text-lg px-12 py-6" @click="startQuiz">
          Comenzar Quiz
          <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </UiButton>
      </div>

      <!-- Quiz Questions -->
      <div v-else-if="currentStep > 0 && currentStep <= questions.length" class="space-y-8">
        <!-- Progress Bar -->
        <div class="space-y-2">
          <div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Pregunta {{ currentStep }} de {{ questions.length }}</span>
            <span>{{ Math.round((currentStep / questions.length) * 100) }}% completado</span>
          </div>
          <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              class="h-full bg-blue-600 transition-all duration-500 ease-out"
              :style="{ width: `${(currentStep / questions.length) * 100}%` }"
            />
          </div>
        </div>

        <!-- Current Question -->
        <Transition name="slide-fade" mode="out-in">
          <div :key="currentStep" class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6">
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ currentQuestion.question }}
            </h3>

            <div class="space-y-3">
              <button
                v-for="option in currentQuestion.options"
                :key="option.value"
                @click="selectAnswer(option.value)"
                class="w-full p-4 text-left rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                :class="[
                  selectedAnswers[currentStep - 1] === option.value
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                ]"
              >
                <div class="flex items-start gap-3">
                  <div class="flex-shrink-0 mt-1">
                    <div
                      class="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                      :class="[
                        selectedAnswers[currentStep - 1] === option.value
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-gray-300 dark:border-gray-600'
                      ]"
                    >
                      <svg
                        v-if="selectedAnswers[currentStep - 1] === option.value"
                        class="w-4 h-4 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div class="flex-1">
                    <p class="font-medium text-gray-900 dark:text-white">
                      {{ option.label }}
                    </p>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {{ option.description }}
                    </p>
                  </div>
                </div>
              </button>
            </div>

            <!-- Navigation -->
            <div class="flex items-center justify-between pt-4">
              <UiButton
                variant="outline"
                @click="previousQuestion"
                :disabled="currentStep === 1"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
                Anterior
              </UiButton>

              <UiButton
                @click="nextQuestion"
                :disabled="!selectedAnswers[currentStep - 1]"
              >
                {{ currentStep === questions.length ? 'Ver Resultados' : 'Siguiente' }}
                <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </UiButton>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Results -->
      <div v-else class="space-y-8">
        <div class="text-center space-y-4">
          <div class="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
            <svg class="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>

          <h3 class="text-3xl font-bold text-gray-900 dark:text-white">
            ¡Tenemos Las Recomendaciones Perfectas Para Ti!
          </h3>

          <p class="text-lg text-gray-600 dark:text-gray-300">
            Basado en tus respuestas, hemos seleccionado los mejores productos moldavos para tu paladar
          </p>
        </div>

        <!-- Recommended Products Placeholder -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h4 class="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Tus Recomendaciones Personalizadas
          </h4>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div v-for="i in 4" :key="i" class="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
              <div class="w-full h-40 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
              <h5 class="font-semibold text-gray-900 dark:text-white">Producto Recomendado {{ i }}</h5>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Basado en tus preferencias</p>
            </div>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <UiButton size="lg" class="px-8" @click="viewRecommendations">
            Ver Todos los Productos Recomendados
          </UiButton>
          <UiButton variant="outline" size="lg" class="px-8" @click="resetQuiz">
            Tomar Quiz Nuevamente
          </UiButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { UiButton } from '#components'

const { trackActivity } = useAnalytics()
const route = useRoute()

const currentStep = ref(0)
const selectedAnswers = ref<string[]>([])
const startTime = ref<number>(0)

const questions = [
  {
    question: '¿Qué tipo de productos te interesan más?',
    options: [
      { value: 'wine', label: 'Vinos', description: 'Selección de vinos tintos, blancos y rosados' },
      { value: 'cheese', label: 'Quesos', description: 'Quesos artesanales y tradicionales' },
      { value: 'food', label: 'Alimentos', description: 'Conservas, dulces y especialidades' },
      { value: 'all', label: 'Todo', description: 'Quiero explorar toda la gama' }
    ]
  },
  {
    question: '¿Cuál es tu nivel de experiencia con productos moldavos?',
    options: [
      { value: 'beginner', label: 'Principiante', description: 'Primera vez probando productos de Moldavia' },
      { value: 'intermediate', label: 'Intermedio', description: 'He probado algunos productos antes' },
      { value: 'expert', label: 'Experto', description: 'Conozco bien la gastronomía moldava' }
    ]
  },
  {
    question: '¿Cuál es tu presupuesto aproximado?',
    options: [
      { value: 'budget', label: '€20-50', description: 'Productos de entrada' },
      { value: 'mid', label: '€50-100', description: 'Selección premium' },
      { value: 'premium', label: '€100+', description: 'Productos exclusivos y de colección' }
    ]
  },
  {
    question: '¿Para qué ocasión estás comprando?',
    options: [
      { value: 'personal', label: 'Uso Personal', description: 'Para disfrutar en casa' },
      { value: 'gift', label: 'Regalo', description: 'Para regalar a alguien especial' },
      { value: 'event', label: 'Evento', description: 'Para una celebración o reunión' },
      { value: 'business', label: 'Negocio', description: 'Para uso comercial o profesional' }
    ]
  }
]

const currentQuestion = computed(() => questions[currentStep.value - 1])

const startQuiz = () => {
  currentStep.value = 1
  startTime.value = Date.now()
  selectedAnswers.value = []

  trackActivity({
    activityType: 'quiz_start',
    pageUrl: route.path,
    metadata: {
      questionsCount: questions.length
    }
  })
}

const selectAnswer = (value: string) => {
  selectedAnswers.value[currentStep.value - 1] = value

  trackActivity({
    activityType: 'quiz_step_complete',
    pageUrl: route.path,
    metadata: {
      step: currentStep.value,
      answer: value,
      question: currentQuestion.value.question
    }
  })
}

const nextQuestion = () => {
  if (currentStep.value < questions.length) {
    currentStep.value++
  } else {
    // Show results
    currentStep.value = questions.length + 1

    const completionTime = Date.now() - startTime.value

    trackActivity({
      activityType: 'quiz_complete',
      pageUrl: route.path,
      metadata: {
        answers: selectedAnswers.value,
        completionTime,
        questionsCount: questions.length
      }
    })
  }
}

const previousQuestion = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const viewRecommendations = () => {
  trackActivity({
    activityType: 'quiz_recommendation_click',
    pageUrl: route.path,
    metadata: {
      answers: selectedAnswers.value
    }
  })

  // Navigate to products page with quiz results
  navigateTo('/products?from=quiz')
}

const resetQuiz = () => {
  currentStep.value = 0
  selectedAnswers.value = []

  trackActivity({
    activityType: 'quiz_reset',
    pageUrl: route.path
  })
}

// Track abandonment if user leaves mid-quiz
onBeforeUnmount(() => {
  if (currentStep.value > 0 && currentStep.value <= questions.length) {
    trackActivity({
      activityType: 'quiz_abandon',
      pageUrl: route.path,
      metadata: {
        abandonedAtStep: currentStep.value,
        completedSteps: currentStep.value - 1,
        totalSteps: questions.length
      }
    })
  }
})
</script>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  transform: translateX(30px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(-30px);
  opacity: 0;
}
</style>
