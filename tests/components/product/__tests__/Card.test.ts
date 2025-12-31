/**
 * vue-1: Tests for ProductCard props reactivity pattern
 *
 * Verifies that the component uses `props.product` access pattern
 * instead of destructuring, which would lose reactivity.
 */

import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const componentPath = resolve(__dirname, '../../../../components/product/Card.vue')

describe('ProductCard Props Reactivity (vue-1)', () => {
  it('should have component file', () => {
    expect(existsSync(componentPath)).toBe(true)
  })

  describe('Props access pattern', () => {
    it('should use props.product instead of destructuring', () => {
      const source = readFileSync(componentPath, 'utf-8')

      // Check that props.product pattern is used
      const usesPropsAccess = /props\.product\./.test(source)
      expect(usesPropsAccess).toBe(true)
    })

    it('should NOT destructure product from props at top level', () => {
      const source = readFileSync(componentPath, 'utf-8')

      // Check for destructuring patterns that would break reactivity
      // Pattern: const { product } = props or const { product } = defineProps
      const hasDestructuring = /const\s*\{\s*product\s*[,}]/.test(source)
      expect(hasDestructuring).toBe(false)
    })

    it('should define props with withDefaults or defineProps', () => {
      const source = readFileSync(componentPath, 'utf-8')

      // Check that props are properly defined
      const hasPropsDefinition = /const\s+props\s*=\s*(withDefaults\s*\(\s*)?defineProps/.test(source)
      expect(hasPropsDefinition).toBe(true)
    })
  })
})
