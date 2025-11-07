<template>
  <HomeProductQuiz
    :is-open="isOpen"
    @close="$emit('close')"
    @complete="handleComplete"
  />
</template>

<script setup lang="ts">
interface QuizAnswer {
  categoryId: string | null
  experienceLevel: string | null
  budgetRange: string | null
  occasion: string | null
}

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
  complete: [answers: QuizAnswer]
}>()

const handleComplete = (answers: QuizAnswer) => {
  emit('complete', answers)
}
</script>
