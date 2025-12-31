/**
 * ts-3: Tests for TypeScript type safety in useTestingDashboard composable
 *
 * Verifies that the composable follows TypeScript best practices:
 * - No loose `any` types (except for deliberate unknown patterns)
 * - Proper error handling with unknown type
 * - Typed API responses
 */

import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const composablePath = resolve(__dirname, '../../../composables/useTestingDashboard.ts')

describe('useTestingDashboard TypeScript Safety (ts-3)', () => {
  it('should NOT have "as any" type assertions', () => {
    const source = readFileSync(composablePath, 'utf-8')
    // Check for `as any` assertions
    const hasAsAny = /\)\s+as\s+any(?!\[)/.test(source)
    expect(hasAsAny).toBe(false)
  })

  it('should NOT have "catch (err: unknown)" pattern', () => {
    const source = readFileSync(composablePath, 'utf-8')
    const hasCatchAny = /catch\s*\(\s*\w+:\s*any\s*\)/.test(source)
    expect(hasCatchAny).toBe(false)
  })

  it('should use "catch (error: unknown)" or untyped catch', () => {
    const source = readFileSync(composablePath, 'utf-8')
    // Every catch should use unknown type or have no type annotation
    const catchBlocks = source.match(/catch\s*\([^)]+\)/g) || []
    const allUseUnknownOrUntyped = catchBlocks.every(block =>
      /catch\s*\(\s*\w+:\s*unknown\s*\)/.test(block)
      || /catch\s*\(\s*\w+\s*\)/.test(block)
      || /catch\s*\(\s*\)/.test(block),
    )
    expect(allUseUnknownOrUntyped).toBe(true)
  })

  it('should NOT have loose "any" parameter types in functions', () => {
    const source = readFileSync(composablePath, 'utf-8')
    // Check for parameter types like (error: any) or (value: any) in function signatures
    // Excludes catch blocks which are checked separately
    const hasAnyParam = /(?<!catch\s*)\(\s*\w+:\s*any\s*[,)]/.test(source)
    expect(hasAnyParam).toBe(false)
  })

  it('should have typed API response interfaces', () => {
    const source = readFileSync(composablePath, 'utf-8')
    // Check that response types are defined
    const hasResponseTypes = /interface.*Response|type.*Response|SeedDataResponse|CleanupResponse|StatsResponse/.test(source)
      || /$fetch<[^>]+>/.test(source) // Generic typed $fetch calls
    expect(hasResponseTypes).toBe(true)
  })
})
