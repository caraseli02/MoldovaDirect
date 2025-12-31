/**
 * Analytics Composable
 *
 * Requirements addressed:
 * - 3.1: Provide interface for analytics data collection and retrieval
 * - 3.3: Support user registration trends and activity analysis
 *
 * Provides reactive analytics data and methods for tracking user activities.
 */

import type {
  UserAnalyticsData,
  AnalyticsOverview,
  ProductAnalyticsData,
  ActivityTrackingRequest,
  AggregationResult,
} from '~/types/analytics'

// API Response wrapper type
interface ApiDataResponse<T> {
  data: T
}

// Helper to extract error message safely
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return getErrorMessage(error)
  if (typeof error === 'string') return error
  return 'An unknown error occurred'
}

export const useAnalytics = () => {
  // Reactive state
  const userAnalytics = ref<UserAnalyticsData | null>(null)
  const analyticsOverview = ref<AnalyticsOverview | null>(null)
  const productAnalytics = ref<ProductAnalyticsData | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Fetch user analytics data
  const fetchUserAnalytics = async (params?: {
    days?: number
    startDate?: string
    endDate?: string
  }) => {
    loading.value = true
    error.value = null

    try {
      const { data } = await $fetch<ApiDataResponse<UserAnalyticsData>>('/api/admin/analytics/users', {
        query: params,
      })

      userAnalytics.value = data
      return data
    }
    catch (err: unknown) {
      error.value = getErrorMessage(err) || 'Failed to fetch user analytics'
      throw err
    }
    finally {
      loading.value = false
    }
  }

  // Fetch analytics overview
  const fetchAnalyticsOverview = async (params?: {
    days?: number
    startDate?: string
    endDate?: string
  }) => {
    loading.value = true
    error.value = null

    try {
      const { data } = await $fetch<ApiDataResponse<AnalyticsOverview>>('/api/admin/analytics/overview', {
        query: params,
      })

      analyticsOverview.value = data
      return data
    }
    catch (err: unknown) {
      error.value = getErrorMessage(err) || 'Failed to fetch analytics overview'
      throw err
    }
    finally {
      loading.value = false
    }
  }

  // Fetch product analytics data
  const fetchProductAnalytics = async (params?: {
    days?: number
    startDate?: string
    endDate?: string
    limit?: number
  }) => {
    loading.value = true
    error.value = null

    try {
      const { data } = await $fetch<ApiDataResponse<ProductAnalyticsData>>('/api/admin/analytics/products', {
        query: params,
      })

      productAnalytics.value = data
      return data
    }
    catch (err: unknown) {
      error.value = getErrorMessage(err) || 'Failed to fetch product analytics'
      throw err
    }
    finally {
      loading.value = false
    }
  }

  // Track user activity
  const trackActivity = async (activity: ActivityTrackingRequest) => {
    try {
      await $fetch('/api/admin/analytics/track', {
        method: 'POST',
        body: activity,
      })
    }
    catch (err: unknown) {
      console.error('Failed to track activity:', getErrorMessage(err))
      // Don't throw error for tracking failures to avoid disrupting user experience
    }
  }

  // Aggregate analytics data
  const aggregateAnalytics = async (params?: {
    startDate?: string
    endDate?: string
    forceRefresh?: boolean
  }) => {
    loading.value = true
    error.value = null

    try {
      const { data } = await $fetch<ApiDataResponse<AggregationResult>>('/api/admin/analytics/aggregate', {
        method: 'POST',
        body: params,
      })

      return data
    }
    catch (err: unknown) {
      error.value = getErrorMessage(err) || 'Failed to aggregate analytics'
      throw err
    }
    finally {
      loading.value = false
    }
  }

  // Convenience methods for common tracking scenarios
  const trackPageView = (pageUrl: string, metadata?: Record<string, unknown>) => {
    return trackActivity({
      activityType: 'page_view',
      pageUrl,
      metadata,
    })
  }

  const trackProductView = (productId: number, pageUrl?: string, metadata?: Record<string, unknown>) => {
    return trackActivity({
      activityType: 'product_view',
      productId,
      pageUrl,
      metadata,
    })
  }

  const trackCartAddition = (productId: number, metadata?: Record<string, unknown>) => {
    return trackActivity({
      activityType: 'cart_add',
      productId,
      metadata,
    })
  }

  const trackOrderCreation = (orderId: number, metadata?: Record<string, unknown>) => {
    return trackActivity({
      activityType: 'order_create',
      orderId,
      metadata,
    })
  }

  const trackLogin = (metadata?: Record<string, unknown>) => {
    return trackActivity({
      activityType: 'login',
      metadata,
    })
  }

  const trackLogout = (metadata?: Record<string, unknown>) => {
    return trackActivity({
      activityType: 'logout',
      metadata,
    })
  }

  // Computed properties for easy access to analytics insights
  const userGrowthTrend = computed(() => {
    if (!analyticsOverview.value) return null
    return analyticsOverview.value.trends.userGrowth
  })

  const revenueGrowthTrend = computed(() => {
    if (!analyticsOverview.value) return null
    return analyticsOverview.value.trends.revenueGrowth
  })

  const conversionRate = computed(() => {
    if (!analyticsOverview.value) return 0
    return analyticsOverview.value.kpis.conversionRate
  })

  const totalRevenue = computed(() => {
    if (!analyticsOverview.value) return 0
    return analyticsOverview.value.kpis.totalRevenue
  })

  const activeUsers = computed(() => {
    if (!analyticsOverview.value) return 0
    return analyticsOverview.value.kpis.activeUsers
  })

  // Clear data
  const clearAnalytics = () => {
    userAnalytics.value = null
    analyticsOverview.value = null
    productAnalytics.value = null
    error.value = null
  }

  // Refresh all analytics data
  const refreshAllAnalytics = async (params?: {
    days?: number
    startDate?: string
    endDate?: string
  }) => {
    await Promise.all([
      fetchAnalyticsOverview(params),
      fetchUserAnalytics(params),
      fetchProductAnalytics(params),
    ])
  }

  return {
    // State
    userAnalytics: readonly(userAnalytics),
    analyticsOverview: readonly(analyticsOverview),
    productAnalytics: readonly(productAnalytics),
    loading: readonly(loading),
    error: readonly(error),

    // Methods
    fetchUserAnalytics,
    fetchAnalyticsOverview,
    fetchProductAnalytics,
    trackActivity,
    aggregateAnalytics,

    // Convenience tracking methods
    trackPageView,
    trackProductView,
    trackCartAddition,
    trackOrderCreation,
    trackLogin,
    trackLogout,

    // Computed insights
    userGrowthTrend,
    revenueGrowthTrend,
    conversionRate,
    totalRevenue,
    activeUsers,

    // Utility methods
    clearAnalytics,
    refreshAllAnalytics,
  }
}
