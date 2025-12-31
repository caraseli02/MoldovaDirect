/**
 * Haptic feedback composable for enhanced touch interactions
 * Provides vibration feedback for mobile devices
 */
export const useHapticFeedback = () => {
  const isSupported = ref(false)
  const isEnabled = ref(true) // User preference

  // Check haptic feedback support
  const checkSupport = () => {
    if (import.meta.client) {
      isSupported.value = 'vibrate' in navigator
    }
  }

  // Vibration patterns for different feedback types
  const patterns = {
    // Basic patterns
    light: [10],
    medium: [20],
    heavy: [30],

    // Interaction patterns
    tap: [5],
    click: [10],
    success: [10, 50, 10],
    error: [50, 50, 50],
    warning: [20, 20, 20],

    // UI patterns
    buttonPress: [8],
    toggle: [15],
    swipe: [12],
    pullRefresh: [25],

    // Notification patterns
    notification: [100, 50, 100],
    alert: [200, 100, 200, 100, 200],

    // Custom patterns
    heartbeat: [100, 30, 100, 30, 100],
    pulse: [50, 100, 50],
    double: [20, 50, 20],
  }

  // Trigger haptic feedback
  const vibrate = (
    pattern: keyof typeof patterns | number | number[] = 'light',
    force = false,
  ) => {
    if (!import.meta.client || !isSupported.value || (!isEnabled.value && !force)) {
      return false
    }

    try {
      let vibrationPattern: number | number[]

      if (typeof pattern === 'string') {
        vibrationPattern = patterns[pattern] || patterns.light
      }
      else {
        vibrationPattern = pattern
      }

      navigator.vibrate(vibrationPattern)
      return true
    }
    catch (error: unknown) {
      console.warn('Haptic feedback failed:', error)
      return false
    }
  }

  // Convenience methods for common interactions
  const tap = () => vibrate('tap')
  const click = () => vibrate('click')
  const success = () => vibrate('success')
  const error = () => vibrate('error')
  const warning = () => vibrate('warning')
  const buttonPress = () => vibrate('buttonPress')
  const toggle = () => vibrate('toggle')
  const swipe = () => vibrate('swipe')
  const pullRefresh = () => vibrate('pullRefresh')
  const notification = () => vibrate('notification')
  const alert = () => vibrate('alert')

  // Stop all vibrations
  const stop = () => {
    if (import.meta.client && isSupported.value) {
      navigator.vibrate(0)
    }
  }

  // Enable/disable haptic feedback
  const enable = () => {
    isEnabled.value = true
    if (import.meta.client) {
      localStorage.setItem('haptic-feedback-enabled', 'true')
    }
  }

  const disable = () => {
    isEnabled.value = false
    stop()
    if (import.meta.client) {
      localStorage.setItem('haptic-feedback-enabled', 'false')
    }
  }

  // Load user preference
  const loadPreference = () => {
    if (import.meta.client) {
      const saved = localStorage.getItem('haptic-feedback-enabled')
      if (saved !== null) {
        isEnabled.value = saved === 'true'
      }
    }
  }

  // Initialize
  onMounted(() => {
    checkSupport()
    loadPreference()
  })

  return {
    // State
    isSupported: readonly(isSupported),
    isEnabled: readonly(isEnabled),

    // Core methods
    vibrate,
    stop,
    enable,
    disable,

    // Convenience methods
    tap,
    click,
    success,
    error,
    warning,
    buttonPress,
    toggle,
    swipe,
    pullRefresh,
    notification,
    alert,

    // Patterns
    patterns: readonly(patterns),
  }
}
