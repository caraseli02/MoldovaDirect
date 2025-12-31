/**
 * ts-4: Tests for TypeScript type safety in database types
 *
 * Verifies that product attributes are properly typed
 * instead of using loose Record<string, any>
 */

import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const databaseTypesPath = resolve(__dirname, '../../../types/database.ts')

describe('Database Types TypeScript Safety (ts-4)', () => {
  it('should NOT use Record<string, any> for product attributes', () => {
    const source = readFileSync(databaseTypesPath, 'utf-8')
    // Check for Record<string, any> pattern
    const hasRecordAny = /attributes\?:\s*Record<string,\s*any>/.test(source)
    expect(hasRecordAny).toBe(false)
  })

  it('should have a ProductAttributes type definition', () => {
    const source = readFileSync(databaseTypesPath, 'utf-8')
    // Check that ProductAttributes is defined or imported
    const hasProductAttributesType = /ProductAttributes/.test(source)
    expect(hasProductAttributesType).toBe(true)
  })

  it('should NOT have loose any types in Product interface', () => {
    const source = readFileSync(databaseTypesPath, 'utf-8')
    // Extract the Product interface and check for any
    const productMatch = source.match(/export interface Product \{[\s\S]*?\n\}/m)
    if (productMatch) {
      const productInterface = productMatch[0]
      const hasAny = /:\s*any(?!\[)/.test(productInterface)
      expect(hasAny).toBe(false)
    }
  })
})
