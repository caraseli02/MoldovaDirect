<template>
  <section class="bg-white py-20 dark:bg-gray-950 md:py-28">
    <div class="container">
      <div class="mx-auto max-w-4xl">
        <!-- Quiz Header (always visible) -->
        <div
          v-motion
          :initial="{ opacity: 0, y: 30 }"
          :visible-once="{
            opacity: 1,
            y: 0,
            transition: { duration: 600 },
          }"
          class="text-center"
        >
          <span class="inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-2 text-sm font-semibold text-primary-700 dark:bg-primary-500/20 dark:text-primary-200">
            <commonIcon name="lucide:sparkles" class="h-4 w-4" />
            {{ t('home.productQuiz.badge') }}
          </span>
          <h2 class="mt-4 text-4xl font-bold text-gray-900 dark:text-white md:text-5xl lg:text-6xl tracking-tight">
            {{ t('home.productQuiz.title') }}
          </h2>
          <p class="mt-4 text-sm md:text-base text-gray-600 dark:text-gray-400">
            {{ t('home.productQuiz.subtitle') }}
          </p>
        </div>

        <!-- Progress Bar -->
        <div
          v-if="currentStep > 0 && currentStep <= questions.length"
          class="mt-8"
          role="progressbar"
          :aria-valuenow="currentStep"
          :aria-valuemin="1"
          :aria-valuemax="questions.length"
          :aria-label="`Question ${currentStep} of ${questions.length}`"
        >
          <div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>{{ t('home.productQuiz.progress') }}</span>
            <span class="font-semibold" aria-live="polite">{{ currentStep }}/{{ questions.length }}</span>
          </div>
          <div class="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
            <div
              class="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500"
              :style="{ width: `${(currentStep / questions.length) * 100}%` }"
            ></div>
          </div>
        </div>

        <!-- Step 0: Start Screen -->
        <div
          v-if="currentStep === 0"
          v-motion
          :initial="{ opacity: 0, scale: 0.95 }"
          :enter="{
            opacity: 1,
            scale: 1,
            transition: { duration: 500, delay: 200 },
          }"
          class="mt-12 text-center"
        >
          <div class="mb-8 flex justify-center">
            <div class="rounded-full bg-primary-100 p-6 dark:bg-primary-500/20">
              <commonIcon name="lucide:wine" class="h-16 w-16 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
          <p class="mx-auto max-w-2xl text-gray-700 dark:text-gray-300">
            {{ t('home.productQuiz.startText') }}
          </p>
          <button
            @click="startQuiz"
            class="cta-button mt-8 inline-flex items-center gap-2 rounded-full bg-primary-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-primary-700"
          >
            {{ t('home.productQuiz.startButton') }}
            <commonIcon name="lucide:arrow-right" class="h-5 w-5" />
          </button>
        </div>

        <!-- Quiz Questions -->
        <div
          v-else-if="currentStep > 0 && currentStep <= questions.length"
          v-motion
          :key="currentStep"
          :initial="{ opacity: 0, x: 50 }"
          :enter="{
            opacity: 1,
            x: 0,
            transition: { duration: 400 },
          }"
          class="mt-12"
        >
          <div class="text-center">
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ currentQuestion.question }}
            </h3>
            <p v-if="currentQuestion.description" class="mt-2 text-gray-600 dark:text-gray-400">
              {{ currentQuestion.description }}
            </p>
          </div>

          <!-- Answer Options -->
          <fieldset
            class="mt-8 grid gap-4"
            :class="currentQuestion.layout === 'grid' ? 'sm:grid-cols-2' : ''"
            role="radiogroup"
            :aria-labelledby="`question-${currentQuestion.id}`"
          >
            <legend :id="`question-${currentQuestion.id}`" class="sr-only">
              {{ currentQuestion.question }}
            </legend>
            <label
              v-for="option in currentQuestion.options"
              :key="option.value"
              :class="[
                'group relative overflow-hidden rounded-2xl border-2 p-6 text-left transition-all cursor-pointer',
                answers[currentQuestion.id] === option.value
                  ? 'border-primary-600 bg-primary-50 dark:border-primary-500 dark:bg-primary-950'
                  : 'border-gray-200 hover:border-primary-300 dark:border-gray-800 dark:hover:border-primary-700'
              ]"
            >
              <!-- Native radio input (visually hidden but accessible) -->
              <input
                type="radio"
                :name="`question-${currentQuestion.id}`"
                :value="option.value"
                :checked="answers[currentQuestion.id] === option.value"
                @change="selectAnswer(currentQuestion.id, option.value)"
                class="sr-only"
              />

              <!-- Image (if provided) -->
              <NuxtImg
                v-if="option.image"
                :src="option.image"
                :alt="option.label"
                width="400"
                height="200"
                class="mb-4 h-32 w-full rounded-lg object-cover"
              />

              <div class="flex items-start gap-4">
                <!-- Radio Circle (visual indicator) -->
                <div
                  :class="[
                    'mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition',
                    answers[currentQuestion.id] === option.value
                      ? 'border-primary-600 bg-primary-600'
                      : 'border-gray-300 group-hover:border-primary-400 dark:border-gray-600'
                  ]"
                  aria-hidden="true"
                >
                  <div
                    v-if="answers[currentQuestion.id] === option.value"
                    class="h-3 w-3 rounded-full bg-white"
                  ></div>
                </div>

                <div class="flex-1">
                  <p class="font-semibold text-gray-900 dark:text-white">{{ option.label }}</p>
                  <p v-if="option.description" class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {{ option.description }}
                  </p>
                </div>
              </div>
            </label>
          </fieldset>

          <!-- Navigation Buttons -->
          <div class="mt-8 flex items-center justify-between">
            <button
              v-if="currentStep > 1"
              @click="previousStep"
              class="inline-flex items-center gap-2 rounded-full border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
            >
              <commonIcon name="lucide:arrow-left" class="h-5 w-5" />
              {{ t('common.back') }}
            </button>
            <div v-else></div>

            <button
              @click="nextStep"
              :disabled="!answers[currentQuestion.id]"
              :class="[
                'inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold transition',
                answers[currentQuestion.id]
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'cursor-not-allowed bg-gray-200 text-gray-400 dark:bg-gray-800'
              ]"
            >
              {{ currentStep === questions.length ? t('home.productQuiz.getResults') : t('common.next') }}
              <commonIcon name="lucide:arrow-right" class="h-5 w-5" />
            </button>
          </div>
        </div>

        <!-- Results Screen -->
        <div
          v-else-if="currentStep > questions.length"
          v-motion
          :initial="{ opacity: 0, scale: 0.95 }"
          :enter="{
            opacity: 1,
            scale: 1,
            transition: { duration: 500 },
          }"
          class="mt-12"
        >
          <div class="text-center">
            <div class="mb-6 flex justify-center">
              <div class="rounded-full bg-green-100 p-6 dark:bg-green-950">
                <commonIcon name="lucide:check-circle" class="h-16 w-16 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ t('home.productQuiz.resultsTitle') }}
            </h3>
            <p class="mt-2 text-gray-600 dark:text-gray-400">
              {{ t('home.productQuiz.resultsSubtitle') }}
            </p>
          </div>

          <!-- Recommended Products Placeholder -->
          <div class="mt-8 grid gap-6 sm:grid-cols-2">
            <div
              v-for="i in 2"
              :key="i"
              class="rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900"
            >
              <div class="h-48 rounded-lg bg-gray-200 dark:bg-gray-800"></div>
              <div class="mt-4 h-4 rounded bg-gray-200 dark:bg-gray-800"></div>
              <div class="mt-2 h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-800"></div>
            </div>
          </div>

          <div class="mt-8 text-center">
            <NuxtLink
              :to="localePath('/products')"
              class="inline-flex items-center gap-2 rounded-full bg-primary-600 px-8 py-4 font-semibold text-white transition hover:bg-primary-700"
            >
              {{ t('home.productQuiz.viewProducts') }}
              <commonIcon name="lucide:arrow-right" class="h-5 w-5" />
            </NuxtLink>
            <button
              @click="restartQuiz"
              class="ml-4 inline-flex items-center gap-2 rounded-full border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
            >
              <commonIcon name="lucide:rotate-ccw" class="h-5 w-5" />
              {{ t('home.productQuiz.restart') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface QuizOption {
  value: string
  label: string
  description?: string
  image?: string
}

interface QuizQuestion {
  id: string
  question: string
  description?: string
  options: QuizOption[]
  layout?: 'list' | 'grid'
}

const { t } = useI18n()
const localePath = useLocalePath()

const currentStep = ref(0) // 0 = start, 1-N = questions, N+1 = results
const answers = ref<Record<string, string>>({})

// Mock quiz questions
const questions: QuizQuestion[] = [
  {
    id: 'occasion',
    question: t('home.productQuiz.questions.occasion.question'),
    description: t('home.productQuiz.questions.occasion.description'),
    layout: 'grid',
    options: [
      {
        value: 'gift',
        label: t('home.productQuiz.questions.occasion.options.gift.label'),
        description: t('home.productQuiz.questions.occasion.options.gift.description'),
        image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400'
      },
      {
        value: 'personal',
        label: t('home.productQuiz.questions.occasion.options.personal.label'),
        description: t('home.productQuiz.questions.occasion.options.personal.description'),
        image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400'
      },
      {
        value: 'event',
        label: t('home.productQuiz.questions.occasion.options.event.label'),
        description: t('home.productQuiz.questions.occasion.options.event.description'),
        image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400'
      },
      {
        value: 'subscription',
        label: t('home.productQuiz.questions.occasion.options.subscription.label'),
        description: t('home.productQuiz.questions.occasion.options.subscription.description'),
        image: 'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=400'
      }
    ]
  },
  {
    id: 'preference',
    question: t('home.productQuiz.questions.preference.question'),
    layout: 'list',
    options: [
      { value: 'red', label: t('home.productQuiz.questions.preference.options.red') },
      { value: 'white', label: t('home.productQuiz.questions.preference.options.white') },
      { value: 'sparkling', label: t('home.productQuiz.questions.preference.options.sparkling') },
      { value: 'mixed', label: t('home.productQuiz.questions.preference.options.mixed') }
    ]
  },
  {
    id: 'budget',
    question: t('home.productQuiz.questions.budget.question'),
    layout: 'list',
    options: [
      { value: 'under30', label: t('home.productQuiz.questions.budget.options.under30'), description: 'Great everyday wines' },
      { value: '30-60', label: t('home.productQuiz.questions.budget.options.mid'), description: 'Premium selections' },
      { value: 'over60', label: t('home.productQuiz.questions.budget.options.premium'), description: 'Reserve & limited editions' }
    ]
  }
]

const currentQuestion = computed(() => questions[currentStep.value - 1])

const startQuiz = () => {
  currentStep.value = 1
}

const selectAnswer = (questionId: string, value: string) => {
  answers.value[questionId] = value
}

const nextStep = () => {
  if (currentStep.value <= questions.length) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const restartQuiz = () => {
  currentStep.value = 0
  answers.value = {}
}
</script>
