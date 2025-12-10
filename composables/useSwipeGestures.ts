/**
 * Swipe gestures composable for touch-friendly navigation
 * Provides swipe detection and handling for mobile interfaces
 */
export const useSwipeGestures = () => {
  const isSwipeActive = ref(false)
  const swipeDirection = ref<'left' | 'right' | 'up' | 'down' | null>(null)
  const swipeDistance = ref(0)

  const MIN_SWIPE_DISTANCE = 50 // Minimum distance for a valid swipe
  const MAX_SWIPE_TIME = 300 // Maximum time for a swipe gesture (ms)

  let startX = 0
  let startY = 0
  let startTime = 0
  let element: HTMLElement | null = null

  // Swipe event handlers
  const onSwipeLeft = ref<(() => void) | null>(null)
  const onSwipeRight = ref<(() => void) | null>(null)
  const onSwipeUp = ref<(() => void) | null>(null)
  const onSwipeDown = ref<(() => void) | null>(null)

  // Handle touch start
  const handleTouchStart = (event: TouchEvent) => {
    const touch = event.touches[0]
    if (!touch) return

    startX = touch.clientX
    startY = touch.clientY
    startTime = Date.now()
    isSwipeActive.value = false
    swipeDirection.value = null
    swipeDistance.value = 0
  }

  // Handle touch move
  const handleTouchMove = (event: TouchEvent) => {
    if (!startTime) return

    const touch = event.touches[0]
    if (!touch) return

    const deltaX = touch.clientX - startX
    const deltaY = touch.clientY - startY
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    // Determine swipe direction
    if (distance > 10) { // Minimum movement to detect direction
      const angle = Math.atan2(Math.abs(deltaY), Math.abs(deltaX)) * 180 / Math.PI

      if (angle < 45) {
        // Horizontal swipe
        swipeDirection.value = deltaX > 0 ? 'right' : 'left'
      }
      else {
        // Vertical swipe
        swipeDirection.value = deltaY > 0 ? 'down' : 'up'
      }

      swipeDistance.value = distance
      isSwipeActive.value = distance > MIN_SWIPE_DISTANCE
    }
  }

  // Handle touch end
  const handleTouchEnd = (event: TouchEvent) => {
    if (!startTime) return

    const endTime = Date.now()
    const swipeTime = endTime - startTime

    // Check if it's a valid swipe
    if (
      swipeTime <= MAX_SWIPE_TIME
      && swipeDistance.value >= MIN_SWIPE_DISTANCE
      && swipeDirection.value
    ) {
      // Trigger haptic feedback
      triggerHapticFeedback('light')

      // Execute appropriate swipe handler
      switch (swipeDirection.value) {
        case 'left':
          onSwipeLeft.value?.()
          break
        case 'right':
          onSwipeRight.value?.()
          break
        case 'up':
          onSwipeUp.value?.()
          break
        case 'down':
          onSwipeDown.value?.()
          break
      }
    }

    // Reset state
    resetSwipe()
  }

  // Reset swipe state
  const resetSwipe = () => {
    isSwipeActive.value = false
    swipeDirection.value = null
    swipeDistance.value = 0
    startTime = 0
  }

  // Setup swipe listeners on element
  const setupSwipeListeners = (targetElement: HTMLElement) => {
    element = targetElement

    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchmove', handleTouchMove, { passive: true })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })
  }

  // Cleanup swipe listeners
  const cleanupSwipeListeners = () => {
    if (element) {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
      element = null
    }
  }

  // Set swipe handlers
  const setSwipeHandlers = (handlers: {
    onLeft?: () => void
    onRight?: () => void
    onUp?: () => void
    onDown?: () => void
  }) => {
    onSwipeLeft.value = handlers.onLeft || null
    onSwipeRight.value = handlers.onRight || null
    onSwipeUp.value = handlers.onUp || null
    onSwipeDown.value = handlers.onDown || null
  }

  return {
    // State
    isSwipeActive: readonly(isSwipeActive),
    swipeDirection: readonly(swipeDirection),
    swipeDistance: readonly(swipeDistance),

    // Methods
    setupSwipeListeners,
    cleanupSwipeListeners,
    setSwipeHandlers,
    resetSwipe,
  }
}

// Haptic feedback utility
const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  if (import.meta.client && 'vibrate' in navigator) {
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30],
    }
    navigator.vibrate(patterns[type])
  }
}
