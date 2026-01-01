/**
 * a11y-5: Accessibility tests for ProducerDetailModal
 *
 * Tests that the dialog has a DialogDescription for proper ARIA labeling
 * Note: This component uses UiDialog* prefix for auto-imported components
 */

import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const componentPath = resolve(__dirname, '../../../../components/producer/DetailModal.vue')

describe('ProducerDetailModal Accessibility (a11y-5)', () => {
  it('should have component file', () => {
    expect(existsSync(componentPath)).toBe(true)
  })

  describe('Dialog Description', () => {
    function hasDialogDescription(source: string): {
      usesDialogDescription: boolean
      hasDescriptionContent: boolean
    } {
      // Component uses auto-imported UiDialogDescription
      const usesInTemplate = /<UiDialogDescription[\s>]/.test(source)

      // Check that description has content (not empty)
      const hasContent = /<UiDialogDescription[^>]*>[^<]+<\/UiDialogDescription>/.test(source)
        || /<UiDialogDescription[^>]*>\s*\{\{[^}]+\}\}\s*<\/UiDialogDescription>/.test(source)
        || /<UiDialogDescription[^>]*>\s*<[^>]+>[^<]+/.test(source)

      return {
        usesDialogDescription: usesInTemplate,
        hasDescriptionContent: hasContent,
      }
    }

    it('should use UiDialogDescription in the template', () => {
      const source = readFileSync(componentPath, 'utf-8')
      const result = hasDialogDescription(source)
      expect(result.usesDialogDescription).toBe(true)
    })

    it('should have meaningful content in UiDialogDescription', () => {
      const source = readFileSync(componentPath, 'utf-8')
      const result = hasDialogDescription(source)
      expect(result.hasDescriptionContent).toBe(true)
    })
  })

  describe('Dialog Structure', () => {
    it('should have UiDialogTitle before UiDialogDescription', () => {
      const source = readFileSync(componentPath, 'utf-8')
      const titleMatch = source.match(/<UiDialogTitle/)
      const descMatch = source.match(/<UiDialogDescription/)

      if (titleMatch && descMatch) {
        expect(titleMatch.index).toBeLessThan(descMatch.index!)
      }
      else {
        // If no description, fail the test
        expect(descMatch).not.toBeNull()
      }
    })

    it('should have UiDialogDescription inside UiDialogHeader', () => {
      const source = readFileSync(componentPath, 'utf-8')
      // Check that UiDialogDescription appears between UiDialogHeader tags
      const headerMatch = source.match(/<UiDialogHeader>([\s\S]*?)<\/UiDialogHeader>/)
      expect(headerMatch).not.toBeNull()
      expect(headerMatch?.[1]).toMatch(/<UiDialogDescription/)
    })
  })
})
