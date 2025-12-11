#!/usr/bin/env tsx

/**
 * Fix Vue component `any` type warnings
 *
 * This script replaces `any` with `unknown` in Vue (.vue) files
 * in safe contexts where it doesn't break component contracts.
 *
 * Patterns fixed:
 * - script type annotations: `type SomeType<T = unknown>` → `type SomeType<T = unknown>`
 * - function parameters: `function foo(arg: unknown)` → `function foo(arg: unknown)`
 * - reactive declarations: `reactive<any>()` → `reactive<unknown>()`
 * - computed types: `computed<any>()`
 * - ref types: `ref<any>()`
 * - PropType: `PropType<unknown>` → `PropType<unknown>`
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

// Patterns to replace in Vue files
const vueReplacements = [
  // Function parameters and type annotations
  { pattern: /:\s*any\b/g, replacement: ': unknown' },
  // Generic defaults
  { pattern: /=\s*any\b/g, replacement: '= unknown' },
  // Type assertions
  { pattern: /as\s+any\b/g, replacement: 'as unknown' },
  // PropType<unknown>
  { pattern: /PropType<unknown>/g, replacement: 'PropType<unknown>' },
  // Ref<unknown>
  { pattern: /Ref<unknown>/g, replacement: 'Ref<unknown>' },
  // Computed<any>
  { pattern: /Computed<any>/g, replacement: 'Computed<unknown>' },
  // Record types
  { pattern: /Record<([^,>]+),\s*any>/g, replacement: 'Record<$1, unknown>' },
  // Array of any
  { pattern: /any\[\]/g, replacement: 'unknown[]' },
]

interface FileStats {
  file: string
  count: number
}

const stats: FileStats[] = []
let totalFixed = 0

function processVueFile(filePath: string): number {
  try {
    let content = fs.readFileSync(filePath, 'utf-8')
    const originalContent = content
    let fileFixed = 0

    // Extract script section
    const scriptMatch = content.match(/<script[^>]*>[\s\S]*?<\/script>/g)
    if (!scriptMatch) {
      return 0
    }

    let scriptContent = content
    for (const script of scriptMatch) {
      let modifiedScript = script
      let scriptFixed = 0

      // Apply replacements to script section only
      for (const { pattern, replacement } of vueReplacements) {
        const matches = (modifiedScript.match(pattern) || []).length
        if (matches > 0) {
          modifiedScript = modifiedScript.replace(pattern, replacement)
          scriptFixed += matches
        }
      }

      if (scriptFixed > 0) {
        scriptContent = scriptContent.replace(script, modifiedScript)
        fileFixed += scriptFixed
      }
    }

    // Write back if changes were made and not a dry run
    if (fileFixed > 0) {
      if (!options.dryRun) {
        fs.writeFileSync(filePath, scriptContent, 'utf-8')
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
  console.log('🎨 Fixing Vue component `any` type warnings...\n')

  let vueFiles: string[] = []
  if (options.file) {
    vueFiles = [options.file]
  } else {
    try {
      const result = execSync(
        'find . -name "*.vue" -not -path "./node_modules/*" -not -path "./.nuxt/*" -not -path "./.output/*" -not -path "./dist/*"',
        { encoding: 'utf-8' },
      )
      vueFiles = result.trim().split('\n').filter((f) => f)
    } catch (error) {
      console.error('Error finding files:', error)
      return
    }
  }

  if (vueFiles.length === 0) {
    console.log('No Vue files found')
    return
  }

  // Process each file
  for (const file of vueFiles) {
    if (fs.existsSync(file)) {
      processVueFile(file)
    }
  }

  // Report stats
  if (options.stats || stats.length > 0) {
    console.log('\n📊 Statistics:')
    console.log(`   Total files processed: ${vueFiles.length}`)
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
    console.log(`\n✅ Fixed ${totalFixed} Vue \`any\` type warnings`)
  } else {
    console.log('\n✅ No changes needed')
  }
}

main()
