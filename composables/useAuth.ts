/**
 * Authentication composable
 * 
 * Provides easy access to authentication store and helper functions
 * Requirements addressed:
 * - 5.1: Session persistence across browser tabs
 * - 5.3: Reactive authentication status
 * - 9.1: Proper error handling and loading states
 * - 9.2: User profile management functionality
 * 
 * This composable acts as a convenient wrapper around the auth store
 * and provides additional utility functions for authentication.
 */

import { useAuthStore } from '~/stores/auth'
import type { LoginCredentials, RegisterData, AuthUser } from '~/stores/auth'

export const useAuth = () => {
  const authStore = useAuthStore()
  const router = useRouter()
  const route = useRoute()

  /**
   * Reactive authentication state
   */
  const user = computed(() => authStore.user)
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const isEmailVerified = computed(() => authStore.isEmailVerified)
  const isLoading = computed(() => authStore.isLoading)
  const error = computed(() => authStore.error)
  const isAccountLocked = computed(() => authStore.isAccountLocked)
  const lockoutMinutesRemaining = computed(() => authStore.lockoutMinutesRemaining)
  const userLanguage = computed(() => authStore.userLanguage)

  /**
   * Authentication actions
   */
  const login = async (credentials: LoginCredentials) => {
    return authStore.login(credentials)
  }

  const register = async (userData: RegisterData) => {
    return authStore.register(userData)
  }

  const logout = async () => {
    return authStore.logout()
  }

  const verifyEmail = async (token: string) => {
    return authStore.verifyEmail(token)
  }

  const resendVerification = async (email?: string) => {
    return authStore.resendVerification(email)
  }

  const forgotPassword = async (email: string) => {
    return authStore.forgotPassword(email)
  }

  const resetPassword = async (password: string) => {
    return authStore.resetPassword(password)
  }

  const updateProfile = async (profileData: Partial<AuthUser>) => {
    return authStore.updateProfile(profileData)
  }

  /**
   * Utility functions
   */
  const clearError = () => {
    authStore.clearError()
  }

  const clearLockout = () => {
    authStore.clearLockout()
  }

  /**
   * Check if user has a specific role or permission
   * This can be extended based on future role-based access control requirements
   */
  const hasRole = (role: string): boolean => {
    // For now, we don't have roles implemented
    // This is a placeholder for future role-based access control
    return false
  }

  /**
   * Check if user can access a specific route
   */
  const canAccessRoute = (routePath: string): boolean => {
    // Define protected routes that require authentication
    const protectedRoutes = [
      '/account',
      '/cart',
      '/checkout',
      '/admin'
    ]

    // Check if route requires authentication
    const requiresAuth = protectedRoutes.some(route => 
      routePath.startsWith(route)
    )

    if (!requiresAuth) {
      return true
    }

    // For protected routes, user must be authenticated and verified
    return isAuthenticated.value
  }

  /**
   * Redirect to login with current route as redirect parameter
   */
  const redirectToLogin = (message?: string) => {
    const query: Record<string, string> = {}
    
    // Preserve current route for post-login redirect
    if (route.fullPath !== '/') {
      query.redirect = route.fullPath
    }
    
    // Add message if provided
    if (message) {
      query.message = message
    }

    return navigateTo({
      path: '/auth/login',
      query
    })
  }

  /**
   * Redirect to verification page
   */
  const redirectToVerification = (email?: string) => {
    const query: Record<string, string> = {
      message: 'email-verification-required'
    }
    
    if (email) {
      query.email = email
    }

    return navigateTo({
      path: '/auth/verify-email',
      query
    })
  }

  /**
   * Get user's display name
   */
  const getUserDisplayName = (): string => {
    if (!user.value) return ''
    
    return user.value.name || user.value.email.split('@')[0] || 'Usuario'
  }

  /**
   * Get user's initials for avatar display
   */
  const getUserInitials = (): string => {
    if (!user.value) return ''
    
    if (user.value.name) {
      return user.value.name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('')
    }
    
    return user.value.email.charAt(0).toUpperCase()
  }

  /**
   * Check if user account needs attention (unverified email, etc.)
   */
  const needsAttention = computed(() => {
    if (!user.value) return false
    
    // Check if email is not verified
    if (!user.value.emailVerified) return true
    
    // Add other checks as needed (incomplete profile, etc.)
    return false
  })

  /**
   * Get attention message for user
   */
  const getAttentionMessage = (): string => {
    if (!user.value) return ''
    
    if (!user.value.emailVerified) {
      return 'Por favor verifica tu email para acceder a todas las funciones'
    }
    
    return ''
  }

  /**
   * Initialize authentication if not already done
   */
  const ensureInitialized = async () => {
    if (!authStore.sessionInitialized) {
      await authStore.initializeAuth()
    }
  }

  /**
   * Check if current session is valid
   */
  const isSessionValid = computed(() => {
    return isAuthenticated.value && !isAccountLocked.value
  })

  /**
   * Get time until account unlock (for locked accounts)
   */
  const getUnlockTime = (): Date | null => {
    return authStore.lockoutTime
  }

  /**
   * Format lockout time remaining as human-readable string
   */
  const formatLockoutTime = (): string => {
    const minutes = lockoutMinutesRemaining.value
    if (minutes <= 0) return ''
    
    if (minutes === 1) {
      return '1 minuto'
    }
    
    return `${minutes} minutos`
  }

  return {
    // Reactive state
    user: readonly(user),
    isAuthenticated: readonly(isAuthenticated),
    isEmailVerified: readonly(isEmailVerified),
    isLoading: readonly(isLoading),
    error: readonly(error),
    isAccountLocked: readonly(isAccountLocked),
    lockoutMinutesRemaining: readonly(lockoutMinutesRemaining),
    userLanguage: readonly(userLanguage),
    needsAttention: readonly(needsAttention),
    isSessionValid: readonly(isSessionValid),

    // Actions
    login,
    register,
    logout,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    updateProfile,

    // Utilities
    clearError,
    clearLockout,
    hasRole,
    canAccessRoute,
    redirectToLogin,
    redirectToVerification,
    getUserDisplayName,
    getUserInitials,
    getAttentionMessage,
    ensureInitialized,
    getUnlockTime,
    formatLockoutTime
  }
}