/**
 * Admin Middleware Tests
 *
 * Tests the admin middleware (middleware/admin.ts) that protects admin pages.
 *
 * Critical security fix: middleware/admin.ts:40 now properly checks profile.role === 'admin'
 * Previously had only a TODO comment allowing ANY authenticated user to access admin pages.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { RouteLocationNormalized } from 'vue-router'

describe('Admin Middleware', () => {
  let middleware: any
  let mockTo: RouteLocationNormalized
  let mockFrom: RouteLocationNormalized
  let mockUser: any
  let mockSupabase: any
  let mockProfile: any

  beforeEach(() => {
    // Mock route objects
    mockTo = { path: '/admin/dashboard' } as RouteLocationNormalized
    mockFrom = { path: '/' } as RouteLocationNormalized

    // Reset mocks
    mockUser = null
    mockProfile = { role: 'user' }
    mockSupabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(async () => ({
              data: mockProfile,
              error: null
            }))
          }))
        }))
      }))
    }

    // Mock Nuxt composables
    vi.stubGlobal('useSupabaseUser', () => ({ value: mockUser }))
    vi.stubGlobal('useSupabaseClient', () => mockSupabase)
    vi.stubGlobal('navigateTo', vi.fn((path: string) => path))
    vi.stubGlobal('createError', vi.fn((error: any) => {
      throw new Error(error.statusMessage)
    }))
  })

  describe('Authentication Check', () => {
    it('should redirect to login if user is not authenticated', async () => {
      mockUser = null
      const navigateTo = vi.fn()
      vi.stubGlobal('navigateTo', navigateTo)

      // Import and execute middleware
      const { default: adminMiddleware } = await import('../../middleware/admin')
      const result = await adminMiddleware(mockTo, mockFrom)

      expect(navigateTo).toHaveBeenCalledWith('/auth/login')
    })

    it('should proceed if user is authenticated', async () => {
      mockUser = { id: 'user-123', email: 'user@example.com' }
      mockProfile = { role: 'admin' }

      const { default: adminMiddleware } = await import('../../middleware/admin')

      // Should not throw
      await expect(adminMiddleware(mockTo, mockFrom)).resolves.not.toThrow()
    })
  })

  describe('Role Authorization (CRITICAL FIX)', () => {
    beforeEach(() => {
      mockUser = { id: 'user-123', email: 'user@example.com' }
    })

    it('should block regular users (role: user) from accessing admin pages', async () => {
      mockProfile = { role: 'user' }

      const { default: adminMiddleware } = await import('../../middleware/admin')

      // Should throw 403 error
      await expect(adminMiddleware(mockTo, mockFrom)).rejects.toThrow(
        'Admin access required'
      )
    })

    it('should block users with no role from accessing admin pages', async () => {
      mockProfile = { role: null }

      const { default: adminMiddleware } = await import('../../middleware/admin')

      await expect(adminMiddleware(mockTo, mockFrom)).rejects.toThrow(
        'Admin access required'
      )
    })

    it('should block users with manager role from accessing admin pages', async () => {
      mockProfile = { role: 'manager' }

      const { default: adminMiddleware } = await import('../../middleware/admin')

      await expect(adminMiddleware(mockTo, mockFrom)).rejects.toThrow(
        'Admin access required'
      )
    })

    it('should allow admin users (role: admin) to access admin pages', async () => {
      mockProfile = { role: 'admin' }

      const { default: adminMiddleware } = await import('../../middleware/admin')

      // Should not throw
      await expect(adminMiddleware(mockTo, mockFrom)).resolves.not.toThrow()
    })

    it('should throw 401 if profile cannot be fetched', async () => {
      mockSupabase.from = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(async () => ({
              data: null,
              error: new Error('Database error')
            }))
          }))
        }))
      }))

      const { default: adminMiddleware } = await import('../../middleware/admin')

      await expect(adminMiddleware(mockTo, mockFrom)).rejects.toThrow(
        'Authentication required'
      )
    })
  })

  describe('Database Query', () => {
    it('should query profiles table with user ID', async () => {
      const userId = 'user-123'
      mockUser = { id: userId, email: 'admin@example.com' }
      mockProfile = { role: 'admin' }

      const fromMock = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn((column: string, value: string) => {
            expect(column).toBe('id')
            expect(value).toBe(userId)
            return {
              single: vi.fn(async () => ({ data: mockProfile, error: null }))
            }
          })
        }))
      }))

      mockSupabase.from = fromMock

      const { default: adminMiddleware } = await import('../../middleware/admin')
      await adminMiddleware(mockTo, mockFrom)

      expect(fromMock).toHaveBeenCalledWith('profiles')
    })

    it('should select only the role field for efficiency', async () => {
      mockUser = { id: 'user-123', email: 'admin@example.com' }
      mockProfile = { role: 'admin' }

      const selectMock = vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(async () => ({ data: mockProfile, error: null }))
        }))
      }))

      mockSupabase.from = vi.fn(() => ({
        select: selectMock
      }))

      const { default: adminMiddleware } = await import('../../middleware/admin')
      await adminMiddleware(mockTo, mockFrom)

      expect(selectMock).toHaveBeenCalledWith('role')
    })
  })

  describe('Security Regression Tests', () => {
    it('CRITICAL: should NOT allow authenticated users without admin role (previous bug)', async () => {
      // This test ensures the bug from middleware/admin.ts:39-42 is fixed
      // Previously: TODO comment allowed any authenticated user
      // Now: Checks profile.role === 'admin'

      mockUser = { id: 'user-123', email: 'attacker@example.com' }
      mockProfile = { role: 'user' } // Regular user

      const { default: adminMiddleware } = await import('../../middleware/admin')

      // MUST throw 403 error
      await expect(adminMiddleware(mockTo, mockFrom)).rejects.toThrow(
        'Admin access required'
      )
    })

    it('should prevent privilege escalation via role manipulation', async () => {
      mockUser = { id: 'user-123', email: 'user@example.com' }

      // Attempt to manipulate role via different casing or similar values
      const maliciousRoles = ['ADMIN', 'Admin', 'admin ', ' admin', 'administrator']

      for (const role of maliciousRoles) {
        if (role !== 'admin') {
          mockProfile = { role }

          const { default: adminMiddleware } = await import('../../middleware/admin')

          await expect(adminMiddleware(mockTo, mockFrom)).rejects.toThrow()
        }
      }
    })
  })
})
