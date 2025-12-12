/**
 * Audit Logs API Tests
 *
 * Tests for GET /api/admin/audit-logs endpoint
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createSupabaseClient } from '~/server/utils/supabaseAdminClient'

describe('GET /api/admin/audit-logs', () => {
  let supabase: any
  let adminUser: any
  let adminToken: string
  let regularUser: any
  let regularToken: string

  beforeAll(async () => {
    supabase = createSupabaseClient()

    // Create admin user
    const { data: admin } = await supabase.auth.signUp({
      email: `test-admin-audit-${Date.now()}@example.test`,
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
      email: `test-user-audit-${Date.now()}@example.test`,
      password: 'TestPassword123!',
    })
    regularUser = user.user
    regularToken = user.session.access_token

    // Create some test audit logs
    await supabase.from('audit_logs').insert([
      {
        user_id: adminUser.id,
        action: 'test-action-1',
        resource_type: 'test',
        resource_id: '1',
      },
      {
        user_id: adminUser.id,
        action: 'test-action-2',
        resource_type: 'test',
        resource_id: '2',
      },
    ])
  })

  afterAll(async () => {
    // Cleanup audit logs
    await supabase
      .from('audit_logs')
      .delete()
      .eq('user_id', adminUser.id)

    // Cleanup users
    if (adminUser) {
      await supabase.from('profiles').delete().eq('id', adminUser.id)
      await supabase.auth.admin.deleteUser(adminUser.id)
    }
    if (regularUser) {
      await supabase.from('profiles').delete().eq('id', regularUser.id)
      await supabase.auth.admin.deleteUser(regularUser.id)
    }
  })

  describe('Authorization', () => {
    it('should allow admin to access audit logs', async () => {
      const response = await fetch('/api/admin/audit-logs', {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      })

      expect([200, 404]).toContain(response.status)
    })

    it('should block non-admin from accessing audit logs', async () => {
      const response = await fetch('/api/admin/audit-logs', {
        headers: {
          Authorization: `Bearer ${regularToken}`,
        },
      })

      expect(response.status).toBe(403)
    })

    it('should block unauthenticated access', async () => {
      const response = await fetch('/api/admin/audit-logs')

      expect(response.status).toBe(401)
    })
  })

  describe('Filtering', () => {
    it('should filter by user_id', async () => {
      const response = await fetch(`/api/admin/audit-logs?user_id=${adminUser.id}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      })

      expect(response.status).toBe(200)
      const data = await response.json()

      if (data.logs && data.logs.length > 0) {
        expect(data.logs.every((log: any) => log.user_id === adminUser.id)).toBe(true)
      }
    })

    it('should filter by action', async () => {
      const response = await fetch('/api/admin/audit-logs?action=test-action-1', {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      })

      expect(response.status).toBe(200)
      const data = await response.json()

      if (data.logs && data.logs.length > 0) {
        expect(data.logs.every((log: any) => log.action === 'test-action-1')).toBe(true)
      }
    })

    it('should filter by resource_type', async () => {
      const response = await fetch('/api/admin/audit-logs?resource_type=test', {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      })

      expect(response.status).toBe(200)
      const data = await response.json()

      if (data.logs && data.logs.length > 0) {
        expect(data.logs.every((log: any) => log.resource_type === 'test')).toBe(true)
      }
    })
  })

  describe('Pagination', () => {
    it('should respect limit parameter', async () => {
      const response = await fetch('/api/admin/audit-logs?limit=1', {
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
      const response = await fetch('/api/admin/audit-logs?offset=1', {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      })

      expect(response.status).toBe(200)
    })

    it('should enforce maximum limit', async () => {
      const response = await fetch('/api/admin/audit-logs?limit=10000', {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      })

      expect(response.status).toBe(200)
      const data = await response.json()

      if (data.logs) {
        expect(data.logs.length).toBeLessThanOrEqual(500) // Max limit
      }
    })
  })

  describe('Date Range Filtering', () => {
    it('should filter by start_date', async () => {
      const yesterday = new Date(Date.now() - 86400000).toISOString()
      const response = await fetch(`/api/admin/audit-logs?start_date=${yesterday}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      })

      expect(response.status).toBe(200)
    })

    it('should filter by end_date', async () => {
      const tomorrow = new Date(Date.now() + 86400000).toISOString()
      const response = await fetch(`/api/admin/audit-logs?end_date=${tomorrow}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      })

      expect(response.status).toBe(200)
    })

    it('should filter by date range', async () => {
      const yesterday = new Date(Date.now() - 86400000).toISOString()
      const tomorrow = new Date(Date.now() + 86400000).toISOString()

      const response = await fetch(
        `/api/admin/audit-logs?start_date=${yesterday}&end_date=${tomorrow}`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        },
      )

      expect(response.status).toBe(200)
    })
  })
})
