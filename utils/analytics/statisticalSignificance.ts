/**
 * Statistical Significance Calculator
 *
 * Utilities for calculating A/B test statistical significance,
 * p-values, confidence intervals, and sample size requirements.
 */

export interface SignificanceResult {
  isSignificant: boolean
  pValue: number
  confidenceLevel: number
  zScore: number
  lift: number // % improvement
  liftLowerBound?: number
  liftUpperBound?: number
}

export interface SampleSizeResult {
  requiredSampleSize: number
  daysToSignificance: number // estimated days based on current traffic
  currentPower: number
}

/**
 * Calculate Z-score for two proportions
 */
export const calculateZScore = (
  controlConversions: number,
  controlSample: number,
  variantConversions: number,
  variantSample: number
): number => {
  const p1 = controlConversions / controlSample
  const p2 = variantConversions / variantSample

  // Pooled proportion
  const pooledP = (controlConversions + variantConversions) / (controlSample + variantSample)

  // Standard error
  const se = Math.sqrt(pooledP * (1 - pooledP) * (1/controlSample + 1/variantSample))

  // Z-score
  return (p2 - p1) / se
}

/**
 * Calculate p-value from Z-score using normal distribution CDF
 */
export const calculatePValue = (zScore: number): number => {
  // Approximation of the cumulative distribution function for standard normal
  const t = 1 / (1 + 0.2316419 * Math.abs(zScore))
  const d = 0.3989423 * Math.exp(-zScore * zScore / 2)
  const probability = d * t * (
    0.3193815 +
    t * (-0.3565638 +
    t * (1.781478 +
    t * (-1.821256 +
    t * 1.330274)))
  )

  // Two-tailed test
  return 2 * (zScore > 0 ? probability : 1 - probability)
}

/**
 * Calculate confidence interval for lift
 */
export const calculateConfidenceInterval = (
  controlConversions: number,
  controlSample: number,
  variantConversions: number,
  variantSample: number,
  confidenceLevel: number = 0.95
): { lower: number; upper: number } => {
  const p1 = controlConversions / controlSample
  const p2 = variantConversions / variantSample

  const difference = p2 - p1

  // Standard error of difference
  const se = Math.sqrt(
    (p1 * (1 - p1) / controlSample) +
    (p2 * (1 - p2) / variantSample)
  )

  // Z-score for confidence level
  const zAlpha = confidenceLevel === 0.95 ? 1.96 :
                 confidenceLevel === 0.99 ? 2.576 : 1.645

  // Confidence interval
  const margin = zAlpha * se

  return {
    lower: difference - margin,
    upper: difference + margin
  }
}

/**
 * Full statistical significance calculation
 */
export const calculateStatisticalSignificance = (
  controlConversions: number,
  controlSample: number,
  variantConversions: number,
  variantSample: number,
  confidenceLevel: number = 0.95
): SignificanceResult => {
  // Calculate rates
  const controlRate = controlConversions / controlSample
  const variantRate = variantConversions / variantSample

  // Calculate lift
  const lift = controlRate > 0 ? ((variantRate - controlRate) / controlRate) * 100 : 0

  // Calculate Z-score and p-value
  const zScore = calculateZScore(
    controlConversions,
    controlSample,
    variantConversions,
    variantSample
  )
  const pValue = calculatePValue(zScore)

  // Calculate confidence interval for lift
  const ci = calculateConfidenceInterval(
    controlConversions,
    controlSample,
    variantConversions,
    variantSample,
    confidenceLevel
  )

  const liftLowerBound = controlRate > 0 ? (ci.lower / controlRate) * 100 : 0
  const liftUpperBound = controlRate > 0 ? (ci.upper / controlRate) * 100 : 0

  // Determine significance
  const alpha = 1 - confidenceLevel
  const isSignificant = pValue < alpha

  return {
    isSignificant,
    pValue,
    confidenceLevel: 1 - pValue,
    zScore,
    lift,
    liftLowerBound,
    liftUpperBound
  }
}

/**
 * Calculate required sample size
 */
