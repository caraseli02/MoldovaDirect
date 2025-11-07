/**
 * Conversion Funnel Tracking Composable
 *
 * Tracks user progression through the conversion funnel:
 * Landing → Engagement → CTA → Product → Cart → Checkout → Purchase
 */

export interface FunnelStep {
  id: string
  name: string
  order: number
  completed: boolean
  timestamp?: Date
  metadata?: Record<string, any>
}

export interface FunnelProgress {
  sessionId: string
  steps: FunnelStep[]
  currentStep: string
  completionRate: number
  dropOffPoint?: string
  totalTime: number
  startedAt: Date
}

const FUNNEL_STEPS: Omit<FunnelStep, 'completed' | 'timestamp'>[] = [
  { id: 'landing', name: 'Landing Page View', order: 1 },
  { id: 'engagement', name: 'Section Engagement', order: 2 },
  { id: 'cta_click', name: 'CTA Click', order: 3 },
  { id: 'product_view', name: 'Product View', order: 4 },
  { id: 'add_to_cart', name: 'Add to Cart', order: 5 },
  { id: 'checkout_init', name: 'Checkout Initiation', order: 6 },
  { id: 'purchase', name: 'Purchase Complete', order: 7 }
]

const FUNNEL_STORAGE_KEY = 'conversion_funnel_progress'

export const useConversionFunnel = () => {
  const { trackActivity } = useAnalytics()
  const { getSessionId } = useABTest()

  const progress = ref<FunnelProgress | null>(null)

  // Initialize or load funnel progress
  const initializeFunnel = () => {
    if (process.server) return

    try {
      const stored = localStorage.getItem(FUNNEL_STORAGE_KEY)
      if (stored) {
        progress.value = JSON.parse(stored)
        return
      }
    } catch {
      // Ignore parse errors
    }

    // Create new funnel progress
    progress.value = {
      sessionId: getSessionId(),
      steps: FUNNEL_STEPS.map(step => ({
        ...step,
        completed: false
      })),
      currentStep: 'landing',
      completionRate: 0,
      totalTime: 0,
      startedAt: new Date()
    }

    saveFunnel()
  }

  // Save funnel progress to storage
  const saveFunnel = () => {
    if (process.server || !progress.value) return

    try {
      localStorage.setItem(FUNNEL_STORAGE_KEY, JSON.stringify(progress.value))
    } catch {
      // Ignore storage errors
    }
  }

  // Mark step as completed
  const completeStep = (stepId: string, metadata?: Record<string, any>) => {
    if (!progress.value) {
      initializeFunnel()
    }

    const step = progress.value?.steps.find(s => s.id === stepId)
    if (!step || step.completed) return

    step.completed = true
    step.timestamp = new Date()
    step.metadata = metadata

    // Update current step to next incomplete step
    const nextStep = progress.value?.steps.find(s => !s.completed)
    if (progress.value) {
      progress.value.currentStep = nextStep?.id || 'purchase'

      // Calculate completion rate
      const completedSteps = progress.value.steps.filter(s => s.completed).length
      progress.value.completionRate = (completedSteps / progress.value.steps.length) * 100

      // Calculate total time
      progress.value.totalTime = Date.now() - new Date(progress.value.startedAt).getTime()
    }

    saveFunnel()

    // Track step completion
    trackActivity({
      activityType: 'funnel_step_complete',
      metadata: {
        stepId,
        stepName: step.name,
        stepOrder: step.order,
        completionRate: progress.value?.completionRate,
        totalTime: progress.value?.totalTime,
        sessionId: progress.value?.sessionId,
        ...metadata
      }
    })
  }

  // Track funnel abandonment
  const trackAbandonment = () => {
    if (!progress.value) return

    const lastCompletedStep = progress.value.steps
      .filter(s => s.completed)
      .sort((a, b) => b.order - a.order)[0]

    const dropOffPoint = progress.value.steps.find(s => !s.completed)

    trackActivity({
      activityType: 'funnel_abandonment',
      metadata: {
        lastCompletedStep: lastCompletedStep?.id,
        dropOffPoint: dropOffPoint?.id,
        completionRate: progress.value.completionRate,
        totalTime: progress.value.totalTime,
        sessionId: progress.value.sessionId
      }
    })
  }

  // Reset funnel progress
  const resetFunnel = () => {
    if (process.server) return

    localStorage.removeItem(FUNNEL_STORAGE_KEY)
    initializeFunnel()
  }

  // Get completion percentage for specific step
  const getStepCompletionRate = (stepId: string): number => {
    if (!progress.value) return 0

    const stepIndex = progress.value.steps.findIndex(s => s.id === stepId)
    if (stepIndex === -1) return 0

    const completedAtOrBefore = progress.value.steps
      .slice(0, stepIndex + 1)
      .filter(s => s.completed).length

    return (completedAtOrBefore / (stepIndex + 1)) * 100
  }

  // Computed properties
  const currentStepInfo = computed(() => {
    if (!progress.value) return null
    return progress.value.steps.find(s => s.id === progress.value?.currentStep)
  })

  const completedSteps = computed(() => {
    return progress.value?.steps.filter(s => s.completed) || []
  })

  const nextStep = computed(() => {
    return progress.value?.steps.find(s => !s.completed)
  })

  const isComplete = computed(() => {
    return progress.value?.completionRate === 100
  })

  const dropOffPoint = computed(() => {
    if (!progress.value || isComplete.value) return null
    return progress.value.steps.find(s => !s.completed)
  })

  // Initialize on mount
  onMounted(() => {
    initializeFunnel()
  })

  // Track abandonment on unmount
  onBeforeUnmount(() => {
    if (progress.value && !isComplete.value) {
      trackAbandonment()
    }
  })

  return {
    progress: readonly(progress),
    currentStepInfo,
    completedSteps,
    nextStep,
    isComplete,
    dropOffPoint,
    completeStep,
    resetFunnel,
    getStepCompletionRate,
    initializeFunnel
  }
}
