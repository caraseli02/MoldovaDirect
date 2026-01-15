/**
 * Validate Command
 * Runs quality validator and generates comprehensive quality report
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'
import type { CLIOptions, Logger } from '../cli'
import { DocumentationAuditor } from '../auditor'
import { QualityValidator } from '../quality-validator'
import type { QualityReport, FileInfo } from '../types'

/**
 * Run validate command
 * Validates documentation quality and generates report
 */
export async function runValidate(options: CLIOptions, logger: Logger): Promise<void> {
  logger.info('Starting documentation validation...')

  // Determine docs directory (default: docs/)
  const docsDir = options.args[0] || 'docs'
  logger.verbose(`Validating directory: ${docsDir}`)

  // Check if directory exists
  try {
    await fs.access(docsDir)
  } catch {
    logger.error(`Directory not found: ${docsDir}`)
    throw new Error(`Directory not found: ${docsDir}`)
  }

  // Scan documentation files
  logger.info('Scanning documentation files...')
  const auditor = new DocumentationAuditor()
  const inventory = await auditor.scanDirectory(docsDir)
  logger.info(`Found ${inventory.totalCount} files to validate`)

  // Run quality validation
  logger.info('\n=== Running Quality Checks ===')
  const validator = new QualityValidator()

  logger.info('1. Validating links...')
  const linkValidation = await validator.validateLinks(inventory.files)
  displayLinkValidation(linkValidation, logger)

  logger.info('\n2. Validating code examples...')
  const codeValidation = await validator.validateCodeExamples(inventory.files)
  displayCodeValidation(codeValidation, logger)

  logger.info('\n3. Validating document structure...')
  validateAllStructures(inventory.files, validator, logger)

  logger.info('\n4. Validating formatting...')
  validateAllFormatting(inventory.files, validator, logger)

  logger.info('\n5. Validating metadata...')
  validateAllMetadata(inventory.files, validator, logger)

  // Generate comprehensive quality report
  logger.info('\n=== Generating Quality Report ===')
  const report = await validator.generateQualityReport(inventory.files)

  // Display summary
  displayQualitySummary(report, logger)

  // Save report to file
  const outputPath = options.flags.output || 'scripts/documentation/quality-report.json'
  await saveQualityReport(report, outputPath, logger)

  // Also save human-readable markdown report
  const markdownPath = outputPath.replace('.json', '.md')
  await saveMarkdownReport(report, markdownPath, logger)

  logger.info('\nValidation completed successfully')

  // Exit with error code if quality is below threshold
  if (report.overallScore < 70) {
    logger.warn(`\nQuality score (${report.overallScore}) is below threshold (70)`)
    logger.warn('Please address the issues identified in the report')
    process.exitCode = 1
  }
}

/**
 * Validate structure for all files
 */
function validateAllStructures(
  files: FileInfo[],
  validator: QualityValidator,
  logger: Logger
): any[] {
  const issues: any[] = []

  for (const file of files) {
    const category = file.category || 'uncategorized'
    const result = validator.validateStructure(file, category)

    if (!result.hasRequiredSections || result.recommendations.length > 0) {
      issues.push({ file: file.path, ...result })
      logger.verbose(`Structure issues in ${file.path}`)
    }
  }

  logger.info(`Found ${issues.length} files with structure issues`)
  return issues
}

/**
 * Validate formatting for all files
 */
function validateAllFormatting(
  files: FileInfo[],
  validator: QualityValidator,
  logger: Logger
): any[] {
  const issues: any[] = []

  for (const file of files) {
    const result = validator.validateFormatting(file)

    if (result.issues.length > 0) {
      issues.push({ file: file.path, ...result })
      logger.verbose(`Formatting issues in ${file.path}`)
    }
  }

  logger.info(`Found ${issues.length} files with formatting issues`)
  return issues
}

/**
 * Validate metadata for all files
 */
