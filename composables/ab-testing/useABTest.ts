/**
 * A/B Testing Composable
 *
 * Provides client-side A/B testing functionality with:
 * - Variant assignment and persistence
 * - Statistical significance tracking
 * - Event tracking integration
 * - Local storage persistence
 */

export interface ABTestVariant {
  id: string
  name: string
  weight: number // 0-1, relative weight for assignment
  metadata?: Record<string, any>
}

export interface ABTest {
  id: string
  name: string
  description: string
  variants: ABTestVariant[]
  startDate: Date
  endDate?: Date
  isActive: boolean
  sampleSize?: number
  confidenceLevel?: number // 0.95 default
}

export interface ABTestAssignment {
  testId: string
  variantId: string
  assignedAt: Date
  sessionId?: string
}

export interface ABTestMetrics {
  testId: string
  variantId: string
  conversions: number
  views: number
  conversionRate: number
  isStatisticallySignificant: boolean
  pValue?: number
}

const AB_TEST_STORAGE_KEY = 'ab_test_assignments'
const AB_TEST_SESSION_KEY = 'ab_test_session_id'

export const useABTest = () => {
  const { trackActivity } = useAnalytics()

  // Generate or retrieve session ID
  const getSessionId = (): string => {
    if (process.server) return ''

    let sessionId = localStorage.getItem(AB_TEST_SESSION_KEY)
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem(AB_TEST_SESSION_KEY, sessionId)
    }
    return sessionId
  }

  // Get all stored assignments
  const getAssignments = (): Record<string, ABTestAssignment> => {
    if (process.server) return {}

    try {
      const stored = localStorage.getItem(AB_TEST_STORAGE_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  }

  // Store assignment
  const saveAssignment = (assignment: ABTestAssignment) => {
    if (process.server) return

    const assignments = getAssignments()
    assignments[assignment.testId] = assignment
    localStorage.setItem(AB_TEST_STORAGE_KEY, JSON.stringify(assignments))
  }

  // Assign variant using weighted random selection
  const assignVariant = (test: ABTest): string => {
    const assignments = getAssignments()

    // Return existing assignment if present
    if (assignments[test.id]) {
      return assignments[test.id].variantId
    }

    // Calculate total weight
    const totalWeight = test.variants.reduce((sum, v) => sum + v.weight, 0)

    // Random selection based on weights
    let random = Math.random() * totalWeight
    let selectedVariant = test.variants[0]

    for (const variant of test.variants) {
      random -= variant.weight
      if (random <= 0) {
        selectedVariant = variant
        break
      }
    }

    // Save assignment
    const assignment: ABTestAssignment = {
      testId: test.id,
      variantId: selectedVariant.id,
      assignedAt: new Date(),
      sessionId: getSessionId()
    }
    saveAssignment(assignment)

    // Track assignment
    trackActivity({
      activityType: 'ab_test_assignment',
      metadata: {
        testId: test.id,
        variantId: selectedVariant.id,
        testName: test.name
      }
    })

    return selectedVariant.id
  }

  // Get current variant for a test
  const getVariant = (testId: string): string | null => {
    const assignments = getAssignments()
    return assignments[testId]?.variantId || null
  }

  // Track conversion event
  const trackConversion = (testId: string, metadata?: Record<string, any>) => {
    const variantId = getVariant(testId)
    if (!variantId) return

    trackActivity({
      activityType: 'ab_test_conversion',
      metadata: {
        testId,
        variantId,
        ...metadata
      }
    })
  }

  // Track impression/view event
  const trackImpression = (testId: string, metadata?: Record<string, any>) => {
    const variantId = getVariant(testId)
    if (!variantId) return

    trackActivity({
      activityType: 'ab_test_impression',
      metadata: {
        testId,
        variantId,
        ...metadata
      }
    })
  }

  // Calculate statistical significance
  const calculateSignificance = (
    controlConversions: number,
    controlViews: number,
    variantConversions: number,
    variantViews: number
  ): { isSignificant: boolean; pValue: number; confidenceLevel: number } => {
    // Calculate conversion rates
    const controlRate = controlViews > 0 ? controlConversions / controlViews : 0
    const variantRate = variantViews > 0 ? variantConversions / variantViews : 0

    // Calculate pooled standard error
    const pooledRate = (controlConversions + variantConversions) / (controlViews + variantViews)
    const standardError = Math.sqrt(
      pooledRate * (1 - pooledRate) * (1 / controlViews + 1 / variantViews)
    )

    // Calculate z-score
    const zScore = Math.abs(controlRate - variantRate) / standardError

    // Calculate p-value (two-tailed test)
    const pValue = 2 * (1 - normalCDF(Math.abs(zScore)))

    // Determine significance (p < 0.05 for 95% confidence)
    const isSignificant = pValue < 0.05

    return {
      isSignificant,
      pValue,
      confidenceLevel: 1 - pValue
    }
  }

  // Normal CDF approximation for z-score to p-value conversion
  const normalCDF = (z: number): number => {
    const t = 1 / (1 + 0.2316419 * Math.abs(z))
    const d = 0.3989423 * Math.exp(-z * z / 2)
    const probability = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))
    return z > 0 ? 1 - probability : probability
  }

  // Calculate minimum sample size needed
  const calculateMinSampleSize = (
    baselineRate: number = 0.05,
    minimumDetectableEffect: number = 0.1,
    confidenceLevel: number = 0.95,
    power: number = 0.8
  ): number => {
    // Simplified sample size calculation
    const zAlpha = 1.96 // 95% confidence
    const zBeta = 0.84 // 80% power

    const p1 = baselineRate
    const p2 = baselineRate * (1 + minimumDetectableEffect)
    const pBar = (p1 + p2) / 2

    const numerator = Math.pow(zAlpha + zBeta, 2) * 2 * pBar * (1 - pBar)
    const denominator = Math.pow(p2 - p1, 2)

    return Math.ceil(numerator / denominator)
  }

  // Clear all assignments (for testing)
  const clearAssignments = () => {
    if (process.server) return
    localStorage.removeItem(AB_TEST_STORAGE_KEY)
  }

  // Force assignment to specific variant (for testing)
  const forceVariant = (testId: string, variantId: string) => {
    const assignment: ABTestAssignment = {
      testId,
      variantId,
      assignedAt: new Date(),
      sessionId: getSessionId()
    }
    saveAssignment(assignment)
  }

  return {
    assignVariant,
    getVariant,
    trackConversion,
    trackImpression,
    calculateSignificance,
    calculateMinSampleSize,
    clearAssignments,
    forceVariant,
    getSessionId,
    getAssignments
  }
}
