<template>
  <div>
    <!-- Quiz Trigger Button/Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-200"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isOpen"
          class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center"
          @click.self="closeQuiz"
        >
          <Transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="translate-y-full sm:translate-y-0 sm:scale-95 opacity-0"
            enter-to-class="translate-y-0 sm:scale-100 opacity-100"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="translate-y-0 sm:scale-100 opacity-100"
            leave-to-class="translate-y-full sm:translate-y-0 sm:scale-95 opacity-0"
          >
            <div
              v-if="isOpen"
              class="relative w-full max-w-2xl rounded-t-3xl bg-white shadow-xl sm:rounded-3xl sm:max-h-[85vh] overflow-hidden"
            >
              <!-- Close Button -->
              <button
                type="button"
                class="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-slate-600 backdrop-blur transition hover:bg-white hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                @click="closeQuiz"
                :aria-label="t('quiz.close')"
              >
                <commonIcon name="lucide:x" class="h-5 w-5" />
              </button>

              <!-- Quiz Content -->
              <div class="max-h-[85vh] overflow-y-auto">
                <!-- Progress Bar -->
                <div class="sticky top-0 z-10 bg-white px-6 pt-6 pb-4">
                  <div class="mb-2 flex items-center justify-between text-sm font-medium text-slate-600">
                    <span>{{ t('quiz.progress') }}</span>
                    <span>{{ currentStep }}/{{ totalSteps }}</span>
                  </div>
                  <div class="h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      class="h-full rounded-full bg-primary-600 transition-all duration-300"
                      :style="{ width: `${progressPercentage}%` }"
                    ></div>
                  </div>
                </div>

                <!-- Quiz Steps -->
                <div class="px-6 pb-6">
                  <!-- Step 1: Product Category Interest -->
                  <div v-if="currentStep === 1" class="animate-fade-in">
                    <h2 class="mb-2 text-2xl font-bold text-slate-900">
                      {{ t('quiz.step1.title') }}
                    </h2>
                    <p class="mb-6 text-slate-600">
                      {{ t('quiz.step1.description') }}
                    </p>
                    <div class="grid grid-cols-2 gap-3 sm:gap-4">
                      <button
                        v-for="category in categories"
                        :key="category.id"
                        type="button"
                        class="group flex min-h-[110px] flex-col items-center justify-center gap-3 rounded-2xl border-2 p-4 transition hover:border-primary-500 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                        :class="
                          answers.categoryId === category.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-slate-200 bg-white'
                        "
                        @click="selectCategory(category.id)"
                      >
                        <commonIcon
                          :name="category.icon"
                          class="h-8 w-8 transition"
                          :class="
                            answers.categoryId === category.id
                              ? 'text-primary-600'
                              : 'text-slate-400 group-hover:text-primary-600'
                          "
                        />
                        <span
                          class="text-center text-sm font-semibold transition"
                          :class="
                            answers.categoryId === category.id
                              ? 'text-primary-900'
                              : 'text-slate-700 group-hover:text-primary-900'
                          "
                        >
                          {{ category.label }}
                        </span>
                      </button>
                    </div>
                  </div>

                  <!-- Step 2: Experience Level -->
                  <div v-if="currentStep === 2" class="animate-fade-in">
                    <h2 class="mb-2 text-2xl font-bold text-slate-900">
                      {{ t('quiz.step2.title') }}
                    </h2>
                    <p class="mb-6 text-slate-600">
                      {{ t('quiz.step2.description') }}
                    </p>
                    <div class="space-y-3">
                      <button
                        v-for="level in experienceLevels"
                        :key="level.id"
                        type="button"
                        class="group flex w-full min-h-[88px] items-start gap-4 rounded-2xl border-2 p-4 text-left transition hover:border-primary-500 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                        :class="
                          answers.experienceLevel === level.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-slate-200 bg-white'
                        "
                        @click="selectExperience(level.id)"
                      >
                        <div
                          class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition"
                          :class="
                            answers.experienceLevel === level.id
                              ? 'border-primary-500 bg-primary-500'
                              : 'border-slate-300 group-hover:border-primary-500'
                          "
                        >
                          <commonIcon
                            v-if="answers.experienceLevel === level.id"
                            name="lucide:check"
                            class="h-4 w-4 text-white"
                          />
                        </div>
                        <div class="flex-1">
                          <div class="font-semibold text-slate-900">
                            {{ level.label }}
                          </div>
                          <div class="mt-1 text-sm text-slate-600">
                            {{ level.description }}
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  <!-- Step 3: Budget Range -->
                  <div v-if="currentStep === 3" class="animate-fade-in">
                    <h2 class="mb-2 text-2xl font-bold text-slate-900">
                      {{ t('quiz.step3.title') }}
                    </h2>
                    <p class="mb-6 text-slate-600">
                      {{ t('quiz.step3.description') }}
                    </p>
                    <div class="space-y-3">
                      <button
                        v-for="budget in budgetRanges"
                        :key="budget.id"
                        type="button"
                        class="group flex w-full min-h-[66px] items-center justify-between rounded-2xl border-2 p-4 transition hover:border-primary-500 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                        :class="
                          answers.budgetRange === budget.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-slate-200 bg-white'
                        "
                        @click="selectBudget(budget.id)"
                      >
                        <div class="flex items-center gap-4">
                          <div
                            class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition"
                            :class="
                              answers.budgetRange === budget.id
                                ? 'border-primary-500 bg-primary-500'
                                : 'border-slate-300 group-hover:border-primary-500'
                            "
                          >
                            <commonIcon
                              v-if="answers.budgetRange === budget.id"
                              name="lucide:check"
                              class="h-4 w-4 text-white"
                            />
                          </div>
                          <span class="font-semibold text-slate-900">
                            {{ budget.label }}
                          </span>
                        </div>
                        <span class="text-sm text-slate-500">
                          {{ budget.hint }}
                        </span>
                      </button>
                    </div>
                  </div>

                  <!-- Step 4: Occasion/Purpose -->
                  <div v-if="currentStep === 4" class="animate-fade-in">
                    <h2 class="mb-2 text-2xl font-bold text-slate-900">
                      {{ t('quiz.step4.title') }}
                    </h2>
                    <p class="mb-6 text-slate-600">
                      {{ t('quiz.step4.description') }}
                    </p>
                    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <button
                        v-for="occasion in occasions"
                        :key="occasion.id"
                        type="button"
                        class="group flex min-h-[88px] items-start gap-4 rounded-2xl border-2 p-4 text-left transition hover:border-primary-500 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                        :class="
                          answers.occasion === occasion.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-slate-200 bg-white'
                        "
                        @click="selectOccasion(occasion.id)"
                      >
                        <commonIcon
                          :name="occasion.icon"
                          class="h-6 w-6 shrink-0 transition"
                          :class="
                            answers.occasion === occasion.id
                              ? 'text-primary-600'
                              : 'text-slate-400 group-hover:text-primary-600'
                          "
                        />
                        <div class="flex-1">
                          <div class="font-semibold text-slate-900">
                            {{ occasion.label }}
                          </div>
                          <div class="mt-1 text-sm text-slate-600">
                            {{ occasion.description }}
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  <!-- Results View -->
                  <div v-if="currentStep === 5" class="animate-fade-in">
                    <div class="mb-6 text-center">
                      <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
                        <commonIcon name="lucide:sparkles" class="h-8 w-8 text-primary-600" />
                      </div>
                      <h2 class="mb-2 text-2xl font-bold text-slate-900">
                        {{ t('quiz.results.title') }}
                      </h2>
                      <p class="text-slate-600">
                        {{ t('quiz.results.description') }}
                      </p>
                    </div>

                    <!-- Loading State -->
                    <div v-if="isLoadingRecommendations" class="py-8 text-center">
                      <div class="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></div>
                      <p class="mt-4 text-sm text-slate-600">
                        {{ t('quiz.results.loading') }}
                      </p>
                    </div>

                    <!-- Recommendations -->
                    <div v-else-if="recommendations.length > 0" class="space-y-4">
                      <div
                        v-for="product in recommendations"
                        :key="product.id"
                        class="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-primary-300 hover:shadow-md"
                      >
                        <NuxtImg
                          v-if="product.main_image"
                          :src="product.main_image"
                          :alt="product.name"
                          class="h-20 w-20 shrink-0 rounded-lg object-cover"
                          loading="lazy"
                        />
                        <div class="flex-1">
                          <h3 class="font-semibold text-slate-900">
                            {{ product.name }}
                          </h3>
                          <p class="mt-1 text-sm text-slate-600 line-clamp-2">
                            {{ product.description }}
                          </p>
                          <div class="mt-2 flex items-center justify-between">
                            <span class="text-lg font-bold text-primary-600">
                              {{ formatPrice(product.price) }}
                            </span>
                            <NuxtLink
                              :to="localePath(`/products/${product.slug}`)"
                              class="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700"
                            >
                              {{ t('quiz.results.viewProduct') }}
                              <commonIcon name="lucide:arrow-right" class="h-4 w-4" />
                            </NuxtLink>
                          </div>
                        </div>
                      </div>

                      <!-- View All CTA -->
                      <div class="pt-4 text-center">
                        <NuxtLink
                          :to="localePath('/products')"
                          class="inline-flex items-center gap-2 rounded-full bg-primary-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                          @click="trackEvent('quiz_view_all_clicked')"
                        >
                          {{ t('quiz.results.viewAllProducts') }}
                          <commonIcon name="lucide:arrow-right" class="h-5 w-5" />
                        </NuxtLink>
                      </div>
                    </div>

                    <!-- Error State -->
                    <div v-else class="rounded-2xl bg-red-50 p-6 text-center">
                      <commonIcon name="lucide:alert-circle" class="mx-auto h-8 w-8 text-red-600" />
                      <p class="mt-2 font-semibold text-red-900">
                        {{ t('quiz.results.error') }}
                      </p>
                      <button
                        type="button"
                        class="mt-4 rounded-full bg-red-600 px-6 py-2 font-semibold text-white hover:bg-red-700"
                        @click="retryRecommendations"
                      >
                        {{ t('common.retry') }}
                      </button>
                    </div>
                  </div>

                  <!-- Navigation Buttons -->
                  <div v-if="currentStep < 5" class="mt-8 flex gap-3">
                    <button
                      v-if="currentStep > 1"
                      type="button"
                      class="flex h-11 w-11 items-center justify-center rounded-full border-2 border-slate-200 text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                      @click="previousStep"
                      :aria-label="t('quiz.back')"
                    >
                      <commonIcon name="lucide:arrow-left" class="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      class="flex-1 rounded-full bg-primary-600 px-6 py-3 font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                      :disabled="!canProceed"
                      @click="nextStep"
                    >
                      {{ currentStep === 4 ? t('quiz.viewResults') : t('quiz.next') }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
interface QuizAnswer {
  categoryId: string | null
  experienceLevel: string | null
  budgetRange: string | null
  occasion: string | null
}

interface QuizOption {
  id: string
  label: string
  icon?: string
  description?: string
  hint?: string
}

interface ProductRecommendation {
  id: string
  name: string
  slug: string
  description: string
  price: number
  main_image: string | null
}

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
  complete: [answers: QuizAnswer]
}>()

