import { ref, onMounted, watch } from 'vue'

interface CountUpOptions {
  start?: number
  duration?: number
  useEasing?: boolean
  separator?: string
  decimal?: string
}

/**
 * Animated counter hook for stats
 * Counts up from start value to target value with easing
 */
export function useCountUp(target: number | Ref<number>, options: CountUpOptions = {}) {
  const {
    start = 0,
    duration = 2000,
    useEasing = true,
    separator = ',',
    decimal = '.'
  } = options

  const current = ref(start)
  const animationFrame = ref<number | null>(null)

  // Easing function (ease-out)
  const easeOutQuad = (t: number): number => t * (2 - t)

  const startAnimation = () => {
    const startTime = Date.now()
    const targetValue = unref(target)
    const startValue = start
    const change = targetValue - startValue

    const animate = () => {
      const now = Date.now()
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Apply easing if enabled
      const easedProgress = useEasing ? easeOutQuad(progress) : progress

      current.value = Math.floor(startValue + change * easedProgress)

      if (progress < 1) {
        animationFrame.value = requestAnimationFrame(animate)
      } else {
        current.value = targetValue
      }
    }

    animationFrame.value = requestAnimationFrame(animate)
  }

  const stopAnimation = () => {
    if (animationFrame.value !== null) {
      cancelAnimationFrame(animationFrame.value)
      animationFrame.value = null
    }
  }

  const reset = () => {
    stopAnimation()
    current.value = start
  }

  const restart = () => {
    reset()
    startAnimation()
  }

  // Format number with separators
  const formatted = computed(() => {
    const num = current.value.toString()
    const parts = num.split('.')
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator)
    return parts.join(decimal)
  })

  // Watch for target changes
  watch(() => unref(target), () => {
    restart()
  })

  onMounted(() => {
    startAnimation()
  })

  onUnmounted(() => {
    stopAnimation()
  })

  return {
    current,
    formatted,
    reset,
    restart
  }
}
