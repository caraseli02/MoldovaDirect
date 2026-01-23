<template>
  <footer class="bg-gray-900 text-white">
    <div class="container py-12">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <!-- About Section -->
        <div>
          <h3 class="text-lg font-semibold mb-4">
            Moldova Direct
          </h3>
          <p class="text-gray-400 text-sm">
            {{ $t('footer.info.about') }}
          </p>
          <!-- Trust & Security Badges -->
          <div class="mt-6">
            <p class="text-xs text-gray-400 mb-3">
              {{ $t('footer.trust.title') }}
            </p>
            <div class="flex flex-wrap gap-3">
              <!-- SSL Secure Badge -->
              <div class="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-lg">
                <svg
                  class="h-5 w-5 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <span class="text-xs text-gray-300">{{ $t('footer.trust.sslSecure') }}</span>
              </div>
              <!-- Secure Payment Badge -->
              <div class="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-lg">
                <svg
                  class="h-5 w-5 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <span class="text-xs text-gray-300">{{ $t('footer.trust.securePayment') }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Information -->
        <div>
          <h3 class="text-lg font-semibold mb-4">
            {{ $t('footer.info.title') }}
          </h3>
          <ul class="space-y-2">
            <li>
              <NuxtLink
                :to="localePath('/about')"
                class="text-gray-400 hover:text-white transition-colors text-sm"
              >
                {{ $t('footer.info.about') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                :to="localePath('/terms')"
                class="text-gray-400 hover:text-white transition-colors text-sm"
              >
                {{ $t('footer.info.terms') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                :to="localePath('/privacy')"
                class="text-gray-400 hover:text-white transition-colors text-sm"
              >
                {{ $t('footer.info.privacy') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                :to="localePath('/shipping')"
                class="text-gray-400 hover:text-white transition-colors text-sm"
              >
                {{ $t('footer.info.shipping') }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Help -->
        <div>
          <h3 class="text-lg font-semibold mb-4">
            {{ $t('footer.help.title') }}
          </h3>
          <ul class="space-y-2">
            <li>
              <NuxtLink
                :to="localePath('/contact')"
                class="text-gray-400 hover:text-white transition-colors text-sm"
              >
                {{ $t('footer.help.contact') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                :to="localePath('/faq')"
                class="text-gray-400 hover:text-white transition-colors text-sm"
              >
                {{ $t('footer.help.faq') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                :to="localePath('/returns')"
                class="text-gray-400 hover:text-white transition-colors text-sm"
              >
                {{ $t('footer.help.returns') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                :to="localePath('/track-order')"
                class="text-gray-400 hover:text-white transition-colors text-sm"
              >
                {{ $t('footer.help.track') }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Newsletter -->
        <div>
          <h3 class="text-lg font-semibold mb-4">
            {{ $t('footer.newsletter.title') }}
          </h3>
          <p class="text-gray-400 text-sm mb-4">
            {{ $t('footer.newsletter.description') }}
          </p>
          <form
            class="flex flex-col space-y-2"
            @submit.prevent="subscribeNewsletter"
          >
            <UiInput
              v-model="email"
              type="email"
              :placeholder="$t('footer.newsletter.placeholder')"
              :disabled="isSubmitting"
              :aria-label="$t('footer.newsletter.placeholder')"
              required
            />
            <UiButton
              type="submit"
              :disabled="isSubmitting"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="!isSubmitting">{{ isSubmitting ? $t('footer.newsletter.submitting') : $t('footer.newsletter.button') }}</span>
              <span
                v-else
                class="flex items-center justify-center gap-2"
              >
                <svg
                  class="animate-spin h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  />
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                {{ $t('footer.newsletter.subscribing') || 'Subscribing...' }}
              </span>
            </UiButton>
          </form>
        </div>
      </div>

      <!-- Payment Methods -->
      <div class="mt-12 pt-8 border-t border-gray-800">
        <div class="flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="text-center md:text-left">
            <p class="text-xs text-gray-400 mb-2">
              {{ $t('footer.payment.title') }}
            </p>
            <div class="flex gap-2 items-center">
              <!-- Visa -->
              <div class="h-8 px-3 bg-white rounded flex items-center justify-center">
                <svg
                  class="h-5"
                  viewBox="0 0 48 32"
                  fill="none"
                >
                  <rect
                    width="48"
                    height="32"
                    rx="4"
                    fill="white"
                  />
                  <path
                    d="M20.925 11.088h-3.085l-1.93 11.825h3.086l1.929-11.825zm8.696 7.652l1.623-4.47.934 4.47h-2.557zm3.436 4.173h2.852l-2.49-11.825h-2.631c-.592 0-1.091.344-1.312.874l-4.623 10.951h3.243l.645-1.783h3.965l.351 1.783zm-7.863-3.85c.013-3.117-4.31-3.289-4.281-4.682.009-.423.413-.874 1.297-.989.437-.057 1.643-.101 3.01.527l.536-2.5c-.735-.267-1.682-.523-2.858-.523-3.022 0-5.15 1.606-5.167 3.907-.019 1.701 1.518 2.651 2.677 3.216 1.19.578 1.59.949 1.585 1.466-.008.791-.948 1.141-1.825 1.155-1.533.024-2.422-.414-3.131-.745l-.553 2.582c.713.327 2.03.612 3.395.626 3.215 0 5.318-1.588 5.315-4.04zm-13.282-7.975l-4.975 11.825h-3.264l-2.443-9.468c-.148-.581-.277-.794-.727-.94-.735-.29-1.949-.562-3.014-.731l.073-.349h5.197c.662 0 1.257.441 1.408 1.204l1.286 6.83 3.175-8.034h3.284z"
                    fill="#1434CB"
                  />
                </svg>
              </div>
              <!-- Mastercard -->
              <div class="h-8 px-3 bg-white rounded flex items-center justify-center">
                <svg
                  class="h-5"
                  viewBox="0 0 48 32"
                  fill="none"
                >
                  <rect
                    width="48"
                    height="32"
                    rx="4"
                    fill="white"
                  />
                  <circle
                    cx="18"
                    cy="16"
                    r="8"
                    fill="#EB001B"
                  />
                  <circle
                    cx="30"
                    cy="16"
                    r="8"
                    fill="#F79E1B"
                  />
                  <path
                    d="M24 9.6c-1.64 1.52-2.67 3.69-2.67 6.12s1.03 4.6 2.67 6.12c1.64-1.52 2.67-3.69 2.67-6.12s-1.03-4.6-2.67-6.12z"
                    fill="#FF5F00"
                  />
                </svg>
              </div>
              <!-- PayPal -->
              <div class="h-8 px-3 bg-white rounded flex items-center justify-center">
                <svg
                  class="h-5"
                  viewBox="0 0 100 32"
                  fill="none"
                >
                  <path
                    d="M35.8 6.3c1.1 0 2.1.2 2.9.6.8.4 1.4 1 1.8 1.7.4.7.6 1.6.6 2.6 0 1.3-.3 2.4-.9 3.3-.6.9-1.4 1.6-2.4 2.1-1 .5-2.1.7-3.3.7h-1.7l-.9 4.4h-2.4l2.3-10.9c.2-.8.7-1.5 1.4-2 .7-.5 1.5-.8 2.5-.8h2.1zm-1.3 8.6c.7 0 1.3-.2 1.8-.5.5-.3.7-.8.7-1.4 0-.4-.1-.7-.4-.9-.3-.2-.7-.3-1.1-.3h-1.4l-.7 3.1h1.1z"
                    fill="#003087"
                  />
                  <path
                    d="M47.8 11.2c.9 0 1.7.3 2.3.8.6.5.9 1.3.9 2.2 0 .6-.1 1.2-.4 1.8-.3.6-.7 1.1-1.3 1.5-.6.4-1.2.6-2 .6-.9 0-1.7-.3-2.3-.8-.6-.5-.9-1.3-.9-2.2 0-.6.1-1.2.4-1.8.3-.6.7-1.1 1.3-1.5.6-.4 1.2-.6 2-.6zm-.8 5.5c.5 0 .9-.2 1.2-.5.3-.3.5-.8.5-1.3 0-.4-.1-.7-.3-.9-.2-.2-.5-.3-.8-.3-.5 0-.9.2-1.2.5-.3.3-.5.8-.5 1.3 0 .4.1.7.3.9.2.2.5.3.8.3z"
                    fill="#003087"
                  />
                  <path
                    d="M53.8 11.4l-.3 1.5h.1c.3-.5.7-.9 1.1-1.2.4-.3.9-.4 1.5-.4.2 0 .4 0 .6.1l-.5 2.3c-.2 0-.4-.1-.6-.1-.6 0-1.1.2-1.5.5-.4.3-.6.8-.7 1.4l-.8 3.8H51l1.5-7.9h1.3z"
                    fill="#003087"
                  />
                  <path
                    d="M62.1 11.2c.9 0 1.6.2 2.1.7.5.5.7 1.1.7 1.9 0 .3 0 .6-.1.9h-4.9c0 .5.2.9.5 1.1.3.2.7.4 1.2.4.4 0 .8-.1 1.1-.2.3-.1.7-.3 1-.5l.7 1.5c-.4.3-.9.5-1.4.7-.5.2-1 .2-1.6.2-.8 0-1.5-.1-2.1-.4-.6-.3-1.1-.7-1.4-1.2-.3-.5-.5-1.1-.5-1.8 0-.6.1-1.2.4-1.8.3-.6.7-1.1 1.3-1.5.6-.4 1.2-.6 2-.6zm1.1 2.9c0-.4-.1-.7-.3-.9-.2-.2-.5-.3-.9-.3-.4 0-.8.1-1.1.4-.3.3-.5.6-.6 1h2.9v-.2z"
                    fill="#003087"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div class="text-center text-gray-400 text-sm">
            {{ $t('footer.copyright') }}
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { toast } from 'vue-sonner'

const { t } = useI18n()
const localePath = useLocalePath()
const email = ref('')
const isSubmitting = ref(false)

const subscribeNewsletter = async () => {
  if (!email.value || isSubmitting.value) return

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    toast.error(
      t('footer.newsletter.error.title') || 'Invalid email',
      {
        description: t('footer.newsletter.error.invalidEmail') || 'Please enter a valid email address',
      },
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
      {
        description: t('footer.newsletter.success.message') || `You've been subscribed to our newsletter at ${email.value}`,
      },
    )
    email.value = ''
  }
  catch (error: unknown) {
    console.error('Newsletter subscription failed:', error)
    toast.error(
      t('footer.newsletter.error.title') || 'Subscription failed',
      {
        description: t('footer.newsletter.error.message') || 'Something went wrong. Please try again later.',
      },
    )
  }
  finally {
    isSubmitting.value = false
  }
}
</script>
