/**
 * Navigation Generator
 * Creates navigation and index pages for documentation
 */

import type { DiátaxisCategory, FileInfo } from './types'

export interface DocumentationStructure {
  tutorials: FileInfo[]
  howTo: Map<string, FileInfo[]> // feature -> files
  reference: Map<string, FileInfo[]> // domain -> files
  explanation: Map<string, FileInfo[]> // category -> files
  project: FileInfo[]
}

export interface QuickRefItem {
  title: string
  description: string
  code?: string
  link?: string
}

export class NavigationGenerator {
  /**
   * Generate root README.md with navigation by user need
   * @param structure - Documentation structure
   * @returns README content
   */
  generateRootReadme(structure: DocumentationStructure): string {
    const sections: string[] = []

    // Header
    sections.push('# 📚 Documentation')
    sections.push('')
    sections.push('Welcome to the Moldova Direct documentation! Find what you need based on your goal:')
    sections.push('')

    // Quick Start Section
    sections.push('## 🚀 Quick Start')
    sections.push('')
    sections.push('New to the project? Start here:')
    sections.push('')

    const gettingStarted = structure.tutorials.find(f =>
      f.name.toLowerCase().includes('getting-started') ||
      f.name.toLowerCase().includes('01-')
    )

    if (gettingStarted) {
      const relativePath = this.getRelativePath(gettingStarted.path)
      sections.push(`- [Getting Started](${relativePath}) - Set up your development environment and run your first build`)
    } else {
      sections.push('- [Getting Started](./tutorials/01-getting-started.md) - Set up your development environment and run your first build')
    }

    sections.push('- [Project Overview](./explanation/architecture/overview.md) - Understand the system architecture')
    sections.push('- [Common Tasks](#-common-tasks) - Jump to frequently needed tasks')
    sections.push('')

    // Navigation by User Need
    sections.push('## 🧭 Find What You Need')
    sections.push('')

    // Learning Section
    sections.push('### 📖 I want to learn')
    sections.push('')
    sections.push('**Tutorials** - Step-by-step lessons to build understanding')
    sections.push('')
    sections.push(`- [View all tutorials](./tutorials/) (${structure.tutorials.length} available)`)

    if (structure.tutorials.length > 0) {
      const topTutorials = structure.tutorials.slice(0, 3)
      for (const tutorial of topTutorials) {
        const relativePath = this.getRelativePath(tutorial.path)
        const title = this.extractTitle(tutorial.content) || tutorial.name.replace(/\.md$/, '')
        sections.push(`  - [${title}](${relativePath})`)
      }
    }
    sections.push('')

    // Problem-Solving Section
    sections.push('### 🔧 I want to solve a problem')
    sections.push('')
    sections.push('**How-To Guides** - Practical steps to accomplish specific tasks')
    sections.push('')

    const howToCategories = Array.from(structure.howTo.keys()).sort()
    for (const category of howToCategories) {
      const files = structure.howTo.get(category) || []
      const categoryTitle = this.formatCategoryTitle(category)
      sections.push(`- [${categoryTitle}](./how-to/${category}/) (${files.length} guides)`)
    }
    sections.push('')

    // Lookup Section
    sections.push('### 📋 I need to look something up')
    sections.push('')
    sections.push('**Reference** - Technical specifications and API documentation')
    sections.push('')

    const refCategories = Array.from(structure.reference.keys()).sort()
    for (const category of refCategories) {
      const files = structure.reference.get(category) || []
      const categoryTitle = this.formatCategoryTitle(category)
      sections.push(`- [${categoryTitle}](./reference/${category}/) (${files.length} docs)`)
    }
    sections.push('')

    // Understanding Section
    sections.push('### 💡 I want to understand')
    sections.push('')
    sections.push('**Explanation** - Concepts, architecture, and design decisions')
    sections.push('')

    const explCategories = Array.from(structure.explanation.keys()).sort()
    for (const category of explCategories) {
      const files = structure.explanation.get(category) || []
      const categoryTitle = this.formatCategoryTitle(category)
      sections.push(`- [${categoryTitle}](./explanation/${category}/) (${files.length} docs)`)
    }
    sections.push('')

    // Common Tasks Section
    sections.push('## ⚡ Common Tasks')
    sections.push('')
    sections.push('Quick links to frequently needed information:')
    sections.push('')
    sections.push('- **Authentication**: [Setup](./how-to/authentication/setup.md) | [Testing](./how-to/authentication/testing.md)')
    sections.push('- **Checkout**: [Configuration](./how-to/checkout/configuration.md) | [Payment Integration](./how-to/checkout/payment-integration.md)')
    sections.push('- **Deployment**: [Production](./how-to/deployment/production.md) | [Staging](./how-to/deployment/staging.md)')
    sections.push('- **Testing**: [Unit Tests](./how-to/testing/unit-tests.md) | [E2E Tests](./how-to/testing/e2e-tests.md)')
    sections.push('- **API Reference**: [Endpoints](./reference/api/endpoints.md) | [Authentication](./reference/api/authentication.md)')
    sections.push('')

    // Project Information
    sections.push('## 📊 Project Information')
    sections.push('')
    if (structure.project.length > 0) {
      for (const file of structure.project) {
        const relativePath = this.getRelativePath(file.path)
        const title = this.extractTitle(file.content) || file.name.replace(/\.md$/, '')
        sections.push(`- [${title}](${relativePath})`)
      }
    } else {
      sections.push('- [Status](./project/status.md) - Current project status')
      sections.push('- [Roadmap](./project/roadmap.md) - Future plans')
      sections.push('- [Changelog](./project/changelog.md) - Recent changes')
      sections.push('- [Contributing](./project/contributing.md) - How to contribute')
    }
    sections.push('')

    // Footer
    sections.push('---')
    sections.push('')
    sections.push('💡 **Tip**: Use your browser\'s search (Ctrl/Cmd + F) to find specific topics on this page.')
    sections.push('')
    sections.push('🤖 **For AI Assistants**: See [AGENTS.md](./ai-context/AGENTS.md) for project context and patterns.')
    sections.push('')

    return sections.join('\n')
  }

