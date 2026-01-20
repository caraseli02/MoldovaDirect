/**
 * Test: Missing Import Detection for pages/products/index.vue
 *
 * TDD Cycle: RED phase
 * This test verifies that error handling is properly delegated to the composable
 *
 * Updated: After refactoring to use useProductsPage composable
 * Error handling is now handled by the composable, not the page directly
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const componentPath = resolve(process.cwd(), 'pages/products/index.vue')
const composablePath = resolve(process.cwd(), 'composables/useProductsPage.ts')

describe('pages/products/index.vue - Import Validation', () => {
  let componentSource: string
  let composableSource: string

  beforeEach(() => {
    componentSource = readFileSync(componentPath, 'utf-8')
    composableSource = readFileSync(composablePath, 'utf-8')
  })

  describe('useProductsPage composable', () => {
    it('should import useProductsPage composable', () => {
      const hasComposableImport = componentSource.includes('useProductsPage')

      expect(hasComposableImport).toBe(true)
    })

    it('should use useProductsPage for business logic', () => {
      const hasComposableUsage = componentSource.includes('useProductsPage({')

      expect(hasComposableUsage).toBe(true)
    })
  })

  describe('error handling delegation', () => {
    it('should delegate error handling to composable', () => {
      // After refactoring, error handling is in the composable
      const hasGetErrorMessageInComposable = composableSource.includes('getErrorMessage')
      const hasComposableImportInPage = componentSource.includes('useProductsPage')

      // Composable should handle errors, page should use composable
      expect(hasGetErrorMessageInComposable).toBe(true)
      expect(hasComposableImportInPage).toBe(true)
    })

    it('should have retryLoad function from composable', () => {
      // Error recovery (retryLoad) should be provided by composable
      const hasRetryLoadDestructuring = componentSource.includes('retryLoad')
      const hasRetryLoadUsage = componentSource.includes('@retry="retryLoad"')

      expect(hasRetryLoadDestructuring).toBe(true)
      expect(hasRetryLoadUsage).toBe(true)
    })
  })

  describe('debounce utility', () => {
    it('should use VueUse useDebounceFn (SSR-friendly)', () => {
      // Composable should import useDebounceFn from @vueuse/core
      // VueUse is explicitly SSR-friendly and is the recommended approach for Nuxt
      const hasVueUseImport = composableSource.includes('import { useDebounceFn } from \'@vueuse/core\'')

      expect(hasVueUseImport).toBe(true)
    })
  })
})
