/**
 * Unit tests for Authentication Store
 * 
 * Tests all store actions, getters, and state management
 * Requirements addressed:
 * - 5.1: Session persistence across browser tabs
 * - 5.3: Reactive authentication status
 * - 9.1: Proper error handling and loading states
 * - 9.2: User profile management functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import type { AuthUser, LoginCredentials, RegisterData } from '~/stores/auth'
import { testUserPersonas } from '~/lib/testing/testUserPersonas'

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    verifyOtp: vi.fn(),
    resend: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    updateUser: vi.fn(),
    refreshSession: vi.fn(),
    getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
    onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } }))
  }
}

// Mock Supabase user ref
const mockSupabaseUser = { value: null }

// Mock composables
vi.mock('~/composables/useAuthMessages', () => ({
  useAuthMessages: () => ({
    createErrorMessage: vi.fn((error) => ({ type: 'error', message: error })),
    translateAuthError: vi.fn((error, context) => `Translated: ${error}`),
    createSuccessMessage: vi.fn((message) => ({ type: 'success', message }))
  })
}))

vi.mock('~/composables/useAuthValidation', () => ({
  useAuthValidation: () => ({
    validateLogin: vi.fn((data) => ({ isValid: true, errors: [] })),
    validateRegistration: vi.fn((data) => ({ isValid: true, errors: [] }))
  })
}))

// Mock toast store
vi.mock('~/stores/toast', () => ({
  useToastStore: () => ({
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  })
}))

// Mock Nuxt composables
global.useSupabaseClient = vi.fn(() => mockSupabaseClient)
global.useSupabaseUser = vi.fn(() => mockSupabaseUser)
global.useRoute = vi.fn(() => ({ query: {} }))
global.navigateTo = vi.fn()
global.watch = vi.fn((source, callback, options) => {
  if (options?.immediate) {
    callback(source.value)
  }
  return vi.fn() // unwatch function
})
const runtimeConfigMock = {
  public: {
    enableTestUsers: true
  }
}
;(global as any).useRuntimeConfig = vi.fn(() => runtimeConfigMock)

describe('Authentication Store', () => {
  let authStore: ReturnType<typeof useAuthStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    authStore = useAuthStore()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      expect(authStore.user).toBeNull()
      expect(authStore.loading).toBe(false)
      expect(authStore.error).toBeNull()
      expect(authStore.lockoutTime).toBeNull()
      expect(authStore.sessionInitialized).toBe(false)
      expect(authStore.profileLoading).toBe(false)
      expect(authStore.profileError).toBeNull()
    })
  })

  describe('Getters', () => {
    it('should return false for isAuthenticated when user is null', () => {
      expect(authStore.isAuthenticated).toBe(false)
    })

    it('should return false for isAuthenticated when email is not verified', () => {
      authStore.user = {
        id: '1',
        email: 'test@example.com',
        emailVerified: false,
        preferredLanguage: 'es',
        createdAt: '2024-01-01'
      }
      expect(authStore.isAuthenticated).toBe(false)
    })

    it('should return true for isAuthenticated when user exists and email is verified', () => {
      authStore.user = {
        id: '1',
        email: 'test@example.com',
        emailVerified: true,
        preferredLanguage: 'es',
        createdAt: '2024-01-01'
      }
      expect(authStore.isAuthenticated).toBe(true)
    })

    it('should return correct email verification status', () => {
      authStore.user = {
        id: '1',
        email: 'test@example.com',
        emailVerified: true,
        preferredLanguage: 'es',
        createdAt: '2024-01-01'
      }
      expect(authStore.isEmailVerified).toBe(true)
    })

    it('should return false for isAccountLocked when no lockout time', () => {
      expect(authStore.isAccountLocked).toBe(false)
    })

    it('should return true for isAccountLocked when lockout time is in future', () => {
      authStore.lockoutTime = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
      expect(authStore.isAccountLocked).toBe(true)
    })

    it('should return false for isAccountLocked when lockout time is in past', () => {
      authStore.lockoutTime = new Date(Date.now() - 10 * 60 * 1000) // 10 minutes ago
      expect(authStore.isAccountLocked).toBe(false)
    })

    it('should calculate lockout minutes remaining correctly', () => {
      authStore.lockoutTime = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes from now
      expect(authStore.lockoutMinutesRemaining).toBe(5)
    })

    it('should return user language preference', () => {
      authStore.user = {
        id: '1',
        email: 'test@example.com',
        emailVerified: true,
        preferredLanguage: 'en',
        createdAt: '2024-01-01'
      }
      expect(authStore.userLanguage).toBe('en')
    })

    it('should return default language when no user', () => {
      expect(authStore.userLanguage).toBe('es')
    })

    it('should report simulation getters as null when inactive', () => {
      expect(authStore.isTestSession).toBe(false)
      expect(authStore.activeTestPersona).toBeNull()
    })
  })

  describe('Authentication Initialization', () => {
    it('should initialize auth and set up user state watcher', async () => {
      await authStore.initializeAuth()
      
      expect(authStore.sessionInitialized).toBe(true)
      expect(global.watch).toHaveBeenCalled()
    })

    it('should not reinitialize if already initialized', async () => {
      authStore.sessionInitialized = true
      const watchSpy = vi.mocked(global.watch)
      watchSpy.mockClear()
      
      await authStore.initializeAuth()
      
      expect(watchSpy).not.toHaveBeenCalled()
    })
  })

  describe('User State Synchronization', () => {
    it('should sync user state from Supabase user', () => {
      const supabaseUser = {
        id: 'user-123',
        email: 'test@example.com',
        email_confirmed_at: '2024-01-01T00:00:00Z',
        user_metadata: {
          name: 'Test User',
          phone: '+1234567890',
          preferred_language: 'en'
        },
        last_sign_in_at: '2024-01-01T12:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T12:00:00Z'
      }

      authStore.syncUserState(supabaseUser as any)

      expect(authStore.user).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        emailVerified: true,
        name: 'Test User',
        phone: '+1234567890',
        preferredLanguage: 'en',
        lastLogin: '2024-01-01T12:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T12:00:00Z'
      })
      expect(authStore.error).toBeNull()
      expect(authStore.lockoutTime).toBeNull()
    })

    it('should clear user state when Supabase user is null', () => {
      // Set initial user state
      authStore.user = {
        id: '1',
        email: 'test@example.com',
        emailVerified: true,
        preferredLanguage: 'es',
        createdAt: '2024-01-01'
      }

      authStore.syncUserState(null)

      expect(authStore.user).toBeNull()
      expect(authStore.error).toBeNull()
      expect(authStore.lockoutTime).toBeNull()
    })
  })

  describe('Test Persona Simulator', () => {
    beforeEach(() => {
      runtimeConfigMock.public.enableTestUsers = true
    })

    it('should activate persona when simulation is enabled', () => {
      authStore.simulateLogin('first-order-explorer')

      expect(authStore.isTestSession).toBe(true)
      expect(authStore.activeTestPersona).toBe('first-order-explorer')
      expect(authStore.user?.email).toBe(testUserPersonas['first-order-explorer'].user.email)
    })

    it('should apply lockout timer when persona defines it', () => {
      authStore.simulateLogin('recovery-seeker')

      expect(authStore.lockoutTime).toBeInstanceOf(Date)
      expect(authStore.lockoutMinutesRemaining).toBeGreaterThan(0)
    })

    it('should prevent persona activation when feature is disabled', () => {
      runtimeConfigMock.public.enableTestUsers = false

      expect(() => authStore.simulateLogin('first-order-explorer')).toThrowError(/disabled/i)

      runtimeConfigMock.public.enableTestUsers = true
    })

    it('should preserve simulated user when Supabase emits null event', () => {
      authStore.simulateLogin('first-order-explorer')
      const currentEmail = authStore.user?.email

      authStore.syncUserState(null)

      expect(authStore.user?.email).toBe(currentEmail)
    })

    it('should clear persona state on simulateLogout', () => {
      authStore.simulateLogin('first-order-explorer')
      authStore.simulateLogout()

      expect(authStore.user).toBeNull()
      expect(authStore.isTestSession).toBe(false)
      expect(authStore.activeTestPersona).toBeNull()
    })

    it('should update profile locally while in simulation mode', async () => {
      authStore.simulateLogin('first-order-explorer')
      mockSupabaseClient.auth.updateUser.mockClear()

      await authStore.updateProfile({ name: 'Persona Edited' })

      expect(authStore.user?.name).toBe('Persona Edited')
      expect(mockSupabaseClient.auth.updateUser).not.toHaveBeenCalled()
    })
  })

  describe('Login', () => {
    const validCredentials: LoginCredentials = {
      email: 'test@example.com',
      password: 'password123'
    }

    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: { name: 'Test User' }
      }

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
        data: { user: mockUser },
        error: null
      })

      await authStore.login(validCredentials)

      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
      expect(authStore.loading).toBe(false)
      expect(authStore.error).toBeNull()
    })

    it('should handle invalid credentials error', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Invalid login credentials' }
      })

      await expect(authStore.login(validCredentials)).rejects.toThrow()
      expect(authStore.error).toBe('Translated: Invalid login credentials')
      expect(authStore.loading).toBe(false)
    })

    it('should handle email not confirmed error', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Email not confirmed' }
      })

      await authStore.login(validCredentials)

      expect(global.navigateTo).toHaveBeenCalledWith({
        path: '/auth/verify-email',
        query: {
          message: 'email-verification-required',
          email: 'test@example.com'
        }
      })
    })

    it('should handle rate limiting error', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Too many requests' }
      })

      await expect(authStore.login(validCredentials)).rejects.toThrow()
      expect(authStore.lockoutTime).toBeTruthy()
      expect(authStore.error).toBe('Translated: Too many requests')
    })

    it('should set loading state during login', async () => {
      let loadingDuringCall = false
      
      mockSupabaseClient.auth.signInWithPassword.mockImplementationOnce(async () => {
        loadingDuringCall = authStore.loading
        return { data: { user: null }, error: { message: 'Test error' } }
      })

      try {
        await authStore.login(validCredentials)
      } catch (error) {
        // Expected to throw
      }

      expect(loadingDuringCall).toBe(true)
      expect(authStore.loading).toBe(false)
    })
  })

  describe('Registration', () => {
    const validRegistrationData: RegisterData = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '+1234567890',
      password: 'password123',
      confirmPassword: 'password123',
      acceptTerms: true,
      language: 'es'
    }

    it('should register successfully with valid data', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com'
      }

      mockSupabaseClient.auth.signUp.mockResolvedValueOnce({
        data: { user: mockUser },
        error: null
      })

      await authStore.register(validRegistrationData)

      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: {
            name: 'Test User',
            phone: '+1234567890',
            preferred_language: 'es',
            full_name: 'Test User'
          }
        }
      })
      expect(global.navigateTo).toHaveBeenCalledWith({
        path: '/auth/verification-pending',
        query: {
          message: 'registration-complete',
          email: 'test@example.com'
        }
      })
    })

    it('should handle user already registered error', async () => {
      mockSupabaseClient.auth.signUp.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'User already registered' }
      })

      await expect(authStore.register(validRegistrationData)).rejects.toThrow()
      expect(authStore.error).toBe('Translated: User already registered')
    })

    it('should set loading state during registration', async () => {
      let loadingDuringCall = false
      
      mockSupabaseClient.auth.signUp.mockImplementationOnce(async () => {
        loadingDuringCall = authStore.loading
        return { data: { user: null }, error: { message: 'Test error' } }
      })

      try {
        await authStore.register(validRegistrationData)
      } catch (error) {
        // Expected to throw
      }

      expect(loadingDuringCall).toBe(true)
      expect(authStore.loading).toBe(false)
    })
  })

  describe('Email Verification', () => {
    it('should verify email successfully', async () => {
      mockSupabaseClient.auth.verifyOtp.mockResolvedValueOnce({
        data: {},
        error: null
      })

      await authStore.verifyEmail('test-token')

      expect(mockSupabaseClient.auth.verifyOtp).toHaveBeenCalledWith({
        token_hash: 'test-token',
        type: 'email'
      })
      expect(global.navigateTo).toHaveBeenCalledWith({
        path: '/auth/login',
        query: { message: 'email-verified' }
      })
    })

    it('should handle verification error', async () => {
      mockSupabaseClient.auth.verifyOtp.mockResolvedValueOnce({
        data: {},
        error: { message: 'Invalid token' }
      })

      await expect(authStore.verifyEmail('invalid-token')).rejects.toThrow()
      expect(authStore.error).toBe('Translated: Invalid token')
    })
  })

  describe('Resend Verification', () => {
    it('should resend verification email successfully', async () => {
      mockSupabaseClient.auth.resend.mockResolvedValueOnce({
        data: {},
        error: null
      })

      await authStore.resendVerification('test@example.com')

      expect(mockSupabaseClient.auth.resend).toHaveBeenCalledWith({
        type: 'signup',
        email: 'test@example.com'
      })
    })

    it('should use current user email if no email provided', async () => {
      authStore.user = {
        id: '1',
        email: 'current@example.com',
        emailVerified: false,
        preferredLanguage: 'es',
        createdAt: '2024-01-01'
      }

      mockSupabaseClient.auth.resend.mockResolvedValueOnce({
        data: {},
        error: null
      })

      await authStore.resendVerification()

      expect(mockSupabaseClient.auth.resend).toHaveBeenCalledWith({
        type: 'signup',
        email: 'current@example.com'
      })
    })

    it('should throw error if no email available', async () => {
      await expect(authStore.resendVerification()).rejects.toThrow('Email address is required')
    })
  })

  describe('Password Reset', () => {
    it('should request password reset successfully', async () => {
      // Mock window.location.origin
      Object.defineProperty(window, 'location', {
        value: { origin: 'https://example.com' },
        writable: true
      })

      const originalProcessClient = (process as any).client
      ;(process as any).client = true

      mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValueOnce({
        data: {},
        error: null
      })

      await authStore.forgotPassword('test@example.com')

      expect(mockSupabaseClient.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        { redirectTo: 'https://example.com/auth/reset-password' }
      )

      if (originalProcessClient === undefined) {
        delete (process as any).client
      } else {
        ;(process as any).client = originalProcessClient
      }
    })

    it('should reset password successfully', async () => {
      mockSupabaseClient.auth.updateUser.mockResolvedValueOnce({
        data: {},
        error: null
      })

      await authStore.resetPassword('newpassword123')

      expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalledWith({
        password: 'newpassword123'
      })
      expect(global.navigateTo).toHaveBeenCalledWith({
        path: '/auth/login',
        query: { message: 'password-reset' }
      })
    })
  })

  describe('Logout', () => {
    it('should logout successfully', async () => {
      // Set initial user state
      authStore.user = {
        id: '1',
        email: 'test@example.com',
        emailVerified: true,
        preferredLanguage: 'es',
        createdAt: '2024-01-01'
      }

      mockSupabaseClient.auth.signOut.mockResolvedValueOnce({
        error: null
      })

      await authStore.logout()

      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled()
      expect(authStore.user).toBeNull()
      expect(authStore.error).toBeNull()
      expect(authStore.lockoutTime).toBeNull()
      expect(global.navigateTo).toHaveBeenCalledWith({
        path: '/',
        query: { message: 'logged-out' }
      })
    })

    it('should force logout even if signOut fails', async () => {
      authStore.user = {
        id: '1',
        email: 'test@example.com',
        emailVerified: true,
        preferredLanguage: 'es',
        createdAt: '2024-01-01'
      }

      mockSupabaseClient.auth.signOut.mockResolvedValueOnce({
        error: { message: 'Network error' }
      })

      await authStore.logout()

      expect(authStore.user).toBeNull()
      expect(global.navigateTo).toHaveBeenCalled()
    })
  })

  describe('Profile Management', () => {
    it('should update profile successfully', async () => {
      authStore.user = {
        id: '1',
        email: 'test@example.com',
        emailVerified: true,
        name: 'Old Name',
        preferredLanguage: 'es',
        createdAt: '2024-01-01'
      }

      const profileData = {
        name: 'New Name',
        phone: '+1234567890',
        preferredLanguage: 'en'
      }

      mockSupabaseClient.auth.updateUser.mockResolvedValueOnce({
        data: {},
        error: null
      })

      await authStore.updateProfile(profileData)

      expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalledWith({
        data: {
          name: 'New Name',
          phone: '+1234567890',
          preferred_language: 'en',
          full_name: 'New Name'
        }
      })

      expect(authStore.user?.name).toBe('New Name')
      expect(authStore.user?.phone).toBe('+1234567890')
      expect(authStore.user?.preferredLanguage).toBe('en')
    })

    it('should handle profile update error', async () => {
      authStore.user = {
        id: '1',
        email: 'test@example.com',
        emailVerified: true,
        preferredLanguage: 'es',
        createdAt: '2024-01-01'
      }

      mockSupabaseClient.auth.updateUser.mockResolvedValueOnce({
        data: {},
        error: { message: 'Update failed' }
      })

      await expect(authStore.updateProfile({ name: 'New Name' })).rejects.toThrow('Update failed')
      expect(authStore.profileError).toBe('Update failed')
    })

    it('should set profile loading state', async () => {
      authStore.user = {
        id: '1',
        email: 'test@example.com',
        emailVerified: true,
        preferredLanguage: 'es',
        createdAt: '2024-01-01'
      }

      let loadingDuringCall = false
      
      mockSupabaseClient.auth.updateUser.mockImplementationOnce(async () => {
        loadingDuringCall = authStore.profileLoading
        return { data: {}, error: null }
      })

      await authStore.updateProfile({ name: 'New Name' })

      expect(loadingDuringCall).toBe(true)
      expect(authStore.profileLoading).toBe(false)
    })
  })

  describe('Session Management', () => {
    it('should refresh session successfully', async () => {
      mockSupabaseClient.auth.refreshSession.mockResolvedValueOnce({
        data: {},
        error: null
      })

      await authStore.refreshSession()

      expect(mockSupabaseClient.auth.refreshSession).toHaveBeenCalled()
    })

    it('should handle session refresh error gracefully', async () => {
      mockSupabaseClient.auth.refreshSession.mockResolvedValueOnce({
        data: {},
        error: { message: 'Refresh failed' }
      })

      // Should not throw error
      await expect(authStore.refreshSession()).resolves.toBeUndefined()
    })

    it('should update last login timestamp', async () => {
      mockSupabaseClient.auth.updateUser.mockResolvedValueOnce({
        data: {},
        error: null
      })

      await authStore.updateLastLogin()

      expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalledWith({
        data: {
          last_login: expect.any(String)
        }
      })
    })
  })

  describe('Utility Methods', () => {
    it('should clear errors', () => {
      authStore.error = 'Test error'
      authStore.profileError = 'Profile error'

      authStore.clearError()

      expect(authStore.error).toBeNull()
      expect(authStore.profileError).toBeNull()
    })

    it('should clear lockout', () => {
      authStore.lockoutTime = new Date()

      authStore.clearLockout()

      expect(authStore.lockoutTime).toBeNull()
    })
  })
})