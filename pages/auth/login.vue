<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
    <!-- Mobile-optimized header -->
    <div class="flex-1 flex items-center justify-center px-6 py-8 sm:px-8 lg:px-12">
      <div class="w-full max-w-sm sm:max-w-md space-y-6 sm:space-y-8">
        <!-- Logo/Brand area with better mobile spacing -->
        <div class="text-center space-y-2">
          <div class="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-primary-100 dark:bg-primary-900/30 rounded-2xl mb-4">
            <svg class="w-10 h-10 sm:w-12 sm:h-12 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {{ $t('auth.signIn') }}
          </h2>
          <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            {{ $t('auth.noAccount') }}
            <NuxtLink :to="localePath('/auth/register')" class="font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-300 dark:hover:text-primary-200 transition-colors">
              {{ $t('auth.signUp') }}
            </NuxtLink>
          </p>
        </div>
      
        <!-- Card container for form -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-none dark:border dark:border-gray-700 p-6 sm:p-8">
          <form class="space-y-5" @submit.prevent="handleLogin">
            <!-- Alert messages with improved mobile styling -->
            <Transition name="slide-fade">
              <Alert
                v-if="displayError"
                variant="destructive"
                class="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                data-testid="auth-error"
              >
                <AlertCircle class="h-5 w-5 text-red-500 dark:text-red-400" aria-hidden="true" />
                <AlertDescription class="text-sm text-red-800 dark:text-red-200">
                  {{ displayError }}
                </AlertDescription>
              </Alert>
            </Transition>

            <Transition name="slide-fade">
              <Alert
                v-if="success"
                class="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                data-testid="auth-success"
              >
                <CheckCircle2 class="h-5 w-5 text-green-500 dark:text-green-400" aria-hidden="true" />
                <AlertDescription class="text-sm text-green-800 dark:text-green-300">
                  {{ success }}
                </AlertDescription>
              </Alert>
            </Transition>
        
            <!-- Modern input fields with mobile optimization and accessibility -->
            <div class="space-y-4">
              <div class="space-y-2">
                <Label
                  for="email"
                  class="text-sm font-medium text-gray-700 dark:text-gray-300"
                  :class="{ 'text-red-600 dark:text-red-400': emailError }"
                >
                  {{ $t('auth.email') }}
                </Label>
                <Input
                  id="email"
                  v-model="form.email"
                  name="email"
                  type="email"
                  autocomplete="email"
                  autocapitalize="none"
                  autocorrect="off"
                  spellcheck="false"
                  inputmode="email"
                  required
                  data-testid="email-input"
                  :aria-invalid="emailError ? 'true' : 'false'"
                  :aria-describedby="emailError ? 'email-error' : undefined"
                  :placeholder="$t('auth.email')"
                  class="h-11 border-2 border-gray-200 bg-white text-gray-900 placeholder:text-gray-500 dark:border-gray-500 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-300"
                  :class="{ 'border-red-500 dark:border-red-400': emailError }"
                  @blur="validateEmailField"
                />
                <p v-if="emailError" id="email-error" class="text-sm text-red-600 dark:text-red-400" role="alert">
                  {{ emailError }}
                </p>
              </div>

              <div class="space-y-2">
                <Label
                  for="password"
                  class="text-sm font-medium text-gray-700 dark:text-gray-300"
                  :class="{ 'text-red-600 dark:text-red-400': passwordError }"
                >
                  {{ $t('auth.password') }}
                </Label>
                <div class="relative">
                  <Input
                    id="password"
                    v-model="form.password"
                    name="password"
                    :type="showPassword ? 'text' : 'password'"
                    autocomplete="current-password"
                    autocapitalize="none"
                    autocorrect="off"
                    spellcheck="false"
                    required
                    minlength="8"
                    data-testid="password-input"
                    :aria-invalid="passwordError ? 'true' : 'false'"
                    :aria-describedby="passwordError ? 'password-error' : 'password-toggle-desc'"
                    :placeholder="$t('auth.password')"
                    class="h-11 border-2 border-gray-200 bg-white pr-12 text-gray-900 placeholder:text-gray-500 dark:border-gray-500 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-300"
                    :class="{ 'border-red-500 dark:border-red-400': passwordError }"
                    @input="validatePasswordField"
                    @blur="validatePasswordField"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    @click="togglePasswordVisibility"
                    data-testid="password-toggle"
                    class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white"
                    :aria-label="showPassword ? $t('auth.accessibility.hidePassword') : $t('auth.accessibility.showPassword')"
                    :aria-pressed="showPassword"
                  >
                    <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                    <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                    </svg>
                  </Button>
                </div>
                <div id="password-toggle-desc" class="sr-only">
                  {{ $t('auth.accessibility.passwordToggleDescription') }}
                </div>
                <p v-if="passwordError" id="password-error" class="text-sm text-red-600 dark:text-red-400" role="alert">
                  {{ passwordError }}
                </p>
              </div>
            </div>

            <!-- Remember me and forgot password with mobile-optimized layout -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div class="flex items-center">
                <Checkbox
                  id="remember"
                  v-model:checked="rememberMe"
                  :aria-describedby="'remember-desc'"
                  class="h-5 w-5"
                />
                <Label for="remember" class="ml-3 text-sm text-gray-700 dark:text-gray-100 select-none">
                  {{ $t('auth.rememberMe') }}
                </Label>
                <div id="remember-desc" class="sr-only">
                  {{ $t('auth.accessibility.rememberMeDescription') }}
                </div>
              </div>
              <NuxtLink
                :to="localePath('/auth/forgot-password')"
                data-testid="forgot-password"
                class="inline-flex items-center justify-center min-h-[44px] px-3 py-2 text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-300 dark:hover:text-primary-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20 rounded-md"
                :aria-label="$t('auth.accessibility.forgotPasswordLink')"
              >
                {{ $t('auth.forgotPassword') }}
              </NuxtLink>
            </div>

            <!-- Primary action button with mobile optimization and accessibility -->
            <Button
              type="submit"
              :disabled="isLoginDisabled"
              :aria-disabled="isLoginDisabled"
              data-testid="login-button"
              class="relative w-full flex justify-center items-center py-4 px-4 min-h-[48px] text-base font-semibold rounded-xl shadow-lg transition-opacity"
              :class="{ 'opacity-60 cursor-not-allowed pointer-events-none': isLoginDisabled }"
              :aria-label="loading ? $t('auth.accessibility.signingIn') : $t('auth.accessibility.signInButton')"
              :aria-describedby="loading ? 'login-status' : undefined"
            >
              <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              {{ loading ? $t('common.loading') : $t('auth.signIn') }}
            </Button>
            <div v-if="loading" id="login-status" class="sr-only" aria-live="polite">
              {{ $t('auth.accessibility.processingLogin') }}
            </div>

            <!-- Modern divider -->
            <div class="relative my-6">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-200 dark:border-gray-600" />
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-300">{{ $t('auth.orContinueWith') }}</span>
              </div>
            </div>

            <!-- Secondary action buttons with mobile optimization -->
            <Button
              type="button"
              variant="outline"
              @click="handleMagicLink"
              :disabled="isMagicLinkDisabled"
              :aria-disabled="isMagicLinkDisabled"
              data-testid="magic-link-button"
              class="relative w-full flex justify-center items-center py-4 px-4 min-h-[48px] text-base font-medium rounded-xl transition-opacity"
              :class="{ 'opacity-60 cursor-not-allowed pointer-events-none': isMagicLinkDisabled }"
              :aria-label="loadingMagic ? $t('auth.accessibility.sendingMagicLink') : $t('auth.accessibility.magicLinkButton')"
              :aria-describedby="loadingMagic ? 'magic-link-status' : 'magic-link-desc'"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              {{ loadingMagic ? $t('common.loading') : $t('auth.sendMagicLink') }}
            </Button>
            <div id="magic-link-desc" class="sr-only">
              {{ $t('auth.accessibility.magicLinkDescription') }}
            </div>
            <div v-if="loadingMagic" id="magic-link-status" class="sr-only" aria-live="polite">
              {{ $t('auth.accessibility.sendingMagicLink') }}
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle2 } from 'lucide-vue-next'
import { useAuth } from '~/composables/useAuth'
import { useAuthMessages } from '~/composables/useAuthMessages'

