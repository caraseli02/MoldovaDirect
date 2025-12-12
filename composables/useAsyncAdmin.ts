import { h, defineComponent, defineAsyncComponent } from 'vue'
import type { DefineComponent } from 'vue'

/**
 * Composable for lazy loading admin components with loading states and error handling
 *
 * Features:
 * - Lazy loads components to reduce main bundle size
 * - Shows loading skeleton during component load
 * - Handles errors gracefully with error component
 * - Configurable delay and timeout
 * - Preserves TypeScript types
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * const AdminDashboard = useAsyncAdminComponent('Dashboard/Overview')
 * </script>
 *
 * <template>
 *   <AdminDashboard />
 * </template>
 * ```
 */

interface AsyncAdminOptions {
  /** Delay before showing loading component (ms) */
  delay?: number
  /** Timeout for component loading (ms) */
  timeout?: number
  /** Show custom loading component */
  showLoading?: boolean
  /** Show custom error component */
  showError?: boolean
}

/**
 * Load admin component asynchronously with loading and error states
 *
 * @param path - Path to component relative to ~/components/admin/ (without .vue extension)
 * @param options - Configuration options
 * @returns Async component with loading and error handling
 */
export const useAsyncAdminComponent = (
  path: string,
  options: AsyncAdminOptions = {},
): Component => {
  const {
    delay = 200,
    timeout = 3000,
    showLoading = true,
    showError = true,
  } = options

  return defineAsyncComponent({
    loader: async (): Promise<Component> => {
      // Use dynamic import with explicit path pattern for Vite
      const modules: Record<string, () => Promise<unknown>> = {
        'Email/TemplateManager': () => import('~/components/admin/Email/TemplateManager.vue'),
        'Email/TemplateHistory': () => import('~/components/admin/Email/TemplateHistory.vue'),
        'Email/TemplateSynchronizer': () => import('~/components/admin/Email/TemplateSynchronizer.vue'),
        'Email/DeliveryStats': () => import('~/components/admin/Email/DeliveryStats.vue'),
        'Email/LogsTable': () => import('~/components/admin/Email/LogsTable.vue'),
        'Dashboard/Overview': () => import('~/components/admin/Dashboard/Overview.vue'),
        'Dashboard/Stats': () => import('~/components/admin/Dashboard/Stats.vue'),
        'Dashboard/AnalyticsOverview': () => import('~/components/admin/Dashboard/AnalyticsOverview.vue'),
        'Inventory/Reports': () => import('~/components/admin/Inventory/Reports.vue'),
        'Inventory/Movements': () => import('~/components/admin/Inventory/Movements.vue'),
        'Products/Form': () => import('~/components/admin/Products/Form.vue'),
        'Products/Filters': () => import('~/components/admin/Products/Filters.vue'),
        'Products/Table': () => import('~/components/admin/Products/Table.vue'),
        'Orders/Filters': () => import('~/components/admin/Orders/Filters.vue'),
        'Orders/BulkActions': () => import('~/components/admin/Orders/BulkActions.vue'),
        'Orders/ListItem': () => import('~/components/admin/Orders/ListItem.vue'),
        'Utils/Pagination': () => import('~/components/admin/Utils/Pagination.vue'),
        'Utils/BulkOperationsBar': () => import('~/components/admin/Utils/BulkOperationsBar.vue'),
        'Users/Table': () => import('~/components/admin/Users/Table.vue'),
        'Users/DetailView': () => import('~/components/admin/Users/DetailView.vue'),
      }

      const loader = modules[path]
      if (!loader) {
        throw new Error(`Unknown admin component: ${path}`)
      }
      return loader() as any
    },

    // Loading component - simple skeleton with pulse animation
    loadingComponent: showLoading
      ? defineComponent({
          name: 'AdminAsyncLoading',
          setup() {
            return () => h('div', {
              class: 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg p-4 min-h-[200px] flex items-center justify-center',
            }, [
              h('div', {
                class: 'text-gray-500 dark:text-gray-400 text-sm',
              }, 'Loading component...'),
            ])
          },
        })
      : undefined,

    // Error component - shows friendly error message
    errorComponent: showError
      ? defineComponent({
          name: 'AdminAsyncError',
          props: {
            error: {
              type: Error,
              required: false,
            },
          },
          setup() {
            const retryLoad = () => {
              // Force page reload to retry loading
              window.location.reload()
            }

            return () => h('div', {
              class: 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6',
            }, [
              h('div', { class: 'flex items-start' }, [
                h('div', { class: 'flex-shrink-0' }, [
                  h('svg', {
                    class: 'h-6 w-6 text-red-600 dark:text-red-400',
                    fill: 'none',
                    viewBox: '0 0 24 24',
                    stroke: 'currentColor',
                  }, [
                    h('path', {
                      'stroke-linecap': 'round',
                      'stroke-linejoin': 'round',
                      'stroke-width': '2',
                      'd': 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
                    }),
                  ]),
                ]),
                h('div', { class: 'ml-3 flex-1' }, [
                  h('h3', {
                    class: 'text-sm font-medium text-red-800 dark:text-red-200',
                  }, 'Failed to load component'),
                  h('p', {
                    class: 'mt-2 text-sm text-red-700 dark:text-red-300',
                  }, `Component "${path}" could not be loaded. This might be due to a network issue or the component file is missing.`),
                  h('div', { class: 'mt-4' }, [
                    h('button', {
                      type: 'button',
                      class: 'inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500',
                      onClick: retryLoad,
                    }, 'Reload Page'),
                  ]),
                ]),
              ]),
            ])
          },
        })
      : undefined,

    // Delay before showing loading component (prevents flash for fast loads)
    delay,

    // Timeout for loading component
    timeout,

    // Handle errors during loading
    onError(error, retry, fail) {
      console.error(`Failed to load admin component: ${path}`, error)
      // Don't retry automatically, show error component instead
      fail()
    },
  })
}

