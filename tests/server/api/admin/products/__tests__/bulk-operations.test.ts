/**
 * Tests for Bulk Product Operations API
 *
 * Tests for:
 * - Partial failure handling
 * - Transaction rollback
 * - Error reporting
 * - Audit logging
 * - Authorization
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createSupabaseClient } from '~/server/utils/supabaseAdminClient'

describe('Bulk Product Operations - Error Handling', () => {
  let supabase: any
  let testAdmin: any
  let testProducts: any[]

  beforeEach(async () => {
    supabase = createSupabaseClient()

    // Create test admin user
    const { data: admin } = await supabase.auth.signUp({
      email: `test-admin-${Date.now()}@example.test`,
      password: 'TestPassword123!',
    })
    testAdmin = admin.user

    await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', testAdmin.id)

    // Create test products
    const { data: products } = await supabase
      .from('products')
      .insert([
        {
          name_translations: { es: 'Product 1', en: 'Product 1' },
          stock_quantity: 10,
          price_eur: 100,
          category: 'test',
          is_active: true,
        },
        {
          name_translations: { es: 'Product 2', en: 'Product 2' },
          stock_quantity: 20,
          price_eur: 200,
          category: 'test',
          is_active: true,
        },
        {
          name_translations: { es: 'Product 3', en: 'Product 3' },
          stock_quantity: 30,
          price_eur: 300,
          category: 'test',
          is_active: true,
        },
      ])
      .select()

    testProducts = products
  })

  afterEach(async () => {
    // Cleanup
    if (testProducts && testProducts.length > 0) {
      const productIds = testProducts.map(p => p.id)
      await supabase.from('inventory_movements').delete().in('product_id', productIds)
      await supabase.from('audit_logs').delete().in('resource_id', productIds.map(String))
      await supabase.from('products').delete().in('id', productIds)
    }
    if (testAdmin) {
      await supabase.from('profiles').delete().eq('id', testAdmin.id)
      await supabase.auth.admin.deleteUser(testAdmin.id)
    }
  })

  it('should handle partial failures when some products are not found', async () => {
    // TEST: Mixed valid and invalid product IDs

    const validIds = [testProducts[0].id, testProducts[1].id]
    const invalidIds = [999999, 888888]
    const allIds = [...validIds, ...invalidIds]

    const response = await fetch('/api/admin/products/bulk', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testAdmin.access_token}`,
      },
      body: JSON.stringify({
        productIds: allIds,
        updates: {
          isActive: false,
        },
      }),
    })

    expect(response.status).toBe(200)

    const result = await response.json()

    // Should report which products were updated and which weren't found
    expect(result.data.updatedCount).toBe(2)
    expect(result.data.updatedIds).toEqual(expect.arrayContaining(validIds))
    expect(result.data.notFoundIds).toEqual(expect.arrayContaining(invalidIds))

    // Verify only valid products were updated
    const { data: updatedProducts } = await supabase
      .from('products')
      .select('is_active')
      .in('id', validIds)

    expect(updatedProducts.every((p: any) => p.is_active === false)).toBe(true)
  })

  it('should return error when no products found', async () => {
    // TEST: All invalid IDs should return 404

    const response = await fetch('/api/admin/products/bulk', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testAdmin.access_token}`,
      },
      body: JSON.stringify({
        productIds: [999999, 888888],
        updates: {
          isActive: false,
        },
      }),
    })

    expect(response.status).toBe(404)

    const result = await response.json()
    expect(result.statusMessage).toContain('No products found')
  })

  it('should validate input and reject invalid data', async () => {
    // TEST: Input validation

    // Empty product IDs array
    const response1 = await fetch('/api/admin/products/bulk', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testAdmin.access_token}`,
      },
      body: JSON.stringify({
        productIds: [],
        updates: { isActive: false },
      }),
    })

    expect(response1.status).toBe(400)

    // No updates provided
    const response2 = await fetch('/api/admin/products/bulk', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testAdmin.access_token}`,
      },
      body: JSON.stringify({
        productIds: [testProducts[0].id],
        updates: {},
      }),
    })

    expect(response2.status).toBe(400)

    // Invalid price (negative)
    const response3 = await fetch('/api/admin/products/bulk', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testAdmin.access_token}`,
      },
      body: JSON.stringify({
        productIds: [testProducts[0].id],
        updates: { price: -100 },
      }),
    })

    expect(response3.status).toBe(400)

    // Invalid stock quantity (negative)
    const response4 = await fetch('/api/admin/products/bulk', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testAdmin.access_token}`,
      },
      body: JSON.stringify({
        productIds: [testProducts[0].id],
        updates: { stockQuantity: -10 },
      }),
    })

    expect(response4.status).toBe(400)
  })

  it('should create audit logs for all updated products', async () => {
    // TEST: Audit trail creation

    const productIds = testProducts.map(p => p.id)

    await fetch('/api/admin/products/bulk', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testAdmin.access_token}`,
      },
      body: JSON.stringify({
        productIds,
        updates: {
          isActive: false,
        },
      }),
    })

    await new Promise(resolve => setTimeout(resolve, 500))

    // Verify audit logs were created
    const { data: auditLogs } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('action', 'product_bulk_update')
      .in('resource_id', productIds.map(String))

    expect(auditLogs).toHaveLength(3)

    auditLogs.forEach((log: any) => {
      expect(log.resource_type).toBe('product')
      expect(log.old_values).toBeDefined()
      expect(log.new_values).toBeDefined()
      expect(log.old_values.is_active).toBe(true)
      expect(log.new_values.is_active).toBe(false)
    })
  })

  it('should create inventory movements when stock is updated', async () => {
    // TEST: Inventory tracking

    const productId = testProducts[0].id
    const oldStock = testProducts[0].stock_quantity
    const newStock = 50

    await fetch('/api/admin/products/bulk', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testAdmin.access_token}`,
      },
      body: JSON.stringify({
        productIds: [productId],
        updates: {
          stockQuantity: newStock,
        },
      }),
    })

    await new Promise(resolve => setTimeout(resolve, 500))

    // Verify inventory movement was recorded
    const { data: movements } = await supabase
      .from('inventory_movements')
      .select('*')
      .eq('product_id', productId)
      .eq('reason', 'Bulk admin adjustment')

    expect(movements).toHaveLength(1)
    expect(movements[0].movement_type).toBe('in') // 10 -> 50 is increase
    expect(movements[0].quantity).toBe(newStock - oldStock)
  })

  it('should handle multiple field updates in single operation', async () => {
    // TEST: Multiple field updates

    const productId = testProducts[0].id

    const response = await fetch('/api/admin/products/bulk', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testAdmin.access_token}`,
      },
      body: JSON.stringify({
        productIds: [productId],
        updates: {
          isActive: false,
          price: 999.99,
          stockQuantity: 100,
        },
      }),
    })

    expect(response.status).toBe(200)

    // Verify all fields were updated
    const { data: product } = await supabase
      .from('products')
      .select('is_active, price_eur, stock_quantity')
      .eq('id', productId)
      .single()

    expect(product.is_active).toBe(false)
    expect(product.price_eur).toBe(999.99)
    expect(product.stock_quantity).toBe(100)
  })
})

describe('Bulk Product Operations - Authorization', () => {
  it('should block non-admin users from bulk operations', async () => {
    // TEST: RBAC enforcement

    const supabase = createSupabaseClient()

    // Create regular user
    const { data: user } = await supabase.auth.signUp({
      email: `test-user-${Date.now()}@example.test`,
      password: 'TestPassword123!',
    })

    const response = await fetch('/api/admin/products/bulk', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.session.access_token}`,
      },
      body: JSON.stringify({
        productIds: [1],
        updates: { isActive: false },
      }),
    })

    expect(response.status).toBe(403)

    // Cleanup
    await supabase.from('profiles').delete().eq('id', user.user.id)
    await supabase.auth.admin.deleteUser(user.user.id)
  })

  it('should block unauthenticated requests', async () => {
    // TEST: Authentication required

    const response = await fetch('/api/admin/products/bulk', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productIds: [1],
        updates: { isActive: false },
      }),
    })

    expect(response.status).toBe(401)
  })
})

describe('Bulk Product Delete - Error Handling', () => {
  let supabase: any
  let testAdmin: any
  let testProducts: any[]

  beforeEach(async () => {
    supabase = createSupabaseClient()

    const { data: admin } = await supabase.auth.signUp({
      email: `test-admin-${Date.now()}@example.test`,
      password: 'TestPassword123!',
    })
    testAdmin = admin.user

    await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', testAdmin.id)

    const { data: products } = await supabase
      .from('products')
      .insert([
        {
          name_translations: { es: 'Product 1', en: 'Product 1' },
          stock_quantity: 10,
          price_eur: 100,
          category: 'test',
        },
        {
          name_translations: { es: 'Product 2', en: 'Product 2' },
          stock_quantity: 20,
          price_eur: 200,
          category: 'test',
        },
      ])
      .select()

    testProducts = products
  })

  afterEach(async () => {
    if (testProducts && testProducts.length > 0) {
      const productIds = testProducts.map(p => p.id)
      await supabase.from('products').delete().in('id', productIds)
    }
    if (testAdmin) {
      await supabase.from('profiles').delete().eq('id', testAdmin.id)
      await supabase.auth.admin.deleteUser(testAdmin.id)
    }
  })

  it('should handle partial failures when deleting products', async () => {
    // TEST: Mixed valid and invalid product IDs for deletion

    const validIds = [testProducts[0].id]
    const invalidIds = [999999]
    const allIds = [...validIds, ...invalidIds]

    const response = await fetch('/api/admin/products/bulk', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testAdmin.access_token}`,
      },
      body: JSON.stringify({
        productIds: allIds,
      }),
    })

    expect(response.status).toBe(200)

    const result = await response.json()

    // Should report results
    expect(result.data.deletedCount).toBeGreaterThan(0)
    expect(result.data.notFoundIds).toContain(999999)

    // Verify product was deleted
    const { data: product } = await supabase
      .from('products')
      .select('*')
      .eq('id', validIds[0])
      .single()

    expect(product).toBeNull()
  })

  it('should prevent deletion of products with active orders', async () => {
    // TEST: Cannot delete products that have active orders

    // This test assumes there's logic to prevent deleting products with orders
    // Implementation details may vary based on business rules

    const productId = testProducts[0].id

    // Create an order with this product
    const { data: order } = await supabase
      .from('orders')
      .insert({
        user_id: testAdmin.id,
        total_amount: 100,
        status: 'pending',
      })
      .select()
      .single()

    await supabase
      .from('order_items')
      .insert({
        order_id: order.id,
        product_id: productId,
        quantity: 1,
        price_at_time: 100,
      })

    const response = await fetch('/api/admin/products/bulk', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testAdmin.access_token}`,
      },
      body: JSON.stringify({
        productIds: [productId],
      }),
    })

    // Depending on implementation, this might be 400 or 409
    expect([400, 409]).toContain(response.status)

    // Cleanup
    await supabase.from('order_items').delete().eq('order_id', order.id)
    await supabase.from('orders').delete().eq('id', order.id)
  })
})
