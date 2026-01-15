/**
 * Migrate Command
 * Runs content migrator with progress reporting, dry-run mode, and rollback support
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'
import type { CLIOptions, Logger } from '../cli'
import { DocumentationAuditor } from '../auditor'
import { ContentMigrator } from '../migrator'
import * as linkUpdater from '../link-updater'
import type { MigrationMap, MigrationResult } from '../types'

interface MigrationState {
  phase: 'audit' | 'structure' | 'migration' | 'links' | 'complete' | 'failed'
  startTime: Date
  completionTime?: Date
  totalFiles: number
  migratedFiles: number
  failedFiles: number
  skippedFiles: number
  errors: Array<{ file: string; error: string }>
  backupPath?: string
}

/**
 * Run migrate command
 * Migrates documentation to new Diátaxis structure
 */
export async function runMigrate(options: CLIOptions, logger: Logger): Promise<void> {
  const dryRun = options.flags.dryRun || false

  if (dryRun) {
    logger.info('Running in DRY-RUN mode - no changes will be made')
  } else {
    logger.info('Starting documentation migration...')
  }

  // Initialize migration state
  const state: MigrationState = {
    phase: 'audit',
    startTime: new Date(),
    totalFiles: 0,
    migratedFiles: 0,
    failedFiles: 0,
    skippedFiles: 0,
    errors: [],
  }

  try {
    // Phase 1: Audit existing documentation
    logger.info('\n=== Phase 1: Auditing Documentation ===')
    const docsDir = options.args[0] || 'docs'

    const auditor = new DocumentationAuditor()
    const inventory = await auditor.scanDirectory(docsDir)
    const migrationMap = auditor.createMigrationMapping(inventory)

    state.totalFiles = migrationMap.mappings.length
    logger.info(`Found ${state.totalFiles} files to migrate`)

    // Display migration plan
    displayMigrationPlan(migrationMap, logger)

    // Create backup if not dry-run
    if (!dryRun) {
      logger.info('\n=== Creating Backup ===')
      state.backupPath = await createBackup(docsDir, logger)
      logger.info(`Backup created at: ${state.backupPath}`)
    }

    // Phase 2: Create new structure
    logger.info('\n=== Phase 2: Creating Directory Structure ===')
    state.phase = 'structure'

    const migrator = new ContentMigrator()

    if (!dryRun) {
      await migrator.createStructure(docsDir)
      logger.info('Directory structure created successfully')
    } else {
      logger.info('[DRY-RUN] Would create Diátaxis directory structure')
    }

    // Phase 3: Migrate files
    logger.info('\n=== Phase 3: Migrating Files ===')
    state.phase = 'migration'

    const results: MigrationResult[] = []

    let i = 0
    for (const mapping of migrationMap.mappings) {
      const progress = `[${i + 1}/${migrationMap.mappings.length}]`
      i++

      logger.verbose(`${progress} Migrating: ${mapping.oldPath} -> ${mapping.newPath}`)

      if (!dryRun) {
        try {
          const result = await migrator.migrateFile({
            oldPath: mapping.oldPath,
            newPath: mapping.newPath,
            category: mapping.category,
            adaptContent: true,
          })

          results.push(result)

          if (result.success) {
            state.migratedFiles++
            logger.verbose(`${progress} ✓ Success`)
          } else {
            state.failedFiles++
            state.errors.push({
              file: mapping.oldPath,
              error: result.errors.join(', '),
            })
            logger.error(`${progress} ✗ Failed: ${result.errors.join(', ')}`)
          }
        } catch (error: any) {
          state.failedFiles++
          state.errors.push({
            file: mapping.oldPath,
            error: error.message,
          })
          logger.error(`${progress} ✗ Error: ${error.message}`)
        }
      } else {
        logger.info(`${progress} [DRY-RUN] Would migrate: ${mapping.oldPath} -> ${mapping.newPath}`)
        state.migratedFiles++
      }

      // Display progress every 10 files
      if (i % 10 === 0) {
        displayProgress(state, logger)
      }
    }

    // Phase 4: Update links
    logger.info('\n=== Phase 4: Updating Internal Links ===')
    state.phase = 'links'

    if (!dryRun) {
      // Build link map from migration mappings
      const linkMap: Record<string, string> = {}
      migrationMap.mappings.forEach(m => {
        linkMap[m.oldPath] = m.newPath
      })

      // Update links in all migrated files
      const migratedFiles = results
        .filter(r => r.success)
        .map(r => r.newPath)

      logger.info(`Updating links in ${migratedFiles.length} files...`)

      for (const filePath of migratedFiles) {
        try {
          const content = await fs.readFile(filePath, 'utf-8')
          const updatedContent = await linkUpdater.updateLinksInContent(content, linkMap, filePath)
          await fs.writeFile(filePath, updatedContent, 'utf-8')
          logger.verbose(`Updated links in: ${filePath}`)
        } catch (error: any) {
          logger.warn(`Failed to update links in ${filePath}: ${error.message}`)
        }
      }

      logger.info('Link updates completed')
    } else {
      logger.info('[DRY-RUN] Would update internal links in migrated files')
    }

    // Migration complete
    state.phase = 'complete'
    state.completionTime = new Date()

    logger.info('\n=== Migration Complete ===')
    displayFinalSummary(state, logger)

    // Save migration report
    if (!dryRun) {
      const reportPath = options.flags.output || 'scripts/documentation/migration-report.json'
      await saveMigrationReport(state, migrationMap, results, reportPath, logger)
    }

  } catch (error: any) {
    state.phase = 'failed'
    state.completionTime = new Date()

    logger.error(`\nMigration failed: ${error.message}`)

    if (!dryRun && state.backupPath) {
      logger.info('\nAttempting rollback...')
      try {
        await rollbackMigration(state.backupPath, options.args[0] || 'docs', logger)
        logger.info('Rollback completed successfully')
      } catch (rollbackError: any) {
        logger.error(`Rollback failed: ${rollbackError.message}`)
        logger.error(`Manual recovery may be required. Backup location: ${state.backupPath}`)
      }
    }

    throw error
  }
}

