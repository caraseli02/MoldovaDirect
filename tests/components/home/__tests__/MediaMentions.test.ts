/**
 * a11y-7: Accessibility tests for MediaMentions tooltips
 *
 * Tests that the CSS-only tooltip is keyboard accessible:
 * - Button has aria-describedby pointing to tooltip id
 * - Tooltip has a unique id
 * - Focus-within triggers tooltip visibility (CSS)
 */

import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const componentPath = resolve(__dirname, '../../../../components/home/MediaMentions.vue')

describe('MediaMentions Tooltip Accessibility (a11y-7)', () => {
  it('should have component file', () => {
    expect(existsSync(componentPath)).toBe(true)
  })

  describe('ARIA Relationships', () => {
    function hasProperARIA(source: string): {
      hasTooltipRole: boolean
      hasTooltipId: boolean
      hasAriaDescribedby: boolean
    } {
      // Check tooltip has role="tooltip"
      const hasTooltipRole = /role="tooltip"/.test(source)

      // Check tooltip has an id attribute
      const hasTooltipId = /:id="[^"]*tooltip[^"]*"/.test(source)
        || /\bid="[^"]*tooltip/.test(source)
        || /:id="`tooltip-/.test(source)

      // Check button has aria-describedby
      const hasAriaDescribedby = /:aria-describedby="[^"]*tooltip/.test(source)
        || /:aria-describedby="`tooltip-/.test(source)

      return {
        hasTooltipRole,
        hasTooltipId,
        hasAriaDescribedby,
      }
    }

    it('should have role="tooltip" on tooltip element', () => {
      const source = readFileSync(componentPath, 'utf-8')
      const result = hasProperARIA(source)
      expect(result.hasTooltipRole).toBe(true)
    })

    it('should have id attribute on tooltip element', () => {
      const source = readFileSync(componentPath, 'utf-8')
      const result = hasProperARIA(source)
      expect(result.hasTooltipId).toBe(true)
    })

    it('should have aria-describedby on button element', () => {
      const source = readFileSync(componentPath, 'utf-8')
      const result = hasProperARIA(source)
      expect(result.hasAriaDescribedby).toBe(true)
    })
  })

  describe('Keyboard Accessibility', () => {
    it('should show tooltip on focus-within (CSS)', () => {
      const source = readFileSync(componentPath, 'utf-8')
      // Check that CSS uses focus-within to show tooltip
      expect(/group-focus-within:.*opacity-100/.test(source)
        || /focus-within:.*opacity-100/.test(source)).toBe(true)
    })

    it('should have focus-visible styles on button', () => {
      const source = readFileSync(componentPath, 'utf-8')
      // Check button has focus-visible styles
      expect(/focus-visible:/.test(source)).toBe(true)
    })
  })
})
