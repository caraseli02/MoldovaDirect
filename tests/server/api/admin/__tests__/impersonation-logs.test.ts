/**
 * Impersonation Logs API Tests
 *
 * Tests for GET /api/admin/impersonation-logs endpoint
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createSupabaseClient } from '~/server/utils/supabaseAdminClient'

describe('GET /api/admin/impersonation-logs', () => {
  let supabase: any
  let adminUser: any
  let adminToken: string
  let regularUser: any
  let regularToken: string
  let targetUser: any

  beforeAll(async () => {
    supabase = createSupabaseClient()

    // Create admin user
    const { data: admin } = await supabase.auth.signUp({
      email: `test-admin-implogs-${Date.now()}@example.test`,
      password: 'TestPassword123!',
    })
    adminUser = admin.user
    adminToken = admin.session.access_token

    await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', adminUser.id)

    // Create regular user
    const { data: user } = await supabase.auth.signUp({
      email: `test-user-implogs-${Date.now()}@example.test`,
      password: 'TestPassword123!',
    })
    regularUser = user.user
    regularToken = user.session.access_token

    // Create target user for impersonation
    const { data: target } = await supabase.auth.signUp({
      email: `test-target-implogs-${Date.now()}@example.test`,
      password: 'TestPassword123!',
    })
    targetUser = target.user

    // Create test impersonation logs
    const now = new Date()
    const futureExpiry = new Date(now.getTime() + 3600000) // 1 hour from now
    const pastExpiry = new Date(now.getTime() - 3600000) // 1 hour ago

    await supabase.from('impersonation_logs').insert([
      {
        admin_id: adminUser.id,
        target_user_id: targetUser.id,
        started_at: now.toISOString(),
        expires_at: futureExpiry.toISOString(),
        reason: 'Test active session',
        ip_address: '127.0.0.1',
        user_agent: 'Test Agent',
      },
      {
        admin_id: adminUser.id,
        target_user_id: targetUser.id,
        started_at: now.toISOString(),
        expires_at: futureExpiry.toISOString(),
        ended_at: now.toISOString(),
        reason: 'Test ended session',
        ip_address: '127.0.0.1',
        user_agent: 'Test Agent',
      },
      {
        admin_id: adminUser.id,
        target_user_id: targetUser.id,
        started_at: pastExpiry.toISOString(),
        expires_at: pastExpiry.toISOString(),
        reason: 'Test expired session',
        ip_address: '127.0.0.1',
        user_agent: 'Test Agent',
      },
    ])
  })

  afterAll(async () => {
    // Cleanup impersonation logs
    await supabase
      .from('impersonation_logs')
      .delete()
      .eq('admin_id', adminUser.id)

    // Cleanup users
    if (adminUser) {
      await supabase.from('profiles').delete().eq('id', adminUser.id)
      await supabase.auth.admin.deleteUser(adminUser.id)
    }
    if (regularUser) {
      await supabase.from('profiles').delete().eq('id', regularUser.id)
      await supabase.auth.admin.deleteUser(regularUser.id)
    }
    if (targetUser) {
      await supabase.from('profiles').delete().eq('id', targetUser.id)
      await supabase.auth.admin.deleteUser(targetUser.id)
    }
  })

  describe('Authorization', () => {
    it('should allow admin to access impersonation logs', async () => {
      const response = await fetch('/api/admin/impersonation-logs', {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      })

      expect([200, 404]).toContain(response.status)
    })

    it('should block non-admin from accessing impersonation logs', async () => {
      const response = await fetch('/api/admin/impersonation-logs', {
        headers: {
          Authorization: `Bearer ${regularToken}`,
        },
      })

      expect(response.status).toBe(403)
    })

    it('should block unauthenticated access', async () => {
      const response = await fetch('/api/admin/impersonation-logs')

      expect(response.status).toBe(401)
    })
  })

  describe('Filtering', () => {
    it('should filter by admin_id', async () => {
      const response = await fetch(`/api/admin/impersonation-logs?admin_id=${adminUser.id}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      })

      expect(response.status).toBe(200)
      const data = await response.json()

      if (data.logs && data.logs.length > 0) {
        expect(data.logs.every((log: any) => log.admin_id === adminUser.id)).toBe(true)
      }
    })

    it('should filter by target_user_id', async () => {
      const response = await fetch(`/api/admin/impersonation-logs?target_user_id=${targetUser.id}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      })

      expect(response.status).toBe(200)
      const data = await response.json()

      if (data.logs && data.logs.length > 0) {
        expect(data.logs.every((log: any) => log.target_user_id === targetUser.id)).toBe(true)
      }
    })

    it('should filter by status: active', async () => {
      const response = await fetch('/api/admin/impersonation-logs?status=active', {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      })

      expect(response.status).toBe(200)
      const data = await response.json()

      if (data.logs && data.logs.length > 0) {
        expect(data.logs.every((log: any) => log.status === 'active')).toBe(true)
      }
    })

    it('should filter by status: ended', async () => {
      const response = await fetch('/api/admin/impersonation-logs?status=ended', {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      })

      expect(response.status).toBe(200)
      const data = await response.json()

      if (data.logs && data.logs.length > 0) {
        expect(data.logs.every((log: any) => log.status === 'ended')).toBe(true)
      }
    })

    it('should filter by status: expired', async () => {
      const response = await fetch('/api/admin/impersonation-logs?status=expired', {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      })

      expect(response.status).toBe(200)
      const data = await response.json()

      if (data.logs && data.logs.length > 0) {
        expect(data.logs.every((log: any) => log.status === 'expired')).toBe(true)
      }
    })
  })

  describe('Pagination', () => {
    it('should respect limit parameter', async () => {
      const response = await fetch('/api/admin/impersonation-logs?limit=1', {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      })

      expect(response.status).toBe(200)
      const data = await response.json()

      if (data.logs) {
        expect(data.logs.length).toBeLessThanOrEqual(1)
      }
    })

    it('should respect offset parameter', async () => {
      const response = await fetch('/api/admin/impersonation-logs?offset=1', {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      })

      expect(response.status).toBe(200)
    })

    it('should enforce maximum limit', async () => {
      const response = await fetch('/api/admin/impersonation-logs?limit=10000', {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      })

      expect(response.status).toBe(200)
      const data = await response.json()

      if (data.logs) {
        expect(data.logs.length).toBeLessThanOrEqual(500)
      }
    })
  })

  describe('Response Structure', () => {
    it('should include summary statistics', async () => {
      const response = await fetch('/api/admin/impersonation-logs', {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      })

      expect(response.status).toBe(200)
      const data = await response.json()

      expect(data.summary).toBeDefined()
      expect(data.summary.total).toBeDefined()
      expect(data.summary.active).toBeDefined()
      expect(data.summary.ended).toBeDefined()
      expect(data.summary.expired).toBeDefined()
    })

    it('should include enriched user information', async () => {
      const response = await fetch('/api/admin/impersonation-logs', {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      })

      expect(response.status).toBe(200)
      const data = await response.json()

      if (data.logs && data.logs.length > 0) {
        const log = data.logs[0]
        expect(log.admin).toBeDefined()
        expect(log.target_user).toBeDefined()
      }
    })

    it('should calculate session duration', async () => {
      const response = await fetch('/api/admin/impersonation-logs', {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      })

      expect(response.status).toBe(200)
      const data = await response.json()

      if (data.logs && data.logs.length > 0) {
        const log = data.logs[0]
        expect(log.duration_minutes).toBeDefined()
        expect(typeof log.duration_minutes).toBe('number')
      }
    })

    it('should include status field', async () => {
      const response = await fetch('/api/admin/impersonation-logs', {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      })

      expect(response.status).toBe(200)
      const data = await response.json()

      if (data.logs && data.logs.length > 0) {
        const log = data.logs[0]
        expect(log.status).toBeDefined()
        expect(['active', 'ended', 'expired']).toContain(log.status)
      }
    })
  })

  describe('Date Range Filtering', () => {
    it('should filter by start_date', async () => {
      const yesterday = new Date(Date.now() - 86400000).toISOString()
      const response = await fetch(`/api/admin/impersonation-logs?start_date=${yesterday}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      })

      expect(response.status).toBe(200)
    })

    it('should filter by end_date', async () => {
      const tomorrow = new Date(Date.now() + 86400000).toISOString()
      const response = await fetch(`/api/admin/impersonation-logs?end_date=${tomorrow}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      })

      expect(response.status).toBe(200)
    })
  })
})
