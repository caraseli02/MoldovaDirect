/**
 * a11y-3: Accessibility tests for TemplateHistory dialog
 *
 * Tests that the dialog has a DialogDescription for proper ARIA labeling
 */

import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const componentPath = resolve(__dirname, '../../../../components/admin/Email/TemplateHistory.vue')

describe('TemplateHistory Accessibility (a11y-3)', () => {
  it('should have component file', () => {
    expect(existsSync(componentPath)).toBe(true)
  })

  describe('Dialog Description', () => {
    function hasDialogDescription(source: string): {
      importsDialogDescription: boolean
      usesDialogDescription: boolean
      hasDescriptionContent: boolean
    } {
      // Check import
      const hasImport = /DialogDescription/.test(source)
        && /from\s+['"][@/~].*components\/ui\/dialog['"]/.test(source)

      // Check usage in template
      const usesInTemplate = /<DialogDescription[\s>]/.test(source)

      // Check that description has content (not empty)
      const hasContent = /<DialogDescription[^>]*>[^<]+<\/DialogDescription>/.test(source)
        || /<DialogDescription[^>]*>\s*\{\{[^}]+\}\}\s*<\/DialogDescription>/.test(source)
        || /<DialogDescription[^>]*>\s*<[^>]+>[^<]+/.test(source)

      return {
        importsDialogDescription: hasImport,
        usesDialogDescription: usesInTemplate,
        hasDescriptionContent: hasContent,
      }
    }

    it('should import DialogDescription from ui/dialog', () => {
      const source = readFileSync(componentPath, 'utf-8')
      const result = hasDialogDescription(source)
      expect(result.importsDialogDescription).toBe(true)
    })

    it('should use DialogDescription in the template', () => {
      const source = readFileSync(componentPath, 'utf-8')
      const result = hasDialogDescription(source)
      expect(result.usesDialogDescription).toBe(true)
    })

    it('should have meaningful content in DialogDescription', () => {
      const source = readFileSync(componentPath, 'utf-8')
      const result = hasDialogDescription(source)
      expect(result.hasDescriptionContent).toBe(true)
    })
  })

  describe('Dialog Structure', () => {
    it('should have DialogTitle before DialogDescription', () => {
      const source = readFileSync(componentPath, 'utf-8')
      const titleMatch = source.match(/<DialogTitle/)
      const descMatch = source.match(/<DialogDescription/)

      if (titleMatch && descMatch) {
        expect(titleMatch.index).toBeLessThan(descMatch.index!)
      }
      else {
        // If no description, fail the test
        expect(descMatch).not.toBeNull()
      }
    })

    it('should have DialogDescription inside DialogHeader', () => {
      const source = readFileSync(componentPath, 'utf-8')
      // Check that DialogDescription appears between DialogHeader tags
      const headerMatch = source.match(/<DialogHeader>([\s\S]*?)<\/DialogHeader>/)
      expect(headerMatch).not.toBeNull()
      expect(headerMatch?.[1]).toMatch(/<DialogDescription/)
    })
  })
})
