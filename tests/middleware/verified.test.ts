/**
 * Verified Middleware Tests
 *
 * Tests the verified middleware (middleware/verified.ts) that protects
 * routes requiring verified email accounts.
 *
 * Requirements tested:
 * - Separate email verification requirement from basic authentication
 * - Provide specific messaging for unverified account access attempts
 * - Offer direct path to resend verification email
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { RouteLocationNormalized } from 'vue-router'

describe('Verified Middleware', () => {
  let mockTo: RouteLocationNormalized
  let mockFrom: RouteLocationNormalized
  let mockUser: unknown
  let mockLocalePath: ReturnType<typeof vi.fn>
  let mockNavigateTo: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.resetModules()

    // Mock route objects
    mockTo = {
      path: '/account/settings',
      fullPath: '/account/settings',
    } as RouteLocationNormalized
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

  describe('Unauthenticated Users', () => {
    it('should redirect to login if user is not authenticated', async () => {
      mockUser = null

      const { default: verifiedMiddleware } = await import('../../middleware/verified')
      await verifiedMiddleware(mockTo, mockFrom)

      expect(mockNavigateTo).toHaveBeenCalledWith({
        path: '/auth/login',
        query: {
          redirect: '/account/settings',
          message: 'login-required',
        },
      })
    })

    it('should not include redirect for home page', async () => {
      mockUser = null
      mockTo = {
        path: '/',
        fullPath: '/',
      } as RouteLocationNormalized

      const { default: verifiedMiddleware } = await import('../../middleware/verified')
      await verifiedMiddleware(mockTo, mockFrom)

      expect(mockNavigateTo).toHaveBeenCalledWith({
        path: '/auth/login',
        query: {
          message: 'login-required',
        },
      })
    })

    it('should include login-required message', async () => {
      mockUser = null

      const { default: verifiedMiddleware } = await import('../../middleware/verified')
      await verifiedMiddleware(mockTo, mockFrom)

      expect(mockNavigateTo).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            message: 'login-required',
          }),
        }),
      )
    })
  })

  describe('Authenticated Users with Verified Email', () => {
    it('should allow access for verified users', async () => {
      mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        email_confirmed_at: '2024-01-01T00:00:00Z',
      }

      const { default: verifiedMiddleware } = await import('../../middleware/verified')
      const result = await verifiedMiddleware(mockTo, mockFrom)

      expect(mockNavigateTo).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })

    it('should allow access to any protected route', async () => {
      mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        email_confirmed_at: '2024-01-01T00:00:00Z',
      }
      mockTo = {
        path: '/account/orders/123',
        fullPath: '/account/orders/123',
      } as RouteLocationNormalized

      const { default: verifiedMiddleware } = await import('../../middleware/verified')
      const result = await verifiedMiddleware(mockTo, mockFrom)

      expect(mockNavigateTo).not.toHaveBeenCalled()
    })
  })

  describe('Authenticated Users with Unverified Email', () => {
    beforeEach(() => {
      mockUser = {
        id: 'user-123',
        email: 'unverified@example.com',
        email_confirmed_at: null,
      }
    })

    it('should redirect to verify-email page', async () => {
      const { default: verifiedMiddleware } = await import('../../middleware/verified')
      await verifiedMiddleware(mockTo, mockFrom)

      expect(mockNavigateTo).toHaveBeenCalledWith({
        path: '/auth/verify-email',
        query: {
          message: 'email-verification-required',
          email: 'unverified@example.com',
          redirect: '/account/settings',
        },
      })
    })

    it('should include redirect path for post-verification navigation', async () => {
      mockTo = {
        path: '/checkout/payment',
        fullPath: '/checkout/payment',
      } as RouteLocationNormalized

      const { default: verifiedMiddleware } = await import('../../middleware/verified')
      await verifiedMiddleware(mockTo, mockFrom)

      expect(mockNavigateTo).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            redirect: '/checkout/payment',
          }),
        }),
      )
    })

    it('should include email for resend verification', async () => {
      const { default: verifiedMiddleware } = await import('../../middleware/verified')
      await verifiedMiddleware(mockTo, mockFrom)

      expect(mockNavigateTo).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            email: 'unverified@example.com',
          }),
        }),
      )
    })

    it('should provide verification-required message', async () => {
      const { default: verifiedMiddleware } = await import('../../middleware/verified')
      await verifiedMiddleware(mockTo, mockFrom)

      expect(mockNavigateTo).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            message: 'email-verification-required',
          }),
        }),
      )
    })
  })

  describe('Locale Support', () => {
    it('should use localePath for login redirect', async () => {
      mockUser = null
      mockLocalePath = vi.fn((path: string) => `/es${path}`)
      vi.stubGlobal('useLocalePath', () => mockLocalePath)

      const { default: verifiedMiddleware } = await import('../../middleware/verified')
      await verifiedMiddleware(mockTo, mockFrom)

      expect(mockLocalePath).toHaveBeenCalledWith('/auth/login')
      expect(mockNavigateTo).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/es/auth/login',
        }),
      )
    })

    it('should use localePath for verify-email redirect', async () => {
      mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        email_confirmed_at: null,
      }
      mockLocalePath = vi.fn((path: string) => `/ro${path}`)
      vi.stubGlobal('useLocalePath', () => mockLocalePath)

      const { default: verifiedMiddleware } = await import('../../middleware/verified')
      await verifiedMiddleware(mockTo, mockFrom)

      expect(mockLocalePath).toHaveBeenCalledWith('/auth/verify-email')
      expect(mockNavigateTo).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/ro/auth/verify-email',
        }),
      )
    })

    it('should use localePath for home check', async () => {
      mockUser = null
      mockTo = {
        path: '/',
        fullPath: '/',
      } as RouteLocationNormalized
      mockLocalePath = vi.fn((path: string) => `/en${path}`)
      vi.stubGlobal('useLocalePath', () => mockLocalePath)

      const { default: verifiedMiddleware } = await import('../../middleware/verified')
      await verifiedMiddleware(mockTo, mockFrom)

      expect(mockLocalePath).toHaveBeenCalledWith('/')
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined email_confirmed_at as unverified', async () => {
      mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        // email_confirmed_at is undefined
      }

      const { default: verifiedMiddleware } = await import('../../middleware/verified')
      await verifiedMiddleware(mockTo, mockFrom)

      expect(mockNavigateTo).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/auth/verify-email',
        }),
      )
    })

    it('should handle empty string email_confirmed_at as unverified', async () => {
      mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        email_confirmed_at: '',
      }

      const { default: verifiedMiddleware } = await import('../../middleware/verified')
      await verifiedMiddleware(mockTo, mockFrom)

      // Empty string is falsy, should redirect to verify
      expect(mockNavigateTo).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/auth/verify-email',
        }),
      )
    })

    it('should preserve query string in redirect', async () => {
      mockUser = null
      mockTo = {
        path: '/account/orders',
        fullPath: '/account/orders?page=2&status=pending',
      } as RouteLocationNormalized

      const { default: verifiedMiddleware } = await import('../../middleware/verified')
      await verifiedMiddleware(mockTo, mockFrom)

      expect(mockNavigateTo).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            redirect: '/account/orders?page=2&status=pending',
          }),
        }),
      )
    })
  })
})
