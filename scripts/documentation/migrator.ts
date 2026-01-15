/**
 * Content Migrator
 * Moves and adapts documentation to new structure
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'
import type { DiátaxisCategory, FileInfo } from './types'

export interface MigrationMapping {
  oldPath: string
  newPath: string
  category: DiátaxisCategory
  adaptContent: boolean
}

export interface MigrationResult {
  success: boolean
  oldPath: string
  newPath: string
  linksUpdated: number
  errors: string[]
}

export interface LinkMap {
  [oldPath: string]: string // oldPath -> newPath
}

export class ContentMigrator {
  /**
   * Create the Diátaxis folder structure
   * @param targetPath - Root path where structure should be created (e.g., 'docs')
   */
  async createStructure(targetPath: string): Promise<void> {
    const directories = [
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

    for (const dir of directories) {
      try {
        await fs.mkdir(dir, { recursive: true })
      } catch (error: any) {
        // If directory already exists, that's fine
        if (error.code !== 'EEXIST') {
          throw new MigrationError(
            `Failed to create directory ${dir}`,
            'DIRECTORY_CREATION_FAILED',
            { path: dir, originalError: error },
          )
        }
      }
    }
  }

  /**
   * Migrate a single file from old location to new location
   * @param mapping - Migration mapping with old and new paths
   * @returns Migration result
   */
  async migrateFile(mapping: MigrationMapping): Promise<MigrationResult> {
    const errors: string[] = []

    try {
      // Check if source file exists
      try {
        await fs.access(mapping.oldPath)
      } catch {
        errors.push(`Source file does not exist: ${mapping.oldPath}`)
        return {
          success: false,
          oldPath: mapping.oldPath,
          newPath: mapping.newPath,
          linksUpdated: 0,
          errors,
        }
      }

      // Check if target already exists
      try {
        await fs.access(mapping.newPath)
        errors.push(`Target file already exists: ${mapping.newPath}`)
        return {
          success: false,
          oldPath: mapping.oldPath,
          newPath: mapping.newPath,
          linksUpdated: 0,
          errors,
        }
      } catch {
        // Target doesn't exist, which is what we want
      }

      // Read source content
      const content = await fs.readFile(mapping.oldPath, 'utf-8')

      // Adapt content if needed
      const adaptedContent = mapping.adaptContent
        ? this.adaptContentToCategory(content, mapping.category)
        : content

      // Ensure target directory exists
      const targetDir = path.dirname(mapping.newPath)
      await fs.mkdir(targetDir, { recursive: true })

      // Write to new location
      await fs.writeFile(mapping.newPath, adaptedContent, 'utf-8')

      // Copy file metadata (timestamps)
      const stats = await fs.stat(mapping.oldPath)
      await fs.utimes(mapping.newPath, stats.atime, stats.mtime)

      return {
        success: true,
        oldPath: mapping.oldPath,
        newPath: mapping.newPath,
        linksUpdated: 0, // Will be updated by link updater
        errors: [],
      }
    } catch (error: any) {
      errors.push(error.message)
      return {
        success: false,
        oldPath: mapping.oldPath,
        newPath: mapping.newPath,
        linksUpdated: 0,
        errors,
      }
    }
  }

  /**
   * Adapt content to fit target category conventions
   * @param content - Original content
   * @param category - Target category
   * @returns Adapted content
   */
  adaptContentToCategory(content: string, category: DiátaxisCategory): string {
    // Parse the content to extract title and body
    const lines = content.split('\n')
    let title = ''
    let bodyStartIndex = 0

    // Find the first heading as title
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (line !== undefined && line.startsWith('# ')) {
        title = line.substring(2).trim()
        bodyStartIndex = i + 1
        break
      }
    }

    const body = lines.slice(bodyStartIndex).join('\n')

    switch (category) {
      case 'tutorial':
        return this.adaptToTutorial(title, body)
      case 'how-to':
        return this.adaptToHowTo(title, body)
      case 'reference':
        return this.adaptToReference(title, body)
      case 'explanation':
        return this.adaptToExplanation(title, body)
      default:
        return content
    }
  }

  /**
   * Adapt content to tutorial format (step-by-step learning)
   */
  private adaptToTutorial(title: string, body: string): string {
    const sections: string[] = []

    sections.push(`# ${title}`)
    sections.push('')

    // Add tutorial-specific sections if not present
    if (!body.toLowerCase().includes('## what you will learn')) {
      sections.push('## What You Will Learn')
      sections.push('')
      sections.push('In this tutorial, you will learn:')
      sections.push('')
      sections.push('- [Add learning objectives here]')
      sections.push('')
    }

    if (!body.toLowerCase().includes('## prerequisites')) {
      sections.push('## Prerequisites')
      sections.push('')
      sections.push('Before starting this tutorial, you should have:')
      sections.push('')
      sections.push('- [Add prerequisites here]')
      sections.push('')
    }

    sections.push(body)

    return sections.join('\n')
  }

  /**
   * Adapt content to how-to format (task-focused)
   */
  private adaptToHowTo(title: string, body: string): string {
    const sections: string[] = []

    sections.push(`# ${title}`)
    sections.push('')

    // Add how-to specific sections if not present
    if (!body.toLowerCase().includes('## prerequisites')) {
      sections.push('## Prerequisites')
      sections.push('')
      sections.push('- [Add prerequisites here]')
      sections.push('')
    }

    if (!body.toLowerCase().includes('## steps')) {
      sections.push('## Steps')
      sections.push('')
    }

    sections.push(body)

    return sections.join('\n')
  }

  /**
   * Adapt content to reference format (information-oriented)
   */
  private adaptToReference(title: string, body: string): string {
    const sections: string[] = []

    sections.push(`# ${title}`)
    sections.push('')

    // Reference docs typically don't need adaptation
    // They should be structured as-is
    sections.push(body)

    return sections.join('\n')
  }

  /**
   * Adapt content to explanation format (understanding-oriented)
   */
  private adaptToExplanation(title: string, body: string): string {
    const sections: string[] = []

    sections.push(`# ${title}`)
    sections.push('')

    // Add explanation-specific sections if not present
    if (!body.toLowerCase().includes('## overview')) {
      sections.push('## Overview')
      sections.push('')
      sections.push('[Add high-level overview here]')
      sections.push('')
    }

    sections.push(body)

    return sections.join('\n')
  }

  /**
   * Preserve Git history when moving a file
   * @param oldPath - Original file path
   * @param newPath - New file path
   */
  async preserveGitHistory(oldPath: string, newPath: string): Promise<void> {
    const { execFile } = await import('node:child_process')
    const { promisify } = await import('node:util')
    const execFileAsync = promisify(execFile)

    try {
      // Try to use git mv to preserve history
      await execFileAsync('git', ['mv', oldPath, newPath])
    } catch (error: any) {
      // If git mv fails, fall back to regular copy
      // This might happen if:
      // - Not in a git repository
      // - File is not tracked by git
      // - Git is not installed
      console.warn(
        `Could not preserve Git history for ${oldPath}: ${error.message}`,
      )
      console.warn('Falling back to regular file copy')
    }
  }

  /**
   * Archive a file by moving it to archive/ with timestamp
   * @param filePath - Path to file to archive
   * @param archiveRoot - Root archive directory (default: 'docs/archive')
   */
  async archiveFile(
    filePath: string,
    archiveRoot: string = 'docs/archive',
  ): Promise<string> {
    const timestamp = new Date().toISOString().split('T')[0] || 'unknown'
    const archiveDir = path.join(archiveRoot, timestamp)
    const fileName = path.basename(filePath)
    const archivePath = path.join(archiveDir, fileName)

    // Create archive directory
    await fs.mkdir(archiveDir, { recursive: true })

    // Check if file already exists in archive
    let finalArchivePath = archivePath
    let counter = 1
    while (true) {
      try {
        await fs.access(finalArchivePath)
        // File exists, try with counter
        const ext = path.extname(fileName)
        const base = path.basename(fileName, ext)
        finalArchivePath = path.join(archiveDir, `${base}-${counter}${ext}`)
        counter++
      } catch {
        // File doesn't exist, we can use this path
        break
      }
    }

    // Copy file to archive
    await fs.copyFile(filePath, finalArchivePath)

    // Copy metadata
    const stats = await fs.stat(filePath)
    await fs.utimes(finalArchivePath, stats.atime, stats.mtime)

    return finalArchivePath
  }

  /**
   * Consolidate duplicate files by keeping the most recent/complete version
   * @param duplicateFiles - Array of duplicate files
   * @param archiveRoot - Root archive directory
   * @returns Path to the kept file
   */
  async consolidateDuplicates(
    duplicateFiles: FileInfo[],
    archiveRoot: string = 'docs/archive',
  ): Promise<string> {
    if (duplicateFiles.length === 0) {
      throw new Error('No files provided for consolidation')
    }

    if (duplicateFiles.length === 1) {
      return duplicateFiles[0]!.path
    }

    // Find the most recent and most complete file
    let bestFile = duplicateFiles[0]!
    for (const file of duplicateFiles) {
      // Prefer more recent files
      if (file.lastModified > bestFile.lastModified) {
        bestFile = file
      }
      // If same date, prefer larger files (more complete)
      else if (
        file.lastModified.getTime() === bestFile.lastModified.getTime() &&
        file.size > bestFile.size
      ) {
        bestFile = file
      }
    }

    // Archive all other files
    for (const file of duplicateFiles) {
      if (file.path !== bestFile.path) {
        await this.archiveFile(file.path, archiveRoot)
      }
    }

    return bestFile.path
  }
}

/**
 * Custom error class for migration errors
 */
export class MigrationError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any,
  ) {
    super(message)
    this.name = 'MigrationError'
  }
}