function validateAllMetadata(
  files: FileInfo[],
  validator: QualityValidator,
  logger: Logger
): any[] {
  const issues: any[] = []

  for (const file of files) {
    const result = validator.validateMetadata(file)

    if (result.missingFields.length > 0) {
      issues.push({ file: file.path, ...result })
      logger.verbose(`Metadata issues in ${file.path}`)
    }
  }

  logger.info(`Found ${issues.length} files with metadata issues`)
  return issues
}

/**
 * Display link validation results
 */
function displayLinkValidation(report: any, logger: Logger): void {
  logger.info(`  Total links: ${report.totalLinks}`)
  logger.info(`  Valid links: ${report.validLinks}`)
  logger.info(`  Broken links: ${report.brokenLinks.length}`)

  if (report.brokenLinks.length > 0 && report.brokenLinks.length <= 10) {
    logger.warn('  Broken links:')
    report.brokenLinks.forEach((link: any) => {
      logger.warn(`    ${link.file}: ${link.link}`)
    })
  } else if (report.brokenLinks.length > 10) {
    logger.warn(`  (${report.brokenLinks.length} broken links - see report for details)`)
  }
}

/**
 * Display code validation results
 */
function displayCodeValidation(report: any, logger: Logger): void {
  logger.info(`  Total examples: ${report.totalExamples}`)
  logger.info(`  Valid examples: ${report.validExamples}`)
  logger.info(`  Invalid examples: ${report.invalidExamples.length}`)

  if (report.invalidExamples.length > 0 && report.invalidExamples.length <= 10) {
    logger.warn('  Invalid examples:')
    report.invalidExamples.forEach((ex: any) => {
      logger.warn(`    ${ex.file}:${ex.line} - ${ex.error}`)
    })
  } else if (report.invalidExamples.length > 10) {
    logger.warn(`  (${report.invalidExamples.length} invalid examples - see report for details)`)
  }
}

/**
 * Display quality summary
 */
function displayQualitySummary(report: QualityReport, logger: Logger): void {
  logger.info('\n=== Quality Summary ===')
  logger.info(`Overall Score: ${report.overallScore}/100`)
  logger.info('')

  // Score interpretation
  if (report.overallScore >= 90) {
    logger.info('✓ Excellent quality!')
  } else if (report.overallScore >= 70) {
    logger.info('✓ Good quality with room for improvement')
  } else if (report.overallScore >= 50) {
    logger.warn('⚠ Fair quality - improvements needed')
  } else {
    logger.error('✗ Poor quality - significant improvements required')
  }
  logger.info('')

  // Detailed scores
  const linkScore = report.linkValidation.totalLinks > 0
    ? Math.round((report.linkValidation.validLinks / report.linkValidation.totalLinks) * 100)
    : 100
  const codeScore = report.codeValidation.totalExamples > 0
    ? Math.round((report.codeValidation.validExamples / report.codeValidation.totalExamples) * 100)
    : 100

  logger.info('Component Scores:')
  logger.info(`  Links: ${linkScore}/100`)
  logger.info(`  Code Examples: ${codeScore}/100`)
  logger.info(`  Structure: ${report.structureIssues.length} issues`)
  logger.info(`  Formatting: ${report.formattingIssues.length} issues`)
  logger.info(`  Metadata: ${report.metadataIssues.length} issues`)
  logger.info('')

  // Recommendations
  if (report.recommendations.length > 0) {
    logger.info('Recommendations:')
    report.recommendations.forEach((rec, index) => {
      logger.info(`  ${index + 1}. ${rec}`)
    })
  }
}

/**
 * Save quality report to JSON file
 */
