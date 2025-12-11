/**
 * Analytics Type Definitions
 *
 * Requirements addressed:
 * - 3.1: Type definitions for analytics data structures
 * - 3.3: User analytics and activity tracking types
 * - 3.4: Product analytics and performance metrics types
 * - 3.5: Conversion funnel analysis types
 */

// User Analytics Types
export interface UserAnalyticsData {
  registrationTrends: Array<{
    date: string
    registrations: number
    cumulativeUsers: number
  }>
  activityTrends: Array<{
    date: string
    activeUsers: number
    logins: number
    pageViews: number
    productViews: number
    cartAdditions: number
    orders: number
  }>
  summary: {
    totalUsers: number
    activeUsersLast30Days: number
    newUsersLast30Days: number
    avgDailyActiveUsers: number
    userRetentionRate: number
  }
  topUserActivities: Array<{
    userId: string
    userName: string
    totalActivities: number
    lastActivity: string
    activityBreakdown: Record<string, number>
  }>
}

// Analytics Overview Types
export interface AnalyticsOverview {
  dailyAnalytics: Array<{
    date: string
    totalUsers: number
    activeUsers: number
    newRegistrations: number
    pageViews: number
    uniqueVisitors: number
    ordersCount: number
    revenue: number
  }>
  kpis: {
    totalUsers: number
    activeUsers: number
    totalRevenue: number
    conversionRate: number
    avgOrderValue: number
    userGrowthRate: number
    revenueGrowthRate: number
  }
  trends: {
    userGrowth: 'up' | 'down' | 'stable'
    revenueGrowth: 'up' | 'down' | 'stable'
    activityGrowth: 'up' | 'down' | 'stable'
  }
  dateRange: {
    startDate: string
    endDate: string
    totalDays: number
  }
}

// Product Analytics Types
export interface ProductAnalyticsData {
  mostViewedProducts: Array<{
    productId: number
    productName: string
    price: number
    totalViews: number
    viewsGrowth: number
  }>
  bestSellingProducts: Array<{
    productId: number
    productName: string
    price: number
    totalSales: number
    totalRevenue: number
    salesGrowth: number
  }>
  conversionFunnel: {
    totalViews: number
    totalCartAdditions: number
    totalPurchases: number
    viewToCartRate: number
    cartToPurchaseRate: number
    overallConversionRate: number
  }
  productPerformance: Array<{
    productId: number
    productName: string
    price: number
    views: number
    cartAdditions: number
    purchases: number
    revenue: number
    viewToCartRate: number
    cartToPurchaseRate: number
    conversionRate: number
  }>
  abandonmentAnalysis: Array<{
    productId: number
    productName: string
    cartAdditions: number
    purchases: number
    abandonmentRate: number
  }>
}

// Activity Tracking Types
export interface ActivityTrackingRequest {
  activityType: 'login' | 'logout' | 'page_view' | 'product_view' | 'cart_add' | 'order_create'
  pageUrl?: string
  productId?: number
  orderId?: number
  sessionId?: string
  metadata?: Record<string, unknown>
}

export interface ActivityItem {
  id: string
  type: 'user_registration' | 'new_order' | 'low_stock' | 'product_update'
  title: string
  description: string
  timestamp: string
  metadata?: Record<string, unknown>
}

// Dashboard Statistics Types
export interface DashboardStats {
  totalProducts: number
  activeProducts: number
  lowStockProducts: number
  totalUsers: number
  activeUsers: number
  newUsersToday: number
  totalOrders: number
  revenue: number
  revenueToday: number
  conversionRate: number
  lastUpdated: string
}

// Analytics Query Parameters
export interface AnalyticsQueryParams {
  days?: number
  startDate?: string
  endDate?: string
  limit?: number
}

// Aggregation Types
export interface AggregationRequest {
  startDate?: string
  endDate?: string
  forceRefresh?: boolean
}

export interface AggregationResult {
  datesProcessed: string[]
  recordsCreated: number
  recordsUpdated: number
  errors: string[]
}

// Database Schema Types
export interface DailyAnalytics {
  date: string
  totalUsers: number
  activeUsers: number
  newRegistrations: number
  pageViews: number
  uniqueVisitors: number
  ordersCount: number
  revenue: number
  createdAt: string
  updatedAt: string
}

export interface ProductAnalytics {
  id: number
  productId: number
  date: string
  views: number
  cartAdditions: number
  purchases: number
  revenue: number
  createdAt: string
  updatedAt: string
}

export interface UserActivityLog {
  id: number
  userId: string | null
  activityType: 'login' | 'logout' | 'page_view' | 'product_view' | 'cart_add' | 'order_create'
  pageUrl?: string
  productId?: number
  orderId?: number
  sessionId?: string
  ipAddress?: string
  userAgent?: string
  metadata?: Record<string, unknown>
  createdAt: string
}

export interface AuditLog {
  id: number
  userId: string
  action: string
  resourceType: string
  resourceId?: string
  oldValues?: Record<string, unknown>
  newValues?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  createdAt: string
}

// Chart Data Types
export interface ChartDataPoint {
  x: string | number
  y: number
  label?: string
}

export interface TimeSeriesData {
  date: string
  value: number
  label?: string
}

export interface CategoryData {
  category: string
  value: number
  percentage?: number
}

// Analytics Filter Types
export interface AnalyticsFilters {
  dateRange: {
    startDate: string
    endDate: string
  }
  productIds?: number[]
  userIds?: string[]
  activityTypes?: string[]
  categories?: string[]
}

// Performance Metrics Types
export interface PerformanceMetrics {
  responseTime: number
  throughput: number
  errorRate: number
  availability: number
}
