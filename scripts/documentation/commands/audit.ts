/**
 * Audit Command
 * Runs documentation auditor and generates report
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'
import type { CLIOptions, Logger } from '../cli'
import { DocumentationAuditor } from '../auditor'
import type { AuditReport } from '../types'

/**
 * Run audit command
 * Scans documentation directory and generates comprehensive audit report
 */
export async function runAudit(options: CLIOptions, logger: Logger): Promise<void> {
  logger.info('Starting documentation audit...')

  // Determine docs directory (default: docs/)
  const docsDir = options.args[0] || 'docs'
  logger.verbose(`Scanning directory: ${docsDir}`)

  // Check if directory exists
  try {
    await fs.access(docsDir)
  } catch {
    logger.error(`Directory not found: ${docsDir}`)
    throw new Error(`Directory not found: ${docsDir}`)
  }

  // Create auditor instance
  const auditor = new DocumentationAuditor()

  // Scan directory
  logger.info('Scanning files...')
  const inventory = await auditor.scanDirectory(docsDir)
  logger.info(`Found ${inventory.totalCount} documentation files`)

  // Generate audit report
  logger.info('Generating audit report...')
  const report = auditor.generateAuditReport(inventory)

  // Display summary to console
  displayAuditSummary(report, logger)

  // Save report to file
  const outputPath = options.flags.output || 'scripts/documentation/audit-report.json'
  await saveAuditReport(report, outputPath, logger)

  // Also save human-readable markdown report
  const markdownPath = outputPath.replace('.json', '.md')
  await saveMarkdownReport(report, markdownPath, logger)

  logger.info('Audit completed successfully')
}

/**
 * Display audit summary to console
 */
function displayAuditSummary(report: AuditReport, logger: Logger): void {
  logger.info('\n=== Audit Summary ===')
  logger.info(`Total files: ${report.summary.totalFiles}`)
  logger.info(`Total size: ${formatBytes(report.details.inventory.totalSize)}`)
  logger.info('')

  logger.info('Files by category:')
  for (const [category, count] of report.summary.byCategory) {
    logger.info(`  ${category}: ${count}`)
  }
  logger.info('')

  logger.info(`Duplicate sets found: ${report.summary.duplicates}`)
  logger.info(`Documentation gaps: ${report.summary.gaps}`)
  logger.info('')

  if (report.recommendations.length > 0) {
    logger.info('Recommendations:')
    report.recommendations.forEach((rec, index) => {
      logger.info(`  ${index + 1}. ${rec}`)
    })
    logger.info('')
  }

  // Display gap details
  const gaps = report.details.gaps
  if (gaps.missingTutorials.length > 0) {
    logger.warn('Missing tutorials:')
    gaps.missingTutorials.forEach(topic => logger.warn(`  - ${topic}`))
  }
  if (gaps.missingHowTos.length > 0) {
    logger.warn('Missing how-to guides:')
    gaps.missingHowTos.forEach(topic => logger.warn(`  - ${topic}`))
  }
  if (gaps.missingReference.length > 0) {
    logger.warn('Missing reference docs:')
    gaps.missingReference.forEach(topic => logger.warn(`  - ${topic}`))
  }
  if (gaps.missingExplanations.length > 0) {
    logger.warn('Missing explanations:')
    gaps.missingExplanations.forEach(topic => logger.warn(`  - ${topic}`))
  }

  // Display duplicate details
  if (report.details.duplicates.duplicateSets.length > 0) {
    logger.warn('\nDuplicate content detected:')
    report.details.duplicates.duplicateSets.forEach((set, index) => {
      logger.warn(`  Set ${index + 1} (${Math.round(set.similarity * 100)}% similar):`)
      set.files.forEach(file => {
        logger.warn(`    - ${file.path}`)
      })
      logger.warn(`    Recommendation: ${set.recommendation}`)
    })
  }
}

/**
 * Save audit report to JSON file
 */