export const calculateRequiredSampleSize = (
  baselineRate: number,
  minimumDetectableEffect: number, // as decimal (0.1 = 10%)
  alpha: number = 0.05, // significance level
  power: number = 0.8 // statistical power
): number => {
  // Z-scores for alpha and beta
  const zAlpha = alpha === 0.05 ? 1.96 : alpha === 0.01 ? 2.576 : 1.645
  const zBeta = power === 0.8 ? 0.84 : power === 0.9 ? 1.28 : 0.84

  const p1 = baselineRate
  const p2 = baselineRate * (1 + minimumDetectableEffect)
  const pBar = (p1 + p2) / 2

  // Sample size per variant
  const n = (
    Math.pow(zAlpha + zBeta, 2) *
    2 * pBar * (1 - pBar)
  ) / Math.pow(p2 - p1, 2)

  return Math.ceil(n)
}

/**
 * Calculate current statistical power
 */
export const calculateStatisticalPower = (
  controlConversions: number,
  controlSample: number,
  variantConversions: number,
  variantSample: number,
  alpha: number = 0.05
): number => {
  const p1 = controlConversions / controlSample
  const p2 = variantConversions / variantSample

  const zAlpha = alpha === 0.05 ? 1.96 : alpha === 0.01 ? 2.576 : 1.645

  const se1 = Math.sqrt((p1 * (1 - p1)) / controlSample)
  const se2 = Math.sqrt((p2 * (1 - p2)) / variantSample)

  const criticalValue = p1 + zAlpha * se1
  const zBeta = (p2 - criticalValue) / se2

  // Approximate power using normal CDF
  const t = 1 / (1 + 0.2316419 * Math.abs(zBeta))
  const d = 0.3989423 * Math.exp(-zBeta * zBeta / 2)
  const probability = d * t * (
    0.3193815 +
    t * (-0.3565638 +
    t * (1.781478 +
    t * (-1.821256 +
    t * 1.330274)))
  )

  return zBeta > 0 ? 1 - probability : probability
}

/**
 * Estimate days to significance
 */
export const estimateDaysToSignificance = (
  requiredSampleSize: number,
  currentSampleSize: number,
  dailyTraffic: number
): number => {
  const remainingSamples = Math.max(0, requiredSampleSize - currentSampleSize)
  return Math.ceil(remainingSamples / dailyTraffic)
}

/**
 * Complete sample size calculation with estimates
 */
export const calculateSampleSizeRequirements = (
  baselineRate: number,
  minimumDetectableEffect: number,
  currentControlSample: number = 0,
  currentVariantSample: number = 0,
  averageDailyTraffic: number = 100,
  alpha: number = 0.05,
  power: number = 0.8
): SampleSizeResult => {
  const requiredSampleSize = calculateRequiredSampleSize(
    baselineRate,
    minimumDetectableEffect,
    alpha,
    power
  )

  const currentSampleSize = Math.min(currentControlSample, currentVariantSample)

  const daysToSignificance = estimateDaysToSignificance(
    requiredSampleSize,
    currentSampleSize,
    averageDailyTraffic / 2 // Divided by 2 for each variant
  )

  const currentPower = currentSampleSize > 0
    ? calculateStatisticalPower(
        currentControlSample * baselineRate,
        currentControlSample,
        currentVariantSample * baselineRate * (1 + minimumDetectableEffect),
        currentVariantSample,
        alpha
      )
    : 0

  return {
    requiredSampleSize,
    daysToSignificance,
    currentPower
  }
}

/**
 * Format significance result for display
 */
export const formatSignificanceResult = (result: SignificanceResult): string => {
  const significant = result.isSignificant ? '✅ Significant' : '❌ Not Significant'
  const confidence = (result.confidenceLevel * 100).toFixed(2)
  const lift = result.lift >= 0 ? `+${result.lift.toFixed(2)}%` : `${result.lift.toFixed(2)}%`

  return `${significant} | ${confidence}% confidence | ${lift} lift | p=${result.pValue.toFixed(4)}`
}
