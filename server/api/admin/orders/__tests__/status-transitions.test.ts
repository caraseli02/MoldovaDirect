/**
 * Tests for Order Status Transitions API
 *
 * Tests for:
 * - Valid status transitions
 * - Invalid status transition prevention
 * - Required field validation
 * - Status history logging
 * - Terminal state enforcement
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createSupabaseClient } from '~/server/utils/supabaseAdminClient'

describe('Order Status Transitions - Valid Transitions', () => {
  let supabase: any
  let testAdmin: any
  let testOrder: any

  beforeEach(async () => {
    supabase = createSupabaseClient()

    // Create test admin user
    const { data: admin } = await supabase.auth.signUp({
      email: `test-admin-${Date.now()}@example.test`,
      password: 'TestPassword123!'
    })
    testAdmin = admin.user

    await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', testAdmin.id)
  })

  afterEach(async () => {
    // Cleanup
    if (testOrder) {
      await supabase.from('order_status_history').delete().eq('order_id', testOrder.id)
      await supabase.from('order_items').delete().eq('order_id', testOrder.id)
      await supabase.from('orders').delete().eq('id', testOrder.id)
    }
    if (testAdmin) {
      await supabase.from('profiles').delete().eq('id', testAdmin.id)
      await supabase.auth.admin.deleteUser(testAdmin.id)
    }
  })

  it('should allow transition from pending to processing', async () => {
    // Create order in pending status
    const { data: order } = await supabase
      .from('orders')
      .insert({
        user_id: testAdmin.id,
        total_amount: 100,
        status: 'pending'
      })
      .select()
      .single()

    testOrder = order

    const response = await fetch(`/api/admin/orders/${order.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testAdmin.access_token}`
      },
      body: JSON.stringify({
        status: 'processing'
      })
    })

    expect(response.status).toBe(200)

    const result = await response.json()
    expect(result.data.status).toBe('processing')
    expect(result.data.previousStatus).toBe('pending')

    // Verify status history was recorded
    const { data: history } = await supabase
      .from('order_status_history')
      .select('*')
      .eq('order_id', order.id)

    expect(history).toHaveLength(1)
    expect(history[0].from_status).toBe('pending')
    expect(history[0].to_status).toBe('processing')
    expect(history[0].changed_by).toBe(testAdmin.id)
  })

  it('should allow complete order workflow: pending -> processing -> shipped -> delivered', async () => {
    // Create order
    const { data: order } = await supabase
      .from('orders')
      .insert({
        user_id: testAdmin.id,
        total_amount: 100,
        status: 'pending'
      })
      .select()
      .single()

    testOrder = order

    // 1. pending -> processing
    await fetch(`/api/admin/orders/${order.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testAdmin.access_token}`
      },
      body: JSON.stringify({ status: 'processing' })
    })

    // 2. processing -> shipped (with tracking)
    await fetch(`/api/admin/orders/${order.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testAdmin.access_token}`
      },
      body: JSON.stringify({
        status: 'shipped',
        trackingNumber: 'TRACK123',
        carrier: 'DHL'
      })
    })

    // 3. shipped -> delivered
    const response = await fetch(`/api/admin/orders/${order.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testAdmin.access_token}`
      },
      body: JSON.stringify({ status: 'delivered' })
    })

    expect(response.status).toBe(200)

    // Verify final state
    const { data: finalOrder } = await supabase
      .from('orders')
      .select('status, shipped_at, delivered_at')
      .eq('id', order.id)
      .single()

    expect(finalOrder.status).toBe('delivered')
    expect(finalOrder.shipped_at).toBeDefined()
    expect(finalOrder.delivered_at).toBeDefined()

    // Verify complete status history
    const { data: history } = await supabase
      .from('order_status_history')
      .select('from_status, to_status')
      .eq('order_id', order.id)
      .order('changed_at', { ascending: true })

    expect(history).toHaveLength(3)
    expect(history[0]).toMatchObject({ from_status: 'pending', to_status: 'processing' })
    expect(history[1]).toMatchObject({ from_status: 'processing', to_status: 'shipped' })
    expect(history[2]).toMatchObject({ from_status: 'shipped', to_status: 'delivered' })
  })

  it('should allow cancellation from any non-terminal status', async () => {
    // Test cancellation from pending
    const { data: order1 } = await supabase
      .from('orders')
      .insert({
        user_id: testAdmin.id,
        total_amount: 100,
        status: 'pending'
      })
      .select()
      .single()

    const response1 = await fetch(`/api/admin/orders/${order1.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testAdmin.access_token}`
      },
      body: JSON.stringify({
        status: 'cancelled',
        adminNotes: 'Customer requested cancellation'
      })
    })

    expect(response1.status).toBe(200)

    // Cleanup
    await supabase.from('order_status_history').delete().eq('order_id', order1.id)
    await supabase.from('orders').delete().eq('id', order1.id)

    // Test cancellation from processing
    const { data: order2 } = await supabase
      .from('orders')
      .insert({
        user_id: testAdmin.id,
        total_amount: 100,
        status: 'processing'
      })
      .select()
      .single()

    testOrder = order2

    const response2 = await fetch(`/api/admin/orders/${order2.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testAdmin.access_token}`
      },
      body: JSON.stringify({ status: 'cancelled' })
    })

    expect(response2.status).toBe(200)
  })
})

describe('Order Status Transitions - Invalid Transitions', () => {
  let supabase: any
  let testAdmin: any
  let testOrder: any

  beforeEach(async () => {
    supabase = createSupabaseClient()

    const { data: admin } = await supabase.auth.signUp({
      email: `test-admin-${Date.now()}@example.test`,
      password: 'TestPassword123!'
    })
    testAdmin = admin.user

    await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', testAdmin.id)
  })

  afterEach(async () => {
    if (testOrder) {
      await supabase.from('order_status_history').delete().eq('order_id', testOrder.id)
      await supabase.from('order_items').delete().eq('order_id', testOrder.id)
      await supabase.from('orders').delete().eq('id', testOrder.id)
    }
    if (testAdmin) {
      await supabase.from('profiles').delete().eq('id', testAdmin.id)
      await supabase.auth.admin.deleteUser(testAdmin.id)
    }
  })

  it('should prevent transition from shipped to pending', async () => {
    const { data: order } = await supabase
      .from('orders')
      .insert({
        user_id: testAdmin.id,
        total_amount: 100,
        status: 'shipped'
      })
      .select()
      .single()

    testOrder = order

    const response = await fetch(`/api/admin/orders/${order.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testAdmin.access_token}`
      },
      body: JSON.stringify({ status: 'pending' })
    })

    expect(response.status).toBe(400)

    const result = await response.json()
    expect(result.statusMessage).toContain('Invalid status transition')
    expect(result.statusMessage).toContain('shipped')
    expect(result.statusMessage).toContain('pending')
  })

  it('should prevent transition from pending to shipped (skipping processing)', async () => {
    const { data: order } = await supabase
      .from('orders')
      .insert({
        user_id: testAdmin.id,
        total_amount: 100,
        status: 'pending'
      })
      .select()
      .single()

    testOrder = order

    const response = await fetch(`/api/admin/orders/${order.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testAdmin.access_token}`
      },
      body: JSON.stringify({
        status: 'shipped',
        trackingNumber: 'TRACK123',
        carrier: 'DHL'
      })
    })

    expect(response.status).toBe(400)

    const result = await response.json()
    expect(result.statusMessage).toContain('Invalid status transition')
  })

  it('should prevent any transition from delivered (terminal state)', async () => {
    const { data: order } = await supabase
      .from('orders')
      .insert({
        user_id: testAdmin.id,
        total_amount: 100,
        status: 'delivered'
      })
      .select()
      .single()

    testOrder = order

    // Try to move back to processing
    const response = await fetch(`/api/admin/orders/${order.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testAdmin.access_token}`
      },
      body: JSON.stringify({ status: 'processing' })
    })

    expect(response.status).toBe(400)

    const result = await response.json()
    expect(result.statusMessage).toContain('Invalid status transition')
    expect(result.statusMessage).toContain('delivered')
  })

  it('should prevent any transition from cancelled (terminal state)', async () => {
    const { data: order } = await supabase
      .from('orders')
      .insert({
        user_id: testAdmin.id,
        total_amount: 100,
        status: 'cancelled'
      })
      .select()
      .single()

    testOrder = order

    // Try to reactivate
    const response = await fetch(`/api/admin/orders/${order.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testAdmin.access_token}`
      },
      body: JSON.stringify({ status: 'pending' })
    })

    expect(response.status).toBe(400)
  })
})

describe('Order Status Transitions - Required Fields', () => {
  let supabase: any
  let testAdmin: any
  let testOrder: any

  beforeEach(async () => {
    supabase = createSupabaseClient()

    const { data: admin } = await supabase.auth.signUp({
      email: `test-admin-${Date.now()}@example.test`,
      password: 'TestPassword123!'
    })
    testAdmin = admin.user

    await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', testAdmin.id)
  })

  afterEach(async () => {
    if (testOrder) {
      await supabase.from('order_status_history').delete().eq('order_id', testOrder.id)
      await supabase.from('orders').delete().eq('id', testOrder.id)
    }
    if (testAdmin) {
      await supabase.from('profiles').delete().eq('id', testAdmin.id)
      await supabase.auth.admin.deleteUser(testAdmin.id)
    }
  })

  it('should require tracking number when marking as shipped', async () => {
    const { data: order } = await supabase
      .from('orders')
      .insert({
        user_id: testAdmin.id,
        total_amount: 100,
        status: 'processing'
      })
      .select()
      .single()

    testOrder = order

    // Try without tracking number
    const response = await fetch(`/api/admin/orders/${order.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testAdmin.access_token}`
      },
      body: JSON.stringify({
        status: 'shipped',
        carrier: 'DHL'
      })
    })

    expect(response.status).toBe(400)

    const result = await response.json()
    expect(result.statusMessage).toContain('Tracking number is required')
  })

  it('should require carrier when marking as shipped', async () => {
    const { data: order } = await supabase
      .from('orders')
      .insert({
        user_id: testAdmin.id,
        total_amount: 100,
        status: 'processing'
      })
      .select()
      .single()

    testOrder = order

    // Try without carrier
    const response = await fetch(`/api/admin/orders/${order.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testAdmin.access_token}`
      },
      body: JSON.stringify({
        status: 'shipped',
        trackingNumber: 'TRACK123'
      })
    })

    expect(response.status).toBe(400)

    const result = await response.json()
    expect(result.statusMessage).toContain('Carrier is required')
  })

  it('should set shipped_at timestamp when marking as shipped', async () => {
    const { data: order } = await supabase
      .from('orders')
      .insert({
        user_id: testAdmin.id,
        total_amount: 100,
        status: 'processing'
      })
      .select()
      .single()

    testOrder = order

    const response = await fetch(`/api/admin/orders/${order.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testAdmin.access_token}`
      },
      body: JSON.stringify({
        status: 'shipped',
        trackingNumber: 'TRACK123',
        carrier: 'DHL'
      })
    })

    expect(response.status).toBe(200)

    const result = await response.json()
    expect(result.data.shippedAt).toBeDefined()

    // Verify in database
    const { data: updatedOrder } = await supabase
      .from('orders')
      .select('shipped_at')
      .eq('id', order.id)
      .single()

    expect(updatedOrder.shipped_at).toBeDefined()
  })

  it('should set delivered_at timestamp when marking as delivered', async () => {
    const { data: order } = await supabase
      .from('orders')
      .insert({
        user_id: testAdmin.id,
        total_amount: 100,
        status: 'shipped'
      })
      .select()
      .single()

    testOrder = order

    const response = await fetch(`/api/admin/orders/${order.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testAdmin.access_token}`
      },
      body: JSON.stringify({ status: 'delivered' })
    })

    expect(response.status).toBe(200)

    const result = await response.json()
    expect(result.data.deliveredAt).toBeDefined()
  })

  it('should save admin notes with status change', async () => {
    const { data: order } = await supabase
      .from('orders')
      .insert({
        user_id: testAdmin.id,
        total_amount: 100,
        status: 'pending'
      })
      .select()
      .single()

    testOrder = order

    await fetch(`/api/admin/orders/${order.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testAdmin.access_token}`
      },
      body: JSON.stringify({
        status: 'cancelled',
        adminNotes: 'Customer requested cancellation due to delayed shipping'
      })
    })

    // Verify notes in status history
    const { data: history } = await supabase
      .from('order_status_history')
      .select('notes')
      .eq('order_id', order.id)
      .single()

    expect(history.notes).toBe('Customer requested cancellation due to delayed shipping')
  })
})

describe('Order Status Transitions - Validation', () => {
  let supabase: any
  let testAdmin: any

  beforeEach(async () => {
    supabase = createSupabaseClient()

    const { data: admin } = await supabase.auth.signUp({
      email: `test-admin-${Date.now()}@example.test`,
      password: 'TestPassword123!'
    })
    testAdmin = admin.user

    await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', testAdmin.id)
  })

  afterEach(async () => {
    if (testAdmin) {
      await supabase.from('profiles').delete().eq('id', testAdmin.id)
      await supabase.auth.admin.deleteUser(testAdmin.id)
    }
  })

  it('should return 404 for non-existent order', async () => {
    const response = await fetch('/api/admin/orders/999999/status', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testAdmin.access_token}`
      },
      body: JSON.stringify({ status: 'processing' })
    })

    expect(response.status).toBe(404)
  })

  it('should reject invalid status values', async () => {
    const response = await fetch('/api/admin/orders/1/status', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testAdmin.access_token}`
      },
      body: JSON.stringify({ status: 'invalid_status' })
    })

    expect(response.status).toBe(400)
  })

  it('should reject missing status field', async () => {
    const response = await fetch('/api/admin/orders/1/status', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testAdmin.access_token}`
      },
      body: JSON.stringify({})
    })

    expect(response.status).toBe(400)
  })
})
