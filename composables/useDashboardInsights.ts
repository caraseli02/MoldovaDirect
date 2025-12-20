import { formatCurrency, formatNumber, formatPercent, formatPercentSafe } from '~/utils/formatters'
import type { DashboardStats } from './useDashboardMetrics'

export interface BacklogItem {
  key: string
  label: string
  description: string
  count: number
  icon: string
  to: string
  tone: 'success' | 'warning' | 'error' | 'info' | 'neutral'
  cta: string
}

export interface InsightHighlight {
  key: string
  title: string
  description: string
  icon: string
  tone: 'success' | 'warning' | 'error' | 'info' | 'neutral'
  to?: string
  action?: string
  meta?: string
}

/**
 * Composable for dashboard insights, backlog items, and business intelligence
 */
export function useDashboardInsights(
  stats: Ref<DashboardStats | null>,
  activityGroups: Ref<Record<string, unknown[]>>,
) {
  /**
   * Count of orders requiring attention (pending + processing)
   */
  const ordersRequiringAttention = computed(() => {
    const data = stats.value
    return data ? (data.pendingOrders + data.processingOrders) : 0
  })

  /**
   * Generate operational backlog items for the sidebar
   */
  const backlogItems = computed<BacklogItem[]>(() => {
    const data = stats.value
    const groups = activityGroups.value

    return [
      {
        key: 'ordersAwaiting',
        label: 'Orders awaiting fulfillment',
        description: 'Queued shipments ready for picking and packing.',
        count: ordersRequiringAttention.value,
        icon: 'lucide:package',
        to: '/admin/orders',
        tone: ordersRequiringAttention.value > 0 ? 'warning' : 'neutral',
        cta: 'Open orders',
      },
      {
        key: 'inventoryAlerts',
        label: 'Inventory alerts',
        description: 'Low stock items that need a replenishment order.',
        count: data?.lowStockProducts || 0,
        icon: 'lucide:triangle-alert',
        to: '/admin/inventory',
        tone: (data?.lowStockProducts || 0) > 0 ? 'error' : 'success',
        cta: 'Review stock',
      },
      {
        key: 'catalogUpdates',
        label: 'Catalog updates requested',
        description: 'Pending product edits awaiting approval.',
        count: groups?.product_update?.length || 0,
        icon: 'lucide:sparkles',
        to: '/admin/products',
        tone: (groups?.product_update?.length || 0) > 0 ? 'info' : 'neutral',
        cta: 'Manage catalog',
      },
      {
        key: 'supportQueue',
        label: 'Support follow-ups',
        description: 'Customer tickets requiring responses.',
        count: groups?.support_ticket?.length || 0,
        icon: 'lucide:life-buoy',
        to: '/admin/users',
        tone: (groups?.support_ticket?.length || 0) > 0 ? 'info' : 'success',
        cta: 'Reply now',
      },
    ]
  })

  /**
   * Generate insight highlights for the dashboard
   */
  const insightHighlights = computed<InsightHighlight[]>(() => {
    const data = stats.value
    const insights: InsightHighlight[] = []

    if (!data) {
      return insights
    }

    // Revenue insight
    if (data.revenueToday === 0) {
      insights.push({
        key: 'no-sales',
        title: 'No sales logged today',
        description: 'You haven\'t made any sales yet. Promote your store to start seeing results.',
        icon: 'lucide:megaphone',
        tone: 'warning',
        to: '/admin/products',
        action: 'View products',
      })
    }
    else {
      insights.push({
        key: 'revenue',
        title: 'Revenue momentum',
        description: `Today's sales reached ${formatCurrency(data.revenueToday)} which is ${formatPercentSafe(data.revenueToday, data.revenue)} of this month's total. Keep the momentum with targeted upsells.`,
        icon: 'lucide:trending-up',
        tone: 'success',
        to: '/admin/analytics',
        action: 'Inspect analytics',
      })
    }

    // Customer acquisition insight
    if (data.newUsersToday > 0) {
      insights.push({
        key: 'growth',
        title: 'Customer acquisition spike',
        description: `${formatNumber(data.newUsersToday)} new customers signed up today. Follow up with onboarding campaigns to accelerate their first purchase.`,
        icon: 'lucide:user-plus',
        tone: 'info',
        to: '/admin/email-templates',
        action: 'Plan nurture email',
      })
    }
    else {
      insights.push({
        key: 'growth-flat',
        title: 'Acquisition flatline',
        description: 'No new customer sign-ups detected today. Activate promotions or outreach to reignite traffic.',
        icon: 'lucide:radar',
        tone: 'warning',
        to: '/admin/products',
        action: 'Boost acquisition',
      })
    }

    // Conversion health insight
    insights.push({
      key: 'conversion',
      title: 'Conversion health',
      description: `Storefront conversion is currently ${formatPercent(data.conversionRate)}. Explore checkout experiments to push beyond this baseline.`,
      icon: 'lucide:cursor-click',
      tone: data.conversionRate >= 2 ? 'success' : 'info',
      to: '/admin/analytics',
      action: 'Optimize funnel',
    })

    return insights
  })

  return {
    ordersRequiringAttention,
    backlogItems,
    insightHighlights,
  }
}
