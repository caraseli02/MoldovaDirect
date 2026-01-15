/**
 * Add Deprecation Notices
 * Adds deprecation notices to old documentation locations
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'

interface DeprecationNotice {
  oldPath: string
  newPath: string
}

/**
 * Add deprecation notice to a file
 */
async function addDeprecationNotice(
  filePath: string,
  newPath: string
): Promise<void> {
  try {
    // Check if file exists
    await fs.access(filePath)
    
    // Read current content
    const content = await fs.readFile(filePath, 'utf-8')
    
    // Check if deprecation notice already exists
    if (content.includes('⚠️ **DEPRECATED**')) {
      console.log(`[SKIP] Deprecation notice already exists: ${filePath}`)
      return
    }
    
    // Create deprecation notice
    const notice = `> ⚠️ **DEPRECATED**: This documentation has been moved to a new location.
> 
> **New location:** [${newPath}](${newPath})
> 
> This file will be removed in a future update. Please update your bookmarks.

---

`
    
    // Prepend notice to content
    const newContent = notice + content
    
    // Write back to file
    await fs.writeFile(filePath, newContent, 'utf-8')
    
    console.log(`[✓] Added deprecation notice: ${filePath} -> ${newPath}`)
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      console.log(`[SKIP] File no longer exists: ${filePath}`)
    } else {
      console.error(`[ERROR] Failed to add deprecation notice to ${filePath}:`, error.message)
    }
  }
}

/**
 * Generate redirects configuration
 */
function generateRedirectsConfig(mappings: DeprecationNotice[]): string {
  const redirects = mappings.map(m => ({
    source: `/${m.oldPath}`,
    destination: `/${m.newPath}`,
    permanent: false
  }))
  
  return JSON.stringify({ redirects }, null, 2)
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  console.log('Adding deprecation notices to old documentation locations...\n')
  
  // Read migration report to get mappings
  const reportPath = path.join(process.cwd(), 'scripts/documentation/migration-report.json')
  
  try {
    const reportContent = await fs.readFile(reportPath, 'utf-8')
    JSON.parse(reportContent)
    
    // For now, we'll add notices to the old directory structure
    // In a real implementation, we would use the migration mappings
    const oldDirs = [
      'docs/analysis',
      'docs/api',
      'docs/architecture',
      'docs/automation',
      'docs/design-inspiration',
      'docs/development',
      'docs/features',
      'docs/getting-started',
      'docs/guides',
      'docs/issues',
      'docs/lessons',
      'docs/manuals',
      'docs/meta',
      'docs/notebooklm',
      'docs/optimization',
      'docs/patches',
      'docs/research',
      'docs/reviews',
      'docs/security',
      'docs/specs',
      'docs/status',
      'docs/testing',
      'docs/visual-regression'
    ]
    
    console.log('Adding README.md deprecation notices to old directories...\n')
    
    for (const dir of oldDirs) {
      const readmePath = path.join(process.cwd(), dir, 'README.md')
      
      try {
        await fs.access(readmePath)
        
        // Determine new location based on directory name
        let newLocation = 'docs/README.md'
        if (dir.includes('getting-started')) {
          newLocation = 'docs/tutorials/README.md'
        } else if (dir.includes('guides') || dir.includes('how-to')) {
          newLocation = 'docs/how-to/README.md'
        } else if (dir.includes('api') || dir.includes('reference')) {
          newLocation = 'docs/reference/README.md'
        } else if (dir.includes('architecture') || dir.includes('explanation')) {
          newLocation = 'docs/explanation/README.md'
        }
        
        await addDeprecationNotice(readmePath, newLocation)
      } catch (error: any) {
        if (error.code !== 'ENOENT') {
          console.error(`Error processing ${readmePath}:`, error.message)
        }
      }
    }
    
    // Generate redirects configuration
    console.log('\nGenerating redirects configuration...')
    const redirectsConfig = generateRedirectsConfig([
      { oldPath: 'docs/getting-started', newPath: 'docs/tutorials' },
      { oldPath: 'docs/guides', newPath: 'docs/how-to' },
      { oldPath: 'docs/api', newPath: 'docs/reference/api' },
      { oldPath: 'docs/architecture', newPath: 'docs/explanation/architecture' }
    ])
    
    const redirectsPath = path.join(process.cwd(), 'docs/redirects.json')
    await fs.writeFile(redirectsPath, redirectsConfig, 'utf-8')
    console.log(`[✓] Redirects configuration saved to: ${redirectsPath}`)
    
    console.log('\n✅ Deprecation notices and redirects completed!')
  } catch (error: any) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
