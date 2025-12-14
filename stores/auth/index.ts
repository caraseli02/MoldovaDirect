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
 *
 * This refactored version follows clean code principles:
 * - Single Responsibility: Separated into focused modules
 * - DRY: Shared logic extracted to utility functions
 * - Modularity: MFA, lockout, and test user concerns separated
 */

import { defineStore } from 'pinia'
import type { SupabaseClient, User as SupabaseUser, Session as SupabaseSession } from '@supabase/supabase-js'
import type { WatchStopHandle } from 'vue'
import { useAuthMessages } from '~/composables/useAuthMessages'
import { useAuthValidation } from '~/composables/useAuthValidation'
import { useToast } from '~/composables/useToast'
import type { TestUserPersonaKey } from '~/lib/testing/testUserPersonas'

// Import modular components
import {
  readPersistedLockout,
  persistLockout,
  isAccountLocked,
  getLockoutMinutesRemaining,
  triggerLockout as triggerAccountLockout,
  clearLockout as clearAccountLockout,
} from './lockout'

import { clearAuthCookies } from '~/utils/authStorage'

import {
  enrollMFA as enrollMFAService,
  verifyMFAEnrollment as verifyMFAEnrollmentService,
  challengeMFA as challengeMFAService,
  verifyMFA as verifyMFAService,
  unenrollMFA as unenrollMFAService,
  fetchMFAFactors,
  checkAAL as checkAALService,
  type MFAEnrollment,
  type MFAChallenge,
} from './mfa'

import {
  readPersistedProgress,
  loadTestPersona,
  toggleTestScriptStep as toggleTestScriptStepUtil,
  updateTestScriptNote as updateTestScriptNoteUtil,
  clearPersonaProgress as clearPersonaProgressUtil,
  clearAllProgress as clearAllProgressUtil,
  getPersonaProgress,
  type TestScriptProgress,
  type TestUserState,
} from './test-users'

import type { AuthUser, LoginCredentials, RegisterData } from './types'

type Subscription = { unsubscribe: () => void }

let authSubscription: Subscription | null = null
let stopUserWatcher: WatchStopHandle | null = null

