import { formatCurrency, formatNumber } from '~/utils/formatters'

export interface DashboardStats {
  revenue: number
  revenueToday: number
  totalOrders: number
  ordersToday: number
  pendingOrders: number
  processingOrders: number
  shippedOrders: number
  deliveredOrders: number
  activeProducts: number
  lowStockProducts: number
  activeUsers: number
  newUsersToday: number
  conversionRate: number
  averageOrderValue: number
}

export interface MetricCard {
  key: string
  label: string
  value: string
  subtext: string
  icon: string
  trend: 'up' | 'down' | 'flat'
  variant: 'success' | 'warning' | 'info' | 'neutral'
  meta: string
  metaClass: string
  footerLabel: string
  footerValue: string
  footerClass: string
  progress: number
  progressClass: string
}

/**
 * Composable for dashboard metric cards and KPI calculations
 */
export function useDashboardMetrics(stats: Ref<DashboardStats | null>) {
  /**
   * Calculate revenue share percentage
   */
  const revenueShare = computed(() => {
    const data = stats.value
    if (!data || data.revenue <= 0) return 0
    return Math.min(100, Math.round((data.revenueToday / data.revenue) * 100))
  })

  /**
   * Calculate inventory health percentage
   */
  const inventoryHealth = computed(() => {
    const data = stats.value
    if (!data || data.activeProducts <= 0) return 100
    return Math.min(100, Math.round((1 - (data.lowStockProducts / data.activeProducts)) * 100))
  })

  /**
   * Count of orders requiring attention (pending + processing)
   */
  const ordersRequiringAttention = computed(() => {
    const data = stats.value
    return data ? (data.pendingOrders + data.processingOrders) : 0
  })

  /**
   * Calculate fulfillment progress percentage
   */
  const fulfillmentProgress = computed(() => {
    const data = stats.value
    if (!data || data.totalOrders <= 0) return 0
    return Math.min(100, Math.round(((data.shippedOrders + data.deliveredOrders) / data.totalOrders) * 100))
  })

  /**
   * Generate highlight cards for the dashboard metrics grid
   */
  const highlightCards = computed<MetricCard[]>(() => {
    const data = stats.value

    return [
      {
        key: 'revenueToday',
        label: 'Revenue Today',
        value: data ? formatCurrency(data.revenueToday) : '€0.00',
        subtext: 'Real-time sales intake',
        icon: 'lucide:wallet',
        trend: data && data.revenueToday > 0 ? 'up' : 'flat',
        variant: data && data.revenueToday > 0 ? 'success' : 'neutral',
        meta: revenueShare.value ? `${revenueShare.value}% of monthly` : 'Awaiting orders',
        metaClass: revenueShare.value ? 'text-green-500' : 'text-gray-400',
        footerLabel: 'Monthly baseline',
        footerValue: data ? formatCurrency(data.revenue) : '€0.00',
        footerClass: 'text-blue-500',
        progress: revenueShare.value,
        progressClass: 'bg-green-500'
      },
      {
        key: 'ordersToday',
        label: 'Orders Today',
        value: data ? formatNumber(data.ordersToday) : '0',
        subtext: 'New orders received',
        icon: 'lucide:shopping-bag',
        trend: data && data.ordersToday > 0 ? 'up' : 'flat',
        variant: data && data.ordersToday > 0 ? 'success' : 'neutral',
        meta: data ? `${formatNumber(ordersRequiringAttention.value)} need attention` : 'No pending orders',
        metaClass: ordersRequiringAttention.value > 0 ? 'text-yellow-500' : 'text-green-500',
        footerLabel: 'Average order value',
        footerValue: data ? formatCurrency(data.averageOrderValue) : '€0.00',
        footerClass: 'text-blue-500',
        progress: data && data.totalOrders > 0
          ? Math.min(100, Math.round((data.ordersToday / data.totalOrders) * 100 * 30))
          : 0,
        progressClass: 'bg-green-500'
      },
      {
        key: 'orderFulfillment',
        label: 'Order Fulfillment',
        value: data ? formatNumber(ordersRequiringAttention.value) : '0',
        subtext: 'Orders awaiting action',
        icon: 'lucide:package',
        trend: ordersRequiringAttention.value > 0 ? 'flat' : 'up',
        variant: ordersRequiringAttention.value > 5 ? 'warning' : ordersRequiringAttention.value > 0 ? 'info' : 'success',
        meta: data ? `${formatNumber(data.shippedOrders)} shipped today` : 'No shipments',
        metaClass: data && data.shippedOrders > 0 ? 'text-green-500' : 'text-gray-400',
        footerLabel: 'Fulfillment rate',
        footerValue: `${fulfillmentProgress.value}%`,
        footerClass: fulfillmentProgress.value >= 80 ? 'text-green-500' : 'text-yellow-400',
        progress: fulfillmentProgress.value,
        progressClass: fulfillmentProgress.value >= 80 ? 'bg-green-500' : 'bg-yellow-400'
      },
      {
        key: 'inventoryHealth',
        label: 'Inventory Health',
        value: data ? formatNumber(Math.max(0, data.activeProducts - data.lowStockProducts)) : '0',
        subtext: 'Sellable SKUs in stock',
        icon: 'lucide:shield-check',
        trend: data
          ? (data.lowStockProducts > 0 ? 'flat' : 'up')
          : 'flat',
        variant: data
          ? (data.lowStockProducts > 0 ? 'warning' : 'success')
          : 'neutral',
        meta: data ? `${formatNumber(data.lowStockProducts)} low stock alerts` : 'Monitoring stock levels',
        metaClass: data && data.lowStockProducts > 0 ? 'text-yellow-400' : 'text-green-500',
        footerLabel: 'Inventory health',
        footerValue: `${inventoryHealth.value}%`,
        footerClass: inventoryHealth.value >= 80 ? 'text-green-500' : 'text-yellow-400',
        progress: inventoryHealth.value,
        progressClass: inventoryHealth.value >= 80 ? 'bg-green-500' : 'bg-yellow-400'
      }
    ]
  })

  return {
    revenueShare,
    inventoryHealth,
    ordersRequiringAttention,
    fulfillmentProgress,
    highlightCards
  }
}
