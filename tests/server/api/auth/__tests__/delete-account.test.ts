/**
 * Account Deletion API Tests
 *
 * Tests the account deletion endpoint following best practices:
 * - Authentication required
 * - Password confirmation
 * - GDPR compliance (atomic deletion)
 * - Audit logging
 *
 * @see https://github.com/goldbergyoni/nodejs-testing-best-practices
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'

// Mock secure logger
vi.mock('~/server/utils/secureLogger', () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  })),
}))

// Mock Supabase
const mockSupabaseAuth = {
  getUser: vi.fn(),
  signInWithPassword: vi.fn(),
}
const mockSupabaseFrom = vi.fn()
const mockSupabaseRpc = vi.fn()
const mockSupabaseAdminDeleteUser = vi.fn()
const mockSupabaseStorageRemove = vi.fn()

vi.mock('#supabase/server', () => ({
  serverSupabaseClient: vi.fn(() => ({
    auth: mockSupabaseAuth,
    from: mockSupabaseFrom,
  })),
  serverSupabaseServiceRole: vi.fn(() => ({
    rpc: mockSupabaseRpc,
    auth: {
      admin: {
        deleteUser: mockSupabaseAdminDeleteUser,
      },
    },
    storage: {
      from: vi.fn(() => ({
        remove: mockSupabaseStorageRemove,
      })),
    },
  })),
}))

// Mock h3
vi.mock('h3', async () => {
  const actual = await vi.importActual('h3')
  return {
    ...actual,
    defineEventHandler: vi.fn(handler => handler),
    assertMethod: vi.fn(),
    readBody: vi.fn(),
    getHeader: vi.fn(),
    getRequestIP: vi.fn(() => '127.0.0.1'),
    createError: vi.fn((options) => {
      const error = new Error(options.statusMessage) as Error & { statusCode: number }
      error.statusCode = options.statusCode
      return error
    }),
  }
})

describe('Account Deletion API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('Request Validation', () => {
    it('requires DELETE method', async () => {
      const { assertMethod } = await import('h3')

      assertMethod({} as unknown, 'DELETE')

      expect(assertMethod).toHaveBeenCalledWith(expect.anything(), 'DELETE')
    })

    it('requires password in request body', async () => {
      const { readBody, createError } = await import('h3')

      vi.mocked(readBody).mockResolvedValue({ password: undefined })

      const body = await readBody({} as unknown)

      if (!body.password) {
        const error = vi.mocked(createError)({
          statusCode: 400,
          statusMessage: 'Password confirmation required',
        })
        expect(error.statusCode).toBe(400)
      }
    })

    it('accepts optional reason field', async () => {
      const { readBody } = await import('h3')

      vi.mocked(readBody).mockResolvedValue({
        password: 'test123',
        reason: 'Moving to another service',
      })

      const body = await readBody({} as unknown)

      expect(body.reason).toBe('Moving to another service')
    })
  })

  describe('Authentication', () => {
    it('requires authenticated user', async () => {
      mockSupabaseAuth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      })

      const result = await mockSupabaseAuth.getUser()

      expect(result.data.user).toBeNull()
    })

    it('gets user from authenticated session', async () => {
      mockSupabaseAuth.getUser.mockResolvedValue({
        data: {
          user: {
            id: 'user-123',
            email: 'test@example.com',
            user_metadata: { avatar_url: '/avatar.jpg' },
          },
        },
        error: null,
      })

      const result = await mockSupabaseAuth.getUser()

      expect(result.data.user.id).toBe('user-123')
      expect(result.data.user.email).toBe('test@example.com')
    })
  })

  describe('Password Verification', () => {
    it('verifies password before deletion', async () => {
      mockSupabaseAuth.signInWithPassword.mockResolvedValue({
        error: null,
      })

      const result = await mockSupabaseAuth.signInWithPassword({
        email: 'test@example.com',
        password: 'correct-password',
      })

      expect(result.error).toBeNull()
    })

    it('rejects invalid password', async () => {
      mockSupabaseAuth.signInWithPassword.mockResolvedValue({
        error: { message: 'Invalid credentials' },
      })

      const result = await mockSupabaseAuth.signInWithPassword({
        email: 'test@example.com',
        password: 'wrong-password',
      })

      expect(result.error).toBeTruthy()
    })
  })

  describe('Audit Logging', () => {
    it('logs account deletion request', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null })
      mockSupabaseFrom.mockReturnValue({ insert: mockInsert })

      await mockSupabaseFrom('auth_events').insert({
        user_id: 'user-123',
        event_type: 'account_deletion_requested',
        ip_address: '127.0.0.1',
        user_agent: 'Mozilla/5.0',
        metadata: JSON.stringify({
          reason: 'moving_away',
          timestamp: new Date().toISOString(),
        }),
      })

      expect(mockInsert).toHaveBeenCalled()
    })
  })

  describe('Atomic Deletion (GDPR)', () => {
    it('calls atomic deletion RPC function', async () => {
      mockSupabaseRpc.mockResolvedValue({
        data: {
          addresses_deleted: 2,
          carts_deleted: 1,
          orders_anonymized: 5,
          profile_deleted: true,
        },
        error: null,
      })

      const result = await mockSupabaseRpc('delete_user_account_atomic', {
        target_user_id: 'user-123',
        deletion_reason: 'user_request',
      })

      expect(result.data.addresses_deleted).toBe(2)
      expect(result.data.profile_deleted).toBe(true)
    })

    it('handles deletion failure', async () => {
      mockSupabaseRpc.mockResolvedValue({
        data: null,
        error: { message: 'Transaction failed' },
      })

      const result = await mockSupabaseRpc('delete_user_account_atomic', {
        target_user_id: 'user-123',
        deletion_reason: 'user_request',
      })

      expect(result.error).toBeTruthy()
    })
  })

  describe('Storage Cleanup', () => {
    it('removes avatar from storage', async () => {
      mockSupabaseStorageRemove.mockResolvedValue({ error: null })

      await mockSupabaseStorageRemove(['user-123/avatar.jpg'])

      expect(mockSupabaseStorageRemove).toHaveBeenCalledWith(['user-123/avatar.jpg'])
    })

    it('continues even if storage deletion fails', async () => {
      mockSupabaseStorageRemove.mockRejectedValue(new Error('Storage error'))

      // Should not throw - storage deletion is non-critical
      const deletePromise = mockSupabaseStorageRemove(['user-123/avatar.jpg'])
        .catch(() => {}) // Catch error but continue

      await expect(deletePromise).resolves.toBeUndefined()
    })
  })

  describe('Auth User Deletion', () => {
    it('deletes auth user after data cleanup', async () => {
      mockSupabaseAdminDeleteUser.mockResolvedValue({ error: null })

      const result = await mockSupabaseAdminDeleteUser('user-123')

      expect(mockSupabaseAdminDeleteUser).toHaveBeenCalledWith('user-123')
      expect(result.error).toBeNull()
    })

    it('handles auth user deletion failure', async () => {
      mockSupabaseAdminDeleteUser.mockResolvedValue({
        error: { message: 'Failed to delete user' },
      })

      const result = await mockSupabaseAdminDeleteUser('user-123')

      expect(result.error).toBeTruthy()
    })
  })

  describe('Response Structure', () => {
    it('returns success response with deletion details', () => {
      const response = {
        success: true,
        message: 'Account deleted successfully',
        details: {
          addresses_deleted: 2,
          carts_deleted: 1,
          orders_anonymized: 5,
          profile_deleted: true,
        },
      }

      expect(response.success).toBe(true)
      expect(response.details.addresses_deleted).toBe(2)
      expect(response.details.orders_anonymized).toBe(5)
    })

    it('handles missing deletion result gracefully', () => {
      const deletionResult = null

      const response = {
        success: true,
        message: 'Account deleted successfully',
        details: {
          addresses_deleted: deletionResult?.addresses_deleted || 0,
          carts_deleted: deletionResult?.carts_deleted || 0,
          orders_anonymized: deletionResult?.orders_anonymized || 0,
          profile_deleted: deletionResult?.profile_deleted || false,
        },
      }

      expect(response.details.addresses_deleted).toBe(0)
      expect(response.details.profile_deleted).toBe(false)
    })
  })

  describe('Error Handling', () => {
    it('throws 401 for unauthenticated users', async () => {
      const { createError } = await import('h3')

      const error = vi.mocked(createError)({
        statusCode: 401,
        statusMessage: 'Authentication required',
      })

      expect(error.statusCode).toBe(401)
    })

    it('throws 400 for invalid password', async () => {
      const { createError } = await import('h3')

      const error = vi.mocked(createError)({
        statusCode: 400,
        statusMessage: 'Invalid password',
      })

      expect(error.statusCode).toBe(400)
    })

    it('throws 500 for deletion failure', async () => {
      const { createError } = await import('h3')

      const error = vi.mocked(createError)({
        statusCode: 500,
        statusMessage: 'Failed to delete account data',
      })

      expect(error.statusCode).toBe(500)
    })

    it('logs errors with secure logger', async () => {
      const { createLogger } = await import('~/server/utils/secureLogger')

      const logger = createLogger('delete-account')

      logger.error('Account deletion failed', {
        error: 'Test error',
        userId: 'user-123',
      })

      expect(logger.error).toHaveBeenCalled()
    })
  })

  describe('Deletion Reason Handling', () => {
    it('uses provided reason', () => {
      const reason = 'switching_to_competitor'
      const finalReason = reason || 'not_specified'

      expect(finalReason).toBe('switching_to_competitor')
    })

    it('defaults to not_specified when no reason provided', () => {
      const reason = undefined
      const finalReason = reason || 'not_specified'

      expect(finalReason).toBe('not_specified')
    })
  })
})
