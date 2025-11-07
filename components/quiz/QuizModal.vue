<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="handleClose"
        role="dialog"
        aria-modal="true"
        :aria-label="t('quiz.title')"
      >
        <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
          <!-- Close Button -->
          <button
            @click="handleClose"
            class="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors z-10"
            :aria-label="t('common.close')"
          >
            <Icon name="lucide:x" class="w-5 h-5" />
          </button>

          <!-- Quiz Content -->
          <div class="p-8">
            <!-- Progress -->
            <QuizProgress
              v-if="currentStep > 0 && currentStep <= totalSteps"
              :current="currentStep"
              :total="totalSteps"
              class="mb-8"
            />

            <!-- Welcome Screen -->
            <div v-if="currentStep === 0" class="text-center">
              <div class="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                <Icon name="lucide:sparkles" class="w-10 h-10 text-purple-600" />
              </div>
              <h2 class="text-3xl font-bold mb-4">{{ t('quiz.welcome.title') }}</h2>
              <p class="text-gray-600 mb-8">{{ t('quiz.welcome.description') }}</p>
              <button
                @click="nextStep"
                class="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                {{ t('quiz.welcome.startButton') }}
              </button>
            </div>

            <!-- Quiz Questions -->
            <QuizStep
              v-else-if="currentStep > 0 && currentStep <= questions.length"
              :question="questions[currentStep - 1]"
              :selected-answer="answers[currentStep - 1]"
              @select="handleAnswer"
            />

            <!-- Results -->
            <QuizResults
              v-else-if="currentStep === totalSteps + 1"
              :answers="answers"
              @restart="restart"
              @view-products="handleViewProducts"
            />

            <!-- Navigation -->
            <div
              v-if="currentStep > 0 && currentStep <= questions.length"
              class="flex justify-between items-center mt-8"
            >
              <button
                v-if="currentStep > 1"
                @click="prevStep"
                class="px-6 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors inline-flex items-center gap-2"
              >
                <Icon name="lucide:arrow-left" class="w-4 h-4" />
                {{ t('quiz.navigation.back') }}
              </button>
              <div v-else />

              <button
                :disabled="!answers[currentStep - 1]"
                @click="nextStep"
                class="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all inline-flex items-center gap-2"
              >
                {{ currentStep === questions.length ? t('quiz.navigation.finish') : t('quiz.navigation.next') }}
                <Icon name="lucide:arrow-right" class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useQuiz } from '~/composables/landing/useQuiz'

interface Props {
  isOpen: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'complete', answers: string[]): void
}>()

const { t } = useI18n()
const { questions, currentStep, totalSteps, answers, nextStep, prevStep, restart } = useQuiz()

const handleClose = () => {
  if (currentStep.value > 0 && currentStep.value <= questions.length && confirm(t('quiz.confirmExit'))) {
    emit('close')
    restart()
  } else if (currentStep.value === 0 || currentStep.value > questions.length) {
    emit('close')
    restart()
  }
}

const handleAnswer = (answer: string) => {
  answers.value[currentStep.value - 1] = answer
}

const handleViewProducts = () => {
  emit('complete', answers.value)
  emit('close')
}

// Lock body scroll when modal is open
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.3s ease;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.95);
}
</style>
