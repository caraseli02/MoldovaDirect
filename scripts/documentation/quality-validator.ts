/**
 * Quality Validator
 * 
 * Validates documentation quality including:
 * - Link validation (internal links point to existing files)
 * - Code example validation (syntax and completeness)
 * - Structure validation (required sections present)
 * - Metadata validation (required metadata fields)
 * - Quality report generation
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'
import {
  type FileInfo,
  type Link,
  type LinkValidationReport,
  type CodeValidationReport,
  type StructureValidationReport,
  type FormattingReport,
  type MetadataValidationReport,
  type QualityReport,
  type DiátaxisCategory,
  type FileMetadata,
} from './types'

export class QualityValidator {
  /**
   * Validate all internal links in documentation files
   * Checks that internal links point to existing files
   */
  async validateLinks(files: FileInfo[]): Promise<LinkValidationReport> {
    const report: LinkValidationReport = {
      totalLinks: 0,
      validLinks: 0,
      brokenLinks: [],
    }

    // Build a set of all file paths for quick lookup (normalized)
    const filePaths = new Set(files.map(f => this.normalizePath(f.path)))

    for (const file of files) {
      const links = this.extractLinks(file.content)

      for (const link of links) {
        if (!link.isInternal) continue

        report.totalLinks++

        // Resolve the link relative to the file's directory
        const fileDir = path.dirname(file.path)
        const linkTarget = link.url.split('#')[0]
        if (!linkTarget) continue

        // Resolve relative path
        let resolvedPath: string
        if (linkTarget.startsWith('/')) {
          // Absolute path from root
          resolvedPath = this.normalizePath(linkTarget)
        } else {
          // Relative path
          resolvedPath = this.normalizePath(path.join(fileDir, linkTarget))
        }

        if (filePaths.has(resolvedPath) || await this.fileExists(resolvedPath)) {
          report.validLinks++
        } else {
          report.brokenLinks.push({
            file: file.path,
            link: link.url,
            line: link.line,
          })
        }
      }
    }

    return report
  }

  /**
   * Validate code examples in documentation files
   * Checks syntax and completeness (no placeholders)
   */
  async validateCodeExamples(files: FileInfo[]): Promise<CodeValidationReport> {
    const report: CodeValidationReport = {
      totalExamples: 0,
      validExamples: 0,
      invalidExamples: [],
    }

    for (const file of files) {
      const codeBlocks = this.extractCodeBlocks(file.content)

      for (const block of codeBlocks) {
        report.totalExamples++

        // Check for placeholders
        const placeholderPatterns = [
          /\[.*?\]/g, // [placeholder]
          /(?<!\.)\.\.\.(?!\.)/g, // ... but not spread operator
          /TODO/gi,
          /FIXME/gi,
          /<your.*?>/gi, // <your-value>
          /\$\{[A-Z_]+\}/g, // ${PLACEHOLDER} but not ${variable}
        ]

        let hasPlaceholder = false
        for (const pattern of placeholderPatterns) {
          if (pattern.test(block.code)) {
            hasPlaceholder = true
            break
          }
        }

        if (hasPlaceholder) {
          report.invalidExamples.push({
            file: file.path,
            line: block.line,
            error: 'Code example contains placeholders',
            language: block.language,
          })
          continue
        }

        // Basic syntax validation based on language
        const syntaxError = this.validateSyntax(block.code, block.language)
        if (syntaxError) {
          report.invalidExamples.push({
            file: file.path,
            line: block.line,
            error: syntaxError,
            language: block.language,
          })
        } else {
          report.validExamples++
        }
      }
    }

    return report
  }

  /**
   * Validate document structure based on category
   * Checks for required sections
   */
  validateStructure(
    file: FileInfo,
    category: DiátaxisCategory
  ): StructureValidationReport {
    const headings = this.extractHeadings(file.content)
    const requiredSections = this.getRequiredSections(category)

    const missingSections: string[] = []
    for (const required of requiredSections) {
      if (!headings.some(h => h.toLowerCase().includes(required.toLowerCase()))) {
        missingSections.push(required)
      }
    }

    const recommendations: string[] = []

    // Check for common best practices
    if (category === 'tutorial' && !headings.some(h => h.toLowerCase().includes('step'))) {
      recommendations.push('Tutorials should include step-by-step instructions')
    }

    if (category === 'how-to' && !headings.some(h => h.toLowerCase().includes('prerequisite'))) {
      recommendations.push('How-to guides should include prerequisites section')
    }

    if (category === 'reference' && !headings.some(h => h.toLowerCase().includes('parameter') || h.toLowerCase().includes('option'))) {
      recommendations.push('Reference docs should document parameters/options')
    }

    return {
      hasRequiredSections: missingSections.length === 0,
      missingSections,
      recommendations,
    }
  }

  /**
   * Validate document formatting
   */
  validateFormatting(file: FileInfo): FormattingReport {
    const issues: string[] = []

    // Check for proper headings
    const hasH1 = /^# /m.test(file.content)
    const hasProperHeadings = hasH1

    if (!hasH1) {
      issues.push('Document should start with a level 1 heading (# Title)')
    }

    // Check for code blocks
    const hasCodeBlocks = /```/.test(file.content)

    // Check for links
    const hasLinks = /\[.*?\]\(.*?\)/.test(file.content)

    // Check for proper list formatting
    const hasBadLists = /^\d+\.\s*$/m.test(file.content) || /^[-*]\s*$/m.test(file.content)
    if (hasBadLists) {
      issues.push('Lists should have content after the marker')
    }

    return {
      hasProperHeadings,
      hasCodeBlocks,
      hasLinks,
      issues,
    }
  }

  /**
   * Validate document metadata
   */
  validateMetadata(file: FileInfo): MetadataValidationReport {
    const metadata = this.extractMetadata(file.content)
    const missingFields: string[] = []

    if (!metadata.title) missingFields.push('title')
    if (!metadata.description) missingFields.push('description')
    if (!metadata.lastUpdated) missingFields.push('last-updated')
    if (!metadata.tags || metadata.tags.length === 0) missingFields.push('tags')

    return {
      hasTitle: !!metadata.title,
      hasDescription: !!metadata.description,
      hasLastUpdated: !!metadata.lastUpdated,
      hasTags: !!metadata.tags && metadata.tags.length > 0,
      missingFields,
    }
  }

  /**
   * Generate comprehensive quality report
   */
  async generateQualityReport(files: FileInfo[]): Promise<QualityReport> {
    // Run all validations
    const linkValidation = await this.validateLinks(files)
    const codeValidation = await this.validateCodeExamples(files)

    const structureIssues: StructureValidationReport[] = []
    const formattingIssues: FormattingReport[] = []
    const metadataIssues: MetadataValidationReport[] = []

    for (const file of files) {
      const category = file.category || 'uncategorized'
      const structure = this.validateStructure(file, category)
      if (!structure.hasRequiredSections || structure.recommendations.length > 0) {
        structureIssues.push(structure)
      }

      const formatting = this.validateFormatting(file)
      if (formatting.issues.length > 0) {
        formattingIssues.push(formatting)
      }

      const metadata = this.validateMetadata(file)
      if (metadata.missingFields.length > 0) {
        metadataIssues.push(metadata)
      }
    }

    // Calculate overall score (0-100)
    const linkScore = linkValidation.totalLinks > 0
      ? (linkValidation.validLinks / linkValidation.totalLinks) * 100
      : 100

    const codeScore = codeValidation.totalExamples > 0
      ? (codeValidation.validExamples / codeValidation.totalExamples) * 100
      : 100

    const structureScore = files.length > 0
      ? ((files.length - structureIssues.length) / files.length) * 100
      : 100

    const formattingScore = files.length > 0
      ? ((files.length - formattingIssues.length) / files.length) * 100
      : 100

    const metadataScore = files.length > 0
      ? ((files.length - metadataIssues.length) / files.length) * 100
      : 100

    const overallScore = (linkScore + codeScore + structureScore + formattingScore + metadataScore) / 5

    // Generate recommendations
    const recommendations: string[] = []

    if (linkValidation.brokenLinks.length > 0) {
      recommendations.push(`Fix ${linkValidation.brokenLinks.length} broken links`)
    }

    if (codeValidation.invalidExamples.length > 0) {
      recommendations.push(`Fix ${codeValidation.invalidExamples.length} invalid code examples`)
    }

    if (structureIssues.length > 0) {
      recommendations.push(`Improve structure in ${structureIssues.length} documents`)
    }

    if (metadataIssues.length > 0) {
      recommendations.push(`Add missing metadata to ${metadataIssues.length} documents`)
    }

    return {
      overallScore: Math.round(overallScore),
      linkValidation,
      codeValidation,
      structureIssues,
      formattingIssues,
      metadataIssues,
      recommendations,
    }
  }

  // Helper methods

  private extractLinks(content: string): Link[] {
    const links: Link[] = []
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
    const lines = content.split('\n')

    lines.forEach((line, lineIndex) => {
      let match
      while ((match = linkRegex.exec(line)) !== null) {
        const text = match[1]
        const url = match[2]
        if (text === undefined || url === undefined) continue

        links.push({
          text,
          url,
          line: lineIndex + 1,
          column: match.index,
          isInternal: this.isInternalLink(url),
        })
      }
    })

    return links
  }

  private isInternalLink(url: string): boolean {
    // Internal links are relative paths or start with /
    return !url.startsWith('http://') &&
      !url.startsWith('https://') &&
      !url.startsWith('mailto:')
  }

  private extractCodeBlocks(content: string): Array<{ code: string; language: string; line: number }> {
    const blocks: Array<{ code: string; language: string; line: number }> = []
    const lines = content.split('\n')

    let inBlock = false
    let currentBlock = ''
    let currentLanguage = ''
    let blockStartLine = 0

    lines.forEach((line, index) => {
      if (line.startsWith('```')) {
        if (!inBlock) {
          inBlock = true
          currentLanguage = line.slice(3).trim()
          blockStartLine = index + 1
          currentBlock = ''
        } else {
          inBlock = false
          blocks.push({
            code: currentBlock,
            language: currentLanguage,
            line: blockStartLine,
          })
        }
      } else if (inBlock) {
        currentBlock += line + '\n'
      }
    })

    return blocks
  }

  private validateSyntax(code: string, language: string): string | null {
    // Basic syntax validation
    // For production, consider using language-specific parsers

    if (!language) {
      return null // Skip validation if no language specified
    }

    // Check for common syntax errors
    if (language === 'typescript' || language === 'javascript' || language === 'ts' || language === 'js') {
      // Check for unmatched braces
      const openBraces = (code.match(/{/g) || []).length
      const closeBraces = (code.match(/}/g) || []).length
      if (openBraces !== closeBraces) {
        return 'Unmatched braces'
      }

      // Check for unmatched parentheses
      const openParens = (code.match(/\(/g) || []).length
      const closeParens = (code.match(/\)/g) || []).length
      if (openParens !== closeParens) {
        return 'Unmatched parentheses'
      }

      // Check for unmatched brackets
      const openBrackets = (code.match(/\[/g) || []).length
      const closeBrackets = (code.match(/]/g) || []).length
      if (openBrackets !== closeBrackets) {
        return 'Unmatched brackets'
      }
    }

    return null
  }

  private extractHeadings(content: string): string[] {
    const headings: string[] = []
    const lines = content.split('\n')

    for (const line of lines) {
      if (line.startsWith('#')) {
        const heading = line.replace(/^#+\s*/, '').trim()
        headings.push(heading)
      }
    }

    return headings
  }

  private getRequiredSections(category: DiátaxisCategory): string[] {
    switch (category) {
      case 'tutorial':
        return ['Introduction', 'Prerequisites', 'Steps']
      case 'how-to':
        return ['Prerequisites', 'Steps']
      case 'reference':
        return ['Overview', 'Parameters', 'Examples']
      case 'explanation':
        return ['Overview', 'Concepts']
      case 'project':
        return ['Overview']
      default:
        return []
    }
  }

  private extractMetadata(content: string): FileMetadata {
    const metadata: FileMetadata = {}

    // Extract frontmatter if present
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
    if (frontmatterMatch && frontmatterMatch[1]) {
      const frontmatter = frontmatterMatch[1]
      const lines = frontmatter.split('\n')

      for (const line of lines) {
        const [key, ...valueParts] = line.split(':')
        if (!key) continue
        const value = valueParts.join(':').trim()

        if (key.trim() === 'title') {
          metadata.title = value
        } else if (key.trim() === 'description') {
          metadata.description = value
        } else if (key.trim() === 'last-updated' || key.trim() === 'lastUpdated') {
          metadata.lastUpdated = new Date(value)
        } else if (key.trim() === 'tags') {
          metadata.tags = value.split(',').map(t => t.trim())
        }
      }
    }

    // If no frontmatter, try to extract from content
    if (!metadata.title) {
      const h1Match = content.match(/^# (.+)$/m)
      if (h1Match) {
        metadata.title = h1Match[1]
      }
    }

    return metadata
  }

  private normalizePath(filePath: string): string {
    return path.normalize(filePath).replace(/\\/g, '/')
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath)
      return true
    } catch {
      return false
    }
  }
}
