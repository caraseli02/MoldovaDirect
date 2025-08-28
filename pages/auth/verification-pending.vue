<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
    <!-- Mobile-optimized container -->
    <div class="flex-1 flex items-center justify-center px-6 py-8 sm:px-8 lg:px-12">
      <div class="w-full max-w-sm sm:max-w-md space-y-6 sm:space-y-8">
        <!-- Logo/Brand area -->
        <div class="text-center space-y-2">
          <div class="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-primary-100 dark:bg-primary-900/30 rounded-2xl mb-4">
            <svg class="w-10 h-10 sm:w-12 sm:h-12 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
          </div>
          <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {{ $t('auth.emailVerification') }}
          </h2>
          <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400 px-4">
            {{ $t('auth.messages.verificationPending') }}
          </p>
        </div>
      
        <!-- Card container -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8">
          <!-- Message display using new components -->
          <AuthSuccessMessage
            v-if="successMessage"
            :message="successMessage"
            context="verify"
            :dismissible="true"
            @dismiss="successMessage = null"
          />
          
          <AuthErrorMessage
            v-if="errorMessage"
            :error="errorMessage"
            context="verify"
            :dismissible="true"
            :show-retry="true"
            @dismiss="errorMessage = null"
            @retry="handleResendVerification"
          />

          <div class="space-y-5">
            <!-- Email display -->
            <div v-if="email" class="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ $t('auth.messages.checkEmail') }}
              </p>
              <p class="font-medium text-gray-900 dark:text-white mt-1">
                {{ email }}
              </p>
            </div>

            <!-- Resend verification form -->
            <form @submit.prevent="handleResendVerification" class="space-y-4">
              <div v-if="!email" class="relative">
                <input
                  id="email"
                  v-model="form.email"
                  name="email"
                  type="email"
                  autocomplete="email"
                  required
                  class="peer w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-transparent focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none transition-all bg-white dark:bg-gray-700"
                  :placeholder="$t('auth.placeholders.email')"
                >
                <label for="email" class="absolute left-3 -top-2.5 bg-white dark:bg-gray-800 px-2 text-sm text-gray-600 dark:text-gray-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-sm peer-focus:text-primary-600 dark:peer-focus:text-primary-400">
                  {{ $t('auth.labels.email') }}
                </label>
              </div>

              <!-- Resend button -->
              <button
                type="submit"
                :disabled="loading || !canResend"
                class="relative w-full flex justify-center items-center py-3.5 px-4 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              >
                <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                <svg v-if="!loading" class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                {{ loading ? $t('auth.messages.processing') : $t('auth.buttons.resendVerification') }}
              </button>

              <!-- Rate limiting info -->
              <div v-if="!canResend && cooldownTime > 0" class="text-center text-sm text-gray-500 dark:text-gray-400">
                {{ $t('auth.messages.resendAvailable') }}
                <br>
                {{ $t('common.retry') }} {{ $t('common.in') }} {{ cooldownTime }}s
              </div>
            </form>

            <!-- Back to login link -->
            <div class="text-center pt-4">
              <NuxtLink :to="localePath('/auth/login')" class="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                </svg>
                {{ $t('auth.buttons.backToLogin') }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Email verification pending page with comprehensive multi-language support
 * 
 * Requirements addressed:
 * - 1.2: Display verification pending message after successful registration
 * - 2.5, 2.6: Provide resend verification email functionality with rate limiting feedback
 * - 2.7, 2.8: Handle resend success and error states with appropriate messaging
 * - 6.1, 6.2, 6.3: Multi-language support for all messages
 * - 9.1, 9.2: Proper error message display system with user feedback
 */

// Apply guest middleware - redirect authenticated users
definePageMeta({
  middleware: 'guest'
})

const supabase = useSupabaseClient()
const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

// Use new authentication message system
const { 
  createErrorMessage, 
  createSuccessMessage, 
  getVerificationPendingMessage,
  translateAuthError 
} = useAuthMessages()

// Use validation system
const { validateEmail } = useAuthValidation()

const form = ref({
  email: ''
})

const loading = ref(false)
const successMessage = ref<string | null>(null)
const errorMessage = ref<string | null>(null)
const canResend = ref(true)
const cooldownTime = ref(0)
const cooldownInterval = ref<NodeJS.Timeout | null>(null)

// Get email from query params or route state
const email = computed(() => {
  return (route.query.email as string) || form.value.email || ''
})

/**
 * Handle resend verification email with proper error handling and rate limiting
 * Addresses Requirements 2.6, 2.7, 2.8, 6.1, 9.1, 9.2
 */
const handleResendVerification = async () => {
  if (!canResend.value) return
  
  const emailToUse = email.value || form.value.email
  if (!emailToUse) {
    errorMessage.value = translateAuthError('Email is required', 'verify')
    return
  }

  // Validate email format
  const validation = validateEmail(emailToUse)
  if (!validation.isValid) {
    errorMessage.value = validation.errors[0]?.message || translateAuthError('Invalid email', 'verify')
    return
  }

  loading.value = true
  errorMessage.value = null
  successMessage.value = null
  
  try {
    const { error: authError } = await supabase.auth.resend({
      type: 'signup',
      email: emailToUse,
      options: {
        emailRedirectTo: `${window.location.origin}${localePath('/auth/verify-email')}`
      }
    })

    if (authError) {
      throw authError
    }

    // Success - show success message and start cooldown
    successMessage.value = t('auth.success.verificationResent')
    startCooldown()
    
    // Update form email if it was provided via query
    if (!form.value.email && email.value) {
      form.value.email = email.value
    }
    
  } catch (err: any) {
    const errorMsg = createErrorMessage(err, 'verify', true)
    errorMessage.value = errorMsg.message
  } finally {
    loading.value = false
  }
}

/**
 * Start cooldown timer to prevent spam
 * Addresses Requirement 2.6 for rate limiting feedback
 */
const startCooldown = () => {
  canResend.value = false
  cooldownTime.value = 60 // 60 seconds cooldown
  
  cooldownInterval.value = setInterval(() => {
    cooldownTime.value--
    if (cooldownTime.value <= 0) {
      canResend.value = true
      if (cooldownInterval.value) {
        clearInterval(cooldownInterval.value)
        cooldownInterval.value = null
      }
    }
  }, 1000)
}

/**
 * Initialize component state from URL parameters
 */
onMounted(() => {
  // Get email from query params
  const emailParam = route.query.email as string
  if (emailParam) {
    form.value.email = emailParam
  }
  
  // Check if there's a message from the URL
  const messageParam = route.query.message as string
  if (messageParam === 'email-verification-required') {
    // Show the verification pending message
    const message = getVerificationPendingMessage(emailParam)
    // This is an info message, so we don't set it as success or error
  }
})

/**
 * Cleanup intervals on unmount
 */
onUnmounted(() => {
  if (cooldownInterval.value) {
    clearInterval(cooldownInterval.value)
  }
})

useHead({
  title: t('auth.emailVerification')
})
</script>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  transform: translateY(-10px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(10px);
  opacity: 0;
}
</style>