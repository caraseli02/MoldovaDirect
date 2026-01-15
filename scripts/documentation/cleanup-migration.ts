/**
 * Cleanup Migration
 * Removes old documentation files and extra backups after migration
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'

/**
 * Remove old documentation directories that have been migrated
 */
async function removeOldDirectories(): Promise<void> {
  const projectRoot = process.cwd()
  const docsPath = path.join(projectRoot, 'docs')

  // Directories that should be removed (old structure)
  const oldDirs = [
    'analysis',
    'api',
    'architecture',
    'automation',
    'design-inspiration',
    'development',
    'features',
    'getting-started',
    'guides',
    'issues',
    'lessons',
    'manuals',
    'meta',
    'notebooklm',
    'optimization',
    'patches',
    'research',
    'reviews',
    'security',
    'specs',
    'status',
    'testing',
    'visual-regression'
  ]

  console.log('Removing old documentation directories...\n')

  for (const dir of oldDirs) {
    const dirPath = path.join(docsPath, dir)

    try {
      await fs.access(dirPath)
      await fs.rm(dirPath, { recursive: true, force: true })
      console.log(`✓ Removed: ${dir}/`)
    } catch (error) {
      const errorCode = error && typeof error === 'object' && 'code' in error ? error.code : undefined
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (errorCode !== 'ENOENT') {
        console.error(`✗ Error removing ${dir}/:`, errorMessage)
      }
    }
  }

  console.log('\n✓ Old directories removed')
}

/**
 * Remove old root-level markdown files that were migrated
 */
async function removeOldRootFiles(): Promise<void> {
  const projectRoot = process.cwd()
  const docsPath = path.join(projectRoot, 'docs')

  // Root-level files that were migrated
  const oldFiles = [
    'CODEBASE_AUDIT_REPORT.md',
    'MVP_ASSESSMENT_REPORT.md',
    'NUXT3_LANDING_PAGES_RESEARCH.md',
    'NUXT3_PRODUCT_PAGE_DOCUMENTATION.md',
    'QUICK_REFERENCE_PRODUCT_PAGES.md'
  ]

  console.log('\nRemoving old root-level files...\n')

  for (const file of oldFiles) {
    const filePath = path.join(docsPath, file)

    try {
      await fs.access(filePath)
      await fs.unlink(filePath)
      console.log(`✓ Removed: ${file}`)
    } catch (error) {
      const errorCode = error && typeof error === 'object' && 'code' in error ? error.code : undefined
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (errorCode !== 'ENOENT') {
        console.error(`✗ Error removing ${file}:`, errorMessage)
      }
    }
  }

  console.log('\n✓ Old root files removed')
}

/**
 * Keep only the latest backup, remove older ones
 */
async function cleanupBackups(): Promise<void> {
  const projectRoot = process.cwd()
  const backupsPath = path.join(projectRoot, 'docs-backups')

  try {
    const entries = await fs.readdir(backupsPath, { withFileTypes: true })
    const backupDirs = entries
      .filter(e => e.isDirectory())
      .map(e => ({
        name: e.name,
        path: path.join(backupsPath, e.name)
      }))
      .sort((a, b) => b.name.localeCompare(a.name)) // Sort descending (newest first)

    if (backupDirs.length <= 1) {
      console.log('\n✓ Only one backup exists, nothing to clean up')
      return
    }

    console.log(`\nFound ${backupDirs.length} backups, keeping the latest...\n`)

    // Keep the first (newest), remove the rest
    const toKeep = backupDirs[0]!
    const toRemove = backupDirs.slice(1)

    console.log(`✓ Keeping: ${toKeep.name}`)

    for (const backup of toRemove) {
      await fs.rm(backup.path, { recursive: true, force: true })
      console.log(`✓ Removed: ${backup.name}`)
    }

    console.log(`\n✓ Cleaned up ${toRemove.length} old backup(s)`)
  } catch (error) {
    const errorCode = error && typeof error === 'object' && 'code' in error ? error.code : undefined
    if (errorCode === 'ENOENT') {
      console.log('\n✓ No backups directory found')
    } else {
      console.error('Error cleaning up backups:', error.message)
    }
  }
}

/**
 * Display cleanup summary
 */
async function displaySummary(): Promise<void> {
  const projectRoot = process.cwd()
  const docsPath = path.join(projectRoot, 'docs')

  // Count files in docs
  let fileCount = 0
  async function countFiles(dir: string): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        await countFiles(fullPath)
      } else if (entry.isFile()) {
        fileCount++
      }
    }
  }

  await countFiles(docsPath)

  console.log('\n' + '='.repeat(60))
  console.log('CLEANUP SUMMARY')
  console.log('='.repeat(60))
  console.log(`\nDocumentation files remaining: ${fileCount}`)
  console.log('\nNew structure:')
  console.log('  ✓ docs/tutorials/')
  console.log('  ✓ docs/how-to/')
  console.log('  ✓ docs/reference/')
  console.log('  ✓ docs/explanation/')
  console.log('  ✓ docs/project/')
  console.log('  ✓ docs/archive/')
  console.log('  ✓ docs/ai-context/')
  console.log('\nOld structure: REMOVED')
  console.log('Extra backups: REMOVED')
  console.log('\n✅ Cleanup complete!')
  console.log('='.repeat(60))
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  console.log('='.repeat(60))
  console.log('DOCUMENTATION MIGRATION CLEANUP')
  console.log('='.repeat(60))
  console.log('\nThis will:')
  console.log('  1. Remove old documentation directories')
  console.log('  2. Remove old root-level files')
  console.log('  3. Keep only the latest backup')
  console.log('\n' + '='.repeat(60))

  try {
    // Step 1: Remove old directories
    await removeOldDirectories()

    // Step 2: Remove old root files
    await removeOldRootFiles()

    // Step 3: Cleanup backups
    await cleanupBackups()

    // Step 4: Display summary
    await displaySummary()

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('\n❌ Cleanup failed:', errorMessage)
    process.exit(1)
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
