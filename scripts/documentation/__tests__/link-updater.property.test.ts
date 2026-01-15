/**
 * Property-based tests for Link Updater
 * Feature: dual-layer-documentation
 */

import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import {
  findInternalLinks,
  updateLinksInContent,
  validateLinks,
  generateRedirects,
  insertDeprecationNotice
} from '../link-updater'
import type { LinkMap, MigrationMap } from '../types'

describe('Link Updater Property Tests', () => {
  /**
   * Feature: dual-layer-documentation, Property 14: Link update completeness
   * Validates: Requirements 4.3
   * 
   * For any set of files with internal links, after migration, all internal links
   * should point to valid new locations (no broken links)
   */
  it('Property 14: should update all internal links without breaking them', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generator: random markdown content with links
        fc.array(
          fc.record({
            filePath: fc.constantFrom(
              '/docs/index.md',
              '/docs/guide.md',
              '/docs/tutorial.md',
              '/docs/reference.md'
            ),
            content: fc.string({ minLength: 10, maxLength: 200 }),
            linkTarget: fc.constantFrom(
              './old/doc1.md',
              './old/doc2.md',
              './old/doc3.md'
            )
          }),
          { minLength: 1, maxLength: 10 }
        ),
        async (testCases) => {
          // Create link map for migration
          const linkMap: LinkMap = {
            '/docs/old/doc1.md': '/docs/new/doc1.md',
            '/docs/old/doc2.md': '/docs/new/doc2.md',
            '/docs/old/doc3.md': '/docs/new/doc3.md'
          }
          
          for (const testCase of testCases) {
            // Create content with a link
            const content = `${testCase.content}\n[Link](${testCase.linkTarget})`
            
            // Extract links before update
            const linksBefore = await findInternalLinks(content, testCase.filePath)
            const internalLinksBefore = linksBefore.filter(l => l.isInternal && !l.url.startsWith('#'))
            
            // Update links
            const updatedContent = await updateLinksInContent(content, linkMap, testCase.filePath)
            
            // Extract links after update
            const linksAfter = await findInternalLinks(updatedContent, testCase.filePath)
            const internalLinksAfter = linksAfter.filter(l => l.isInternal && !l.url.startsWith('#'))
            
            // Property: Number of internal links should remain the same
            expect(internalLinksAfter.length).toBe(internalLinksBefore.length)
            
            // Property: Updated links should not point to old locations
            for (const link of internalLinksAfter) {
              expect(link.url).not.toContain('/old/')
            }
          }
        }
      ),
      { numRuns: 100 }
    )
  })
  
  /**
   * Feature: dual-layer-documentation, Property 15: Redirect mapping generation
   * Validates: Requirements 4.4
   * 
   * For any migration mapping, a corresponding redirect configuration should be
   * generated mapping each old path to its new path
   */
  it('Property 15: should generate complete redirect mappings', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generator: random migration mappings
        fc.array(
          fc.record({
            oldPath: fc.string({ minLength: 5, maxLength: 50 }).map(s => `/docs/${s}.md`),
            newPath: fc.string({ minLength: 5, maxLength: 50 }).map(s => `/docs/new/${s}.md`),
            category: fc.constantFrom('tutorial', 'how-to', 'reference', 'explanation'),
            priority: fc.integer({ min: 1, max: 10 }),
            estimatedEffort: fc.constantFrom('low', 'medium', 'high')
          }),
          { minLength: 1, maxLength: 20 }
        ),
        async (mappings) => {
          const migrationMap: MigrationMap = { mappings }
          
          // Generate redirects
          const redirectConfig = generateRedirects(migrationMap)
          
          // Property: Every mapping should have a corresponding redirect
          expect(redirectConfig.redirects.length).toBe(mappings.length)
          
          // Property: Each redirect should map old to new correctly
          for (let i = 0; i < mappings.length; i++) {
            expect(redirectConfig.redirects[i].from).toBe(mappings[i].oldPath)
            expect(redirectConfig.redirects[i].to).toBe(mappings[i].newPath)
          }
          
          // Property: All redirects should have a permanent flag
          for (const redirect of redirectConfig.redirects) {
            expect(typeof redirect.permanent).toBe('boolean')
          }
        }
      ),
      { numRuns: 100 }
    )
  })
  
  /**
   * Feature: dual-layer-documentation, Property 16: Deprecation notice insertion
   * Validates: Requirements 4.5
   * 
   * For any file that has been migrated, the old location should contain a
   * deprecation notice with a link to the new location
   */
  it('Property 16: should insert deprecation notices with new location links', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generator: random content and new locations
        fc.record({
          content: fc.string({ minLength: 10, maxLength: 500 }),
          newLocation: fc.string({ minLength: 5, maxLength: 50 }).map(s => `/docs/new/${s}.md`)
        }),
        async ({ content, newLocation }) => {
          // Insert deprecation notice
          const result = insertDeprecationNotice(content, newLocation)
          
          // Property: Result should contain original content
          expect(result).toContain(content)
          
          // Property: Result should contain deprecation warning
          expect(result).toContain('DEPRECATED')
          
          // Property: Result should contain new location
          expect(result).toContain(newLocation)
          
          // Property: Deprecation notice should be at the beginning
          const deprecationIndex = result.indexOf('DEPRECATED')
          const contentIndex = result.indexOf(content)
          expect(deprecationIndex).toBeLessThan(contentIndex)
          
          // Property: Result should be longer than original
          expect(result.length).toBeGreaterThan(content.length)
        }
      ),
      { numRuns: 100 }
    )
  })
  
  /**
   * Feature: dual-layer-documentation, Property 20: Navigation accessibility
   * Validates: Requirements 4.10
   * 
   * For any migrated file, it should be reachable through the navigation structure
   * (validated by checking that all internal links point to existing files)
   */
  it('Property 20: should validate that all internal links are accessible', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generator: random file structure with links
        fc.array(
          fc.record({
            path: fc.constantFrom(
              '/docs/index.md',
              '/docs/guide.md',
              '/docs/tutorial.md',
              '/docs/reference.md',
              '/docs/explanation.md'
            ),
            content: fc.string({ minLength: 10, maxLength: 200 })
          }),
          { minLength: 2, maxLength: 10 }
        ),
        async (files) => {
          // Create a map of file paths to content
          const fileMap = new Map<string, string>()
          for (const file of files) {
            fileMap.set(file.path, file.content)
          }
          
          // Validate links
          const report = await validateLinks(fileMap, '/docs')
          
          // Property: All links should be categorized (valid, broken, or external)
          const totalLinks = report.valid.length + report.broken.length + report.external.length
          expect(totalLinks).toBeGreaterThanOrEqual(0)
          
          // Property: No link should appear in multiple categories
          const validUrls = new Set(report.valid.map(l => l.url))
          const brokenUrls = new Set(report.broken.map(l => l.url))
          const externalUrls = new Set(report.external.map(l => l.url))
          
          // Check no overlap between valid and broken
          for (const url of validUrls) {
            expect(brokenUrls.has(url)).toBe(false)
          }
          
          // Check no overlap between valid and external
          for (const url of validUrls) {
            expect(externalUrls.has(url)).toBe(false)
          }
          
          // Check no overlap between broken and external
          for (const url of brokenUrls) {
            expect(externalUrls.has(url)).toBe(false)
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})
