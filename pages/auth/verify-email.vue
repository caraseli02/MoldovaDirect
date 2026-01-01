import type { SupabaseClient } from '@supabase/supabase-js'
<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-br from-[var(--md-cream)] via-[var(--md-cream-light)] to-[var(--md-cream-dark)] dark:from-[var(--md-charcoal)] dark:via-[var(--md-charcoal-light)] dark:to-[var(--md-black)]">
    <div class="flex-1 flex items-center justify-center px-6 py-8 sm:px-8 lg:px-12">
      <div class="w-full max-w-sm sm:max-w-md space-y-6 sm:space-y-8">
        <!-- Logo/Brand area -->
        <div class="text-center space-y-2">
          <div class="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-[var(--md-wine-muted)] dark:bg-[var(--md-wine)]/20 rounded-2xl mb-4">
            <svg
              class="w-10 h-10 sm:w-12 sm:h-12 text-[var(--md-wine)] dark:text-[var(--md-gold)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 class="font-[family-name:var(--md-font-serif)] text-2xl sm:text-3xl font-normal text-[var(--md-charcoal)] dark:text-[var(--md-cream)]">
            {{ $t('auth.emailVerification') }}
          </h2>
        </div>

        <!-- Card container -->
        <div class="bg-[var(--md-cream-light)] dark:bg-[var(--md-charcoal-light)] rounded-2xl shadow-xl dark:shadow-none dark:border dark:border-[var(--md-gray-700)] p-6 sm:p-8">
          <div
            v-if="loading"
            class="text-center space-y-4"
          >
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--md-wine)] dark:border-[var(--md-gold)]"></div>
            <p class="text-sm text-[var(--md-gray-600)] dark:text-[var(--md-gray-400)]">
              {{ $t('auth.verifying') }}...
            </p>
          </div>

          <div
            v-else-if="success"
            class="space-y-4"
          >
            <div class="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4">
              <div class="flex items-start">
                <svg
                  class="h-5 w-5 text-green-500 dark:text-green-400 mt-0.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-green-800 dark:text-green-300">
                    {{ $t('auth.emailVerified') }}
                  </h3>
                  <p class="mt-1 text-sm text-green-700 dark:text-green-400">
                    {{ message }}
                  </p>
                </div>
              </div>
            </div>
            <div class="text-center pt-2">
              <NuxtLink
                :to="localePath('/auth/login')"
                class="inline-flex items-center text-sm font-medium text-[var(--md-wine)] hover:text-[var(--md-wine-light)] dark:text-[var(--md-gold)] dark:hover:text-[var(--md-gold-light)] transition-colors"
              >
                {{ $t('auth.signIn') }} →
              </NuxtLink>
            </div>
          </div>

          <div
            v-else-if="error"
            class="space-y-4"
          >
            <div class="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
              <div class="flex items-start">
                <svg
                  class="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clip-rule="evenodd"
                  />
                </svg>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-red-800 dark:text-red-300">
                    {{ $t('auth.verificationFailed') }}
                  </h3>
                  <p class="mt-1 text-sm text-red-700 dark:text-red-400">
                    {{ error }}
                  </p>
                </div>
              </div>
            </div>

            <div class="space-y-3">
              <div class="flex space-x-2">
                <input
                  v-model="email"
                  type="email"
                  :placeholder="$t('auth.email')"
                  class="flex-1 px-4 py-2 text-sm border-2 border-[var(--md-gray-200)] dark:border-[var(--md-gray-600)] rounded-xl text-[var(--md-charcoal)] dark:text-[var(--md-cream)] placeholder:text-[var(--md-gray-500)] focus:border-[var(--md-gold)] dark:focus:border-[var(--md-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--md-gold)]/20 transition-all bg-white dark:bg-[var(--md-charcoal)]"
                />
                <UiButton
                  :disabled="resendLoading || !email"
                  size="sm"
                  variant="outline"
                  @click="resendVerification"
                >
                  <commonIcon
                    v-if="resendLoading"
                    name="lucide:loader-2"
                    class="mr-1 h-3 w-3 animate-spin"
                  />
                  {{ resendLoading ? $t('common.loading') : $t('auth.resendVerification') }}
                </UiButton>
              </div>
              <NuxtLink
                :to="localePath('/auth/login')"
                class="inline-flex items-center text-sm font-medium text-[var(--md-wine)] hover:text-[var(--md-wine-light)] dark:text-[var(--md-gold)] dark:hover:text-[var(--md-gold-light)] transition-colors"
              >
                <svg
                  class="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                {{ $t('auth.backToLogin') }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const route = useRoute()
const { t } = useI18n()
const localePath = useLocalePath()

const loading = ref(true)
const success = ref(false)
const error = ref('')
const message = ref('')
const resendLoading = ref(false)
const email = ref('')

const verifyEmail = async () => {
  try {
    // Check if we have verification tokens in the URL
    const hash = window.location.hash
    if (hash) {
      // Supabase will automatically handle email verification from hash
      // Check if user is now authenticated
      await new Promise(resolve => setTimeout(resolve, 1000)) // Wait a bit for auth to process

      if (user.value && user.value.email_confirmed_at) {
        success.value = true
        message.value = t('auth.emailVerified')
      }
      else {
        throw new Error('Verification failed')
      }
    }
    else {
      throw new Error('Missing verification link')
    }
  }
  catch (err: any) {
    error.value = err.message || t('auth.verificationError')
  }
  finally {
    loading.value = false
  }
}

const resendVerification = async () => {
  if (!email.value) {
    error.value = t('auth.emailRequired')
    return
  }

  resendLoading.value = true
  try {
    const { error: authError } = await supabase.auth.resend({
      type: 'signup',
      email: email.value,
      options: {
        emailRedirectTo: `${window.location.origin}${localePath('/auth/verify-email')}`,
      },
    })

    if (authError) {
      throw authError
    }

    message.value = t('auth.verificationResent')
    error.value = ''
  }
  catch (err: any) {
    error.value = err.message || t('auth.resendError')
  }
  finally {
    resendLoading.value = false
  }
}

onMounted(() => {
  // Get email from query params if available
  const emailParam = route.query.email as string
  if (emailParam) {
    email.value = emailParam
  }

  verifyEmail()
})

useHead({
  title: t('auth.emailVerification'),
})
</script>
