<template>
  <Transition name="slide-fade">
    <div v-if="error" class="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 sm:p-4">
      <div class="flex items-start">
        <svg class="w-5 h-5 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
        </svg>
        <div class="ml-3 flex-1">
          <div class="text-sm text-red-800 dark:text-red-300">
            {{ translatedError }}
          </div>
          <div v-if="showRetry" class="mt-2">
            <Button
              variant="link"
              size="sm"
              @click="$emit('retry')"
              class="text-sm font-medium text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300 transition-colors p-0 h-auto"
            >
              {{ $t('auth.buttons.tryAgain') }}
            </Button>
          </div>
        </div>
        <Button
          v-if="dismissible"
          variant="ghost"
          size="icon"
          @click="$emit('dismiss')"
          class="ml-2 text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </Button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'

interface Props {
  error: string | null
  dismissible?: boolean
  showRetry?: boolean
  context?: 'login' | 'register' | 'reset' | 'verify' | 'general'
}

interface Emits {
  (e: 'dismiss'): void
  (e: 'retry'): void
}

const props = withDefaults(defineProps<Props>(), {
  dismissible: false,
  showRetry: false,
  context: 'general'
})

defineEmits<Emits>()

const { t } = useI18n()

/**
 * Translates authentication errors to user-friendly messages
 * Addresses Requirements 6.1, 6.2, 9.1, 9.2 for multi-language error handling
 */
const translatedError = computed(() => {
  if (!props.error) return ''
  
  // Map common Supabase error codes to translation keys
  const errorMappings: Record<string, string> = {
    // Authentication errors
    'Invalid login credentials': 'auth.errors.invalidCredentials',
    'Email not confirmed': 'auth.errors.emailNotVerified',
    'User not found': 'auth.errors.userNotFound',
    'Invalid email': 'auth.errors.emailInvalid',
    'Password should be at least 8 characters': 'auth.validation.password.minLength',
    'User already registered': 'auth.errors.emailExists',
    'Email already registered': 'auth.errors.emailExists',
    'Signup requires a valid password': 'auth.validation.password.required',
    'Signup requires a valid email': 'auth.validation.email.required',
    
    // Token errors
    'Token has expired': 'auth.errors.tokenExpired',
    'Invalid token': 'auth.errors.tokenInvalid',
    'Token not found': 'auth.validation.token.required',
    
    // Rate limiting
    'Too many requests': 'auth.errors.rateLimitExceeded',
    'Email rate limit exceeded': 'auth.errors.rateLimitExceeded',
    
    // Network errors
    'Network error': 'auth.errors.networkError',
    'Failed to fetch': 'auth.errors.networkError',
    
    // Server errors
    'Internal server error': 'auth.errors.serverError',
    'Service unavailable': 'auth.errors.serverError'
  }
  
  // Check for exact matches first
  const translationKey = errorMappings[props.error]
  if (translationKey) {
    return t(translationKey)
  }
  
  // Check for partial matches for dynamic errors
  if (props.error.includes('rate limit') || props.error.includes('too many')) {
    // Extract minutes if available
    const minutesMatch = props.error.match(/(\d+)\s*minutes?/)
    const minutes = minutesMatch ? minutesMatch[1] : '15'
    return t('auth.errors.rateLimitExceeded', { minutes })
  }
  
  if (props.error.includes('locked') || props.error.includes('temporarily')) {
    const minutesMatch = props.error.match(/(\d+)\s*minutes?/)
    const minutes = minutesMatch ? minutesMatch[1] : '15'
    return t('auth.errors.accountLocked', { minutes })
  }
  
  if (props.error.includes('expired') || props.error.includes('session')) {
    return t('auth.errors.sessionExpired')
  }
  
  if (props.error.includes('password') && props.error.includes('weak')) {
    return t('auth.errors.weakPassword')
  }
  
  if (props.error.includes('email') && props.error.includes('invalid')) {
    return t('auth.validation.email.invalid')
  }
  
  // Context-specific fallbacks
  switch (props.context) {
    case 'login':
      return t('auth.errors.invalidCredentials')
    case 'register':
      return t('auth.registerError')
    case 'reset':
      return t('auth.forgotPasswordError')
    case 'verify':
      return t('auth.verificationError')
    default:
      return props.error || t('auth.errors.unknownError')
  }
})
</script>

