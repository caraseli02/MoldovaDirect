/**
 * Admin Dashboard Store using Pinia
 * 
 * Requirements addressed:
 * - 3.1: Dashboard statistics management and display
 * - 6.4: Real-time data refresh functionality
 * 
 * Manages:
 * - Dashboard statistics (products, users, orders, revenue)
 * - Recent activity feed
 * - Real-time data refresh
 * - Loading and error states
 */

import { defineStore } from 'pinia'
import type { DashboardStats } from '~/server/api/admin/dashboard/stats.get'
import type { ActivityItem } from '~/server/api/admin/dashboard/activity.get'

interface AdminDashboardState {
  stats: DashboardStats | null
  recentActivity: ActivityItem[]
  loading: boolean
  statsLoading: boolean
  activityLoading: boolean
  error: string | null
  lastRefresh: Date | null
  autoRefreshInterval: number | null
}

export const useAdminDashboardStore = defineStore('adminDashboard', {
  state: (): AdminDashboardState => ({
    stats: null,
    recentActivity: [],
    loading: false,
    statsLoading: false,
    activityLoading: false,
    error: null,
    lastRefresh: null,
    autoRefreshInterval: null
  }),

  getters: {
    /**
     * Check if any data is currently loading
     */
    isLoading: (state): boolean => {
      return state.loading || state.statsLoading || state.activityLoading
    },

    /**
     * Get formatted revenue with currency
     */
    formattedRevenue: (state): string => {
      if (!state.stats) return '€0.00'
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR'
      }).format(state.stats.revenue)
    },

    /**
     * Get formatted today's revenue
     */
    formattedRevenueToday: (state): string => {
      if (!state.stats) return '€0.00'
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR'
      }).format(state.stats.revenueToday)
    },

    /**
     * Get conversion rate as percentage string
     */
    formattedConversionRate: (state): string => {
      if (!state.stats) return '0%'
      return `${state.stats.conversionRate.toFixed(1)}%`
    },

    /**
     * Check if data needs refresh (older than 5 minutes)
     */
    needsRefresh: (state): boolean => {
      if (!state.lastRefresh) return true
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      return state.lastRefresh < fiveMinutesAgo
    },

    /**
     * Get time since last refresh
     */
    timeSinceRefresh: (state): string => {
      if (!state.lastRefresh) return 'Never'
      
      const now = new Date()
      const diff = now.getTime() - state.lastRefresh.getTime()
      const minutes = Math.floor(diff / (1000 * 60))
      
      if (minutes < 1) return 'Just now'
      if (minutes === 1) return '1 minute ago'
      return `${minutes} minutes ago`
    },

    /**
     * Get recent activities grouped by type
     */
    activitiesByType: (state) => {
      const grouped: Record<string, ActivityItem[]> = {}
      
      state.recentActivity.forEach(activity => {
        if (!grouped[activity.type]) {
          grouped[activity.type] = []
        }
        grouped[activity.type].push(activity)
      })
      
      return grouped
    },

    /**
     * Get critical alerts (low stock, failed orders, etc.)
     */
    criticalAlerts: (state): ActivityItem[] => {
      return state.recentActivity.filter(activity => 
        activity.type === 'low_stock'
      )
    },

    /**
     * Get pending orders count
     */
    pendingOrdersCount: (state): number => {
      return state.stats?.pendingOrders ?? 0
    },

    /**
     * Get processing orders count
     */
    processingOrdersCount: (state): number => {
      return state.stats?.processingOrders ?? 0
    },

    /**
     * Get orders requiring attention (pending + processing)
     */
    ordersRequiringAttention: (state): number => {
      const pending = state.stats?.pendingOrders ?? 0
      const processing = state.stats?.processingOrders ?? 0
      return pending + processing
    },

    /**
     * Get formatted average order value
     */
    formattedAverageOrderValue: (state): string => {
      if (!state.stats) return '€0.00'
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR'
      }).format(state.stats.averageOrderValue)
    },

    /**
     * Get orders today count
     */
    ordersTodayCount: (state): number => {
      return state.stats?.ordersToday ?? 0
    }
  },

  actions: {
    /**
     * Set dashboard statistics (called by component after fetching)
     */
    setStats(data: DashboardStats) {
      this.stats = data
      this.lastRefresh = new Date()
      this.error = null
    },

    /**
     * Set recent activity (called by component after fetching)
     */
    setActivity(data: ActivityItem[]) {
      this.recentActivity = data
    },

    /**
     * Set error state
     */
    setError(error: string) {
      this.error = error
    },

    /**
     * Set loading states
     */
    setLoading(loading: boolean) {
      this.loading = loading
    },

    setStatsLoading(loading: boolean) {
      this.statsLoading = loading
    },

    setActivityLoading(loading: boolean) {
      this.activityLoading = loading
    },

    /**
     * Clear all data
     */
    clearData() {
      this.stats = null
      this.recentActivity = []
      this.error = null
      this.lastRefresh = null
    },

    /**
     * Clear error state
     */
    clearError() {
      this.error = null
    },

    /**
     * Update a specific stat (for real-time updates)
     */
    updateStat(key: keyof DashboardStats, value: any) {
      if (this.stats) {
        this.stats[key] = value
        this.stats.lastUpdated = new Date().toISOString()
      }
    },

    /**
     * Add new activity item (for real-time updates)
     */
    addActivity(activity: ActivityItem) {
      this.recentActivity.unshift(activity)

      // Keep only the 10 most recent activities
      if (this.recentActivity.length > 10) {
        this.recentActivity = this.recentActivity.slice(0, 10)
      }
    }
  }
})