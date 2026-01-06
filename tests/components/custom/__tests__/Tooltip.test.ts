/**
 * a11y-6: Accessibility tests for custom Tooltip component
 *
 * Tests that the tooltip has proper ARIA relationships:
 * - Trigger has aria-describedby pointing to tooltip id
 * - Tooltip has role="tooltip" (already present)
 * - Tooltip has a unique id
 */

import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const componentPath = resolve(__dirname, '../../../../components/custom/Tooltip.vue')

describe('Tooltip ARIA Relationships (a11y-6)', () => {
  it('should have component file', () => {
    expect(existsSync(componentPath)).toBe(true)
  })

  describe('ARIA Relationships', () => {
    function hasProperARIA(source: string): {
      hasTooltipRole: boolean
      hasTooltipId: boolean
      hasAriaDescribedby: boolean
      usesUniqueId: boolean
    } {
      // Check tooltip has role="tooltip"
      const hasTooltipRole = /role="tooltip"/.test(source)

      // Check tooltip has an id attribute
      const hasTooltipId = /:id="tooltipId"/.test(source) || /id="[^"]*tooltip/.test(source)

      // Check trigger has aria-describedby
      const hasAriaDescribedby = /:aria-describedby="tooltipId"/.test(source)
        || /aria-describedby=/.test(source)

      // Check that component generates unique IDs (useId or similar)
      const usesUniqueId = /useId\(\)/.test(source)
        || /tooltipId/.test(source)
        || /uniqueId/.test(source)

      return {
        hasTooltipRole,
        hasTooltipId,
        hasAriaDescribedby,
        usesUniqueId,
      }
    }

    it('should have role="tooltip" on tooltip element', () => {
      const source = readFileSync(componentPath, 'utf-8')
      const result = hasProperARIA(source)
      expect(result.hasTooltipRole).toBe(true)
    })

    it('should have an id attribute on tooltip element', () => {
      const source = readFileSync(componentPath, 'utf-8')
      const result = hasProperARIA(source)
      expect(result.hasTooltipId).toBe(true)
    })

    it('should have aria-describedby on trigger element', () => {
      const source = readFileSync(componentPath, 'utf-8')
      const result = hasProperARIA(source)
      expect(result.hasAriaDescribedby).toBe(true)
    })

    it('should generate unique ID for tooltip', () => {
      const source = readFileSync(componentPath, 'utf-8')
      const result = hasProperARIA(source)
      expect(result.usesUniqueId).toBe(true)
    })
  })

  describe('Keyboard Accessibility', () => {
    it('should handle focus events for keyboard users', () => {
      const source = readFileSync(componentPath, 'utf-8')
      // Check that trigger responds to focus/blur
      expect(/@focus="show"/.test(source)).toBe(true)
      expect(/@blur="hide"/.test(source)).toBe(true)
    })
  })
})
