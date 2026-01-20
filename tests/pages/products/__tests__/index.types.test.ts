/**
 * Test: Type Safety Validation for pages/products/index.vue
 *
 * TDD Cycle: RED phase
 * This test verifies type safety - no double assertions or unsafe casts
 *
 * Updated: After refactoring to use useProductsPage composable
 * Types are now handled by the composable, not imported directly in the page
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const componentPath = resolve(process.cwd(), 'pages/products/index.vue')

describe('pages/products/index.vue - Type Safety Validation', () => {
  let componentSource: string
  let lines: string[]

  beforeEach(() => {
    componentSource = readFileSync(componentPath, 'utf-8')
    lines = componentSource.split('\n')
  })

  describe('double type assertions', () => {
    it('should not use double assertion pattern (as unknown as)', () => {
      // Double assertion indicates a type mismatch that should be fixed properly
      const hasDoubleAssertion = componentSource.includes(' as unknown as ')

      expect(hasDoubleAssertion).toBe(false)
    })

    it('should not have availableFilters double assertion on template', () => {
      // The component should properly type availableFilters instead of using double assertion
      const problematicLine = lines.find(line =>
        line.includes('availableFilters')
        && line.includes(' as unknown as '),
      )

      expect(problematicLine).toBeUndefined()
    })
  })

  describe('unsafe type casts', () => {
    it('should not cast page as number without validation', () => {
      // Instead of `goToPage(page as number)`, the type should be correct
      // or use proper type guards
      const hasUnsafePageCast = lines.some(line =>
        line.includes('page as number')
        && line.includes('goToPage'),
      )

      expect(hasUnsafePageCast).toBe(false)
    })

    it('should use proper type guards for union types', () => {
      // For union types (like string | number), use proper guards
      // instead of direct casting
      const hasDirectAsCast = lines.filter(line =>
        line.match(/'\w+' as \w+/)
        || line.match(/"\w+" as \w+/)
        || line.match(/\w+\[\w+\] as \w+/),
      )

      // Some casts are OK if properly validated, but patterns like 'page as number' are not
      const hasProblematicCast = hasDirectAsCast.some(line =>
        line.includes(' as number')
        && !line.includes('//'),
      )

      expect(hasProblematicCast).toBe(false)
    })
  })

  describe('proper type definitions', () => {
    it('should use useProductsPage composable for type-safe business logic', () => {
      // After refactoring, types are handled by the composable
      const hasComposableImport = componentSource.includes('useProductsPage')
      const hasComposableUsage = componentSource.includes('useProductsPage({')

      expect(hasComposableImport).toBe(true)
      expect(hasComposableUsage).toBe(true)
    })

    it('should use proper typing for availableFilters', () => {
      // Instead of double assertion, the type should be properly defined
      const hasDoubleAssertionInAvailableFilters = lines.some(line =>
        line.includes('availableFilters')
        && line.includes(' as unknown as '),
      )

      expect(hasDoubleAssertionInAvailableFilters).toBe(false)
    })
  })

  describe('type-safe pagination', () => {
    it('should not use unsafe casts for pagination page values', () => {
      const hasUnsafeCast = lines.some(line =>
        line.includes('page as number')
        && !line.includes('// OK:'),
      )

      expect(hasUnsafeCast).toBe(false)
    })
  })
})