  /**
   * Generate category index page
   * @param category - Diátaxis category
   * @param files - Files in this category
   * @returns Index page content
   */
  generateCategoryIndex(category: DiátaxisCategory, files: FileInfo[]): string {
    const sections: string[] = []

    // Header with emoji
    const emoji = this.getCategoryEmoji(category)
    const title = this.formatCategoryTitle(category)
    sections.push(`# ${emoji} ${title}`)
    sections.push('')

    // Category description
    sections.push(this.getCategoryDescription(category))
    sections.push('')

    // File listing
    if (files.length === 0) {
      sections.push('*No documentation files in this category yet.*')
      sections.push('')
    } else {
      // Group files by subdirectory if applicable
      const filesBySubdir = this.groupFilesBySubdirectory(files)

      for (const [subdir, subdirFiles] of filesBySubdir) {
        if (subdir) {
          const subdirTitle = this.formatCategoryTitle(subdir)
          sections.push(`## ${subdirTitle}`)
          sections.push('')
        }

        for (const file of subdirFiles) {
          const title = this.extractTitle(file.content) || file.name.replace(/\.md$/, '')
          // Skip files with invalid titles (only whitespace/special chars)
          if (!title.trim() || !/[a-zA-Z0-9]/.test(title)) {
            continue
          }

          const description = this.extractDescription(file.content)
          const relativePath = this.getRelativePath(file.path)

          sections.push(`### [${title}](${relativePath})`)
          sections.push('')
          if (description) {
            sections.push(description)
            sections.push('')
          }
        }
      }
    }

    // Back to main navigation
    sections.push('---')
    sections.push('')
    sections.push('[← Back to Documentation Home](../README.md)')
    sections.push('')

    return sections.join('\n')
  }

