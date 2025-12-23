import type { SupabaseClient } from '@supabase/supabase-js'

interface DashboardStore {
  setLoading: (value: boolean) => void
  setStats: (data: any) => void
  setActivity: (data: any[]) => void
  setError: (message: string) => void
  clearError: () => void
}

const AUTO_REFRESH_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes

/**
 * Composable for dashboard data fetching and auto-refresh functionality
 */
export function useDashboardRefresh(
  supabase: SupabaseClient,
  store: DashboardStore,
) {
  const refreshing = ref(false)
  const autoRefreshEnabled = ref(true)
  const authStore = useAuthStore()
  let autoRefreshInterval: number | null = null

  /**
   * Fetch dashboard data using authenticated fetch
   */
  const fetchDashboardData = async () => {
    // Return mock data for test sessions (personas)
    if (authStore.isTestSession) {
      store.setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 800)) // Simulate network latency

      store.setStats({
        totalProducts: 42,
        activeProducts: 38,
        lowStockProducts: 5,
        totalUsers: 1250,
        activeUsers: 450,
        newUsersToday: 12,
        totalOrders: 850,
        revenue: 125430.50,
        revenueToday: 1250.75,
        conversionRate: 3.4,
        lastUpdated: new Date().toISOString(),
        pendingOrders: 15,
        processingOrders: 8,
        shippedOrders: 120,
        deliveredOrders: 707,
        ordersToday: 8,
        averageOrderValue: 147.56,
      })

      store.setActivity([
        {
          id: 'mock_order_1',
          type: 'new_order',
          title: 'New Order',
          description: 'Order #ORD-2024-001 for €145.50',
          timestamp: new Date().toISOString(),
          metadata: { orderNumber: 'ORD-2024-001', total: 145.50 },
        },
        {
          id: 'mock_user_1',
          type: 'user_registration',
          title: 'New User Registration',
          description: 'Juan Pérez joined the platform',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          metadata: { userName: 'Juan Pérez' },
        },
        {
          id: 'mock_stock_1',
          type: 'low_stock',
          title: 'Low Stock Alert',
          description: 'Premium Red Wine has only 2 items left',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          metadata: { productName: 'Premium Red Wine', stockQuantity: 2 },
        },
      ])

      store.setLoading(false)
      store.clearError()
      return
    }

    try {
      store.setLoading(true)

      // Get session from supabase client
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        console.error('[AdminFetch] No active session')
        store.setError('Session expired. Please log in again.')
        await navigateTo('/auth/login')
        return
      }

      // Prepare headers with Bearer token
      const headers = {
        Authorization: `Bearer ${session.access_token}`,
      }

      // Fetch stats and activity in parallel with proper auth headers
      const [statsResult, activityResult] = await Promise.all([
        $fetch<{ success: boolean, data: unknown }>('/api/admin/dashboard/stats', { headers })
          .catch((err: any) => {
            console.error('[AdminFetch] Error fetching /api/admin/dashboard/stats:', err)
            return null
          }),
        $fetch<{ success: boolean, data: unknown[] }>('/api/admin/dashboard/activity', { headers })
          .catch((err: any) => {
            console.error('[AdminFetch] Error fetching /api/admin/dashboard/activity:', err)
            return null
          }),
      ])

      // Update store with fetched data
      if (statsResult?.success) {
        store.setStats(statsResult.data)
      }

      if (activityResult?.success) {
        store.setActivity(activityResult.data)
      }

      // If both failed, set error
      if (!statsResult && !activityResult) {
        store.setError('Failed to load dashboard data')
      }
      else {
        // Clear any previous errors on successful fetch
        store.clearError()
      }
    }
    catch (error: any) {
      console.error('[AdminFetch] Error fetching dashboard data:', error)

      const err = error as { statusCode?: number, message?: string }
      // Handle authentication errors specially
      if (err?.statusCode === 401) {
        store.setError('Session expired. Please log in again.')
        // Redirect to login after a short delay
        setTimeout(() => {
          navigateTo('/auth/login')
        }, 2000)
      }
      else {
        store.setError(err?.message || 'Failed to load dashboard data')
      }
    }
    finally {
      store.setLoading(false)
    }
  }

  /**
   * Start auto-refresh interval
   */
  const startAutoRefresh = () => {
    stopAutoRefresh() // Clear any existing interval

    autoRefreshInterval = window.setInterval(() => {
      fetchDashboardData()
    }, AUTO_REFRESH_INTERVAL_MS)
  }

  /**
   * Stop auto-refresh interval
   */
  const stopAutoRefresh = () => {
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval)
      autoRefreshInterval = null
    }
  }

  /**
   * Toggle auto-refresh on/off
   */
  const toggleAutoRefresh = () => {
    autoRefreshEnabled.value = !autoRefreshEnabled.value

    if (autoRefreshEnabled.value) {
      startAutoRefresh()
    }
    else {
      stopAutoRefresh()
    }
  }

  /**
   * Manual refresh all data
   */
  const refreshAll = async () => {
    refreshing.value = true
    try {
      await fetchDashboardData()
    }
    finally {
      refreshing.value = false
    }
  }

  /**
   * Initialize auto-refresh on mount
   */
  const initAutoRefresh = () => {
    if (autoRefreshEnabled.value) {
      startAutoRefresh()
    }
  }

  /**
   * Cleanup on unmount
   */
  const cleanupAutoRefresh = () => {
    stopAutoRefresh()
  }

  return {
    refreshing,
    autoRefreshEnabled,
    fetchDashboardData,
    startAutoRefresh,
    stopAutoRefresh,
    toggleAutoRefresh,
    refreshAll,
    initAutoRefresh,
    cleanupAutoRefresh,
  }
}
