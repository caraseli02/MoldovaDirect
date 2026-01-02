<template>
  <div class="min-h-screen flex items-center justify-center bg-[var(--md-cream)] dark:bg-[var(--md-charcoal)] py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-[var(--md-wine-muted)] dark:bg-[var(--md-wine)]/20 rounded-2xl mb-4">
          <svg
            v-if="loading"
            class="w-10 h-10 sm:w-12 sm:h-12 text-[var(--md-wine)] dark:text-[var(--md-gold)] animate-spin"
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
          <svg
            v-else-if="success"
            class="w-10 h-10 sm:w-12 sm:h-12 text-green-500 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <svg
            v-else
            class="w-10 h-10 sm:w-12 sm:h-12 text-red-500 dark:text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 class="font-[family-name:var(--md-font-serif)] text-2xl sm:text-3xl font-normal text-[var(--md-charcoal)] dark:text-[var(--md-cream)]">
          {{ loading ? $t('auth.confirmingAccount') : (success ? $t('auth.accountConfirmed') : $t('auth.confirmationFailed')) }}
        </h2>
      </div>

      <div class="bg-[var(--md-cream-light)] dark:bg-[var(--md-charcoal-light)] rounded-2xl shadow-xl dark:shadow-none dark:border dark:border-[var(--md-gray-700)] p-6 sm:p-8">
        <div
          v-if="loading"
          class="text-center space-y-4"
        >
          <p class="text-sm text-[var(--md-gray-600)] dark:text-[var(--md-gray-400)]">
            {{ $t('auth.processing') }}
          </p>
          <div class="text-xs text-[var(--md-gray-500)]">
            {{ $t('auth.pleaseWait') }}
          </div>
        </div>

        <div
          v-else-if="success"
          class="space-y-4"
        >
          <div class="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4">
            <p class="text-sm text-green-800 dark:text-green-300">
              {{ $t('auth.magicLinkSuccess') }}
            </p>
            <p class="mt-2 text-xs text-green-700 dark:text-green-400">
              {{ $t('auth.redirectingToAccount') }}
            </p>
          </div>
        </div>

        <div
          v-else-if="error"
          class="space-y-4"
        >
          <div class="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
            <h3 class="text-sm font-medium text-red-800 dark:text-red-300">
              {{ errorTitle }}
            </h3>
            <p class="mt-2 text-sm text-red-700 dark:text-red-400">
              {{ error }}
            </p>
          </div>

          <div class="flex flex-col sm:flex-row gap-3">
            <NuxtLink
              :to="localePath('/auth/login')"
              class="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-[var(--md-wine-btn)] hover:bg-[var(--md-wine-btn-hover)] shadow-[var(--md-wine-shadow)] transition-colors"
            >
              {{ $t('auth.backToLogin') }}
            </NuxtLink>
            <button
              v-if="canRetry"
              class="flex-1 inline-flex items-center justify-center px-4 py-2 border-2 border-[var(--md-gray-300)] dark:border-[var(--md-gray-600)] text-sm font-medium rounded-xl text-[var(--md-charcoal)] dark:text-[var(--md-cream)] bg-white dark:bg-[var(--md-charcoal)] hover:bg-[var(--md-cream)] dark:hover:bg-[var(--md-charcoal-light)] transition-colors"
              @click="retryConfirmation"
            >
              {{ $t('auth.retry') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AuthError } from '@supabase/supabase-js'

// Apply guest middleware
definePageMeta({
  middleware: 'guest',
})

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const router = useRouter()

const loading = ref(true)
const success = ref(false)
const error = ref('')
const errorTitle = ref('')
const canRetry = ref(false)

/**
 * Handle magic link confirmation
 * This processes the token from the URL and verifies it with Supabase
 */
const handleAuthCallback = async () => {
  try {
    loading.value = true
    error.value = ''

    // Check if we have the required token parameters in the URL
    // Supabase sends: token_hash, type, and optionally access_token/refresh_token in hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const queryParams = route.query

    // Get token type - should be 'magiclink' or 'email'
    const type = (queryParams.type as string) || hashParams.get('type') || ''
    const tokenHash = (queryParams.token_hash as string) || hashParams.get('token_hash') || ''
    const accessToken = hashParams.get('access_token') || ''
    const refreshToken = hashParams.get('refresh_token') || ''

    // If we have access_token in hash, Supabase has already processed the callback
    if (accessToken && refreshToken) {
      // Session is already established by Supabase client
      // Wait a moment for the user state to update
      await new Promise(resolve => setTimeout(resolve, 500))

      if (user.value) {
        success.value = true
        await handleSuccessfulAuth()
        return
      }
    }

    // If we have token_hash, we need to verify it
    if (tokenHash && (type === 'magiclink' || type === 'email')) {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: type as 'magiclink' | 'email',
      })

      if (verifyError) {
        throw verifyError
      }

      if (data?.user) {
        success.value = true
        await handleSuccessfulAuth()
        return
      }
    }

    // If we reach here, check if user is already authenticated
    // (e.g., they clicked the link again after already confirming)
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (user.value) {
      success.value = true
      await handleSuccessfulAuth()
      return
    }

    // No valid token found
    throw new Error('Invalid or missing authentication token')
  }
  catch (err: unknown) {
    handleAuthError(err as Error)
  }
  finally {
    loading.value = false
  }
}

/**
 * Handle successful authentication
 */
const handleSuccessfulAuth = async () => {
  const { handleAuthRedirect } = await import('~/utils/authRedirect')
  const redirect = route.query.redirect as string

  // Short delay to show success message
  await new Promise(resolve => setTimeout(resolve, 1500))

  // Redirect to intended destination or account page
  await handleAuthRedirect(redirect, user.value, supabase, localePath, navigateTo)
}

/**
 * Handle authentication errors with proper user messaging
 */
const handleAuthError = (err: AuthError | Error) => {
  const errorMessage = err.message.toLowerCase()

  // Token expired
  if (errorMessage.includes('expired') || errorMessage.includes('token')) {
    errorTitle.value = t('auth.errors.linkExpired')
    error.value = t('auth.errors.linkExpiredMessage')
    canRetry.value = false
  }
  // Token already used
  else if (errorMessage.includes('already') || errorMessage.includes('used')) {
    errorTitle.value = t('auth.errors.linkAlreadyUsed')
    error.value = t('auth.errors.linkAlreadyUsedMessage')
    canRetry.value = false
  }
  // Invalid token
  else if (errorMessage.includes('invalid')) {
    errorTitle.value = t('auth.errors.invalidLink')
    error.value = t('auth.errors.invalidLinkMessage')
    canRetry.value = false
  }
  // Network or other errors (can retry)
  else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    errorTitle.value = t('auth.errors.networkError')
    error.value = t('auth.errors.networkErrorMessage')
    canRetry.value = true
  }
  // Generic error
  else {
    errorTitle.value = t('auth.confirmationFailed')
    error.value = err.message || t('auth.confirmationError')
    canRetry.value = true
  }
}

/**
 * Retry confirmation (for network errors)
 */
const retryConfirmation = () => {
  router.go(0) // Reload the page
}

onMounted(() => {
  handleAuthCallback()
})

useHead({
  title: t('auth.confirmingAccount'),
})
</script>
