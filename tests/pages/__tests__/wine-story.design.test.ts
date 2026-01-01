/**
 * design-1: Tests for wine-story page design compliance
 *
 * Verifies that the wine-story page follows design-guide principles:
 * - No gradient backgrounds (solid colors preferred)
 * - Clean, minimal design
 */

import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const pagePath = resolve(__dirname, '../../../pages/wine-story.vue')

describe('Wine Story Page Design (design-1)', () => {
  it('should have page file', () => {
    expect(existsSync(pagePath)).toBe(true)
  })

  describe('Gradient removal', () => {
    it('should NOT have gradient-to-* classes', () => {
      const source = readFileSync(pagePath, 'utf-8')

      // Check for Tailwind gradient direction classes
      const hasGradientTo = /\bbg-gradient-to-(br|bl|tr|tl|t|b|l|r)\b/.test(source)
      expect(hasGradientTo).toBe(false)
    })

    it('should NOT have from-*/via-*/to-* gradient color classes', () => {
      const source = readFileSync(pagePath, 'utf-8')

      // Check for gradient color classes (from-, via-, to-)
      // These are part of gradient definitions
      const hasFromClass = /\bfrom-[a-zA-Z]/.test(source)
      const hasViaClass = /\bvia-[a-zA-Z]/.test(source)
      const hasToClass = /\bto-[a-zA-Z]/.test(source)

      expect(hasFromClass).toBe(false)
      expect(hasViaClass).toBe(false)
      expect(hasToClass).toBe(false)
    })

    it('should NOT have radial-gradient in inline styles', () => {
      const source = readFileSync(pagePath, 'utf-8')

      const hasRadialGradient = /radial-gradient/.test(source)
      expect(hasRadialGradient).toBe(false)
    })

    it('should NOT have linear-gradient in inline styles', () => {
      const source = readFileSync(pagePath, 'utf-8')

      const hasLinearGradient = /linear-gradient/.test(source)
      expect(hasLinearGradient).toBe(false)
    })
  })

  describe('Design compliance', () => {
    it('should use solid brand colors instead', () => {
      const source = readFileSync(pagePath, 'utf-8')

      // Should use solid colors like bg-primary, bg-gold-*, bg-slate-*
      const hasSolidBgColors = /\bbg-(primary|gold|slate|terracotta|white|gray)/.test(source)
      expect(hasSolidBgColors).toBe(true)
    })
  })
})
