/**
 * Centralized Authentication Store using Pinia
 * 
 * Requirements addressed:
 * - 5.1: Session persistence across browser tabs with reactive updates
 * - 5.3: Reactive authentication status using Supabase composables
 * - 9.1: Proper error handling and loading states
 * - 9.2: User profile management functionality
 * 
 * Integrates with:
 * - useSupabaseUser() for reactive user state
 * - useSupabaseClient() for authentication operations
 * - Cross-tab synchronization through Supabase real-time updates
 */

import { defineStore } from 'pinia'
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js'
import type { WatchStopHandle } from 'vue'
import { useAuthMessages } from '~/composables/useAuthMessages'
import { useAuthValidation } from '~/composables/useAuthValidation'
import { useToastStore } from './toast'

type AuthSubscription = {
  unsubscribe: () => PromiseLike<unknown>
}

const LOCKOUT_STORAGE_KEY = 'md-auth-lockout-until'

const readPersistedLockout = (): Date | null => {
  if (!process.client) {
    return null
  }

  const storedValue = window.localStorage.getItem(LOCKOUT_STORAGE_KEY)
  if (!storedValue) {
    return null
  }

  const parsed = new Date(storedValue)
  if (Number.isNaN(parsed.getTime()) || parsed <= new Date()) {
    window.localStorage.removeItem(LOCKOUT_STORAGE_KEY)
    return null
  }

  return parsed
}

const persistLockout = (lockoutTime: Date | null) => {
  if (!process.client) {
    return
  }

  if (lockoutTime) {
    window.localStorage.setItem(LOCKOUT_STORAGE_KEY, lockoutTime.toISOString())
  } else {
    window.localStorage.removeItem(LOCKOUT_STORAGE_KEY)
  }
}

let authSubscription: AuthSubscription | null = null
let stopUserWatcher: WatchStopHandle | null = null

export interface AuthUser {
  id: string
  email: string
  emailVerified: boolean
  name?: string
  phone?: string
  preferredLanguage: string
  lastLogin?: string
  createdAt: string
  updatedAt?: string
  mfaEnabled: boolean
  mfaFactors: Array<{
    id: string
    type: 'totp'
    status: 'verified' | 'unverified'
    friendlyName?: string
  }>
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  phone?: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
  language: 'es' | 'en' | 'ro' | 'ru'
}

