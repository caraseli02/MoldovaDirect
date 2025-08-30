/**
 * Admin Dashboard Tests
 * 
 * Tests for the admin dashboard functionality including:
 * - Dashboard statistics API
 * - Recent activity API
 * - Dashboard store
 * - Dashboard components
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAdminDashboardStore } from '~/stores/adminDashboard'
import type { DashboardStats } from '~/server/api/admin/dashboard/stats.get'
import type { ActivityItem } from '~/server/api/admin/dashboard/activity.get'

// Mock $fetch
const mockFetch = vi.fn()
global.$fetch = mockFetch

describe('Admin Dashboard Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('Dashboard Statistics', () => {
    it('should fetch dashboard stats successfully', async () => {
      const mockStats: DashboardStats = {
        totalProducts: 150,
        activeProducts: 140,
        lowStockProducts: 5,
        totalUsers: 1200,
        activeUsers: 360,
        newUsersToday: 12,
        totalOrders: 450,
        revenue: 25000.50,
        revenueToday: 1250.75,
        conversionRate: 37.5,
        lastUpdated: new Date().toISOString()
      }

      mockFetch.mockResolvedValueOnce({
        success: true,
        data: mockStats
      })

      const store = useAdminDashboardStore()
      await store.fetchStats()

      expect(mockFetch).toHaveBeenCalledWith('/api/admin/dashboard/stats')
      expect(store.stats).toEqual(mockStats)
      expect(store.statsLoading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('should handle stats fetch error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Failed to fetch stats'))

      const store = useAdminDashboardStore()
      await store.fetchStats()

      expect(store.stats).toBeNull()
      expect(store.error).toBe('Failed to fetch stats')
      expect(store.statsLoading).toBe(false)
    })

    it('should format revenue correctly', () => {
      const store = useAdminDashboardStore()
      store.stats = {
        totalProducts: 100,
        activeProducts: 95,
        lowStockProducts: 2,
        totalUsers: 500,
        activeUsers: 150,
        newUsersToday: 5,
        totalOrders: 200,
        revenue: 12345.67,
        revenueToday: 234.56,
        conversionRate: 40.0,
        lastUpdated: new Date().toISOString()
      }

      expect(store.formattedRevenue).toBe('€12,345.67')
      expect(store.formattedRevenueToday).toBe('€234.56')
      expect(store.formattedConversionRate).toBe('40.0%')
    })
  })

  describe('Recent Activity', () => {
    it('should fetch recent activity successfully', async () => {
      const mockActivity: ActivityItem[] = [
        {
          id: 'user_123',
          type: 'user_registration',
          title: 'New User Registration',
          description: 'John Doe joined the platform',
          timestamp: new Date().toISOString(),
          metadata: { userId: '123', userName: 'John Doe' }
        },
        {
          id: 'order_456',
          type: 'new_order',
          title: 'New Order',
          description: 'Order #ORD-456 for €125.50',
          timestamp: new Date().toISOString(),
          metadata: { orderId: 456, orderNumber: 'ORD-456', total: 125.50 }
        }
      ]

      mockFetch.mockResolvedValueOnce({
        success: true,
        data: mockActivity
      })

      const store = useAdminDashboardStore()
      await store.fetchActivity()

      expect(mockFetch).toHaveBeenCalledWith('/api/admin/dashboard/activity')
      expect(store.recentActivity).toEqual(mockActivity)
      expect(store.activityLoading).toBe(false)
    })

    it('should handle activity fetch error gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Failed to fetch activity'))

      const store = useAdminDashboardStore()
      await store.fetchActivity()

      expect(store.recentActivity).toEqual([])
      expect(store.activityLoading).toBe(false)
      // Activity errors should not set the main error state
      expect(store.error).toBeNull()
    })

    it('should group activities by type', () => {
      const store = useAdminDashboardStore()
      store.recentActivity = [
        {
          id: 'user_1',
          type: 'user_registration',
          title: 'New User',
          description: 'User 1',
          timestamp: new Date().toISOString()
        },
        {
          id: 'user_2',
          type: 'user_registration',
          title: 'New User',
          description: 'User 2',
          timestamp: new Date().toISOString()
        },
        {
          id: 'order_1',
          type: 'new_order',
          title: 'New Order',
          description: 'Order 1',
          timestamp: new Date().toISOString()
        },
        {
          id: 'stock_1',
          type: 'low_stock',
          title: 'Low Stock',
          description: 'Product low stock',
          timestamp: new Date().toISOString()
        }
      ]

      const grouped = store.activitiesByType
      expect(grouped.user_registration).toHaveLength(2)
      expect(grouped.new_order).toHaveLength(1)
      expect(grouped.low_stock).toHaveLength(1)
    })

    it('should identify critical alerts', () => {
      const store = useAdminDashboardStore()
      store.recentActivity = [
        {
          id: 'user_1',
          type: 'user_registration',
          title: 'New User',
          description: 'User registered',
          timestamp: new Date().toISOString()
        },
        {
          id: 'stock_1',
          type: 'low_stock',
          title: 'Low Stock Alert',
          description: 'Product running low',
          timestamp: new Date().toISOString()
        },
        {
          id: 'stock_2',
          type: 'low_stock',
          title: 'Low Stock Alert',
          description: 'Another product low',
          timestamp: new Date().toISOString()
        }
      ]

      const alerts = store.criticalAlerts
      expect(alerts).toHaveLength(2)
      expect(alerts.every(alert => alert.type === 'low_stock')).toBe(true)
    })
  })

  describe('Auto-refresh functionality', () => {
    it('should start and stop auto-refresh', () => {
      const store = useAdminDashboardStore()
      
      // Mock setInterval and clearInterval
      const mockSetInterval = vi.fn(() => 123)
      const mockClearInterval = vi.fn()
      global.setInterval = mockSetInterval
      global.clearInterval = mockClearInterval

      // Start auto-refresh
      store.startAutoRefresh(1) // 1 minute for testing
      expect(mockSetInterval).toHaveBeenCalledWith(expect.any(Function), 60000)
      expect(store.autoRefreshInterval).toBe(123)

      // Stop auto-refresh
      store.stopAutoRefresh()
      expect(mockClearInterval).toHaveBeenCalledWith(123)
      expect(store.autoRefreshInterval).toBeNull()
    })

    it('should detect when data needs refresh', () => {
      const store = useAdminDashboardStore()
      
      // No last refresh - needs refresh
      expect(store.needsRefresh).toBe(true)
      
      // Recent refresh - doesn't need refresh
      store.lastRefresh = new Date()
      expect(store.needsRefresh).toBe(false)
      
      // Old refresh - needs refresh
      store.lastRefresh = new Date(Date.now() - 10 * 60 * 1000) // 10 minutes ago
      expect(store.needsRefresh).toBe(true)
    })
  })

  describe('Data management', () => {
    it('should update individual stats', async () => {
      const store = useAdminDashboardStore()
      const originalTimestamp = new Date().toISOString()
      store.stats = {
        totalProducts: 100,
        activeProducts: 95,
        lowStockProducts: 2,
        totalUsers: 500,
        activeUsers: 150,
        newUsersToday: 5,
        totalOrders: 200,
        revenue: 12000,
        revenueToday: 200,
        conversionRate: 40.0,
        lastUpdated: originalTimestamp
      }

      // Add small delay to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 1))
      
      store.updateStat('totalProducts', 101)
      expect(store.stats.totalProducts).toBe(101)
      expect(store.stats.lastUpdated).not.toBe(originalTimestamp) // Should be updated
    })

    it('should add new activity items', () => {
      const store = useAdminDashboardStore()
      
      // Fill with 10 activities
      for (let i = 0; i < 10; i++) {
        store.recentActivity.push({
          id: `activity_${i}`,
          type: 'user_registration',
          title: `Activity ${i}`,
          description: `Description ${i}`,
          timestamp: new Date().toISOString()
        })
      }

      // Add new activity - should be at the beginning and limit to 10
      const newActivity: ActivityItem = {
        id: 'new_activity',
        type: 'new_order',
        title: 'New Activity',
        description: 'New description',
        timestamp: new Date().toISOString()
      }

      store.addActivity(newActivity)
      
      expect(store.recentActivity).toHaveLength(10)
      expect(store.recentActivity[0]).toEqual(newActivity)
    })

    it('should clear all data', () => {
      const store = useAdminDashboardStore()
      
      // Set some data
      store.stats = {
        totalProducts: 100,
        activeProducts: 95,
        lowStockProducts: 2,
        totalUsers: 500,
        activeUsers: 150,
        newUsersToday: 5,
        totalOrders: 200,
        revenue: 12000,
        revenueToday: 200,
        conversionRate: 40.0,
        lastUpdated: new Date().toISOString()
      }
      store.recentActivity = [
        {
          id: 'test',
          type: 'user_registration',
          title: 'Test',
          description: 'Test',
          timestamp: new Date().toISOString()
        }
      ]
      store.error = 'Test error'
      store.lastRefresh = new Date()

      // Clear data
      store.clearData()

      expect(store.stats).toBeNull()
      expect(store.recentActivity).toEqual([])
      expect(store.error).toBeNull()
      expect(store.lastRefresh).toBeNull()
    })
  })
})