export interface AuthState extends TestUserState {
  user: AuthUser | null
  loading: boolean
  error: string | null
  lockoutTime: Date | null
  sessionInitialized: boolean
  profileLoading: boolean
  profileError: string | null
  mfaEnrollment: MFAEnrollment | null
  mfaChallenge: MFAChallenge | null
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
    mfaError: null,
    isTestUser: false,
    testPersonaKey: null,
    testScriptProgress: readPersistedProgress(),
    simulationMode: 'normal',
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
      return isAccountLocked(state.lockoutTime)
    },

    /**
     * Get remaining lockout time in minutes
     */
    lockoutMinutesRemaining: (state): number => {
      return getLockoutMinutesRemaining(state.lockoutTime)
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
      return (state.user?.mfaEnabled ?? false) && !!state.mfaChallenge
    },

    /**
     * Check if the current session is powered by the test persona simulator
     */
    isTestSession: (state): boolean => {
      return state.isTestUser
    },

    /**
     * Retrieve the active test persona key for dashboard tooling
     */
    activeTestPersona: (state): TestUserPersonaKey | null => {
      return state.testPersonaKey
    },

    /**
     * Get test script progress for the current persona
     */
    currentPersonaProgress: (state): TestScriptProgress | null => {
      return getPersonaProgress(state.testScriptProgress, state.testPersonaKey)
    },

    /**
     * Get test script progress for a specific persona
     */
    getPersonaProgress: state => (personaKey: TestUserPersonaKey): TestScriptProgress | null => {
      return getPersonaProgress(state.testScriptProgress, personaKey)
    },
  },

  actions: {
    /**
     * Initialize authentication state with Supabase user
     * Requirement 5.1: Session persistence across browser tabs
     */
    async initializeAuth() {
      if (this.isTestUser) {
        this.sessionInitialized = true
        return
      }

      if (this.sessionInitialized) return

      try {
        const supabase = useSupabaseClient()
        const supabaseUser = useSupabaseUser()

        if (!stopUserWatcher) {
          stopUserWatcher = watch(supabaseUser, (newUser) => {
            this.syncUserState(newUser)
          }, { immediate: true })
        }
        else {
          this.syncUserState(supabaseUser.value)
        }

        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error('Failed to fetch auth session:', sessionError)
          if (!this.error) {
            this.error = 'Failed to retrieve authentication session'
          }
        }
        else if (sessionData?.session?.user) {
          this.syncUserState(sessionData.session.user)
        }

        if (!authSubscription) {
          const { data } = supabase.auth.onAuthStateChange((event, session) => {
            this.handleAuthStateChange(event, session)
          })
          authSubscription = data.subscription
        }

        this.sessionInitialized = true
      }
      catch (error: any) {
        console.error('Failed to initialize auth:', error)
        this.error = 'Failed to initialize authentication'
      }
    },

    /**
     * Sync internal user state with Supabase user
     * Requirement 5.3: Reactive authentication status
     */
    async syncUserState(supabaseUser: SupabaseUser | null) {
      if (this.isTestUser && !supabaseUser) {
        return
      }

      if (supabaseUser) {
        // Fetch MFA factors if user is authenticated
        const mfaFactors = await fetchMFAFactors(useSupabaseClient())

        // Type assertion for Supabase user properties
        const user = supabaseUser as any

        this.user = {
          id: user.id,
          email: user.email!,
          emailVerified: !!user.email_confirmed_at,
          name: user.user_metadata?.name || user.user_metadata?.full_name,
          phone: user.user_metadata?.phone,
          preferredLanguage: user.user_metadata?.preferred_language || 'es',
          lastLogin: user.last_sign_in_at,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
          mfaEnabled: mfaFactors.some(f => f.status === 'verified'),
          mfaFactors,
        }
        this.isTestUser = false
        this.testPersonaKey = null
        this.error = null
        this.clearLockout()
      }
      else {
        this.user = null
        this.error = null
        if (this.lockoutTime && this.lockoutTime <= new Date()) {
          this.clearLockout()
        }
      }
    },

    /**
     * Simulate login with a test user persona
     */
    async simulateLogin(personaKey: TestUserPersonaKey) {
      const { user, lockoutTime } = await loadTestPersona(personaKey)

      this.user = user
      this.isTestUser = true
      this.testPersonaKey = personaKey
      this.sessionInitialized = true
      this.loading = false
      this.error = null
      this.profileLoading = false
      this.profileError = null
      this.lockoutTime = lockoutTime

      if (lockoutTime) {
        persistLockout(lockoutTime)
      }
      else {
        persistLockout(null)
      }
    },

    /**
     * Simulate logout for test users
     */
    simulateLogout() {
      persistLockout(null)
      this.user = null
      this.isTestUser = false
      this.testPersonaKey = null
      this.sessionInitialized = true
      this.loading = false
      this.error = null
      this.profileLoading = false
      this.profileError = null
      this.lockoutTime = null
    },

    /**
     * Handle auth state changes from Supabase
     */
    handleAuthStateChange(event: string, session: SupabaseSession | null) {
      if (event === 'TOKEN_REFRESHED') {
        this.error = null
      }

      // Handle password recovery - user clicked reset link in email
      // Don't redirect, let them stay on reset-password page to enter new password
      if (event === 'PASSWORD_RECOVERY') {
        // Type assertion for session properties
        const sessionData = session as any
        this.syncUserState(sessionData?.user ?? null)
        return
      }

      if (event === 'SIGNED_OUT') {
        this.syncUserState(null)

        // Redirect to login page when session expires or user logs out
        if (import.meta.client) {
          const route = useRoute()
          const localePath = useLocalePath()

          // Only redirect if not already on auth pages
          if (!route.path.startsWith('/auth')) {
            navigateTo({
              path: localePath('/auth/login'),
              query: {
                message: 'session-expired',
                redirect: route.fullPath,
              },
            })
          }
        }
        return
      }

      // Type assertion for session properties
      const sessionData = session as any
      this.syncUserState(sessionData?.user ?? null)
    },

    /**
     * User login with comprehensive error handling
     * Requirement 9.1: Proper error handling and loading states
     */
    async login(credentials: LoginCredentials) {
      if (this.isTestUser) {
        this.isTestUser = false
        this.testPersonaKey = null
      }

      this.loading = true
      this.error = null

      const supabase = useSupabaseClient()
      const { translateAuthError } = useAuthMessages()
      const { validateLogin } = useAuthValidation()
      const toastStore = useToast()

      try {
        // Validate credentials
        const validation = validateLogin(credentials)
        if (!validation.isValid) {
          const firstError = validation.errors[0]
          if (!firstError) {
            throw new Error('Validation failed')
          }
          throw new Error(firstError.message)
        }

        // Attempt login
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        })

        if (error) {
          // Handle specific authentication errors
          if (error.message.includes('Invalid login credentials')) {
            this.error = translateAuthError('Invalid login credentials', 'login')
          }
          else if (error.message.includes('Email not confirmed')) {
            this.error = translateAuthError('Email not confirmed', 'login')
            // Redirect to verification page
            await navigateTo({
              path: '/auth/verify-email',
              query: {
                message: 'email-verification-required',
                email: credentials.email,
              },
            })
            return
          }
          else if (error.message.includes('Too many requests')) {
            // Handle rate limiting
            this.lockoutTime = triggerAccountLockout(15)
            this.error = translateAuthError('Too many requests', 'login')
          }
          else {
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

          // Skip MFA in development for test accounts
          const isDev = process.env.NODE_ENV === 'development'
          const isTestAccount = credentials.email.includes('@moldovadirect.com')
          const shouldSkipMFA = isDev && isTestAccount

          if (verifiedFactors.length > 0 && !shouldSkipMFA) {
            // User has MFA enabled, redirect to MFA verification page
            const firstFactor = verifiedFactors[0]
            if (!firstFactor) {
              throw new Error('MFA factor not found')
            }
            await this.challengeMFA(firstFactor.id)

            const route = useRoute()
            const redirect = route.query.redirect as string
            await navigateTo({
              path: '/auth/mfa-verify',
              query: { redirect: redirect || '/account' },
            })
            return
          }

          toastStore.success(
            'Inicio de sesión exitoso',
            `Bienvenido de vuelta, ${data.user.user_metadata?.name || data.user.email}`,
          )

          // Handle redirect after successful login
          const route = useRoute()
          const redirect = route.query.redirect as string
          // Prevent open redirect attacks - only allow relative paths, not protocol-relative URLs
          if (redirect && redirect.startsWith('/') && !redirect.startsWith('//')) {
            await navigateTo(redirect)
          }
          else {
            await navigateTo('/account')
          }
        }
      }
      catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : 'Login failed'
        this.error = errorMessage

        toastStore.error(
          'Error de inicio de sesión',
          errorMessage,
          {
            actionText: 'Reintentar',
            actionHandler: () => this.login(credentials),
          },
        )

        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * User registration with email verification
     * Requirement 9.1: Proper error handling and loading states
     */
    async register(userData: RegisterData) {
      if (this.isTestUser) {
        this.isTestUser = false
        this.testPersonaKey = null
      }

      this.loading = true
      this.error = null

      const supabase = useSupabaseClient()
      const { translateAuthError } = useAuthMessages()
      const { validateRegistration } = useAuthValidation()
      const toastStore = useToast()

      try {
        // Validate registration data
        const validation = validateRegistration(userData)
        if (!validation.isValid) {
          const firstError = validation.errors[0]
          if (!firstError) {
            throw new Error('Validation failed')
          }
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
              full_name: userData.name,
            },
          },
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
                actionHandler: () => navigateTo('/auth/login'),
              },
            )
          }
          else {
            this.error = translateAuthError(error.message, 'register')
          }
          throw new Error(this.error)
        }

        if (data.user) {
          toastStore.success(
            'Registro exitoso',
            'Cuenta creada correctamente. Revisa tu email para verificar tu cuenta.',
          )

          // Redirect to verification pending page
          await navigateTo({
            path: '/auth/verification-pending',
            query: {
              message: 'registration-complete',
              email: userData.email,
            },
          })
        }
      }
      catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : 'Registration failed'
        this.error = errorMessage

        if (!errorMessage.includes('ya registrado')) {
          toastStore.error(
            'Error de registro',
            errorMessage,
            {
              actionText: 'Reintentar',
              actionHandler: () => this.register(userData),
            },
          )
        }

        throw error
      }
      finally {
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
      const toastStore = useToast()

      try {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'email',
        })

        if (error) {
          this.error = translateAuthError(error.message, 'verify')
          throw new Error(this.error)
        }

        toastStore.success(
          'Email verificado',
          'Tu email ha sido verificado correctamente. Ya puedes iniciar sesión.',
        )

        // Redirect to login with success message
        await navigateTo({
          path: '/auth/login',
          query: { message: 'email-verified' },
        })
      }
      catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : 'Email verification failed'
        this.error = errorMessage

        toastStore.error(
          'Error de verificación',
          errorMessage,
          {
            actionText: 'Reenviar email',
            actionHandler: () => this.resendVerification(),
          },
        )

        throw error
      }
      finally {
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
      const toastStore = useToast()

      try {
        const emailToUse = email || this.user?.email
        if (!emailToUse) {
          throw new Error('Email address is required')
        }

        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: emailToUse,
        })

        if (error) {
          this.error = translateAuthError(error.message, 'verify')
          throw new Error(this.error)
        }

        toastStore.success(
          'Email reenviado',
          'Se ha enviado un nuevo email de verificación. Revisa tu bandeja de entrada.',
        )
      }
      catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to resend verification'
        this.error = errorMessage

        toastStore.error(
          'Error al reenviar',
          errorMessage,
        )

        throw error
      }
      finally {
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
      const toastStore = useToast()
      const runtimeConfig = useRuntimeConfig()

      try {
        const siteUrl = runtimeConfig.public.siteUrl || (import.meta.client ? window.location.origin : undefined)
        const redirectTo = siteUrl
          ? new URL('/auth/reset-password', siteUrl).toString()
          : undefined

        const { error } = await supabase.auth.resetPasswordForEmail(
          email,
          redirectTo ? { redirectTo } : undefined,
        )

        if (error) {
          this.error = translateAuthError(error.message, 'reset')
          throw new Error(this.error)
        }

        toastStore.success(
          'Instrucciones enviadas',
          'Si el email existe, recibirás instrucciones para restablecer tu contraseña.',
        )
      }
      catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : 'Password reset request failed'
        this.error = errorMessage

        toastStore.error(
          'Error al solicitar restablecimiento',
          errorMessage,
          {
            actionText: 'Reintentar',
            actionHandler: () => this.forgotPassword(email),
          },
        )

        throw error
      }
      finally {
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
      const toastStore = useToast()

      try {
        const { error } = await supabase.auth.updateUser({
          password: password,
        })

        if (error) {
          this.error = translateAuthError(error.message, 'reset')
          throw new Error(this.error)
        }

        toastStore.success(
          'Contraseña actualizada',
          'Tu contraseña ha sido actualizada correctamente.',
        )

        // Redirect to login with success message
        await navigateTo({
          path: '/auth/login',
          query: { message: 'password-reset' },
        })
      }
      catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : 'Password reset failed'
        this.error = errorMessage

        toastStore.error(
          'Error al restablecer contraseña',
          errorMessage,
          {
            actionText: 'Reintentar',
            actionHandler: () => this.resetPassword(password),
          },
        )

        throw error
      }
      finally {
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
      const toastStore = useToast()

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
        this.isTestUser = false
        this.testPersonaKey = null
        persistLockout(null)

        // Clear all auth cookies including the "remember me" preference
        // This is SSR-friendly and works across the entire app
        clearAuthCookies()

        toastStore.success(
          'Sesión cerrada',
          'Has cerrado sesión correctamente.',
        )

        // Redirect to homepage with logout confirmation
        await navigateTo({
          path: '/',
          query: { message: 'logged-out' },
        })
      }
      catch (error: any) {
        console.error('Logout failed:', error)

        // Force logout even if there's an error
        this.user = null
        this.error = null
        this.lockoutTime = null
        this.isTestUser = false
        this.testPersonaKey = null
        persistLockout(null)

        // Clear auth cookies even on error
        clearAuthCookies()

        await navigateTo('/')
      }
      finally {
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

      const toastStore = useToast()

      try {
        if (this.isTestUser) {
          if (this.user) {
            this.user = {
              ...this.user,
              ...profileData,
            }
          }

          toastStore.info(
            'Modo demo',
            'Los cambios de perfil se han aplicado solo para esta sesión simulada.',
          )

          return
        }

        const supabase = useSupabaseClient()

        const { error } = await supabase.auth.updateUser({
          data: {
            name: profileData.name,
            phone: profileData.phone,
            preferred_language: profileData.preferredLanguage,
            full_name: profileData.name,
          },
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
            updatedAt: new Date().toISOString(),
          }
        }

        toastStore.success(
          'Perfil actualizado',
          'Tu perfil ha sido actualizado correctamente.',
        )
      }
      catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : 'Profile update failed'
        this.profileError = errorMessage

        toastStore.error(
          'Error al actualizar perfil',
          errorMessage,
          {
            actionText: 'Reintentar',
            actionHandler: () => this.updateProfile(profileData),
          },
        )

        throw error
      }
      finally {
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
            last_login: new Date().toISOString(),
          },
        })
      }
      catch (error: any) {
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
      clearAccountLockout()
    },

    /**
     * Trigger an account lockout for the specified duration (minutes)
     */
    triggerLockout(durationMinutes = 15) {
      this.lockoutTime = triggerAccountLockout(durationMinutes)
      return this.lockoutTime
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
      }
      catch (error: any) {
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

      try {
        const enrollment = await enrollMFAService(supabase, friendlyName)
        this.mfaEnrollment = enrollment
        return enrollment
      }
      catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : 'MFA enrollment failed'
        this.mfaError = errorMessage
        throw error
      }
      finally {
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

      try {
        await verifyMFAEnrollmentService(supabase, this.mfaEnrollment.id, code)

        // Refresh user state to update MFA factors
        const supabaseUser = useSupabaseUser()
        await this.syncUserState(supabaseUser.value)

        // Clear enrollment data
        this.mfaEnrollment = null
      }
      catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : 'MFA verification failed'
        this.mfaError = errorMessage
        throw error
      }
      finally {
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
        const challenge = await challengeMFAService(supabase, factorId)
        this.mfaChallenge = challenge
        return challenge
      }
      catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : 'MFA challenge failed'
        this.mfaError = errorMessage
        throw error
      }
      finally {
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

      try {
        await verifyMFAService(supabase, this.mfaChallenge, code)
        // Clear challenge
        this.mfaChallenge = null
      }
      catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : 'MFA verification failed'
        this.mfaError = errorMessage
        throw error
      }
      finally {
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

      try {
        await unenrollMFAService(supabase, factorId)

        // Refresh user state to update MFA factors
        const supabaseUser = useSupabaseUser()
        await this.syncUserState(supabaseUser.value)
      }
      catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to disable MFA'
        this.mfaError = errorMessage
        throw error
      }
      finally {
        this.mfaLoading = false
      }
    },

    /**
     * Check Authenticator Assurance Level (AAL)
     * AAL1 = password only, AAL2 = password + MFA
     */
    async checkAAL() {
      const supabase = useSupabaseClient()
      return await checkAALService(supabase)
    },

    /**
     * Clear MFA errors
     */
    clearMFAError() {
      this.mfaError = null
    },

    // ============================================
    // Test Script Progress Methods
    // ============================================

    /**
     * Toggle completion status of a test script step
     */
    toggleTestScriptStep(personaKey: TestUserPersonaKey, stepIndex: number, totalSteps: number) {
      this.testScriptProgress = toggleTestScriptStepUtil(
        this.testScriptProgress,
        personaKey,
        stepIndex,
        totalSteps,
      )
    },

    /**
     * Add or update a note for a test script step
     */
    updateTestScriptNote(personaKey: TestUserPersonaKey, stepIndex: number, note: string) {
      this.testScriptProgress = updateTestScriptNoteUtil(
        this.testScriptProgress,
        personaKey,
        stepIndex,
        note,
      )
    },

    /**
     * Clear progress for a specific persona
     */
    clearPersonaProgress(personaKey: TestUserPersonaKey) {
      this.testScriptProgress = clearPersonaProgressUtil(this.testScriptProgress, personaKey)
    },

    /**
     * Clear all test script progress
     */
    clearAllProgress() {
      this.testScriptProgress = clearAllProgressUtil()
    },

    /**
     * Set simulation mode for testing different network conditions
     */
    setSimulationMode(mode: import('~/lib/testing/testUserPersonas').SimulationMode) {
      this.simulationMode = mode
    },
  },
})

// Re-export types for convenience
export type { AuthUser, LoginCredentials, RegisterData, TestScriptProgress }