const { t } = useI18n()
const localePath = useLocalePath()
const { locale } = useI18n()

// Quiz state
const currentStep = ref(1)
const totalSteps = 4
const answers = ref<QuizAnswer>({
  categoryId: null,
  experienceLevel: null,
  budgetRange: null,
  occasion: null,
})

const recommendations = ref<ProductRecommendation[]>([])
const isLoadingRecommendations = ref(false)

// Quiz options
const categories = computed<QuizOption[]>(() => [
  { id: 'wine', label: t('quiz.categories.wine'), icon: 'lucide:wine' },
  { id: 'food', label: t('quiz.categories.food'), icon: 'lucide:utensils' },
  { id: 'crafts', label: t('quiz.categories.crafts'), icon: 'lucide:palette' },
  { id: 'honey', label: t('quiz.categories.honey'), icon: 'lucide:droplet' },
  { id: 'preserves', label: t('quiz.categories.preserves'), icon: 'lucide:cherry' },
  { id: 'gifts', label: t('quiz.categories.gifts'), icon: 'lucide:gift' },
])

const experienceLevels = computed<QuizOption[]>(() => [
  {
    id: 'beginner',
    label: t('quiz.experience.beginner.label'),
    description: t('quiz.experience.beginner.description'),
  },
  {
    id: 'enthusiast',
    label: t('quiz.experience.enthusiast.label'),
    description: t('quiz.experience.enthusiast.description'),
  },
  {
    id: 'connoisseur',
    label: t('quiz.experience.connoisseur.label'),
    description: t('quiz.experience.connoisseur.description'),
  },
])