export interface AuthState {
  user: AuthUser | null
  loading: boolean
  error: string | null
  lockoutTime: Date | null
  sessionInitialized: boolean
  profileLoading: boolean
  profileError: string | null
  mfaEnrollment: {
    id: string
    qrCode: string
    secret: string
    uri: string
  } | null
  mfaChallenge: {
    factorId: string
    challengeId: string
  } | null
  mfaLoading: boolean
  mfaError: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    loading: false,
    error: null,
    lockoutTime: readPersistedLockout(),
    sessionInitialized: false,
    profileLoading: false,
    profileError: null,
    mfaEnrollment: null,
    mfaChallenge: null,
    mfaLoading: false,
    mfaError: null
  }),

  getters: {
    /**
     * Check if user is authenticated and email is verified
     * Requirement 5.1: Reactive authentication status
     */
    isAuthenticated: (state): boolean => {
      return !!state.user && state.user.emailVerified
    },

    /**
     * Check if user exists but email is not verified
     */
    isEmailVerified: (state): boolean => {
      return state.user?.emailVerified ?? false
    },

    /**
     * Check if account is currently locked
     */
    isAccountLocked: (state): boolean => {
      return state.lockoutTime ? state.lockoutTime > new Date() : false
    },

    /**
     * Get remaining lockout time in minutes
     */
    lockoutMinutesRemaining: (state): number => {
      if (!state.lockoutTime) return 0
      const diff = state.lockoutTime.getTime() - new Date().getTime()
      return Math.ceil(diff / (1000 * 60))
    },

    /**
     * Check if any authentication operation is in progress
     */
    isLoading: (state): boolean => {
      return state.loading || state.profileLoading
    },

    /**
     * Get user's preferred language
     */
    userLanguage: (state): string => {
      return state.user?.preferredLanguage || 'es'
    },

    /**
     * Check if session has been initialized
     */
    isSessionInitialized: (state): boolean => {
      return state.sessionInitialized
    },

    /**
     * Check if user has MFA enabled
     */
    hasMFAEnabled: (state): boolean => {
      return state.user?.mfaEnabled ?? false
    },

    /**
     * Get user's MFA factors
     */
    mfaFactors: (state) => {
      return state.user?.mfaFactors ?? []
    },

    /**
     * Check if MFA enrollment is in progress
     */
    isMFAEnrolling: (state): boolean => {
      return !!state.mfaEnrollment
    },

    /**
     * Check if user requires MFA verification (AAL2)
     */
    requiresMFAVerification: (state): boolean => {
      return state.user?.mfaEnabled && !!state.mfaChallenge
    }
  },

  actions: {
    /**
     * Initialize authentication state with Supabase user
     * Requirement 5.1: Session persistence across browser tabs
     */
    async initializeAuth() {
      if (this.sessionInitialized) return

      try {
        const supabase = useSupabaseClient()
        const supabaseUser = useSupabaseUser()

        if (!stopUserWatcher) {
          stopUserWatcher = watch(supabaseUser, (newUser) => {
            this.syncUserState(newUser)
          }, { immediate: true })
        } else {
          this.syncUserState(supabaseUser.value)
        }

        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error('Failed to fetch auth session:', sessionError)
          if (!this.error) {
            this.error = 'Failed to retrieve authentication session'
          }
        } else if (sessionData?.session?.user) {
          this.syncUserState(sessionData.session.user)
        }

        if (!authSubscription) {
          const { data } = supabase.auth.onAuthStateChange((event, session) => {
            this.handleAuthStateChange(event, session)
          })
          authSubscription = data.subscription
        }

        this.sessionInitialized = true
      } catch (error) {
        console.error('Failed to initialize auth:', error)
        this.error = 'Failed to initialize authentication'
      }
    },

    /**
     * Sync internal user state with Supabase user
     * Requirement 5.3: Reactive authentication status
     */
    async syncUserState(supabaseUser: User | null) {
      if (supabaseUser) {
        // Fetch MFA factors if user is authenticated
        let mfaFactors: Array<{
          id: string
          type: 'totp'
          status: 'verified' | 'unverified'
          friendlyName?: string
        }> = []

        try {
          const supabase = useSupabaseClient()
          const { data, error } = await supabase.auth.mfa.listFactors()
          if (!error && data) {
            mfaFactors = data.totp?.map(factor => ({
              id: factor.id,
              type: 'totp' as const,
              status: factor.status as 'verified' | 'unverified',
              friendlyName: factor.friendly_name
            })) || []
          }
        } catch (error) {
          console.warn('Failed to fetch MFA factors:', error)
        }

        this.user = {
          id: supabaseUser.id,
          email: supabaseUser.email!,
          emailVerified: !!supabaseUser.email_confirmed_at,
          name: supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name,
          phone: supabaseUser.user_metadata?.phone,
          preferredLanguage: supabaseUser.user_metadata?.preferred_language || 'es',
          lastLogin: supabaseUser.last_sign_in_at,
          createdAt: supabaseUser.created_at,
          updatedAt: supabaseUser.updated_at,
          mfaEnabled: mfaFactors.some(f => f.status === 'verified'),
          mfaFactors
        }
        this.error = null
        this.clearLockout()
      } else {
        this.user = null
        this.error = null
        if (this.lockoutTime && this.lockoutTime <= new Date()) {
          this.clearLockout()
        }
      }
    },

    handleAuthStateChange(event: AuthChangeEvent, session: Session | null) {
      if (event === 'TOKEN_REFRESHED') {
        this.error = null
      }

      if (event === 'SIGNED_OUT') {
        this.syncUserState(null)
        return
      }

      this.syncUserState(session?.user ?? null)
    },

    /**
     * User login with comprehensive error handling
     * Requirement 9.1: Proper error handling and loading states
     */
    async login(credentials: LoginCredentials) {
      this.loading = true
      this.error = null
      
      const supabase = useSupabaseClient()
      const { createErrorMessage, translateAuthError } = useAuthMessages()
      const { validateLogin } = useAuthValidation()
      const toastStore = useToastStore()

      try {
        // Validate credentials
        const validation = validateLogin(credentials)
        if (!validation.isValid) {
          const firstError = validation.errors[0]
          throw new Error(firstError.message)
        }

        // Attempt login
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password
        })

        if (error) {
          // Handle specific authentication errors
          if (error.message.includes('Invalid login credentials')) {
            this.error = translateAuthError('Invalid login credentials', 'login')
          } else if (error.message.includes('Email not confirmed')) {
            this.error = translateAuthError('Email not confirmed', 'login')
            // Redirect to verification page
            await navigateTo({
              path: '/auth/verify-email',
              query: {
                message: 'email-verification-required',
                email: credentials.email
              }
            })
            return
          } else if (error.message.includes('Too many requests')) {
            // Handle rate limiting
            this.triggerLockout(15)
            this.error = translateAuthError('Too many requests', 'login')
          } else {
            this.error = translateAuthError(error.message, 'login')
          }
          throw new Error(this.error)
        }

        if (data.user) {
          // Update last login timestamp in user metadata
          await this.updateLastLogin()

          // Check if user has MFA enabled
          const { data: factors } = await supabase.auth.mfa.listFactors()
          const verifiedFactors = factors?.totp?.filter(f => f.status === 'verified') || []

          if (verifiedFactors.length > 0) {
            // User has MFA enabled, redirect to MFA verification page
            const firstFactor = verifiedFactors[0]
            await this.challengeMFA(firstFactor.id)

            const route = useRoute()
            const redirect = route.query.redirect as string
            await navigateTo({
              path: '/auth/mfa-verify',
              query: { redirect: redirect || '/account' }
            })
            return
          }

          toastStore.success(
            'Inicio de sesión exitoso',
            `Bienvenido de vuelta, ${data.user.user_metadata?.name || data.user.email}`
          )

          // Handle redirect after successful login
          const route = useRoute()
          const redirect = route.query.redirect as string
          if (redirect && redirect.startsWith('/')) {
            await navigateTo(redirect)
          } else {
            await navigateTo('/account')
          }
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Login failed'
        this.error = errorMessage
        
        toastStore.error(
          'Error de inicio de sesión',
          errorMessage,
          {
            actionText: 'Reintentar',
            actionHandler: () => this.login(credentials)
          }
        )
        
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * User registration with email verification
     * Requirement 9.1: Proper error handling and loading states
     */
    async register(userData: RegisterData) {
      this.loading = true
      this.error = null
      
      const supabase = useSupabaseClient()
      const { translateAuthError } = useAuthMessages()
      const { validateRegistration } = useAuthValidation()
      const toastStore = useToastStore()

      try {
        // Validate registration data
        const validation = validateRegistration(userData)
        if (!validation.isValid) {
          const firstError = validation.errors[0]
          throw new Error(firstError.message)
        }

        // Attempt registration
        const { data, error } = await supabase.auth.signUp({
          email: userData.email,
          password: userData.password,
          options: {
            data: {
              name: userData.name,
              phone: userData.phone,
              preferred_language: userData.language,
              full_name: userData.name
            }
          }
        })

        if (error) {
          if (error.message.includes('User already registered')) {
            this.error = translateAuthError('User already registered', 'register')
            // Provide link to login page
            toastStore.error(
              'Email ya registrado',
              'Este email ya está registrado. ¿Quieres iniciar sesión?',
              {
                actionText: 'Ir a login',
                actionHandler: () => navigateTo('/auth/login')
              }
            )
          } else {
            this.error = translateAuthError(error.message, 'register')
          }
          throw new Error(this.error)
        }

        if (data.user) {
          toastStore.success(
            'Registro exitoso',
            'Cuenta creada correctamente. Revisa tu email para verificar tu cuenta.'
          )

          // Redirect to verification pending page
          await navigateTo({
            path: '/auth/verification-pending',
            query: { 
              message: 'registration-complete',
              email: userData.email 
            }
          })
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Registration failed'
        this.error = errorMessage
        
        if (!errorMessage.includes('ya registrado')) {
          toastStore.error(
            'Error de registro',
            errorMessage,
            {
              actionText: 'Reintentar',
              actionHandler: () => this.register(userData)
            }
          )
        }
        
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Email verification
     */
    async verifyEmail(token: string) {
      this.loading = true
      this.error = null
      
      const supabase = useSupabaseClient()
      const { translateAuthError } = useAuthMessages()
      const toastStore = useToastStore()

      try {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'email'
        })

        if (error) {
          this.error = translateAuthError(error.message, 'verify')
          throw new Error(this.error)
        }

        toastStore.success(
          'Email verificado',
          'Tu email ha sido verificado correctamente. Ya puedes iniciar sesión.'
        )

        // Redirect to login with success message
        await navigateTo({
          path: '/auth/login',
          query: { message: 'email-verified' }
        })

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Email verification failed'
        this.error = errorMessage
        
        toastStore.error(
          'Error de verificación',
          errorMessage,
          {
            actionText: 'Reenviar email',
            actionHandler: () => this.resendVerification()
          }
        )
        
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Resend verification email
     */
    async resendVerification(email?: string) {
      this.loading = true
      this.error = null
      
      const supabase = useSupabaseClient()
      const { translateAuthError } = useAuthMessages()
      const toastStore = useToastStore()

      try {
        const emailToUse = email || this.user?.email
        if (!emailToUse) {
          throw new Error('Email address is required')
        }

        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: emailToUse
        })

        if (error) {
          this.error = translateAuthError(error.message, 'verify')
          throw new Error(this.error)
        }

        toastStore.success(
          'Email reenviado',
          'Se ha enviado un nuevo email de verificación. Revisa tu bandeja de entrada.'
        )

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to resend verification'
        this.error = errorMessage
        
        toastStore.error(
          'Error al reenviar',
          errorMessage
        )
        
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Password reset request
     */
    async forgotPassword(email: string) {
      this.loading = true
      this.error = null
      
      const supabase = useSupabaseClient()
      const { translateAuthError } = useAuthMessages()
      const toastStore = useToastStore()

      try {
        const redirectTo = process.client
          ? new URL('/auth/reset-password', window.location.origin).toString()
          : undefined

        const { error } = await supabase.auth.resetPasswordForEmail(
          email,
          redirectTo ? { redirectTo } : undefined
        )

        if (error) {
          this.error = translateAuthError(error.message, 'reset')
          throw new Error(this.error)
        }

        toastStore.success(
          'Instrucciones enviadas',
          'Si el email existe, recibirás instrucciones para restablecer tu contraseña.'
        )

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Password reset request failed'
        this.error = errorMessage
        
        toastStore.error(
          'Error al solicitar restablecimiento',
          errorMessage,
          {
            actionText: 'Reintentar',
            actionHandler: () => this.forgotPassword(email)
          }
        )
        
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Password reset with new password
     */
    async resetPassword(password: string) {
      this.loading = true
      this.error = null
      
      const supabase = useSupabaseClient()
      const { translateAuthError } = useAuthMessages()
      const toastStore = useToastStore()

      try {
        const { error } = await supabase.auth.updateUser({
          password: password
        })

        if (error) {
          this.error = translateAuthError(error.message, 'reset')
          throw new Error(this.error)
        }

        toastStore.success(
          'Contraseña actualizada',
          'Tu contraseña ha sido actualizada correctamente.'
        )

        // Redirect to login with success message
        await navigateTo({
          path: '/auth/login',
          query: { message: 'password-reset' }
        })

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Password reset failed'
        this.error = errorMessage
        
        toastStore.error(
          'Error al restablecer contraseña',
          errorMessage,
          {
            actionText: 'Reintentar',
            actionHandler: () => this.resetPassword(password)
          }
        )
        
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * User logout with session cleanup
     * Requirement 5.10, 5.11, 5.12: Proper logout with cleanup and redirect
     */
    async logout() {
      this.loading = true
      
      const supabase = useSupabaseClient()
      const toastStore = useToastStore()

      try {
        // Sign out from Supabase (invalidates session)
        const { error } = await supabase.auth.signOut()
        
        if (error) {
          console.warn('Logout error:', error)
          // Continue with logout even if server request fails
        }

        // Clear local state
        this.user = null
        this.error = null
        this.lockoutTime = null
        persistLockout(null)

        toastStore.success(
          'Sesión cerrada',
          'Has cerrado sesión correctamente.'
        )

        // Redirect to homepage with logout confirmation
        await navigateTo({
          path: '/',
          query: { message: 'logged-out' }
        })

      } catch (error) {
        console.error('Logout failed:', error)
        
        // Force logout even if there's an error
        this.user = null
        this.error = null
        this.lockoutTime = null
        persistLockout(null)
        
        await navigateTo('/')
      } finally {
        this.loading = false
      }
    },

    /**
     * Update user profile
     * Requirement 9.2: User profile management functionality
     */
    async updateProfile(profileData: Partial<AuthUser>) {
      this.profileLoading = true
      this.profileError = null
      
      const supabase = useSupabaseClient()
      const toastStore = useToastStore()

      try {
        const { error } = await supabase.auth.updateUser({
          data: {
            name: profileData.name,
            phone: profileData.phone,
            preferred_language: profileData.preferredLanguage,
            full_name: profileData.name
          }
        })

        if (error) {
          this.profileError = error.message
          throw new Error(error.message)
        }

        // Update local user state
        if (this.user) {
          this.user = {
            ...this.user,
            ...profileData,
            updatedAt: new Date().toISOString()
          }
        }

        toastStore.success(
          'Perfil actualizado',
          'Tu perfil ha sido actualizado correctamente.'
        )

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Profile update failed'
        this.profileError = errorMessage
        
        toastStore.error(
          'Error al actualizar perfil',
          errorMessage,
          {
            actionText: 'Reintentar',
            actionHandler: () => this.updateProfile(profileData)
          }
        )
        
        throw error
      } finally {
        this.profileLoading = false
      }
    },

    /**
     * Update last login timestamp
     */
    async updateLastLogin() {
      try {
        const supabase = useSupabaseClient()
        await supabase.auth.updateUser({
          data: {
            last_login: new Date().toISOString()
          }
        })
      } catch (error) {
        // Non-critical error, just log it
        console.warn('Failed to update last login:', error)
      }
    },

    /**
     * Clear all authentication errors
     */
    clearError() {
      this.error = null
      this.profileError = null
    },

    /**
     * Clear lockout state (for testing or manual override)
     */
    clearLockout() {
      this.lockoutTime = null
      persistLockout(null)
    },

    /**
     * Trigger an account lockout for the specified duration (minutes)
     */
    triggerLockout(durationMinutes = 15) {
      const lockoutDurationMs = Math.max(durationMinutes, 1) * 60 * 1000
      const lockoutDeadline = new Date(Date.now() + lockoutDurationMs)
      this.lockoutTime = lockoutDeadline
      persistLockout(lockoutDeadline)
      return lockoutDeadline
    },

    /**
     * Refresh user session
     * Requirement 5.4: Automatic token refresh during user activity
     */
    async refreshSession() {
      try {
        const supabase = useSupabaseClient()
        const { error } = await supabase.auth.refreshSession()

        if (error) {
          console.warn('Session refresh failed:', error)
          // Let Supabase handle automatic logout if refresh fails
        }
      } catch (error) {
        console.warn('Session refresh error:', error)
      }
    },

    // ============================================
    // Multi-Factor Authentication (MFA) Methods
    // ============================================

    /**
     * Start MFA enrollment - generates QR code and secret
     */
    async enrollMFA(friendlyName?: string) {
      this.mfaLoading = true
      this.mfaError = null

      const supabase = useSupabaseClient()
      const toastStore = useToastStore()

      try {
        const { data, error } = await supabase.auth.mfa.enroll({
          factorType: 'totp',
          friendlyName: friendlyName || 'Authenticator App'
        })

        if (error) {
          this.mfaError = error.message
          throw new Error(error.message)
        }

        if (data) {
          this.mfaEnrollment = {
            id: data.id,
            qrCode: data.totp.qr_code,
            secret: data.totp.secret,
            uri: data.totp.uri
          }

          toastStore.success(
            'MFA Enrollment Started',
            'Scan the QR code with your authenticator app'
          )

          return data
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'MFA enrollment failed'
        this.mfaError = errorMessage

        toastStore.error(
          'MFA Enrollment Error',
          errorMessage
        )

        throw error
      } finally {
        this.mfaLoading = false
      }
    },

    /**
     * Verify and complete MFA enrollment with a code from authenticator app
     */
    async verifyMFAEnrollment(code: string) {
      if (!this.mfaEnrollment) {
        throw new Error('No MFA enrollment in progress')
      }

      this.mfaLoading = true
      this.mfaError = null

      const supabase = useSupabaseClient()
      const toastStore = useToastStore()

      try {
        const { data, error } = await supabase.auth.mfa.challengeAndVerify({
          factorId: this.mfaEnrollment.id,
          code
        })

        if (error) {
          this.mfaError = error.message
          throw new Error(error.message)
        }

        // Refresh user state to update MFA factors
        const supabaseUser = useSupabaseUser()
        await this.syncUserState(supabaseUser.value)

        // Clear enrollment data
        this.mfaEnrollment = null

        toastStore.success(
          'MFA Enabled',
          'Two-factor authentication has been enabled successfully'
        )

        return data
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'MFA verification failed'
        this.mfaError = errorMessage

        toastStore.error(
          'Invalid Code',
          'The code you entered is invalid or has expired. Please try again.'
        )

        throw error
      } finally {
        this.mfaLoading = false
      }
    },

    /**
     * Cancel MFA enrollment
     */
    cancelMFAEnrollment() {
      this.mfaEnrollment = null
      this.mfaError = null
    },

    /**
     * Create MFA challenge for verification during login
     */
    async challengeMFA(factorId: string) {
      this.mfaLoading = true
      this.mfaError = null

      const supabase = useSupabaseClient()

      try {
        const { data, error } = await supabase.auth.mfa.challenge({
          factorId
        })

        if (error) {
          this.mfaError = error.message
          throw new Error(error.message)
        }

        if (data) {
          this.mfaChallenge = {
            factorId,
            challengeId: data.id
          }

          return data
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'MFA challenge failed'
        this.mfaError = errorMessage
        throw error
      } finally {
        this.mfaLoading = false
      }
    },

    /**
     * Verify MFA code during login
     */
    async verifyMFA(code: string) {
      if (!this.mfaChallenge) {
        throw new Error('No MFA challenge in progress')
      }

      this.mfaLoading = true
      this.mfaError = null

      const supabase = useSupabaseClient()
      const toastStore = useToastStore()

      try {
        const { data, error } = await supabase.auth.mfa.verify({
          factorId: this.mfaChallenge.factorId,
          challengeId: this.mfaChallenge.challengeId,
          code
        })

        if (error) {
          this.mfaError = error.message
          throw new Error(error.message)
        }

        // Clear challenge
        this.mfaChallenge = null

        toastStore.success(
          'Verified',
          'MFA verification successful'
        )

        return data
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'MFA verification failed'
        this.mfaError = errorMessage

        toastStore.error(
          'Invalid Code',
          'The code you entered is invalid or has expired'
        )

        throw error
      } finally {
        this.mfaLoading = false
      }
    },

    /**
     * Unenroll/remove MFA factor
     */
    async unenrollMFA(factorId: string) {
      this.mfaLoading = true
      this.mfaError = null

      const supabase = useSupabaseClient()
      const toastStore = useToastStore()

      try {
        const { error } = await supabase.auth.mfa.unenroll({
          factorId
        })

        if (error) {
          this.mfaError = error.message
          throw new Error(error.message)
        }

        // Refresh user state to update MFA factors
        const supabaseUser = useSupabaseUser()
        await this.syncUserState(supabaseUser.value)

        toastStore.success(
          'MFA Disabled',
          'Two-factor authentication has been disabled'
        )
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to disable MFA'
        this.mfaError = errorMessage

        toastStore.error(
          'Error',
          errorMessage
        )

        throw error
      } finally {
        this.mfaLoading = false
      }
    },

    /**
     * Check Authenticator Assurance Level (AAL)
     * AAL1 = password only, AAL2 = password + MFA
     */
    async checkAAL() {
      const supabase = useSupabaseClient()

      try {
        const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()

        if (error) {
          console.warn('Failed to check AAL:', error)
          return null
        }

        return data
      } catch (error) {
        console.warn('AAL check error:', error)
        return null
      }
    },

    /**
     * Clear MFA errors
     */
    clearMFAError() {
      this.mfaError = null
    }
  }
})
