#!/usr/bin/env tsx
/**
 * Fix shadcn-vue UI Component Violations
 *
 * Automatically replaces raw HTML elements (<button>, <input>, <select>, <textarea>, <label>)
 * with their shadcn-vue equivalents (UiButton, UiInput, UiSelect, UiTextarea, UiLabel).
 *
 * Usage:
 *   pnpm tsx scripts/fix-shadcn-violations.ts            # Apply fixes
 *   pnpm tsx scripts/fix-shadcn-violations.ts --dry-run  # Preview changes
 *   pnpm tsx scripts/fix-shadcn-violations.ts <path>     # Specific file/dir
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join, relative, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT_DIR = join(__dirname, '..')

// CLI args
const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const TARGET_PATH = args.find(arg => !arg.startsWith('--')) || 'components'

type Replacement = {
  name: string
  pattern: RegExp
  replace: (match: string, ...groups: string[]) => string
  skipIfContains?: string[]
}

/**
 * Strip class attributes but preserve :class bindings
 */
function cleanAttrs(attrs: string, stripClass: boolean = true): string {
  let cleaned = attrs

  // Remove static class attributes (but keep :class bindings)
  if (stripClass) {
    cleaned = cleaned.replace(/\s+class="[^"]*"/g, '')
    cleaned = cleaned.replace(/\s+class='[^']*'/g, '')
  }

  // Clean up extra whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim()

  return cleaned
}

/**
 * Check if a select has v-for (skip these, handle manually)
 */
function hasVForInSelect(selectContent: string): boolean {
  return selectContent.includes('v-for')
}

/**
 * Replacements definition
 */
const REPLACEMENTS: Replacement[] = [
  // 1. <label> → <UiLabel>
  {
    name: 'label',
    pattern: /<label([^>]*)>([\s\S]*?)<\/label>/g,
    replace: (match, attrs, content) => {
      const cleanedAttrs = cleanAttrs(attrs)
      const trimmedContent = content.trim()
      return `<UiLabel${cleanedAttrs ? ' ' + cleanedAttrs : ''}>${trimmedContent}</UiLabel>`
    },
  },

  // 2. <input> → <UiInput>
  {
    name: 'input',
    pattern: /<input([^>]*?)>/g,
    replace: (match, attrs) => {
      const cleanedAttrs = cleanAttrs(attrs)
      return `<UiInput${cleanedAttrs ? ' ' + cleanedAttrs : ''} />`
    },
  },

  // 3. <button> → <UiButton>
  {
    name: 'button',
    pattern: /<button([^>]*)>([\s\S]*?)<\/button>/g,
    replace: (match, attrs, content) => {
      const cleanedAttrs = cleanAttrs(attrs)
      const trimmedContent = content.trim()
      return `<UiButton${cleanedAttrs ? ' ' + cleanedAttrs : ''}>${trimmedContent}</UiButton>`
    },
  },

  // 4. <textarea> → <UiTextarea>
  {
    name: 'textarea',
    pattern: /<textarea([^>]*)>([\s\S]*?)<\/textarea>/g,
    replace: (match, attrs, content) => {
      const cleanedAttrs = cleanAttrs(attrs)
      const trimmedContent = content.trim()
      return `<UiTextarea${cleanedAttrs ? ' ' + cleanedAttrs : ''}>${trimmedContent}</UiTextarea>`
    },
  },
]

/**
 * Process a single file
 */
