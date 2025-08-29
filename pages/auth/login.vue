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
            <NuxtLink :to="localePath('/auth/register')" class="font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors">
              {{ $t('auth.signUp') }}
            </NuxtLink>
          </p>
        </div>
      
        <!-- Card container for form -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8">
          <form class="space-y-5" @submit.prevent="handleLogin">
            <!-- Alert messages with improved mobile styling -->
            <Transition name="slide-fade">
              <div v-if="error" class="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 sm:p-4">
                <div class="flex items-start">
                  <svg class="w-5 h-5 text-red-500 dark:text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                  </svg>
                  <div class="ml-3 text-sm text-red-800 dark:text-red-300">{{ error }}</div>
                </div>
              </div>
            </Transition>

            <Transition name="slide-fade">
              <div v-if="success" class="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 sm:p-4">
                <div class="flex items-start">
                  <svg class="w-5 h-5 text-green-500 dark:text-green-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <div class="ml-3 text-sm text-green-800 dark:text-green-300">{{ success }}</div>
                </div>
              </div>
            </Transition>
        
            <!-- Modern input fields with mobile optimization and accessibility -->
            <div class="space-y-4">
              <div class="relative">
                <input
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
                  :aria-invalid="emailError ? 'true' : 'false'"
                  :aria-describedby="emailError ? 'email-error' : undefined"
                  class="peer w-full px-4 py-3 min-h-[44px] border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-transparent focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all bg-white dark:bg-gray-700"
                  :class="{ 'border-red-500 dark:border-red-400': emailError }"
                  placeholder="Email"
                  @blur="validateEmailField"
                >
                <label 
                  for="email" 
                  class="absolute left-3 -top-2.5 bg-white dark:bg-gray-800 px-2 text-sm text-gray-600 dark:text-gray-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-sm peer-focus:text-primary-600 dark:peer-focus:text-primary-400"
                  :class="{ 'text-red-600 dark:text-red-400': emailError }"
                >
                  {{ $t('auth.email') }}
                </label>
                <div v-if="emailError" id="email-error" class="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                  {{ emailError }}
                </div>
              </div>
              
              <div class="relative">
                <input
                  id="password"
                  v-model="form.password"
                  name="password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  autocapitalize="none"
                  autocorrect="off"
                  spellcheck="false"
                  required
                  :aria-invalid="passwordError ? 'true' : 'false'"
                  :aria-describedby="passwordError ? 'password-error' : 'password-toggle-desc'"
                  class="peer w-full px-4 py-3 pr-12 min-h-[44px] border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-transparent focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all bg-white dark:bg-gray-700"
                  :class="{ 'border-red-500 dark:border-red-400': passwordError }"
                  placeholder="Password"
                  @blur="validatePasswordField"
                >
                <label 
                  for="password" 
                  class="absolute left-3 -top-2.5 bg-white dark:bg-gray-800 px-2 text-sm text-gray-600 dark:text-gray-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-sm peer-focus:text-primary-600 dark:peer-focus:text-primary-400"
                  :class="{ 'text-red-600 dark:text-red-400': passwordError }"
                >
                  {{ $t('auth.password') }}
                </label>
                <!-- Password visibility toggle with accessibility -->
                <button
                  type="button"
                  @click="togglePasswordVisibility"
                  class="absolute right-3 top-3.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 rounded-md transition-colors"
                  :aria-label="showPassword ? $t('auth.accessibility.hidePassword') : $t('auth.accessibility.showPassword')"
                  :aria-pressed="showPassword"
                  aria-describedby="password-toggle-desc"
                >
                  <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                  </svg>
                </button>
                <div id="password-toggle-desc" class="sr-only">
                  {{ $t('auth.accessibility.passwordToggleDescription') }}
                </div>
                <div v-if="passwordError" id="password-error" class="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                  {{ passwordError }}
                </div>
              </div>
            </div>

            <!-- Remember me and forgot password with mobile-optimized layout -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div class="flex items-center">
                <input
                  id="remember"
                  v-model="rememberMe"
                  type="checkbox"
                  class="w-5 h-5 min-w-[20px] min-h-[20px] text-primary-600 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:outline-none"
                  :aria-describedby="'remember-desc'"
                >
                <label for="remember" class="ml-3 text-sm text-gray-700 dark:text-gray-300 select-none">
                  {{ $t('auth.rememberMe') }}
                </label>
                <div id="remember-desc" class="sr-only">
                  {{ $t('auth.accessibility.rememberMeDescription') }}
                </div>
              </div>
              <NuxtLink 
                :to="localePath('/auth/forgot-password')" 
                class="inline-flex items-center justify-center min-h-[44px] px-3 py-2 text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20 rounded-md"
                :aria-label="$t('auth.accessibility.forgotPasswordLink')"
              >
                {{ $t('auth.forgotPassword') }}
              </NuxtLink>
            </div>

            <!-- Primary action button with mobile optimization and accessibility -->
            <button
              type="submit"
              :disabled="loading || !isFormValid"
              class="relative w-full flex justify-center items-center py-4 px-4 min-h-[48px] border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              :aria-label="loading ? $t('auth.accessibility.signingIn') : $t('auth.accessibility.signInButton')"
              :aria-describedby="loading ? 'login-status' : undefined"
            >
              <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              {{ loading ? $t('common.loading') : $t('auth.signIn') }}
            </button>
            <div v-if="loading" id="login-status" class="sr-only" aria-live="polite">
              {{ $t('auth.accessibility.processingLogin') }}
            </div>

            <!-- Modern divider -->
            <div class="relative my-6">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-200 dark:border-gray-600" />
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">{{ $t('auth.orContinueWith') }}</span>
              </div>
            </div>

            <!-- Secondary action buttons with mobile optimization -->
            <button
              type="button"
              @click="handleMagicLink"
              :disabled="loadingMagic || !form.email"
              class="relative w-full flex justify-center items-center py-4 px-4 min-h-[48px] border-2 border-gray-200 dark:border-gray-600 text-base font-medium rounded-xl text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              :aria-label="loadingMagic ? $t('auth.accessibility.sendingMagicLink') : $t('auth.accessibility.magicLinkButton')"
              :aria-describedby="loadingMagic ? 'magic-link-status' : 'magic-link-desc'"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              {{ loadingMagic ? $t('common.loading') : $t('auth.sendMagicLink') }}
            </button>
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
// Apply guest middleware - redirect authenticated users
definePageMeta({
  middleware: 'guest'
})

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

// Handle redirect after successful login
const handleRedirectAfterLogin = () => {
  const redirect = route.query.redirect as string
  if (redirect && redirect.startsWith('/')) {
    return navigateTo(redirect)
  }
  return navigateTo(localePath('/account'))
}

const form = ref({
  email: '',
  password: ''
})

const error = ref('')
const success = ref('')
const loading = ref(false)
const loadingMagic = ref(false)
const showPassword = ref(false)
const rememberMe = ref(false)

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
  error.value = ''
  success.value = ''
  loading.value = true
  
  try {
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: form.value.email,
      password: form.value.password
    })

    if (authError) {
      throw authError
    }

    success.value = t('auth.loginSuccess')
    
    // Handle redirect after successful login (Requirement 10.2)
    await handleRedirectAfterLogin()
  } catch (err: any) {
    error.value = err.message || t('auth.loginError')
  } finally {
    loading.value = false
  }
}

const handleMagicLink = async () => {
  if (!form.value.email) {
    error.value = t('auth.emailRequired')
    return
  }

  error.value = ''
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
    error.value = err.message || t('auth.magicLinkError')
  } finally {
    loadingMagic.value = false
  }
}

useHead({
  title: t('auth.signIn')
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