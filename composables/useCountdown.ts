/**
 * Countdown Timer Composable
 *
 * Provides a reactive countdown timer that updates every second.
 * Returns formatted time remaining in days, hours, minutes, and seconds.
 *
 * @example
 * ```vue
 * const { timeRemaining, formattedTimeRemaining } = useCountdown(endDate)
 * ```
 */

import { ref, computed, watch, onUnmounted, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'

interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number
}

export const useCountdown = (endDate: Ref<Date | string | null | undefined>) => {
  const { t } = useI18n()
  const now = ref(Date.now())
  let intervalId: ReturnType<typeof setInterval> | null = null

  /**
   * Calculate time remaining until end date
   */
  const timeRemaining = computed((): TimeRemaining | null => {
    if (!endDate.value) return null

    const end = typeof endDate.value === 'string' ? new Date(endDate.value) : endDate.value
    const total = end.getTime() - now.value

    if (total <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        total: 0
      }
    }

    const seconds = Math.floor((total / 1000) % 60)
    const minutes = Math.floor((total / 1000 / 60) % 60)
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24)
    const days = Math.floor(total / (1000 * 60 * 60 * 24))

    return {
      days,
      hours,
      minutes,
      seconds,
      total
    }
  })

  /**
   * Format time remaining as compact string (e.g., "2d 5h 30m")
   */
  const formattedTimeRemaining = computed((): string | null => {
    const time = timeRemaining.value
    if (!time || time.total <= 0) return null

    const parts: string[] = []

    if (time.days > 0) {
      parts.push(`${time.days}${t('common.time.days')}`)
    }
    if (time.hours > 0 || time.days > 0) {
      parts.push(`${time.hours}${t('common.time.hours')}`)
    }
    if (time.minutes > 0 || time.hours > 0 || time.days > 0) {
      parts.push(`${time.minutes}${t('common.time.minutes')}`)
    }

    // Only show seconds if less than 1 hour remaining
    if (time.total < 3600000 && time.seconds >= 0) {
      parts.push(`${time.seconds}${t('common.time.seconds')}`)
    }

    return parts.slice(0, 3).join(' ')
  })

  /**
   * Check if countdown has ended
   */
  const hasEnded = computed(() => {
    const time = timeRemaining.value
    return !time || time.total <= 0
  })

  /**
   * Start the countdown interval
   */
  const startInterval = () => {
    if (intervalId) return

    // Update immediately
    now.value = Date.now()

    // Then update every second
    intervalId = setInterval(() => {
      now.value = Date.now()

      // Stop interval if countdown has ended
      if (hasEnded.value && intervalId) {
        clearInterval(intervalId)
        intervalId = null
      }
    }, 1000)
  }

  /**
   * Stop the countdown interval
   */
  const stopInterval = () => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  /**
   * Restart the countdown
   */
  const restart = () => {
    stopInterval()
    now.value = Date.now()
    if (endDate.value) {
      startInterval()
    }
  }

  // Watch for end date changes
  watch(
    () => endDate.value,
    (newEndDate) => {
      if (newEndDate) {
        restart()
      } else {
        stopInterval()
      }
    },
    { immediate: true }
  )

  // Cleanup on unmount
  onUnmounted(() => {
    stopInterval()
  })

  return {
    timeRemaining,
    formattedTimeRemaining,
    hasEnded,
    restart
  }
}
