interface PerformanceMetric {
  operation: string
  duration: number
  timestamp: number
  success: boolean
  itemCount?: number
  cacheHit?: boolean
}

export const useCartPerformance = () => {
  const metrics = ref<PerformanceMetric[]>([])
  const isMonitoring = ref(false)

  // Start performance monitoring
  const startMonitoring = () => {
    isMonitoring.value = true
  }

  // Stop performance monitoring
  const stopMonitoring = () => {
    isMonitoring.value = false
  }

  // Measure operation performance
  const measureOperation = async <T>(
    operation: string,
    fn: () => Promise<T>,
    metadata?: { itemCount?: number; cacheHit?: boolean }
  ): Promise<T> => {
    if (!isMonitoring.value) {
      return await fn()
    }

    const startTime = performance.now()
    let success = true
    let result: T

    try {
      result = await fn()
      return result
    } catch (error) {
      success = false
      throw error
    } finally {
      const endTime = performance.now()
      const duration = endTime - startTime

      metrics.value.push({
        operation,
        duration,
        timestamp: Date.now(),
        success,
        ...metadata
      })

      // Keep only last 100 metrics to prevent memory leaks
      if (metrics.value.length > 100) {
        metrics.value = metrics.value.slice(-100)
      }

      // Log slow operations (> 500ms)
      if (duration > 500) {
        console.warn(`Slow cart operation detected: ${operation} took ${duration.toFixed(2)}ms`)
      }
    }
  }

  // Get performance statistics
  const getPerformanceStats = () => {
    if (metrics.value.length === 0) {
      return null
    }

    const operations = metrics.value.reduce((acc, metric) => {
      if (!acc[metric.operation]) {
        acc[metric.operation] = {
          count: 0,
          totalDuration: 0,
          successCount: 0,
          avgDuration: 0,
          minDuration: Infinity,
          maxDuration: 0
        }
      }

      const op = acc[metric.operation]
      op.count++
      op.totalDuration += metric.duration
      op.successCount += metric.success ? 1 : 0
      op.avgDuration = op.totalDuration / op.count
      op.minDuration = Math.min(op.minDuration, metric.duration)
      op.maxDuration = Math.max(op.maxDuration, metric.duration)

      return acc
    }, {} as Record<string, any>)

    return {
      totalOperations: metrics.value.length,
      operations,
      overallAvgDuration: metrics.value.reduce((sum, m) => sum + m.duration, 0) / metrics.value.length,
      successRate: (metrics.value.filter(m => m.success).length / metrics.value.length) * 100
    }
  }

  // Clear metrics
  const clearMetrics = () => {
    metrics.value = []
  }

  // Get slow operations (> threshold)
  const getSlowOperations = (threshold = 500) => {
    return metrics.value.filter(metric => metric.duration > threshold)
  }

  // Export metrics for analysis
  const exportMetrics = () => {
    const stats = getPerformanceStats()
    const slowOps = getSlowOperations()
    
    return {
      timestamp: new Date().toISOString(),
      stats,
      slowOperations: slowOps,
      rawMetrics: metrics.value
    }
  }

  // Performance recommendations based on metrics
  const getPerformanceRecommendations = () => {
    const stats = getPerformanceStats()
    if (!stats) return []

    const recommendations: string[] = []

    // Check for slow operations
    Object.entries(stats.operations).forEach(([operation, data]: [string, any]) => {
      if (data.avgDuration > 300) {
        recommendations.push(`Consider optimizing ${operation} operation (avg: ${data.avgDuration.toFixed(2)}ms)`)
      }
    })

    // Check success rate
    if (stats.successRate < 95) {
      recommendations.push(`Low success rate detected (${stats.successRate.toFixed(1)}%). Check error handling.`)
    }

    // Check for cache effectiveness
    const cacheHitRate = metrics.value.filter(m => m.cacheHit).length / metrics.value.length * 100
    if (cacheHitRate < 50) {
      recommendations.push(`Low cache hit rate (${cacheHitRate.toFixed(1)}%). Consider improving caching strategy.`)
    }

    return recommendations
  }

  return {
    // State
    metrics: readonly(metrics),
    isMonitoring: readonly(isMonitoring),

    // Methods
    startMonitoring,
    stopMonitoring,
    measureOperation,
    getPerformanceStats,
    clearMetrics,
    getSlowOperations,
    exportMetrics,
    getPerformanceRecommendations
  }
}