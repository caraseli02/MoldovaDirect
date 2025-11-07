<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="container mx-auto px-4">
      <div class="max-w-4xl mx-auto mb-12">
        <h1 class="text-4xl font-bold text-center mb-4">Quiz Component Demo</h1>
        <p class="text-center text-gray-600 mb-8">
          Test the interactive quiz flow for product recommendations
        </p>
      </div>

      <!-- Quiz CTA Section -->
      <LandingQuizCTA @start-quiz="openQuiz" />

      <!-- Demo Controls -->
      <div class="max-w-2xl mx-auto mt-12 p-6 bg-white rounded-lg shadow-md">
        <h2 class="text-2xl font-bold mb-4">Demo Controls</h2>
        <div class="space-y-4">
          <button
            @click="openQuiz"
            class="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
          >
            Open Quiz Modal
          </button>

          <div class="pt-4 border-t">
            <h3 class="font-semibold mb-2">Features Demonstrated:</h3>
            <ul class="space-y-2 text-sm text-gray-600">
              <li class="flex items-start gap-2">
                <Icon name="lucide:check" class="w-5 h-5 text-green-600 flex-shrink-0" />
                <span>Interactive quiz CTA with trust indicators</span>
              </li>
              <li class="flex items-start gap-2">
                <Icon name="lucide:check" class="w-5 h-5 text-green-600 flex-shrink-0" />
                <span>Modal overlay with backdrop blur</span>
              </li>
              <li class="flex items-start gap-2">
                <Icon name="lucide:check" class="w-5 h-5 text-green-600 flex-shrink-0" />
                <span>Progress indicator showing completion percentage</span>
              </li>
              <li class="flex items-start gap-2">
                <Icon name="lucide:check" class="w-5 h-5 text-green-600 flex-shrink-0" />
                <span>4 questions with icon-based options</span>
              </li>
              <li class="flex items-start gap-2">
                <Icon name="lucide:check" class="w-5 h-5 text-green-600 flex-shrink-0" />
                <span>Dynamic recommendations based on answers</span>
              </li>
              <li class="flex items-start gap-2">
                <Icon name="lucide:check" class="w-5 h-5 text-green-600 flex-shrink-0" />
                <span>Smooth transitions and animations</span>
              </li>
              <li class="flex items-start gap-2">
                <Icon name="lucide:check" class="w-5 h-5 text-green-600 flex-shrink-0" />
                <span>Keyboard navigation support</span>
              </li>
              <li class="flex items-start gap-2">
                <Icon name="lucide:check" class="w-5 h-5 text-green-600 flex-shrink-0" />
                <span>Mobile-optimized with 44px touch targets</span>
              </li>
            </ul>
          </div>

          <div v-if="lastAnswers.length > 0" class="pt-4 border-t">
            <h3 class="font-semibold mb-2">Last Quiz Answers:</h3>
            <div class="space-y-2 text-sm">
              <div v-for="(answer, index) in lastAnswers" :key="index" class="flex items-center gap-2">
                <span class="font-medium">Q{{ index + 1 }}:</span>
                <span class="text-gray-600">{{ answer }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quiz Modal -->
      <QuizModal
        :is-open="isQuizOpen"
        @close="closeQuiz"
        @complete="handleQuizComplete"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const isQuizOpen = ref(false)
const lastAnswers = ref<string[]>([])

const openQuiz = () => {
  isQuizOpen.value = true
}

const closeQuiz = () => {
  isQuizOpen.value = false
}

const handleQuizComplete = (answers: string[]) => {
  lastAnswers.value = answers
  console.log('Quiz completed with answers:', answers)
  // In production, this would navigate to products page with filters
  // or show personalized product recommendations
}

// Meta tags for demo page
useHead({
  title: 'Quiz Component Demo',
  meta: [
    { name: 'description', content: 'Interactive quiz component demonstration' }
  ]
})
</script>
