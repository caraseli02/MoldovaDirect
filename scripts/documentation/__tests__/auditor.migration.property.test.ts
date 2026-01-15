/**
 * Property-based tests for migration mapping
 * Feature: dual-layer-documentation, Property 4: Migration mapping completeness
 */

import { describe, it, expect, afterEach } from 'vitest'
import fc from 'fast-check'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { tmpdir } from 'node:os'
import { DocumentationAuditor } from '../auditor'

describe('Documentation Auditor - Migration Mapping Property Tests', () => {
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

  const markdownFilename = fc
    .tuple(
      fc.stringMatching(/^[a-z0-9-]+$/),
      fc.constantFrom('.md', '.mdx', '.txt'),
    )
    .map(([name, ext]) => `${name}${ext}`)

  const docContent = fc.oneof(
    fc.constant(`# Getting Started\n\nTutorial content`),
    fc.constant(`# How to Deploy\n\nHow-to content`),
    fc.constant(`# API Reference\n\nReference content`),
    fc.string({ minLength: 20, maxLength: 200 }),
  )

  const testFile = fc.record({
    name: markdownFilename,
    content: docContent,
  })

  // Feature: dual-layer-documentation, Property 4: Migration mapping completeness
  it('should create mapping for every file with all required fields', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(testFile, { minLength: 1, maxLength: 20 }),
        async (files) => {
          // Ensure unique filenames to avoid file overwrites
          const uniqueFiles = files.map((file, index) => ({
            ...file,
            name: `file${index}-${file.name}`,
          }))

          const testDir = await createTestDirectory(uniqueFiles)
          const auditor = new DocumentationAuditor()
          const inventory = await auditor.scanDirectory(testDir)
          const migrationMap = auditor.createMigrationMapping(inventory)

          // Should have mapping for every file
          expect(migrationMap.mappings.length).toBe(uniqueFiles.length)

          // Every mapping should have all required fields
          for (const mapping of migrationMap.mappings) {
            expect(mapping.oldPath).toBeDefined()
            expect(mapping.newPath).toBeDefined()
            expect(mapping.category).toBeDefined()
            expect(mapping.priority).toBeDefined()
            expect(mapping.estimatedEffort).toBeDefined()

            // Old path should be absolute
            expect(path.isAbsolute(mapping.oldPath)).toBe(true)

            // New path should start with 'docs'
            expect(mapping.newPath.startsWith('docs')).toBe(true)

            // Category should be valid
            expect([
              'tutorial',
              'how-to',
              'reference',
              'explanation',
              'project',
              'archive',
              'uncategorized',
            ]).toContain(mapping.category)

            // Priority should be 1-10
            expect(mapping.priority).toBeGreaterThanOrEqual(1)
            expect(mapping.priority).toBeLessThanOrEqual(10)

            // Effort should be valid
            expect(['low', 'medium', 'high']).toContain(mapping.estimatedEffort)
          }
        },
      ),
      { numRuns: 100 },
    )
  })

  // Property: Mappings should be sorted by priority (higher first)
  it('should sort mappings by priority in descending order', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(testFile, { minLength: 2, maxLength: 10 }),
        async (files) => {
          const testDir = await createTestDirectory(files)
          const auditor = new DocumentationAuditor()
          const inventory = await auditor.scanDirectory(testDir)
          const migrationMap = auditor.createMigrationMapping(inventory)

          // Check that priorities are in descending order
          for (let i = 0; i < migrationMap.mappings.length - 1; i++) {
            expect(migrationMap.mappings[i].priority).toBeGreaterThanOrEqual(
              migrationMap.mappings[i + 1].priority,
            )
          }
        },
      ),
      { numRuns: 100 },
    )
  })

  // Property: New paths should be unique
  it('should generate unique new paths for all files', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(testFile, { minLength: 1, maxLength: 15 }),
        async (files) => {
          // Ensure unique filenames
          const uniqueFiles = files.map((file, index) => ({
            ...file,
            name: `file${index}-${file.name}`,
          }))

          const testDir = await createTestDirectory(uniqueFiles)
          const auditor = new DocumentationAuditor()
          const inventory = await auditor.scanDirectory(testDir)
          const migrationMap = auditor.createMigrationMapping(inventory)

          // All new paths should be unique
          const newPaths = migrationMap.mappings.map(m => m.newPath)
          const uniquePaths = new Set(newPaths)
          expect(uniquePaths.size).toBe(newPaths.length)
        },
      ),
      { numRuns: 100 },
    )
  })

  // Property: Category in mapping should match file categorization
  it('should use consistent categorization in mappings', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(testFile, { minLength: 1, maxLength: 10 }),
        async (files) => {
          const testDir = await createTestDirectory(files)
          const auditor = new DocumentationAuditor()
          const inventory = await auditor.scanDirectory(testDir)
          const migrationMap = auditor.createMigrationMapping(inventory)

          // Build map of old path -> category from inventory
          const inventoryCategories = new Map(
            inventory.files.map(f => [f.path, f.category]),
          )

          // Check that mapping categories match inventory categories
          for (const mapping of migrationMap.mappings) {
            const inventoryCategory = inventoryCategories.get(mapping.oldPath)
            expect(mapping.category).toBe(inventoryCategory)
          }
        },
      ),
      { numRuns: 100 },
    )
  })

  // Property: Effort estimation should be reasonable
  it('should estimate effort based on file characteristics', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: markdownFilename,
          content: fc.string({ minLength: 10, maxLength: 10000 }),
        }),
        async (file) => {
          const testDir = await createTestDirectory([file])
          const auditor = new DocumentationAuditor()
          const inventory = await auditor.scanDirectory(testDir)
          const migrationMap = auditor.createMigrationMapping(inventory)

          const mapping = migrationMap.mappings[0]
          const contentLength = file.content.length
          const linkCount = (file.content.match(/\[.*?\]\(.*?\)/g) || []).length

          // Large files or many links should have higher effort
          if (contentLength > 5000 || linkCount > 20) {
            expect(mapping.estimatedEffort).toBe('high')
          } else if (contentLength > 2000 || linkCount > 10) {
            expect(mapping.estimatedEffort).toBe('medium')
          } else {
            expect(mapping.estimatedEffort).toBe('low')
          }
        },
      ),
      { numRuns: 100 },
    )
  })
})
