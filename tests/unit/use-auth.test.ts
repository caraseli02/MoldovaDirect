/**
 * Unit tests for useAuth composable
 * 
 * Tests the authentication composable wrapper and utility functions
 * Requirements addressed:
 * - 5.1: Session persistence across browser tabs
 * - 5.3: Reactive authentication status
 * - 9.1: Proper error handling and loading states
 * - 9.2: User profile management functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuth } from '~/composables/useAuth'
import { useAuthStore } from '~/stores/auth'

// Mock router and route
const mockRouter = {
  push: vi.fn(),
  replace: vi.fn()
}

const mockRoute = {
  fullPath: '/test-path',
  path: '/test-path',
  query: {}
}

global.useRouter = vi.fn(() => mockRouter)
global.useRoute = vi.fn(() => mockRoute)

describe('useAuth Composable', () => {
  let authStore: ReturnType<typeof useAuthStore>
  let auth: ReturnType<typeof useAuth>

  beforeEach(() => {
    setActivePinia(createPinia())
    authStore = useAuthStore()
    auth = useAuth()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Reactive State', () => {
    it('should expose reactive authentication state', () => {
      expect(auth.user.value).toBeNull()
      expect(auth.isAuthenticated.value).toBe(false)
      expect(auth.isEmailVerified.value).toBe(false)
      expect(auth.isLoading.value).toBe(false)
      expect(auth.error.value).toBeNull()
      expect(auth.isAccountLocked.value).toBe(false)
      expect(auth.lockoutMinutesRemaining.value).toBe(0)
      expect(auth.userLanguage.value).toBe('es')
    })

    it('should update reactive state when store changes', () => {
      // Update store state
      authStore.user = {
        id: '1',
        email: 'test@example.com',
        emailVerified: true,
        preferredLanguage: 'en',
        createdAt: '2024-01-01'
      }

      // Check that composable reflects the changes
      expect(auth.user.value?.email).toBe('test@example.com')
      expect(auth.isAuthenticated.value).toBe(true)
      expect(auth.isEmailVerified.value).toBe(true)
      expect(auth.userLanguage.value).toBe('en')
    })
  })

  describe('Authentication Actions', () => {
    it('should call store login method', async () => {
      const loginSpy = vi.spyOn(authStore, 'login').mockResolvedValue()
      const credentials = { email: 'test@example.com', password: 'password123' }

      await auth.login(credentials)

      expect(loginSpy).toHaveBeenCalledWith(credentials)
    })

    it('should call store register method', async () => {
      const registerSpy = vi.spyOn(authStore, 'register').mockResolvedValue()
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        acceptTerms: true,
        language: 'es' as const
      }

      await auth.register(userData)

      expect(registerSpy).toHaveBeenCalledWith(userData)
    })

    it('should call store logout method', async () => {
      const logoutSpy = vi.spyOn(authStore, 'logout').mockResolvedValue()

      await auth.logout()

      expect(logoutSpy).toHaveBeenCalled()
    })

    it('should call store verifyEmail method', async () => {
      const verifySpy = vi.spyOn(authStore, 'verifyEmail').mockResolvedValue()

      await auth.verifyEmail('test-token')

      expect(verifySpy).toHaveBeenCalledWith('test-token')
    })

    it('should call store updateProfile method', async () => {
      const updateSpy = vi.spyOn(authStore, 'updateProfile').mockResolvedValue()
      const profileData = { name: 'New Name' }

      await auth.updateProfile(profileData)

      expect(updateSpy).toHaveBeenCalledWith(profileData)
    })
  })

  describe('Utility Functions', () => {
    it('should clear errors', () => {
      const clearErrorSpy = vi.spyOn(authStore, 'clearError')

      auth.clearError()

      expect(clearErrorSpy).toHaveBeenCalled()
    })

    it('should clear lockout', () => {
      const clearLockoutSpy = vi.spyOn(authStore, 'clearLockout')

      auth.clearLockout()

      expect(clearLockoutSpy).toHaveBeenCalled()
    })
  })

  describe('Route Access Control', () => {
    it('should allow access to public routes', () => {
      expect(auth.canAccessRoute('/')).toBe(true)
      expect(auth.canAccessRoute('/products')).toBe(true)
      expect(auth.canAccessRoute('/about')).toBe(true)
    })

    it('should deny access to protected routes when not authenticated', () => {
      expect(auth.canAccessRoute('/account')).toBe(false)
      expect(auth.canAccessRoute('/cart')).toBe(false)
      expect(auth.canAccessRoute('/checkout')).toBe(false)
      expect(auth.canAccessRoute('/admin')).toBe(false)
    })

    it('should allow access to protected routes when authenticated', () => {
      authStore.user = {
        id: '1',
        email: 'test@example.com',
        emailVerified: true,
        preferredLanguage: 'es',
        createdAt: '2024-01-01'
      }

      expect(auth.canAccessRoute('/account')).toBe(true)
      expect(auth.canAccessRoute('/cart')).toBe(true)
      expect(auth.canAccessRoute('/checkout')).toBe(true)
    })
  })

  describe('Redirect Functions', () => {
    it('should redirect to login with current route', () => {
      auth.redirectToLogin()

      expect(global.navigateTo).toHaveBeenCalledWith({
        path: '/auth/login',
        query: { redirect: '/test-path' }
      })
    })

    it('should redirect to login with message', () => {
      auth.redirectToLogin('session-expired')

      expect(global.navigateTo).toHaveBeenCalledWith({
        path: '/auth/login',
        query: { 
          redirect: '/test-path',
          message: 'session-expired'
        }
      })
    })

    it('should not include redirect for home page', () => {
      mockRoute.fullPath = '/'
      
      auth.redirectToLogin()

      expect(global.navigateTo).toHaveBeenCalledWith({
        path: '/auth/login',
        query: {}
      })
    })

    it('should redirect to verification page', () => {
      auth.redirectToVerification('test@example.com')

      expect(global.navigateTo).toHaveBeenCalledWith({
        path: '/auth/verify-email',
        query: {
          message: 'email-verification-required',
          email: 'test@example.com'
        }
      })
    })
  })

  describe('User Display Functions', () => {
    it('should return empty string for display name when no user', () => {
      expect(auth.getUserDisplayName()).toBe('')
    })

    it('should return user name as display name', () => {
      authStore.user = {
        id: '1',
        email: 'test@example.com',
        emailVerified: true,
        name: 'John Doe',
        preferredLanguage: 'es',
        createdAt: '2024-01-01'
      }

      expect(auth.getUserDisplayName()).toBe('John Doe')
    })

    it('should return email username as display name when no name', () => {
      authStore.user = {
        id: '1',
        email: 'johndoe@example.com',
        emailVerified: true,
        preferredLanguage: 'es',
        createdAt: '2024-01-01'
      }

      expect(auth.getUserDisplayName()).toBe('johndoe')
    })

    it('should return empty string for initials when no user', () => {
      expect(auth.getUserInitials()).toBe('')
    })

    it('should return initials from user name', () => {
      authStore.user = {
        id: '1',
        email: 'test@example.com',
        emailVerified: true,
        name: 'John Doe Smith',
        preferredLanguage: 'es',
        createdAt: '2024-01-01'
      }

      expect(auth.getUserInitials()).toBe('JD') // Only first two initials
    })

    it('should return first letter of email when no name', () => {
      authStore.user = {
        id: '1',
        email: 'johndoe@example.com',
        emailVerified: true,
        preferredLanguage: 'es',
        createdAt: '2024-01-01'
      }

      expect(auth.getUserInitials()).toBe('J')
    })
  })

  describe('Attention System', () => {
    it('should not need attention when no user', () => {
      expect(auth.needsAttention.value).toBe(false)
    })

    it('should need attention when email is not verified', () => {
      authStore.user = {
        id: '1',
        email: 'test@example.com',
        emailVerified: false,
        preferredLanguage: 'es',
        createdAt: '2024-01-01'
      }

      expect(auth.needsAttention.value).toBe(true)
    })

    it('should not need attention when email is verified', () => {
      authStore.user = {
        id: '1',
        email: 'test@example.com',
        emailVerified: true,
        preferredLanguage: 'es',
        createdAt: '2024-01-01'
      }

      expect(auth.needsAttention.value).toBe(false)
    })

    it('should return appropriate attention message', () => {
      authStore.user = {
        id: '1',
        email: 'test@example.com',
        emailVerified: false,
        preferredLanguage: 'es',
        createdAt: '2024-01-01'
      }

      expect(auth.getAttentionMessage()).toBe('Por favor verifica tu email para acceder a todas las funciones')
    })

    it('should return empty attention message when no issues', () => {
      authStore.user = {
        id: '1',
        email: 'test@example.com',
        emailVerified: true,
        preferredLanguage: 'es',
        createdAt: '2024-01-01'
      }

      expect(auth.getAttentionMessage()).toBe('')
    })
  })

  describe('Session Validation', () => {
    it('should have invalid session when not authenticated', () => {
      expect(auth.isSessionValid.value).toBe(false)
    })

    it('should have invalid session when account is locked', () => {
      authStore.user = {
        id: '1',
        email: 'test@example.com',
        emailVerified: true,
        preferredLanguage: 'es',
        createdAt: '2024-01-01'
      }
      authStore.lockoutTime = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now

      expect(auth.isSessionValid.value).toBe(false)
    })

    it('should have valid session when authenticated and not locked', () => {
      authStore.user = {
        id: '1',
        email: 'test@example.com',
        emailVerified: true,
        preferredLanguage: 'es',
        createdAt: '2024-01-01'
      }

      expect(auth.isSessionValid.value).toBe(true)
    })
  })

  describe('Lockout Time Formatting', () => {
    it('should return empty string when no lockout', () => {
      expect(auth.formatLockoutTime()).toBe('')
    })

    it('should format single minute correctly', () => {
      authStore.lockoutTime = new Date(Date.now() + 1 * 60 * 1000) // 1 minute from now

      expect(auth.formatLockoutTime()).toBe('1 minuto')
    })

    it('should format multiple minutes correctly', () => {
      authStore.lockoutTime = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes from now

      expect(auth.formatLockoutTime()).toBe('5 minutos')
    })

    it('should return empty string for expired lockout', () => {
      authStore.lockoutTime = new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago

      expect(auth.formatLockoutTime()).toBe('')
    })
  })

  describe('Initialization', () => {
    it('should ensure initialization when not initialized', async () => {
      const initSpy = vi.spyOn(authStore, 'initializeAuth').mockResolvedValue()
      authStore.sessionInitialized = false

      await auth.ensureInitialized()

      expect(initSpy).toHaveBeenCalled()
    })

    it('should not reinitialize when already initialized', async () => {
      const initSpy = vi.spyOn(authStore, 'initializeAuth').mockResolvedValue()
      authStore.sessionInitialized = true

      await auth.ensureInitialized()

      expect(initSpy).not.toHaveBeenCalled()
    })
  })
})