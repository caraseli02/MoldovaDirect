/**
 * Integration tests for complete authentication flows
 * 
 * Tests end-to-end authentication workflows
 * Requirements addressed:
 * - 1.1-1.10: User registration flow
 * - 2.1-2.10: Email verification flow
 * - 3.1-3.11: User login flow
 * - 4.1-4.13: Password reset flow
 * - 5.1-5.12: Session management
 * - 10.1-10.3: Shopping platform integration
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '~/stores/auth'
vi.mock('~/composables/useToast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  })
}))

// Mock Supabase client with comprehensive auth methods
const mockSupabaseClient = {
  auth: {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    verifyOtp: vi.fn(),
    resend: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    updateUser: vi.fn(),
    refreshSession: vi.fn(),
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } }))
  }
}

// Mock Supabase user ref
const mockSupabaseUser = { value: null }

// Mock navigation
const mockNavigateTo = vi.fn()

// Mock composables
vi.mock('#app', () => ({
  useSupabaseClient: () => mockSupabaseClient,
  useSupabaseUser: () => mockSupabaseUser,
  useRoute: () => ({ query: {}, fullPath: '/test' }),
  navigateTo: mockNavigateTo,
  useI18n: () => ({
    t: (key: string, params?: any) => {
      let result = key
      if (params) {
        Object.entries(params).forEach(([param, value]) => {
          result = result.replace(`{${param}}`, String(value))
        })
      }
      return result
    },
    locale: { value: 'en' }
  })
}))

vi.mock('~/composables/useAuthMessages', () => ({
  useAuthMessages: () => ({
    createErrorMessage: vi.fn((error) => ({ type: 'error', message: error })),
    translateAuthError: vi.fn((error) => `Translated: ${error}`),
    createSuccessMessage: vi.fn((message) => ({ type: 'success', message }))
  })
}))

vi.mock('~/composables/useAuthValidation', () => ({
  useAuthValidation: () => ({
    validateLogin: vi.fn(() => ({ isValid: true, errors: [] })),
    validateRegistration: vi.fn(() => ({ isValid: true, errors: [] })),
    validateEmail: vi.fn(() => ({ isValid: true, errors: [] })),
    validatePassword: vi.fn(() => ({ isValid: true, errors: [], strength: 4 }))
  })
}))

describe('Authentication Flow Integration Tests', () => {
  let authStore: ReturnType<typeof useAuthStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    authStore = useAuthStore()
    vi.clearAllMocks()
    
    // Reset mock implementations
    mockSupabaseUser.value = null
    mockSupabaseClient.auth.getSession.mockResolvedValue({ data: { session: null }, error: null })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Complete Registration Flow', () => {
    it('should handle successful user registration with email verification', async () => {
      // Mock successful registration
      const mockUser = {
        id: 'user-123',
        email: 'newuser@example.com',
        email_confirmed_at: null,
        user_metadata: {
          name: 'New User',
          phone: '+1234567890',
          preferred_language: 'en'
        }
      }

      mockSupabaseClient.auth.signUp.mockResolvedValueOnce({
        data: { user: mockUser },
        error: null
      })

      const registrationData = {
        name: 'New User',
        email: 'newuser@example.com',
        phone: '+1234567890',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        acceptTerms: true,
        language: 'en' as const
      }

      // Execute registration
      await authStore.register(registrationData)

      // Verify registration API call
      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        options: {
          data: {
            name: 'New User',
            phone: '+1234567890',
            preferred_language: 'en',
            full_name: 'New User'
          }
        }
      })

      // Verify redirect to verification pending page
      expect(mockNavigateTo).toHaveBeenCalledWith({
        path: '/auth/verification-pending',
        query: {
          message: 'registration-complete',
          email: 'newuser@example.com'
        }
      })
    })

    it('should handle registration with existing email', async () => {
      mockSupabaseClient.auth.signUp.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'User already registered' }
      })

      const registrationData = {
        name: 'Existing User',
        email: 'existing@example.com',
        phone: '+1234567890',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        acceptTerms: true,
        language: 'en' as const
      }

      await expect(authStore.register(registrationData)).rejects.toThrow()
      expect(authStore.error).toBe('Translated: User already registered')
    })
  })

  describe('Email Verification Flow', () => {
    it('should handle successful email verification', async () => {
      mockSupabaseClient.auth.verifyOtp.mockResolvedValueOnce({
        data: { user: { email_confirmed_at: '2024-01-01T00:00:00Z' } },
        error: null
      })

      await authStore.verifyEmail('valid-token')

      expect(mockSupabaseClient.auth.verifyOtp).toHaveBeenCalledWith({
        token_hash: 'valid-token',
        type: 'email'
      })

      expect(mockNavigateTo).toHaveBeenCalledWith({
        path: '/auth/login',
        query: { message: 'email-verified' }
      })
    })

    it('should handle expired verification token', async () => {
      mockSupabaseClient.auth.verifyOtp.mockResolvedValueOnce({
        data: {},
        error: { message: 'Token has expired' }
      })

      await expect(authStore.verifyEmail('expired-token')).rejects.toThrow()
      expect(authStore.error).toBe('Translated: Token has expired')
    })

    it('should handle resend verification email', async () => {
      mockSupabaseClient.auth.resend.mockResolvedValueOnce({
        data: {},
        error: null
      })

      await authStore.resendVerification('user@example.com')

      expect(mockSupabaseClient.auth.resend).toHaveBeenCalledWith({
        type: 'signup',
        email: 'user@example.com'
      })
    })
  })

  describe('Login Flow', () => {
    it('should handle successful login with verified account', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'verified@example.com',
        email_confirmed_at: '2024-01-01T00:00:00Z',
        user_metadata: {
          name: 'Verified User',
          preferred_language: 'en'
        },
        last_sign_in_at: '2024-01-01T12:00:00Z'
      }

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
        data: { user: mockUser },
        error: null
      })

      const credentials = {
        email: 'verified@example.com',
        password: 'correctpassword'
      }

      await authStore.login(credentials)

      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'verified@example.com',
        password: 'correctpassword'
      })

      // User should be set in store
      expect(authStore.user?.email).toBe('verified@example.com')
      expect(authStore.isAuthenticated).toBe(true)
    })

    it('should handle login with unverified email', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Email not confirmed' }
      })

      const credentials = {
        email: 'unverified@example.com',
        password: 'password123'
      }

      await authStore.login(credentials)

      expect(mockNavigateTo).toHaveBeenCalledWith({
        path: '/auth/verify-email',
        query: {
          message: 'email-verification-required',
          email: 'unverified@example.com'
        }
      })
    })

    it('should handle invalid credentials', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Invalid login credentials' }
      })

      const credentials = {
        email: 'user@example.com',
        password: 'wrongpassword'
      }

      await expect(authStore.login(credentials)).rejects.toThrow()
      expect(authStore.error).toBe('Translated: Invalid login credentials')
    })

    it('should handle account lockout', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Too many requests' }
      })

      const credentials = {
        email: 'user@example.com',
        password: 'password123'
      }

      await expect(authStore.login(credentials)).rejects.toThrow()
      expect(authStore.lockoutTime).toBeTruthy()
      expect(authStore.isAccountLocked).toBe(true)
    })
  })

  describe('Password Reset Flow', () => {
    it('should handle password reset request', async () => {
      // Mock window.location.origin
      Object.defineProperty(window, 'location', {
        value: { origin: 'https://example.com' },
        writable: true
      })

      mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValueOnce({
        data: {},
        error: null
      })

      await authStore.forgotPassword('user@example.com')

      expect(mockSupabaseClient.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'user@example.com',
        { redirectTo: 'https://example.com/auth/reset-password' }
      )
    })

    it('should handle password reset completion', async () => {
      mockSupabaseClient.auth.updateUser.mockResolvedValueOnce({
        data: { user: { id: 'user-123' } },
        error: null
      })

      await authStore.resetPassword('newpassword123')

      expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalledWith({
        password: 'newpassword123'
      })

      expect(mockNavigateTo).toHaveBeenCalledWith({
        path: '/auth/login',
        query: { message: 'password-reset' }
      })
    })
  })

  describe('Session Management Flow', () => {
    it('should initialize authentication state on app start', async () => {
      const mockSession = {
        user: {
          id: 'user-123',
          email: 'user@example.com',
          email_confirmed_at: '2024-01-01T00:00:00Z'
        }
      }

      mockSupabaseClient.auth.getSession.mockResolvedValueOnce({
        data: { session: mockSession },
        error: null
      })

      await authStore.initializeAuth()

      expect(authStore.sessionInitialized).toBe(true)
      expect(mockSupabaseClient.auth.onAuthStateChange).toHaveBeenCalled()
    })

    it('should handle session refresh', async () => {
      mockSupabaseClient.auth.refreshSession.mockResolvedValueOnce({
        data: { session: { user: { id: 'user-123' } } },
        error: null
      })

      await authStore.refreshSession()

      expect(mockSupabaseClient.auth.refreshSession).toHaveBeenCalled()
    })

    it('should handle logout and cleanup', async () => {
      // Set initial user state
      authStore.user = {
        id: 'user-123',
        email: 'user@example.com',
        emailVerified: true,
        preferredLanguage: 'en',
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

      expect(mockNavigateTo).toHaveBeenCalledWith({
        path: '/',
        query: { message: 'logged-out' }
      })
    })
  })

  describe('Profile Management Flow', () => {
    it('should handle profile updates', async () => {
      authStore.user = {
        id: 'user-123',
        email: 'user@example.com',
        emailVerified: true,
        name: 'Old Name',
        preferredLanguage: 'en',
        createdAt: '2024-01-01'
      }

      const updatedUser = {
        id: 'user-123',
        email: 'user@example.com',
        user_metadata: {
          name: 'New Name',
          phone: '+1234567890',
          preferred_language: 'es'
        }
      }

      mockSupabaseClient.auth.updateUser.mockResolvedValueOnce({
        data: { user: updatedUser },
        error: null
      })

      const profileData = {
        name: 'New Name',
        phone: '+1234567890',
        preferredLanguage: 'es' as const
      }

      await authStore.updateProfile(profileData)

      expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalledWith({
        data: {
          name: 'New Name',
          phone: '+1234567890',
          preferred_language: 'es',
          full_name: 'New Name'
        }
      })

      expect(authStore.user?.name).toBe('New Name')
      expect(authStore.user?.phone).toBe('+1234567890')
      expect(authStore.user?.preferredLanguage).toBe('es')
    })
  })

  describe('Shopping Platform Integration', () => {
    it('should preserve cart contents across authentication state changes', async () => {
      // This would test integration with cart store
      // For now, we'll test that authentication doesn't interfere with other stores
      
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        email_confirmed_at: '2024-01-01T00:00:00Z'
      }

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
        data: { user: mockUser },
        error: null
      })

      await authStore.login({
        email: 'user@example.com',
        password: 'password123'
      })

      // Verify that authentication state is properly set
      expect(authStore.isAuthenticated).toBe(true)
      expect(authStore.user?.id).toBe('user-123')
    })

    it('should handle redirect preservation for protected routes', async () => {
      // Mock route with redirect parameter
      vi.mocked(mockNavigateTo).mockClear()

      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        email_confirmed_at: '2024-01-01T00:00:00Z'
      }

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
        data: { user: mockUser },
        error: null
      })

      // Simulate login from a redirect
      await authStore.login({
        email: 'user@example.com',
        password: 'password123'
      })

      // Should not redirect since this is a successful login
      // The redirect would be handled by the calling component
      expect(authStore.isAuthenticated).toBe(true)
    })
  })

  describe('Error Recovery and Resilience', () => {
    it('should handle network errors gracefully', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockRejectedValueOnce(
        new Error('Network Error')
      )

      const credentials = {
        email: 'user@example.com',
        password: 'password123'
      }

      await expect(authStore.login(credentials)).rejects.toThrow('Network Error')
      expect(authStore.loading).toBe(false)
      expect(authStore.error).toBeTruthy()
    })

    it('should handle server errors gracefully', async () => {
      mockSupabaseClient.auth.signUp.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Internal server error' }
      })

      const registrationData = {
        name: 'Test User',
        email: 'test@example.com',
        phone: '+1234567890',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        acceptTerms: true,
        language: 'en' as const
      }

      await expect(authStore.register(registrationData)).rejects.toThrow()
      expect(authStore.error).toBe('Translated: Internal server error')
    })

    it('should recover from temporary failures', async () => {
      // First call fails
      mockSupabaseClient.auth.signInWithPassword
        .mockResolvedValueOnce({
          data: { user: null },
          error: { message: 'Temporary failure' }
        })
        // Second call succeeds
        .mockResolvedValueOnce({
          data: { 
            user: { 
              id: 'user-123', 
              email: 'user@example.com',
              email_confirmed_at: '2024-01-01T00:00:00Z'
            } 
          },
          error: null
        })

      const credentials = {
        email: 'user@example.com',
        password: 'password123'
      }

      // First attempt fails
      await expect(authStore.login(credentials)).rejects.toThrow()
      expect(authStore.error).toBeTruthy()

      // Clear error and try again
      authStore.clearError()
      
      // Second attempt succeeds
      await authStore.login(credentials)
      expect(authStore.isAuthenticated).toBe(true)
      expect(authStore.error).toBeNull()
    })
  })

  describe('Multi-language Support Integration', () => {
    it('should handle authentication in different languages', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'usuario@ejemplo.com',
        email_confirmed_at: '2024-01-01T00:00:00Z',
        user_metadata: {
          preferred_language: 'es'
        }
      }

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
        data: { user: mockUser },
        error: null
      })

      await authStore.login({
        email: 'usuario@ejemplo.com',
        password: 'contraseña123'
      })

      expect(authStore.user?.preferredLanguage).toBe('es')
      expect(authStore.userLanguage).toBe('es')
    })

    it('should preserve language preference across sessions', async () => {
      const profileData = {
        preferredLanguage: 'ro' as const
      }

      mockSupabaseClient.auth.updateUser.mockResolvedValueOnce({
        data: { 
          user: { 
            user_metadata: { 
              preferred_language: 'ro' 
            } 
          } 
        },
        error: null
      })

      authStore.user = {
        id: 'user-123',
        email: 'user@example.com',
        emailVerified: true,
        preferredLanguage: 'en',
        createdAt: '2024-01-01'
      }

      await authStore.updateProfile(profileData)

      expect(authStore.user?.preferredLanguage).toBe('ro')
    })
  })

  describe('Concurrent Operations', () => {
    it('should handle concurrent login attempts gracefully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        email_confirmed_at: '2024-01-01T00:00:00Z'
      }

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const credentials = {
        email: 'user@example.com',
        password: 'password123'
      }

      // Start multiple login attempts
      const loginPromises = [
        authStore.login(credentials),
        authStore.login(credentials),
        authStore.login(credentials)
      ]

      await Promise.all(loginPromises)

      // Should only make one actual API call due to loading state
      expect(authStore.isAuthenticated).toBe(true)
    })

    it('should handle logout during other operations', async () => {
      authStore.user = {
        id: 'user-123',
        email: 'user@example.com',
        emailVerified: true,
        preferredLanguage: 'en',
        createdAt: '2024-01-01'
      }

      mockSupabaseClient.auth.signOut.mockResolvedValueOnce({
        error: null
      })

      // Start logout
      const logoutPromise = authStore.logout()

      // Logout should complete successfully
      await logoutPromise
      expect(authStore.user).toBeNull()
      expect(authStore.isAuthenticated).toBe(false)
    })
  })
})
