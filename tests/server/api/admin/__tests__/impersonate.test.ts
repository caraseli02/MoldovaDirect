/**
 * Impersonation API Tests
 *
 * Tests for POST /api/admin/impersonate endpoint
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { createSupabaseClient } from '~/server/utils/supabaseAdminClient'

describe('POST /api/admin/impersonate', () => {
  let supabase: any
  let adminUser: any
  let adminToken: string
  let regularUser: any
  let regularToken: string

  beforeAll(async () => {
    supabase = createSupabaseClient()

    // Create admin user
    const { data: admin } = await supabase.auth.signUp({
      email: `test-admin-impersonate-${Date.now()}@example.test`,
      password: 'TestPassword123!'
    })
    adminUser = admin.user
    adminToken = admin.session.access_token

    await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', adminUser.id)

    // Create regular user to impersonate
    const { data: user } = await supabase.auth.signUp({
      email: `test-user-impersonate-${Date.now()}@example.test`,
      password: 'TestPassword123!'
    })
    regularUser = user.user
    regularToken = user.session.access_token

    // Give test users names
    await supabase
      .from('profiles')
      .update({ name: 'Regular User' })
      .eq('id', regularUser.id)
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
  })

  beforeEach(async () => {
    // Clear impersonation logs between tests
    await supabase
      .from('impersonation_logs')
      .delete()
      .eq('admin_id', adminUser.id)
  })

  describe('Start Impersonation', () => {
    it('should start impersonation with valid credentials', async () => {
      const response = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          action: 'start',
          userId: regularUser.id,
          reason: 'Testing impersonation functionality for unit tests',
          duration: 30
        })
      })

      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.action).toBe('start')
      expect(data.token).toBeDefined()
      expect(data.logId).toBeDefined()
      expect(data.impersonating.id).toBe(regularUser.id)
    })

    it('should reject impersonation without reason', async () => {
      const response = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          action: 'start',
          userId: regularUser.id,
          duration: 30
        })
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.statusMessage).toContain('Reason')
    })

    it('should reject impersonation with short reason', async () => {
      const response = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          action: 'start',
          userId: regularUser.id,
          reason: 'short',
          duration: 30
        })
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.statusMessage).toContain('minimum 10 characters')
    })

    it('should reject impersonation without userId', async () => {
      const response = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          action: 'start',
          reason: 'Testing without user ID for validation',
          duration: 30
        })
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.statusMessage).toContain('userId')
    })

    it('should reject impersonation of non-existent user', async () => {
      const response = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          action: 'start',
          userId: '00000000-0000-0000-0000-000000000000',
          reason: 'Testing with non-existent user ID',
          duration: 30
        })
      })

      expect(response.status).toBe(404)
    })

    it('should clamp duration to valid range', async () => {
      const response = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          action: 'start',
          userId: regularUser.id,
          reason: 'Testing duration clamping to maximum value',
          duration: 200 // Over max of 120
        })
      })

      const data = await response.json()
      expect(response.status).toBe(200)
      expect(data.duration).toBe(120) // Should be clamped to max
    })

    it('should block non-admin from impersonating', async () => {
      const response = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${regularToken}`
        },
        body: JSON.stringify({
          action: 'start',
          userId: adminUser.id,
          reason: 'Testing non-admin access control',
          duration: 30
        })
      })

      expect(response.status).toBe(403)
    })

    it('should enforce rate limiting', async () => {
      // Create 10 impersonation sessions rapidly
      const promises = []
      for (let i = 0; i < 10; i++) {
        promises.push(
          fetch('/api/admin/impersonate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({
              action: 'start',
              userId: regularUser.id,
              reason: `Rate limit test session ${i + 1}`,
              duration: 1
            })
          })
        )
      }

      await Promise.all(promises)

      // 11th attempt should be rate limited
      const response = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          action: 'start',
          userId: regularUser.id,
          reason: 'This should be rate limited',
          duration: 30
        })
      })

      expect(response.status).toBe(429)
      const data = await response.json()
      expect(data.statusMessage).toContain('Too many')
    })
  })

  describe('End Impersonation', () => {
    it('should end active impersonation session', async () => {
      // Start a session first
      const startResponse = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          action: 'start',
          userId: regularUser.id,
          reason: 'Testing session ending functionality',
          duration: 30
        })
      })

      const startData = await startResponse.json()
      const logId = startData.logId

      // End the session
      const endResponse = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          action: 'end',
          logId
        })
      })

      const endData = await endResponse.json()

      expect(endResponse.status).toBe(200)
      expect(endData.success).toBe(true)
      expect(endData.action).toBe('end')
      expect(endData.session.logId).toBe(logId)
      expect(endData.session.endedAt).toBeDefined()
    })

    it('should reject ending session without logId', async () => {
      const response = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          action: 'end'
        })
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.statusMessage).toContain('logId')
    })

    it('should reject ending non-existent session', async () => {
      const response = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          action: 'end',
          logId: 999999
        })
      })

      expect(response.status).toBe(404)
    })
  })

  describe('Invalid Action', () => {
    it('should reject invalid action', async () => {
      const response = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          action: 'invalid'
        })
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.statusMessage).toContain('Invalid action')
    })
  })
})
