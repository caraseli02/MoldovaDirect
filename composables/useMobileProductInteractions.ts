import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import type { Ref } from 'vue'
import { useDevice } from '~/composables/useDevice'
import { useHapticFeedback } from '~/composables/useHapticFeedback'
import { usePullToRefresh } from '~/composables/usePullToRefresh'
import { useSwipeGestures } from '~/composables/useSwipeGestures'

/**
 * Pagination handler interface
 */
export interface PaginationHandler {
  currentPage: number
  totalPages: number
  goToPage: (page: number) => void
}

/**
 * Composable for managing mobile-specific product interactions
 * Handles pull-to-refresh and swipe gestures for product pages
 *
 * Follows Single Responsibility Principle - only handles mobile interactions
 *
 * @example
 * ```vue
 * const { setup, cleanup, pullToRefresh } = useMobileProductInteractions(
 *   scrollContainer,
 *   refreshCallback,
 *   paginationHandler
 * )
 * ```
 */
export function useMobileProductInteractions(
  scrollContainer: Ref<HTMLElement | undefined>,
  refreshCallback: () => Promise<void>,
  paginationHandler: PaginationHandler
) {
  const { isMobile } = useDevice()
  const { vibrate } = useHapticFeedback()

  // Pull-to-refresh setup
  const pullToRefresh = usePullToRefresh(async () => {
    vibrate('pullRefresh')
    await refreshCallback()
  })

  // Swipe gestures setup
  const swipeGestures = useSwipeGestures()

  /**
   * Setup mobile interactions
   * Initializes pull-to-refresh and swipe gestures
   */
  const setup = () => {
    if (!isMobile.value || !scrollContainer.value) {
      console.debug('Mobile interactions skipped: not mobile or no container')
      return
    }

    // Setup pull-to-refresh
    pullToRefresh.setupPullToRefresh(scrollContainer.value)

    // Setup swipe gestures for pagination
    swipeGestures.setupSwipeListeners(scrollContainer.value)
    swipeGestures.setSwipeHandlers({
      onLeft: () => {
        // Swipe left to go to next page
        if (paginationHandler.currentPage < paginationHandler.totalPages) {
          paginationHandler.goToPage(paginationHandler.currentPage + 1)
        }
      },
      onRight: () => {
        // Swipe right to go to previous page
        if (paginationHandler.currentPage > 1) {
          paginationHandler.goToPage(paginationHandler.currentPage - 1)
        }
      }
    })

    console.debug('Mobile interactions setup complete')
  }

  /**
   * Cleanup mobile interactions
   * Removes event listeners and cleans up resources
   */
  const cleanup = () => {
    pullToRefresh.cleanupPullToRefresh()
    swipeGestures.cleanupSwipeListeners()
    console.debug('Mobile interactions cleanup complete')
  }

  return {
    // State
    pullToRefresh,
    swipeGestures,
    isMobile,

    // Methods
    setup,
    cleanup
  }
}
