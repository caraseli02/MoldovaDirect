<template>
  <section class="luxury-section bg-luxury-dark-chocolate text-luxury-cream py-16 md:py-20 lg:py-24">
    <div class="luxury-container">
      <div class="max-w-3xl mx-auto text-center px-4">
        <!-- Decorative Element -->
        <div class="w-16 h-px bg-luxury-wine-red mx-auto mb-6" />

        <!-- Headline -->
        <h2 class="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight">
          {{ $t('newsletter.headline') || 'Enter the World of Moldova Direct' }}
        </h2>

        <!-- Description -->
        <p class="text-base sm:text-lg md:text-xl text-luxury-cream/80 mb-8 md:mb-10 leading-relaxed">
          {{ $t('newsletter.description') || 'Be the first to discover limited releases, exclusive pairings and insider stories from our artisan partners. Plus, enjoy special perks reserved for our community.' }}
        </p>

        <!-- Email Form -->
        <form @submit.prevent="handleSubmit" class="max-w-xl mx-auto">
          <div class="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div class="flex-1">
              <label for="newsletter-email" class="sr-only">Email address</label>
              <input
                id="newsletter-email"
                v-model="email"
                type="email"
                required
                :placeholder="$t('newsletter.placeholder') || 'Your email address'"
                class="w-full px-5 py-4 bg-white text-luxury-black rounded-sm focus:outline-none focus:ring-2 focus:ring-luxury-wine-red transition-shadow text-base"
                :class="{ 'ring-2 ring-red-500': error }"
                :disabled="isSubmitting || isSuccess"
              />
            </div>

            <button
              type="submit"
              :disabled="isSubmitting || isSuccess"
              class="luxury-btn bg-luxury-wine-red hover:bg-luxury-wine-red/90 text-white px-8 py-4 rounded-sm font-semibold uppercase tracking-wider transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed min-h-[56px] flex items-center justify-center"
            >
              <span v-if="!isSubmitting && !isSuccess">
                {{ $t('newsletter.cta') || 'Join' }}
              </span>
              <span v-else-if="isSubmitting" class="flex items-center gap-2">
                <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ $t('newsletter.submitting') || 'Joining...' }}
              </span>
              <span v-else class="flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                {{ $t('newsletter.success') || 'Subscribed!' }}
              </span>
            </button>
          </div>

          <!-- Error Message -->
          <p v-if="error" class="mt-3 text-sm text-red-400">
            {{ error }}
          </p>

          <!-- Success Message -->
          <p v-if="isSuccess" class="mt-4 text-sm text-luxury-cream/80">
            {{ $t('newsletter.success_message') || 'Welcome to our community! Check your inbox for a special welcome gift.' }}
          </p>
        </form>

        <!-- Benefits -->
        <div class="mt-8 md:mt-10 flex flex-wrap items-center justify-center gap-4 md:gap-8 text-xs sm:text-sm text-luxury-cream/60 uppercase tracking-wider">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-luxury-wine-red" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
            <span>{{ $t('newsletter.benefit1') || 'Exclusive Releases' }}</span>
          </div>

          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-luxury-wine-red" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
            <span>{{ $t('newsletter.benefit2') || 'Insider Stories' }}</span>
          </div>

          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-luxury-wine-red" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
            <span>{{ $t('newsletter.benefit3') || 'Special Perks' }}</span>
          </div>
        </div>

        <!-- Privacy Note -->
        <p class="mt-6 text-xs text-luxury-cream/40">
          {{ $t('newsletter.privacy') || 'We respect your privacy. Unsubscribe at any time.' }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const email = ref('')
const isSubmitting = ref(false)
const isSuccess = ref(false)
const error = ref('')

const handleSubmit = async () => {
  error.value = ''

  // Basic validation
  if (!email.value || !email.value.includes('@')) {
    error.value = 'Please enter a valid email address'
    return
  }

  isSubmitting.value = true

  try {
    // TODO: Replace with actual newsletter API endpoint
    const response = await $fetch('/api/newsletter/subscribe', {
      method: 'POST',
      body: {
        email: email.value
      }
    })

    isSuccess.value = true
    email.value = ''

    // Reset success state after 5 seconds
    setTimeout(() => {
      isSuccess.value = false
    }, 5000)
  } catch (err: any) {
    error.value = err.data?.message || 'Something went wrong. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
/* Input autofill styling */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus {
  -webkit-box-shadow: 0 0 0 1000px white inset;
  -webkit-text-fill-color: var(--luxury-black);
}

input::placeholder {
  color: rgba(139, 69, 19, 0.4);
}

/* Prevent zoom on mobile input focus */
@media screen and (max-width: 640px) {
  input[type="email"] {
    font-size: 16px;
  }
}
</style>
