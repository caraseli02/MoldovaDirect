/**
 * Unit tests for Content Migrator
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { ContentMigrator } from '../migrator'
import type { FileInfo } from '../types'

describe('ContentMigrator', () => {
  let migrator: ContentMigrator
  let testDir: string

  beforeEach(async () => {
    migrator = new ContentMigrator()
    testDir = path.join(process.cwd(), 'scripts', 'documentation', '__tests__', 'temp-test-dir')
    
    // Clean up test directory if it exists
    try {
      await fs.rm(testDir, { recursive: true, force: true })
    } catch {
      // Directory doesn't exist, that's fine
    }
  })

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true })
    } catch {
      // Directory doesn't exist, that's fine
    }
  })

  describe('createStructure', () => {
    it('should create all required Diátaxis directories', async () => {
      const targetPath = path.join(testDir, 'docs')
      
      await migrator.createStructure(targetPath)

      // Check that all directories were created
      const expectedDirs = [
        targetPath,
        path.join(targetPath, 'tutorials'),
        path.join(targetPath, 'how-to'),
        path.join(targetPath, 'how-to', 'authentication'),
        path.join(targetPath, 'how-to', 'checkout'),
        path.join(targetPath, 'how-to', 'deployment'),
        path.join(targetPath, 'how-to', 'testing'),
        path.join(targetPath, 'reference'),
        path.join(targetPath, 'reference', 'api'),
        path.join(targetPath, 'reference', 'architecture'),
        path.join(targetPath, 'reference', 'configuration'),
        path.join(targetPath, 'reference', 'components'),
        path.join(targetPath, 'explanation'),
        path.join(targetPath, 'explanation', 'architecture'),
        path.join(targetPath, 'explanation', 'decisions'),
        path.join(targetPath, 'explanation', 'concepts'),
        path.join(targetPath, 'project'),
        path.join(targetPath, 'archive'),
        path.join(targetPath, 'ai-context'),
      ]

      for (const dir of expectedDirs) {
        const stats = await fs.stat(dir)
        expect(stats.isDirectory()).toBe(true)
      }
    })

    it('should handle existing directories gracefully', async () => {
      const targetPath = path.join(testDir, 'docs')
      
      // Create structure first time
      await migrator.createStructure(targetPath)
      
      // Create structure again - should not throw
      await expect(migrator.createStructure(targetPath)).resolves.not.toThrow()
      
      // Verify directories still exist
      const stats = await fs.stat(targetPath)
      expect(stats.isDirectory()).toBe(true)
    })

    it('should create nested directories recursively', async () => {
      const targetPath = path.join(testDir, 'deeply', 'nested', 'docs')
      
      await migrator.createStructure(targetPath)
      
      // Check that deeply nested directory was created
      const stats = await fs.stat(targetPath)
      expect(stats.isDirectory()).toBe(true)
    })
  })

  describe('migrateFile', () => {
    it('should copy file from old to new location', async () => {
      const oldPath = path.join(testDir, 'old', 'test.md')
      const newPath = path.join(testDir, 'new', 'test.md')
      const content = '# Test Document\n\nThis is a test.'

      // Create source file
      await fs.mkdir(path.dirname(oldPath), { recursive: true })
      await fs.writeFile(oldPath, content, 'utf-8')

      // Migrate file
      const result = await migrator.migrateFile({
        oldPath,
        newPath,
        category: 'tutorial',
        adaptContent: false,
      })

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)

      // Verify new file exists with same content
      const newContent = await fs.readFile(newPath, 'utf-8')
      expect(newContent).toBe(content)
    })

    it('should preserve file metadata (timestamps)', async () => {
      const oldPath = path.join(testDir, 'old', 'test.md')
      const newPath = path.join(testDir, 'new', 'test.md')
      const content = '# Test Document'

      // Create source file
      await fs.mkdir(path.dirname(oldPath), { recursive: true })
      await fs.writeFile(oldPath, content, 'utf-8')

      // Get original timestamps
      const oldStats = await fs.stat(oldPath)

      // Migrate file
      await migrator.migrateFile({
        oldPath,
        newPath,
        category: 'tutorial',
        adaptContent: false,
      })

      // Check timestamps are preserved
      const newStats = await fs.stat(newPath)
      expect(newStats.mtime.getTime()).toBe(oldStats.mtime.getTime())
    })

    it('should handle file conflicts (target already exists)', async () => {
      const oldPath = path.join(testDir, 'old', 'test.md')
      const newPath = path.join(testDir, 'new', 'test.md')

      // Create both source and target files
      await fs.mkdir(path.dirname(oldPath), { recursive: true })
      await fs.mkdir(path.dirname(newPath), { recursive: true })
      await fs.writeFile(oldPath, '# Old', 'utf-8')
      await fs.writeFile(newPath, '# New', 'utf-8')

      // Attempt migration
      const result = await migrator.migrateFile({
        oldPath,
        newPath,
        category: 'tutorial',
        adaptContent: false,
      })

      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0]).toContain('already exists')
    })

    it('should handle missing source file', async () => {
      const oldPath = path.join(testDir, 'nonexistent.md')
      const newPath = path.join(testDir, 'new', 'test.md')

      const result = await migrator.migrateFile({
        oldPath,
        newPath,
        category: 'tutorial',
        adaptContent: false,
      })

      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0]).toContain('does not exist')
    })

    it('should adapt content when adaptContent is true', async () => {
      const oldPath = path.join(testDir, 'old', 'test.md')
      const newPath = path.join(testDir, 'new', 'test.md')
      const content = '# Test Tutorial\n\nSome content here.'

      await fs.mkdir(path.dirname(oldPath), { recursive: true })
      await fs.writeFile(oldPath, content, 'utf-8')

      const result = await migrator.migrateFile({
        oldPath,
        newPath,
        category: 'tutorial',
        adaptContent: true,
      })

      expect(result.success).toBe(true)

      // Check that content was adapted (should have tutorial sections)
      const newContent = await fs.readFile(newPath, 'utf-8')
      expect(newContent).toContain('## What You Will Learn')
      expect(newContent).toContain('## Prerequisites')
    })
  })

  describe('adaptContentToCategory', () => {
    it('should add tutorial-specific sections', () => {
      const content = '# My Tutorial\n\nSome content.'
      const adapted = migrator.adaptContentToCategory(content, 'tutorial')

      expect(adapted).toContain('## What You Will Learn')
      expect(adapted).toContain('## Prerequisites')
    })

    it('should add how-to specific sections', () => {
      const content = '# How to Deploy\n\nDeployment steps.'
      const adapted = migrator.adaptContentToCategory(content, 'how-to')

      expect(adapted).toContain('## Prerequisites')
      expect(adapted).toContain('## Steps')
    })

    it('should not modify reference content', () => {
      const content = '# API Reference\n\n## Endpoints'
      const adapted = migrator.adaptContentToCategory(content, 'reference')

      expect(adapted).toContain('# API Reference')
      expect(adapted).toContain('## Endpoints')
      // Should not add extra sections
      expect(adapted.split('##').length).toBe(2) // Title + Endpoints
    })

    it('should add explanation-specific sections', () => {
      const content = '# Architecture Explanation\n\nDetails here.'
      const adapted = migrator.adaptContentToCategory(content, 'explanation')

      expect(adapted).toContain('## Overview')
    })

    it('should preserve existing sections', () => {
      const content = '# Tutorial\n\n## Prerequisites\n\nNode.js required.\n\n## Steps\n\n1. Install'
      const adapted = migrator.adaptContentToCategory(content, 'tutorial')

      // Should not duplicate existing sections
      const prerequisitesCount = (adapted.match(/## Prerequisites/g) || []).length
      expect(prerequisitesCount).toBe(1)
    })
  })

  describe('archiveFile', () => {
    it('should move file to archive with timestamp', async () => {
      const filePath = path.join(testDir, 'old-doc.md')
      const archiveRoot = path.join(testDir, 'archive')
      const content = '# Old Document'

      // Create file to archive
      await fs.mkdir(path.dirname(filePath), { recursive: true })
      await fs.writeFile(filePath, content, 'utf-8')

      // Archive the file
      const archivePath = await migrator.archiveFile(filePath, archiveRoot)

      // Check that file was archived
      expect(archivePath).toContain('archive')
      expect(archivePath).toContain(new Date().toISOString().split('T')[0])

      const archivedContent = await fs.readFile(archivePath, 'utf-8')
      expect(archivedContent).toBe(content)
    })

    it('should handle duplicate filenames in archive', async () => {
      const filePath = path.join(testDir, 'doc.md')
      const archiveRoot = path.join(testDir, 'archive')

      await fs.mkdir(path.dirname(filePath), { recursive: true })
      await fs.writeFile(filePath, '# Doc 1', 'utf-8')

      // Archive first time
      const archivePath1 = await migrator.archiveFile(filePath, archiveRoot)

      // Archive again with same filename
      const archivePath2 = await migrator.archiveFile(filePath, archiveRoot)

      // Paths should be different
      expect(archivePath1).not.toBe(archivePath2)
      expect(archivePath2).toContain('-1')
    })

    it('should preserve file metadata in archive', async () => {
      const filePath = path.join(testDir, 'doc.md')
      const archiveRoot = path.join(testDir, 'archive')

      await fs.mkdir(path.dirname(filePath), { recursive: true })
      await fs.writeFile(filePath, '# Doc', 'utf-8')

      const originalStats = await fs.stat(filePath)
      const archivePath = await migrator.archiveFile(filePath, archiveRoot)
      const archivedStats = await fs.stat(archivePath)

      expect(archivedStats.mtime.getTime()).toBe(originalStats.mtime.getTime())
    })
  })

  describe('preserveGitHistory', () => {
    it('should attempt to use git mv', async () => {
      const oldPath = path.join(testDir, 'old.md')
      const newPath = path.join(testDir, 'new.md')

      // Create a test file
      await fs.mkdir(testDir, { recursive: true })
      await fs.writeFile(oldPath, '# Test', 'utf-8')

      // Note: This test will fail if not in a git repo or if git is not available
      // The function should handle this gracefully
      await expect(
        migrator.preserveGitHistory(oldPath, newPath),
      ).resolves.not.toThrow()
    })

    it('should fall back gracefully when git mv fails', async () => {
      const oldPath = path.join(testDir, 'nonexistent.md')
      const newPath = path.join(testDir, 'new.md')

      // Try to preserve history for non-existent file
      // Should not throw, just log warning
      await expect(
        migrator.preserveGitHistory(oldPath, newPath),
      ).resolves.not.toThrow()
    })
  })

  describe('consolidateDuplicates', () => {
    it('should keep the most recent file', async () => {
      const file1: FileInfo = {
        path: path.join(testDir, 'file1.md'),
        name: 'file1.md',
        size: 100,
        lastModified: new Date('2024-01-01'),
        content: '# File 1',
      }

      const file2: FileInfo = {
        path: path.join(testDir, 'file2.md'),
        name: 'file2.md',
        size: 100,
        lastModified: new Date('2024-01-15'),
        content: '# File 2',
      }

      // Create both files
      await fs.mkdir(testDir, { recursive: true })
      await fs.writeFile(file1.path, file1.content, 'utf-8')
      await fs.writeFile(file2.path, file2.content, 'utf-8')

      const archiveRoot = path.join(testDir, 'archive')
      const keptFile = await migrator.consolidateDuplicates(
        [file1, file2],
        archiveRoot,
      )

      // Should keep the more recent file
      expect(keptFile).toBe(file2.path)

      // Check that older file was archived
      const archiveFiles = await fs.readdir(
        path.join(archiveRoot, new Date().toISOString().split('T')[0]),
      )
      expect(archiveFiles).toContain('file1.md')
    })

    it('should keep the larger file when dates are equal', async () => {
      const sameDate = new Date('2024-01-01')

      const file1: FileInfo = {
        path: path.join(testDir, 'file1.md'),
        name: 'file1.md',
        size: 100,
        lastModified: sameDate,
        content: '# Small',
      }

      const file2: FileInfo = {
        path: path.join(testDir, 'file2.md'),
        name: 'file2.md',
        size: 500,
        lastModified: sameDate,
        content: '# Larger file with more content',
      }

      await fs.mkdir(testDir, { recursive: true })
      await fs.writeFile(file1.path, file1.content, 'utf-8')
      await fs.writeFile(file2.path, file2.content, 'utf-8')

      const archiveRoot = path.join(testDir, 'archive')
      const keptFile = await migrator.consolidateDuplicates(
        [file1, file2],
        archiveRoot,
      )

      // Should keep the larger file
      expect(keptFile).toBe(file2.path)
    })

    it('should handle single file', async () => {
      const file: FileInfo = {
        path: path.join(testDir, 'file.md'),
        name: 'file.md',
        size: 100,
        lastModified: new Date(),
        content: '# File',
      }

      const keptFile = await migrator.consolidateDuplicates([file])
      expect(keptFile).toBe(file.path)
    })

    it('should throw error for empty array', async () => {
      await expect(migrator.consolidateDuplicates([])).rejects.toThrow(
        'No files provided',
      )
    })
  })
})
