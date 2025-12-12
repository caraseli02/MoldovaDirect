/**
 * Unit Tests for adminAuth.ts
 *
 * These tests verify the authentication and authorization logic for admin-only endpoints.
 * Covers bearer token authentication, cookie fallback, profile validation, and edge cases.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import type { H3Event } from 'h3'
import type { SupabaseClient } from '@supabase/supabase-js'

// Import mocked h3 functions
import { getCookie, getHeader, getRequestIP, createError } from 'h3'

// Import after mocks are set up
import {
  requireAdminRole,
  isProductionEnvironment,
  requireNonProductionEnvironment,
  requireAdminTestingAccess,
  logAdminAction,
} from '../../../server/utils/adminAuth'

// Import Supabase mocked functions
import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'

// Type definitions for our mocks
interface MockH3Event {
  node: {
    req: {
      headers: Record<string, string | string[] | undefined>
    }
    res: unknown
  }
  path?: string
  method?: string
  [key: string]: unknown
}

interface AuthUser {
  id: string
  email: string
  role?: string
  app_metadata?: Record<string, any>
  user_metadata?: Record<string, any>
}

interface AuthError {
  message: string
  code?: string
  status?: number
}

type UserId = string & { readonly __brand: 'UserId' }

/**
 * Helper to create mock H3Event
 */
function createMockEvent(overrides?: Partial<MockH3Event>): MockH3Event {
  return {
    node: {
      req: {
        headers: {},
      },
      res: {},
    },
    path: '/api/admin/test',
    method: 'GET',
    ...overrides,
  }
}

/**
 * Helper to create mock Supabase responses
 */
function createAuthResponse(user: AuthUser | null, error: AuthError | null = null) {
  return {
    data: { user },
    error,
  }
}

function createProfileResponse(profile: { role: string | null } | null, error: unknown = null) {
  return {
    data: profile,
    error,
  }
}

// Mock h3 before importing modules that use it
vi.mock('h3', async () => {
  return {
    getQuery: vi.fn(() => ({})),
    getCookie: vi.fn(),
    getHeader: vi.fn(),
    getRequestIP: vi.fn(() => '127.0.0.1'),
    createError: vi.fn((error: any) => {
      const err = new Error(error.statusMessage || error.message) as unknown
      err.statusCode = error.statusCode
      err.statusMessage = error.statusMessage
      return err
    }),
  }
})

// Mock Supabase before importing modules
vi.mock('#supabase/server', () => ({
  serverSupabaseClient: vi.fn(),
  serverSupabaseServiceRole: vi.fn(),
  serverSupabaseUser: vi.fn(),
}))

// Cast to mock functions for test manipulation
const mockGetCookie = getCookie as ReturnType<typeof vi.fn>
const mockGetHeader = getHeader as ReturnType<typeof vi.fn>
const mockGetRequestIP = getRequestIP as ReturnType<typeof vi.fn>
const mockCreateError = createError as ReturnType<typeof vi.fn>
const mockServerSupabaseClient = serverSupabaseClient as ReturnType<typeof vi.fn>
const mockServerSupabaseServiceRole = serverSupabaseServiceRole as ReturnType<typeof vi.fn>