function processFile(filePath: string): { changes: number, details: string[] } {
  const content = readFileSync(filePath, 'utf-8')
  let newContent = content
  const details: string[] = []
  let totalChanges = 0

  for (const { name, pattern, replace, skipIfContains } of REPLACEMENTS) {
    const matches = [...content.matchAll(pattern)]
    if (matches.length === 0) continue

    // For selects, check if they have v-for
    if (name === 'select' && skipIfContains) {
      const skipMatches = matches.filter(m => skipIfContains.some(s => m[0].includes(s)))
      if (skipMatches.length === matches.length) {
        details.push(`  ⏭️  Skipped ${matches.length} <${name}> elements with v-for (handle manually)`)
        continue
      }
    }

    // Apply replacement
    const before = newContent
    newContent = newContent.replace(pattern, replace)
    const changeCount = (before.match(pattern) || []).length
    totalChanges += changeCount

    details.push(`  ✓ Replaced ${changeCount} <${name}> → Ui${name.charAt(0).toUpperCase() + name.slice(1)}`)
  }

  // Handle <select> elements (single-option only, skip v-for)
  const selectPattern = /<select([^>]*)>\s*<option[^>]*value="([^"]*)"[^>]*>(.*?)<\/option>\s*(?:<option[^>]*>\s*<\/option>)?\s*<\/select>/gs
  const selectMatches = [...content.matchAll(selectPattern)]

  for (const match of selectMatches) {
    const [fullMatch, selectAttrs, value, text] = match

    // Skip if has v-for
    if (hasVForInSelect(fullMatch)) {
      details.push(`  ⏭️  Skipped <select> with v-for loop (handle manually)`)
      continue
    }

    const selectAttrsClean = cleanAttrs(selectAttrs ?? '')
      .replace(/@change/g, '@update:model-value')

    const replacement = `<UiSelect${selectAttrsClean ? ' ' + selectAttrsClean : ''}>
      <UiSelectTrigger>
        <UiSelectValue />
      </UiSelectTrigger>
      <UiSelectContent>
        <UiSelectItem value="${value}">${text}</UiSelectItem>
      </UiSelectContent>
    </UiSelect>`

    newContent = newContent.replace(fullMatch, replacement)
    totalChanges++
    details.push(`  ✓ Replaced 1 <select> → UiSelect`)
  }

  // Write file if not dry run
  if (!DRY_RUN && newContent !== content) {
    writeFileSync(filePath, newContent, 'utf-8')
  }

  return { changes: totalChanges, details }
}

/**
 * Recursively get all Vue files in a directory
 */
function getVueFiles(dir: string): string[] {
  const files: string[] = []
  const items = readdirSync(dir)

  for (const item of items) {
    const fullPath = join(dir, item)
    const stat = statSync(fullPath)

    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      files.push(...getVueFiles(fullPath))
    } else if (item.endsWith('.vue')) {
      files.push(fullPath)
    }
  }

  return files
}

/**
 * Main function
 */
function main() {
  console.log(`\n🔧 shadcn-vue UI Component Enforcement${DRY_RUN ? ' (DRY RUN)' : ''}\n`)

  const targetPath = join(ROOT_DIR, TARGET_PATH)
  const files = getVueFiles(targetPath)

  console.log(`📁 Scanning: ${relative(ROOT_DIR, targetPath)}`)
  console.log(`📄 Found ${files.length} Vue files\n`)

  let totalChanges = 0
  const filesWithChanges: string[] = []

  for (const file of files) {
    const { changes, details } = processFile(file)

    if (changes > 0) {
      totalChanges += changes
      filesWithChanges.push(relative(ROOT_DIR, file))
      console.log(`📝 ${relative(ROOT_DIR, file)}`)
      details.forEach(d => console.log(d))
      console.log()
    }
  }

  // Summary
  console.log('─'.repeat(50))
  if (totalChanges > 0) {
    console.log(`✨ Total replacements: ${totalChanges}`)
    console.log(`📦 Files modified: ${filesWithChanges.length}`)
    console.log()

    if (DRY_RUN) {
      console.log('⚠️  DRY RUN MODE - No files were modified')
      console.log('    Run without --dry-run to apply changes')
    } else {
      console.log('✅ Files updated successfully!')
      console.log()
      console.log('Next steps:')
      console.log('  1. Review changes: git diff')
      console.log("  2. Run tests: pnpm test")
      console.log('  3. Run ESLint: pnpm eslint components/')
      console.log('  4. Fix any remaining v-for selects manually')
    }
  } else {
    console.log('✅ No violations found! All files already use shadcn-vue components.')
  }
  console.log()

  // Exit with error code if violations found in dry-run (for CI)
  if (DRY_RUN && totalChanges > 0) {
    process.exit(1)
  }
}

main()
