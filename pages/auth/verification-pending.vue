<template>
  <div class="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
    <!-- Mobile-optimized container -->
    <div class="flex-1 flex items-center justify-center px-6 py-8 sm:px-8 lg:px-12">
      <div class="w-full max-w-sm sm:max-w-md space-y-6 sm:space-y-8">
        <!-- Logo/Brand area -->
        <div class="text-center space-y-2">
          <div class="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-primary-100 dark:bg-primary-900/30 rounded-2xl mb-4">
            <svg
              class="w-10 h-10 sm:w-12 sm:h-12 text-primary-600 dark:text-primary-400"
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
          <Transition name="slide-fade">
            <Alert
              v-if="successMessage"
              class="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
            >
              <CheckCircle2
                class="h-5 w-5 text-green-500 dark:text-green-400"
                aria-hidden="true"
              />
              <AlertDescription class="text-sm text-green-800 dark:text-green-300">
                {{ successMessage }}
              </AlertDescription>
              <Button
                variant="ghost"
                size="icon"
                class="absolute right-2 top-2 text-green-500 hover:text-green-600 dark:text-green-300 dark:hover:text-green-200"
                @click="successMessage = null"
              >
                <X
                  class="h-4 w-4"
                  aria-hidden="true"
                />
                <span class="sr-only">{{ $t('common.dismiss') }}</span>
              </Button>
            </Alert>
          </Transition>

          <Transition name="slide-fade">
            <Alert
              v-if="errorMessage"
              variant="destructive"
              class="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
            >
              <AlertCircle
                class="h-5 w-5 text-red-500 dark:text-red-400"
                aria-hidden="true"
              />
              <div class="flex flex-col gap-2">
                <AlertDescription class="text-sm text-red-800 dark:text-red-300">
                  {{ errorMessage }}
                </AlertDescription>
                <Button
                  variant="link"
                  size="sm"
                  class="p-0 text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300"
                  @click="handleResendVerification"
                >
                  {{ $t('auth.buttons.tryAgain') }}
                </Button>
              </div>
              <Button
                variant="ghost"
                size="icon"
                class="absolute right-2 top-2 text-red-500 hover:text-red-600 dark:text-red-300 dark:hover:text-red-200"
                @click="errorMessage = null"
              >
                <X
                  class="h-4 w-4"
                  aria-hidden="true"
                />
                <span class="sr-only">{{ $t('common.dismiss') }}</span>
              </Button>
            </Alert>
          </Transition>

          <div class="space-y-5">
            <!-- Email display -->
            <div
              v-if="email"
              class="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ $t('auth.messages.checkEmail') }}
              </p>
              <p class="font-medium text-gray-900 dark:text-white mt-1">
                {{ email }}
              </p>
            </div>

            <!-- Resend verification form -->
            <form
              class="space-y-4"
              @submit.prevent="handleResendVerification"
            >
              <div
                v-if="!email"
                class="space-y-2"
              >
                <Label
                  for="email"
                  class="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {{ $t('auth.labels.email') }}
                </Label>
                <Input
                  id="email"
                  v-model="form.email"
                  name="email"
                  type="email"
                  autocomplete="email"
                  required
                  :placeholder="$t('auth.placeholders.email')"
                  class="h-11 border-2 border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <!-- Resend button -->
              <UiButton
                type="submit"
                :disabled="loading || !canResend"
                class="w-full"
                size="lg"
              >
                <commonIcon
                  v-if="loading"
                  name="lucide:loader-2"
                  class="mr-2 h-5 w-5 animate-spin"
                />
                <commonIcon
                  v-else
                  name="lucide:mail"
                  class="mr-2 h-5 w-5"
                />
                {{ loading ? $t('auth.messages.processing') : $t('auth.buttons.resendVerification') }}
              </UiButton>

              <!-- Rate limiting info -->
              <div
                v-if="!canResend && cooldownTime > 0"
                class="text-center text-sm text-gray-500 dark:text-gray-400"
              >
                {{ $t('auth.messages.resendAvailable') }}
                <br />
                {{ $t('common.retry') }} {{ $t('common.in') }} {{ cooldownTime }}s
              </div>
            </form>

            <!-- Back to login link -->
            <div class="text-center pt-4">
              <NuxtLink
                :to="localePath('/auth/login')"
                class="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle2, X } from 'lucide-vue-next'
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
  middleware: 'guest',
})

const supabase = useSupabaseClient()
const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const requestURL = useRequestURL()

// Use new authentication message system
const {
  createErrorMessage,
  getVerificationPendingMessage,
  translateAuthError,
} = useAuthMessages()

// Use validation system
const { validateEmail } = useAuthValidation()

const form = ref({
  email: '',
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
        emailRedirectTo: `${requestURL.origin}${localePath('/auth/verify-email')}`,
      },
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
  }
  catch (err: unknown) {
    const errorMsg = createErrorMessage(getErrorMessage(err), 'verify', true)
    errorMessage.value = errorMsg.message
  }
  finally {
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
    // Show the verification pending message - message is used for UI display
    getVerificationPendingMessage(emailParam)
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
  title: t('auth.emailVerification'),
})
</script>