async function saveQualityReport(
  report: QualityReport,
  outputPath: string,
  logger: Logger
): Promise<void> {
  logger.verbose(`Saving quality report to: ${outputPath}`)

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath)
  await fs.mkdir(outputDir, { recursive: true })

  const serializable = {
    overallScore: report.overallScore,
    linkValidation: report.linkValidation,
    codeValidation: report.codeValidation,
    structureIssues: report.structureIssues,
    formattingIssues: report.formattingIssues,
    metadataIssues: report.metadataIssues,
    recommendations: report.recommendations,
    generatedAt: new Date().toISOString(),
  }

  await fs.writeFile(outputPath, JSON.stringify(serializable, null, 2), 'utf-8')
  logger.info(`Quality report saved to: ${outputPath}`)
}

/**
 * Save human-readable markdown report
 */
async function saveMarkdownReport(
  report: QualityReport,
  outputPath: string,
  logger: Logger
): Promise<void> {
  logger.verbose(`Saving markdown report to: ${outputPath}`)

  const sections: string[] = []

  // Header
  sections.push('# Documentation Quality Report')
  sections.push('')
  sections.push(`Generated: ${new Date().toISOString()}`)
  sections.push('')

  // Overall Score
  sections.push('## Overall Score')
  sections.push('')
  sections.push(`**${report.overallScore}/100**`)
  sections.push('')

  if (report.overallScore >= 90) {
    sections.push('✓ Excellent quality!')
  } else if (report.overallScore >= 70) {
    sections.push('✓ Good quality with room for improvement')
  } else if (report.overallScore >= 50) {
    sections.push('⚠ Fair quality - improvements needed')
  } else {
    sections.push('✗ Poor quality - significant improvements required')
  }
  sections.push('')

  // Link Validation
  sections.push('## Link Validation')
  sections.push('')
  sections.push(`- Total Links: ${report.linkValidation.totalLinks}`)
  sections.push(`- Valid Links: ${report.linkValidation.validLinks}`)
  sections.push(`- Broken Links: ${report.linkValidation.brokenLinks.length}`)
  sections.push('')

  if (report.linkValidation.brokenLinks.length > 0) {
    sections.push('### Broken Links')
    sections.push('')
    report.linkValidation.brokenLinks.forEach(link => {
      sections.push(`- \`${link.file}\`: ${link.link}`)
    })
    sections.push('')
  }

  // Code Validation
  sections.push('## Code Example Validation')
  sections.push('')
  sections.push(`- Total Examples: ${report.codeValidation.totalExamples}`)
  sections.push(`- Valid Examples: ${report.codeValidation.validExamples}`)
  sections.push(`- Invalid Examples: ${report.codeValidation.invalidExamples.length}`)
  sections.push('')

  if (report.codeValidation.invalidExamples.length > 0) {
    sections.push('### Invalid Code Examples')
    sections.push('')
    report.codeValidation.invalidExamples.forEach(ex => {
      sections.push(`- \`${ex.file}:${ex.line}\`: ${ex.error}`)
    })
    sections.push('')
  }

  // Structure Issues
  if (report.structureIssues.length > 0) {
    sections.push('## Structure Issues')
    sections.push('')
    sections.push(`Found ${report.structureIssues.length} files with structure issues`)
    sections.push('')
  }

  // Formatting Issues
  if (report.formattingIssues.length > 0) {
    sections.push('## Formatting Issues')
    sections.push('')
    sections.push(`Found ${report.formattingIssues.length} files with formatting issues`)
    sections.push('')
  }

  // Metadata Issues
  if (report.metadataIssues.length > 0) {
    sections.push('## Metadata Issues')
    sections.push('')
    sections.push(`Found ${report.metadataIssues.length} files with metadata issues`)
    sections.push('')
  }

  // Recommendations
  if (report.recommendations.length > 0) {
    sections.push('## Recommendations')
    sections.push('')
    report.recommendations.forEach((rec, index) => {
      sections.push(`${index + 1}. ${rec}`)
    })
    sections.push('')
  }

  await fs.writeFile(outputPath, sections.join('\n'), 'utf-8')
  logger.info(`Markdown report saved to: ${outputPath}`)
}