const budgetRanges = computed<QuizOption[]>(() => [
  { id: 'under_50', label: t('quiz.budget.under50'), hint: t('quiz.budget.under50Hint') },
  { id: '50_100', label: t('quiz.budget.50to100'), hint: t('quiz.budget.50to100Hint') },
  { id: '100_200', label: t('quiz.budget.100to200'), hint: t('quiz.budget.100to200Hint') },
  { id: 'over_200', label: t('quiz.budget.over200'), hint: t('quiz.budget.over200Hint') },
])

const occasions = computed<QuizOption[]>(() => [
  {
    id: 'personal',
    label: t('quiz.occasions.personal.label'),
    description: t('quiz.occasions.personal.description'),
    icon: 'lucide:user',
  },
  {
    id: 'gift',
    label: t('quiz.occasions.gift.label'),
    description: t('quiz.occasions.gift.description'),
    icon: 'lucide:gift',
  },
  {
    id: 'event',
    label: t('quiz.occasions.event.label'),
    description: t('quiz.occasions.event.description'),
    icon: 'lucide:calendar',
  },
  {
    id: 'business',
    label: t('quiz.occasions.business.label'),
    description: t('quiz.occasions.business.description'),
    icon: 'lucide:briefcase',
  },
])

// Computed
const progressPercentage = computed(() => {
  return (currentStep.value / totalSteps) * 100
})

