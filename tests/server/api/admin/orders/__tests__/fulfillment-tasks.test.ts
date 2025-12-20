/**
 * Tests for Order Fulfillment Tasks API
 *
 * Critical tests for:
 * - Race condition scenarios (concurrent inventory updates)
 * - Duplicate deduction prevention
 * - Inventory consistency
 * - Authorization
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { createSupabaseClient } from '~/server/utils/supabaseAdminClient'

describe('Order Fulfillment Tasks - Race Conditions', () => {
  let supabase: any
  let testProduct: any
  let testOrder1: any
  let testOrder2: any
  let testAdmin: any

  beforeEach(async () => {
    // Setup test database connection
    supabase = createSupabaseClient()

    // Create test admin user
    const { data: admin } = await supabase.auth.signUp({
      email: `test-admin-${Date.now()}@example.test`,
      password: 'TestPassword123!',
    })
    testAdmin = admin.user

    // Set admin role
    await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', testAdmin.id)

    // Create test product with stock
    const { data: product } = await supabase
      .from('products')
      .insert({
        name_translations: { es: 'Test Product', en: 'Test Product' },
        stock_quantity: 10,
        price: 100,
        category: 'test',
      })
      .select()
      .single()

    testProduct = product

    // Create test order 1
    const { data: order1 } = await supabase
      .from('orders')
      .insert({
        user_id: testAdmin.id,
        total_amount: 300,
        status: 'processing',
        inventory_updated: false,
      })
      .select()
      .single()

    testOrder1 = order1

    // Add order items to order 1
    await supabase
      .from('order_items')
      .insert({
        order_id: order1.id,
        product_id: product.id,
        quantity: 3,
        price_at_time: 100,
      })

    // Create test order 2
    const { data: order2 } = await supabase
      .from('orders')
      .insert({
        user_id: testAdmin.id,
        total_amount: 200,
        status: 'processing',
        inventory_updated: false,
      })
      .select()
      .single()

    testOrder2 = order2

    // Add order items to order 2
    await supabase
      .from('order_items')
      .insert({
        order_id: order2.id,
        product_id: product.id,
        quantity: 2,
        price_at_time: 100,
      })

    // Create picking tasks for both orders
    await supabase
      .from('order_fulfillment_tasks')
      .insert([
        {
          order_id: order1.id,
          task_type: 'picking',
          task_description: 'Pick items for order 1',
          completed: false,
        },
        {
          order_id: order2.id,
          task_type: 'picking',
          task_description: 'Pick items for order 2',
          completed: false,
        },
      ])
  })

  const _afterEach = async () => {
    // Cleanup test data
    if (testOrder1) {
      await supabase.from('order_fulfillment_tasks').delete().eq('order_id', testOrder1.id)
      await supabase.from('order_items').delete().eq('order_id', testOrder1.id)
      await supabase.from('orders').delete().eq('id', testOrder1.id)
    }
    if (testOrder2) {
      await supabase.from('order_fulfillment_tasks').delete().eq('order_id', testOrder2.id)
      await supabase.from('order_items').delete().eq('order_id', testOrder2.id)
      await supabase.from('orders').delete().eq('id', testOrder2.id)
    }
    if (testProduct) {
      await supabase.from('inventory_logs').delete().eq('product_id', testProduct.id)
      await supabase.from('products').delete().eq('id', testProduct.id)
    }
    if (testAdmin) {
      await supabase.from('profiles').delete().eq('id', testAdmin.id)
      await supabase.auth.admin.deleteUser(testAdmin.id)
    }
  }

  it('should handle concurrent inventory updates correctly (race condition test)', async () => {
    // CRITICAL TEST: Two admins process different orders with same product simultaneously

    // Get tasks
    const { data: tasks } = await supabase
      .from('order_fulfillment_tasks')
      .select('*')
      .in('order_id', [testOrder1.id, testOrder2.id])

    const task1 = tasks.find((t: any) => t.order_id === testOrder1.id)
    const task2 = tasks.find((t: any) => t.order_id === testOrder2.id)

    // Simulate concurrent completion of both tasks
    await Promise.allSettled([
      fetch(`/api/admin/orders/${testOrder1.id}/fulfillment-tasks/${task1.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testAdmin.access_token}`,
        },
        body: JSON.stringify({ completed: true }),
      }),
      fetch(`/api/admin/orders/${testOrder2.id}/fulfillment-tasks/${task2.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testAdmin.access_token}`,
        },
        body: JSON.stringify({ completed: true }),
      }),
    ])

    // Wait for all operations to complete
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Verify: Stock should be 10 - 3 - 2 = 5, NOT 7 or 8
    const { data: product } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', testProduct.id)
      .single()

    expect(product.stock_quantity).toBe(5)

    // Verify: Inventory logs should show both deductions
    const { data: logs } = await supabase
      .from('inventory_logs')
      .select('*')
      .eq('product_id', testProduct.id)
      .eq('reason', 'sale')
      .order('created_at', { ascending: true })

    expect(logs).toHaveLength(2)
    expect(logs[0].quantity_change).toBe(-3)
    expect(logs[1].quantity_change).toBe(-2)
  }, 10000) // 10 second timeout for race condition test

  it('should handle rapid sequential updates without losing inventory', async () => {
    // CRITICAL TEST: Rapid sequential updates (simulating retry or double-click)

    const { data: tasks } = await supabase
      .from('order_fulfillment_tasks')
      .select('*')
      .eq('order_id', testOrder1.id)

    const task1 = tasks[0]

    // Complete task 3 times rapidly (simulating retry)
    for (let i = 0; i < 3; i++) {
      await fetch(`/api/admin/orders/${testOrder1.id}/fulfillment-tasks/${task1.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testAdmin.access_token}`,
        },
        body: JSON.stringify({ completed: true }),
      })
    }

    // Wait for operations to complete
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Verify: Stock should be deducted only once: 10 - 3 = 7
    const { data: product } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', testProduct.id)
      .single()

    expect(product.stock_quantity).toBe(7)

    // Verify: Only one inventory log entry
    const { data: logs } = await supabase
      .from('inventory_logs')
      .select('*')
      .eq('product_id', testProduct.id)
      .eq('reference_id', testOrder1.id)

    expect(logs).toHaveLength(1)
  })

  it('should prevent duplicate deduction using inventory_updated flag', async () => {
    // TEST: Verify the inventory_updated flag prevents duplicate deductions

    const { data: tasks } = await supabase
      .from('order_fulfillment_tasks')
      .select('*')
      .eq('order_id', testOrder1.id)

    const task = tasks[0]

    // Complete task first time
    await fetch(`/api/admin/orders/${testOrder1.id}/fulfillment-tasks/${task.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testAdmin.access_token}`,
      },
      body: JSON.stringify({ completed: true }),
    })

    await new Promise(resolve => setTimeout(resolve, 500))

    // Verify inventory_updated flag is set
    const { data: order } = await supabase
      .from('orders')
      .select('inventory_updated')
      .eq('id', testOrder1.id)
      .single()

    expect(order.inventory_updated).toBe(true)

    // Get stock after first completion
    const { data: productAfterFirst } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', testProduct.id)
      .single()

    // Mark task as incomplete then complete again
    await fetch(`/api/admin/orders/${testOrder1.id}/fulfillment-tasks/${task.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testAdmin.access_token}`,
      },
      body: JSON.stringify({ completed: false }),
    })

    await new Promise(resolve => setTimeout(resolve, 500))

    await fetch(`/api/admin/orders/${testOrder1.id}/fulfillment-tasks/${task.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testAdmin.access_token}`,
      },
      body: JSON.stringify({ completed: true }),
    })

    await new Promise(resolve => setTimeout(resolve, 500))

    // Verify: Stock should not change because inventory_updated flag prevents duplicate
    const { data: productAfterSecond } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', testProduct.id)
      .single()

    // Stock should remain the same (flag prevents duplicate deduction)
    expect(productAfterSecond.stock_quantity).toBe(productAfterFirst.stock_quantity)
  })

  it('should handle inventory rollback when task is unchecked', async () => {
    // TEST: Verify inventory is restored when picking task is marked incomplete

    const { data: tasks } = await supabase
      .from('order_fulfillment_tasks')
      .select('*')
      .eq('order_id', testOrder1.id)

    const task = tasks[0]

    // Complete task (deduct inventory)
    await fetch(`/api/admin/orders/${testOrder1.id}/fulfillment-tasks/${task.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testAdmin.access_token}`,
      },
      body: JSON.stringify({ completed: true }),
    })

    await new Promise(resolve => setTimeout(resolve, 500))

    // Verify inventory was deducted
    const { data: productAfterDeduct } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', testProduct.id)
      .single()

    expect(productAfterDeduct.stock_quantity).toBe(7) // 10 - 3

    // Mark task as incomplete (rollback inventory)
    await fetch(`/api/admin/orders/${testOrder1.id}/fulfillment-tasks/${task.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testAdmin.access_token}`,
      },
      body: JSON.stringify({ completed: false }),
    })

    await new Promise(resolve => setTimeout(resolve, 500))

    // Verify inventory was restored
    const { data: productAfterRollback } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', testProduct.id)
      .single()

    expect(productAfterRollback.stock_quantity).toBe(10) // Restored to original

    // Verify inventory_updated flag is reset
    const { data: order } = await supabase
      .from('orders')
      .select('inventory_updated')
      .eq('id', testOrder1.id)
      .single()

    expect(order.inventory_updated).toBe(false)

    // Verify sale_reversal log entry exists
    const { data: logs } = await supabase
      .from('inventory_logs')
      .select('*')
      .eq('product_id', testProduct.id)
      .eq('reason', 'sale_reversal')

    expect(logs).toHaveLength(1)
    expect(logs[0].quantity_change).toBe(3) // Positive (adding back)
  })

  it('should prevent rollback for shipped orders', async () => {
    // TEST: Cannot uncheck tasks for shipped orders

    const { data: tasks } = await supabase
      .from('order_fulfillment_tasks')
      .select('*')
      .eq('order_id', testOrder1.id)

    const task = tasks[0]

    // Complete task
    await fetch(`/api/admin/orders/${testOrder1.id}/fulfillment-tasks/${task.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testAdmin.access_token}`,
      },
      body: JSON.stringify({ completed: true }),
    })

    // Mark order as shipped
    await supabase
      .from('orders')
      .update({ status: 'shipped' })
      .eq('id', testOrder1.id)

    await new Promise(resolve => setTimeout(resolve, 500))

    // Try to uncheck task (should fail)
    const response = await fetch(`/api/admin/orders/${testOrder1.id}/fulfillment-tasks/${task.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testAdmin.access_token}`,
      },
      body: JSON.stringify({ completed: false }),
    })

    expect(response.status).toBe(400)

    const data = await response.json()
    expect(data.statusMessage).toContain('shipped')
  })
})

describe('Order Fulfillment Tasks - Authorization', () => {
  it('should block non-admin users from completing tasks', async () => {
    // TEST: RBAC enforcement

    const supabase = createSupabaseClient()

    // Create regular user (not admin)
    const { data: user } = await supabase.auth.signUp({
      email: `test-user-${Date.now()}@example.test`,
      password: 'TestPassword123!',
    })

    // Try to complete task as non-admin
    const response = await fetch('/api/admin/orders/1/fulfillment-tasks/1', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.session.access_token}`,
      },
      body: JSON.stringify({ completed: true }),
    })

    expect(response.status).toBe(403)

    // Cleanup
    await supabase.from('profiles').delete().eq('id', user.user.id)
    await supabase.auth.admin.deleteUser(user.user.id)
  })

  it('should block unauthenticated requests', async () => {
    // TEST: Authentication required

    const response = await fetch('/api/admin/orders/1/fulfillment-tasks/1', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ completed: true }),
    })

    expect(response.status).toBe(401)
  })
})

describe('Order Fulfillment Tasks - Validation', () => {
  it('should validate request body', async () => {
    // TEST: Input validation

    const supabase = createSupabaseClient()
    const { data: admin } = await supabase.auth.signUp({
      email: `test-admin-${Date.now()}@example.test`,
      password: 'TestPassword123!',
    })

    await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', admin.user.id)

    // Missing 'completed' field
    const response1 = await fetch('/api/admin/orders/1/fulfillment-tasks/1', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${admin.session.access_token}`,
      },
      body: JSON.stringify({}),
    })

    expect(response1.status).toBe(400)

    // Invalid 'completed' type
    const response2 = await fetch('/api/admin/orders/1/fulfillment-tasks/1', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${admin.session.access_token}`,
      },
      body: JSON.stringify({ completed: 'yes' }),
    })

    expect(response2.status).toBe(400)

    // Cleanup
    await supabase.from('profiles').delete().eq('id', admin.user.id)
    await supabase.auth.admin.deleteUser(admin.user.id)
  })

  it('should validate order and task IDs', async () => {
    // TEST: ID validation

    const supabase = createSupabaseClient()
    const { data: admin } = await supabase.auth.signUp({
      email: `test-admin-${Date.now()}@example.test`,
      password: 'TestPassword123!',
    })

    await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', admin.user.id)

    // Invalid order ID
    const response1 = await fetch('/api/admin/orders/invalid/fulfillment-tasks/1', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${admin.session.access_token}`,
      },
      body: JSON.stringify({ completed: true }),
    })

    expect(response1.status).toBe(400)

    // Non-existent task
    const response2 = await fetch('/api/admin/orders/999999/fulfillment-tasks/999999', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${admin.session.access_token}`,
      },
      body: JSON.stringify({ completed: true }),
    })

    expect(response2.status).toBe(404)

    // Cleanup
    await supabase.from('profiles').delete().eq('id', admin.user.id)
    await supabase.auth.admin.deleteUser(admin.user.id)
  })
})
