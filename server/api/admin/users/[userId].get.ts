/**
 * Admin Users API - Get User Details
 *
 * Requirements addressed:
 * - 4.3: Display detailed user information including order history and account information
 * - 4.6: Display login history and account modifications
 *
 * Provides detailed user information for admin user management interface.
 */

import { serverSupabaseServiceRole } from '#supabase/server'
import { requireAdminRole } from '~/server/utils/adminAuth'

interface UserDetail {
  id: string
  email: string
  email_confirmed_at: string | null
  last_sign_in_at: string | null
  created_at: string
  updated_at: string
  profile: {
    name: string
    phone: string | null
    preferred_language: string
    created_at: string
    updated_at: string
  } | null
  addresses: Array<{
    id: number
    type: string
    street: string
    city: string
    postal_code: string
    province: string | null
    country: string
    is_default: boolean
    created_at: string
  }>
  orders: Array<{
    id: number
    order_number: string
    status: string
    payment_status: string
    total_eur: number
    created_at: string
    items_count: number
  }>
  activity: Array<{
    id: string
    event_type: string
    created_at: string
    ip_address?: string
    user_agent?: string
    metadata?: any
  }>
  statistics: {
    totalOrders: number
    totalSpent: number
    averageOrderValue: number
    lastOrderDate: string | null
    accountAge: number
    loginCount: number
    lastLogin: string | null
  }
}

// NOTE: Caching disabled for admin endpoints to ensure proper header-based authentication
export default defineEventHandler(async (event) => {
  try {
    await requireAdminRole(event)
    const userId = getRouterParam(event, 'userId')

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required',
      })
    }

    // Verify admin authentication
    const supabase = serverSupabaseServiceRole(event)

    // Try to get auth user data
    let authUser = null
    try {
      const { data, error: authError } = await supabase.auth.admin.getUserById(userId)
      if (authError) {
        console.warn('Failed to fetch auth user:', authError.message)
      }
      else {
        authUser = data?.user
      }
    }
    catch (error: unknown) {
      console.warn('Auth admin API not available:', error)
    }

    // If no auth user found, check if it's a mock user ID
    if (!authUser && userId.startsWith('user-')) {
      return getMockUserDetail(userId)
    }

    if (!authUser) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found',
      })
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      throw new Error(`Failed to fetch user profile: ${profileError.message}`)
    }

    // Get user addresses
    const { data: addresses, error: addressesError } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (addressesError) {
      console.warn('Failed to fetch user addresses:', addressesError.message)
    }

    // Get user orders with item counts
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        payment_status,
        total_eur,
        created_at,
        order_items(count)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (ordersError) {
      console.warn('Failed to fetch user orders:', ordersError.message)
    }

    // Get user activity logs (if available)
    const { data: activity, error: activityError } = await supabase
      .from('user_activity_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (activityError) {
      console.warn('Failed to fetch user activity:', activityError.message)
    }

    // Calculate statistics
    const totalOrders = orders?.length || 0
    const totalSpent = orders?.reduce((sum, order) => sum + Number(order.total_eur), 0) || 0
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0
    const lastOrderDate = orders && orders.length > 0 ? orders[0].created_at : null

    const authUserData = authUser as any
    const accountCreated = new Date(authUserData.created_at)
    const now = new Date()
    const accountAge = Math.floor((now.getTime() - accountCreated.getTime()) / (1000 * 60 * 60 * 24))

    const loginCount = activity?.filter(a => a.activity_type === 'login').length || 0
    const lastLogin = authUserData.last_sign_in_at

    const userDetail: UserDetail = {
      id: authUserData.id,
      email: authUserData.email || '',
      email_confirmed_at: authUserData.email_confirmed_at,
      last_sign_in_at: authUserData.last_sign_in_at,
      created_at: authUserData.created_at,
      updated_at: authUserData.updated_at,
      profile: profile || null,
      addresses: addresses || [],
      orders: orders?.map(order => ({
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        payment_status: order.payment_status,
        total_eur: Number(order.total_eur),
        created_at: order.created_at,
        items_count: Array.isArray(order.order_items) ? order.order_items.length : 0,
      })) || [],
      activity: activity?.map(a => ({
        id: a.id,
        event_type: a.activity_type,
        created_at: a.created_at,
        ip_address: a.ip_address,
        user_agent: a.user_agent,
        metadata: a.metadata,
      })) || [],
      statistics: {
        totalOrders,
        totalSpent,
        averageOrderValue,
        lastOrderDate,
        accountAge,
        loginCount,
        lastLogin,
      },
    }

    return {
      success: true,
      data: userDetail,
    }
  }
  catch (error: unknown) {
    console.error('Error in admin user detail API:', getServerErrorMessage(error))

    if (isH3Error(error)) {
      throw error
    }

    // Return mock data as fallback
    const userId = getRouterParam(event, 'userId')
    if (userId && userId.startsWith('user-')) {
      console.warn('Returning mock user detail due to error')
      return getMockUserDetail(userId)
    }

    return {
      success: false,
      error: {
        statusCode: 500,
        statusMessage: error instanceof Error ? error.message : 'Failed to fetch user details',
      },
    }
  }
})

/**
 * Mock user detail data for development/testing
 */
function getMockUserDetail(userId: string): unknown {
  const mockUsers: Record<string, any> = {
    'user-1': {
      id: 'user-1',
      email: 'john.doe@example.com',
      email_confirmed_at: new Date().toISOString(),
      last_sign_in_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      profile: {
        name: 'John Doe',
        phone: '+1234567890',
        preferred_language: 'en',
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      addresses: [
        {
          id: 1,
          type: 'shipping',
          street: '123 Main St',
          city: 'New York',
          postal_code: '10001',
          province: 'NY',
          country: 'US',
          is_default: true,
          created_at: new Date().toISOString(),
        },
      ],
      orders: [
        {
          id: 1,
          order_number: 'ORD-001',
          status: 'delivered',
          payment_status: 'paid',
          total_eur: 99.99,
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          items_count: 3,
        },
      ],
      activity: [
        {
          id: 'act-1',
          event_type: 'login',
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          ip_address: '192.168.1.1',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          metadata: { source: 'web' },
        },
      ],
      statistics: {
        totalOrders: 5,
        totalSpent: 299.99,
        averageOrderValue: 59.99,
        lastOrderDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        accountAge: 30,
        loginCount: 15,
        lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
    },
    'user-2': {
      id: 'user-2',
      email: 'jane.smith@example.com',
      email_confirmed_at: null,
      last_sign_in_at: null,
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      profile: {
        name: 'Jane Smith',
        phone: null,
        preferred_language: 'es',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      addresses: [],
      orders: [],
      activity: [
        {
          id: 'act-2',
          event_type: 'registration',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          ip_address: '192.168.1.2',
          user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
          metadata: { source: 'mobile' },
        },
      ],
      statistics: {
        totalOrders: 0,
        totalSpent: 0,
        averageOrderValue: 0,
        lastOrderDate: null,
        accountAge: 7,
        loginCount: 0,
        lastLogin: null,
      },
    },
  }

  const user = mockUsers[userId] || mockUsers['user-1']

  return {
    success: true,
    data: user,
  }
}
