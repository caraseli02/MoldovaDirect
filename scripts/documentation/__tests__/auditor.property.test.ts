/**
 * Property-based tests for Documentation Auditor
 * Feature: dual-layer-documentation
 */

import { describe, it, expect, afterEach } from 'vitest'
import fc from 'fast-check'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { tmpdir } from 'node:os'
import { DocumentationAuditor } from '../auditor'

describe('Documentation Auditor - Property Tests', () => {
  let testDirs: string[] = []

  afterEach(async () => {
    // Cleanup all test directories
    for (const dir of testDirs) {
      try {
        await fs.rm(dir, { recursive: true, force: true })
      } catch {
        // Ignore cleanup errors
      }
    }
    testDirs = []
  })

  /**
   * Helper to create a test directory with files
   */
  async function createTestDirectory(
    files: Array<{ name: string; content: string; subdir?: string }>,
  ): Promise<string> {
    const testDir = path.join(tmpdir(), `doc-test-${Date.now()}-${Math.random().toString(36).slice(2)}`)
    testDirs.push(testDir)

    await fs.mkdir(testDir, { recursive: true })

    for (const file of files) {
      const filePath = file.subdir
        ? path.join(testDir, file.subdir, file.name)
        : path.join(testDir, file.name)

      await fs.mkdir(path.dirname(filePath), { recursive: true })
      await fs.writeFile(filePath, file.content, 'utf-8')
    }

    return testDir
  }

  /**
   * Generator for valid markdown filenames
   */
  const markdownFilename = fc
    .tuple(
      fc.stringMatching(/^[a-z0-9-]+$/),
      fc.constantFrom('.md', '.mdx', '.txt'),
    )
    .map(([name, ext]) => `${name}${ext}`)

  /**
   * Generator for documentation content
   */
  const docContent = fc.oneof(
    // Tutorial content
    fc.constant(`# Getting Started\n\nThis is a step-by-step tutorial.\n\n## Step 1\nFirst step.`),
    // How-to content
    fc.constant(`# How to Deploy\n\nThis guide shows you how to deploy.\n\n## Prerequisites\nYou need...`),
    // Reference content
    fc.constant(`# API Reference\n\n## Endpoints\n\n### GET /api/products\nReturns products.`),
    // Explanation content
    fc.constant(`# Architecture Overview\n\nThis explains why we chose this architecture.`),
    // Generic content
    fc.string({ minLength: 10, maxLength: 500 }),
  )

  /**
   * Generator for test files
   */
  const testFile = fc.record({
    name: markdownFilename,
    content: docContent,
    subdir: fc.option(fc.constantFrom('tutorials', 'guides', 'reference', 'docs'), { nil: undefined }),
  })

  // Feature: dual-layer-documentation, Property 1: Complete and accurate file inventory
  it('should generate complete inventory for any directory structure', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uniqueArray(testFile, {
          minLength: 1,
          maxLength: 20,
          comparator: (a, b) => a.name === b.name && a.subdir === b.subdir,
        }),
        async (files) => {
          // Setup: create test directory structure
          const testDir = await createTestDirectory(files)

          // Execute: generate inventory
          const auditor = new DocumentationAuditor()
          const inventory = await auditor.scanDirectory(testDir)

          // Verify: all files are included
          expect(inventory.files).toHaveLength(files.length)
          expect(inventory.totalCount).toBe(files.length)

          // Verify: all files are categorized
          for (const file of inventory.files) {
            expect(file.category).toBeDefined()
            expect([
              'tutorial',
              'how-to',
              'reference',
              'explanation',
              'project',
              'archive',
              'uncategorized',
            ]).toContain(file.category)
          }

          // Verify: total size is sum of all file sizes
          const expectedSize = inventory.files.reduce((sum, f) => sum + f.size, 0)
          expect(inventory.totalSize).toBe(expectedSize)

          // Verify: categories map contains all files
          let totalInCategories = 0
          for (const categoryFiles of inventory.categories.values()) {
            totalInCategories += categoryFiles.length
          }
          expect(totalInCategories).toBe(files.length)
        },
      ),
      { numRuns: 100 },
    )
  })

  // Additional property: File paths should be absolute and valid
  it('should return absolute paths for all files', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uniqueArray(testFile, {
          minLength: 1,
          maxLength: 10,
          comparator: (a, b) => a.name === b.name && a.subdir === b.subdir,
        }),
        async (files) => {
          const testDir = await createTestDirectory(files)
          const auditor = new DocumentationAuditor()
          const inventory = await auditor.scanDirectory(testDir)

          for (const file of inventory.files) {
            // Path should be absolute
            expect(path.isAbsolute(file.path)).toBe(true)
            // Path should start with test directory
            expect(file.path.startsWith(testDir)).toBe(true)
            // File should exist
            await expect(fs.access(file.path)).resolves.toBeUndefined()
          }
        },
      ),
      { numRuns: 100 },
    )
  })

  // Additional property: Content should match file content
  it('should correctly read file content', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uniqueArray(testFile, {
          minLength: 1,
          maxLength: 10,
          comparator: (a, b) => a.name === b.name && a.subdir === b.subdir,
        }),
        async (files) => {
          const testDir = await createTestDirectory(files)
          const auditor = new DocumentationAuditor()
          const inventory = await auditor.scanDirectory(testDir)

          for (const file of inventory.files) {
            const actualContent = await fs.readFile(file.path, 'utf-8')
            expect(file.content).toBe(actualContent)
          }
        },
      ),
      { numRuns: 100 },
    )
  })

  // Additional property: Categorization should be consistent
  it('should categorize the same file consistently', async () => {
    await fc.assert(
      fc.asyncProperty(
        testFile,
        async (file) => {
          const testDir = await createTestDirectory([file])
          const auditor = new DocumentationAuditor()

          // Scan twice
          const inventory1 = await auditor.scanDirectory(testDir)
          const inventory2 = await auditor.scanDirectory(testDir)

          // Categories should be the same
          expect(inventory1.files[0]!.category).toBe(inventory2.files[0]!.category)
        },
      ),
      { numRuns: 100 },
    )
  })
})

