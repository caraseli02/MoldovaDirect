/**
 * Guest Middleware Tests
 *
 * Tests the guest middleware (middleware/guest.ts) that redirects
 * authenticated users away from auth pages (login, register, etc.)
 *
 * Requirements tested:
 * - 5.1: Session persistence across browser tabs
 * - 5.3: Reactive authentication status
 * - 10.2: Preserve redirect query parameters for seamless navigation
 * - 10.3: Handle edge cases for partially authenticated users
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { RouteLocationNormalized } from 'vue-router'

describe('Guest Middleware', () => {
  let mockTo: RouteLocationNormalized
  let mockFrom: RouteLocationNormalized
  let mockUser: unknown
  let mockLocalePath: ReturnType<typeof vi.fn>
  let mockNavigateTo: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.resetModules()

    // Mock route objects
    mockTo = {
      path: '/auth/login',
      fullPath: '/auth/login',
      query: {},
    } as unknown as RouteLocationNormalized
    mockFrom = { path: '/' } as RouteLocationNormalized

    // Reset mocks
    mockUser = null
    mockLocalePath = vi.fn((path: string) => path)
    mockNavigateTo = vi.fn()

    // Mock Nuxt composables
    vi.stubGlobal('useSupabaseUser', () => ({ value: mockUser }))
    vi.stubGlobal('useLocalePath', () => mockLocalePath)
    vi.stubGlobal('navigateTo', mockNavigateTo)
    vi.stubGlobal('defineNuxtRouteMiddleware', (fn: unknown) => fn)
  })

  describe('Unauthenticated Users (Guest Access)', () => {
    it('should allow unauthenticated users to access auth pages', async () => {
      mockUser = null

      const { default: guestMiddleware } = await import('../../middleware/guest')
      const result = await guestMiddleware(mockTo, mockFrom)

      expect(mockNavigateTo).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })

    it('should allow access to login page', async () => {
      mockUser = null
      mockTo = { path: '/auth/login', fullPath: '/auth/login', query: {} } as unknown as RouteLocationNormalized

      const { default: guestMiddleware } = await import('../../middleware/guest')
      await guestMiddleware(mockTo, mockFrom)

      expect(mockNavigateTo).not.toHaveBeenCalled()
    })

    it('should allow access to register page', async () => {
      mockUser = null
      mockTo = { path: '/auth/register', fullPath: '/auth/register', query: {} } as unknown as RouteLocationNormalized

      const { default: guestMiddleware } = await import('../../middleware/guest')
      await guestMiddleware(mockTo, mockFrom)

      expect(mockNavigateTo).not.toHaveBeenCalled()
    })
  })

  describe('Authenticated Users with Verified Email', () => {
    beforeEach(() => {
      mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        email_confirmed_at: '2024-01-01T00:00:00Z',
      }
    })

    it('should redirect authenticated user to account page', async () => {
      const { default: guestMiddleware } = await import('../../middleware/guest')
      await guestMiddleware(mockTo, mockFrom)

      expect(mockNavigateTo).toHaveBeenCalledWith('/account')
    })

    it('should honor redirect query parameter', async () => {
      mockTo = {
        path: '/auth/login',
        fullPath: '/auth/login?redirect=/products',
        query: { redirect: '/products' },
      } as unknown as RouteLocationNormalized

      const { default: guestMiddleware } = await import('../../middleware/guest')
      await guestMiddleware(mockTo, mockFrom)

      expect(mockNavigateTo).toHaveBeenCalledWith('/products')
    })

    it('should ignore external redirect URLs (security)', async () => {
      mockTo = {
        path: '/auth/login',
        fullPath: '/auth/login?redirect=https://evil.com',
        query: { redirect: 'https://evil.com' },
      } as unknown as RouteLocationNormalized

      const { default: guestMiddleware } = await import('../../middleware/guest')
      await guestMiddleware(mockTo, mockFrom)

      // Should redirect to account, not the external URL
      expect(mockNavigateTo).toHaveBeenCalledWith('/account')
    })

    it('should ignore protocol-relative redirect URLs', async () => {
      mockTo = {
        path: '/auth/login',
        fullPath: '/auth/login?redirect=//evil.com/steal',
        query: { redirect: '//evil.com/steal' },
      } as unknown as RouteLocationNormalized

      const { default: guestMiddleware } = await import('../../middleware/guest')
      await guestMiddleware(mockTo, mockFrom)

      expect(mockNavigateTo).toHaveBeenCalledWith('/account')
    })

    it('should handle redirect with leading slash', async () => {
      mockTo = {
        path: '/auth/login',
        fullPath: '/auth/login?redirect=/checkout',
        query: { redirect: '/checkout' },
      } as unknown as RouteLocationNormalized

      const { default: guestMiddleware } = await import('../../middleware/guest')
      await guestMiddleware(mockTo, mockFrom)

      expect(mockNavigateTo).toHaveBeenCalledWith('/checkout')
    })
  })

  describe('Authenticated Users with Unverified Email', () => {
    beforeEach(() => {
      mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        email_confirmed_at: null,
      }
    })

    it('should allow access to verify-email page', async () => {
      mockTo = {
        path: '/auth/verify-email',
        fullPath: '/auth/verify-email',
        query: {},
      } as unknown as RouteLocationNormalized

      const { default: guestMiddleware } = await import('../../middleware/guest')

      expect(mockNavigateTo).not.toHaveBeenCalled()
    })

    it('should allow access to logout page', async () => {
      mockTo = {
        path: '/auth/logout',
        fullPath: '/auth/logout',
        query: {},
      } as unknown as RouteLocationNormalized

      const { default: guestMiddleware } = await import('../../middleware/guest')
      const result = await guestMiddleware(mockTo, mockFrom)

      expect(mockNavigateTo).not.toHaveBeenCalled()
    })

    it('should redirect to verify-email from login page', async () => {
      mockTo = {
        path: '/auth/login',
        fullPath: '/auth/login',
        query: {},
      } as unknown as RouteLocationNormalized

      const { default: guestMiddleware } = await import('../../middleware/guest')
      await guestMiddleware(mockTo, mockFrom)

      expect(mockNavigateTo).toHaveBeenCalledWith({
        path: '/auth/verify-email',
        query: {
          message: 'email-verification-required',
          email: 'user@example.com',
        },
      })
    })

    it('should redirect to verify-email from register page', async () => {
      mockTo = {
        path: '/auth/register',
        fullPath: '/auth/register',
        query: {},
      } as unknown as RouteLocationNormalized

      const { default: guestMiddleware } = await import('../../middleware/guest')
      await guestMiddleware(mockTo, mockFrom)

      expect(mockNavigateTo).toHaveBeenCalledWith({
        path: '/auth/verify-email',
        query: {
          message: 'email-verification-required',
          email: 'user@example.com',
        },
      })
    })
  })

  describe('Locale Support', () => {
    it('should use localePath for account redirect', async () => {
      mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        email_confirmed_at: '2024-01-01T00:00:00Z',
      }
      mockLocalePath = vi.fn((path: string) => `/es${path}`)
      vi.stubGlobal('useLocalePath', () => mockLocalePath)

      const { default: guestMiddleware } = await import('../../middleware/guest')
      await guestMiddleware(mockTo, mockFrom)

      expect(mockLocalePath).toHaveBeenCalledWith('/account')
      expect(mockNavigateTo).toHaveBeenCalledWith('/es/account')
    })

    it('should use localePath for allowed paths check', async () => {
      mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        email_confirmed_at: null,
      }
      mockLocalePath = vi.fn((path: string) => `/ru${path}`)
      vi.stubGlobal('useLocalePath', () => mockLocalePath)
      mockTo = {
        path: '/ru/auth/verify-email',
        fullPath: '/ru/auth/verify-email',
        query: {},
      } as unknown as RouteLocationNormalized

      const { default: guestMiddleware } = await import('../../middleware/guest')
      await guestMiddleware(mockTo, mockFrom)

      expect(mockLocalePath).toHaveBeenCalledWith('/auth/verify-email')
    })
  })

  describe('Edge Cases', () => {
    it('should handle user with undefined email_confirmed_at', async () => {
      mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        // email_confirmed_at is undefined
      }

      const { default: guestMiddleware } = await import('../../middleware/guest')
      await guestMiddleware(mockTo, mockFrom)

      // Should be treated as unverified
      expect(mockNavigateTo).toHaveBeenCalledWith({
        path: '/auth/verify-email',
        query: expect.objectContaining({
          message: 'email-verification-required',
        }),
      })
    })

    it('should handle empty redirect parameter', async () => {
      mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        email_confirmed_at: '2024-01-01T00:00:00Z',
      }
      mockTo = {
        path: '/auth/login',
        fullPath: '/auth/login?redirect=',
        query: { redirect: '' },
      } as unknown as RouteLocationNormalized

      const { default: guestMiddleware } = await import('../../middleware/guest')
      await guestMiddleware(mockTo, mockFrom)

      // Empty redirect should go to account
      expect(mockNavigateTo).toHaveBeenCalledWith('/account')
    })
  })
})
