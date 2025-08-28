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
import type { User } from '@supabase/supabase-js'
import { useAuthMessages } from '~/composables/useAuthMessages'
import { useAuthValidation } from '~/composables/useAuthValidation'
import { useToastStore } from './toast'

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
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    loading: false,
    error: null,
    lockoutTime: null,
    sessionInitialized: false,
    profileLoading: false,
    profileError: null
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
        const supabaseUser = useSupabaseUser()
        
        // Watch for changes in Supabase user state (cross-tab sync)
        watch(supabaseUser, (newUser) => {
          this.syncUserState(newUser)
        }, { immediate: true })

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
    syncUserState(supabaseUser: User | null) {
      if (supabaseUser) {
        this.user = {
          id: supabaseUser.id,
          email: supabaseUser.email!,
          emailVerified: !!supabaseUser.email_confirmed_at,
          name: supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name,
          phone: supabaseUser.user_metadata?.phone,
          preferredLanguage: supabaseUser.user_metadata?.preferred_language || 'es',
          lastLogin: supabaseUser.last_sign_in_at,
          createdAt: supabaseUser.created_at,
          updatedAt: supabaseUser.updated_at
        }
        this.error = null
        this.lockoutTime = null
      } else {
        this.user = null
        this.error = null
        this.lockoutTime = null
      }
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
            this.lockoutTime = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
            this.error = translateAuthError('Too many requests', 'login')
          } else {
            this.error = translateAuthError(error.message, 'login')
          }
          throw new Error(this.error)
        }

        if (data.user) {
          // Update last login timestamp in user metadata
          await this.updateLastLogin()
          
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
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`
        })

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
    }
  }
})