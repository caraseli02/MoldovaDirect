<template>
  <div class="quiz-step">
    <h3 class="text-2xl font-bold mb-6 text-gray-900">
      {{ question.question }}
    </h3>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <button
        v-for="option in question.options"
        :key="option.value"
        @click="selectAnswer(option.value)"
        :class="[
          'quiz-option p-6 rounded-xl border-2 transition-all duration-300 text-left',
          selectedAnswer === option.value
            ? 'border-purple-600 bg-purple-50 shadow-lg'
            : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
        ]"
        :aria-pressed="selectedAnswer === option.value"
        :aria-label="`Select ${option.label}`"
      >
        <div class="flex items-start gap-4">
          <div
            :class="[
              'flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-colors',
              selectedAnswer === option.value
                ? 'bg-purple-600 text-white'
                : 'bg-purple-100 text-purple-600'
            ]"
          >
            <Icon :name="option.icon" class="w-6 h-6" />
          </div>
          <div class="flex-1">
            <div class="font-semibold text-gray-900 mb-1">{{ option.label }}</div>
            <div v-if="option.description" class="text-sm text-gray-600">
              {{ option.description }}
            </div>
          </div>
          <div
            v-if="selectedAnswer === option.value"
            class="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center"
          >
            <Icon name="lucide:check" class="w-4 h-4 text-white" />
          </div>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface QuizOption {
  value: string
  label: string
  icon: string
  description?: string
}

interface QuizQuestion {
  id: number
  question: string
  options: QuizOption[]
}

interface Props {
  question: QuizQuestion
  selectedAnswer?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'select', value: string): void
}>()

const selectAnswer = (value: string) => {
  emit('select', value)
}
</script>

<style scoped>
.quiz-option {
  cursor: pointer;
}

.quiz-option:focus-visible {
  outline: 2px solid #9333ea;
  outline-offset: 2px;
}
</style>
