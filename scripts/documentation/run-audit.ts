#!/usr/bin/env tsx
/**
 * Run documentation audit on the actual docs/ directory
 */

import { DocumentationAuditor } from './auditor'
import path from 'node:path'
import { promises as fs } from 'node:fs'

async function main() {
  console.log('🔍 Starting documentation audit...\n')

  const auditor = new DocumentationAuditor()
  const docsPath = path.join(process.cwd(), 'docs')

  // Check if docs directory exists
  try {
    await fs.access(docsPath)
  } catch {
    console.error(`❌ Error: docs/ directory not found at ${docsPath}`)
    process.exit(1)
  }

  // Scan directory
  console.log(`📂 Scanning directory: ${docsPath}`)
  const inventory = await auditor.scanDirectory(docsPath)
  console.log(`✅ Found ${inventory.totalCount} documentation files\n`)

  // Generate audit report
  console.log('📊 Generating audit report...')
  const report = auditor.generateAuditReport(inventory)

  // Display summary
  console.log('\n' + '='.repeat(80))
  console.log('AUDIT REPORT SUMMARY')
  console.log('='.repeat(80) + '\n')

  console.log(`📄 Total Files: ${report.summary.totalFiles}`)
  console.log(`📦 Total Size: ${(inventory.totalSize / 1024).toFixed(2)} KB\n`)

  console.log('📑 Files by Category:')
  for (const [category, count] of report.summary.byCategory) {
    const percentage = ((count / report.summary.totalFiles) * 100).toFixed(1)
    console.log(`  - ${category.padEnd(15)}: ${count.toString().padStart(3)} (${percentage}%)`)
  }

  console.log(`\n🔄 Duplicate Sets: ${report.summary.duplicates}`)
  console.log(`❌ Documentation Gaps: ${report.summary.gaps}`)
  console.log(`⚠️  Gap Priority: ${report.details.gaps.priority.toUpperCase()}\n`)

  // Display gap details
  if (report.summary.gaps > 0) {
    console.log('Missing Documentation:')
    if (report.details.gaps.missingTutorials.length > 0) {
      console.log(`  📚 Tutorials: ${report.details.gaps.missingTutorials.join(', ')}`)
    }
    if (report.details.gaps.missingHowTos.length > 0) {
      console.log(`  🔧 How-Tos: ${report.details.gaps.missingHowTos.join(', ')}`)
    }
    if (report.details.gaps.missingReference.length > 0) {
      console.log(`  📖 Reference: ${report.details.gaps.missingReference.join(', ')}`)
    }
    if (report.details.gaps.missingExplanations.length > 0) {
      console.log(`  💡 Explanations: ${report.details.gaps.missingExplanations.join(', ')}`)
    }
    console.log()
  }

  // Display duplicate details
  if (report.summary.duplicates > 0) {
    console.log('Duplicate Content Sets:')
    let i = 0
    for (const set of report.details.duplicates.duplicateSets) {
      i++
      console.log(`  ${i}. Similarity: ${(set.similarity * 100).toFixed(1)}%`)
      for (const file of set.files) {
        console.log(`     - ${path.relative(process.cwd(), file.path)}`)
      }
      console.log(`     💡 ${set.recommendation}`)
    }
    console.log()
  }

  // Display recommendations
  if (report.recommendations.length > 0) {
    console.log('💡 Recommendations:')
    for (const rec of report.recommendations) {
      console.log(`  - ${rec}`)
    }
    console.log()
  }

  // Generate migration mapping
  console.log('🗺️  Generating migration mapping...')
  const migrationMap = auditor.createMigrationMapping(inventory)
  console.log(`✅ Created ${migrationMap.mappings.length} migration mappings\n`)

  // Display top priority migrations
  console.log('🔝 Top 10 Priority Migrations:')
  const topMigrations = migrationMap.mappings.slice(0, 10)
  for (const mapping of topMigrations) {
    const oldRelative = path.relative(process.cwd(), mapping.oldPath)
    const newRelative = mapping.newPath
    console.log(`  ${mapping.priority}/10 [${mapping.estimatedEffort}] ${oldRelative}`)
    console.log(`       → ${newRelative}`)
  }

  // Save detailed report to file
  const reportPath = path.join(process.cwd(), 'scripts/documentation/audit-report.json')
  await fs.writeFile(
    reportPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        summary: {
          totalFiles: report.summary.totalFiles,
          totalSize: inventory.totalSize,
          byCategory: Object.fromEntries(report.summary.byCategory),
          duplicates: report.summary.duplicates,
          gaps: report.summary.gaps,
        },
        gaps: report.details.gaps,
        duplicates: report.details.duplicates.duplicateSets.map(set => ({
          similarity: set.similarity,
          files: set.files.map(f => path.relative(process.cwd(), f.path)),
          recommendation: set.recommendation,
        })),
        recommendations: report.recommendations,
        migrationMap: migrationMap.mappings.map(m => ({
          oldPath: path.relative(process.cwd(), m.oldPath),
          newPath: m.newPath,
          category: m.category,
          priority: m.priority,
          estimatedEffort: m.estimatedEffort,
        })),
      },
      null,
      2,
    ),
  )

  console.log(`\n💾 Detailed report saved to: ${path.relative(process.cwd(), reportPath)}`)
  console.log('\n' + '='.repeat(80))
  console.log('✅ Audit complete!')
  console.log('='.repeat(80) + '\n')
}

main().catch(error => {
  console.error('❌ Error running audit:', error)
  process.exit(1)
})
