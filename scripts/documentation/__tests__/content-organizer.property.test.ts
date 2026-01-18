/**
 * Property-based tests for Content Organizer
 * Feature: dual-layer-documentation
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import fc from 'fast-check'
import { ContentOrganizer } from '../content-organizer'
import type { FileInfo } from '../types'

describe('ContentOrganizer Property Tests', () => {
  let organizer: ContentOrganizer
  let testDir: string

  beforeEach(async () => {
    organizer = new ContentOrganizer()
    testDir = path.join(
      process.cwd(),
      'scripts',
      'documentation',
      '__tests__',
      'temp-organizer-test-dir',
    )

    // Clean up test directory if it exists
    try {
      await fs.rm(testDir, { recursive: true, force: true })
    } catch {
      // Directory doesn't exist, that's fine
    }

    await fs.mkdir(testDir, { recursive: true })
  })

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true })
    } catch {
      // Directory doesn't exist, that's fine
    }
  })

  // Feature: dual-layer-documentation, Property 5: Content organization by category (how-to part)
  // Validates: Requirements 2.5
  it('should organize how-to guides into appropriate feature subdirectories', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc
          .array(
            fc.record({
              name: fc
                .stringMatching(/^[a-z0-9-]+\.md$/)
                .filter(s => s.length > 3 && s.length < 50),
              feature: fc.constantFrom(
                'authentication',
                'checkout',
                'deployment',
                'testing',
                'general',
              ),
              // Generate content that matches the feature
              contentKeyword: fc.constantFrom(
                'authentication',
                'checkout',
                'deployment',
                'testing',
                'general',
              ),
            }),
            { minLength: 1, maxLength: 10 },
          )
          // Ensure unique filenames
          .map(files => {
            const seen = new Set<string>()
            return files.filter(file => {
              if (seen.has(file.name)) return false
              seen.add(file.name)
              return true
            })
          })
          .filter(files => files.length > 0),
        async files => {
          const howToRoot = path.join(testDir, 'how-to')
          await fs.mkdir(howToRoot, { recursive: true })

          // Create files with content that indicates their feature
          const fileInfos: FileInfo[] = []
          for (const file of files) {
            const filePath = path.join(howToRoot, file.name)
            // Create content that includes the feature keyword
            const content = `# How to ${file.contentKeyword}\n\nThis guide covers ${file.contentKeyword} functionality.`
            await fs.writeFile(filePath, content, 'utf-8')

            const stats = await fs.stat(filePath)
            fileInfos.push({
              path: filePath,
              name: file.name,
              size: stats.size,
              lastModified: stats.mtime,
              content,
            })
          }

          // Organize files
          const results = await organizer.organizeHowToByFeature(
            fileInfos,
            howToRoot,
          )

          // Verify all files were organized successfully
          expect(results.every(r => r.success)).toBe(true)

          // Verify each file is in an appropriate subdirectory
          for (const result of results) {
            const organizedPath = result.organizedPath
            const relativePath = path.relative(howToRoot, organizedPath)
            const subdirectory = relativePath.split(path.sep)[0]

            // Verify subdirectory is one of the valid feature areas
            expect([
              'authentication',
              'checkout',
              'deployment',
              'testing',
              'general',
            ]).toContain(subdirectory)

            // Verify file exists at organized location
            await expect(fs.access(organizedPath)).resolves.toBeUndefined()
          }
        },
      ),
      { numRuns: 100 },
    )
  })

  // Additional test: Verify files are categorized correctly based on content
  it('should categorize how-to files based on content keywords', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc
            .stringMatching(/^[a-z0-9-]+\.md$/)
            .filter(s => s.length > 3 && s.length < 50),
          keyword: fc.constantFrom(
            'authentication',
            'checkout',
            'deployment',
            'testing',
          ),
        }),
        async ({ name, keyword }) => {
          // Use a unique directory for each run to avoid collisions
          const uniqueId = Math.random().toString(36).substring(7)
          const runDir = path.join(testDir, `run-${uniqueId}`)
          const howToRoot = path.join(runDir, 'how-to')
          await fs.mkdir(howToRoot, { recursive: true })

          const filePath = path.join(howToRoot, name)
          const content = `# How to use ${keyword}\n\nThis guide explains ${keyword} in detail.`
          await fs.writeFile(filePath, content, 'utf-8')

          const stats = await fs.stat(filePath)
          const fileInfo: FileInfo = {
            path: filePath,
            name,
            size: stats.size,
            lastModified: stats.mtime,
            content,
          }

          const results = await organizer.organizeHowToByFeature(
            [fileInfo],
            howToRoot,
          )

          expect(results).toHaveLength(1)
          const result = results[0]
          expect(result).toBeDefined()
          expect(result!.success).toBe(true)

          // Verify file is in the correct feature subdirectory
          const organizedPath = result!.organizedPath
          expect(organizedPath).toContain(keyword)
        },
      ),
      { numRuns: 100 },
    )
  })

  // Feature: dual-layer-documentation, Property 5: Content organization by category (reference part)
  // Validates: Requirements 2.6
  it('should organize reference docs into appropriate domain subdirectories', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc
          .array(
            fc.record({
              name: fc
                .stringMatching(/^[a-z0-9-]+\.md$/)
                .filter(s => s.length > 3 && s.length < 50),
              domain: fc.constantFrom(
                'api',
                'architecture',
                'configuration',
                'components',
                'general',
              ),
              // Generate content that matches the domain
              contentKeyword: fc.constantFrom(
                'api',
                'architecture',
                'configuration',
                'components',
                'general',
              ),
            }),
            { minLength: 1, maxLength: 10 },
          )
          // Ensure unique filenames
          .map(files => {
            const seen = new Set<string>()
            return files.filter(file => {
              if (seen.has(file.name)) return false
              seen.add(file.name)
              return true
            })
          })
          .filter(files => files.length > 0),
        async files => {
          const referenceRoot = path.join(testDir, 'reference')
          await fs.mkdir(referenceRoot, { recursive: true })

          // Create files with content that indicates their domain
          const fileInfos: FileInfo[] = []
          for (const file of files) {
            const filePath = path.join(referenceRoot, file.name)
            // Create content that includes the domain keyword
            const content = `# ${file.contentKeyword} Reference\n\nThis document covers ${file.contentKeyword} details.`
            await fs.writeFile(filePath, content, 'utf-8')

            const stats = await fs.stat(filePath)
            fileInfos.push({
              path: filePath,
              name: file.name,
              size: stats.size,
              lastModified: stats.mtime,
              content,
            })
          }

          // Organize files
          const results = await organizer.organizeReferenceByDomain(
            fileInfos,
            referenceRoot,
          )

          // Verify all files were organized successfully
          expect(results.every(r => r.success)).toBe(true)

          // Verify each file is in an appropriate subdirectory
          for (const result of results) {
            const organizedPath = result.organizedPath
            const relativePath = path.relative(referenceRoot, organizedPath)
            const subdirectory = relativePath.split(path.sep)[0]

            // Verify subdirectory is one of the valid domains
            expect([
              'api',
              'architecture',
              'configuration',
              'components',
              'general',
            ]).toContain(subdirectory)

            // Verify file exists at organized location
            await expect(fs.access(organizedPath)).resolves.toBeUndefined()
          }
        },
      ),
      { numRuns: 100 },
    )
  })

  // Additional test: Verify reference files are categorized correctly based on content
  it('should categorize reference files based on content keywords', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc
            .stringMatching(/^[a-z0-9-]+\.md$/)
            .filter(s => s.length > 3 && s.length < 50),
          keyword: fc.constantFrom(
            'api',
            'architecture',
            'configuration',
            'components',
          ),
        }),
        async ({ name, keyword }) => {
          // Use a unique directory for each run to avoid collisions
          const uniqueId = Math.random().toString(36).substring(7)
          const runDir = path.join(testDir, `run-${uniqueId}`)
          const referenceRoot = path.join(runDir, 'reference')
          await fs.mkdir(referenceRoot, { recursive: true })

          const filePath = path.join(referenceRoot, name)
          const content = `# ${keyword} Reference\n\nThis document provides ${keyword} reference information.`
          await fs.writeFile(filePath, content, 'utf-8')

          const stats = await fs.stat(filePath)
          const fileInfo: FileInfo = {
            path: filePath,
            name,
            size: stats.size,
            lastModified: stats.mtime,
            content,
          }

          const results = await organizer.organizeReferenceByDomain(
            [fileInfo],
            referenceRoot,
          )

          expect(results).toHaveLength(1)
          const result = results[0]
          expect(result).toBeDefined()
          expect(result!.success).toBe(true)

          // Verify file is in the correct domain subdirectory
          const organizedPath = result!.organizedPath
          expect(organizedPath).toContain(keyword)
        },
      ),
      { numRuns: 100 },
    )
  })
})
