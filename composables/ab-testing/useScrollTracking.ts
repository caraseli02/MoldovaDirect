/**
 * Scroll Depth Tracking Composable
 *
 * Tracks user scroll behavior and depth milestones:
 * - 25%, 50%, 75%, 100% scroll depth
 * - Time spent at each depth
 * - Scroll velocity
 * - Engagement scoring
 */

export interface ScrollMilestone {
  depth: number // 0-100
  reached: boolean
  timestamp?: Date
  timeToReach?: number // ms from page load
}

export interface ScrollMetrics {
  maxDepth: number
  milestones: ScrollMilestone[]
  totalTime: number
  averageScrollVelocity: number
  engagementScore: number
}

const SCROLL_MILESTONES = [25, 50, 75, 100]

export const useScrollTracking = (elementRef?: Ref<HTMLElement | null>) => {
  const { trackActivity } = useAnalytics()
  const route = useRoute()

  const milestones = ref<ScrollMilestone[]>(
    SCROLL_MILESTONES.map(depth => ({
      depth,
      reached: false
    }))
  )

  const maxDepth = ref(0)
  const startTime = ref<number>(Date.now())
  const lastScrollTime = ref<number>(Date.now())
  const scrollVelocities = ref<number[]>([])
  const isTracking = ref(false)

  // Calculate scroll depth percentage
  const getScrollDepth = (): number => {
    if (process.server) return 0

    const element = elementRef?.value || document.documentElement
    const scrollTop = element.scrollTop || window.pageYOffset
    const scrollHeight = element.scrollHeight - element.clientHeight

    if (scrollHeight <= 0) return 100

    return Math.min(100, Math.round((scrollTop / scrollHeight) * 100))
  }

  // Calculate scroll velocity (pixels per second)
  const calculateVelocity = (currentScroll: number, previousScroll: number, timeDelta: number): number => {
    const pixelsDelta = Math.abs(currentScroll - previousScroll)
    return (pixelsDelta / timeDelta) * 1000 // px/s
  }

  // Calculate engagement score (0-100)
  const calculateEngagementScore = (): number => {
    const depthScore = maxDepth.value * 0.4 // 40% weight
    const milestoneScore = (milestones.value.filter(m => m.reached).length / milestones.value.length) * 30 // 30% weight
    const timeScore = Math.min(30, (Date.now() - startTime.value) / 1000) // 30% weight, cap at 30s

    return Math.round(depthScore + milestoneScore + timeScore)
  }

  // Handle scroll event
  const handleScroll = () => {
    if (!isTracking.value) return

    const currentDepth = getScrollDepth()
    const currentTime = Date.now()
    const timeDelta = currentTime - lastScrollTime.value

    // Update max depth
    if (currentDepth > maxDepth.value) {
      maxDepth.value = currentDepth
    }

    // Calculate velocity
    if (timeDelta > 0) {
      const velocity = calculateVelocity(
        currentDepth,
        maxDepth.value,
        timeDelta
      )
      scrollVelocities.value.push(velocity)

      // Keep only last 10 velocities for average calculation
      if (scrollVelocities.value.length > 10) {
        scrollVelocities.value.shift()
      }
    }

    // Check milestones
    milestones.value.forEach((milestone, index) => {
      if (!milestone.reached && currentDepth >= milestone.depth) {
        milestone.reached = true
        milestone.timestamp = new Date()
        milestone.timeToReach = currentTime - startTime.value

        // Track milestone reached
        trackActivity({
          activityType: 'scroll_milestone',
          pageUrl: route.path,
          metadata: {
            depth: milestone.depth,
            timeToReach: milestone.timeToReach,
            engagementScore: calculateEngagementScore()
          }
        })
      }
    })

    lastScrollTime.value = currentTime
  }

  // Throttle scroll handler
  let scrollTimeout: NodeJS.Timeout | null = null
  const throttledHandleScroll = () => {
    if (scrollTimeout) return

    scrollTimeout = setTimeout(() => {
      handleScroll()
      scrollTimeout = null
    }, 100) // 100ms throttle
  }

  // Start tracking
  const startTracking = () => {
    if (process.server || isTracking.value) return

    isTracking.value = true
    startTime.value = Date.now()
    lastScrollTime.value = Date.now()

    // Initial depth
    maxDepth.value = getScrollDepth()

    // Add scroll listener
    const target = elementRef?.value || window
    target.addEventListener('scroll', throttledHandleScroll, { passive: true })

    // Track page view with initial depth
    trackActivity({
      activityType: 'page_view_depth',
      pageUrl: route.path,
      metadata: {
        initialDepth: maxDepth.value
      }
    })
  }

  // Stop tracking and send final metrics
  const stopTracking = () => {
    if (process.server || !isTracking.value) return

    isTracking.value = false

    // Remove scroll listener
    const target = elementRef?.value || window
    target.removeEventListener('scroll', throttledHandleScroll)

    // Calculate final metrics
    const averageVelocity = scrollVelocities.value.length > 0
      ? scrollVelocities.value.reduce((a, b) => a + b, 0) / scrollVelocities.value.length
      : 0

    const totalTime = Date.now() - startTime.value
    const engagementScore = calculateEngagementScore()

    // Track final metrics
    trackActivity({
      activityType: 'scroll_depth_complete',
      pageUrl: route.path,
      metadata: {
        maxDepth: maxDepth.value,
        totalTime,
        averageVelocity,
        engagementScore,
        milestones: milestones.value.filter(m => m.reached).map(m => ({
          depth: m.depth,
          timeToReach: m.timeToReach
        }))
      }
    })
  }

  // Reset tracking
  const resetTracking = () => {
    milestones.value = SCROLL_MILESTONES.map(depth => ({
      depth,
      reached: false
    }))
    maxDepth.value = 0
    scrollVelocities.value = []
    startTime.value = Date.now()
    lastScrollTime.value = Date.now()
  }

  // Computed metrics
  const metrics = computed<ScrollMetrics>(() => ({
    maxDepth: maxDepth.value,
    milestones: milestones.value,
    totalTime: Date.now() - startTime.value,
    averageScrollVelocity: scrollVelocities.value.length > 0
      ? scrollVelocities.value.reduce((a, b) => a + b, 0) / scrollVelocities.value.length
      : 0,
    engagementScore: calculateEngagementScore()
  }))

  // Auto-start and stop tracking on component lifecycle
  onMounted(() => {
    startTracking()
  })

  onBeforeUnmount(() => {
    stopTracking()
  })

  return {
    metrics,
    maxDepth: readonly(maxDepth),
    milestones: readonly(milestones),
    isTracking: readonly(isTracking),
    startTracking,
    stopTracking,
    resetTracking,
    getScrollDepth
  }
}