describe('Documentation Auditor - Categorization Property Tests', () => {
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
    files: Array<{ name: string; content: string; subdir?: string }>,
  ): Promise<string> {
    const testDir = path.join(tmpdir(), `doc-test-${Date.now()}-${Math.random().toString(36).slice(2)}`)
    testDirs.push(testDir)

    await fs.mkdir(testDir, { recursive: true })

    for (const file of files) {
      const filePath = file.subdir
        ? path.join(testDir, file.subdir, file.name)
        : path.join(testDir, file.name)

      await fs.mkdir(path.dirname(filePath), { recursive: true })
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
    fc.constant(`# Getting Started\n\nThis is a step-by-step tutorial.\n\n## Step 1\nFirst step.`),
    fc.constant(`# How to Deploy\n\nThis guide shows you how to deploy.\n\n## Prerequisites\nYou need...`),
    fc.constant(`# API Reference\n\n## Endpoints\n\n### GET /api/products\nReturns products.`),
    fc.constant(`# Architecture Overview\n\nThis explains why we chose this architecture.`),
    fc.string({ minLength: 10, maxLength: 500 }),
  )

  const testFile = fc.record({
    name: markdownFilename,
    content: docContent,
    subdir: fc.option(fc.constantFrom('tutorials', 'guides', 'reference', 'docs'), { nil: undefined }),
  })

  // Property test: All files receive valid categories
  it('should assign valid categories to all files', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uniqueArray(testFile, {
          minLength: 1,
          maxLength: 20,
          comparator: (a, b) => a.name === b.name && a.subdir === b.subdir,
        }),
        async (files) => {
          const testDir = await createTestDirectory(files)
          const auditor = new DocumentationAuditor()
          const inventory = await auditor.scanDirectory(testDir)

          const validCategories = [
            'tutorial',
            'how-to',
            'reference',
            'explanation',
            'project',
            'archive',
            'uncategorized',
          ]

          for (const file of inventory.files) {
            expect(validCategories).toContain(file.category)
          }
        },
      ),
      { numRuns: 100 },
    )
  })

  // Property test: Categorization consistency
  it('should categorize files consistently across multiple scans', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uniqueArray(testFile, {
          minLength: 1,
          maxLength: 10,
          comparator: (a, b) => a.name === b.name && a.subdir === b.subdir,
        }),
        async (files) => {
          const testDir = await createTestDirectory(files)
          const auditor = new DocumentationAuditor()

          // Scan multiple times
          const inventory1 = await auditor.scanDirectory(testDir)
          const inventory2 = await auditor.scanDirectory(testDir)
          const inventory3 = await auditor.scanDirectory(testDir)

          // Build maps of path -> category
          const categories1 = new Map(inventory1.files.map(f => [f.path, f.category]))
          const categories2 = new Map(inventory2.files.map(f => [f.path, f.category]))
          const categories3 = new Map(inventory3.files.map(f => [f.path, f.category]))

          // All scans should produce same categories
          for (const [filePath, category] of categories1) {
            expect(categories2.get(filePath)).toBe(category)
            expect(categories3.get(filePath)).toBe(category)
          }
        },
      ),
      { numRuns: 100 },
    )
  })

  // Property test: Path-based categorization takes precedence
  it('should use path-based categorization when available', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: markdownFilename,
          content: fc.string({ minLength: 10, maxLength: 200 }),
        }),
        async (file) => {
          // Test with tutorial path
          const tutorialDir = await createTestDirectory([
            { ...file, subdir: 'tutorials' },
          ])
          const auditor = new DocumentationAuditor()
          const tutorialInventory = await auditor.scanDirectory(tutorialDir)
          expect(tutorialInventory.files[0]!.category).toBe('tutorial')

          // Test with how-to path
          const howToDir = await createTestDirectory([
            { ...file, subdir: 'how-to' },
          ])
          const howToInventory = await auditor.scanDirectory(howToDir)
          expect(howToInventory.files[0]!.category).toBe('how-to')

          // Test with reference path
          const refDir = await createTestDirectory([
            { ...file, subdir: 'reference' },
          ])
          const refInventory = await auditor.scanDirectory(refDir)
          expect(refInventory.files[0]!.category).toBe('reference')
        },
      ),
      { numRuns: 100 },
    )
  })
})
