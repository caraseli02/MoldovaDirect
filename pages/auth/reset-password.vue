<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
    <!-- Mobile-optimized container -->
    <div class="flex-1 flex items-center justify-center px-6 py-8 sm:px-8 lg:px-12">
      <div class="w-full max-w-sm sm:max-w-md space-y-6 sm:space-y-8">
        <!-- Logo/Brand area -->
        <div class="text-center space-y-2">
          <div class="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-primary-100 dark:bg-primary-900/30 rounded-2xl mb-4">
            <svg class="w-10 h-10 sm:w-12 sm:h-12 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {{ $t('auth.resetPassword') }}
          </h2>
          <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400 px-4">
            {{ $t('auth.resetPasswordInstructions') }}
          </p>
        </div>
      
        <!-- Card container -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8">
          <form v-if="!success" class="space-y-5" @submit.prevent="handleResetPassword">
            <!-- Alert messages -->
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
            
            <!-- Input fields with mobile optimization -->
            <div class="space-y-4">
              <div class="relative">
                <input
                  id="password"
                  v-model="form.password"
                  name="password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  autocapitalize="none"
                  autocorrect="off"
                  spellcheck="false"
                  required
                  minlength="8"
                  :aria-invalid="passwordError ? 'true' : 'false'"
                  :aria-describedby="passwordError ? 'password-error' : 'password-requirements'"
                  class="peer w-full px-4 py-3 pr-12 min-h-[44px] border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-transparent focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all bg-white dark:bg-gray-700"
                  :class="{ 'border-red-500 dark:border-red-400': passwordError }"
                  placeholder="New Password"
                  @input="validatePasswordField"
                  @blur="validatePasswordField"
                >
                <label 
                  for="password" 
                  class="absolute left-3 -top-2.5 bg-white dark:bg-gray-800 px-2 text-sm text-gray-600 dark:text-gray-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-sm peer-focus:text-primary-600 dark:peer-focus:text-primary-400"
                  :class="{ 'text-red-600 dark:text-red-400': passwordError }"
                >
                  {{ $t('auth.newPassword') }}
                </label>
                <button
                  type="button"
                  @click="togglePasswordVisibility"
                  class="absolute right-3 top-3.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 rounded-md transition-colors"
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
                </button>
                
                <!-- Password strength meter -->
                <AuthPasswordStrengthMeter 
                  :password="form.password" 
                  :show-requirements="true"
                  class="mt-2"
                />
                
                <div v-if="passwordError" id="password-error" class="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                  {{ passwordError }}
                </div>
                <div id="password-requirements" class="sr-only">
                  {{ $t('auth.accessibility.passwordRequirements') }}
                </div>
              </div>
              
              <div class="relative">
                <input
                  id="confirmPassword"
                  v-model="form.confirmPassword"
                  name="confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  autocapitalize="none"
                  autocorrect="off"
                  spellcheck="false"
                  required
                  :aria-invalid="confirmPasswordError ? 'true' : 'false'"
                  :aria-describedby="confirmPasswordError ? 'confirm-password-error' : 'confirm-password-desc'"
                  class="peer w-full px-4 py-3 pr-12 min-h-[44px] border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-transparent focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all bg-white dark:bg-gray-700"
                  :class="{ 
                    'border-red-500 dark:border-red-400': confirmPasswordError,
                    'border-green-500 dark:border-green-400': form.confirmPassword && !confirmPasswordError && form.password === form.confirmPassword
                  }"
                  placeholder="Confirm Password"
                  @input="validateConfirmPasswordField"
                  @blur="validateConfirmPasswordField"
                >
                <label 
                  for="confirmPassword" 
                  class="absolute left-3 -top-2.5 bg-white dark:bg-gray-800 px-2 text-sm text-gray-600 dark:text-gray-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-sm peer-focus:text-primary-600 dark:peer-focus:text-primary-400"
                  :class="{ 
                    'text-red-600 dark:text-red-400': confirmPasswordError,
                    'text-green-600 dark:text-green-400': form.confirmPassword && !confirmPasswordError && form.password === form.confirmPassword
                  }"
                >
                  {{ $t('auth.confirmPassword') }}
                </label>
                <button
                  type="button"
                  @click="toggleConfirmPasswordVisibility"
                  class="absolute right-3 top-3.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 rounded-md transition-colors"
                  :aria-label="showConfirmPassword ? $t('auth.accessibility.hidePassword') : $t('auth.accessibility.showPassword')"
                  :aria-pressed="showConfirmPassword"
                >
                  <svg v-if="!showConfirmPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                  </svg>
                </button>
                
                <div id="confirm-password-desc" class="sr-only">
                  {{ $t('auth.accessibility.confirmPasswordDescription') }}
                </div>
                <div v-if="confirmPasswordError" id="confirm-password-error" class="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                  {{ confirmPasswordError }}
                </div>
                <div v-else-if="form.confirmPassword && form.password === form.confirmPassword" class="mt-1 text-sm text-green-600 dark:text-green-400">
                  <svg class="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  {{ $t('auth.validation.password.match') }}
                </div>
              </div>
            </div>

            <!-- Submit button -->
            <button
              type="submit"
              :disabled="loading || !isFormValid"
              class="relative w-full flex justify-center items-center py-4 px-4 min-h-[48px] border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              :aria-label="loading ? $t('auth.accessibility.resettingPassword') : $t('auth.accessibility.resetPasswordButton')"
              :aria-describedby="loading ? 'reset-status' : undefined"
            >
              <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              {{ loading ? $t('common.loading') : $t('auth.resetPassword') }}
            </button>
            <div v-if="loading" id="reset-status" class="sr-only" aria-live="polite">
              {{ $t('auth.accessibility.processingPasswordReset') }}
            </div>
          </form>
      
          <div v-else class="space-y-6">
            <div class="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 sm:p-4">
              <div class="flex items-start">
                <svg class="w-5 h-5 text-green-500 dark:text-green-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-green-800 dark:text-green-300">
                    {{ $t('auth.passwordResetSuccess') }}
                  </h3>
                  <p class="mt-1 text-sm text-green-700 dark:text-green-400">
                    {{ message }}
                  </p>
                </div>
              </div>
            </div>
            
            <div class="text-center">
              <NuxtLink 
                :to="localePath('/auth/login')" 
                class="inline-flex items-center justify-center min-h-[44px] px-4 py-2 font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20 rounded-md"
              >
                {{ $t('auth.signIn') }} →
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
const route = useRoute()
const { t } = useI18n()
const localePath = useLocalePath()

