/**
 * Property-based tests for Quality Validator
 * Feature: dual-layer-documentation
 */

import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { QualityValidator } from '../quality-validator'
import type { FileInfo } from '../types'

describe('QualityValidator - Property Tests', () => {
  const validator = new QualityValidator()

  /**
   * Property 24: Metadata completeness
   * Validates: Requirements 8.6, 8.7
   * 
   * For any documentation file, metadata should include title, description,
   * last-updated date, and tags
   */
  it('should validate metadata completeness for any file', () => {
    fc.assert(
      fc.property(
        // Generator: random file with optional metadata fields
        fc.record({
          hasTitle: fc.boolean(),
          hasDescription: fc.boolean(),
          hasLastUpdated: fc.boolean(),
          hasTags: fc.boolean(),
          title: fc.string({ minLength: 1, maxLength: 100 }),
          description: fc.string({ minLength: 1, maxLength: 200 }),
          tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 5 }),
        }),
        (metadata) => {
          // Build content with or without metadata based on flags
          let content = ''
          
          if (metadata.hasTitle || metadata.hasDescription || metadata.hasLastUpdated || metadata.hasTags) {
            content += '---\n'
            if (metadata.hasTitle) {
              content += `title: ${metadata.title}\n`
            }
            if (metadata.hasDescription) {
              content += `description: ${metadata.description}\n`
            }
            if (metadata.hasLastUpdated) {
              content += `last-updated: 2024-01-15\n`
            }
            if (metadata.hasTags) {
              content += `tags: ${metadata.tags.join(', ')}\n`
            }
            content += '---\n\n'
          }
          
          // Add H1 if no title in frontmatter
          if (!metadata.hasTitle) {
            content += `# ${metadata.title}\n\n`
          } else {
            content += '# Document\n\n'
          }
          
          content += 'Content here.'
          
          const file: FileInfo = {
            path: 'docs/test.md',
            name: 'test.md',
            size: content.length,
            lastModified: new Date(),
            content,
          }
          
          // Validate
          const report = validator.validateMetadata(file)
          
          // Property: title should always be present (from frontmatter or H1)
          expect(report.hasTitle).toBe(true)
          
          // Property: description presence matches input
          expect(report.hasDescription).toBe(metadata.hasDescription)
          
          // Property: last-updated presence matches input
          expect(report.hasLastUpdated).toBe(metadata.hasLastUpdated)
          
          // Property: tags presence matches input
          expect(report.hasTags).toBe(metadata.hasTags)
          
          // Property: missing fields should be reported correctly
          const expectedMissing: string[] = []
          if (!metadata.hasDescription) expectedMissing.push('description')
          if (!metadata.hasLastUpdated) expectedMissing.push('last-updated')
          if (!metadata.hasTags) expectedMissing.push('tags')
          
          expect(report.missingFields.sort()).toEqual(expectedMissing.sort())
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Additional property: Link validation completeness
   * For any set of files with internal links, all links should be validated
   */
  it('should validate all internal links in any file set', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generator: array of files with links
        fc.array(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 20 }).map(s => s.replace(/[^a-z0-9-]/gi, '') + '.md'),
            hasLinks: fc.boolean(),
            linkCount: fc.integer({ min: 0, max: 5 }),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        async (fileSpecs) => {
          // Build files
          const files: FileInfo[] = fileSpecs.map((spec, index) => {
            let content = `# Document ${index}\n\n`
            
            if (spec.hasLinks) {
              for (let i = 0; i < spec.linkCount; i++) {
                // Create links to other files in the set
                const targetIndex = (index + i + 1) % fileSpecs.length
                const targetName = fileSpecs[targetIndex].name
                content += `[Link ${i}](./${targetName})\n`
              }
            }
            
            return {
              path: `docs/${spec.name}`,
              name: spec.name,
              size: content.length,
              lastModified: new Date(),
              content,
            }
          })
          
          // Validate
          const report = await validator.validateLinks(files)
          
          // Property: total links should equal sum of all link counts
          const expectedTotalLinks = fileSpecs
            .filter(s => s.hasLinks)
            .reduce((sum, s) => sum + s.linkCount, 0)
          
          expect(report.totalLinks).toBe(expectedTotalLinks)
          
          // Property: all links should be valid (they all point to files in the set)
          expect(report.validLinks).toBe(expectedTotalLinks)
          expect(report.brokenLinks).toHaveLength(0)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Additional property: Code validation consistency
   * For any code block, validation should be consistent
   */
  it('should consistently validate code examples', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generator: code blocks with various characteristics
        fc.array(
          fc.record({
            language: fc.constantFrom('typescript', 'javascript', 'python', ''),
            hasPlaceholder: fc.boolean(),
            hasSyntaxError: fc.boolean(),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        async (codeSpecs) => {
          // Build file with code blocks
          let content = '# Code Examples\n\n'
          
          for (const spec of codeSpecs) {
            content += `\`\`\`${spec.language}\n`
            
            if (spec.hasPlaceholder) {
              content += 'const value = [PLACEHOLDER]\n'
            } else if (spec.hasSyntaxError && (spec.language === 'typescript' || spec.language === 'javascript')) {
              content += 'function test() {\n  const x = {\n  // missing closing brace\n}\n'
            } else {
              content += 'const value = 42\n'
            }
            
            content += '```\n\n'
          }
          
          const file: FileInfo = {
            path: 'docs/code.md',
            name: 'code.md',
            size: content.length,
            lastModified: new Date(),
            content,
          }
          
          // Validate
          const report = await validator.validateCodeExamples([file])
          
          // Property: total examples should match input
          expect(report.totalExamples).toBe(codeSpecs.length)
          
          // Property: invalid examples should match those with placeholders or syntax errors
          const expectedInvalid = codeSpecs.filter(
            s => s.hasPlaceholder || (s.hasSyntaxError && (s.language === 'typescript' || s.language === 'javascript'))
          ).length
          
          expect(report.invalidExamples.length).toBe(expectedInvalid)
          expect(report.validExamples).toBe(codeSpecs.length - expectedInvalid)
        }
      ),
      { numRuns: 100 }
    )
  })
})