const canProceed = computed(() => {
  switch (currentStep.value) {
    case 1:
      return answers.value.categoryId !== null
    case 2:
      return answers.value.experienceLevel !== null
    case 3:
      return answers.value.budgetRange !== null
    case 4:
      return answers.value.occasion !== null
    default:
      return false
  }
})

// Methods
const selectCategory = (categoryId: string) => {
  answers.value.categoryId = categoryId
  trackEvent('quiz_category_selected', { category: categoryId })
}

const selectExperience = (level: string) => {
  answers.value.experienceLevel = level
  trackEvent('quiz_experience_selected', { level })
}

const selectBudget = (budget: string) => {
  answers.value.budgetRange = budget
  trackEvent('quiz_budget_selected', { budget })
}

const selectOccasion = (occasion: string) => {
  answers.value.occasion = occasion
  trackEvent('quiz_occasion_selected', { occasion })
}

const nextStep = async () => {
  if (!canProceed.value) return

  trackEvent('quiz_step_completed', { step: currentStep.value })

  if (currentStep.value === 4) {
    // Last step, fetch recommendations
    currentStep.value = 5
    await fetchRecommendations()
    trackEvent('quiz_completed', { answers: answers.value })
    emit('complete', answers.value)
  } else {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
    trackEvent('quiz_step_back', { step: currentStep.value })
  }
}

const closeQuiz = () => {
  trackEvent('quiz_closed', { step: currentStep.value })
  emit('close')
}

const fetchRecommendations = async () => {
  isLoadingRecommendations.value = true
  try {
    const response = await $fetch<{ recommendations: ProductRecommendation[] }>(
      '/api/quiz-recommendations',
      {
        method: 'POST',
        body: {
          ...answers.value,
          locale: locale.value,
        },
      }
    )
    recommendations.value = response.recommendations
    trackEvent('quiz_recommendations_loaded', { count: response.recommendations.length })
  } catch (error) {
    console.error('Error fetching recommendations:', error)
    recommendations.value = []
    trackEvent('quiz_recommendations_error')
  } finally {
    isLoadingRecommendations.value = false
  }
}

const retryRecommendations = () => {
  trackEvent('quiz_retry_recommendations')
  fetchRecommendations()
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat(locale.value, {
    style: 'currency',
    currency: 'USD',
  }).format(price)
}

const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  // Track analytics events
  if (typeof window !== 'undefined' && (window as any).gtag) {
    ;(window as any).gtag('event', eventName, properties)
  }
}

// Lifecycle
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      trackEvent('quiz_opened')
      // Reset quiz on open
      currentStep.value = 1
      answers.value = {
        categoryId: null,
        experienceLevel: null,
        budgetRange: null,
        occasion: null,
      }
      recommendations.value = []
    }
  }
)

// Track drop-off points
watch(currentStep, (step, oldStep) => {
  if (step < oldStep) {
    trackEvent('quiz_step_dropped', { from: oldStep, to: step })
  }
})
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
