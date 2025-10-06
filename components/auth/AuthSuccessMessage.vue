<template>
  <Transition name="slide-fade">
    <div v-if="message" class="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 sm:p-4">
      <div class="flex items-start">
        <svg class="w-5 h-5 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
        <div class="ml-3 flex-1">
          <div class="text-sm text-green-800 dark:text-green-300">
            {{ translatedMessage }}
          </div>
          <div v-if="showAction && actionText" class="mt-2">
            <Button
              variant="link"
              size="sm"
              @click="$emit('action')"
              class="text-sm font-medium text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300 transition-colors p-0 h-auto"
            >
              {{ actionText }}
            </Button>
          </div>
        </div>
        <Button
          v-if="dismissible"
          variant="ghost"
          size="icon"
          @click="$emit('dismiss')"
          class="ml-2 text-green-400 hover:text-green-600 dark:hover:text-green-300 transition-colors"
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
  message: string | null
  dismissible?: boolean
  showAction?: boolean
  actionKey?: string
  context?: 'login' | 'register' | 'reset' | 'verify' | 'general'
}

interface Emits {
  (e: 'dismiss'): void
  (e: 'action'): void
}

const props = withDefaults(defineProps<Props>(), {
  dismissible: false,
  showAction: false,
  context: 'general'
})

defineEmits<Emits>()

const { t } = useI18n()

/**
 * Translates success messages to user-friendly messages
 * Addresses Requirements 6.1, 6.2, 9.1 for multi-language success handling
 */
const translatedMessage = computed(() => {
  if (!props.message) return ''
  
  // Map common success message keys to translation keys
  const messageMappings: Record<string, string> = {
    // Authentication success messages
    'login-success': 'auth.success.loginSuccess',
    'registration-success': 'auth.success.registrationSuccess',
    'email-verified': 'auth.success.emailVerified',
    'password-reset-sent': 'auth.success.passwordResetSent',
    'password-reset-success': 'auth.success.passwordResetSuccess',
    'verification-resent': 'auth.success.verificationResent',
    'logout-success': 'auth.success.logoutSuccess',
    'account-created': 'auth.success.accountCreated',
    'profile-updated': 'auth.success.profileUpdated',
    'email-updated': 'auth.success.emailUpdated',
    'password-updated': 'auth.success.passwordUpdated'
  }
  
  // Check for exact matches first
  const translationKey = messageMappings[props.message]
  if (translationKey) {
    return t(translationKey)
  }
  
  // Check if the message is already a translated string
  if (props.message.includes('!') || props.message.includes('successfully')) {
    return props.message
  }
  
  // Context-specific fallbacks
  switch (props.context) {
    case 'login':
      return t('auth.success.loginSuccess')
    case 'register':
      return t('auth.success.registrationSuccess')
    case 'reset':
      return t('auth.success.passwordResetSent')
    case 'verify':
      return t('auth.success.emailVerified')
    default:
      return props.message
  }
})

/**
 * Provides action button text based on context
 */
const actionText = computed(() => {
  if (props.actionKey) {
    return t(props.actionKey)
  }
  
  switch (props.context) {
    case 'register':
      return t('auth.buttons.backToLogin')
    case 'verify':
      return t('auth.buttons.continueToAccount')
    case 'reset':
      return t('auth.buttons.backToLogin')
    default:
      return null
  }
})
</script>