/**
 * Display migration plan
 */
function displayMigrationPlan(migrationMap: MigrationMap, logger: Logger): void {
  logger.info('\nMigration Plan:')

  // Group by category
  const byCategory = new Map<string, number>()
  migrationMap.mappings.forEach(m => {
    byCategory.set(m.category, (byCategory.get(m.category) || 0) + 1)
  })

  for (const [category, count] of byCategory) {
    logger.info(`  ${category}: ${count} files`)
  }

  // Show top priority files
  const topPriority = migrationMap.mappings
    .filter(m => m.priority >= 8)
    .slice(0, 5)

  if (topPriority.length > 0) {
    logger.info('\nTop priority files:')
    topPriority.forEach(m => {
      logger.info(`  [Priority ${m.priority}] ${m.oldPath}`)
    })
  }
}

/**
 * Create backup of documentation directory
 */
async function createBackup(docsDir: string, logger: Logger): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupPath = `${docsDir}-backup-${timestamp}`

  logger.verbose(`Creating backup: ${backupPath}`)

  // Copy entire directory
  await copyDirectory(docsDir, backupPath)

  return backupPath
}

/**
 * Recursively copy directory
 */
async function copyDirectory(src: string, dest: string): Promise<void> {
  await fs.mkdir(dest, { recursive: true })

  const entries = await fs.readdir(src, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)

    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath)
    } else {
      await fs.copyFile(srcPath, destPath)
    }
  }
}

/**
 * Display migration progress
 */
function displayProgress(state: MigrationState, logger: Logger): void {
  const percent = Math.round((state.migratedFiles / state.totalFiles) * 100)
  logger.info(`Progress: ${state.migratedFiles}/${state.totalFiles} (${percent}%) - Failed: ${state.failedFiles}`)
}

/**
 * Display final migration summary
 */
function displayFinalSummary(state: MigrationState, logger: Logger): void {
  const duration = state.completionTime
    ? (state.completionTime.getTime() - state.startTime.getTime()) / 1000
    : 0

  logger.info(`Total files: ${state.totalFiles}`)
  logger.info(`Migrated: ${state.migratedFiles}`)
  logger.info(`Failed: ${state.failedFiles}`)
  logger.info(`Skipped: ${state.skippedFiles}`)
  logger.info(`Duration: ${duration.toFixed(2)}s`)

  if (state.errors.length > 0) {
    logger.warn('\nErrors encountered:')
    state.errors.forEach(err => {
      logger.warn(`  ${err.file}: ${err.error}`)
    })
  }

  if (state.backupPath) {
    logger.info(`\nBackup location: ${state.backupPath}`)
  }
}

/**
 * Save migration report
 */
async function saveMigrationReport(
  state: MigrationState,
  migrationMap: MigrationMap,
  results: MigrationResult[],
  outputPath: string,
  logger: Logger
): Promise<void> {
  logger.verbose(`Saving migration report to: ${outputPath}`)

  const report = {
    state: {
      ...state,
      startTime: state.startTime.toISOString(),
      completionTime: state.completionTime?.toISOString(),
    },
    migrationMap: {
      totalMappings: migrationMap.mappings.length,
      mappings: migrationMap.mappings,
    },
    results: results.map(r => ({
      success: r.success,
      oldPath: r.oldPath,
      newPath: r.newPath,
      linksUpdated: r.linksUpdated,
      errors: r.errors,
    })),
    generatedAt: new Date().toISOString(),
  }

  const outputDir = path.dirname(outputPath)
  await fs.mkdir(outputDir, { recursive: true })

  await fs.writeFile(outputPath, JSON.stringify(report, null, 2), 'utf-8')
  logger.info(`Migration report saved to: ${outputPath}`)
}

/**
 * Rollback migration by restoring from backup
 */
async function rollbackMigration(
  backupPath: string,
  docsDir: string,
  logger: Logger
): Promise<void> {
  logger.info('Removing migrated files...')

  // Remove the docs directory
  await fs.rm(docsDir, { recursive: true, force: true })

  logger.info('Restoring from backup...')

  // Restore from backup
  await copyDirectory(backupPath, docsDir)

  logger.info('Rollback completed')
}
