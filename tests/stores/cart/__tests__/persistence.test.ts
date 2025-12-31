/**
 * ts-2: Tests for TypeScript type safety in cart persistence
 *
 * Verifies that the persistence module follows TypeScript best practices:
 * - No loose `any` types for data parameters
 * - Proper error handling with unknown type
 */

import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const persistencePath = resolve(__dirname, '../../../../stores/cart/persistence.ts')

describe('Cart Persistence TypeScript Safety (ts-2)', () => {
  it('should NOT have "data: any" parameter types', () => {
    const source = readFileSync(persistencePath, 'utf-8')
    // Check for data: any parameter which should be data: unknown
    const hasDataAny = /data:\s*any(?![[\w<])/.test(source)
    expect(hasDataAny).toBe(false)
  })

  it('should NOT have "catch (error: any)" pattern', () => {
    const source = readFileSync(persistencePath, 'utf-8')
    const hasCatchAny = /catch\s*\(\s*\w+:\s*any\s*\)/.test(source)
    expect(hasCatchAny).toBe(false)
  })

  it('should use "catch (error: unknown)" or untyped catch', () => {
    const source = readFileSync(persistencePath, 'utf-8')
    // Every catch should use unknown type or have no type annotation
    const catchBlocks = source.match(/catch\s*\([^)]+\)/g) || []
    const allUseUnknownOrUntyped = catchBlocks.every(block =>
      /catch\s*\(\s*\w+:\s*unknown\s*\)/.test(block)
      || /catch\s*\(\s*\w+\s*\)/.test(block)
      || /catch\s*\(\s*\)/.test(block), // Empty catch
    )
    expect(allUseUnknownOrUntyped).toBe(true)
  })

  it('should NOT have loose "any" in variable declarations', () => {
    const source = readFileSync(persistencePath, 'utf-8')
    // Check for any in type annotations like: { key: string, data: any }
    const hasLooseAny = /:\s*any(?![\w<[])/.test(source)
    expect(hasLooseAny).toBe(false)
  })
})
