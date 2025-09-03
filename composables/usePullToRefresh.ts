/**
 * Pull-to-refresh composable for mobile product listings
 * Provides touch-based pull-to-refresh functionality
 */
export const usePullToRefresh = (onRefresh: () => Promise<void> | void) => {
  const isRefreshing = ref(false)
  const pullDistance = ref(0)
  const isPulling = ref(false)
  const canRefresh = ref(false)
  
  const PULL_THRESHOLD = 80 // Distance needed to trigger refresh
  const MAX_PULL_DISTANCE = 120 // Maximum pull distance
  
  let startY = 0
  let currentY = 0
  let scrollElement: HTMLElement | null = null
  
  // Check if element is at top and can be pulled
  const canPull = (element: HTMLElement): boolean => {
    return element.scrollTop === 0
  }
  
  // Handle touch start
  const handleTouchStart = (event: TouchEvent) => {
    if (!scrollElement || !canPull(scrollElement)) return
    
    startY = event.touches[0].clientY
    isPulling.value = false
    pullDistance.value = 0
  }
  
  // Handle touch move
  const handleTouchMove = (event: TouchEvent) => {
    if (!scrollElement || !canPull(scrollElement) || isRefreshing.value) return
    
    currentY = event.touches[0].clientY
    const deltaY = currentY - startY
    
    if (deltaY > 0) {
      // Prevent default scrolling when pulling down
      event.preventDefault()
      
      isPulling.value = true
      
      // Calculate pull distance with resistance
      const resistance = 0.5
      pullDistance.value = Math.min(deltaY * resistance, MAX_PULL_DISTANCE)
      
      // Check if we've pulled far enough to trigger refresh
      canRefresh.value = pullDistance.value >= PULL_THRESHOLD
      
      // Haptic feedback when threshold is reached
      if (canRefresh.value && pullDistance.value >= PULL_THRESHOLD && pullDistance.value < PULL_THRESHOLD + 5) {
        triggerHapticFeedback('light')
      }
    }
  }
  
  // Handle touch end
  const handleTouchEnd = () => {
    if (!isPulling.value) return
    
    if (canRefresh.value && !isRefreshing.value) {
      triggerRefresh()
    } else {
      // Reset pull state
      resetPull()
    }
  }
  
  // Trigger refresh
  const triggerRefresh = async () => {
    isRefreshing.value = true
    triggerHapticFeedback('medium')
    
    try {
      await onRefresh()
    } finally {
      // Delay reset to show completion animation
      setTimeout(() => {
        resetPull()
        isRefreshing.value = false
      }, 500)
    }
  }
  
  // Reset pull state
  const resetPull = () => {
    isPulling.value = false
    pullDistance.value = 0
    canRefresh.value = false
  }
  
  // Setup event listeners
  const setupPullToRefresh = (element: HTMLElement) => {
    scrollElement = element
    
    element.addEventListener('touchstart', handleTouchStart, { passive: false })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })
  }
  
  // Cleanup event listeners
  const cleanupPullToRefresh = () => {
    if (scrollElement) {
      scrollElement.removeEventListener('touchstart', handleTouchStart)
      scrollElement.removeEventListener('touchmove', handleTouchMove)
      scrollElement.removeEventListener('touchend', handleTouchEnd)
      scrollElement = null
    }
  }
  
  // Computed styles for pull indicator
  const pullIndicatorStyle = computed(() => ({
    transform: `translateY(${pullDistance.value}px)`,
    opacity: isPulling.value ? Math.min(pullDistance.value / PULL_THRESHOLD, 1) : 0,
    transition: isPulling.value ? 'none' : 'all 0.3s ease-out'
  }))
  
  // Pull status text
  const pullStatusText = computed(() => {
    if (isRefreshing.value) return 'Refreshing...'
    if (canRefresh.value) return 'Release to refresh'
    if (isPulling.value) return 'Pull to refresh'
    return ''
  })
  
  return {
    // State
    isRefreshing: readonly(isRefreshing),
    pullDistance: readonly(pullDistance),
    isPulling: readonly(isPulling),
    canRefresh: readonly(canRefresh),
    
    // Computed
    pullIndicatorStyle,
    pullStatusText,
    
    // Methods
    setupPullToRefresh,
    cleanupPullToRefresh,
    triggerRefresh
  }
}

// Haptic feedback utility
const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  if (process.client && 'vibrate' in navigator) {
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30]
    }
    navigator.vibrate(patterns[type])
  }
}