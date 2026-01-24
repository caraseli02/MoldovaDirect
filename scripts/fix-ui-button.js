#!/usr/bin/env node

/**
 * Fix malformed UiButton syntax in Vue files
 *
 * Fixes patterns like:
 *   <UiButton>
 *     :disabled="loading"
 *     variant="outline"
 *     >
 *     children
 *   </UiButton>
 *
 * To:
 *   <UiButton
 *     :disabled="loading"
 *     variant="outline"
 *   >
 *     children
 *   </UiButton>
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, '..')

const COMPONENTS = ['UiButton', 'UiInput', 'UiSelect', 'UiTextarea', 'UiLabel', 'UiCheckbox', 'UiSwitch']

/**
 * Fix malformed component syntax in content
 *
 * Uses a simple line-by-line approach to avoid catastrophic backtracking
 */
function fixMalformedSyntax(content) {
  const lines = content.split('\n')
  const result = []
  let fixCount = 0
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    let matched = false

    for (const component of COMPONENTS) {
      const openTag = `<${component}>`
      const openTagWs = `<${component} >`

      // Check if this line is the opening tag
      if (line.trim() === openTag || line.trim() === openTagWs) {
        // Look ahead to see if this is the malformed pattern
        // Malformed pattern has attributes on following lines, then a standalone '>'
        let j = i + 1
        const attributes = []
        const children = []
        let indent = '  '
        let foundStandaloneClose = false
        let inAttrs = true

        // Get the indent from the opening tag line
        const openIndent = line.match(/^(\s*)/)?.[1] || ''

        while (j < lines.length) {
          const currLine = lines[j]
          const trimmed = currLine.trim()

          // Check for standalone '>'
          if (trimmed === '>') {
            if (attributes.length > 0 && inAttrs) {
              foundStandaloneClose = true
              // Skip the standalone '>' line
              j++
            }
            break
          }

          // Check for closing tag
          if (trimmed === `</${component}>`) {
            break
          }

          // Check if line looks like an attribute
          const isAttr =
            trimmed.startsWith(':') ||
            trimmed.startsWith('@') ||
            trimmed.startsWith('v-') ||
            /^[a-z][a-z0-9-]*=/i.test(trimmed) ||
            /^[a-z][a-z0-9-]*$/i.test(trimmed)

          if (inAttrs && isAttr) {
            // Get indent from first attribute
            if (attributes.length === 0) {
              indent = currLine.match(/^(\s*)/)?.[1] || (openIndent + '  ')
            }
            attributes.push(trimmed)
          } else {
            inAttrs = false
            children.push(currLine)
          }

          j++
        }

        // If we found the malformed pattern, fix it
        if (foundStandaloneClose && attributes.length > 0) {
          // Build the fixed opening tag
          // Preserve the original line's indent for the opening tag
          const originalIndent = line.match(/^(\s*)/)?.[1] || ''
          result.push(originalIndent + `<${component}`)
          for (const attr of attributes) {
            result.push(indent + attr)
          }
          result.push(indent + '>')

          // Add children (first line might have content after the standalone >)
          if (children.length > 0) {
            // Check if the first child line starts with content that should be on a new line
            // This happens when the original had "> <child>" on the same line
            const firstChild = children[0]
            if (firstChild.trim().startsWith('<')) {
              // It's a tag - add as-is
              for (const child of children) {
                result.push(child)
              }
            } else {
              // Mixed content - preserve but ensure proper newline
              for (const child of children) {
                result.push(child)
              }
            }
          }

          i = j
          fixCount++
          matched = true
          break
        }
      }
    }

    if (!matched) {
      result.push(line)
      i++
    }
  }

  return { content: result.join('\n'), fixCount }
}

/**
 * Find all Vue files recursively
 */
function findVueFiles(dir, files = []) {
  const entries = readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      // Skip node_modules, .nuxt, .output, dist
      if (
        !entry.name.startsWith('.') &&
        entry.name !== 'node_modules' &&
        entry.name !== 'dist'
      ) {
        findVueFiles(fullPath, files)
      }
    } else if (entry.name.endsWith('.vue')) {
      files.push(fullPath)
    }
  }

  return files
}

/**
 * Main execution
 */
function main() {
  console.log('🔧 Fixing malformed UiButton syntax...\n')

  const vueFiles = findVueFiles(rootDir)
  console.log(`Scanning ${vueFiles.length} Vue files...\n`)

  const results = []
  let totalFixes = 0

  for (const file of vueFiles) {
    try {
      const content = readFileSync(file, 'utf-8')
      const { content: fixed, fixCount } = fixMalformedSyntax(content)

      if (fixCount > 0) {
        writeFileSync(file, fixed, 'utf-8')
        results.push({ file: file.replace(rootDir + '/', ''), fixes: fixCount })
        totalFixes += fixCount
      }
    } catch (error) {
      console.error(`Error processing ${file}:`, error.message)
    }
  }

  if (results.length === 0) {
    console.log('✅ No malformed syntax found!')
  } else {
    console.log(`✅ Fixed ${totalFixes} instances in ${results.length} files:\n`)
    for (const result of results) {
      console.log(`  - ${result.file} (${result.fixes} fixes)`)
    }
  }
}

main()
