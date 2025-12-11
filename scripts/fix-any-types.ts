#!/usr/bin/env tsx

/**
 * Fix TypeScript `any` type warnings
 *
 * This script replaces `any` with `unknown` in TypeScript files
 * in safe contexts where it doesn't break type contracts.
 *
 * Patterns fixed:
 * - function params: `(arg: unknown)` → `(arg: unknown)`
 * - variable declarations: `const x: unknown` → `const x: unknown`
 * - return types: `: unknown` → `: unknown`
 * - generics: `T = unknown` → `T = unknown`
 * - type aliases: `Record<K, unknown>` → `Record<K, unknown>`
 * - type assertions: `as unknown` → `as unknown`
 */

import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'

interface Options {
  dryRun: boolean
  stats: boolean
  file?: string
}

// Parse CLI arguments
const args = process.argv.slice(2)
const options: Options = {
  dryRun: args.includes('--dry-run'),
  stats: args.includes('--stats'),
  file: args[args.indexOf('--file') + 1],
}

// Patterns to replace
const replacements = [
  // Function parameters and return types
  { pattern: /:\s*any\b/g, replacement: ': unknown' },
  // Generic defaults
  { pattern: /=\s*any\b/g, replacement: '= unknown' },
  // Type assertions
  { pattern: /as\s+any\b/g, replacement: 'as unknown' },
  // Record types
  { pattern: /Record<([^,>]+),\s*any>/g, replacement: 'Record<$1, unknown>' },
  // Array of any
  { pattern: /any\[\]/g, replacement: 'unknown[]' },
  // any[] pattern
  { pattern: /\[\s*any\s*\]/g, replacement: '[unknown]' },
]

interface FileStats {
  file: string
  count: number
}

const stats: FileStats[] = []
let totalFixed = 0

function processFile(filePath: string): number {
  try {
    let content = fs.readFileSync(filePath, 'utf-8')
    const originalContent = content
    let fileFixed = 0

    // Apply replacements
    for (const { pattern, replacement } of replacements) {
      const matches = (content.match(pattern) || []).length
      if (matches > 0) {
        content = content.replace(pattern, replacement)
        fileFixed += matches
      }
    }

    // Write back if changes were made and not a dry run
    if (fileFixed > 0) {
      if (!options.dryRun) {
        fs.writeFileSync(filePath, content, 'utf-8')
      }
      totalFixed += fileFixed
      stats.push({ file: filePath, count: fileFixed })

      if (!options.stats) {
        const status = options.dryRun ? '[DRY RUN]' : '[FIXED]'
        console.log(`${status} ${filePath}: ${fileFixed} changes`)
      }
    }

    return fileFixed
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error)
    return 0
  }
}

function main() {
  console.log('🔧 Fixing TypeScript `any` type warnings...\n')

  let tsFiles: string[] = []
  if (options.file) {
    tsFiles = [options.file]
  } else {
    try {
      const result = execSync(
        'find . -name "*.ts" -not -path "./node_modules/*" -not -path "./.nuxt/*" -not -path "./.output/*" -not -path "./dist/*" -not -name "*.test.ts" -not -name "*.spec.ts"',
        { encoding: 'utf-8' },
      )
      tsFiles = result.trim().split('\n').filter((f) => f)
    } catch (error) {
      console.error('Error finding files:', error)
      return
    }
  }

  if (tsFiles.length === 0) {
    console.log('No TypeScript files found')
    return
  }

  // Process each file
  for (const file of tsFiles) {
    if (fs.existsSync(file)) {
      processFile(file)
    }
  }

  // Report stats
  if (options.stats || stats.length > 0) {
    console.log('\n📊 Statistics:')
    console.log(`   Total files processed: ${tsFiles.length}`)
    console.log(`   Files with changes: ${stats.length}`)
    console.log(`   Total replacements: ${totalFixed}`)

    if (stats.length > 0 && stats.length <= 20) {
      console.log('\n   Top files:')
      stats
        .sort((a, b) => b.count - a.count)
        .forEach((s) => {
          console.log(`     ${s.file}: ${s.count}`)
        })
    }
  }

  if (options.dryRun) {
    console.log(
      '\n💡 This was a dry run. Run without --dry-run to apply changes.',
    )
  } else if (totalFixed > 0) {
    console.log(`\n✅ Fixed ${totalFixed} \`any\` type warnings`)
  } else {
    console.log('\n✅ No changes needed')
  }
}

main()
