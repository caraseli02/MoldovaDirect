/**
 * Device detection composable
 * Provides reactive device type detection and screen size information
 */
export const useDevice = () => {
  // Reactive state - Default to desktop for SSR consistency
  const windowWidth = ref(1024)
  const windowHeight = ref(768)

  // Computed properties for device types
  const isMobile = computed(() => windowWidth.value < 768)
  const isTablet = computed(() => windowWidth.value >= 768 && windowWidth.value < 1024)
  const isDesktop = computed(() => windowWidth.value >= 1024)
  const isLargeDesktop = computed(() => windowWidth.value >= 1280)

  // Computed properties for specific breakpoints
  const isSmall = computed(() => windowWidth.value < 640)
  const isMedium = computed(() => windowWidth.value >= 640 && windowWidth.value < 768)
  const isLarge = computed(() => windowWidth.value >= 768 && windowWidth.value < 1024)
  const isExtraLarge = computed(() => windowWidth.value >= 1024)

  // Device orientation
  const isPortrait = computed(() => windowHeight.value > windowWidth.value)
  const isLandscape = computed(() => windowWidth.value > windowHeight.value)

  // Touch device detection
  const isTouchDevice = computed(() => {
    if (import.meta.client) {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0
    }
    return false
  })

  // Update window dimensions
  const updateDimensions = () => {
    if (import.meta.client) {
      windowWidth.value = window.innerWidth
      windowHeight.value = window.innerHeight
    }
  }

  // Initialize and setup event listeners
  onMounted(() => {
    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    window.addEventListener('orientationchange', updateDimensions)
  })

  onUnmounted(() => {
    if (import.meta.client) {
      window.removeEventListener('resize', updateDimensions)
      window.removeEventListener('orientationchange', updateDimensions)
    }
  })

  // Device type string
  const deviceType = computed(() => {
    if (isMobile.value) return 'mobile'
    if (isTablet.value) return 'tablet'
    if (isDesktop.value) return 'desktop'
    return 'unknown'
  })

  // Breakpoint helpers
  const breakpoint = computed(() => {
    if (windowWidth.value < 640) return 'sm'
    if (windowWidth.value < 768) return 'md'
    if (windowWidth.value < 1024) return 'lg'
    if (windowWidth.value < 1280) return 'xl'
    return '2xl'
  })

  return {
    // Dimensions
    windowWidth: readonly(windowWidth),
    windowHeight: readonly(windowHeight),

    // Device types
    isMobile: readonly(isMobile),
    isTablet: readonly(isTablet),
    isDesktop: readonly(isDesktop),
    isLargeDesktop: readonly(isLargeDesktop),

    // Breakpoints
    isSmall: readonly(isSmall),
    isMedium: readonly(isMedium),
    isLarge: readonly(isLarge),
    isExtraLarge: readonly(isExtraLarge),

    // Orientation
    isPortrait: readonly(isPortrait),
    isLandscape: readonly(isLandscape),

    // Touch
    isTouchDevice: readonly(isTouchDevice),

    // Computed values
    deviceType: readonly(deviceType),
    breakpoint: readonly(breakpoint),

    // Methods
    updateDimensions,
  }
}
