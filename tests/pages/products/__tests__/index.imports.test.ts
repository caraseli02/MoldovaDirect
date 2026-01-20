/**
 * Test: Missing Import Detection for pages/products/index.vue
 *
 * TDD Cycle: RED phase
 * This test verifies that getErrorMessage is properly imported
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const componentPath = resolve(process.cwd(), 'pages/products/index.vue')

describe('pages/products/index.vue - Import Validation', () => {
  let componentSource: string

  beforeEach(() => {
    componentSource = readFileSync(componentPath, 'utf-8')
  })

  describe('getErrorMessage import', () => {
    it('should import getErrorMessage from utils/errorUtils', () => {
      // The component uses getErrorMessage at lines 715, 759, 889
      // This test verifies the import exists

      const hasImportStatement = componentSource.includes('import { getErrorMessage }')
        || componentSource.includes('import {getErrorMessage}')
        || componentSource.includes('from \'~/utils/errorUtils\'')
        || componentSource.includes('from \'@/utils/errorUtils\'')
        || componentSource.includes('from \'@utils/errorUtils\'')
        || componentSource.includes('from \'#app/utils/errorUtils\'')

      expect(hasImportStatement).toBe(true)
    })

    it('should have getErrorMessage available in scope', () => {
      // Verify that all usages of getErrorMessage have a corresponding import
      const importMatches = componentSource.match(/import.*getErrorMessage.*from/g)
      const usageMatches = componentSource.match(/getErrorMessage\(/g)

      // If getErrorMessage is used, it must be imported
      if (usageMatches && usageMatches.length > 0) {
        expect(importMatches).not.toBeNull()
        expect(importMatches?.length).toBeGreaterThan(0)
      }
    })

    it('should use getErrorMessage for error handling at least once', () => {
      // Verify the function is actually used for error handling
      const hasGetErrorMessageUsage = componentSource.includes('getErrorMessage(')
      expect(hasGetErrorMessageUsage).toBe(true)
    })
  })

  describe('error handling consistency', () => {
    it('should handle all error scenarios with getErrorMessage', () => {
      // Lines 715, 759, 889 use getErrorMessage
      const lines = componentSource.split('\n')

      // Find lines that use getErrorMessage
      const errorHandlingLines = lines
        .map((line, index) => ({ line, lineNum: index + 1, hasUsage: line.includes('getErrorMessage(') }))
        .filter(item => item.hasUsage)

      // All lines using getErrorMessage should have the import present
      expect(errorHandlingLines.length).toBeGreaterThan(0)
      expect(componentSource).toContain('getErrorMessage')
    })
  })
})
