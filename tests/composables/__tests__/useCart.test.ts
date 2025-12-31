/**
 * vue-2: Tests for useCart composable readonly state
 *
 * Verifies that exposed cart state is wrapped with readonly()
 * to prevent external mutation of internal state.
 *
 * Tests parse the source code to verify readonly() usage since
 * mocking import.meta.client is complex in vitest.
 */

import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const composablePath = resolve(__dirname, '../../../composables/useCart.ts')

describe('useCart Readonly State (vue-2)', () => {
  it('should have composable file', () => {
    expect(existsSync(composablePath)).toBe(true)
  })

  function hasReadonlyWrapper(source: string, propertyName: string): boolean {
    // Check for pattern: const propertyName = computed(() => readonly(cartStore.propertyName))
    const pattern = new RegExp(
      `const\\s+${propertyName}\\s*=\\s*computed\\s*\\(\\s*\\(\\)\\s*=>\\s*readonly\\s*\\(\\s*cartStore\\.${propertyName}\\s*\\)\\s*\\)`,
    )
    return pattern.test(source)
  }

  describe('readonly import', () => {
    it('should import readonly from vue', () => {
      const source = readFileSync(composablePath, 'utf-8')
      expect(/import\s*\{[^}]*readonly[^}]*\}\s*from\s*['"]vue['"]/.test(source)).toBe(true)
    })
  })

  describe('Array state properties should be readonly', () => {
    it('should wrap items with readonly()', () => {
      const source = readFileSync(composablePath, 'utf-8')
      expect(hasReadonlyWrapper(source, 'items')).toBe(true)
    })

    it('should wrap savedForLater with readonly()', () => {
      const source = readFileSync(composablePath, 'utf-8')
      expect(hasReadonlyWrapper(source, 'savedForLater')).toBe(true)
    })

    it('should wrap selectedItems with readonly()', () => {
      const source = readFileSync(composablePath, 'utf-8')
      expect(hasReadonlyWrapper(source, 'selectedItems')).toBe(true)
    })

    it('should wrap recommendations with readonly()', () => {
      const source = readFileSync(composablePath, 'utf-8')
      expect(hasReadonlyWrapper(source, 'recommendations')).toBe(true)
    })
  })

  describe('Object state properties should be readonly', () => {
    it('should wrap performanceMetrics with readonly()', () => {
      const source = readFileSync(composablePath, 'utf-8')
      expect(hasReadonlyWrapper(source, 'performanceMetrics')).toBe(true)
    })
  })
})
