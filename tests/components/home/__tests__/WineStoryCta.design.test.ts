/**
 * design-2: Tests for WineStoryCta component design compliance
 *
 * Verifies that the component follows design-guide principles:
 * - No gradient backgrounds (solid colors preferred)
 * - Clean, minimal design
 */

import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const componentPath = resolve(__dirname, '../../../../components/home/WineStoryCta.vue')

describe('WineStoryCta Design (design-2)', () => {
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

    it('should NOT have radial-gradient in inline styles', () => {
      const source = readFileSync(componentPath, 'utf-8')

      const hasRadialGradient = /radial-gradient/.test(source)
      expect(hasRadialGradient).toBe(false)
    })
  })

  describe('Design compliance', () => {
    it('should use solid brand colors', () => {
      const source = readFileSync(componentPath, 'utf-8')

      const hasSolidBgColors = /\bbg-(primary|gold|slate|terracotta|white|gray)/.test(source)
      expect(hasSolidBgColors).toBe(true)
    })
  })
})