async function saveAuditReport(
  report: AuditReport,
  outputPath: string,
  logger: Logger
): Promise<void> {
  logger.verbose(`Saving audit report to: ${outputPath}`)

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath)
  await fs.mkdir(outputDir, { recursive: true })

  // Convert Map to object for JSON serialization
  const serializable = {
    summary: {
      totalFiles: report.summary.totalFiles,
      byCategory: Object.fromEntries(report.summary.byCategory),
      duplicates: report.summary.duplicates,
      gaps: report.summary.gaps,
    },
    details: {
      inventory: {
        files: report.details.inventory.files.map(f => ({
          path: f.path,
          name: f.name,
          size: f.size,
          lastModified: f.lastModified.toISOString(),
          category: f.category,
          contentLength: f.content.length,
        })),
        totalCount: report.details.inventory.totalCount,
        totalSize: report.details.inventory.totalSize,
        categories: Object.fromEntries(
          Array.from(report.details.inventory.categories.entries()).map(([cat, files]) => [
            cat,
            files.map(f => f.path),
          ])
        ),
      },
      duplicates: report.details.duplicates,
      gaps: report.details.gaps,
    },
    recommendations: report.recommendations,
    generatedAt: new Date().toISOString(),
  }

  await fs.writeFile(outputPath, JSON.stringify(serializable, null, 2), 'utf-8')
  logger.info(`Audit report saved to: ${outputPath}`)
}

/**
 * Save human-readable markdown report
 */
async function saveMarkdownReport(
  report: AuditReport,
  outputPath: string,
  logger: Logger
): Promise<void> {
  logger.verbose(`Saving markdown report to: ${outputPath}`)

  const sections: string[] = []

  // Header
  sections.push('# Documentation Audit Report')
  sections.push('')
  sections.push(`Generated: ${new Date().toISOString()}`)
  sections.push('')

  // Summary
  sections.push('## Summary')
  sections.push('')
  sections.push(`- **Total Files**: ${report.summary.totalFiles}`)
  sections.push(`- **Total Size**: ${formatBytes(report.details.inventory.totalSize)}`)
  sections.push(`- **Duplicate Sets**: ${report.summary.duplicates}`)
  sections.push(`- **Documentation Gaps**: ${report.summary.gaps}`)
  sections.push('')

  // Files by Category
  sections.push('## Files by Category')
  sections.push('')
  for (const [category, count] of report.summary.byCategory) {
    sections.push(`- **${category}**: ${count} files`)
  }
  sections.push('')

  // Recommendations
  if (report.recommendations.length > 0) {
    sections.push('## Recommendations')
    sections.push('')
    report.recommendations.forEach((rec, index) => {
      sections.push(`${index + 1}. ${rec}`)
    })
    sections.push('')
  }

  // Gap Analysis
  const gaps = report.details.gaps
  sections.push('## Gap Analysis')
  sections.push('')
  sections.push(`**Priority**: ${gaps.priority}`)
  sections.push('')

  if (gaps.missingTutorials.length > 0) {
    sections.push('### Missing Tutorials')
    sections.push('')
    gaps.missingTutorials.forEach(topic => sections.push(`- ${topic}`))
    sections.push('')
  }

  if (gaps.missingHowTos.length > 0) {
    sections.push('### Missing How-To Guides')
    sections.push('')
    gaps.missingHowTos.forEach(topic => sections.push(`- ${topic}`))
    sections.push('')
  }

  if (gaps.missingReference.length > 0) {
    sections.push('### Missing Reference Documentation')
    sections.push('')
    gaps.missingReference.forEach(topic => sections.push(`- ${topic}`))
    sections.push('')
  }

  if (gaps.missingExplanations.length > 0) {
    sections.push('### Missing Explanations')
    sections.push('')
    gaps.missingExplanations.forEach(topic => sections.push(`- ${topic}`))
    sections.push('')
  }

  // Duplicate Content
  if (report.details.duplicates.duplicateSets.length > 0) {
    sections.push('## Duplicate Content')
    sections.push('')
    report.details.duplicates.duplicateSets.forEach((set, index) => {
      sections.push(`### Duplicate Set ${index + 1}`)
      sections.push('')
      sections.push(`**Similarity**: ${Math.round(set.similarity * 100)}%`)
      sections.push('')
      sections.push('**Files**:')
      set.files.forEach(file => {
        sections.push(`- ${file.path}`)
      })
      sections.push('')
      sections.push(`**Recommendation**: ${set.recommendation}`)
      sections.push('')
    })
  }

  // File Inventory
  sections.push('## File Inventory')
  sections.push('')
  for (const [category, files] of report.details.inventory.categories) {
    if (files.length > 0) {
      sections.push(`### ${category}`)
      sections.push('')
      files.forEach(file => {
        sections.push(`- ${file.path} (${formatBytes(file.size)})`)
      })
      sections.push('')
    }
  }

  await fs.writeFile(outputPath, sections.join('\n'), 'utf-8')
  logger.info(`Markdown report saved to: ${outputPath}`)
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${Math.round(bytes / Math.pow(k, i) * 100) / 100} ${sizes[i]}`
}