  /**
   * Generate breadcrumb navigation for a file
   * @param filePath - Path to the file
   * @returns Breadcrumb navigation string
   */
  generateBreadcrumbs(filePath: string): string {
    const parts = filePath.split('/').filter(p => p && p !== '.')
    const breadcrumbs: string[] = []

    // Start with home
    breadcrumbs.push('[📚 Documentation](../README.md)')

    // Build path
    let currentPath = ''
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]
      if (!part) continue
      currentPath += (currentPath ? '/' : '') + part
      // Skip 'docs' if it's the first part
      if (i === 0 && part === 'docs') {
        continue
      }
      const title = this.formatCategoryTitle(part)
      const relativePath = this.calculateRelativePath(filePath, currentPath)
      breadcrumbs.push(`[${title}](${relativePath}/)`)
    }

    // Add current page (no link) - sanitize to avoid markdown conflicts
    const fileName = parts[parts.length - 1] || ''
    const pageTitle = fileName.replace(/\.md$/, '').replace(/-/g, ' ').trim()
    // Escape special markdown characters in the page title
    const sanitizedTitle = pageTitle.replace(/[[\]()]/g, '\\$&')
    breadcrumbs.push(sanitizedTitle)

    return breadcrumbs.join(' > ')
  }

  /**
   * Generate "See Also" section for related files
   * @param file - Current file
   * @param relatedFiles - Related files
   * @returns "See Also" section content
   */
  generateSeeAlso(file: FileInfo, relatedFiles: FileInfo[]): string {
    if (relatedFiles.length === 0) {
      return ''
    }

    const sections: string[] = []
    sections.push('## See Also')
    sections.push('')

    for (const related of relatedFiles) {
      const title = this.extractTitle(related.content) || related.name.replace(/\.md$/, '')
      const relativePath = this.calculateRelativePath(file.path, related.path)
      const description = this.extractDescription(related.content)

      sections.push(`- [${title}](${relativePath})${description ? ` - ${description}` : ''}`)
    }

    sections.push('')

    return sections.join('\n')
  }

  /**
   * Generate quick reference card
   * @param topic - Topic name
   * @param items - Quick reference items
   * @returns Quick reference card content
   */
  generateQuickReference(topic: string, items: QuickRefItem[]): string {
    const sections: string[] = []

    sections.push(`# ⚡ Quick Reference: ${topic}`)
    sections.push('')

    for (const item of items) {
      sections.push(`## ${item.title}`)
      sections.push('')
      sections.push(item.description)
      sections.push('')

      if (item.code) {
        sections.push('```')
        sections.push(item.code)
        sections.push('```')
        sections.push('')
      }

      if (item.link) {
        sections.push(`[Learn more](${item.link})`)
        sections.push('')
      }
    }

    return sections.join('\n')
  }

  /**
   * Add progressive disclosure structure to content
   * Ensures overview appears before detailed content with "Learn More" links
   * @param content - Original content
   * @param detailedSections - Map of section titles to their detailed content links
   * @returns Content with progressive disclosure structure
   */
  addProgressiveDisclosure(content: string, detailedSections: Map<string, string>): string {
    const lines = content.split('\n')
    const result: string[] = []
    let inDetailedSection = false

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (line === undefined) continue

      // Check if this is a heading that has detailed content
      if (line.startsWith('## ') || line.startsWith('### ')) {

        // Check if this section has detailed content
        if (detailedSections.has(heading)) {
          result.push(line)
          result.push('')

          // Look ahead to find the overview (first paragraph after heading)
          let overviewLines: string[] = []
          let j = i + 1

          // Skip empty lines
          while (j < lines.length && lines[j] !== undefined && !lines[j]!.trim()) {
            j++
          }

          // Collect overview paragraph (until next heading or empty line)
          while (j < lines.length && lines[j] !== undefined && lines[j]!.trim() && !lines[j]!.startsWith('#')) {
            overviewLines.push(lines[j]!)
            j++
          }

          // Add overview
          if (overviewLines.length > 0) {
            result.push(...overviewLines)
            result.push('')
          }

          // Add "Learn More" link
          const detailLink = detailedSections.get(heading)!
          result.push(`[📖 Learn more about ${heading}](${detailLink})`)
          result.push('')

          // Skip the detailed content we just summarized
          i = j - 1
          inDetailedSection = true
          continue
        }
      }

      // Add line if not in a detailed section we're collapsing
      if (!inDetailedSection) {
        result.push(line)
      } else if (line.startsWith('#')) {
        // New section, stop skipping
        inDetailedSection = false
        result.push(line)
      }
    }

    return result.join('\n')
  }

  /**
   * Add quick start section to tutorial or getting-started content
   * @param content - Original content
   * @param quickStartSteps - Array of quick start steps
   * @returns Content with quick start section added
   */
  addQuickStartSection(content: string, quickStartSteps: string[]): string {
    const lines = content.split('\n')
    const result: string[] = []
    let titleFound = false
    let quickStartAdded = false

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (line === undefined) continue

      // Find the main title
      if (line.startsWith('# ') && !titleFound) {
        result.push(line)
        titleFound = true

        // Skip any empty lines after title
        let j = i + 1
        while (j < lines.length && lines[j] !== undefined && !lines[j]!.trim()) {
          result.push(lines[j]!)
          j++
        }

        // Add quick start section right after title
        result.push('')
        result.push('## 🚀 Quick Start')
        result.push('')
        result.push('Get up and running in under 5 minutes:')
        result.push('')

        for (let step = 0; step < quickStartSteps.length; step++) {
          result.push(`${step + 1}. ${quickStartSteps[step]}`)
        }

        result.push('')
        result.push('---')
        result.push('')

        quickStartAdded = true
        i = j - 1
        continue
      }

      result.push(line)
    }

    // If no title found, add quick start at the beginning
    if (!quickStartAdded && quickStartSteps.length > 0) {
      const quickStart: string[] = []
      quickStart.push('## 🚀 Quick Start')
      quickStart.push('')
      quickStart.push('Get up and running in under 5 minutes:')
      quickStart.push('')

      for (let step = 0; step < quickStartSteps.length; step++) {
        quickStart.push(`${step + 1}. ${quickStartSteps[step]}`)
      }

      quickStart.push('')
      quickStart.push('---')
      quickStart.push('')
      quickStart.push(...result)

      return quickStart.join('\n')
    }

    return result.join('\n')
  }

  /**
   * Extract overview from detailed content
   * Returns the first paragraph after the title as an overview
   * @param content - Full content
   * @returns Overview text (first paragraph)
   */
  extractOverview(content: string): string {
    const lines = content.split('\n')
    let titleFound = false
    const overviewLines: string[] = []

    for (const line of lines) {
      // Skip until we find the title
      if (line.startsWith('# ')) {
        titleFound = true
        continue
      }

      // After title, collect first paragraph
      if (titleFound) {
        if (!line.trim()) {
          // Empty line - if we have content, we're done
          if (overviewLines.length > 0) {
            break
          }
          continue
        }

        // Stop at next heading
        if (line.startsWith('#')) {
          break
        }

        overviewLines.push(line)
      }
    }

    return overviewLines.join(' ').trim()
  }

  // Helper methods

  private getRelativePath(fullPath: string): string {
    // Convert absolute path to relative path from docs root
    const parts = fullPath.split('/')
    const docsIndex = parts.indexOf('docs')
    if (docsIndex >= 0) {
      return './' + parts.slice(docsIndex + 1).join('/')
    }
    return fullPath
  }

  private calculateRelativePath(fromPath: string, toPath: string): string {
    const from = fromPath.split('/').filter(p => p)
    const to = toPath.split('/').filter(p => p)

    // Find common prefix
    let commonLength = 0
    while (commonLength < from.length - 1 && commonLength < to.length && from[commonLength] === to[commonLength]) {
      commonLength++
    }

    // Build relative path
    const upLevels = from.length - commonLength - 1
    const downPath = to.slice(commonLength)

    const relativeParts = []
    for (let i = 0; i < upLevels; i++) {
      relativeParts.push('..')
    }
    relativeParts.push(...downPath)

    return relativeParts.join('/')
  }

  private extractTitle(content: string): string | null {
    const lines = content.split('\n')
    for (const line of lines) {
      if (line.startsWith('# ')) {
        const title = line.substring(2).trim()
        // Return null if title is empty or only whitespace/special chars
        if (title && /[a-zA-Z0-9]/.test(title)) {
          return title
        }
      }
    }
    return null
  }

  private extractDescription(content: string): string | null {
    const lines = content.split('\n')
    let foundTitle = false

    for (const line of lines) {
      if (line.startsWith('# ')) {
        foundTitle = true
        continue
      }

      if (foundTitle && line.trim() && !line.startsWith('#')) {
        // Return first non-empty, non-heading line after title
        return line.trim().substring(0, 150) + (line.length > 150 ? '...' : '')
      }
    }

    return null
  }

  private formatCategoryTitle(category: string): string {
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  private getCategoryEmoji(category: DiátaxisCategory): string {
    const emojiMap: Record<DiátaxisCategory, string> = {
      'tutorial': '📖',
      'how-to': '🔧',
      'reference': '📋',
      'explanation': '💡',
      'project': '📊',
      'archive': '📦',
      'uncategorized': '📄'
    }
    return emojiMap[category] || '📄'
  }

  private getCategoryDescription(category: DiátaxisCategory): string {
    const descriptions: Record<DiátaxisCategory, string> = {
      'tutorial': 'Step-by-step lessons designed to help you learn by doing. Tutorials are learning-oriented and take you through a series of steps to complete a project.',
      'how-to': 'Practical guides that show you how to solve specific problems. How-to guides are goal-oriented and provide steps to accomplish particular tasks.',
      'reference': 'Technical descriptions of the system. Reference documentation is information-oriented and describes the machinery.',
      'explanation': 'Discussions that clarify and illuminate topics. Explanations are understanding-oriented and provide background and context.',
      'project': 'Project management information including status, roadmap, and changelog.',
      'archive': 'Historical documentation that is no longer current but preserved for reference.',
      'uncategorized': 'Documentation that has not yet been categorized.'
    }
    return descriptions[category] || ''
  }

  private groupFilesBySubdirectory(files: FileInfo[]): Map<string, FileInfo[]> {
    const groups = new Map<string, FileInfo[]>()

    for (const file of files) {
      const parts = file.path.split('/')
      // Find the subdirectory (the part after the category)
      let subdir = ''

      // Look for category in path
      const categoryIndex = parts.findIndex(p =>
        ['tutorials', 'how-to', 'reference', 'explanation', 'project', 'archive'].includes(p)
      )

      if (categoryIndex >= 0 && categoryIndex < parts.length - 2) {
        subdir = parts[categoryIndex + 1] || ''
      }

      if (!groups.has(subdir)) {
        groups.set(subdir, [])
      }
      groups.get(subdir)!.push(file)
    }

    return groups
  }
}
