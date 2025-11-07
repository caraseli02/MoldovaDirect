<template>
  <section class="newsletter-signup py-20 bg-gradient-to-br from-rose-600 to-purple-700 text-white">
    <div class="container mx-auto px-4">
      <div class="max-w-3xl mx-auto text-center">
        <h2 class="text-3xl md:text-4xl font-bold mb-4">
          {{ t('landing.newsletter.heading') }}
        </h2>
        <p class="text-lg text-rose-100 mb-8">
          {{ t('landing.newsletter.subheading') }}
        </p>

        <form @submit.prevent="handleSubmit" class="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
          <input
            v-model="email"
            type="email"
            required
            :placeholder="t('landing.newsletter.placeholder')"
            :aria-label="t('landing.newsletter.placeholder')"
            class="flex-1 px-6 py-4 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
          />
          <button
            type="submit"
            :disabled="isSubmitting"
            class="px-8 py-4 bg-white text-purple-700 font-semibold rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
          >
            {{ isSubmitting ? t('landing.newsletter.submitting') : t('landing.newsletter.submit') }}
          </button>
        </form>

        <div v-if="successMessage || errorMessage" class="mt-4" role="alert" aria-live="polite">
          <p v-if="successMessage" class="text-green-200 font-medium">{{ successMessage }}</p>
          <p v-if="errorMessage" class="text-red-200 font-medium">{{ errorMessage }}</p>
        </div>

        <p class="text-sm text-rose-200 mt-6">
          {{ t('landing.newsletter.privacy') }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()

const email = ref('')
const isSubmitting = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const handleSubmit = async () => {
  isSubmitting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    // Replace with actual API call
    await $fetch('/api/newsletter/subscribe', {
      method: 'POST',
      body: { email: email.value }
    })

    successMessage.value = t('landing.newsletter.success')
    email.value = ''
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    errorMessage.value = t('landing.newsletter.error')
  } finally {
    isSubmitting.value = false
  }
}
</script>