// Apply guest middleware - redirect authenticated users
definePageMeta({
  middleware: 'guest'
})

const supabase = useSupabaseClient()
const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const {
  error: authError,
  isAccountLocked,
  getUnlockTime,
  clearError,
  ensureInitialized,
  triggerLockout
} = useAuth()

const { getAccountLockoutMessage, translateAuthError } = useAuthMessages()

const form = ref({
  email: '',
  password: ''
})

// Handle redirect after successful login
const handleRedirectAfterLogin = async () => {
  const redirect = route.query.redirect as string
  if (redirect && redirect.startsWith('/')) {
    await navigateTo(redirect)
    return
  }

  await navigateTo(localePath('/account'))
}

const success = ref('')
const loadingMagic = ref(false)
const showPassword = ref(false)
const rememberMe = ref(false)
const localError = ref('')
const loading = ref(false)

// Field-level validation errors
const emailError = ref('')
const passwordError = ref('')

// Validation composable
const { validateEmail, validatePassword } = useAuthValidation()

// Form validation
const isFormValid = computed(() => {
  return form.value.email && 
         form.value.password && 
         !emailError.value && 
         !passwordError.value
})

const isLoginDisabled = computed(() => {
  return loading.value || !isFormValid.value || isAccountLocked.value
})

const isMagicLinkDisabled = computed(() => {
  return loadingMagic.value || !form.value.email || isAccountLocked.value
})

