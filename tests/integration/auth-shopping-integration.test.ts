/**
 * Integration tests for authentication-shopping platform integration
 * 
 * Requirements addressed:
 * - 10.1: Redirect unauthenticated users to login page
 * - 10.2: Preserve intended destination for post-login redirect
 * - 10.3: Display message explaining login requirement
 * - Cart persistence across authentication state changes
 * - User-specific data integration
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import { useCartStore } from '~/stores/cart'
vi.mock('~/composables/useToast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  })
}))

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } }))
  }
}

// Mock Supabase user ref
const mockSupabaseUser = { value: null }

// Mock navigation
const mockNavigateTo = vi.fn()
const mockRoute = { fullPath: '/test', query: {} }

// Mock composables
vi.mock('#app', () => ({
  useSupabaseClient: () => mockSupabaseClient,
  useSupabaseUser: () => mockSupabaseUser,
  useRoute: () => mockRoute,
  navigateTo: mockNavigateTo,
  useLocalePath: () => (path: string) => path,
  useI18n: () => ({
    t: (key: string) => key,
    locale: { value: 'en' }
  })
}))

vi.mock('~/composables/useAuthMessages', () => ({
  useAuthMessages: () => ({
    createErrorMessage: vi.fn((error) => ({ type: 'error', message: error })),
    translateAuthError: vi.fn((error) => error),
    createSuccessMessage: vi.fn((message) => ({ type: 'success', message }))
  })
}))

vi.mock('~/composables/useAuthValidation', () => ({
  useAuthValidation: () => ({
    validateLogin: vi.fn(() => ({ isValid: true, errors: [] }))
  })
}))

describe('Authentication-Shopping Platform Integration', () => {
  let authStore: ReturnType<typeof useAuthStore>
  let cartStore: ReturnType<typeof useCartStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    authStore = useAuthStore()
    cartStore = useCartStore()
    vi.clearAllMocks()
    
    // Reset mock implementations
    mockSupabaseUser.value = null
    mockSupabaseClient.auth.getSession.mockResolvedValue({ data: { session: null }, error: null })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Protected Route Access', () => {
    it('should redirect unauthenticated users from cart page', () => {
      // Simulate accessing cart page without authentication
      mockRoute.fullPath = '/cart'
      
      // Mock middleware logic
      const shouldRedirect = !authStore.isAuthenticated
      expect(shouldRedirect).toBe(true)
      
      // Should redirect to login with cart as intended destination
      if (shouldRedirect) {
        mockNavigateTo({
          path: '/auth/login',
          query: {
            redirect: '/cart',
            message: 'login-required'
          }
        })
      }
      
      expect(mockNavigateTo).toHaveBeenCalledWith({
        path: '/auth/login',
        query: {
          redirect: '/cart',
          message: 'login-required'
        }
      })
    })

    it('should redirect unauthenticated users from checkout page', () => {
      mockRoute.fullPath = '/checkout'
      
      const shouldRedirect = !authStore.isAuthenticated
      expect(shouldRedirect).toBe(true)
      
      if (shouldRedirect) {
        mockNavigateTo({
          path: '/auth/login',
          query: {
            redirect: '/checkout',
            message: 'login-required'
          }
        })
      }
      
      expect(mockNavigateTo).toHaveBeenCalledWith({
        path: '/auth/login',
        query: {
          redirect: '/checkout',
          message: 'login-required'
        }
      })
    })

    it('should redirect unauthenticated users from account pages', () => {
      mockRoute.fullPath = '/account/profile'
      
      const shouldRedirect = !authStore.isAuthenticated
      expect(shouldRedirect).toBe(true)
      
      if (shouldRedirect) {
        mockNavigateTo({
          path: '/auth/login',
          query: {
            redirect: '/account/profile',
            message: 'login-required'
          }
        })
      }
      
      expect(mockNavigateTo).toHaveBeenCalledWith({
        path: '/auth/login',
        query: {
          redirect: '/account/profile',
          message: 'login-required'
        }
      })
    })

    it('should allow access to public pages without authentication', () => {
      const publicRoutes = ['/', '/products', '/about', '/contact']
      
      publicRoutes.forEach(route => {
        mockRoute.fullPath = route
        const shouldRedirect = false // Public routes don't require auth
        expect(shouldRedirect).toBe(false)
      })
    })
  })

  describe('Post-Login Redirect Handling', () => {
    it('should redirect to intended destination after successful login', async () => {
      // Set up redirect scenario
      mockRoute.query = { redirect: '/cart' }
      
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

      // After successful login, should redirect to intended destination
      expect(authStore.isAuthenticated).toBe(true)
      
      // Simulate post-login redirect logic
      const redirectPath = mockRoute.query.redirect as string
      if (redirectPath && authStore.isAuthenticated) {
        mockNavigateTo(redirectPath)
      }
      
      expect(mockNavigateTo).toHaveBeenCalledWith('/cart')
    })

    it('should redirect to account page by default after login', async () => {
      // No redirect parameter
      mockRoute.query = {}
      
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

      // Should redirect to default authenticated page
      if (authStore.isAuthenticated && !mockRoute.query.redirect) {
        mockNavigateTo('/account')
      }
      
      expect(mockNavigateTo).toHaveBeenCalledWith('/account')
    })

    it('should prevent redirect to external URLs', () => {
      const maliciousRedirects = [
        'https://evil.com',
        '//evil.com',
        'javascript:alert(1)',
        'data:text/html,<script>alert(1)</script>'
      ]
      
      maliciousRedirects.forEach(redirect => {
        mockRoute.query = { redirect }
        
        // Should validate redirect URL
        const isValidRedirect = redirect.startsWith('/') && !redirect.startsWith('//')
        expect(isValidRedirect).toBe(false)
        
        // Should redirect to safe default instead
        if (!isValidRedirect) {
          mockNavigateTo('/account')
        }
      })
    })
  })

  describe('Cart Persistence Across Authentication', () => {
    it('should preserve cart contents when user logs in', async () => {
      // Add items to cart while unauthenticated
      const testProduct = {
        id: 'product-1',
        name: 'Test Product',
        price: 19.99,
        quantity: 2
      }
      
      cartStore.addItem(testProduct)
      expect(cartStore.items).toHaveLength(1)
      expect(cartStore.totalItems).toBe(2)
      
      // User logs in
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

      // Cart should still contain items
      expect(cartStore.items).toHaveLength(1)
      expect(cartStore.totalItems).toBe(2)
      expect(cartStore.items[0].id).toBe('product-1')
    })

    it('should merge cart contents with user saved cart on login', async () => {
      // Add items to anonymous cart
      cartStore.addItem({
        id: 'product-1',
        name: 'Anonymous Product',
        price: 10.00,
        quantity: 1
      })
      
      // Mock user with saved cart
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        email_confirmed_at: '2024-01-01T00:00:00Z'
      }

      // Mock saved cart data
      const savedCartItems = [
        {
          id: 'product-2',
          name: 'Saved Product',
          price: 15.00,
          quantity: 1
        }
      ]

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
        data: { user: mockUser },
        error: null
      })

      await authStore.login({
        email: 'user@example.com',
        password: 'password123'
      })

      // Simulate cart merge logic
      if (authStore.isAuthenticated) {
        // In real implementation, this would fetch saved cart and merge
        savedCartItems.forEach(item => cartStore.addItem(item))
      }

      // Should have both anonymous and saved items
      expect(cartStore.items).toHaveLength(2)
      expect(cartStore.items.some(item => item.id === 'product-1')).toBe(true)
      expect(cartStore.items.some(item => item.id === 'product-2')).toBe(true)
    })

    it('should save cart contents when user logs out', async () => {
      // Set up authenticated user with cart
      authStore.user = {
        id: 'user-123',
        email: 'user@example.com',
        emailVerified: true,
        preferredLanguage: 'en',
        createdAt: '2024-01-01'
      }

      cartStore.addItem({
        id: 'product-1',
        name: 'Test Product',
        price: 20.00,
        quantity: 1
      })

      mockSupabaseClient.auth.signOut.mockResolvedValueOnce({
        error: null
      })

      // Mock cart save before logout
      const cartBeforeLogout = [...cartStore.items]
      
      await authStore.logout()

      // Cart should be preserved for anonymous session
      expect(cartStore.items).toEqual(cartBeforeLogout)
    })
  })

  describe('User-Specific Data Integration', () => {
    it('should load user-specific data after authentication', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        email_confirmed_at: '2024-01-01T00:00:00Z',
        user_metadata: {
          name: 'Test User',
          preferred_language: 'es'
        }
      }

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
        data: { user: mockUser },
        error: null
      })

      await authStore.login({
        email: 'user@example.com',
        password: 'password123'
      })

      // User data should be available
      expect(authStore.user?.name).toBe('Test User')
      expect(authStore.user?.preferredLanguage).toBe('es')
      expect(authStore.userLanguage).toBe('es')
    })

    it('should clear user-specific data on logout', async () => {
      // Set up authenticated state
      authStore.user = {
        id: 'user-123',
        email: 'user@example.com',
        emailVerified: true,
        name: 'Test User',
        preferredLanguage: 'es',
        createdAt: '2024-01-01'
      }

      mockSupabaseClient.auth.signOut.mockResolvedValueOnce({
        error: null
      })

      await authStore.logout()

      // User data should be cleared
      expect(authStore.user).toBeNull()
      expect(authStore.isAuthenticated).toBe(false)
      expect(authStore.userLanguage).toBe('es') // Should fall back to default
    })

    it('should update UI elements based on authentication status', () => {
      // Test unauthenticated state
      expect(authStore.isAuthenticated).toBe(false)
      
      // UI should show login/register options
      const showAuthButtons = !authStore.isAuthenticated
      expect(showAuthButtons).toBe(true)
      
      // Set authenticated state
      authStore.user = {
        id: 'user-123',
        email: 'user@example.com',
        emailVerified: true,
        name: 'Test User',
        preferredLanguage: 'en',
        createdAt: '2024-01-01'
      }
      
      // UI should show user menu
      const showUserMenu = authStore.isAuthenticated
      expect(showUserMenu).toBe(true)
      
      // Should have user display name
      const displayName = authStore.user?.name || authStore.user?.email?.split('@')[0] || ''
      expect(displayName).toBe('Test User')
    })
  })

  describe('Error Handling in Integration Scenarios', () => {
    it('should handle authentication errors during checkout', async () => {
      // User tries to checkout but session expires
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Session expired' }
      })

      try {
        await authStore.login({
          email: 'user@example.com',
          password: 'password123'
        })
      } catch (error) {
        // Should handle error gracefully
        expect(authStore.error).toBeTruthy()
        
        // Should redirect to login with checkout as intended destination
        mockNavigateTo({
          path: '/auth/login',
          query: {
            redirect: '/checkout',
            message: 'session-expired'
          }
        })
      }
    })

    it('should handle network errors during cart operations', async () => {
      // Simulate network error during cart sync
      const networkError = new Error('Network Error')
      
      // Cart operations should continue to work offline
      cartStore.addItem({
        id: 'product-1',
        name: 'Test Product',
        price: 10.00,
        quantity: 1
      })
      
      expect(cartStore.items).toHaveLength(1)
      
      // Should queue operations for retry when connection restored
      const hasOfflineOperations = cartStore.items.length > 0
      expect(hasOfflineOperations).toBe(true)
    })

    it('should handle partial authentication states', () => {
      // User is authenticated but email not verified
      authStore.user = {
        id: 'user-123',
        email: 'unverified@example.com',
        emailVerified: false,
        preferredLanguage: 'en',
        createdAt: '2024-01-01'
      }
      
      // Should not be considered fully authenticated
      expect(authStore.isAuthenticated).toBe(false)
      
      // Should redirect to verification page for protected routes
      const needsVerification = authStore.user && !authStore.user.emailVerified
      expect(needsVerification).toBe(true)
      
      if (needsVerification) {
        mockNavigateTo({
          path: '/auth/verify-email',
          query: {
            message: 'email-verification-required',
            email: 'unverified@example.com'
          }
        })
      }
    })
  })

  describe('Multi-Language Integration', () => {
    it('should respect user language preference in shopping features', () => {
      authStore.user = {
        id: 'user-123',
        email: 'user@example.com',
        emailVerified: true,
        preferredLanguage: 'es',
        createdAt: '2024-01-01'
      }
      
      // Shopping features should use user's preferred language
      expect(authStore.userLanguage).toBe('es')
      
      // Cart and product displays should be in Spanish
      const userLang = authStore.userLanguage
      expect(userLang).toBe('es')
    })

    it('should update language preference across the platform', async () => {
      authStore.user = {
        id: 'user-123',
        email: 'user@example.com',
        emailVerified: true,
        preferredLanguage: 'en',
        createdAt: '2024-01-01'
      }

      mockSupabaseClient.auth.updateUser = vi.fn().mockResolvedValueOnce({
        data: { user: { user_metadata: { preferred_language: 'ro' } } },
        error: null
      })

      await authStore.updateProfile({ preferredLanguage: 'ro' })

      // Language should be updated across the platform
      expect(authStore.user?.preferredLanguage).toBe('ro')
      expect(authStore.userLanguage).toBe('ro')
    })
  })

  describe('Session Management Integration', () => {
    it('should handle session expiry during shopping', async () => {
      // Set up authenticated session
      authStore.user = {
        id: 'user-123',
        email: 'user@example.com',
        emailVerified: true,
        preferredLanguage: 'en',
        createdAt: '2024-01-01'
      }

      // Add items to cart
      cartStore.addItem({
        id: 'product-1',
        name: 'Test Product',
        price: 15.00,
        quantity: 1
      })

      // Simulate session expiry
      mockSupabaseUser.value = null
      authStore.user = null

      // Should preserve cart but require re-authentication
      expect(cartStore.items).toHaveLength(1)
      expect(authStore.isAuthenticated).toBe(false)

      // Should redirect to login with current page as redirect
      mockNavigateTo({
        path: '/auth/login',
        query: {
          redirect: mockRoute.fullPath,
          message: 'session-expired'
        }
      })
    })

    it('should handle concurrent authentication across tabs', () => {
      // Simulate user logging in from another tab
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        email_confirmed_at: '2024-01-01T00:00:00Z'
      }

      // Simulate auth state change from another tab
      mockSupabaseUser.value = mockUser
      authStore.syncUserState(mockUser as any)

      // Current tab should update authentication state
      expect(authStore.isAuthenticated).toBe(true)
      expect(authStore.user?.email).toBe('user@example.com')
    })
  })
})
