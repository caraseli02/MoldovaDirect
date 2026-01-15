/**
 * Unit tests for Documentation Auditor
 */

import { describe, it, expect, afterEach } from 'vitest'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { tmpdir } from 'node:os'
import { DocumentationAuditor } from '../auditor'

describe('Documentation Auditor - Unit Tests', () => {
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

  describe('generateAuditReport', () => {
    it('should generate report with correct summary statistics', async () => {
      const files = [
        { name: 'getting-started.md', content: '# Getting Started\n\nStep by step tutorial' },
        { name: 'how-to-deploy.md', content: '# How to Deploy\n\nDeployment guide' },
        { name: 'api-reference.md', content: '# API Reference\n\nAPI documentation' },
      ]

      const testDir = await createTestDirectory(files)
      const auditor = new DocumentationAuditor()
      const inventory = await auditor.scanDirectory(testDir)
      const report = auditor.generateAuditReport(inventory)

      // Check summary
      expect(report.summary.totalFiles).toBe(3)
      expect(report.summary.byCategory.size).toBeGreaterThan(0)
      expect(report.summary.duplicates).toBeGreaterThanOrEqual(0)
      expect(report.summary.gaps).toBeGreaterThanOrEqual(0)

      // Check details
      expect(report.details.inventory).toBeDefined()
      expect(report.details.duplicates).toBeDefined()
      expect(report.details.gaps).toBeDefined()

      // Check recommendations
      expect(Array.isArray(report.recommendations)).toBe(true)
    })

    it('should include recommendations for duplicates', async () => {
      const files = [
        { name: 'doc1.md', content: 'This is some documentation content about features' },
        { name: 'doc2.md', content: 'This is some documentation content about features' },
      ]

      const testDir = await createTestDirectory(files)
      const auditor = new DocumentationAuditor()
      const inventory = await auditor.scanDirectory(testDir)
      const report = auditor.generateAuditReport(inventory)

      // Should have recommendation about duplicates
      const hasDuplicateRecommendation = report.recommendations.some(rec =>
        rec.toLowerCase().includes('duplicate'),
      )
      expect(hasDuplicateRecommendation).toBe(true)
    })

    it('should include recommendations for gaps', async () => {
      const files = [
        { name: 'random.md', content: 'Some random content' },
      ]

      const testDir = await createTestDirectory(files)
      const auditor = new DocumentationAuditor()
      const inventory = await auditor.scanDirectory(testDir)
      const report = auditor.generateAuditReport(inventory)

      // Should have recommendation about gaps
      const hasGapRecommendation = report.recommendations.some(rec =>
        rec.toLowerCase().includes('gap'),
      )
      expect(hasGapRecommendation).toBe(true)
    })

    it('should include recommendations for uncategorized files', async () => {
      const files = [
        { name: 'misc.md', content: 'xyz abc def' },
      ]

      const testDir = await createTestDirectory(files)
      const auditor = new DocumentationAuditor()
      const inventory = await auditor.scanDirectory(testDir)
      const report = auditor.generateAuditReport(inventory)

      // Should have recommendation about uncategorized files
      const hasUncategorizedRecommendation = report.recommendations.some(rec =>
        rec.toLowerCase().includes('uncategorized') || rec.toLowerCase().includes('categorize'),
      )
      expect(hasUncategorizedRecommendation).toBe(true)
    })

    it('should handle empty documentation directory', async () => {
      const testDir = await createTestDirectory([])
      const auditor = new DocumentationAuditor()
      const inventory = await auditor.scanDirectory(testDir)
      const report = auditor.generateAuditReport(inventory)

      expect(report.summary.totalFiles).toBe(0)
      expect(report.summary.duplicates).toBe(0)
      expect(report.recommendations.length).toBeGreaterThan(0)
    })
  })

  describe('categorizeFile', () => {
    it('should categorize getting-started guide as tutorial', () => {
      const auditor = new DocumentationAuditor()
      const category = auditor.categorizeFile({
        path: '/docs/getting-started.md',
        name: 'getting-started.md',
        size: 100,
        lastModified: new Date(),
        content: '# Getting Started\n\nThis guide will walk you through setting up the project step by step.',
      })
      expect(category).toBe('tutorial')
    })

    it('should categorize API reference as reference', () => {
      const auditor = new DocumentationAuditor()
      const category = auditor.categorizeFile({
        path: '/docs/api/products.md',
        name: 'products.md',
        size: 100,
        lastModified: new Date(),
        content: '# API Reference\n\n## Endpoints\n\n### GET /api/products\nReturns a list of products.',
      })
      expect(category).toBe('reference')
    })

    it('should categorize how-to guide as how-to', () => {
      const auditor = new DocumentationAuditor()
      const category = auditor.categorizeFile({
        path: '/docs/guides/deploy.md',
        name: 'deploy.md',
        size: 100,
        lastModified: new Date(),
        content: '# How to Deploy\n\nThis guide shows you how to deploy the application.',
      })
      expect(category).toBe('how-to')
    })

    it('should categorize architecture doc as explanation', () => {
      const auditor = new DocumentationAuditor()
      const category = auditor.categorizeFile({
        path: '/docs/architecture.md',
        name: 'architecture.md',
        size: 100,
        lastModified: new Date(),
        content: '# Architecture Overview\n\nThis explains why we chose this architecture.',
      })
      expect(category).toBe('explanation')
    })

    it('should use path-based categorization when available', () => {
      const auditor = new DocumentationAuditor()
      const category = auditor.categorizeFile({
        path: '/docs/tutorials/some-file.md',
        name: 'some-file.md',
        size: 100,
        lastModified: new Date(),
        content: 'Random content without clear indicators',
      })
      expect(category).toBe('tutorial')
    })
  })

  describe('findDuplicates', () => {
    it('should detect identical files as duplicates', async () => {
      const files = [
        { name: 'doc1.md', content: 'This is identical content for testing duplicates' },
        { name: 'doc2.md', content: 'This is identical content for testing duplicates' },
      ]

      const testDir = await createTestDirectory(files)
      const auditor = new DocumentationAuditor()
      const inventory = await auditor.scanDirectory(testDir)
      const duplicates = auditor.findDuplicates(inventory)

      expect(duplicates.duplicateSets.length).toBeGreaterThan(0)
      expect(duplicates.duplicateSets[0].files.length).toBe(2)
      expect(duplicates.duplicateSets[0].similarity).toBeGreaterThan(0.9)
    })

    it('should not detect completely different files as duplicates', async () => {
      const files = [
        { name: 'doc1.md', content: 'This is about authentication and security features' },
        { name: 'doc2.md', content: 'This is about deployment and infrastructure setup' },
      ]

      const testDir = await createTestDirectory(files)
      const auditor = new DocumentationAuditor()
      const inventory = await auditor.scanDirectory(testDir)
      const duplicates = auditor.findDuplicates(inventory)

      expect(duplicates.duplicateSets.length).toBe(0)
    })
  })

  describe('identifyGaps', () => {
    it('should identify missing tutorials', async () => {
      const files = [
        { name: 'api-reference.md', content: '# API Reference\n\nAPI docs' },
      ]

      const testDir = await createTestDirectory(files)
      const auditor = new DocumentationAuditor()
      const inventory = await auditor.scanDirectory(testDir)
      const gaps = auditor.identifyGaps(inventory)

      expect(gaps.missingTutorials.length).toBeGreaterThan(0)
      expect(gaps.missingTutorials).toContain('getting-started')
    })

    it('should set priority based on number of gaps', async () => {
      const testDir = await createTestDirectory([])
      const auditor = new DocumentationAuditor()
      const inventory = await auditor.scanDirectory(testDir)
      const gaps = auditor.identifyGaps(inventory)

      const totalGaps =
        gaps.missingTutorials.length +
        gaps.missingHowTos.length +
        gaps.missingReference.length +
        gaps.missingExplanations.length

      if (totalGaps > 10) {
        expect(gaps.priority).toBe('critical')
      } else if (totalGaps > 5) {
        expect(gaps.priority).toBe('high')
      }
    })
  })

  describe('createMigrationMapping', () => {
    it('should create mapping with correct structure', async () => {
      const files = [
        { name: 'getting-started.md', content: '# Getting Started\n\nTutorial content' },
      ]

      const testDir = await createTestDirectory(files)
      const auditor = new DocumentationAuditor()
      const inventory = await auditor.scanDirectory(testDir)
      const migrationMap = auditor.createMigrationMapping(inventory)

      expect(migrationMap.mappings.length).toBe(1)
      const mapping = migrationMap.mappings[0]

      expect(mapping.oldPath).toBeDefined()
      expect(mapping.newPath).toBeDefined()
      expect(mapping.category).toBeDefined()
      expect(mapping.priority).toBeGreaterThanOrEqual(1)
      expect(mapping.priority).toBeLessThanOrEqual(10)
      expect(['low', 'medium', 'high']).toContain(mapping.estimatedEffort)
    })

    it('should sort mappings by priority', async () => {
      const files = [
        { name: 'getting-started.md', content: '# Getting Started' },
        { name: 'random.md', content: 'Random content' },
        { name: 'readme.md', content: '# README' },
      ]

      const testDir = await createTestDirectory(files)
      const auditor = new DocumentationAuditor()
      const inventory = await auditor.scanDirectory(testDir)
      const migrationMap = auditor.createMigrationMapping(inventory)

      // Check priorities are in descending order
      for (let i = 0; i < migrationMap.mappings.length - 1; i++) {
        expect(migrationMap.mappings[i].priority).toBeGreaterThanOrEqual(
          migrationMap.mappings[i + 1].priority,
        )
      }
    })
  })
})
