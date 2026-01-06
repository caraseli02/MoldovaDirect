/**
 * ts-1: Tests for TypeScript type safety in useAnalytics composable
 *
 * Verifies that the composable follows TypeScript best practices:
 * - No loose `any` types (except in Record<string, unknown> for JSON metadata)
 * - Proper error handling with unknown type
 * - Typed API responses
 */

import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const composablePath = resolve(__dirname, '../../../composables/useAnalytics.ts')

describe('useAnalytics TypeScript Safety (ts-1)', () => {
  it('should NOT have loose "as any" type assertions', () => {
    const source = readFileSync(composablePath, 'utf-8')
    // Check for `as any` that isn't followed by something else (like `as any[]`)
    const hasLooseAsAny = /\)\s+as\s+any(?!\[|<)/.test(source)
    expect(hasLooseAsAny).toBe(false)
  })

  it('should NOT have "catch (err: unknown)" pattern', () => {
    const source = readFileSync(composablePath, 'utf-8')
    const hasCatchAny = /catch\s*\(\s*\w+:\s*any\s*\)/.test(source)
    expect(hasCatchAny).toBe(false)
  })

  it('should use "catch (variable: unknown)" pattern', () => {
    const source = readFileSync(composablePath, 'utf-8')
    // Every catch should use unknown type or have no type annotation
    const catchBlocks = source.match(/catch\s*\([^)]+\)/g) || []
    const allUseUnknown = catchBlocks.every(block =>
      /catch\s*\(\s*\w+:\s*unknown\s*\)/.test(block)
      || /catch\s*\(\s*\w+\s*\)/.test(block), // No type annotation also acceptable
    )
    expect(allUseUnknown).toBe(true)
  })

  it('should have typed API response interfaces', () => {
    const source = readFileSync(composablePath, 'utf-8')
    // Check that we import API response types
    const hasResponseTypes = /import.*ApiResponse|interface.*ApiResponse/.test(source)
      || /ApiDataResponse|AnalyticsApiResponse/.test(source)
      || /$fetch<[^>]+>/.test(source) // Generic typed $fetch calls
    expect(hasResponseTypes).toBe(true)
  })

  it('should NOT use Record<string, any> for metadata params', () => {
    const source = readFileSync(composablePath, 'utf-8')
    // Check for Record<string, any> which should be Record<string, unknown>
    const hasRecordAny = /Record<string,\s*any>/.test(source)
    expect(hasRecordAny).toBe(false)
  })
})
