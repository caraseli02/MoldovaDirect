import type {
  TestResult,
  DatabaseStats,
  CustomDataConfig,
  ProgressState,
  CreatedUser,
} from '~/types/admin-testing'

// API Response interfaces - aligned with TestResult types
interface StatsResponse {
  stats: DatabaseStats
}

interface SeedDataResponse {
  success: boolean
  message: string
  users?: CreatedUser[]
  summary?: Record<string, unknown>
  errors?: Array<{ email?: string, error: string }>
  results?: Record<string, unknown>
}

interface CleanupResponse {
  success: boolean
  message: string
  users?: CreatedUser[]
  summary?: Record<string, unknown>
  errors?: Array<{ email?: string, error: string }>
  results?: Record<string, unknown>
}

// Helper to extract error message safely
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return getErrorMessage(error)
  if (typeof error === 'string') return error
  if (error && typeof error === 'object' && 'data' in error) {
    const data = (error as { data?: { message?: string } }).data
    if (data?.message) return data.message
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message?: string }).message)
  }
  return 'An unknown error occurred'
}

export const useTestingDashboard = () => {
  // State
  const loading = ref(false)
  const loadingStats = ref(false)
  const result = ref<TestResult | null>(null)
  const stats = ref<DatabaseStats | null>(null)
  const progress = ref<ProgressState>({
    active: false,
    percent: 0,
    message: '',
    cancellable: false,
  })

  // Database Statistics
  const refreshStats = async () => {
    loadingStats.value = true
    try {
      const response = await $fetch<StatsResponse>('/api/admin/stats')
      stats.value = response.stats
    }
    catch (err: unknown) {
      console.error('Failed to fetch stats:', getErrorMessage(err))
    }
    finally {
      loadingStats.value = false
    }
  }

  // Quick Actions
  const runQuickAction = async (preset: string, onComplete?: (response: SeedDataResponse) => void) => {
    loading.value = true
    result.value = null
    progress.value = {
      active: true,
      percent: 0,
      message: `Starting ${preset}...`,
      cancellable: false,
    }

    try {
      const response = await $fetch<SeedDataResponse>('/api/admin/seed-data', {
        method: 'POST',
        body: { preset },
      })

      progress.value.percent = 100
      progress.value.message = 'Complete!'
      result.value = {
        success: response.success,
        message: response.message,
        users: response.users ? [...response.users] : undefined,
        summary: response.summary,
        errors: response.errors,
        results: response.results,
      }

      if (onComplete) {
        onComplete(response)
      }

      await refreshStats()
    }
    catch (err: unknown) {
      result.value = {
        success: false,
        message: getErrorMessage(err) || 'Failed to run quick action',
        error: err,
        suggestion: getSuggestionFromError(err),
      }
    }
    finally {
      loading.value = false
      setTimeout(() => {
        progress.value.active = false
      }, 1000)
    }
  }

  // Data Cleanup
  const cleanup = async (action: string) => {
    if (!confirm(`Are you sure you want to ${action}? This cannot be undone.`)) {
      return
    }

    loading.value = true
    result.value = null

    try {
      const response = await $fetch<CleanupResponse>('/api/admin/cleanup', {
        method: 'POST',
        body: {
          action,
          confirm: true,
        },
      })

      result.value = {
        success: response.success,
        message: response.message,
        users: response.users ? [...response.users] : undefined,
        summary: response.summary,
        errors: response.errors,
        results: response.results,
      }
      await refreshStats()
    }
    catch (err: unknown) {
      result.value = {
        success: false,
        message: getErrorMessage(err) || 'Failed to cleanup data',
        error: err,
      }
    }
    finally {
      loading.value = false
    }
  }

  const quickDelete = async (action: string) => {
    if (!confirm(`Delete ${action}? This cannot be undone.`)) return

    loading.value = true
    result.value = null

    try {
      const response = await $fetch<CleanupResponse>('/api/admin/cleanup', {
        method: 'POST',
        body: { action, confirm: true },
      })

      result.value = {
        success: response.success,
        message: response.message,
        users: response.users ? [...response.users] : undefined,
        summary: response.summary,
        errors: response.errors,
        results: response.results,
      }
      await refreshStats()
    }
    catch (err: unknown) {
      result.value = {
        success: false,
        message: getErrorMessage(err) || 'Failed to delete data',
        error: err,
      }
    }
    finally {
      loading.value = false
    }
  }

  // User Creation
  const createUsers = async (config: {
    count: number
    roles: string[]
    withAddresses: boolean
    withOrders: boolean
  }) => {
    loading.value = true
    result.value = null
    progress.value = {
      active: true,
      percent: 0,
      message: 'Creating users...',
      cancellable: false,
    }

    try {
      const response = await $fetch<SeedDataResponse>('/api/admin/seed-users', {
        method: 'POST',
        body: config,
      })

      progress.value.percent = 100
      result.value = {
        success: response.success,
        message: response.message,
        users: response.users ? [...response.users] : undefined,
        summary: response.summary,
        errors: response.errors,
        results: response.results,
      }
      await refreshStats()
    }
    catch (err: unknown) {
      result.value = {
        success: false,
        message: getErrorMessage(err) || 'Failed to create users',
        error: err,
        suggestion: getSuggestionFromError(err),
      }
    }
    finally {
      loading.value = false
      setTimeout(() => {
        progress.value.active = false
      }, 1000)
    }
  }

  // Custom Data Generation
  const generateCustomData = async (customData: CustomDataConfig) => {
    loading.value = true
    result.value = null
    progress.value = {
      active: true,
      percent: 0,
      message: 'Generating custom data...',
      cancellable: false,
    }

    try {
      const response = await $fetch<SeedDataResponse>('/api/admin/seed-data', {
        method: 'POST',
        body: {
          preset: 'minimal',
          ...customData,
        },
      })

      progress.value.percent = 100
      result.value = {
        success: response.success,
        message: response.message,
        users: response.users ? [...response.users] : undefined,
        summary: response.summary,
        errors: response.errors,
        results: response.results,
      }
      await refreshStats()
    }
    catch (err: unknown) {
      result.value = {
        success: false,
        message: getErrorMessage(err) || 'Failed to generate data',
        error: err,
      }
    }
    finally {
      loading.value = false
      setTimeout(() => {
        progress.value.active = false
      }, 1000)
    }
  }

  // Error Handling
  const getSuggestionFromError = (error: unknown): string | undefined => {
    const message = getErrorMessage(error)

    if (message.includes('rate limit') || message.includes('429')) {
      return 'Wait a minute before trying again, or reduce the number of items.'
    }

    if (message.includes('not found') || message.includes('404')) {
      return 'Make sure the resource exists before performing this action.'
    }

    if (message.includes('permission') || message.includes('403')) {
      return 'Check your admin permissions and try again.'
    }

    return undefined
  }

  // Helpers
  const formatKey = (key: string) => {
    return key
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
  }

  const formatValue = (value: unknown): string => {
    if (Array.isArray(value)) return value.join(', ')
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    return String(value)
  }

  const clearResult = () => {
    result.value = null
  }

  return {
    // State
    loading: readonly(loading),
    loadingStats: readonly(loadingStats),
    result: readonly(result),
    stats: readonly(stats),
    progress: readonly(progress),

    // Methods
    refreshStats,
    runQuickAction,
    cleanup,
    quickDelete,
    createUsers,
    generateCustomData,
    clearResult,
    formatKey,
    formatValue,
  }
}