/**
 * Preload admin component for better UX
 * Use this to preload components that will likely be needed soon
 *
 * @param path - Path to component relative to ~/components/admin/
 *
 * @example
 * ```ts
 * // Preload component on hover or other user interaction
 * const preloadDashboard = () => {
 *   preloadAdminComponent('Dashboard/Overview')
 * }
 * ```
 */
export const preloadAdminComponent = async (path: string): Promise<void> => {
  try {
    // Use the same module mapping as useAsyncAdminComponent
    const modules: Record<string, () => Promise<unknown>> = {
      'Email/TemplateManager': () => import('~/components/admin/Email/TemplateManager.vue'),
      'Email/TemplateHistory': () => import('~/components/admin/Email/TemplateHistory.vue'),
      'Email/TemplateSynchronizer': () => import('~/components/admin/Email/TemplateSynchronizer.vue'),
      'Email/DeliveryStats': () => import('~/components/admin/Email/DeliveryStats.vue'),
      'Email/LogsTable': () => import('~/components/admin/Email/LogsTable.vue'),
      'Dashboard/Overview': () => import('~/components/admin/Dashboard/Overview.vue'),
      'Dashboard/Stats': () => import('~/components/admin/Dashboard/Stats.vue'),
      'Dashboard/AnalyticsOverview': () => import('~/components/admin/Dashboard/AnalyticsOverview.vue'),
      'Inventory/Reports': () => import('~/components/admin/Inventory/Reports.vue'),
      'Inventory/Movements': () => import('~/components/admin/Inventory/Movements.vue'),
      'Products/Form': () => import('~/components/admin/Products/Form.vue'),
      'Products/Filters': () => import('~/components/admin/Products/Filters.vue'),
      'Products/Table': () => import('~/components/admin/Products/Table.vue'),
      'Users/Table': () => import('~/components/admin/Users/Table.vue'),
      'Users/DetailView': () => import('~/components/admin/Users/DetailView.vue'),
      'Orders/Filters': () => import('~/components/admin/Orders/Filters.vue'),
      'Orders/BulkActions': () => import('~/components/admin/Orders/BulkActions.vue'),
      'Orders/ListItem': () => import('~/components/admin/Orders/ListItem.vue'),
      'Utils/Pagination': () => import('~/components/admin/Utils/Pagination.vue'),
      'Utils/BulkOperationsBar': () => import('~/components/admin/Utils/BulkOperationsBar.vue'),
    }

    const loader = modules[path]
    if (loader) {
      await loader()
    }
  }
  catch (error: any) {
    console.warn(`Failed to preload admin component: ${path}`, error)
  }
}

/**
 * Create a loading skeleton component for admin sections
 *
 * @param height - Height of skeleton (default: 200px)
 * @returns Loading skeleton component
 */
export const createAdminSkeleton = (height: string = '200px') => {
  return defineComponent({
    name: 'AdminSkeleton',
    setup() {
      return () => h('div', {
        class: 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg',
        style: { minHeight: height },
      })
    },
  })
}

/**
 * Batch preload multiple admin components
 * Useful for preloading components needed for a specific admin section
 *
 * @param paths - Array of component paths to preload
 *
 * @example
 * ```ts
 * // Preload all dashboard components
 * batchPreloadAdminComponents([
 *   'Dashboard/Overview',
 *   'Dashboard/Stats',
 *   'Dashboard/AnalyticsOverview'
 * ])
 * ```
 */
export const batchPreloadAdminComponents = async (paths: string[]): Promise<void> => {
  await Promise.allSettled(
    paths.map(path => preloadAdminComponent(path)),
  )
}
