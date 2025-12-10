import { computed } from 'vue'
import type { Ref } from 'vue'

/**
 * Pagination state interface
 */
export interface PaginationState {
  page: number
  limit: number
  total: number
  totalPages: number
}

/**
 * Composable for managing product pagination UI logic
 * Handles visible page numbers with ellipsis for large page counts
 *
 * @example
 * ```vue
 * const { visiblePages } = useProductPagination(pagination)
 * ```
 */
export function useProductPagination(pagination: Ref<PaginationState>) {
  /**
   * Calculate visible page numbers with ellipsis
   * Shows up to 7 page numbers with ellipsis for larger page counts
   *
   * Strategy:
   * - If total pages <= 7: Show all pages
   * - If total pages > 7: Show first, last, current, and neighbors with ellipsis
   *
   * Examples:
   * - [1, 2, 3, 4, 5, 6, 7] for 7 pages
   * - [1, ..., 5, 6, 7, ..., 20] for 20 pages with current = 6
   */
  const visiblePages = computed<(number | string)[]>(() => {
    const pages: (number | string)[] = []
    const total = pagination.value.totalPages
    const current = pagination.value.page

    // Show all pages if we have 7 or fewer
    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i)
      }
      return pages
    }

    // Always show first page
    pages.push(1)

    // Add ellipsis if current page is far from start
    if (current > 4) {
      pages.push('...')
    }

    // Calculate range around current page
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    // Add ellipsis if current page is far from end
    if (current < total - 3) {
      pages.push('...')
    }

    // Always show last page if we have more than 1 page
    if (total > 1) {
      pages.push(total)
    }

    return pages
  })

  /**
   * Check if we're on the first page
   */
  const isFirstPage = computed(() => pagination.value.page <= 1)

  /**
   * Check if we're on the last page
   */
  const isLastPage = computed(() => pagination.value.page >= pagination.value.totalPages)

  /**
   * Check if we have multiple pages
   */
  const hasMultiplePages = computed(() => pagination.value.totalPages > 1)

  /**
   * Get the current range of items being displayed
   */
  const currentRange = computed(() => {
    const start = (pagination.value.page - 1) * pagination.value.limit + 1
    const end = Math.min(pagination.value.page * pagination.value.limit, pagination.value.total || 0)
    return { start, end }
  })

  return {
    visiblePages,
    isFirstPage,
    isLastPage,
    hasMultiplePages,
    currentRange,
  }
}
