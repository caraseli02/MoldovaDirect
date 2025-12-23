/**
 * Shared formatting utilities for currency, numbers, and percentages
 */

/**
 * Format a number as currency (EUR)
 */
export function formatCurrency(value?: number | null): string {
  if (!value && value !== 0) {
    return '€0.00'
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
  }).format(value)
}

/**
 * Format a number as a percentage with one decimal place
 */
export function formatPercent(value?: number | null): string {
  if (!value && value !== 0) {
    return '0%'
  }

  return `${value.toFixed(1)}%`
}

/**
 * Calculate and format a percentage from part/total safely
 */
export function formatPercentSafe(part: number, total: number): string {
  if (!total) return '0%'
  return `${Math.min(100, Math.round((part / total) * 100))}%`
}

/**
 * Format a number with thousand separators, no decimals
 */
export function formatNumber(value?: number | null): string {
  if (!value && value !== 0) {
    return '0'
  }

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Format a delta/change as a percentage with +/- sign
 */
export function formatDelta(delta: number): string {
  if (!Number.isFinite(delta) || delta === 0) return '0%'
  const formatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 })
  return `${delta > 0 ? '+' : ''}${formatter.format(delta)}%`
}

/**
 * Resolve trend direction based on delta threshold
 */
export function resolveDirection(delta: number): 'up' | 'down' | 'flat' {
  if (delta > 5) return 'up'
  if (delta < -5) return 'down'
  return 'flat'
}
