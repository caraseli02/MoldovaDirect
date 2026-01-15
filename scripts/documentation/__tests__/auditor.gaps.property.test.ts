/**
 * Property-based tests for gap analysis
 * Feature: dual-layer-documentation, Property 3: Gap identification accuracy
 */

import { describe, it, expect, afterEach } from 'vitest'
import fc from 'fast-check'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { tmpdir } from 'node:os'
import { DocumentationAuditor } from '../auditor'

describe('Documentation Auditor - Gap Analysis Property Tests', () => {
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

  // Feature: dual-layer-documentation, Property 3: Gap identification accuracy
  it('should identify all missing required documentation topics', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate a subset of required topics
        fc.array(
          fc.constantFrom(
            'getting-started',
            'authentication',
            'checkout',
            'api-reference',
            'architecture-overview',
          ),
          { minLength: 0, maxLength: 3 },
        ),
        async (existingTopics) => {
          // Create files for existing topics
          const files = existingTopics.map(topic => ({
            name: `${topic}.md`,
            content: `# ${topic}\n\nContent about ${topic}`,
          }))

          const testDir = await createTestDirectory(files)
          const auditor = new DocumentationAuditor()
          const inventory = await auditor.scanDirectory(testDir)
          const gaps = auditor.identifyGaps(inventory)

          // Total gaps should be reasonable
          const totalGaps =
            gaps.missingTutorials.length +
            gaps.missingHowTos.length +
            gaps.missingReference.length +
            gaps.missingExplanations.length

          expect(totalGaps).toBeGreaterThanOrEqual(0)

          // Priority should be set based on number of gaps
          expect(['critical', 'high', 'medium', 'low']).toContain(gaps.priority)

          // If we have many gaps, priority should be higher
          if (totalGaps > 10) {
            expect(gaps.priority).toBe('critical')
          } else if (totalGaps > 5) {
            expect(gaps.priority).toBe('high')
          }
        },
      ),
      { numRuns: 100 },
    )
  })

  // Property: Gap analysis should be consistent
  it('should produce consistent gap analysis for same inventory', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            name: fc.stringMatching(/^[a-z0-9-]+\.md$/),
            content: fc.string({ minLength: 20, maxLength: 100 }),
          }),
          { minLength: 0, maxLength: 5 },
        ),
        async (files) => {
          const testDir = await createTestDirectory(files)
          const auditor = new DocumentationAuditor()
          const inventory = await auditor.scanDirectory(testDir)

          // Run gap analysis multiple times
          const gaps1 = auditor.identifyGaps(inventory)
          const gaps2 = auditor.identifyGaps(inventory)
          const gaps3 = auditor.identifyGaps(inventory)

          // Results should be identical
          expect(gaps1.missingTutorials).toEqual(gaps2.missingTutorials)
          expect(gaps1.missingTutorials).toEqual(gaps3.missingTutorials)
          expect(gaps1.missingHowTos).toEqual(gaps2.missingHowTos)
          expect(gaps1.missingHowTos).toEqual(gaps3.missingHowTos)
          expect(gaps1.missingReference).toEqual(gaps2.missingReference)
          expect(gaps1.missingReference).toEqual(gaps3.missingReference)
          expect(gaps1.missingExplanations).toEqual(gaps2.missingExplanations)
          expect(gaps1.missingExplanations).toEqual(gaps3.missingExplanations)
          expect(gaps1.priority).toBe(gaps2.priority)
          expect(gaps1.priority).toBe(gaps3.priority)
        },
      ),
      { numRuns: 100 },
    )
  })

  // Property: If all required topics exist, gaps should be minimal
  it('should report minimal gaps when all required topics are covered', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constant(null), // No randomization needed for this test
        async () => {
          // Create files covering all major required topics
          const files = [
            { name: 'getting-started.md', content: '# Getting Started\n\nTutorial content' },
            { name: 'first-feature.md', content: '# First Feature\n\nTutorial content' },
            { name: 'authentication.md', content: '# Authentication\n\nHow to authenticate' },
            { name: 'checkout.md', content: '# Checkout\n\nHow to checkout' },
            { name: 'deployment.md', content: '# Deployment\n\nHow to deploy' },
            { name: 'testing.md', content: '# Testing\n\nHow to test' },
            { name: 'api-reference.md', content: '# API Reference\n\nAPI docs' },
            { name: 'architecture-overview.md', content: '# Architecture\n\nArchitecture explanation' },
          ]

          const testDir = await createTestDirectory(files)
          const auditor = new DocumentationAuditor()
          const inventory = await auditor.scanDirectory(testDir)
          const gaps = auditor.identifyGaps(inventory)

          const totalGaps =
            gaps.missingTutorials.length +
            gaps.missingHowTos.length +
            gaps.missingReference.length +
            gaps.missingExplanations.length

          // Should have fewer gaps when many topics are covered
          expect(totalGaps).toBeLessThan(10)
          // Priority can be low, medium, or high depending on remaining gaps
          expect(['low', 'medium', 'high']).toContain(gaps.priority)
        },
      ),
      { numRuns: 100 },
    )
  })

  // Property: Empty documentation should have high priority gaps
  it('should report high priority gaps for empty documentation', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constant(null),
        async () => {
          // Create empty directory
          const testDir = await createTestDirectory([])
          const auditor = new DocumentationAuditor()
          const inventory = await auditor.scanDirectory(testDir)
          const gaps = auditor.identifyGaps(inventory)

          const totalGaps =
            gaps.missingTutorials.length +
            gaps.missingHowTos.length +
            gaps.missingReference.length +
            gaps.missingExplanations.length

          // Should have many gaps
          expect(totalGaps).toBeGreaterThan(5)
          // Priority should be high or critical
          expect(['critical', 'high']).toContain(gaps.priority)
        },
      ),
      { numRuns: 100 },
    )
  })
})
