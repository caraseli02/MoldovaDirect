/**
 * Guest Checkout Composable
 *
 * Manages guest checkout state and validation.
 * Handles guest information, email validation, and form visibility.
 *
 * Requirements addressed:
 * - 3.1: Dedicated composable for guest information management
 * - 3.2: Email validation logic and error messages
 * - 3.3: Computed property for guest info validity
 * - 3.4: Guest form visibility state management
 */

import { ref, computed } from 'vue'

export interface GuestInfo {
  email: string
  emailUpdates: boolean
}

export function useGuestCheckout() {
  const { t } = useI18n()

  // State
  const showGuestForm = ref(process.env.NODE_ENV === 'development')
  const guestInfo = ref<GuestInfo>({
    email: process.env.NODE_ENV === 'development' ? 'john.doe@example.com' : '',
    emailUpdates: process.env.NODE_ENV === 'development',
  })
  const guestErrors = ref<Record<string, string>>({})

  /**
   * Check if email is valid format
   */
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Check if guest information is valid
   */
  const isGuestInfoValid = computed(() => {
    return !!(
      guestInfo.value.email
      && !guestErrors.value.email
    )
  })

  /**
   * Continue as guest - show guest form
   */
  const continueAsGuest = () => {
    showGuestForm.value = true
  }

  /**
   * Validate a specific guest field
   */
  const validateGuestField = (field: keyof GuestInfo) => {
    if (field === 'email') {
      const email = guestInfo.value.email

      if (!email || !email.trim()) {
        guestErrors.value.email = t('checkout.validation.emailRequired')
      }
      else if (!isValidEmail(email)) {
        guestErrors.value.email = t('checkout.validation.emailInvalid')
      }
      else {
        delete guestErrors.value.email
      }
    }
  }

  /**
   * Clear error for a specific field
   */
  const clearGuestFieldError = (field: string) => {
    if (guestErrors.value[field]) {
      const { [field]: _removed, ...rest } = guestErrors.value
      guestErrors.value = rest
    }
  }

  /**
   * Get CSS classes for a field based on error state
   */
  const getGuestFieldClasses = (field: string) => {
    const hasError = !!guestErrors.value[field]
    return {
      'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500': hasError,
      'border-gray-300 dark:border-gray-600': !hasError,
      'bg-white dark:bg-gray-700 text-gray-900 dark:text-white': true,
    }
  }

  /**
   * Validate all guest fields
   */
  const validateAll = (): boolean => {
    validateGuestField('email')
    return isGuestInfoValid.value
  }

  /**
   * Reset guest checkout state
   */
  const reset = () => {
    showGuestForm.value = false
    guestInfo.value = {
      email: '',
      emailUpdates: false,
    }
    guestErrors.value = {}
  }

  return {
    showGuestForm,
    guestInfo,
    guestErrors: readonly(guestErrors),
    isGuestInfoValid: readonly(isGuestInfoValid),
    continueAsGuest,
    validateGuestField,
    clearGuestFieldError,
    getGuestFieldClasses,
    validateAll,
    reset,
  }
}
