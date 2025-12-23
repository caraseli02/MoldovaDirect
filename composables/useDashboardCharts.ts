import { subDays } from 'date-fns'
import { formatCurrency, formatNumber, formatDelta, resolveDirection } from '~/utils/formatters'
import type { DashboardStats } from './useDashboardMetrics'

export interface ComparisonDataset {
  categories: string[]
  revenueSeries: number[]
  customerSeries: number[]
  revenueAverage: number
  customerAverage: number
  revenueToday: number
  newUsersToday: number
}

export interface ChartSummary {
  value: string
  delta: string
  caption: string
  direction: 'up' | 'down' | 'flat'
}

/**
 * Composable for dashboard chart data and summaries
 */
export function useDashboardCharts(stats: Ref<DashboardStats | null>) {
  const CHART_DAYS = 7

  /**
   * Generate comparison dataset for the performance chart
   */
  const comparisonDataset = computed<ComparisonDataset>(() => {
    const categories: string[] = []
    const revenueSeries: number[] = []
    const customerSeries: number[] = []

    const data = stats.value
    const today = new Date()

    const revenueToday = data?.revenueToday ?? 0
    const totalRevenue = data?.revenue ?? 0
    const historicRevenue = Math.max(totalRevenue - revenueToday, 0)
    const revenueAverage = CHART_DAYS > 1 ? historicRevenue / (CHART_DAYS - 1) : 0

    const newUsersToday = data?.newUsersToday ?? 0
    const activeUsers = data?.activeUsers ?? 0
    const historicCustomers = Math.max(activeUsers - newUsersToday, 0)
    const customerAverage = CHART_DAYS > 1 ? historicCustomers / (CHART_DAYS - 1) : 0

    // Native formatter for day of week
    const dayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'short' })

    for (let index = CHART_DAYS - 1; index >= 0; index--) {
      const date = subDays(today, index)
      categories.push(dayFormatter.format(date))

      if (index === 0) {
        revenueSeries.push(Math.round(revenueToday))
        customerSeries.push(Math.round(newUsersToday))
      }
      else {
        const weight = 0.7 + ((CHART_DAYS - 1 - index) / (CHART_DAYS - 1)) * 0.2
        revenueSeries.push(Math.round(revenueAverage * weight))
        customerSeries.push(Math.round(customerAverage * weight))
      }
    }

    return {
      categories,
      revenueSeries,
      customerSeries,
      revenueAverage,
      customerAverage,
      revenueToday,
      newUsersToday,
    }
  })

  /**
   * Revenue summary for chart header
   */
  const revenueSummary = computed<ChartSummary>(() => {
    const dataset = comparisonDataset.value
    const average = dataset.revenueAverage || 0
    const todayValue = dataset.revenueToday || 0
    const delta = average ? ((todayValue - average) / average) * 100 : 0

    return {
      value: formatCurrency(todayValue),
      delta: formatDelta(delta),
      caption: average ? `Average daily revenue ${formatCurrency(average)}` : 'Awaiting sales data',
      direction: resolveDirection(delta),
    }
  })

  /**
   * Customer summary for chart header
   */
  const customerSummary = computed<ChartSummary>(() => {
    const dataset = comparisonDataset.value
    const average = dataset.customerAverage || 0
    const todayValue = dataset.newUsersToday || 0
    const delta = average ? ((todayValue - average) / average) * 100 : 0

    return {
      value: `${formatNumber(todayValue)} new customers`,
      delta: formatDelta(delta),
      caption: average ? `Average daily sign-ups ${formatNumber(Math.round(average))}` : 'Awaiting sign-up data',
      direction: resolveDirection(delta),
    }
  })

  return {
    comparisonDataset,
    revenueSummary,
    customerSummary,
  }
}
