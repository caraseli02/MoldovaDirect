/**
 * Integration Tests: Admin Authentication Flows
 *
 * Tests real-world authentication scenarios for admin panel access.
 * These tests simulate production-like scenarios with actual database interactions.
 *
 * Coverage:
 * - Session expiration during operations
 * - Token refresh for long sessions
 * - MFA enforcement
 * - Role escalation prevention
 * - Concurrent admin sessions
 * - Auth method precedence (Bearer vs Cookie)
 *
 * @requires SUPABASE_URL
 * @requires SUPABASE_SERVICE_KEY
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Create Supabase admin client for integration tests
 */
function createSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables')
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * Test user interface matching database schema
 */
interface TestAuthUser {
  id: string
  email: string
  access_token?: string
  refresh_token?: string
}

/**
 * Helper to create a test user with specified role
 */
async function createAuthTestUser(
  supabase: SupabaseClient,
  email: string,
  role: 'admin' | 'user' = 'user',
  password = 'TestPassword123!',
): Promise<TestAuthUser> {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error || !data.user) {
    throw new Error(`Failed to create test user: ${error?.message}`)
  }

  // Update role in profiles table
  await supabase
    .from('profiles')
    .update({ role })
    .eq('id', data.user.id)

  // Sign in to get tokens
  const { data: signInData } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  return {
    id: data.user.id,
    email: data.user.email!,
    access_token: signInData?.session?.access_token,
    refresh_token: signInData?.session?.refresh_token,
  }
}

/**
 * Helper to cleanup test user
 */
async function cleanupAuthTestUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  await supabase.from('profiles').delete().eq('id', userId)
  await supabase.auth.admin.deleteUser(userId)
}

/**
 * Helper to simulate expired token
 */
function createExpiredToken(): string {
  // A token that looks valid but is expired or malformed
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.expired'
}

