<template>
  <div>
    <!-- Landing Hero Section Demo -->
    <LandingHeroSection @open-quiz="handleQuizOpen" />

    <!-- Additional sections would go here -->
    <section class="container py-16">
      <h2 class="mb-4 text-3xl font-bold">Demo Page Content</h2>
      <p class="text-gray-600">
        This is a demo page showing the LandingHeroSection component in action.
        The hero section above is full-viewport and responsive.
      </p>
    </section>

    <!-- Quiz Modal (placeholder) -->
    <div
      v-if="isQuizOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @click="handleQuizClose"
    >
      <div class="max-w-2xl rounded-lg bg-white p-8 shadow-xl" @click.stop>
        <h3 class="mb-4 text-2xl font-bold">Wine Quiz Modal</h3>
        <p class="mb-6 text-gray-600">
          This would be your wine quiz component. For demo purposes, this is a placeholder.
        </p>
        <button
          type="button"
          class="rounded-lg bg-rose-600 px-6 py-3 font-semibold text-white hover:bg-rose-700"
          @click="handleQuizClose"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Demo page for LandingHeroSection component
const isQuizOpen = ref(false)

const handleQuizOpen = () => {
  isQuizOpen.value = true
}

const handleQuizClose = () => {
  isQuizOpen.value = false
}

// SEO metadata
useHead({
  title: 'Landing Hero Demo - Moldova Direct',
  meta: [
    {
      name: 'description',
      content: 'Demo page for the LandingHeroSection component'
    }
  ]
})
</script>
