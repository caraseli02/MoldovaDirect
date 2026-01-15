/**
 * Backup Command
 * Creates a timestamped backup of the documentation directory
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'
import type { CLIOptions, Logger } from '../cli'

interface BackupResult {
  success: boolean
  backupPath: string
  timestamp: string
  fileCount: number
  totalSize: number
  errors: string[]
}

/**
 * Create a timestamped backup of the docs directory
 */
export async function createBackup(
  sourcePath: string,
  backupBasePath: string,
  logger: Logger
): Promise<BackupResult> {
  const isoString = new Date().toISOString()
  const datePart = isoString.split('T')[0] || 'unknown-date'
  const timePart = (isoString.split('T')[1] || 'unknown-time').split('Z')[0] || 'unknown-time'
  const timestamp = `${datePart}_${timePart}`.replace(/[:.]/g, '-')
  const backupPath = path.join(backupBasePath, `docs-backup-${timestamp}`)

  const result: BackupResult = {
    success: false,
    backupPath,
    timestamp,
    fileCount: 0,
    totalSize: 0,
    errors: []
  }

  try {
    logger.info(`Creating backup of ${sourcePath}`)
    logger.info(`Backup location: ${backupPath}`)

    // Create backup directory
    await fs.mkdir(backupPath, { recursive: true })

    // Copy directory recursively
    const stats = await copyDirectory(sourcePath, backupPath, logger)

    result.fileCount = stats.fileCount
    result.totalSize = stats.totalSize
    result.success = true

    logger.info(`Backup completed successfully`)
    logger.info(`Files backed up: ${result.fileCount}`)
    logger.info(`Total size: ${formatBytes(result.totalSize)}`)

    return result
  } catch (error: any) {
    result.errors.push(error.message)
    logger.error(`Backup failed: ${error.message}`)
    throw error
  }
}

/**
 * Recursively copy a directory
 */
async function copyDirectory(
  source: string,
  destination: string,
  logger: Logger
): Promise<{ fileCount: number; totalSize: number }> {
  let fileCount = 0
  let totalSize = 0

  // Create destination directory
  await fs.mkdir(destination, { recursive: true })

  // Read source directory
  const entries = await fs.readdir(source, { withFileTypes: true })

  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name)
    const destPath = path.join(destination, entry.name)

    if (entry.isDirectory()) {
      // Skip node_modules and other large directories
      if (entry.name === 'node_modules' || entry.name === '.git') {
        logger.verbose(`Skipping directory: ${entry.name}`)
        continue
      }

      // Recursively copy subdirectory
      const stats = await copyDirectory(sourcePath, destPath, logger)
      fileCount += stats.fileCount
      totalSize += stats.totalSize
    } else if (entry.isFile()) {
      // Copy file
      await fs.copyFile(sourcePath, destPath)

      const stat = await fs.stat(sourcePath)
      totalSize += stat.size
      fileCount++

      logger.verbose(`Copied: ${sourcePath}`)
    }
  }

  return { fileCount, totalSize }
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Run backup command
 */
export async function runBackup(
  options: CLIOptions,
  logger: Logger
): Promise<void> {
  const projectRoot = process.cwd()
  const docsPath = path.join(projectRoot, 'docs')
  const backupBasePath = path.join(projectRoot, 'docs-backups')

  logger.info('Starting documentation backup...')

  // Check if docs directory exists
  try {
    await fs.access(docsPath)
  } catch {
    throw new Error(`Documentation directory not found: ${docsPath}`)
  }

  // Create backup
  const result = await createBackup(docsPath, backupBasePath, logger)

  // Write backup metadata
  const metadataPath = path.join(result.backupPath, 'backup-metadata.json')
  await fs.writeFile(
    metadataPath,
    JSON.stringify({
      timestamp: result.timestamp,
      sourcePath: docsPath,
      backupPath: result.backupPath,
      fileCount: result.fileCount,
      totalSize: result.totalSize,
      createdAt: new Date().toISOString()
    }, null, 2)
  )

  logger.info(`Backup metadata saved to: ${metadataPath}`)

  // Output result if specified
  if (options.flags.output) {
    await fs.writeFile(
      options.flags.output,
      JSON.stringify(result, null, 2)
    )
    logger.info(`Backup result saved to: ${options.flags.output}`)
  }
}