describe('adminAuth.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete process.env.NODE_ENV
    delete process.env.VERCEL_ENV
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('isProductionEnvironment', () => {
    it('should return true when NODE_ENV is production', () => {
      process.env.NODE_ENV = 'production'
      expect(isProductionEnvironment()).toBe(true)
    })

    it('should return true when VERCEL_ENV is production', () => {
      process.env.VERCEL_ENV = 'production'
      expect(isProductionEnvironment()).toBe(true)
    })

    it('should return true when both are production', () => {
      process.env.NODE_ENV = 'production'
      process.env.VERCEL_ENV = 'production'
      expect(isProductionEnvironment()).toBe(true)
    })

    it('should return false when NODE_ENV is development', () => {
      process.env.NODE_ENV = 'development'
      expect(isProductionEnvironment()).toBe(false)
    })

    it('should return false when NODE_ENV is test', () => {
      process.env.NODE_ENV = 'test'
      expect(isProductionEnvironment()).toBe(false)
    })

    it('should return false when both are undefined', () => {
      expect(isProductionEnvironment()).toBe(false)
    })
  })

  describe('requireNonProductionEnvironment', () => {
    it('should throw 403 error in production environment', () => {
      process.env.NODE_ENV = 'production'
      const mockEvent = createMockEvent()

      expect(() => requireNonProductionEnvironment(mockEvent as unknown)).toThrow()
      expect(mockCreateError).toHaveBeenCalledWith({
        statusCode: 403,
        statusMessage: 'Admin testing endpoints are disabled in production for security',
      })
    })

    it('should not throw error in development environment', () => {
      process.env.NODE_ENV = 'development'
      const mockEvent = createMockEvent()

      expect(() => requireNonProductionEnvironment(mockEvent as unknown)).not.toThrow()
    })

    it('should not throw error in test environment', () => {
      process.env.NODE_ENV = 'test'
      const mockEvent = createMockEvent()

      expect(() => requireNonProductionEnvironment(mockEvent as unknown)).not.toThrow()
    })
  })

  describe('requireAdminRole', () => {
    describe('Bearer Token Authentication', () => {
      it('should return userId for valid bearer token with admin role', async () => {
        const mockEvent = createMockEvent({
          node: {
            req: {
              headers: {
                authorization: 'Bearer valid_token_123',
              },
            },
            res: {},
          },
        })

        const mockSupabase = {
          auth: {
            getUser: vi.fn().mockResolvedValue(createAuthResponse(
              { id: 'user-123', email: 'admin@example.com' },
              null,
            )),
          },
          from: vi.fn(() => ({
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue(createProfileResponse({ role: 'admin' })),
              })),
            })),
          })),
        }

        mockServerSupabaseServiceRole.mockReturnValue(mockSupabase as unknown)

        const userId = await requireAdminRole(mockEvent as unknown)
        expect(userId).toBe('user-123')
      })

      it('should throw 403 for valid bearer token with non-admin role', async () => {
        const mockEvent = createMockEvent({
          node: {
            req: {
              headers: {
                authorization: 'Bearer valid_token_123',
              },
            },
            res: {},
          },
        })

        const mockSupabase = {
          auth: {
            getUser: vi.fn().mockResolvedValue(createAuthResponse(
              { id: 'user-456', email: 'user@example.com' },
              null,
            )),
          },
          from: vi.fn(() => ({
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue(createProfileResponse({ role: 'user' })),
              })),
            })),
          })),
        }

        mockServerSupabaseServiceRole.mockReturnValue(mockSupabase as unknown)

        await expect(requireAdminRole(mockEvent as unknown)).rejects.toThrow()
        expect(mockCreateError).toHaveBeenCalledWith({
          statusCode: 403,
          statusMessage: 'Admin access required',
        })
      })

      it('should throw 401 for expired bearer token', async () => {
        const mockEvent = createMockEvent({
          node: {
            req: {
              headers: {
                authorization: 'Bearer expired_token',
              },
            },
            res: {},
          },
        })

        const mockSupabase = {
          auth: {
            getUser: vi.fn().mockResolvedValue(createAuthResponse(
              null,
              { message: 'Token expired', code: 'token_expired' },
            )),
          },
        }

        mockServerSupabaseServiceRole.mockReturnValue(mockSupabase as unknown)

        await expect(requireAdminRole(mockEvent as unknown)).rejects.toThrow()
        expect(mockCreateError).toHaveBeenCalledWith({
          statusCode: 401,
          statusMessage: 'Authentication required',
        })
      })

      it('should throw 401 for malformed bearer token', async () => {
        const mockEvent = createMockEvent({
          node: {
            req: {
              headers: {
                authorization: 'Bearer malformed!!!token',
              },
            },
            res: {},
          },
        })

        const mockSupabase = {
          auth: {
            getUser: vi.fn().mockResolvedValue(createAuthResponse(
              null,
              { message: 'Invalid token format', code: 'invalid_token' },
            )),
          },
        }

        mockServerSupabaseServiceRole.mockReturnValue(mockSupabase as unknown)

        await expect(requireAdminRole(mockEvent as unknown)).rejects.toThrow()
      })

      it('should extract token correctly from Bearer header', async () => {
        const mockEvent = createMockEvent({
          node: {
            req: {
              headers: {
                authorization: 'Bearer test_token_xyz',
              },
            },
            res: {},
          },
        })

        const getUserMock = vi.fn().mockResolvedValue(createAuthResponse(
          { id: 'user-789', email: 'admin@example.com' },
          null,
        ))

        const mockSupabase = {
          auth: {
            getUser: getUserMock,
          },
          from: vi.fn(() => ({
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue(createProfileResponse({ role: 'admin' })),
              })),
            })),
          })),
        }

        mockServerSupabaseServiceRole.mockReturnValue(mockSupabase as unknown)

        await requireAdminRole(mockEvent as unknown)

        // Verify the token was passed correctly (without "Bearer " prefix)
        expect(getUserMock).toHaveBeenCalledWith('test_token_xyz')
      })

      it('should check Authorization header from node.req.headers', async () => {
        const mockEvent = createMockEvent({
          node: {
            req: {
              headers: {
                Authorization: 'Bearer node_header_token',
              },
            },
            res: {},
          },
        })

        const mockSupabase = {
          auth: {
            getUser: vi.fn().mockResolvedValue(createAuthResponse(
              { id: 'user-789', email: 'admin@example.com' },
              null,
            )),
          },
          from: vi.fn(() => ({
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue(createProfileResponse({ role: 'admin' })),
              })),
            })),
          })),
        }

        mockServerSupabaseServiceRole.mockReturnValue(mockSupabase as unknown)
        mockGetHeader.mockReturnValue(null)

        const userId = await requireAdminRole(mockEvent as unknown)
        expect(userId).toBe('user-789')
      })
    })

    describe('Cookie Authentication Fallback', () => {
      it('should return userId for valid session with admin role', async () => {
        const mockEvent = createMockEvent()

        const mockCookieClient = {
          auth: {
            getUser: vi.fn().mockResolvedValue(createAuthResponse(
              { id: 'user-cookie-123', email: 'admin@example.com' },
              null,
            )),
          },
        }

        const mockServiceRole = {
          from: vi.fn(() => ({
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue(createProfileResponse({ role: 'admin' })),
              })),
            })),
          })),
        }

        mockServerSupabaseClient.mockResolvedValue(mockCookieClient as unknown)
        mockServerSupabaseServiceRole.mockReturnValue(mockServiceRole as unknown)

        const userId = await requireAdminRole(mockEvent as unknown)
        expect(userId).toBe('user-cookie-123')
      })

      it('should throw 403 for valid session with non-admin role', async () => {
        const mockEvent = createMockEvent()

        const mockCookieClient = {
          auth: {
            getUser: vi.fn().mockResolvedValue(createAuthResponse(
              { id: 'user-456', email: 'user@example.com' },
              null,
            )),
          },
        }

        const mockServiceRole = {
          from: vi.fn(() => ({
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue(createProfileResponse({ role: 'user' })),
              })),
            })),
          })),
        }

        mockServerSupabaseClient.mockResolvedValue(mockCookieClient as unknown)
        mockServerSupabaseServiceRole.mockReturnValue(mockServiceRole as unknown)

        await expect(requireAdminRole(mockEvent as unknown)).rejects.toThrow()
        expect(mockCreateError).toHaveBeenCalledWith({
          statusCode: 403,
          statusMessage: 'Admin access required',
        })
      })

      it('should throw 401 when no session exists', async () => {
        const mockEvent = createMockEvent()

        const mockCookieClient = {
          auth: {
            getUser: vi.fn().mockResolvedValue(createAuthResponse(
              null,
              { message: 'No session' },
            )),
          },
        }

        mockServerSupabaseClient.mockResolvedValue(mockCookieClient as unknown)

        await expect(requireAdminRole(mockEvent as unknown)).rejects.toThrow()
        expect(mockCreateError).toHaveBeenCalledWith({
          statusCode: 401,
          statusMessage: 'Authentication required',
        })
      })

      it('should fallback to cookie auth when no bearer token present', async () => {
        const mockEvent = createMockEvent()

        const mockCookieClient = {
          auth: {
            getUser: vi.fn().mockResolvedValue(createAuthResponse(
              { id: 'user-cookie-456', email: 'admin@example.com' },
              null,
            )),
          },
        }

        const mockServiceRole = {
          from: vi.fn(() => ({
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue(createProfileResponse({ role: 'admin' })),
              })),
            })),
          })),
        }

        mockServerSupabaseClient.mockResolvedValue(mockCookieClient as unknown)
        mockServerSupabaseServiceRole.mockReturnValue(mockServiceRole as unknown)

        const userId = await requireAdminRole(mockEvent as unknown)
        expect(userId).toBe('user-cookie-456')
        expect(mockServerSupabaseClient).toHaveBeenCalled()
      })
    })

    describe('Profile Lookup', () => {
      it('should throw 403 when user exists but profile does not', async () => {
        const mockEvent = createMockEvent()

        const mockCookieClient = {
          auth: {
            getUser: vi.fn().mockResolvedValue(createAuthResponse(
              { id: 'user-no-profile', email: 'user@example.com' },
              null,
            )),
          },
        }

        const mockServiceRole = {
          from: vi.fn(() => ({
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue(createProfileResponse(
                  null,
                  { message: 'Profile not found' },
                )),
              })),
            })),
          })),
        }

        mockServerSupabaseClient.mockResolvedValue(mockCookieClient as unknown)
        mockServerSupabaseServiceRole.mockReturnValue(mockServiceRole as unknown)

        await expect(requireAdminRole(mockEvent as unknown)).rejects.toThrow()
        expect(mockCreateError).toHaveBeenCalledWith({
          statusCode: 403,
          statusMessage: 'Unable to verify admin privileges',
        })
      })

      it('should throw 403 when profile exists but role is null', async () => {
        const mockEvent = createMockEvent()

        const mockCookieClient = {
          auth: {
            getUser: vi.fn().mockResolvedValue(createAuthResponse(
              { id: 'user-null-role', email: 'user@example.com' },
              null,
            )),
          },
        }

        const mockServiceRole = {
          from: vi.fn(() => ({
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue(createProfileResponse({ role: null })),
              })),
            })),
          })),
        }

        mockServerSupabaseClient.mockResolvedValue(mockCookieClient as unknown)
        mockServerSupabaseServiceRole.mockReturnValue(mockServiceRole as unknown)

        await expect(requireAdminRole(mockEvent as unknown)).rejects.toThrow()
        expect(mockCreateError).toHaveBeenCalledWith({
          statusCode: 403,
          statusMessage: 'Admin access required',
        })
      })

      it('should throw error when database error occurs during profile lookup', async () => {
        const mockEvent = createMockEvent()

        const mockCookieClient = {
          auth: {
            getUser: vi.fn().mockResolvedValue(createAuthResponse(
              { id: 'user-db-error', email: 'user@example.com' },
              null,
            )),
          },
        }

        const mockServiceRole = {
          from: vi.fn(() => ({
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue(createProfileResponse(
                  null,
                  { message: 'Database connection failed', code: 'PGRST301' },
                )),
              })),
            })),
          })),
        }

        mockServerSupabaseClient.mockResolvedValue(mockCookieClient as unknown)
        mockServerSupabaseServiceRole.mockReturnValue(mockServiceRole as unknown)

        await expect(requireAdminRole(mockEvent as unknown)).rejects.toThrow()
        expect(mockCreateError).toHaveBeenCalledWith({
          statusCode: 403,
          statusMessage: 'Unable to verify admin privileges',
        })
      })

      it('should successfully verify admin when profile has admin role', async () => {
        const mockEvent = createMockEvent()

        const mockCookieClient = {
          auth: {
            getUser: vi.fn().mockResolvedValue(createAuthResponse(
              { id: 'admin-user-id', email: 'admin@example.com' },
              null,
            )),
          },
        }

        const mockServiceRole = {
          from: vi.fn(() => ({
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue(createProfileResponse({ role: 'admin' })),
              })),
            })),
          })),
        }

        mockServerSupabaseClient.mockResolvedValue(mockCookieClient as unknown)
        mockServerSupabaseServiceRole.mockReturnValue(mockServiceRole as unknown)

        const userId = await requireAdminRole(mockEvent as unknown)
        expect(userId).toBe('admin-user-id')
      })
    })

    describe('Edge Cases', () => {
      it('should handle SQL injection attempts in bearer token', async () => {
        const mockEvent = createMockEvent({
          node: {
            req: {
              headers: {
                authorization: 'Bearer \'; DROP TABLE users; --',
              },
            },
            res: {},
          },
        })

        const mockSupabase = {
          auth: {
            getUser: vi.fn().mockResolvedValue(createAuthResponse(
              null,
              { message: 'Invalid token' },
            )),
          },
        }

        mockServerSupabaseServiceRole.mockReturnValue(mockSupabase as unknown)

        await expect(requireAdminRole(mockEvent as unknown)).rejects.toThrow()
      })

      it('should handle very long bearer tokens', async () => {
        const longToken = 'a'.repeat(10000)
        const mockEvent = createMockEvent({
          node: {
            req: {
              headers: {
                authorization: `Bearer ${longToken}`,
              },
            },
            res: {},
          },
        })

        const mockSupabase = {
          auth: {
            getUser: vi.fn().mockResolvedValue(createAuthResponse(
              null,
              { message: 'Invalid token' },
            )),
          },
        }

        mockServerSupabaseServiceRole.mockReturnValue(mockSupabase as unknown)

        await expect(requireAdminRole(mockEvent as unknown)).rejects.toThrow()
      })

      it('should handle empty bearer token', async () => {
        const mockEvent = createMockEvent({
          node: {
            req: {
              headers: {
                authorization: 'Bearer ',
              },
            },
            res: {},
          },
        })

        const mockSupabase = {
          auth: {
            getUser: vi.fn().mockResolvedValue(createAuthResponse(
              null,
              { message: 'Token required' },
            )),
          },
        }

        mockServerSupabaseServiceRole.mockReturnValue(mockSupabase as unknown)

        await expect(requireAdminRole(mockEvent as unknown)).rejects.toThrow()
      })

      it('should handle special characters in user ID', async () => {
        const mockEvent = createMockEvent()

        const mockCookieClient = {
          auth: {
            getUser: vi.fn().mockResolvedValue(createAuthResponse(
              { id: 'user-!@#$%^&*()', email: 'admin@example.com' },
              null,
            )),
          },
        }

        const mockServiceRole = {
          from: vi.fn(() => ({
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue(createProfileResponse({ role: 'admin' })),
              })),
            })),
          })),
        }

        mockServerSupabaseClient.mockResolvedValue(mockCookieClient as unknown)
        mockServerSupabaseServiceRole.mockReturnValue(mockServiceRole as unknown)

        const userId = await requireAdminRole(mockEvent as unknown)
        expect(userId).toBe('user-!@#$%^&*()')
      })

      it('should validate user object structure - invalid id type', async () => {
        const mockEvent = createMockEvent()

        const mockCookieClient = {
          auth: {
            getUser: vi.fn().mockResolvedValue({
              data: {
                user: {
                  id: 123, // Invalid - should be string
                  email: 'admin@example.com',
                },
              },
              error: null,
            }),
          },
        }

        mockServerSupabaseClient.mockResolvedValue(mockCookieClient as unknown)

        await expect(requireAdminRole(mockEvent as unknown)).rejects.toThrow()
      })

      it('should handle missing email in user object', async () => {
        const mockEvent = createMockEvent()

        const mockCookieClient = {
          auth: {
            getUser: vi.fn().mockResolvedValue({
              data: {
                user: {
                  id: 'user-123',
                  // Missing email
                },
              },
              error: null,
            }),
          },
        }

        mockServerSupabaseClient.mockResolvedValue(mockCookieClient as unknown)

        await expect(requireAdminRole(mockEvent as unknown)).rejects.toThrow()
      })

      it('should handle concurrent authentication requests', async () => {
        const mockEvent = createMockEvent()

        const mockCookieClient = {
          auth: {
            getUser: vi.fn().mockResolvedValue(createAuthResponse(
              { id: 'concurrent-user', email: 'admin@example.com' },
              null,
            )),
          },
        }

        const mockServiceRole = {
          from: vi.fn(() => ({
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue(createProfileResponse({ role: 'admin' })),
              })),
            })),
          })),
        }

        mockServerSupabaseClient.mockResolvedValue(mockCookieClient as unknown)
        mockServerSupabaseServiceRole.mockReturnValue(mockServiceRole as unknown)

        // Make concurrent requests
        const results = await Promise.all([
          requireAdminRole(mockEvent as unknown),
          requireAdminRole(mockEvent as unknown),
          requireAdminRole(mockEvent as unknown),
        ])

        expect(results).toHaveLength(3)
        results.forEach(userId => expect(userId).toBe('concurrent-user'))
      })
    })

    describe('Logging Behavior', () => {
      let consoleLogSpy: any
      let consoleErrorSpy: any
      let consoleWarnSpy: any

      beforeEach(() => {
        consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
        consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      })

      afterEach(() => {
        consoleLogSpy.mockRestore()
        consoleErrorSpy.mockRestore()
        consoleWarnSpy.mockRestore()
      })

      it('should log successful admin access in development mode', async () => {
        process.env.NODE_ENV = 'development'
        const mockEvent = createMockEvent()

        const mockCookieClient = {
          auth: {
            getUser: vi.fn().mockResolvedValue(createAuthResponse(
              { id: 'log-user', email: 'admin@example.com' },
              null,
            )),
          },
        }

        const mockServiceRole = {
          from: vi.fn(() => ({
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue(createProfileResponse({ role: 'admin' })),
              })),
            })),
          })),
        }

        mockServerSupabaseClient.mockResolvedValue(mockCookieClient as unknown)
        mockServerSupabaseServiceRole.mockReturnValue(mockServiceRole as unknown)

        await requireAdminRole(mockEvent as unknown)

        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('[AdminAuth] ✓ Admin access granted'),
        )
      })

      it('should log bearer token validation errors', async () => {
        const mockEvent = createMockEvent({
          node: {
            req: {
              headers: {
                authorization: 'Bearer invalid_token',
              },
            },
            res: {},
          },
        })

        const mockSupabase = {
          auth: {
            getUser: vi.fn().mockResolvedValue(createAuthResponse(
              null,
              { message: 'Token validation failed', code: 'invalid_token' },
            )),
          },
        }

        mockServerSupabaseServiceRole.mockReturnValue(mockSupabase as unknown)

        try {
          await requireAdminRole(mockEvent as unknown)
        }
        catch (e: any) {
          // Expected to throw
        }

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('[AdminAuth] Bearer token validation failed'),
          expect.any(Object),
        )
      })

      it('should log 401 unauthorized attempts', async () => {
        const mockEvent = createMockEvent()

        const mockCookieClient = {
          auth: {
            getUser: vi.fn().mockResolvedValue(createAuthResponse(
              null,
              { message: 'No session' },
            )),
          },
        }

        mockServerSupabaseClient.mockResolvedValue(mockCookieClient as unknown)

        try {
          await requireAdminRole(mockEvent as unknown)
        }
        catch (e: any) {
          // Expected to throw
        }

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('[AdminAuth] 401 Unauthorized'),
        )
      })

      it('should log 403 forbidden attempts with user details', async () => {
        const mockEvent = createMockEvent()

        const mockCookieClient = {
          auth: {
            getUser: vi.fn().mockResolvedValue(createAuthResponse(
              { id: 'non-admin', email: 'user@example.com' },
              null,
            )),
          },
        }

        const mockServiceRole = {
          from: vi.fn(() => ({
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue(createProfileResponse({ role: 'user' })),
              })),
            })),
          })),
        }

        mockServerSupabaseClient.mockResolvedValue(mockCookieClient as unknown)
        mockServerSupabaseServiceRole.mockReturnValue(mockServiceRole as unknown)

        try {
          await requireAdminRole(mockEvent as unknown)
        }
        catch (e: any) {
          // Expected to throw
        }

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('[AdminAuth] 403 Forbidden'),
        )
      })
    })
  })

  describe('requireAdminTestingAccess', () => {
    it('should throw 403 in production environment before checking admin role', async () => {
      process.env.NODE_ENV = 'production'
      const mockEvent = createMockEvent()

      await expect(requireAdminTestingAccess(mockEvent as unknown)).rejects.toThrow()
      expect(mockCreateError).toHaveBeenCalledWith({
        statusCode: 403,
        statusMessage: 'Admin testing endpoints are disabled in production for security',
      })
    })

    it('should check admin role after verifying non-production environment', async () => {
      process.env.NODE_ENV = 'development'
      const mockEvent = createMockEvent()

      const mockCookieClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue(createAuthResponse(
            { id: 'test-admin', email: 'admin@example.com' },
            null,
          )),
        },
      }

      const mockServiceRole = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue(createProfileResponse({ role: 'admin' })),
            })),
          })),
        })),
      }

      mockServerSupabaseClient.mockResolvedValue(mockCookieClient as unknown)
      mockServerSupabaseServiceRole.mockReturnValue(mockServiceRole as unknown)

      const userId = await requireAdminTestingAccess(mockEvent as unknown)
      expect(userId).toBe('test-admin')
    })

    it('should throw 401 for non-authenticated users in development', async () => {
      process.env.NODE_ENV = 'development'
      const mockEvent = createMockEvent()

      const mockCookieClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue(createAuthResponse(
            null,
            { message: 'No session' },
          )),
        },
      }

      mockServerSupabaseClient.mockResolvedValue(mockCookieClient as unknown)

      await expect(requireAdminTestingAccess(mockEvent as unknown)).rejects.toThrow()
    })
  })

  describe('logAdminAction', () => {
    let consoleLogSpy: any
    let consoleErrorSpy: any

    beforeEach(() => {
      consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
      consoleLogSpy.mockRestore()
      consoleErrorSpy.mockRestore()
    })

    it('should successfully log admin action to database', async () => {
      const mockEvent = createMockEvent()
      const mockInsert = vi.fn().mockResolvedValue({ error: null })

      const mockSupabase = {
        from: vi.fn(() => ({
          insert: mockInsert,
        })),
      }

      mockServerSupabaseServiceRole.mockReturnValue(mockSupabase as unknown)

      const result = await logAdminAction(
        mockEvent as unknown,
        'admin-123',
        'DELETE_USER',
        { userId: 'user-456' },
      )

      expect(result.success).toBe(true)
      expect(result.errorId).toBeUndefined()
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[ADMIN_AUDIT]',
        expect.any(String),
      )
    })

    it('should handle database logging failure with fallback', async () => {
      const mockEvent = createMockEvent()
      const mockSupabase = {
        from: vi.fn(() => ({
          insert: vi.fn().mockResolvedValue({
            error: { message: 'Database unavailable', code: 'PGRST301' },
          }),
        })),
      }

      mockServerSupabaseServiceRole.mockReturnValue(mockSupabase as unknown)

      const result = await logAdminAction(
        mockEvent as unknown,
        'admin-123',
        'UPDATE_PRODUCT',
        { productId: 'prod-789' },
      )

      expect(result.success).toBe(false)
      expect(result.errorId).toBeDefined()
      expect(result.error).toContain('Failed to store audit log in database')
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ADMIN_AUDIT_CRITICAL]'),
        expect.any(Object),
      )
    })

    it('should log to console even when database succeeds', async () => {
      const mockEvent = createMockEvent()
      const mockSupabase = {
        from: vi.fn(() => ({
          insert: vi.fn().mockResolvedValue({ error: null }),
        })),
      }

      mockServerSupabaseServiceRole.mockReturnValue(mockSupabase as unknown)

      await logAdminAction(mockEvent as unknown, 'admin-123', 'CREATE_ORDER', {})

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[ADMIN_AUDIT]',
        expect.stringContaining('CREATE_ORDER'),
      )
    })

    it('should include IP address and user agent in audit log', async () => {
      const mockEvent = createMockEvent()
      const mockInsert = vi.fn().mockResolvedValue({ error: null })
      const mockSupabase = {
        from: vi.fn(() => ({
          insert: mockInsert,
        })),
      }

      mockServerSupabaseServiceRole.mockReturnValue(mockSupabase)
      mockGetHeader.mockImplementation((event: any, header: any) => {
        if (header === 'user-agent') return 'Mozilla/5.0'
        return null
      })

      await logAdminAction(mockEvent as unknown, 'admin-123', 'VIEW_REPORTS', {})

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          ip_address: '127.0.0.1',
          user_agent: 'Mozilla/5.0',
        }),
      )
    })

    it('should handle exception during logging gracefully', async () => {
      const mockEvent = createMockEvent()
      const mockSupabase = {
        from: vi.fn(() => {
          throw new Error('Unexpected database error')
        }),
      }

      mockServerSupabaseServiceRole.mockReturnValue(mockSupabase as unknown)

      const result = await logAdminAction(mockEvent as unknown, 'admin-123', 'DELETE_ORDER', {})

      expect(result.success).toBe(false)
      expect(result.error).toBe('Unexpected database error')
      expect(consoleErrorSpy).toHaveBeenCalled()
    })

    it('should generate unique error IDs for failed logs', async () => {
      const mockEvent = createMockEvent()
      const mockSupabase = {
        from: vi.fn(() => ({
          insert: vi.fn().mockResolvedValue({
            error: { message: 'DB Error' },
          }),
        })),
      }

      mockServerSupabaseServiceRole.mockReturnValue(mockSupabase as unknown)

      const result1 = await logAdminAction(mockEvent as unknown, 'admin-1', 'ACTION_1', {})
      const result2 = await logAdminAction(mockEvent as unknown, 'admin-2', 'ACTION_2', {})

      expect(result1.errorId).not.toBe(result2.errorId)
      expect(result1.errorId).toMatch(/^audit_\d+_[a-z0-9]+$/)
      expect(result2.errorId).toMatch(/^audit_\d+_[a-z0-9]+$/)
    })

    it('should include metadata in audit log', async () => {
      const mockEvent = createMockEvent()
      const mockInsert = vi.fn().mockResolvedValue({ error: null })
      const mockSupabase = {
        from: vi.fn(() => ({
          insert: mockInsert,
        })),
      }

      mockServerSupabaseServiceRole.mockReturnValue(mockSupabase as unknown)

      const metadata = {
        resource_type: 'product',
        resource_id: 'prod-123',
        old_values: { price: 100 },
        new_values: { price: 150 },
      }

      await logAdminAction(mockEvent as unknown, 'admin-123', 'UPDATE_PRICE', metadata)

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          resource_type: 'product',
          resource_id: 'prod-123',
          old_values: { price: 100 },
          new_values: { price: 150 },
        }),
      )
    })
  })

  describe('Integration Tests', () => {
    it('should handle complete authentication flow with bearer token', async () => {
      const mockEvent = createMockEvent({
        node: {
          req: {
            headers: {
              authorization: 'Bearer integration_token',
            },
          },
          res: {},
        },
      })

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue(createAuthResponse(
            { id: 'integration-user', email: 'integration@example.com' },
            null,
          )),
        },
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue(createProfileResponse({ role: 'admin' })),
            })),
          })),
        })),
      }

      mockServerSupabaseServiceRole.mockReturnValue(mockSupabase as unknown)

      const userId = await requireAdminRole(mockEvent as unknown)
      expect(userId).toBe('integration-user')
    })

    it('should handle complete authentication flow with cookies', async () => {
      const mockEvent = createMockEvent()

      const mockCookieClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue(createAuthResponse(
            { id: 'cookie-integration-user', email: 'cookie@example.com' },
            null,
          )),
        },
      }

      const mockServiceRole = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue(createProfileResponse({ role: 'admin' })),
            })),
          })),
        })),
      }

      mockServerSupabaseClient.mockResolvedValue(mockCookieClient as unknown)
      mockServerSupabaseServiceRole.mockReturnValue(mockServiceRole as unknown)

      const userId = await requireAdminRole(mockEvent as unknown)
      expect(userId).toBe('cookie-integration-user')
    })
  })
})
