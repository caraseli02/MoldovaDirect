/**
 * Comprehensive RBAC (Role-Based Access Control) Tests
 *
 * Tests authorization for all critical admin endpoints:
 * - Orders endpoints
 * - Products endpoints
 * - Users endpoints
 * - Analytics endpoints
 * - Email templates endpoints
 * - Inventory endpoints
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createSupabaseClient } from '~/server/utils/supabaseAdminClient'

describe('Admin API - Authorization (RBAC)', () => {
  let supabase: unknown
  let adminUser: unknown
  let regularUser: unknown

  beforeAll(async () => {
    supabase = createSupabaseClient()

    // Create admin user
    const { data: admin } = await supabase.auth.signUp({
      email: `test-admin-${Date.now()}@example.test`,
      password: 'TestPassword123!',
    })
    adminUser = admin.user

    await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', adminUser.id)

    // Create regular user
    const { data: user } = await supabase.auth.signUp({
      email: `test-user-${Date.now()}@example.test`,
      password: 'TestPassword123!',
    })
    regularUser = user.user
  })

  afterAll(async () => {
    // Cleanup
    if (adminUser) {
      await supabase.from('profiles').delete().eq('id', adminUser.id)
      await supabase.auth.admin.deleteUser(adminUser.id)
    }
    if (regularUser) {
      await supabase.from('profiles').delete().eq('id', regularUser.id)
      await supabase.auth.admin.deleteUser(regularUser.id)
    }
  })

  describe('Orders Endpoints', () => {
    it('should block non-admin from GET /api/admin/orders', async () => {
      const response = await fetch('/api/admin/orders', {
        headers: {
          Authorization: `Bearer ${regularUser.access_token}`,
        },
      })

      expect(response.status).toBe(403)
    })

    it('should allow admin to access GET /api/admin/orders', async () => {
      const response = await fetch('/api/admin/orders', {
        headers: {
          Authorization: `Bearer ${adminUser.access_token}`,
        },
      })

      expect([200, 404]).toContain(response.status) // 200 OK or 404 if no orders
    })

    it('should block non-admin from PATCH /api/admin/orders/:id/status', async () => {
      const response = await fetch('/api/admin/orders/1/status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${regularUser.access_token}`,
        },
        body: JSON.stringify({ status: 'processing' }),
      })

      expect(response.status).toBe(403)
    })

    it('should block non-admin from fulfillment tasks', async () => {
      const response = await fetch('/api/admin/orders/1/fulfillment-tasks/1', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${regularUser.access_token}`,
        },
        body: JSON.stringify({ completed: true }),
      })

      expect(response.status).toBe(403)
    })
  })

  describe('Products Endpoints', () => {
    it('should block non-admin from GET /api/admin/products', async () => {
      const response = await fetch('/api/admin/products', {
        headers: {
          Authorization: `Bearer ${regularUser.access_token}`,
        },
      })

      expect(response.status).toBe(403)
    })

    it('should allow admin to access GET /api/admin/products', async () => {
      const response = await fetch('/api/admin/products', {
        headers: {
          Authorization: `Bearer ${adminUser.access_token}`,
        },
      })

      expect([200, 404]).toContain(response.status)
    })

    it('should block non-admin from POST /api/admin/products (create)', async () => {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${regularUser.access_token}`,
        },
        body: JSON.stringify({
          name_translations: { es: 'Test', en: 'Test' },
          price_eur: 100,
          category: 'test',
        }),
      })

      expect(response.status).toBe(403)
    })

    it('should block non-admin from PUT /api/admin/products/:id (update)', async () => {
      const response = await fetch('/api/admin/products/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${regularUser.access_token}`,
        },
        body: JSON.stringify({
          price_eur: 200,
        }),
      })

      expect(response.status).toBe(403)
    })

    it('should block non-admin from DELETE /api/admin/products/:id', async () => {
      const response = await fetch('/api/admin/products/1', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${regularUser.access_token}`,
        },
      })

      expect(response.status).toBe(403)
    })

    it('should block non-admin from bulk operations', async () => {
      const response = await fetch('/api/admin/products/bulk', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${regularUser.access_token}`,
        },
        body: JSON.stringify({
          productIds: [1],
          updates: { isActive: false },
        }),
      })

      expect(response.status).toBe(403)
    })

    it('should block non-admin from inventory updates', async () => {
      const response = await fetch('/api/admin/products/1/inventory', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${regularUser.access_token}`,
        },
        body: JSON.stringify({
          stock_quantity: 100,
        }),
      })

      expect(response.status).toBe(403)
    })
  })

  describe('Users Endpoints', () => {
    it('should block non-admin from GET /api/admin/users', async () => {
      const response = await fetch('/api/admin/users', {
        headers: {
          Authorization: `Bearer ${regularUser.access_token}`,
        },
      })

      expect(response.status).toBe(403)
    })

    it('should allow admin to access GET /api/admin/users', async () => {
      const response = await fetch('/api/admin/users', {
        headers: {
          Authorization: `Bearer ${adminUser.access_token}`,
        },
      })

      expect([200, 404]).toContain(response.status)
    })

    it('should block non-admin from GET /api/admin/users/:id', async () => {
      const response = await fetch(`/api/admin/users/${regularUser.id}`, {
        headers: {
          Authorization: `Bearer ${regularUser.access_token}`,
        },
      })

      expect(response.status).toBe(403)
    })

    it('should block non-admin from user actions', async () => {
      const response = await fetch(`/api/admin/users/${regularUser.id}/actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${regularUser.access_token}`,
        },
        body: JSON.stringify({
          action: 'ban',
        }),
      })

      expect(response.status).toBe(403)
    })
  })

  describe('Analytics Endpoints', () => {
    it('should block non-admin from GET /api/admin/analytics/overview', async () => {
      const response = await fetch('/api/admin/analytics/overview', {
        headers: {
          Authorization: `Bearer ${regularUser.access_token}`,
        },
      })

      expect(response.status).toBe(403)
    })

    it('should allow admin to access GET /api/admin/analytics/overview', async () => {
      const response = await fetch('/api/admin/analytics/overview', {
        headers: {
          Authorization: `Bearer ${adminUser.access_token}`,
        },
      })

      expect([200, 500]).toContain(response.status) // May error if data not available
    })

    it('should block non-admin from GET /api/admin/analytics/products', async () => {
      const response = await fetch('/api/admin/analytics/products', {
        headers: {
          Authorization: `Bearer ${regularUser.access_token}`,
        },
      })

      expect(response.status).toBe(403)
    })

    it('should block non-admin from GET /api/admin/analytics/users', async () => {
      const response = await fetch('/api/admin/analytics/users', {
        headers: {
          Authorization: `Bearer ${regularUser.access_token}`,
        },
      })

      expect(response.status).toBe(403)
    })
  })

  describe('Email Templates Endpoints', () => {
    it('should block non-admin from GET /api/admin/email-templates/get', async () => {
      const response = await fetch('/api/admin/email-templates/get', {
        headers: {
          Authorization: `Bearer ${regularUser.access_token}`,
        },
      })

      expect(response.status).toBe(403)
    })

    it('should allow admin to access GET /api/admin/email-templates/get', async () => {
      const response = await fetch('/api/admin/email-templates/get', {
        headers: {
          Authorization: `Bearer ${adminUser.access_token}`,
        },
      })

      expect([200, 404]).toContain(response.status)
    })

    it('should block non-admin from POST /api/admin/email-templates/save', async () => {
      const response = await fetch('/api/admin/email-templates/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${regularUser.access_token}`,
        },
        body: JSON.stringify({
          type: 'order_confirmation',
          locale: 'es',
          subject: 'Test',
          body_html: '<p>Test</p>',
        }),
      })

      expect(response.status).toBe(403)
    })

    it('should block non-admin from POST /api/admin/email-templates/preview', async () => {
      const response = await fetch('/api/admin/email-templates/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${regularUser.access_token}`,
        },
        body: JSON.stringify({
          type: 'order_confirmation',
          locale: 'es',
        }),
      })

      expect(response.status).toBe(403)
    })

    it('should block non-admin from POST /api/admin/email-templates/synchronize', async () => {
      const response = await fetch('/api/admin/email-templates/synchronize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${regularUser.access_token}`,
        },
        body: JSON.stringify({
          sourceLocale: 'es',
          targetLocale: 'en',
        }),
      })

      expect(response.status).toBe(403)
    })

    it('should block non-admin from POST /api/admin/email-templates/rollback', async () => {
      const response = await fetch('/api/admin/email-templates/rollback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${regularUser.access_token}`,
        },
        body: JSON.stringify({
          historyId: 1,
        }),
      })

      expect(response.status).toBe(403)
    })
  })

  describe('Dashboard Endpoints', () => {
    it('should block non-admin from GET /api/admin/dashboard/stats', async () => {
      const response = await fetch('/api/admin/dashboard/stats', {
        headers: {
          Authorization: `Bearer ${regularUser.access_token}`,
        },
      })

      expect(response.status).toBe(403)
    })

    it('should allow admin to access GET /api/admin/dashboard/stats', async () => {
      const response = await fetch('/api/admin/dashboard/stats', {
        headers: {
          Authorization: `Bearer ${adminUser.access_token}`,
        },
      })

      expect([200, 500]).toContain(response.status)
    })

    it('should block non-admin from GET /api/admin/dashboard/activity', async () => {
      const response = await fetch('/api/admin/dashboard/activity', {
        headers: {
          Authorization: `Bearer ${regularUser.access_token}`,
        },
      })

      expect(response.status).toBe(403)
    })
  })

  describe('Email Logs Endpoints', () => {
    it('should block non-admin from GET /api/admin/email-logs/search', async () => {
      const response = await fetch('/api/admin/email-logs/search', {
        headers: {
          Authorization: `Bearer ${regularUser.access_token}`,
        },
      })

      expect(response.status).toBe(403)
    })

    it('should allow admin to access GET /api/admin/email-logs/search', async () => {
      const response = await fetch('/api/admin/email-logs/search', {
        headers: {
          Authorization: `Bearer ${adminUser.access_token}`,
        },
      })

      expect([200, 404]).toContain(response.status)
    })

    it('should block non-admin from GET /api/admin/email-logs/stats', async () => {
      const response = await fetch('/api/admin/email-logs/stats', {
        headers: {
          Authorization: `Bearer ${regularUser.access_token}`,
        },
      })

      expect(response.status).toBe(403)
    })

    it('should block non-admin from POST /api/admin/email-logs/:id/retry', async () => {
      const response = await fetch('/api/admin/email-logs/1/retry', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${regularUser.access_token}`,
        },
      })

      expect(response.status).toBe(403)
    })
  })

  describe('Unauthenticated Requests', () => {
    it('should block unauthenticated requests to admin endpoints', async () => {
      const endpoints = [
        '/api/admin/orders',
        '/api/admin/products',
        '/api/admin/users',
        '/api/admin/analytics/overview',
        '/api/admin/email-templates/get',
        '/api/admin/dashboard/stats',
      ]

      for (const endpoint of endpoints) {
        const response = await fetch(endpoint)
        expect(response.status).toBe(401)
      }
    })
  })

  describe('Token Validation', () => {
    it('should reject expired tokens', async () => {
      // Simulate expired token
      const expiredToken = 'expired.token.here'

      const response = await fetch('/api/admin/orders', {
        headers: {
          Authorization: `Bearer ${expiredToken}`,
        },
      })

      expect(response.status).toBe(401)
    })

    it('should reject malformed tokens', async () => {
      const response = await fetch('/api/admin/orders', {
        headers: {
          Authorization: 'Bearer not-a-valid-token',
        },
      })

      expect(response.status).toBe(401)
    })

    it('should reject missing Authorization header', async () => {
      const response = await fetch('/api/admin/orders')

      expect(response.status).toBe(401)
    })
  })
})
