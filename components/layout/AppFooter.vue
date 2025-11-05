<template>
  <footer class="bg-gray-900 text-white">
    <div class="container py-12">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <!-- About Section -->
        <div>
          <h3 class="text-lg font-semibold mb-4">Moldova Direct</h3>
          <p class="text-gray-400 text-sm">
            {{ $t('footer.info.about') }}
          </p>
          <!-- Trust badges -->
          <div class="mt-6 flex flex-wrap gap-3">
            <div class="flex items-center gap-2 text-gray-400 text-xs">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>{{ $t('footer.trust.secure') || 'Secure Payments' }}</span>
            </div>
            <div class="flex items-center gap-2 text-gray-400 text-xs">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{{ $t('footer.trust.quality') || 'Quality Guaranteed' }}</span>
            </div>
          </div>
        </div>
        
        <!-- Information -->
        <div>
          <h3 class="text-lg font-semibold mb-4">{{ $t('footer.info.title') }}</h3>
          <ul class="space-y-2">
            <li>
              <NuxtLink :to="localePath('/about')" class="text-gray-400 hover:text-white transition-colors text-sm">
                {{ $t('footer.info.about') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink :to="localePath('/terms')" class="text-gray-400 hover:text-white transition-colors text-sm">
                {{ $t('footer.info.terms') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink :to="localePath('/privacy')" class="text-gray-400 hover:text-white transition-colors text-sm">
                {{ $t('footer.info.privacy') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink :to="localePath('/shipping')" class="text-gray-400 hover:text-white transition-colors text-sm">
                {{ $t('footer.info.shipping') }}
              </NuxtLink>
            </li>
          </ul>
        </div>
        
        <!-- Help -->
        <div>
          <h3 class="text-lg font-semibold mb-4">{{ $t('footer.help.title') }}</h3>
          <ul class="space-y-2">
            <li>
              <NuxtLink :to="localePath('/contact')" class="text-gray-400 hover:text-white transition-colors text-sm">
                {{ $t('footer.help.contact') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink :to="localePath('/faq')" class="text-gray-400 hover:text-white transition-colors text-sm">
                {{ $t('footer.help.faq') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink :to="localePath('/returns')" class="text-gray-400 hover:text-white transition-colors text-sm">
                {{ $t('footer.help.returns') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink :to="localePath('/track-order')" class="text-gray-400 hover:text-white transition-colors text-sm">
                {{ $t('footer.help.track') }}
              </NuxtLink>
            </li>
          </ul>
        </div>
        
        <!-- Newsletter -->
        <div>
          <h3 class="text-lg font-semibold mb-4">{{ $t('footer.newsletter.title') }}</h3>
          <p class="text-gray-400 text-sm mb-4">
            {{ $t('footer.newsletter.description') }}
          </p>
          <form @submit.prevent="subscribeNewsletter" class="flex flex-col space-y-2">
            <input
              v-model="email"
              type="email"
              :placeholder="$t('footer.newsletter.placeholder')"
              :disabled="isSubmitting"
              class="px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              required
              aria-label="Email address"
            >
            <Button
              type="submit"
              :disabled="isSubmitting"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="!isSubmitting">{{ $t('footer.newsletter.button') }}</span>
              <span v-else class="flex items-center justify-center gap-2">
                <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ $t('footer.newsletter.subscribing') || 'Subscribing...' }}
              </span>
            </Button>
          </form>
        </div>
      </div>
      
      <!-- Copyright -->
      <div class="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
        {{ $t('footer.copyright') }}
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'

const localePath = useLocalePath()
const { t } = useI18n()
const toast = useToast()
const email = ref('')
const isSubmitting = ref(false)

const subscribeNewsletter = async () => {
  if (!email.value || isSubmitting.value) return

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    toast.error(
      t('footer.newsletter.error.title') || 'Invalid email',
      t('footer.newsletter.error.invalidEmail') || 'Please enter a valid email address'
    )
    return
  }

  isSubmitting.value = true

  try {
    // TODO: Implement actual newsletter subscription API call
    // Simulating API call for now
    await new Promise(resolve => setTimeout(resolve, 500))

    toast.success(
      t('footer.newsletter.success.title') || 'Subscribed!',
      t('footer.newsletter.success.message') || `You've been subscribed to our newsletter at ${email.value}`
    )
    email.value = ''
  } catch (error) {
    toast.error(
      t('footer.newsletter.error.title') || 'Subscription failed',
      t('footer.newsletter.error.message') || 'Something went wrong. Please try again later.'
    )
  } finally {
    isSubmitting.value = false
  }
}
</script>