// Field validation methods
const validateEmailField = () => {
  if (!form.value.email) {
    emailError.value = ''
    return
  }
  
  const result = validateEmail(form.value.email)
  emailError.value = result.isValid ? '' : result.errors[0]?.message || ''
}

const validatePasswordField = () => {
  if (!form.value.password) {
    passwordError.value = ''
    return
  }
  
  const result = validatePassword(form.value.password)
  passwordError.value = result.isValid ? '' : result.errors[0]?.message || ''
}

// Password visibility toggle with accessibility
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
  
  // Announce to screen readers
  const message = showPassword.value 
    ? t('auth.accessibility.passwordVisible')
    : t('auth.accessibility.passwordHidden')
  
  // Create temporary announcement element
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', 'polite')
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message
  document.body.appendChild(announcement)
  
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

const handleLogin = async () => {
  if (loading.value) {
    return
  }

  localError.value = ''
  success.value = ''
  clearError()

  if (isAccountLocked.value) {
    return
  }

  loading.value = true
  
  try {
    const { data, error: authErr } = await supabase.auth.signInWithPassword({
      email: form.value.email,
      password: form.value.password
    })

    if (authErr) {
      if (authErr.message?.includes('Too many requests')) {
        triggerLockout(15)
        localError.value = translateAuthError('Too many requests', 'login')
      } else {
        localError.value = translateAuthError(authErr.message, 'login')
      }
      throw authErr
    }

    if (data?.user) {
      success.value = t('auth.loginSuccess')
      await handleRedirectAfterLogin()
    }
  } catch (err: any) {
    if (!localError.value) {
      localError.value = err?.message || t('auth.loginError')
    }
  } finally {
    loading.value = false
  }
}

const handleMagicLink = async () => {
  if (!form.value.email) {
    localError.value = t('auth.emailRequired')
    return
  }

  localError.value = ''
  success.value = ''
  loadingMagic.value = true

  try {
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: form.value.email,
      options: {
        emailRedirectTo: `${window.location.origin}${localePath('/auth/confirm')}`
      }
    })

    if (authError) {
      throw authError
    }

    success.value = t('auth.magicLinkSent')
  } catch (err: any) {
    localError.value = err.message || t('auth.magicLinkError')
  } finally {
    loadingMagic.value = false
  }
}

const lockoutMessage = computed(() => {
  if (!isAccountLocked.value) {
    return ''
  }

  const unlockTime = getUnlockTime()
  if (!unlockTime) {
    return ''
  }

  return getAccountLockoutMessage(unlockTime).message
})

watch(isAccountLocked, (locked) => {
  if (!locked) {
    localError.value = ''
  }
})

const displayError = computed(() => {
  return lockoutMessage.value || localError.value || authError.value || ''
})

onMounted(async () => {
  await ensureInitialized()
})

useHead({
  title: t('auth.signIn')
})
</script>
