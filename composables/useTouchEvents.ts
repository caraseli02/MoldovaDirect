/**
 * Efficient touch event handling composable
 * Optimizes touch interactions for mobile performance
 */
export const useTouchEvents = () => {
  const touchState = ref({
    isActive: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    deltaX: 0,
    deltaY: 0,
    startTime: 0,
    velocity: { x: 0, y: 0 }
  })
  
  const touchHistory = ref<Array<{ x: number; y: number; time: number }>>([])
  const maxHistoryLength = 5
  
  // Touch event handlers
  const handlers = ref({
    onTouchStart: null as ((event: TouchEvent) => void) | null,
    onTouchMove: null as ((event: TouchEvent) => void) | null,
    onTouchEnd: null as ((event: TouchEvent) => void) | null,
    onTap: null as ((event: TouchEvent) => void) | null,
    onLongPress: null as ((event: TouchEvent) => void) | null,
    onSwipe: null as ((direction: 'left' | 'right' | 'up' | 'down', velocity: number) => void) | null
  })
  
  let longPressTimer: NodeJS.Timeout | null = null
  const longPressDelay = 500 // ms
  const tapThreshold = 10 // pixels
  const swipeThreshold = 50 // pixels
  
  // Calculate velocity
  const calculateVelocity = () => {
    if (touchHistory.value.length < 2) return { x: 0, y: 0 }
    
    const recent = touchHistory.value.slice(-2)
    const timeDiff = recent[1].time - recent[0].time
    
    if (timeDiff === 0) return { x: 0, y: 0 }
    
    return {
      x: (recent[1].x - recent[0].x) / timeDiff,
      y: (recent[1].y - recent[0].y) / timeDiff
    }
  }
  
  // Add touch point to history
  const addToHistory = (x: number, y: number, time: number) => {
    touchHistory.value.push({ x, y, time })
    if (touchHistory.value.length > maxHistoryLength) {
      touchHistory.value.shift()
    }
  }
  
  // Handle touch start
  const handleTouchStart = (event: TouchEvent) => {
    const touch = event.touches[0]
    const now = Date.now()
    
    touchState.value = {
      isActive: true,
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      deltaX: 0,
      deltaY: 0,
      startTime: now,
      velocity: { x: 0, y: 0 }
    }
    
    // Reset history
    touchHistory.value = []
    addToHistory(touch.clientX, touch.clientY, now)
    
    // Start long press timer
    longPressTimer = setTimeout(() => {
      if (touchState.value.isActive) {
        handlers.value.onLongPress?.(event)
      }
    }, longPressDelay)
    
    // Call custom handler
    handlers.value.onTouchStart?.(event)
  }
  
  // Handle touch move
  const handleTouchMove = (event: TouchEvent) => {
    if (!touchState.value.isActive) return
    
    const touch = event.touches[0]
    const now = Date.now()
    
    touchState.value.currentX = touch.clientX
    touchState.value.currentY = touch.clientY
    touchState.value.deltaX = touch.clientX - touchState.value.startX
    touchState.value.deltaY = touch.clientY - touchState.value.startY
    
    // Add to history for velocity calculation
    addToHistory(touch.clientX, touch.clientY, now)
    touchState.value.velocity = calculateVelocity()
    
    // Cancel long press if moved too much
    if (longPressTimer && (Math.abs(touchState.value.deltaX) > tapThreshold || Math.abs(touchState.value.deltaY) > tapThreshold)) {
      clearTimeout(longPressTimer)
      longPressTimer = null
    }
    
    // Call custom handler
    handlers.value.onTouchMove?.(event)
  }
  
  // Handle touch end
  const handleTouchEnd = (event: TouchEvent) => {
    if (!touchState.value.isActive) return
    
    const duration = Date.now() - touchState.value.startTime
    const distance = Math.sqrt(
      touchState.value.deltaX ** 2 + touchState.value.deltaY ** 2
    )
    
    // Clear long press timer
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      longPressTimer = null
    }
    
    // Detect tap
    if (distance < tapThreshold && duration < 300) {
      handlers.value.onTap?.(event)
    }
    
    // Detect swipe
    else if (distance > swipeThreshold) {
      const absX = Math.abs(touchState.value.deltaX)
      const absY = Math.abs(touchState.value.deltaY)
      const velocity = Math.sqrt(
        touchState.value.velocity.x ** 2 + touchState.value.velocity.y ** 2
      )
      
      let direction: 'left' | 'right' | 'up' | 'down'
      
      if (absX > absY) {
        direction = touchState.value.deltaX > 0 ? 'right' : 'left'
      } else {
        direction = touchState.value.deltaY > 0 ? 'down' : 'up'
      }
      
      handlers.value.onSwipe?.(direction, velocity)
    }
    
    // Reset state
    touchState.value.isActive = false
    touchHistory.value = []
    
    // Call custom handler
    handlers.value.onTouchEnd?.(event)
  }
  
  // Setup touch listeners with passive optimization
  const setupTouchListeners = (element: HTMLElement, options: {
    passive?: boolean
    capture?: boolean
  } = {}) => {
    const eventOptions = {
      passive: options.passive ?? true,
      capture: options.capture ?? false
    }
    
    element.addEventListener('touchstart', handleTouchStart, eventOptions)
    element.addEventListener('touchmove', handleTouchMove, { 
      ...eventOptions, 
      passive: false // Need to prevent default for some cases
    })
    element.addEventListener('touchend', handleTouchEnd, eventOptions)
    element.addEventListener('touchcancel', handleTouchEnd, eventOptions)
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
      element.removeEventListener('touchcancel', handleTouchEnd)
    }
  }
  
  // Set event handlers
  const setHandlers = (newHandlers: Partial<typeof handlers.value>) => {
    handlers.value = { ...handlers.value, ...newHandlers }
  }
  
  // Cleanup
  const cleanup = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      longPressTimer = null
    }
    touchState.value.isActive = false
    touchHistory.value = []
  }
  
  return {
    // State
    touchState: readonly(touchState),
    
    // Methods
    setupTouchListeners,
    setHandlers,
    cleanup
  }
}