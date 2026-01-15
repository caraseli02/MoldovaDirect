/**
 * Property-based tests for Content Migrator
 * Feature: dual-layer-documentation
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import fc from 'fast-check'
import { ContentMigrator } from '../migrator'
import type { FileInfo, DiátaxisCategory } from '../types'

describe('ContentMigrator Property Tests', () => {
  let migrator: ContentMigrator
  let testDir: string

  beforeEach(async () => {
    migrator = new ContentMigrator()
    testDir = path.join(
      process.cwd(),
      'scripts',
      'documentation',
      '__tests__',
      'temp-property-test-dir',
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

  // Feature: dual-layer-documentation, Property 13: Content preservation during migration
  // Validates: Requirements 4.1, 4.2
  it('should preserve content during migration for any file', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generator: random file content
        fc.record({
          name: fc
            .stringMatching(/^[a-z0-9-]+\.md$/)
            .filter(s => s.length > 3 && s.length < 50),
          content: fc.string({ minLength: 10, maxLength: 1000 }),
          category: fc.constantFrom<DiátaxisCategory>(
            'tutorial',
            'how-to',
            'reference',
            'explanation',
            'project',
            'archive',
          ),
        }),
        async file => {
          const oldPath = path.join(testDir, 'old', file.name)
          const newPath = path.join(testDir, 'new', file.category, file.name)

          // Create source file
          await fs.mkdir(path.dirname(oldPath), { recursive: true })
          await fs.writeFile(oldPath, file.content, 'utf-8')

          // Migrate file without content adaptation
          const result = await migrator.migrateFile({
            oldPath,
            newPath,
            category: file.category,
            adaptContent: false,
          })

          // Verify migration succeeded
          expect(result.success).toBe(true)

          // Verify content is preserved exactly
          const migratedContent = await fs.readFile(newPath, 'utf-8')
          expect(migratedContent).toBe(file.content)

          // Clean up for next iteration
          await fs.rm(oldPath, { force: true })
          await fs.rm(newPath, { force: true })
        },
      ),
      { numRuns: 100 },
    )
  })

  // Feature: dual-layer-documentation, Property 13: Git history preservation
  // Validates: Requirements 4.2
  it('should preserve file metadata (timestamps) during migration', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc
            .stringMatching(/^[a-z0-9-]+\.md$/)
            .filter(s => s.length > 3 && s.length < 50),
          content: fc.string({ minLength: 10, maxLength: 500 }),
          category: fc.constantFrom<DiátaxisCategory>(
            'tutorial',
            'how-to',
            'reference',
            'explanation',
          ),
        }),
        async file => {
          const oldPath = path.join(testDir, 'old', file.name)
          const newPath = path.join(testDir, 'new', file.category, file.name)

          // Create source file
          await fs.mkdir(path.dirname(oldPath), { recursive: true })
          await fs.writeFile(oldPath, file.content, 'utf-8')

          // Get original timestamps
          const oldStats = await fs.stat(oldPath)

          // Migrate file
          const result = await migrator.migrateFile({
            oldPath,
            newPath,
            category: file.category,
            adaptContent: false,
          })

          expect(result.success).toBe(true)

          // Verify timestamps are preserved
          const newStats = await fs.stat(newPath)
          expect(newStats.mtime.getTime()).toBe(oldStats.mtime.getTime())

          // Clean up
          await fs.rm(oldPath, { force: true })
          await fs.rm(newPath, { force: true })
        },
      ),
      { numRuns: 100 },
    )
  })

  // Feature: dual-layer-documentation, Property 19: Archival instead of deletion
  // Validates: Requirements 4.9
  it('should archive files instead of deleting them', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc
          .array(
            fc.record({
              name: fc
                .stringMatching(/^[a-z0-9-]+\.md$/)
                .filter(s => s.length > 3 && s.length < 50),
              content: fc.string({ minLength: 10, maxLength: 500 }),
            }),
            { minLength: 1, maxLength: 10 },
          )
          // Filter to ensure unique filenames to avoid complexity with duplicate handling
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
          const archiveRoot = path.join(testDir, 'archive')

          // Create files
          for (const file of files) {
            const filePath = path.join(testDir, 'docs', file.name)
            await fs.mkdir(path.dirname(filePath), { recursive: true })
            await fs.writeFile(filePath, file.content, 'utf-8')
          }

          // Archive all files
          const archivedPaths: string[] = []
          for (const file of files) {
            const filePath = path.join(testDir, 'docs', file.name)
            const archivePath = await migrator.archiveFile(filePath, archiveRoot)
            archivedPaths.push(archivePath)
          }

          // Verify all files were archived (not deleted)
          expect(archivedPaths.length).toBe(files.length)

          // Verify each archived file has the correct content
          for (let i = 0; i < files.length; i++) {
            const archivePath = archivedPaths[i]
            const archivedContent = await fs.readFile(archivePath, 'utf-8')
            expect(archivedContent).toBe(files[i].content)
          }

          // Clean up
          await fs.rm(path.join(testDir, 'docs'), {
            recursive: true,
            force: true,
          })
          await fs.rm(archiveRoot, { recursive: true, force: true })
        },
      ),
      { numRuns: 100 },
    )
  })

  // Feature: dual-layer-documentation, Property 18: Duplicate consolidation
  // Validates: Requirements 4.8
  it('should consolidate duplicates by keeping most recent/complete version', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc
          .array(
            fc.record({
              // Use unique names to avoid archive naming conflicts
              name: fc
                .stringMatching(/^file[0-9]+\.md$/)
                .filter(s => s.length > 5 && s.length < 20),
              content: fc.string({ minLength: 10, maxLength: 500 }),
              size: fc.integer({ min: 10, max: 1000 }),
              // Generate dates within a reasonable range
              daysAgo: fc.integer({ min: 0, max: 365 }),
            }),
            { minLength: 2, maxLength: 5 },
          )
          // Ensure unique filenames
          .map(files => {
            const uniqueFiles: typeof files = []
            const seen = new Set<string>()
            for (const file of files) {
              if (!seen.has(file.name)) {
                uniqueFiles.push(file)
                seen.add(file.name)
              }
            }
            return uniqueFiles
          })
          .filter(files => {
            // Ensure at least 2 unique files
            if (files.length < 2) return false
            // Ensure at least one file is different in date or size
            const dates = files.map(f => f.daysAgo)
            const sizes = files.map(f => f.size)
            return new Set(dates).size > 1 || new Set(sizes).size > 1
          }),
        async files => {
          const archiveRoot = path.join(testDir, 'archive')

          // Create FileInfo objects
          const fileInfos: FileInfo[] = []
          for (const file of files) {
            const filePath = path.join(testDir, 'duplicates', file.name)
            await fs.mkdir(path.dirname(filePath), { recursive: true })
            await fs.writeFile(filePath, file.content, 'utf-8')

            const lastModified = new Date()
            lastModified.setDate(lastModified.getDate() - file.daysAgo)

            fileInfos.push({
              path: filePath,
              name: file.name,
              size: file.size,
              lastModified,
              content: file.content,
            })
          }

          // Find the expected "best" file (most recent, or largest if same date)
          let expectedBest = fileInfos[0]
          for (const file of fileInfos) {
            if (file.lastModified > expectedBest.lastModified) {
              expectedBest = file
            } else if (
              file.lastModified.getTime() === expectedBest.lastModified.getTime() &&
              file.size > expectedBest.size
            ) {
              expectedBest = file
            }
          }

          // Consolidate duplicates
          const keptFile = await migrator.consolidateDuplicates(
            fileInfos,
            archiveRoot,
          )

          // Verify the correct file was kept
          expect(keptFile).toBe(expectedBest.path)

          // Verify other files were archived (should be n-1 files)
          const archiveDir = path.join(
            archiveRoot,
            new Date().toISOString().split('T')[0],
          )
          const archivedFiles = await fs.readdir(archiveDir)
          expect(archivedFiles.length).toBe(fileInfos.length - 1)

          // Clean up
          await fs.rm(path.join(testDir, 'duplicates'), {
            recursive: true,
            force: true,
          })
          await fs.rm(archiveRoot, { recursive: true, force: true })
        },
      ),
      { numRuns: 100 },
    )
  })

  // Feature: dual-layer-documentation, Property 17: Content adaptation to category
  // Validates: Requirements 4.7
  it('should adapt content to fit target category conventions', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          title: fc.string({ minLength: 5, maxLength: 50 }).filter(s => s.trim().length > 0),
          body: fc.string({ minLength: 20, maxLength: 500 }),
          category: fc.constantFrom<DiátaxisCategory>(
            'tutorial',
            'how-to',
            'reference',
            'explanation',
          ),
        }),
        async ({ title, body, category }) => {
          const content = `# ${title}\n\n${body}`
          const adapted = migrator.adaptContentToCategory(content, category)

          // Verify content contains the title (trimmed)
          expect(adapted).toContain(title.trim())

          // Verify content contains the original body
          expect(adapted).toContain(body)

          // Verify category-specific sections are added
          switch (category) {
            case 'tutorial':
              expect(adapted).toContain('## What You Will Learn')
              expect(adapted).toContain('## Prerequisites')
              break
            case 'how-to':
              expect(adapted).toContain('## Prerequisites')
              expect(adapted).toContain('## Steps')
              break
            case 'explanation':
              expect(adapted).toContain('## Overview')
              break
            case 'reference':
              // Reference docs should not have extra sections added
              // Just verify original content is preserved
              expect(adapted).toContain(body)
              break
          }
        },
      ),
      { numRuns: 100 },
    )
  })
})
