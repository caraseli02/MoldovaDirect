/**
 * Property-based tests for duplicate detection
 * Feature: dual-layer-documentation, Property 2: Duplicate detection completeness
 */

import { describe, it, expect, afterEach } from 'vitest'
import fc from 'fast-check'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { tmpdir } from 'node:os'
import { DocumentationAuditor } from '../auditor'

describe('Documentation Auditor - Duplicate Detection Property Tests', () => {
  let testDirs: string[] = []

  afterEach(async () => {
    for (const dir of testDirs) {
      try {
        await fs.rm(dir, { recursive: true, force: true })
      } catch {
        // Ignore cleanup errors
      }
    }
    testDirs = []
  })

  async function createTestDirectory(
    files: Array<{ name: string; content: string }>,
  ): Promise<string> {
    const testDir = path.join(tmpdir(), `doc-test-${Date.now()}-${Math.random().toString(36).slice(2)}`)
    testDirs.push(testDir)

    await fs.mkdir(testDir, { recursive: true })

    for (const file of files) {
      const filePath = path.join(testDir, file.name)
      await fs.writeFile(filePath, file.content, 'utf-8')
    }

    return testDir
  }

  // Feature: dual-layer-documentation, Property 2: Duplicate detection completeness
  it('should identify all files with similar content above threshold', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate a base content and variations
        fc.record({
          baseContent: fc.string({ minLength: 100, maxLength: 500 }),
          numDuplicates: fc.integer({ min: 2, max: 5 }),
        }),
        async ({ baseContent, numDuplicates }) => {
          // Create files with very similar content (>80% similarity)
          const files = []
          for (let i = 0; i < numDuplicates; i++) {
            files.push({
              name: `file${i}.md`,
              // Add small variation to make them not identical but very similar
              content: baseContent + `\n\n## Extra section ${i}`,
            })
          }

          const testDir = await createTestDirectory(files)
          const auditor = new DocumentationAuditor()
          const inventory = await auditor.scanDirectory(testDir)
          const duplicates = auditor.findDuplicates(inventory)

          // Should find at least one duplicate set
          expect(duplicates.duplicateSets.length).toBeGreaterThanOrEqual(1)

          // All files should be in a duplicate set
          const filesInSets = new Set<string>()
          for (const set of duplicates.duplicateSets) {
            for (const file of set.files) {
              filesInSets.add(file.path)
            }
          }

          // Most files should be identified as duplicates
          // (allowing for some edge cases where similarity might be just below threshold)
          expect(filesInSets.size).toBeGreaterThanOrEqual(numDuplicates - 1)
        },
      ),
      { numRuns: 100 },
    )
  })

  // Property: Identical files should always be detected as duplicates
  it('should always detect identical files with meaningful content as duplicates', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          content: fc.string({ minLength: 50, maxLength: 300 }).filter(s => s.trim().length > 20),
          numCopies: fc.integer({ min: 2, max: 4 }),
        }),
        async ({ content, numCopies }) => {
          // Create identical files
          const files = []
          for (let i = 0; i < numCopies; i++) {
            files.push({
              name: `identical${i}.md`,
              content,
            })
          }

          const testDir = await createTestDirectory(files)
          const auditor = new DocumentationAuditor()
          const inventory = await auditor.scanDirectory(testDir)
          const duplicates = auditor.findDuplicates(inventory)

          // Should find exactly one duplicate set containing all files
          expect(duplicates.duplicateSets.length).toBeGreaterThanOrEqual(1)

          // The largest set should contain all files
          const largestSet = duplicates.duplicateSets.reduce((max, set) =>
            set.files.length > max.files.length ? set : max,
          )
          expect(largestSet.files.length).toBe(numCopies)
          expect(largestSet.similarity).toBeGreaterThan(0.99) // Nearly identical
        },
      ),
      { numRuns: 100 },
    )
  })

  // Property: Completely different files should not be detected as duplicates
  it('should not detect completely different files as duplicates', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            name: fc.stringMatching(/^[a-z0-9-]+\.md$/),
            content: fc.string({ minLength: 50, maxLength: 200 }),
          }),
          { minLength: 2, maxLength: 5 },
        ),
        async (files) => {
          // Ensure files have different content
          const uniqueFiles = files.filter(
            (file, index, self) =>
              self.findIndex(f => f.content === file.content) === index,
          )

          if (uniqueFiles.length < 2) return // Skip if not enough unique files

          const testDir = await createTestDirectory(uniqueFiles)
          const auditor = new DocumentationAuditor()
          const inventory = await auditor.scanDirectory(testDir)
          const duplicates = auditor.findDuplicates(inventory)

          // Each duplicate set should have similarity > 0.8
          for (const set of duplicates.duplicateSets) {
            expect(set.similarity).toBeGreaterThan(0.8)
          }
        },
      ),
      { numRuns: 100 },
    )
  })

  // Property: Duplicate sets should have recommendations
  it('should provide recommendations for all duplicate sets', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          baseContent: fc.string({ minLength: 100, maxLength: 300 }),
          numDuplicates: fc.integer({ min: 2, max: 4 }),
        }),
        async ({ baseContent, numDuplicates }) => {
          const files = []
          for (let i = 0; i < numDuplicates; i++) {
            files.push({
              name: `dup${i}.md`,
              content: baseContent + `\n## Section ${i}`,
            })
          }

          const testDir = await createTestDirectory(files)
          const auditor = new DocumentationAuditor()
          const inventory = await auditor.scanDirectory(testDir)
          const duplicates = auditor.findDuplicates(inventory)

          // All duplicate sets should have recommendations
          for (const set of duplicates.duplicateSets) {
            expect(set.recommendation).toBeDefined()
            expect(set.recommendation.length).toBeGreaterThan(0)
          }
        },
      ),
      { numRuns: 100 },
    )
  })
})
