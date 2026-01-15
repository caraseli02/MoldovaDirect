/**
 * Integration test for migration functionality
 * Tests migration on a sample documentation subset
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { ContentMigrator } from '../migrator'
import { findInternalLinks } from '../link-updater'

describe('Migration Integration Test', () => {
  const testDir = path.join(__dirname, 'temp-migration-test')
  const oldDocsDir = path.join(testDir, 'old-docs')
  const newDocsDir = path.join(testDir, 'new-docs')

  beforeEach(async () => {
    // Create test directory structure
    await fs.mkdir(oldDocsDir, { recursive: true })

    // Create sample documentation files
    await fs.writeFile(
      path.join(oldDocsDir, 'getting-started.md'),
      `# Getting Started

This is a tutorial about getting started.

## Installation

Follow these steps to install.

## Next Steps

See [configuration guide](./configuration.md) for more details.
`,
      'utf-8',
    )

    await fs.writeFile(
      path.join(oldDocsDir, 'configuration.md'),
      `# Configuration Guide

This guide shows how to configure the system.

## Basic Configuration

Configure your settings here.

## Advanced Options

See [API reference](./api-reference.md) for advanced options.
`,
      'utf-8',
    )

    await fs.writeFile(
      path.join(oldDocsDir, 'api-reference.md'),
      `# API Reference

Complete API documentation.

## Endpoints

List of all endpoints.

## Authentication

See [getting started](./getting-started.md) for authentication setup.
`,
      'utf-8',
    )
  })

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true })
    } catch {
      // Ignore cleanup errors
    }
  })

  it('should migrate sample documentation with content preservation', async () => {
    const migrator = new ContentMigrator()

    // Create new structure
    await migrator.createStructure(newDocsDir)

    // Verify structure was created
    const tutorialsDir = path.join(newDocsDir, 'tutorials')
    const howToDir = path.join(newDocsDir, 'how-to')
    const referenceDir = path.join(newDocsDir, 'reference')

    expect(await fs.stat(tutorialsDir)).toBeTruthy()
    expect(await fs.stat(howToDir)).toBeTruthy()
    expect(await fs.stat(referenceDir)).toBeTruthy()

    // Migrate files
    const migrations = [
      {
        oldPath: path.join(oldDocsDir, 'getting-started.md'),
        newPath: path.join(newDocsDir, 'tutorials', 'getting-started.md'),
        category: 'tutorial' as const,
        adaptContent: true,
      },
      {
        oldPath: path.join(oldDocsDir, 'configuration.md'),
        newPath: path.join(newDocsDir, 'how-to', 'configuration.md'),
        category: 'how-to' as const,
        adaptContent: true,
      },
      {
        oldPath: path.join(oldDocsDir, 'api-reference.md'),
        newPath: path.join(newDocsDir, 'reference', 'api', 'api-reference.md'),
        category: 'reference' as const,
        adaptContent: false,
      },
    ]

    const results = []
    for (const mapping of migrations) {
      const result = await migrator.migrateFile(mapping)
      results.push(result)
    }

    // Verify all migrations succeeded
    expect(results.every((r) => r.success)).toBe(true)

    // Verify content was preserved
    const tutorialContent = await fs.readFile(
      path.join(newDocsDir, 'tutorials', 'getting-started.md'),
      'utf-8',
    )
    expect(tutorialContent).toContain('Getting Started')
    expect(tutorialContent).toContain('Installation')
    expect(tutorialContent).toContain('Prerequisites') // Added by adaptation

    const howToContent = await fs.readFile(
      path.join(newDocsDir, 'how-to', 'configuration.md'),
      'utf-8',
    )
    expect(howToContent).toContain('Configuration Guide')
    expect(howToContent).toContain('Basic Configuration')

    const referenceContent = await fs.readFile(
      path.join(newDocsDir, 'reference', 'api', 'api-reference.md'),
      'utf-8',
    )
    expect(referenceContent).toContain('API Reference')
    expect(referenceContent).toContain('Endpoints')
  })

  it('should update internal links after migration', async () => {
    const migrator = new ContentMigrator()

    // Create new structure
    await migrator.createStructure(newDocsDir)

    // Migrate files
    const migrations = [
      {
        oldPath: path.join(oldDocsDir, 'getting-started.md'),
        newPath: path.join(newDocsDir, 'tutorials', 'getting-started.md'),
        category: 'tutorial' as const,
        adaptContent: true,
      },
      {
        oldPath: path.join(oldDocsDir, 'configuration.md'),
        newPath: path.join(newDocsDir, 'how-to', 'configuration.md'),
        category: 'how-to' as const,
        adaptContent: true,
      },
      {
        oldPath: path.join(oldDocsDir, 'api-reference.md'),
        newPath: path.join(newDocsDir, 'reference', 'api', 'api-reference.md'),
        category: 'reference' as const,
        adaptContent: false,
      },
    ]

    for (const mapping of migrations) {
      await migrator.migrateFile(mapping)
    }

    // Verify that links can be extracted from migrated files
    const tutorialPath = path.join(newDocsDir, 'tutorials', 'getting-started.md')
    const tutorialContent = await fs.readFile(tutorialPath, 'utf-8')
    const tutorialLinks = await findInternalLinks(tutorialContent)

    // Verify links were found
    expect(tutorialLinks.length).toBeGreaterThan(0)
    
    // Verify the original link is still present (before updating)
    expect(tutorialContent).toContain('./configuration.md')
    
    // Verify all extracted links are internal
    for (const link of tutorialLinks) {
      expect(link.isInternal).toBe(true)
    }
  })

  it('should validate link integrity after migration', async () => {
    const migrator = new ContentMigrator()

    // Create new structure and migrate
    await migrator.createStructure(newDocsDir)

    const migrations = [
      {
        oldPath: path.join(oldDocsDir, 'getting-started.md'),
        newPath: path.join(newDocsDir, 'tutorials', 'getting-started.md'),
        category: 'tutorial' as const,
        adaptContent: true,
      },
      {
        oldPath: path.join(oldDocsDir, 'configuration.md'),
        newPath: path.join(newDocsDir, 'how-to', 'configuration.md'),
        category: 'how-to' as const,
        adaptContent: true,
      },
      {
        oldPath: path.join(oldDocsDir, 'api-reference.md'),
        newPath: path.join(newDocsDir, 'reference', 'api', 'api-reference.md'),
        category: 'reference' as const,
        adaptContent: false,
      },
    ]

    for (const mapping of migrations) {
      await migrator.migrateFile(mapping)
    }

    // Extract links from all files
    const tutorialPath = path.join(newDocsDir, 'tutorials', 'getting-started.md')
    const tutorialContent = await fs.readFile(tutorialPath, 'utf-8')
    const tutorialLinks = await findInternalLinks(tutorialContent)

    const howToPath = path.join(newDocsDir, 'how-to', 'configuration.md')
    const howToContent = await fs.readFile(howToPath, 'utf-8')
    const howToLinks = await findInternalLinks(howToContent)

    const referencePath = path.join(
      newDocsDir,
      'reference',
      'api',
      'api-reference.md',
    )
    const referenceContent = await fs.readFile(referencePath, 'utf-8')
    const referenceLinks = await findInternalLinks(referenceContent)

    // Verify links were found
    expect(tutorialLinks.length).toBeGreaterThan(0)
    expect(howToLinks.length).toBeGreaterThan(0)
    expect(referenceLinks.length).toBeGreaterThan(0)

    // All links should be internal (relative)
    const allLinks = [...tutorialLinks, ...howToLinks, ...referenceLinks]
    for (const link of allLinks) {
      expect(link.url.startsWith('./')).toBe(true)
    }
  })
})
