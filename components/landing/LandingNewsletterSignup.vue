<template>
  <section class="newsletter-signup bg-gradient-to-br from-rose-600 to-purple-700 py-16 sm:py-20 md:py-24 text-white">
    <div class="container mx-auto px-8 sm:px-10 md:px-12 lg:px-16">
      <div class="mx-auto max-w-3xl text-center">
        <h2 class="mb-8 text-3xl font-bold leading-tight tracking-wide sm:mb-10 sm:text-4xl md:mb-12 md:text-5xl">
          {{ t('landing.newsletter.heading') }}
        </h2>
        <p class="mb-10 text-base leading-relaxed text-rose-100 sm:mb-12 sm:text-lg md:mb-14 md:text-xl">
          {{ t('landing.newsletter.subheading') }}
        </p>

        <form @submit.prevent="handleSubmit" class="mx-auto flex max-w-xl flex-col gap-4 sm:flex-row sm:gap-4">
          <input
            v-model="email"
            type="email"
            inputmode="email"
            autocomplete="email"
            required
            :placeholder="t('landing.newsletter.placeholder')"
            :aria-label="t('landing.newsletter.placeholder')"
            class="min-h-[52px] flex-1 rounded-xl border border-white/30 bg-white/10 px-6 py-4 text-base text-white placeholder-white/70 backdrop-blur-md transition-all duration-200 focus:border-white focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/50"
          />
          <button
            type="submit"
            :disabled="isSubmitting"
            class="min-h-[52px] rounded-xl bg-white px-8 py-4 font-semibold text-purple-700 shadow-lg transition-all duration-200 active:scale-[0.98] hover:bg-gray-100 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 sm:px-10"
          >
            {{ isSubmitting ? t('landing.newsletter.submitting') : t('landing.newsletter.submit') }}
          </button>
        </form>

        <div v-if="successMessage || errorMessage" class="mt-6" role="alert" aria-live="polite">
          <p v-if="successMessage" class="text-green-200 font-medium text-base">{{ successMessage }}</p>
          <p v-if="errorMessage" class="text-red-200 font-medium text-base">{{ errorMessage }}</p>
        </div>

        <p class="mt-8 text-sm text-rose-200 sm:mt-10">
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
