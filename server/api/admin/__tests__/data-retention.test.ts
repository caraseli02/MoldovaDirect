/**
 * Data Retention API Tests
 *
 * Tests for GDPR-compliant data retention policy endpoints
 * POST /api/admin/data-retention
 * GET /api/admin/data-retention
 *
 * GitHub Issue: #90
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createSupabaseClient } from '~/server/utils/supabaseAdminClient'

describe('Data Retention API', () => {
  let supabase: any
  let adminUser: any
  let adminToken: string
  let regularUser: any
  let regularToken: string

  // Test data IDs for cleanup
  const testDataIds = {
    emailLogs: [] as number[],
    activityLogs: [] as number[],
    auditLogs: [] as number[],
    impersonationLogs: [] as number[]
  }

  beforeAll(async () => {
    supabase = createSupabaseClient()

    // Create admin user
    const { data: admin } = await supabase.auth.signUp({
      email: `test-admin-retention-${Date.now()}@example.test`,
      password: 'TestPassword123!'
    })
    adminUser = admin.user
    adminToken = admin.session.access_token

    await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', adminUser.id)

    // Create regular user
    const { data: user } = await supabase.auth.signUp({
      email: `test-user-retention-${Date.now()}@example.test`,
      password: 'TestPassword123!'
    })
    regularUser = user.user
    regularToken = user.session.access_token

    // Create test data older than retention periods
    const oldDate = new Date()
    oldDate.setDate(oldDate.getDate() - 400) // 400 days ago (older than all policies)

    // Create old email logs
    const { data: emailLog } = await supabase
      .from('email_logs')
      .insert({
        email_type: 'order_confirmation',
        recipient_email: 'test-old@example.com',
        subject: 'Test Email',
        status: 'sent',
        created_at: oldDate.toISOString()
      })
      .select('id')
      .single()

    if (emailLog) testDataIds.emailLogs.push(emailLog.id)

    // Create old activity logs
    const { data: activityLog } = await supabase
      .from('user_activity_logs')
      .insert({
        user_id: regularUser.id,
        activity_type: 'login',
        created_at: oldDate.toISOString()
      })
      .select('id')
      .single()

    if (activityLog) testDataIds.activityLogs.push(activityLog.id)

    // Create old audit logs
    const { data: auditLog } = await supabase
      .from('audit_logs')
      .insert({
        user_id: adminUser.id,
        action: 'test-old-action',
        resource_type: 'test',
        created_at: oldDate.toISOString()
      })
      .select('id')
      .single()

    if (auditLog) testDataIds.auditLogs.push(auditLog.id)

    // Create old impersonation logs
    const expiryDate = new Date(oldDate)
    expiryDate.setHours(expiryDate.getHours() + 1)

    const { data: impersonationLog } = await supabase
      .from('impersonation_logs')
      .insert({
        admin_id: adminUser.id,
        target_user_id: regularUser.id,
        started_at: oldDate.toISOString(),
        expires_at: expiryDate.toISOString(),
        ended_at: expiryDate.toISOString(),
        reason: 'Test old impersonation',
        created_at: oldDate.toISOString()
      })
      .select('id')
      .single()

    if (impersonationLog) testDataIds.impersonationLogs.push(impersonationLog.id)
  })

  afterAll(async () => {
    // Cleanup test data (if not already deleted by tests)
    if (testDataIds.emailLogs.length > 0) {
      await supabase
        .from('email_logs')
        .delete()
        .in('id', testDataIds.emailLogs)
    }

    if (testDataIds.activityLogs.length > 0) {
      await supabase
        .from('user_activity_logs')
        .delete()
        .in('id', testDataIds.activityLogs)
    }

    if (testDataIds.auditLogs.length > 0) {
      await supabase
        .from('audit_logs')
        .delete()
        .in('id', testDataIds.auditLogs)
    }

    if (testDataIds.impersonationLogs.length > 0) {
      await supabase
        .from('impersonation_logs')
        .delete()
        .in('id', testDataIds.impersonationLogs)
    }

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

  describe('GET /api/admin/data-retention', () => {
    describe('Authorization', () => {
      it('should allow admin to access retention status', async () => {
        const response = await fetch('/api/admin/data-retention', {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        })

        expect(response.status).toBe(200)
        const data = await response.json()

        expect(data.success).toBe(true)
        expect(data.policies).toBeDefined()
        expect(data.summary).toBeDefined()
        expect(Array.isArray(data.policies)).toBe(true)
      })

      it('should block non-admin from accessing retention status', async () => {
        const response = await fetch('/api/admin/data-retention', {
          headers: {
            'Authorization': `Bearer ${regularToken}`
          }
        })

        expect(response.status).toBe(403)
      })

      it('should block unauthenticated access', async () => {
        const response = await fetch('/api/admin/data-retention')

        expect(response.status).toBe(401)
      })
    })

    describe('Status Information', () => {
      it('should return all configured retention policies', async () => {
        const response = await fetch('/api/admin/data-retention', {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        })

        expect(response.status).toBe(200)
        const data = await response.json()

        expect(data.policies.length).toBeGreaterThanOrEqual(4)

        const tableNames = data.policies.map((p: any) => p.table_name)
        expect(tableNames).toContain('email_logs')
        expect(tableNames).toContain('user_activity_logs')
        expect(tableNames).toContain('audit_logs')
        expect(tableNames).toContain('impersonation_logs')
      })

      it('should include retention days for each policy', async () => {
        const response = await fetch('/api/admin/data-retention', {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        })

        const data = await response.json()

        for (const policy of data.policies) {
          expect(policy.retention_days).toBeDefined()
          expect(policy.retention_days).toBeGreaterThan(0)
        }
      })

      it('should include record counts', async () => {
        const response = await fetch('/api/admin/data-retention', {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        })

        const data = await response.json()

        for (const policy of data.policies) {
          expect(policy.total_records).toBeDefined()
          expect(policy.records_to_delete).toBeDefined()
          expect(typeof policy.total_records).toBe('number')
          expect(typeof policy.records_to_delete).toBe('number')
        }
      })
    })
  })

  describe('POST /api/admin/data-retention', () => {
    describe('Authorization', () => {
      it('should allow admin to trigger cleanup', async () => {
        const response = await fetch('/api/admin/data-retention', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'get-status',
            confirm: true
          })
        })

        expect(response.status).toBe(200)
      })

      it('should block non-admin from triggering cleanup', async () => {
        const response = await fetch('/api/admin/data-retention', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${regularToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'get-status',
            confirm: true
          })
        })

        expect(response.status).toBe(403)
      })

      it('should block unauthenticated access', async () => {
        const response = await fetch('/api/admin/data-retention', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'get-status'
          })
        })

        expect(response.status).toBe(401)
      })
    })

    describe('Safety Checks', () => {
      it('should require confirmation for cleanup operations', async () => {
        const response = await fetch('/api/admin/data-retention', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'cleanup-all'
            // No confirm: true
          })
        })

        expect(response.status).toBe(200)
        const data = await response.json()

        expect(data.success).toBe(false)
        expect(data.message).toContain('Confirmation required')
      })

      it('should allow dry run without confirmation', async () => {
        const response = await fetch('/api/admin/data-retention', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'cleanup-all',
            dryRun: true
          })
        })

        expect(response.status).toBe(200)
        const data = await response.json()

        expect(data.success).toBe(true)
        expect(data.results.dryRun).toBe(true)
      })
    })

    describe('Dry Run Mode', () => {
      it('should preview what would be deleted without deleting', async () => {
        // First get the status
        const statusBefore = await fetch('/api/admin/data-retention', {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        })
        const beforeData = await statusBefore.json()

        // Run dry run
        const response = await fetch('/api/admin/data-retention', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'cleanup-all',
            dryRun: true
          })
        })

        expect(response.status).toBe(200)
        const data = await response.json()

        expect(data.success).toBe(true)
        expect(data.results.dryRun).toBe(true)
        expect(data.results.deletedCounts).toBeDefined()

        // Verify nothing was actually deleted
        const statusAfter = await fetch('/api/admin/data-retention', {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        })
        const afterData = await statusAfter.json()

        // Record counts should be the same
        expect(beforeData.summary.total_records).toBe(afterData.summary.total_records)
      })
    })

    describe('Individual Table Cleanup', () => {
      it('should cleanup only email logs', async () => {
        const response = await fetch('/api/admin/data-retention', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'cleanup-email-logs',
            dryRun: true
          })
        })

        expect(response.status).toBe(200)
        const data = await response.json()

        expect(data.success).toBe(true)
        expect(data.results.deletedCounts).toHaveProperty('email_logs')
      })

      it('should cleanup only activity logs', async () => {
        const response = await fetch('/api/admin/data-retention', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'cleanup-activity-logs',
            dryRun: true
          })
        })

        expect(response.status).toBe(200)
        const data = await response.json()

        expect(data.success).toBe(true)
        expect(data.results.deletedCounts).toHaveProperty('user_activity_logs')
      })

      it('should cleanup only audit logs', async () => {
        const response = await fetch('/api/admin/data-retention', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'cleanup-audit-logs',
            dryRun: true
          })
        })

        expect(response.status).toBe(200)
        const data = await response.json()

        expect(data.success).toBe(true)
        expect(data.results.deletedCounts).toHaveProperty('audit_logs')
      })

      it('should cleanup only impersonation logs', async () => {
        const response = await fetch('/api/admin/data-retention', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'cleanup-impersonation-logs',
            dryRun: true
          })
        })

        expect(response.status).toBe(200)
        const data = await response.json()

        expect(data.success).toBe(true)
        expect(data.results.deletedCounts).toHaveProperty('impersonation_logs')
      })
    })

    describe('Cleanup All Tables', () => {
      it('should cleanup all tables at once (dry run)', async () => {
        const response = await fetch('/api/admin/data-retention', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'cleanup-all',
            dryRun: true
          })
        })

        expect(response.status).toBe(200)
        const data = await response.json()

        expect(data.success).toBe(true)
        expect(data.results.deletedCounts).toBeDefined()
        expect(data.results.details).toBeDefined()
        expect(Array.isArray(data.results.details)).toBe(true)

        // Should have entries for all tables
        const tableNames = data.results.details.map((d: any) => d.table_name)
        expect(tableNames).toContain('email_logs')
        expect(tableNames).toContain('user_activity_logs')
        expect(tableNames).toContain('audit_logs')
        expect(tableNames).toContain('impersonation_logs')
      })

      it('should report execution time for each table', async () => {
        const response = await fetch('/api/admin/data-retention', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'cleanup-all',
            dryRun: true
          })
        })

        const data = await response.json()

        for (const detail of data.results.details) {
          expect(detail.execution_time_ms).toBeDefined()
          expect(typeof detail.execution_time_ms).toBe('number')
        }
      })
    })

    describe('Invalid Actions', () => {
      it('should reject invalid action', async () => {
        const response = await fetch('/api/admin/data-retention', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'invalid-action',
            confirm: true
          })
        })

        expect(response.status).toBe(200)
        const data = await response.json()

        expect(data.success).toBe(false)
        expect(data.validActions).toBeDefined()
        expect(Array.isArray(data.validActions)).toBe(true)
      })
    })

    describe('Get Status Action', () => {
      it('should get status without requiring confirmation', async () => {
        const response = await fetch('/api/admin/data-retention', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'get-status'
            // No confirm needed for status
          })
        })

        expect(response.status).toBe(200)
        const data = await response.json()

        expect(data.success).toBe(true)
        expect(data.status).toBeDefined()
        expect(Array.isArray(data.status)).toBe(true)
      })
    })
  })

  describe('GDPR Compliance', () => {
    it('should have retention policies configured for all PII tables', async () => {
      const response = await fetch('/api/admin/data-retention', {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      })

      const data = await response.json()
      const tableNames = data.policies.map((p: any) => p.table_name)

      // All PII-containing tables should have policies
      expect(tableNames).toContain('email_logs')
      expect(tableNames).toContain('user_activity_logs')
      expect(tableNames).toContain('audit_logs')
      expect(tableNames).toContain('impersonation_logs')
    })

    it('should have reasonable retention periods', async () => {
      const response = await fetch('/api/admin/data-retention', {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      })

      const data = await response.json()

      for (const policy of data.policies) {
        // Retention periods should be between 30 days and 5 years
        expect(policy.retention_days).toBeGreaterThanOrEqual(30)
        expect(policy.retention_days).toBeLessThanOrEqual(1825) // 5 years
      }
    })

    it('should track last cleanup timestamp', async () => {
      const response = await fetch('/api/admin/data-retention', {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      })

      const data = await response.json()

      for (const policy of data.policies) {
        // last_cleanup_at can be null if never run
        if (policy.last_cleanup_at) {
          expect(typeof policy.last_cleanup_at).toBe('string')
          expect(new Date(policy.last_cleanup_at).toString()).not.toBe('Invalid Date')
        }
      }
    })
  })
})
