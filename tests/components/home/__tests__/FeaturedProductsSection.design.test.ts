/**
 * design-3: Tests for FeaturedProductsSection design compliance
 *
 * Verifies that the component follows design-guide principles:
 * - No gradient backgrounds (solid colors preferred)
 * - Clean, minimal design for skeleton loaders
 */

import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const componentPath = resolve(__dirname, '../../../../components/home/FeaturedProductsSection.vue')

describe('FeaturedProductsSection Design (design-3)', () => {
  it('should have component file', () => {
    expect(existsSync(componentPath)).toBe(true)
  })

  describe('Gradient removal', () => {
    it('should NOT have gradient-to-* classes', () => {
      const source = readFileSync(componentPath, 'utf-8')

      const hasGradientTo = /\bbg-gradient-to-(br|bl|tr|tl|t|b|l|r)\b/.test(source)
      expect(hasGradientTo).toBe(false)
    })

    it('should NOT have from-*/via-*/to-* gradient color classes', () => {
      const source = readFileSync(componentPath, 'utf-8')

      const hasFromClass = /\bfrom-[a-zA-Z]/.test(source)
      const hasViaClass = /\bvia-[a-zA-Z]/.test(source)
      const hasToClass = /\bto-[a-zA-Z]/.test(source)

      expect(hasFromClass).toBe(false)
      expect(hasViaClass).toBe(false)
      expect(hasToClass).toBe(false)
    })
  })

  describe('Skeleton loaders', () => {
    it('should use solid colors for skeleton placeholders', () => {
      const source = readFileSync(componentPath, 'utf-8')

      // Should use solid bg-gray colors for skeletons
      const hasSolidSkeletonColors = /\bbg-gray-(100|200|300)/.test(source)
      expect(hasSolidSkeletonColors).toBe(true)
    })

    it('should still have animate-pulse for loading effect', () => {
      const source = readFileSync(componentPath, 'utf-8')

      const hasAnimatePulse = /\banimate-pulse\b/.test(source)
      expect(hasAnimatePulse).toBe(true)
    })
  })
})
