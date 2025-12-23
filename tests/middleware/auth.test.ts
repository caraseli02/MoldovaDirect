/**
 * Auth Middleware Tests
 *
 * Tests the auth middleware (middleware/auth.ts) that protects authenticated routes.
 *
 * Requirements tested:
 * - 5.1: Session persistence across browser tabs
 * - 10.1: Redirect unauthenticated users to login
 * - 10.2: Preserve intended destination for post-login redirect
 * - 10.3: Display message explaining login requirement
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { RouteLocationNormalized } from 'vue-router'

describe('Auth Middleware', () => {
  let mockTo: RouteLocationNormalized
  let mockFrom: RouteLocationNormalized
  let mockUser: any
  let mockLocalePath: ReturnType<typeof vi.fn>
  let mockNavigateTo: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.resetModules()

    // Mock route objects
    mockTo = {
      path: '/account/orders',
      fullPath: '/account/orders',
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
    vi.stubGlobal('defineNuxtRouteMiddleware', (fn: any) => fn)
  })

  describe('Unauthenticated Users', () => {
    it('should redirect to login if user is not authenticated', async () => {
      mockUser = null

      const { default: authMiddleware } = await import('../../middleware/auth')
      await authMiddleware(mockTo, mockFrom)

      expect(mockNavigateTo).toHaveBeenCalledWith({
        path: '/auth/login',
        query: {
          redirect: '/account/orders',
          message: 'login-required',
        },
      })
    })

    it('should not include redirect query for home page', async () => {
      mockUser = null
      mockTo = {
        path: '/',
        fullPath: '/',
      } as RouteLocationNormalized

      const { default: authMiddleware } = await import('../../middleware/auth')
      await authMiddleware(mockTo, mockFrom)

      expect(mockNavigateTo).toHaveBeenCalledWith({
        path: '/auth/login',
        query: {
          message: 'login-required',
        },
      })
    })

    it('should preserve full path with query params for redirect', async () => {
      mockUser = null
      mockTo = {
        path: '/account/orders',
        fullPath: '/account/orders?status=pending',
      } as RouteLocationNormalized

      const { default: authMiddleware } = await import('../../middleware/auth')
      await authMiddleware(mockTo, mockFrom)

      expect(mockNavigateTo).toHaveBeenCalledWith({
        path: '/auth/login',
        query: {
          redirect: '/account/orders?status=pending',
          message: 'login-required',
        },
      })
    })
  })

  describe('Authenticated Users', () => {
    it('should allow access for authenticated user with verified email', async () => {
      mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        email_confirmed_at: '2024-01-01T00:00:00Z',
      }

      const { default: authMiddleware } = await import('../../middleware/auth')
      const result = await authMiddleware(mockTo, mockFrom)

      expect(mockNavigateTo).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })
  })

  describe('Unverified Email', () => {
    it('should redirect to verify-email page if email not verified', async () => {
      mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        email_confirmed_at: null,
      }

      const { default: authMiddleware } = await import('../../middleware/auth')
      await authMiddleware(mockTo, mockFrom)

      expect(mockNavigateTo).toHaveBeenCalledWith({
        path: '/auth/verify-email',
        query: {
          message: 'email-verification-required',
          email: 'user@example.com',
        },
      })
    })

    it('should include user email in verification redirect', async () => {
      mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        email_confirmed_at: undefined,
      }

      const { default: authMiddleware } = await import('../../middleware/auth')
      await authMiddleware(mockTo, mockFrom)

      expect(mockNavigateTo).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            email: 'test@example.com',
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

      const { default: authMiddleware } = await import('../../middleware/auth')
      await authMiddleware(mockTo, mockFrom)

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

      const { default: authMiddleware } = await import('../../middleware/auth')
      await authMiddleware(mockTo, mockFrom)

      expect(mockLocalePath).toHaveBeenCalledWith('/auth/verify-email')
    })
  })
})
