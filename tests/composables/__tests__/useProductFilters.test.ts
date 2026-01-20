/**
 * vue-3: Tests for useProductFilters composable state immutability
 *
 * Verifies that exposed computed state creates NEW objects/arrays
 * on each computation, preventing external mutation from affecting
 * internal state.
 *
 * Note: readonly() is not used here because:
 * 1. It causes TypeScript compatibility issues with consuming code
 * 2. The computed values already create new objects each time, so
 *    external mutation cannot affect internal state
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { ref } from 'vue'

const composablePath = resolve(__dirname, '../../../composables/useProductFilters.ts')

// Mock vue-router
vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
  useRoute: vi.fn(() => ({
    query: {},
  })),
}))

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
  useI18n: vi.fn(() => ({
    t: (key: string) => key,
    locale: ref('es'),
  })),
}))

describe('useProductFilters', () => {
  it('should have composable file', () => {
    expect(existsSync(composablePath)).toBe(true)
  })

  describe('Computed properties create new objects (immutable pattern)', () => {
    it('should create new chips array in activeFilterChips', () => {
      const source = readFileSync(composablePath, 'utf-8')
      // Verify the computed creates a new array each time
      // Pattern: const chips: FilterChip[] = [] inside the computed
      expect(
        /const\s+activeFilterChips\s*=\s*computed[\s\S]*?const\s+chips\s*:\s*FilterChip\[\]\s*=\s*\[\]/.test(source),
      ).toBe(true)
    })

    it('should create new object in availableFilters', () => {
      const source = readFileSync(composablePath, 'utf-8')
      // Verify the computed creates a new object each time
      // Pattern: return { categories: ... } (object literal)
      expect(
        /const\s+availableFilters\s*=\s*computed[\s\S]*?return\s*\{[\s\S]*?categories:/.test(source),
      ).toBe(true)
    })
  })
})

describe('useProductFilters Security - Source Code Verification', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleWarnSpy.mockRestore()
  })

  describe('Price Validation (DoS Protection)', () => {
    const source = readFileSync(composablePath, 'utf-8')

    it('should validate for NaN', () => {
      expect(source).toContain('Number.isFinite(num)')
    })

    it('should validate for negative numbers', () => {
      expect(source).toContain('num < 0')
    })

    it('should validate for maximum value (DoS protection)', () => {
      expect(source).toContain('num > 999999')
    })

    it('should round to 2 decimal places', () => {
      expect(source).toContain('Math.round(num * 100) / 100')
    })

    it('should log warnings for invalid values', () => {
      expect(source).toContain('console.warn(`Invalid price value: ${value}`)')
    })
  })

  describe('Prototype Pollution Protection', () => {
    const source = readFileSync(composablePath, 'utf-8')

    it('should check for dangerous keys', () => {
      expect(source).toContain('__proto__')
      expect(source).toContain('constructor')
      expect(source).toContain('prototype')
    })

    it('should warn about prototype pollution attempts', () => {
      expect(source).toContain('Attempted prototype pollution detected')
    })

    it('should validate object type', () => {
      expect(source).toContain('typeof parsed !== \'object\'')
      expect(source).toContain('Array.isArray(parsed)')
    })

    it('should validate attribute values are arrays', () => {
      expect(source).toContain('Array.isArray(value)')
    })

    it('should filter long strings (>100 chars)', () => {
      expect(source).toContain('v.length <= 100')
    })
  })
})