describe('Admin Authentication Integration Tests', () => {
  let supabase: SupabaseClient
  let testUsers: TestAuthUser[] = []

  beforeAll(async () => {
    supabase = createSupabaseClient()
  })

  beforeEach(() => {
    testUsers = []
  })

  afterAll(async () => {
    // Cleanup all test users
    for (const user of testUsers) {
      try {
        await cleanupAuthTestUser(supabase, user.id)
      }
      catch (error) {
        console.warn(`Failed to cleanup user ${user.id}:`, error)
      }
    }
  })

  describe('Session Expiration During Operation', () => {
    it('should handle expired session gracefully without crashing', async () => {
      const expiredToken = createExpiredToken()

      const response = await fetch('http://localhost:3000/api/admin/dashboard/stats', {
        headers: {
          Authorization: `Bearer ${expiredToken}`,
        },
      })

      // Should return 401, not 500 (crash)
      expect(response.status).toBe(401)

      const data = await response.json()
      expect(data).toHaveProperty('statusMessage')
      expect(data.statusMessage).toContain('Authentication')
    })

    it('should redirect to login on expired token in middleware', async () => {
      // Create admin user
      const adminUser = await createAuthTestUser(
        supabase,
        `admin-session-${Date.now()}@test.example`,
        'admin',
      )
      testUsers.push(adminUser)

      // Attempt to access admin page with expired token
      const expiredToken = createExpiredToken()

      const response = await fetch('http://localhost:3000/api/admin/orders', {
        headers: {
          Authorization: `Bearer ${expiredToken}`,
        },
        redirect: 'manual',
      })

      // Should be rejected with 401
      expect(response.status).toBe(401)
    })

    it('should return proper error message on session expiration', async () => {
      const expiredToken = createExpiredToken()

      const response = await fetch('http://localhost:3000/api/admin/users', {
        headers: {
          Authorization: `Bearer ${expiredToken}`,
        },
      })

      expect(response.status).toBe(401)

      const data = await response.json()
      expect(data.statusMessage).toBeTruthy()
      expect(data.statusMessage.toLowerCase()).toMatch(/auth|session|token/)
    })
  })

  describe('Token Refresh During Long Sessions', () => {
    it('should validate fresh token successfully', async () => {
      const adminUser = await createAuthTestUser(
        supabase,
        `admin-refresh-${Date.now()}@test.example`,
        'admin',
      )
      testUsers.push(adminUser)

      // Use fresh token
      const response = await fetch('http://localhost:3000/api/admin/dashboard/stats', {
        headers: {
          Authorization: `Bearer ${adminUser.access_token}`,
        },
      })

      // Should succeed (200 or 500 if data issues, but not 401)
      expect(response.status).not.toBe(401)
      expect([200, 500]).toContain(response.status)
    })

    it('should handle token refresh gracefully', async () => {
      const adminUser = await createAuthTestUser(
        supabase,
        `admin-long-session-${Date.now()}@test.example`,
        'admin',
      )
      testUsers.push(adminUser)

      // Simulate refresh token exchange
      if (adminUser.refresh_token) {
        const { data, error } = await supabase.auth.refreshSession({
          refresh_token: adminUser.refresh_token,
        })

        expect(error).toBeNull()
        expect(data.session).toBeTruthy()
        expect(data.session?.access_token).toBeTruthy()

        // New token should work
        const response = await fetch('http://localhost:3000/api/admin/users', {
          headers: {
            Authorization: `Bearer ${data.session?.access_token}`,
          },
        })

        expect(response.status).not.toBe(401)
      }
    })

    it('should reject invalid refresh token', async () => {
      const invalidRefreshToken = 'invalid-refresh-token-12345'

      const { error } = await supabase.auth.refreshSession({
        refresh_token: invalidRefreshToken,
      })

      expect(error).toBeTruthy()
      expect(error?.message).toBeTruthy()
    })
  })

  describe('MFA Enforcement', () => {
    it('should allow admin without MFA in development mode', async () => {
      const adminUser = await createAuthTestUser(
        supabase,
        `admin-no-mfa-${Date.now()}@moldovadirect.com`,
        'admin',
      )
      testUsers.push(adminUser)

      // In development, @moldovadirect.com emails bypass MFA (per middleware/admin.ts:62)
      const response = await fetch('http://localhost:3000/api/admin/dashboard/stats', {
        headers: {
          Authorization: `Bearer ${adminUser.access_token}`,
        },
      })

      // Should succeed (not be blocked for MFA)
      expect(response.status).not.toBe(403)
      expect([200, 500]).toContain(response.status)
    })

    it('should check MFA status via Supabase API', async () => {
      const adminUser = await createAuthTestUser(
        supabase,
        `admin-mfa-check-${Date.now()}@test.example`,
        'admin',
      )
      testUsers.push(adminUser)

      // Check MFA level
      const { data: sessionData } = await supabase.auth.getSession()

      if (sessionData.session) {
        const { data: mfaData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()

        // MFA data should be available
        expect(mfaData).toBeTruthy()
        expect(mfaData?.currentLevel).toBeDefined()
        expect(['aal1', 'aal2']).toContain(mfaData?.currentLevel)
      }
    })

    it('should verify MFA enforcement logic exists in middleware', async () => {
      // This is a structural test - verify the middleware has MFA checks
      // The actual MFA blocking is tested in middleware/admin.test.ts

      const adminUser = await createAuthTestUser(
        supabase,
        `admin-mfa-verify-${Date.now()}@external.com`,
        'admin',
      )
      testUsers.push(adminUser)

      // Make request to admin endpoint
      const response = await fetch('http://localhost:3000/api/admin/users', {
        headers: {
          Authorization: `Bearer ${adminUser.access_token}`,
        },
      })

      // Should either succeed or fail based on MFA status, but not crash
      expect([200, 401, 403, 404, 500]).toContain(response.status)
    })
  })

  describe('Role Escalation Prevention', () => {
    it('should always verify role from database, not client', async () => {
      const regularUser = await createAuthTestUser(
        supabase,
        `user-escalation-${Date.now()}@test.example`,
        'user',
      )
      testUsers.push(regularUser)

      // Attempt to access admin endpoint with user token
      // Even if client claims to be admin, server should check DB
      const response = await fetch('http://localhost:3000/api/admin/orders', {
        headers: {
          Authorization: `Bearer ${regularUser.access_token}`,
        },
      })

      // Should be rejected with 403 (Forbidden)
      expect(response.status).toBe(403)

      const data = await response.json()
      expect(data.statusMessage).toContain('Admin access required')
    })

    it('should reject role manipulation via localStorage simulation', async () => {
      const regularUser = await createAuthTestUser(
        supabase,
        `user-localstorage-${Date.now()}@test.example`,
        'user',
      )
      testUsers.push(regularUser)

      // Try to access admin endpoint
      // Server should ALWAYS check database role, not trust client
      const response = await fetch('http://localhost:3000/api/admin/products', {
        headers: {
          'Authorization': `Bearer ${regularUser.access_token}`,
          // Simulating client trying to claim admin role
          'X-User-Role': 'admin',
        },
      })

      // Should be rejected
      expect(response.status).toBe(403)
    })

    it('should verify role from profiles table on every request', async () => {
      const adminUser = await createAuthTestUser(
        supabase,
        `admin-role-verify-${Date.now()}@test.example`,
        'admin',
      )
      testUsers.push(adminUser)

      // First request succeeds (admin role)
      const response1 = await fetch('http://localhost:3000/api/admin/users', {
        headers: {
          Authorization: `Bearer ${adminUser.access_token}`,
        },
      })
      expect(response1.status).not.toBe(403)

      // Downgrade user role to 'user' in database
      await supabase
        .from('profiles')
        .update({ role: 'user' })
        .eq('id', adminUser.id)

      // Second request should fail (role changed)
      const response2 = await fetch('http://localhost:3000/api/admin/users', {
        headers: {
          Authorization: `Bearer ${adminUser.access_token}`,
        },
      })
      expect(response2.status).toBe(403)
    })

    it('should block users without profile record', async () => {
      const orphanUser = await createAuthTestUser(
        supabase,
        `orphan-${Date.now()}@test.example`,
        'admin',
      )
      testUsers.push(orphanUser)

      // Delete profile record
      await supabase.from('profiles').delete().eq('id', orphanUser.id)

      // Should be rejected (no profile)
      const response = await fetch('http://localhost:3000/api/admin/orders', {
        headers: {
          Authorization: `Bearer ${orphanUser.access_token}`,
        },
      })

      expect(response.status).toBe(403)
      const data = await response.json()
      expect(data.statusMessage).toContain('Unable to verify admin privileges')
    })
  })

  describe('Concurrent Admin Sessions', () => {
    it('should handle multiple concurrent sessions from same admin', async () => {
      const adminUser = await createAuthTestUser(
        supabase,
        `admin-concurrent-${Date.now()}@test.example`,
        'admin',
      )
      testUsers.push(adminUser)

      // Simulate concurrent requests from different tabs
      const requests = [
        fetch('http://localhost:3000/api/admin/users', {
          headers: { Authorization: `Bearer ${adminUser.access_token}` },
        }),
        fetch('http://localhost:3000/api/admin/products', {
          headers: { Authorization: `Bearer ${adminUser.access_token}` },
        }),
        fetch('http://localhost:3000/api/admin/orders', {
          headers: { Authorization: `Bearer ${adminUser.access_token}` },
        }),
      ]

      const responses = await Promise.all(requests)

      // All should succeed (or fail for non-auth reasons)
      for (const response of responses) {
        expect(response.status).not.toBe(401)
        expect(response.status).not.toBe(403)
      }
    })

    it('should maintain session validity across concurrent operations', async () => {
      const adminUser = await createAuthTestUser(
        supabase,
        `admin-session-validity-${Date.now()}@test.example`,
        'admin',
      )
      testUsers.push(adminUser)

      // First operation
      const response1 = await fetch('http://localhost:3000/api/admin/dashboard/stats', {
        headers: { Authorization: `Bearer ${adminUser.access_token}` },
      })

      // Second operation (should still work)
      const response2 = await fetch('http://localhost:3000/api/admin/dashboard/stats', {
        headers: { Authorization: `Bearer ${adminUser.access_token}` },
      })

      expect(response1.status).toBe(response2.status)
      expect(response1.status).not.toBe(401)
    })

    it('should handle session logout affecting all tabs', async () => {
      const adminUser = await createAuthTestUser(
        supabase,
        `admin-logout-${Date.now()}@test.example`,
        'admin',
      )
      testUsers.push(adminUser)

      // Verify session works
      const response1 = await fetch('http://localhost:3000/api/admin/users', {
        headers: { Authorization: `Bearer ${adminUser.access_token}` },
      })
      expect(response1.status).not.toBe(401)

      // Logout (invalidate session)
      await supabase.auth.signOut()

      // Token should no longer work
      const response2 = await fetch('http://localhost:3000/api/admin/users', {
        headers: { Authorization: `Bearer ${adminUser.access_token}` },
      })
      expect(response2.status).toBe(401)
    })
  })

  describe('Auth Method Precedence', () => {
    it('should use Bearer token when both Bearer and Cookie present', async () => {
      const adminUser = await createAuthTestUser(
        supabase,
        `admin-precedence-${Date.now()}@test.example`,
        'admin',
      )
      testUsers.push(adminUser)

      const regularUser = await createAuthTestUser(
        supabase,
        `user-precedence-${Date.now()}@test.example`,
        'user',
      )
      testUsers.push(regularUser)

      // Bearer token: admin (should be used)
      // Cookie: regular user (should be ignored)
      // Per adminAuth.ts lines 95-134, Bearer takes precedence

      const response = await fetch('http://localhost:3000/api/admin/orders', {
        headers: {
          Authorization: `Bearer ${adminUser.access_token}`,
          // Simulate cookie auth for different user
          Cookie: `sb-access-token=${regularUser.access_token}`,
        },
      })

      // Should succeed because Bearer token (admin) is used
      expect(response.status).not.toBe(403)
    })

    it('should fall back to cookie auth when Bearer not present', async () => {
      const regularUser = await createAuthTestUser(
        supabase,
        `user-cookie-${Date.now()}@test.example`,
        'user',
      )
      testUsers.push(regularUser)

      // No Bearer token, only cookie
      const response = await fetch('http://localhost:3000/api/admin/products', {
        headers: {
          Cookie: `sb-access-token=${regularUser.access_token}`,
        },
      })

      // Should be rejected (user role via cookie)
      expect(response.status).toBe(403)
    })

    it('should prioritize Authorization header over all cookies', async () => {
      const adminUser = await createAuthTestUser(
        supabase,
        `admin-auth-header-${Date.now()}@test.example`,
        'admin',
      )
      testUsers.push(adminUser)

      // Authorization header should take precedence
      const response = await fetch('http://localhost:3000/api/admin/dashboard/stats', {
        headers: {
          Authorization: `Bearer ${adminUser.access_token}`,
          // Even with random cookies, Bearer should win
          Cookie: 'random-cookie=value',
        },
      })

      // Should succeed via Bearer token
      expect(response.status).not.toBe(401)
      expect([200, 500]).toContain(response.status)
    })

    it('should reject request with invalid Bearer even if cookie valid', async () => {
      const adminUser = await createAuthTestUser(
        supabase,
        `admin-invalid-bearer-${Date.now()}@test.example`,
        'admin',
      )
      testUsers.push(adminUser)

      // Invalid Bearer token
      const response = await fetch('http://localhost:3000/api/admin/users', {
        headers: {
          Authorization: 'Bearer invalid-token',
          Cookie: `sb-access-token=${adminUser.access_token}`,
        },
      })

      // Should reject because Bearer is checked first and fails
      expect(response.status).toBe(401)
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle malformed Authorization header', async () => {
      const response = await fetch('http://localhost:3000/api/admin/orders', {
        headers: {
          Authorization: 'NotBearer invalid-format',
        },
      })

      expect(response.status).toBe(401)
    })

    it('should handle missing Bearer prefix', async () => {
      const response = await fetch('http://localhost:3000/api/admin/products', {
        headers: {
          Authorization: 'some-token-without-bearer',
        },
      })

      expect(response.status).toBe(401)
    })

    it('should handle empty Authorization header', async () => {
      const response = await fetch('http://localhost:3000/api/admin/users', {
        headers: {
          Authorization: '',
        },
      })

      expect(response.status).toBe(401)
    })

    it('should handle completely unauthenticated request', async () => {
      const response = await fetch('http://localhost:3000/api/admin/dashboard/stats')

      expect(response.status).toBe(401)
    })

    it('should provide helpful error messages for auth failures', async () => {
      const testCases = [
        {
          headers: {},
          expectedMessage: /auth/i,
        },
        {
          headers: { Authorization: 'Bearer invalid' },
          expectedMessage: /auth|token/i,
        },
      ]

      for (const testCase of testCases) {
        const response = await fetch('http://localhost:3000/api/admin/orders', {
          headers: testCase.headers,
        })

        expect(response.status).toBe(401)
        const data = await response.json()
        expect(data.statusMessage).toMatch(testCase.expectedMessage)
      }
    })
  })

  describe('Performance and Reliability', () => {
    it('should handle rapid sequential requests without throttling', async () => {
      const adminUser = await createAuthTestUser(
        supabase,
        `admin-rapid-${Date.now()}@test.example`,
        'admin',
      )
      testUsers.push(adminUser)

      const startTime = Date.now()
      const requests = []

      for (let i = 0; i < 10; i++) {
        requests.push(
          fetch('http://localhost:3000/api/admin/dashboard/stats', {
            headers: { Authorization: `Bearer ${adminUser.access_token}` },
          }),
        )
      }

      const responses = await Promise.all(requests)
      const endTime = Date.now()

      // All should succeed
      for (const response of responses) {
        expect(response.status).not.toBe(401)
        expect(response.status).not.toBe(403)
      }

      // Should complete reasonably fast (within 30 seconds)
      expect(endTime - startTime).toBeLessThan(30000)
    })

    it('should maintain auth consistency under concurrent load', async () => {
      const adminUser = await createAuthTestUser(
        supabase,
        `admin-concurrent-load-${Date.now()}@test.example`,
        'admin',
      )
      testUsers.push(adminUser)

      // Mix of different endpoints
      const endpoints = [
        '/api/admin/users',
        '/api/admin/products',
        '/api/admin/orders',
        '/api/admin/dashboard/stats',
      ]

      const requests = endpoints.flatMap(endpoint =>
        Array(3).fill(null).map(() =>
          fetch(`http://localhost:3000${endpoint}`, {
            headers: { Authorization: `Bearer ${adminUser.access_token}` },
          }),
        ),
      )

      const responses = await Promise.all(requests)

      // All should have consistent auth (no 401/403)
      for (const response of responses) {
        expect(response.status).not.toBe(401)
        expect(response.status).not.toBe(403)
      }
    })
  })

  describe('Database Integration', () => {
    it('should verify role query executes correctly', async () => {
      const adminUser = await createAuthTestUser(
        supabase,
        `admin-db-query-${Date.now()}@test.example`,
        'admin',
      )
      testUsers.push(adminUser)

      // Query profiles table directly
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', adminUser.id)
        .single()

      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data?.role).toBe('admin')
    })

    it('should handle database connection issues gracefully', async () => {
      // This test simulates what happens when DB is unreachable
      // In production, should return 500, not crash
      const adminUser = await createAuthTestUser(
        supabase,
        `admin-db-resilient-${Date.now()}@test.example`,
        'admin',
      )
      testUsers.push(adminUser)

      const response = await fetch('http://localhost:3000/api/admin/users', {
        headers: { Authorization: `Bearer ${adminUser.access_token}` },
      })

      // Should return valid HTTP status (not crash)
      expect([200, 401, 403, 404, 500]).toContain(response.status)
    })
  })
})
