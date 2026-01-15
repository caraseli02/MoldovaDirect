/**
 * Property-based tests for Navigation Generator
 * Feature: dual-layer-documentation
 */

import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { NavigationGenerator } from '../navigation-generator'
import type { DiátaxisCategory } from '../types'

describe('NavigationGenerator Property Tests', () => {
  const generator = new NavigationGenerator()

  // Feature: dual-layer-documentation, Property 7: Index page generation
  // **Validates: Requirements 2.8**
  describe('Property 7: Index page generation', () => {
    it('should generate index page for any directory containing documentation files', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generator: random category
          fc.constantFrom<DiátaxisCategory>(
            'tutorial',
            'how-to',
            'reference',
            'explanation',
            'project',
            'archive'
          ),
          // Generator: random array of files
          fc.array(
            fc.record({
              path: fc.string({ minLength: 5, maxLength: 100 }).map(s => `docs/${s}.md`),
              name: fc.string({ minLength: 3, maxLength: 30 }).map(s => `${s}.md`),
              size: fc.integer({ min: 0, max: 100000 }),
              lastModified: fc.date(),
              content: fc.string({ minLength: 10, maxLength: 500 }).map(s => `# Title\n\n${s}`)
            }),
            { minLength: 0, maxLength: 20 }
          ),
          async (category, files) => {
            // Execute: generate index page
            const index = generator.generateCategoryIndex(category, files)

            // Verify: index page is generated
            expect(index).toBeTruthy()
            expect(typeof index).toBe('string')
            expect(index.length).toBeGreaterThan(0)

            // Verify: index contains category title
            expect(index).toMatch(/^# /)

            // Verify: index contains back navigation
            expect(index).toContain('[← Back to Documentation Home](../README.md)')

            // Verify: if files exist, they should be listed
            if (files.length > 0) {
              // At least one file should be mentioned
              const hasFileReference = files.some(file => {
                const title = file.content.match(/^# (.+)$/m)?.[1]
                return title ? index.includes(title) : false
              })
              expect(hasFileReference || index.includes('###')).toBe(true)
            } else {
              // Should indicate no files
              expect(index).toContain('No documentation files')
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should list all files with titles and descriptions in the index', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom<DiátaxisCategory>('tutorial', 'how-to', 'reference', 'explanation'),
          fc.array(
            fc.record({
              path: fc.string({ minLength: 5, maxLength: 50 }).map(s => `docs/category/${s}.md`),
              name: fc.string({ minLength: 3, maxLength: 20 }).map(s => `${s}.md`),
              size: fc.integer({ min: 100, max: 10000 }),
              lastModified: fc.date(),
              content: fc.tuple(
                fc.string({ minLength: 5, maxLength: 50 }).filter(s => /[a-zA-Z0-9]/.test(s)),
                fc.string({ minLength: 10, maxLength: 100 })
              ).map(([title, desc]) => `# ${title}\n\n${desc}`)
            }),
            { minLength: 1, maxLength: 10 }
          ),
          async (category, files) => {
            const index = generator.generateCategoryIndex(category, files)

            // Verify: all file titles with valid content appear in index
            for (const file of files) {
              const titleMatch = file.content.match(/^# (.+)$/m)
              if (titleMatch && titleMatch[1]) {
                const title = titleMatch[1].trim()
                // Only check for titles that have alphanumeric characters
                if (/[a-zA-Z0-9]/.test(title)) {
                  expect(index).toContain(title)
                }
              }
            }
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  // Feature: dual-layer-documentation, Property 6: Breadcrumb navigation consistency
  // **Validates: Requirements 2.7**
  describe('Property 6: Breadcrumb navigation consistency', () => {
    it('should generate consistent breadcrumbs for any file path', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generator: random file path with docs/ prefix
          fc.array(fc.string({ minLength: 3, maxLength: 20 }), { minLength: 2, maxLength: 5 })
            .map(parts => `docs/${parts.join('/')}.md`),
          async (filePath) => {
            // Execute: generate breadcrumbs
            const breadcrumbs = generator.generateBreadcrumbs(filePath)

            // Verify: breadcrumbs are generated
            expect(breadcrumbs).toBeTruthy()
            expect(typeof breadcrumbs).toBe('string')

            // Verify: breadcrumbs contain separator
            expect(breadcrumbs).toContain('>')

            // Verify: breadcrumbs start with documentation home
            expect(breadcrumbs).toContain('📚 Documentation')

            // Verify: breadcrumbs contain markdown links (except last item)
            const parts = breadcrumbs.split(' > ')
            expect(parts.length).toBeGreaterThan(0)

            // First part should be a link
            expect(parts[0]).toContain('[')
            expect(parts[0]).toContain(']')

            // Last part should NOT be a link (current page)
            // It may contain escaped characters like \[ but not unescaped markdown link syntax
            const lastPart = parts[parts.length - 1]
            // Check that it doesn't have the markdown link pattern [text](url)
            expect(lastPart).not.toMatch(/\[.*\]\(.*\)/)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should accurately reflect file location in hierarchy', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.tuple(
            fc.constantFrom('tutorials', 'how-to', 'reference', 'explanation'),
            fc.string({ minLength: 3, maxLength: 20 }),
            fc.string({ minLength: 3, maxLength: 20 })
          ).map(([category, subdir, filename]) => `docs/${category}/${subdir}/${filename}.md`),
          async (filePath) => {
            const breadcrumbs = generator.generateBreadcrumbs(filePath)

            // Extract category from path
            const pathParts = filePath.split('/')
            const category = pathParts[1]
            if (!category) throw new Error('Category not found')

            // Verify: breadcrumbs contain the category
            category
              .split('-')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')

            expect(breadcrumbs.toLowerCase()).toContain(category.toLowerCase().replace('-', ' '))
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  // Feature: dual-layer-documentation, Property 9: Related documentation links
  // **Validates: Requirements 2.10**
  describe('Property 9: Related documentation links', () => {
    it('should generate "See Also" section for any file with related content', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generator: current file
          fc.record({
            path: fc.string({ minLength: 10, maxLength: 50 }).map(s => `docs/${s}.md`),
            name: fc.string({ minLength: 5, maxLength: 20 }).map(s => `${s}.md`),
            size: fc.integer({ min: 100, max: 10000 }),
            lastModified: fc.date(),
            content: fc.string({ minLength: 20, maxLength: 200 }).map(s => `# Main\n\n${s}`)
          }),
          // Generator: related files
          fc.array(
            fc.record({
              path: fc.string({ minLength: 10, maxLength: 50 }).map(s => `docs/${s}.md`),
              name: fc.string({ minLength: 5, maxLength: 20 }).map(s => `${s}.md`),
              size: fc.integer({ min: 100, max: 10000 }),
              lastModified: fc.date(),
              content: fc.string({ minLength: 20, maxLength: 200 }).map(s => `# Related\n\n${s}`)
            }),
            { minLength: 0, maxLength: 10 }
          ),
          async (file, relatedFiles) => {
            // Execute: generate "See Also" section
            const seeAlso = generator.generateSeeAlso(file, relatedFiles)

            // Verify: if no related files, return empty
            if (relatedFiles.length === 0) {
              expect(seeAlso).toBe('')
            } else {
              // Verify: section is generated
              expect(seeAlso).toContain('## See Also')

              // Verify: all related files are listed
              for (const related of relatedFiles) {
                const titleMatch = related.content.match(/^# (.+)$/m)
                if (titleMatch) {
                  const title = titleMatch[1]
                  expect(seeAlso).toContain(title)
                }
              }

              // Verify: contains markdown links
              expect(seeAlso).toContain('[')
              expect(seeAlso).toContain(']')
              expect(seeAlso).toContain('(')
              expect(seeAlso).toContain(')')
            }
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  // Feature: dual-layer-documentation, Property 8: Visual hierarchy in generated content
  // **Validates: Requirements 2.9**
  describe('Property 8: Visual hierarchy in generated content', () => {
    it('should include visual hierarchy elements in all generated content', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom<DiátaxisCategory>('tutorial', 'how-to', 'reference', 'explanation'),
          fc.array(
            fc.record({
              path: fc.string({ minLength: 5, maxLength: 50 }).map(s => `docs/${s}.md`),
              name: fc.string({ minLength: 3, maxLength: 20 }).map(s => `${s}.md`),
              size: fc.integer({ min: 100, max: 10000 }),
              lastModified: fc.date(),
              content: fc.string({ minLength: 20, maxLength: 200 }).map(s => `# Title\n\n${s}`)
            }),
            { minLength: 0, maxLength: 10 }
          ),
          async (category, files) => {
            // Execute: generate index page
            const index = generator.generateCategoryIndex(category, files)

            // Verify: contains emoji for visual hierarchy
            const emojiRegex = /[\u{1F300}-\u{1F9FF}]/u
            expect(emojiRegex.test(index)).toBe(true)

            // Verify: contains markdown headings
            expect(index).toMatch(/^# /m)

            // Verify: uses proper markdown formatting
            expect(index).toContain('\n\n') // Paragraph breaks
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should use emojis consistently for category identification', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom<DiátaxisCategory>('tutorial', 'how-to', 'reference', 'explanation', 'project', 'archive'),
          async (category) => {
            const index = generator.generateCategoryIndex(category, [])

            // Verify: contains emoji
            const emojiRegex = /[\u{1F300}-\u{1F9FF}]/u
            expect(emojiRegex.test(index)).toBe(true)

            // Verify: specific emojis for specific categories
            if (category === 'tutorial') expect(index).toContain('📖')
            if (category === 'how-to') expect(index).toContain('🔧')
            if (category === 'reference') expect(index).toContain('📋')
            if (category === 'explanation') expect(index).toContain('💡')
            if (category === 'project') expect(index).toContain('📊')
            if (category === 'archive') expect(index).toContain('📦')
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  // Feature: dual-layer-documentation, Property 21: Overview before detail structure
  // **Validates: Requirements 7.1**
  describe('Property 21: Overview before detail structure', () => {
    it('should present overview before detailed content for any documentation section', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generator: content with sections that have detailed content
          fc.record({
            title: fc.string({ minLength: 5, maxLength: 50 }),
            sections: fc.array(
              fc.record({
                heading: fc.string({ minLength: 5, maxLength: 30 }),
                overview: fc.string({ minLength: 20, maxLength: 100 }),
                details: fc.string({ minLength: 100, maxLength: 500 })
              }),
              { minLength: 1, maxLength: 5 }
            )
          }),
          // Generator: map of sections to their detailed content links
          fc.dictionary(
            fc.string({ minLength: 5, maxLength: 30 }),
            fc.string({ minLength: 5, maxLength: 50 }).map(s => `./${s}.md`)
          ),
          async (contentData, detailedSections) => {
            // Setup: create content with sections
            const contentLines = [`# ${contentData.title}`, '']

            for (const section of contentData.sections) {
              contentLines.push(`## ${section.heading}`)
              contentLines.push('')
              contentLines.push(section.overview)
              contentLines.push('')
              contentLines.push(section.details)
              contentLines.push('')
            }

            const content = contentLines.join('\n')

            // Create detailed sections map matching the content
            const detailMap = new Map<string, string>()
            for (const section of contentData.sections) {
              const link = detailedSections[section.heading]
              if (link) {
                detailMap.set(section.heading.trim(), link)
              }
            }

            // Execute: add progressive disclosure
            const result = generator.addProgressiveDisclosure(content, detailMap)

            // Verify: result is generated
            expect(result).toBeTruthy()
            expect(typeof result).toBe('string')

            // Verify: for each section with detailed content, overview appears before "Learn More" link
            for (const [heading, link] of detailMap) {
              if (result.includes(heading)) {
                const headingIndex = result.indexOf(heading)
                const learnMoreIndex = result.indexOf('Learn more', headingIndex)

                if (learnMoreIndex > -1) {
                  // There should be content between heading and "Learn more"
                  const betweenContent = result.substring(headingIndex, learnMoreIndex)
                  expect(betweenContent.length).toBeGreaterThan(heading.length + 10)

                  // "Learn More" link should reference the detailed content
                  expect(result.substring(learnMoreIndex, learnMoreIndex + 200)).toContain(link)
                }
              }
            }

            // Verify: title is preserved
            expect(result).toContain(contentData.title)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should extract overview from any detailed content', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generator: content with title and paragraphs
          fc.record({
            title: fc.string({ minLength: 5, maxLength: 50 })
              .filter(s => s.trim().length >= 3 && /[a-zA-Z0-9]/.test(s)),
            firstParagraph: fc.string({ minLength: 20, maxLength: 200 })
              .filter(s => s.trim().length >= 10 && /[a-zA-Z0-9]/.test(s) && !s.split('\n').some(l => l.trim().startsWith('#'))),
            additionalContent: fc.string({ minLength: 50, maxLength: 500 })
              .filter(s => s.trim().length >= 20 && /[a-zA-Z0-9]/.test(s))
          }),
          async (contentData) => {
            // Setup: create content
            const content = [
              `# ${contentData.title}`,
              '',
              contentData.firstParagraph,
              '',
              contentData.additionalContent
            ].join('\n')

            // Execute: extract overview
            const overview = generator.extractOverview(content)

            // Verify: overview is extracted
            expect(overview).toBeTruthy()
            expect(typeof overview).toBe('string')

            // Verify: overview contains content from first paragraph
            expect(overview).toContain(contentData.firstParagraph.trim().replace(/\r?\n/g, ' '))

            // Verify: overview does not contain the title
            expect(overview).not.toContain(`# ${contentData.title}`)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  // Feature: dual-layer-documentation, Property 23: Learn more links
  // **Validates: Requirements 7.3**
  describe('Property 23: Learn more links', () => {
    it('should include "Learn More" links for any overview content with detailed documentation', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generator: content with sections
          fc.record({
            title: fc.string({ minLength: 5, maxLength: 50 })
              .filter(s => s.trim().length >= 3 && /[a-zA-Z0-9]/.test(s)),
            sections: fc.array(
              fc.record({
                heading: fc.string({ minLength: 5, maxLength: 30 })
                  .filter(s => !s.startsWith('#') && s.trim().length >= 3 && /[a-zA-Z0-9]/.test(s)),
                overview: fc.string({ minLength: 20, maxLength: 100 })
                  .filter(s => s.trim().length >= 10 && /[a-zA-Z0-9]/.test(s)),
                details: fc.string({ minLength: 100, maxLength: 500 })
                  .filter(s => s.trim().length >= 50 && /[a-zA-Z0-9]/.test(s))
              }),
              { minLength: 1, maxLength: 5 }
            )
          }),
          async (contentData) => {
            // Setup: create content
            const contentLines = [`# ${contentData.title}`, '']

            for (const section of contentData.sections) {
              contentLines.push(`## ${section.heading}`)
              contentLines.push('')
              contentLines.push(section.overview)
              contentLines.push('')
              contentLines.push(section.details)
              contentLines.push('')
            }

            const content = contentLines.join('\n')

            // Create detailed sections map for all sections
            const detailMap = new Map<string, string>()
            for (const section of contentData.sections) {
              detailMap.set(section.heading.trim(), `./details/${section.heading.toLowerCase().replace(/\s+/g, '-')}.md`)
            }

            // Execute: add progressive disclosure
            const result = generator.addProgressiveDisclosure(content, detailMap)

            // Verify: result contains "Learn More" links for each section with detailed content
            for (const [heading, link] of detailMap) {
              if (result.includes(heading)) {
                // Should contain "Learn more" text
                expect(result.toLowerCase()).toContain('learn more')

                // Should contain the link to detailed content
                expect(result).toContain(link)

                // "Learn More" should appear after the heading
                const headingIndex = result.indexOf(heading)
                const learnMoreIndex = result.toLowerCase().indexOf('learn more', headingIndex)
                expect(learnMoreIndex).toBeGreaterThan(headingIndex)
              }
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should link to correct detailed documentation for any section', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generator: section with heading and link
          fc.record({
            heading: fc.string({ minLength: 5, maxLength: 30 })
              .filter(s => !s.startsWith('#') && s.trim().length >= 3 && /[a-zA-Z0-9]/.test(s)),
            overview: fc.string({ minLength: 20, maxLength: 100 })
              .filter(s => s.trim().length >= 10 && /[a-zA-Z0-9]/.test(s)),
            detailLink: fc.string({ minLength: 5, maxLength: 50 })
              .filter(s => s.trim().length >= 3 && /[a-zA-Z0-9]/.test(s))
              .map(s => `./${s.trim().replace(/[^a-zA-Z0-9-]/g, '-')}.md`)
          }),
          async (sectionData) => {
            // Setup: create simple content
            const content = [
              '# Main Title',
              '',
              `## ${sectionData.heading}`,
              '',
              sectionData.overview,
              '',
              'More detailed content here...',
              ''
            ].join('\n')

            const detailMap = new Map<string, string>()
            detailMap.set(sectionData.heading.trim(), sectionData.detailLink)

            // Execute: add progressive disclosure
            const result = generator.addProgressiveDisclosure(content, detailMap)

            // Verify: the specific link appears in the result
            expect(result).toContain(sectionData.detailLink)

            // Verify: link is in markdown format
            expect(result).toMatch(/\[.*Learn more.*\]\(.*\)/)

            // Verify: link references the heading
            const linkPattern = new RegExp(`Learn more about ${sectionData.heading.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`)
            expect(result).toMatch(linkPattern)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  // Feature: dual-layer-documentation, Property 22: Quick start section presence
  // **Validates: Requirements 7.2**
  describe('Property 22: Quick start section presence', () => {
    it('should add quick start section to any tutorial or getting-started documentation', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generator: tutorial content
          fc.record({
            title: fc.string({ minLength: 5, maxLength: 50 }),
            content: fc.string({ minLength: 50, maxLength: 500 })
          }),
          // Generator: quick start steps
          fc.array(
            fc.string({ minLength: 10, maxLength: 100 }),
            { minLength: 1, maxLength: 10 }
          ),
          async (tutorialData, quickStartSteps) => {
            // Setup: create tutorial content
            const content = [
              `# ${tutorialData.title}`,
              '',
              tutorialData.content
            ].join('\n')

            // Execute: add quick start section
            const result = generator.addQuickStartSection(content, quickStartSteps)

            // Verify: result contains quick start section
            expect(result).toContain('## 🚀 Quick Start')

            // Verify: quick start appears near the beginning (before main content)
            const quickStartIndex = result.indexOf('Quick Start')
            const contentIndex = result.indexOf(tutorialData.content)
            expect(quickStartIndex).toBeLessThan(contentIndex)

            // Verify: all quick start steps are included
            for (let i = 0; i < quickStartSteps.length; i++) {
              expect(result).toContain(`${i + 1}. ${quickStartSteps[i]}`)
            }

            // Verify: original title is preserved
            expect(result).toContain(tutorialData.title)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should place quick start section immediately after title', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generator: content with title
          fc.record({
            title: fc.string({ minLength: 5, maxLength: 50 }),
            firstSection: fc.string({ minLength: 20, maxLength: 100 }),
            additionalContent: fc.string({ minLength: 50, maxLength: 200 })
          }),
          // Generator: quick start steps
          fc.array(
            fc.string({ minLength: 10, maxLength: 50 }),
            { minLength: 2, maxLength: 5 }
          ),
          async (contentData, steps) => {
            // Setup: create content with sections
            const content = [
              `# ${contentData.title}`,
              '',
              contentData.firstSection,
              '',
              '## First Section',
              '',
              contentData.additionalContent
            ].join('\n')

            // Execute: add quick start
            const result = generator.addQuickStartSection(content, steps)

            // Verify: quick start appears after title but before first section
            const titleIndex = result.indexOf(contentData.title)
            const quickStartIndex = result.indexOf('Quick Start')
            const firstSectionIndex = result.indexOf('First Section')

            expect(quickStartIndex).toBeGreaterThan(titleIndex)
            expect(quickStartIndex).toBeLessThan(firstSectionIndex)

            // Verify: contains "Get up and running" text
            expect(result).toContain('Get up and running in under 5 minutes')
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should handle content without title by adding quick start at beginning', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generator: content without title
          fc.string({ minLength: 50, maxLength: 200 }),
          // Generator: quick start steps
          fc.array(
            fc.string({ minLength: 10, maxLength: 50 }),
            { minLength: 1, maxLength: 5 }
          ),
          async (content, steps) => {
            // Execute: add quick start to content without title
            const result = generator.addQuickStartSection(content, steps)

            // Verify: quick start is at the beginning
            const quickStartIndex = result.indexOf('Quick Start')
            expect(quickStartIndex).toBeGreaterThan(-1)
            expect(quickStartIndex).toBeLessThan(100) // Should be near the start

            // Verify: original content is preserved
            expect(result).toContain(content)

            // Verify: all steps are included
            for (const step of steps) {
              expect(result).toContain(step)
            }
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
