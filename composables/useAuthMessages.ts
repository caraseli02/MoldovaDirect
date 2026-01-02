/**
 * Authentication messages composable with multi-language support
 *
 * Requirements addressed:
 * - 6.1, 6.2, 6.3: Multi-language authentication messages
 * - 9.1, 9.2: Proper error message display system with user feedback
 * - Centralized message handling for consistent UX
 */

export interface AuthMessage {
  type: 'error' | 'success' | 'info' | 'warning'
  message: string
  context?: 'login' | 'register' | 'reset' | 'verify' | 'general'
  dismissible?: boolean
  showRetry?: boolean
  duration?: number
}

export const useAuthMessages = () => {
  const { t } = useStoreI18n()
  const nuxtApp = useNuxtApp()
  const route = nuxtApp._route

  /**
   * Parse URL query parameters for authentication messages
   * Handles redirect messages from middleware and auth flows
   */
  const getMessageFromQuery = (): AuthMessage | null => {
    const messageParam = route?.query?.message as string | undefined
    if (!messageParam) return null

    const messageMappings: Record<string, AuthMessage> = {
      // Middleware messages
      'login-required': {
        type: 'info',
        message: t('auth.messages.loginRequired'),
        context: 'login',
      },
      'email-verification-required': {
        type: 'warning',
        message: t('auth.messages.emailVerificationRequired'),
        context: 'verify',
        showRetry: true,
      },
      'session-expired': {
        type: 'warning',
        message: t('auth.messages.sessionExpired'),
        context: 'login',
      },

      // Success messages
      'logged-out': {
        type: 'success',
        message: t('auth.success.logoutSuccess'),
        context: 'general',
        duration: 3000,
      },
      'email-verified': {
        type: 'success',
        message: t('auth.success.emailVerified'),
        context: 'verify',
        duration: 5000,
      },
      'password-reset': {
        type: 'success',
        message: t('auth.success.passwordResetSuccess'),
        context: 'login',
        duration: 5000,
      },
      'registration-complete': {
        type: 'success',
        message: t('auth.success.registrationSuccess'),
        context: 'register',
        duration: 5000,
      },

      // Error messages
      'verification-failed': {
        type: 'error',
        message: t('auth.verificationError'),
        context: 'verify',
        showRetry: true,
      },
      'reset-failed': {
        type: 'error',
        message: t('auth.resetPasswordError'),
        context: 'reset',
        showRetry: true,
      },
      'account-locked': {
        type: 'error',
        message: t('auth.messages.accountLocked', { minutes: '15' }),
        context: 'login',
      },
    }

    return messageMappings[messageParam] || null
  }

  /**
   * Create error message from authentication error
   */
  const createErrorMessage = (
    error: string | Error,
    context: AuthMessage['context'] = 'general',
    showRetry = false,
  ): AuthMessage => {
    const errorString = error instanceof Error ? getErrorMessage(error) : error

    return {
      type: 'error',
      message: translateAuthError(errorString, context),
      context,
      dismissible: true,
      showRetry,
    }
  }

  /**
   * Create success message
   */
  const createSuccessMessage = (
    messageKey: string,
    context: AuthMessage['context'] = 'general',
    duration = 3000,
  ): AuthMessage => {
    return {
      type: 'success',
      message: t(messageKey),
      context,
      dismissible: true,
      duration,
    }
  }

  /**
   * Create info message
   */
  const createInfoMessage = (
    messageKey: string,
    context: AuthMessage['context'] = 'general',
  ): AuthMessage => {
    return {
      type: 'info',
      message: t(messageKey),
      context,
      dismissible: true,
    }
  }

  /**
   * Create warning message
   */
  const createWarningMessage = (
    messageKey: string,
    context: AuthMessage['context'] = 'general',
    showRetry = false,
  ): AuthMessage => {
    return {
      type: 'warning',
      message: t(messageKey),
      context,
      dismissible: true,
      showRetry,
    }
  }

  /**
   * Translate authentication errors to user-friendly messages
   */
  const translateAuthError = (
    error: string,
    context: AuthMessage['context'] = 'general',
  ): string => {
    // Common Supabase error mappings
    const errorMappings: Record<string, string> = {
      'Invalid login credentials': 'auth.errors.invalidCredentials',
      'Email not confirmed': 'auth.errors.emailNotVerified',
      'User not found': 'auth.errors.userNotFound',
      'Invalid email': 'auth.errors.emailInvalid',
      'Password should be at least 8 characters':
        'auth.validation.password.minLength',
      'User already registered': 'auth.errors.emailExists',
      'Email already registered': 'auth.errors.emailExists',
      'Signup requires a valid password': 'auth.validation.password.required',
      'Signup requires a valid email': 'auth.validation.email.required',
      'Token has expired': 'auth.errors.tokenExpired',
      'Invalid token': 'auth.errors.tokenInvalid',
      'Token not found': 'auth.validation.token.required',
      'Too many requests': 'auth.errors.rateLimitExceeded',
      'Email rate limit exceeded': 'auth.errors.rateLimitExceeded',
      'Network error': 'auth.errors.networkError',
      'Failed to fetch': 'auth.errors.networkError',
      'Internal server error': 'auth.errors.serverError',
      'Service unavailable': 'auth.errors.serverError',
    }

    // Check for exact matches
    const translationKey = errorMappings[error]
    if (translationKey) {
      return t(translationKey)
    }

    // Check for partial matches with dynamic content
    if (error.includes('rate limit') || error.includes('too many')) {
      const minutesMatch = error.match(/(\d+)\s*minutes?/)
      const minutes = minutesMatch ? minutesMatch[1] : '15'
      return t('auth.errors.rateLimitExceeded', { minutes })
    }

    if (error.includes('locked') || error.includes('temporarily')) {
      const minutesMatch = error.match(/(\d+)\s*minutes?/)
      const minutes = minutesMatch ? minutesMatch[1] : '15'
      return t('auth.errors.accountLocked', { minutes })
    }

    if (error.includes('expired') || error.includes('session')) {
      return t('auth.errors.sessionExpired')
    }

    if (error.includes('password') && error.includes('weak')) {
      return t('auth.errors.weakPassword')
    }

    if (error.includes('email') && error.includes('invalid')) {
      return t('auth.validation.email.invalid')
    }

    // Context-specific fallbacks
    switch (context) {
      case 'login':
        return t('auth.errors.invalidCredentials')
      case 'register':
        return t('auth.registerError')
      case 'reset':
        return t('auth.forgotPasswordError')
      case 'verify':
        return t('auth.verificationError')
      default:
        return error || t('auth.errors.unknownError')
    }
  }

  /**
   * Get account lockout message with remaining time
   */
  const getAccountLockoutMessage = (lockoutTime: Date): AuthMessage => {
    const now = new Date()
    const remainingMs = lockoutTime.getTime() - now.getTime()
    const remainingMinutes = Math.ceil(remainingMs / (1000 * 60))

    if (remainingMinutes <= 0) {
      return createInfoMessage('auth.messages.welcomeBack', 'login')
    }

    return {
      type: 'error',
      message: t('auth.messages.accountLocked', { minutes: remainingMinutes }),
      context: 'login',
      dismissible: false,
    }
  }

  /**
   * Get verification pending message
   */
  const getVerificationPendingMessage = (_email?: string): AuthMessage => {
    return {
      type: 'info',
      message: t('auth.messages.verificationPending'),
      context: 'verify',
      showRetry: true,
      dismissible: false,
    }
  }

  /**
   * Get password reset instructions message
   */
  const getPasswordResetInstructionsMessage = (): AuthMessage => {
    return createInfoMessage(
      'auth.messages.passwordResetInstructions',
      'reset',
    )
  }

  /**
   * Get new password instructions message
   */
  const getNewPasswordInstructionsMessage = (): AuthMessage => {
    return createInfoMessage('auth.messages.newPasswordInstructions', 'reset')
  }

  /**
   * Get session expired message with security notice
   */
  const getSessionExpiredMessage = (
    includeSecurityNotice = false,
  ): AuthMessage => {
    const message = includeSecurityNotice
      ? `${t('auth.messages.sessionExpired')} ${t(
        'auth.messages.securityNotice',
      )}`
      : t('auth.messages.sessionExpired')

    return {
      type: 'warning',
      message,
      context: 'login',
      dismissible: true,
    }
  }

  return {
    // Message creation functions
    createErrorMessage,
    createSuccessMessage,
    createInfoMessage,
    createWarningMessage,

    // Specific message getters
    getMessageFromQuery,
    getAccountLockoutMessage,
    getVerificationPendingMessage,
    getPasswordResetInstructionsMessage,
    getNewPasswordInstructionsMessage,
    getSessionExpiredMessage,

    // Utility functions
    translateAuthError,
  }
}
