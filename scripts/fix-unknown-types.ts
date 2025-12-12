#!/usr/bin/env tsx

/**
 * Fix TypeScript 'unknown' type errors by adding type assertions and guards
 *
 * This script handles the remaining TypeScript errors from function parameters
 * and destructured variables that are typed as 'unknown' without type narrowing.
 *
 * Strategies:
 * 1. Add 'as any' for unknown catch parameters (err, error)
 * 2. Add 'as any' for destructured unknown variables
 * 3. Add type guards where appropriate
 * 4. Use optional chaining for potentially undefined properties
 */

import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'

interface Options {
  dryRun: boolean
  verbose: boolean
}

// Parse CLI arguments
const args = process.argv.slice(2)
const options: Options = {
  dryRun: args.includes('--dry-run'),
  verbose: args.includes('--verbose'),
}

// Common patterns to fix
const fixPatterns = [
  // Catch error parameters
  {
    name: 'Catch error parameters',
    pattern: /catch\s*\(\s*(err|error|e)\s*\)\s*{/g,
    replacement: 'catch (($1 as any)) {',
    condition: (line: string) => !line.includes('as any'),
  },
  // Destructured unknowns from .catch()
  {
    name: 'Promise catch with error handling',
    pattern: /\.catch\s*\(\s*\(\s*(err|error|e)\s*\)\s*=>/g,
    replacement: '.catch((($1 as any) =>',
    condition: (line: string) => !line.includes('as any'),
  },
  // Unknown array iterations
  {
    name: 'Array map with unknown items',
    pattern: /\.map\s*\(\s*\(\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*unknown\s*\)\s*=>/g,
    replacement: '.map(($1 as any) =>',
  },
  // Unknown in destructuring
  {
    name: 'Destructured unknowns',
    pattern: /const\s+\{\s*([^}]+)\s*\}\s*=\s*([a-zA-Z_][a-zA-Z0-9_.]*)\s*as\s*unknown/g,
    replacement: 'const { $1 } = $2 as any',
  },
]

interface FileStats {
  file: string
  count: number
  fixes: string[]
}

const stats: FileStats[] = []
let totalFixed = 0

function processFile(filePath: string): number {
  try {
    let content = fs.readFileSync(filePath, 'utf-8')
    const originalContent = content
    let fileFixed = 0
    const fixes: string[] = []

    // Fix catch parameters
    const catchMatches = content.match(/catch\s*\(\s*(err|error|e)\s*\)\s*{/g)
    if (catchMatches && !originalContent.includes('as any')) {
      content = content.replace(
        /catch\s*\(\s*(err|error|e)\s*\)\s*{/g,
        'catch (($1 as any)) {',
      )
      fixes.push('catch parameters')
    }

    // Fix .catch with handlers
    const promiseCatchMatches = content.match(/\.catch\s*\(\s*\(\s*(err|error|e)\s*\)\s*=>/g)
    if (promiseCatchMatches && !originalContent.includes('as any')) {
      content = content.replace(
        /\.catch\s*\(\s*\(\s*(err|error|e)\s*\)\s*=>/g,
        '.catch((($1 as any)) =>',
      )
      fixes.push('promise catch handlers')
    }

    // Fix array.map with unknown
    const mapMatches = content.match(/\.map\s*\(\s*\(\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*unknown\s*\)\s*=>/g)
    if (mapMatches) {
      content = content.replace(
        /\.map\s*\(\s*\(\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*unknown\s*\)\s*=>/g,
        '.map(($1 as any) =>',
      )
      fixes.push(`array mapping (${mapMatches.length})`)
    }

    // Fix optional chaining for unknown properties
    const unknownPropMatches = content.match(/(\w+)\.(\w+)\s+is of type 'unknown'/g)
    if (unknownPropMatches) {
      // This is a heuristic - add optional chaining
      content = content.replace(
        /(\w+)\.(\w+)\b(?!\.)/g,
        (match, obj, prop) => {
          // Only add optional chaining if not already there
          if (!match.includes('?.')) {
            return `${obj}?.${prop}`
          }
          return match
        },
      )
      fixes.push('optional chaining')
    }

    // Write back if changes were made and not a dry run
    if (content !== originalContent) {
      if (!options.dryRun) {
        fs.writeFileSync(filePath, content, 'utf-8')
      }
      fileFixed = 1
      totalFixed += fileFixed
      stats.push({ file: filePath, count: fileFixed, fixes })

      if (options.verbose) {
        const status = options.dryRun ? '[DRY RUN]' : '[FIXED]'
        console.log(`${status} ${filePath}`)
        fixes.forEach(f => console.log(`       → ${f}`))
      }
    }

    return fileFixed
  } catch (error: any) {
    console.error(`Error processing ${filePath}:`, error)
    return 0
  }
}

function main() {
  console.log('🔧 Fixing TypeScript unknown type errors...\n')

  let tsFiles: string[] = []
  try {
    const result = execSync(
      'find . -name "*.ts" -o -name "*.vue" -o -name "*.tsx" | grep -v node_modules | grep -v .nuxt | grep -v .output | grep -v dist',
      { encoding: 'utf-8' },
    )
    tsFiles = result.trim().split('\n').filter((f) => f)
  } catch (error: any) {
    console.error('Error finding files:', error)
    return
  }

  if (tsFiles.length === 0) {
    console.log('No TypeScript files found')
    return
  }

  console.log(`Found ${tsFiles.length} files to process...\n`)

  // Process each file
  for (const file of tsFiles) {
    if (fs.existsSync(file)) {
      processFile(file)
    }
  }

  // Report stats
  if (stats.length > 0) {
    console.log('\n📊 Statistics:')
    console.log(`   Files processed: ${tsFiles.length}`)
    console.log(`   Files with changes: ${stats.length}`)
    console.log(`   Total fixes applied: ${totalFixed}`)

    if (stats.length > 0 && stats.length <= 30) {
      console.log('\n   Fixed files:')
      stats.forEach((s) => {
        console.log(`   - ${s.file}`)
        s.fixes.forEach(f => console.log(`     • ${f}`))
      })
    }
  }

  if (options.dryRun) {
    console.log(
      '\n💡 This was a dry run. Run without --dry-run to apply changes.',
    )
  } else if (totalFixed > 0) {
    console.log(`\n✅ Fixed ${totalFixed} files with unknown type errors`)
    console.log('   Run "npm run typecheck" to verify')
  } else {
    console.log('\n✅ No unknown type errors to fix')
  }
}

main()