const form = ref({
  password: '',
  confirmPassword: ''
})

const error = ref('')
const success = ref(false)
const message = ref('')
const loading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// Field-level validation errors
const passwordError = ref('')
const confirmPasswordError = ref('')

// Validation composable
const { validatePassword, validatePasswordMatch } = useAuthValidation()

// Form validation
const isFormValid = computed(() => {
  return form.value.password && 
         form.value.confirmPassword &&
         !passwordError.value && 
         !confirmPasswordError.value &&
         form.value.password === form.value.confirmPassword
})

// Field validation methods
const validatePasswordField = () => {
  if (!form.value.password) {
    passwordError.value = ''
    return
  }
  
  const result = validatePassword(form.value.password)
  passwordError.value = result.isValid ? '' : result.errors[0]?.message || ''
  
  // Also validate confirm password if it exists
  if (form.value.confirmPassword) {
    validateConfirmPasswordField()
  }
}

const validateConfirmPasswordField = () => {
  if (!form.value.confirmPassword) {
    confirmPasswordError.value = ''
    return
  }
  
  if (form.value.password !== form.value.confirmPassword) {
    confirmPasswordError.value = t('auth.validation.password.mismatch')
  } else {
    confirmPasswordError.value = ''
  }
}

// Password visibility toggles with accessibility
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
  announcePasswordVisibility(showPassword.value)
}

const toggleConfirmPasswordVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value
  announcePasswordVisibility(showConfirmPassword.value)
}

const announcePasswordVisibility = (isVisible: boolean) => {
  const message = isVisible 
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

const handleResetPassword = async () => {
  error.value = ''
  
  if (form.value.password !== form.value.confirmPassword) {
    error.value = t('auth.passwordMismatch')
    return
  }
  
  if (form.value.password.length < 8) {
    error.value = t('auth.passwordTooShort')
    return
  }
  
  loading.value = true
  
  try {
    const { error: authError } = await supabase.auth.updateUser({
      password: form.value.password
    })
    
    if (authError) {
      throw authError
    }
    
    success.value = true
    message.value = t('auth.passwordResetSuccess')
  } catch (err: any) {
    error.value = err.message || t('auth.resetPasswordError')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // Check if we have the access_token and refresh_token from URL hash
  const hash = window.location.hash
  if (!hash) {
    error.value = t('auth.missingToken')
    return
  }
  
  // Supabase will automatically handle the session from URL hash
})

useHead({
  title: t('auth.resetPassword')
})
</script>

