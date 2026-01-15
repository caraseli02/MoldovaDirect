/**
 * Documentation Auditor
 * Analyzes existing documentation structure and content
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'
import type {
  DiátaxisCategory,
  FileInfo,
  FileInventory,
  DuplicateReport,
  GapAnalysis,
  AuditReport,
  MigrationMap,
} from './types'

export class DocumentationAuditor {
  /**
   * Recursively scan a directory and generate a complete file inventory
   * @param dirPath - Path to the directory to scan
   * @returns FileInventory with all files and metadata
   */
  async scanDirectory(dirPath: string): Promise<FileInventory> {
    const files: FileInfo[] = []
    const categories = new Map<DiátaxisCategory, FileInfo[]>()

    // Initialize category arrays
    const categoryTypes: DiátaxisCategory[] = [
      'tutorial',
      'how-to',
      'reference',
      'explanation',
      'project',
      'archive',
      'uncategorized',
    ]
    for (const category of categoryTypes) {
      categories.set(category, [])
    }

    await this.scanDirectoryRecursive(dirPath, files)

    // Categorize all files
    for (const file of files) {
      const category = this.categorizeFile(file)
      file.category = category
      const categoryFiles = categories.get(category) || []
      categoryFiles.push(file)
      categories.set(category, categoryFiles)
    }

    const totalSize = files.reduce((sum, file) => sum + file.size, 0)

    return {
      files,
      totalCount: files.length,
      totalSize,
      categories,
    }
  }

  /**
   * Recursive helper to scan directory
   */
  private async scanDirectoryRecursive(
    dirPath: string,
    files: FileInfo[],
  ): Promise<void> {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name)

        // Skip node_modules, .git, and other common directories
        if (
          entry.isDirectory() &&
          (entry.name === 'node_modules' ||
            entry.name === '.git' ||
            entry.name === '.nuxt' ||
            entry.name === 'dist' ||
            entry.name === 'coverage')
        ) {
          continue
        }

        if (entry.isDirectory()) {
          await this.scanDirectoryRecursive(fullPath, files)
        } else if (entry.isFile() && this.isDocumentationFile(entry.name)) {
          const stats = await fs.stat(fullPath)
          const content = await fs.readFile(fullPath, 'utf-8')

          files.push({
            path: fullPath,
            name: entry.name,
            size: stats.size,
            lastModified: stats.mtime,
            content,
          })
        }
      }
    } catch (error) {
      // If directory doesn't exist or can't be read, skip it
      console.warn(`Warning: Could not scan directory ${dirPath}:`, error)
    }
  }

  /**
   * Check if a file is a documentation file
   */
  private isDocumentationFile(filename: string): boolean {
    const docExtensions = ['.md', '.mdx', '.txt']
    return docExtensions.some(ext => filename.toLowerCase().endsWith(ext))
  }

  /**
   * Categorize a file by Diátaxis type using content analysis
   * @param file - File to categorize
   * @returns Diátaxis category
   */
  categorizeFile(file: FileInfo): DiátaxisCategory {
    const content = file.content.toLowerCase()
    const filePath = file.path.toLowerCase()
    const fileName = file.name.toLowerCase()

    // Check path-based categorization first
    if (filePath.includes('/tutorial') || filePath.includes('/getting-started')) {
      return 'tutorial'
    }
    if (filePath.includes('/how-to') || filePath.includes('/guide')) {
      return 'how-to'
    }
    if (
      filePath.includes('/reference') ||
      filePath.includes('/api') ||
      filePath.includes('/config')
    ) {
      return 'reference'
    }
    if (
      filePath.includes('/explanation') ||
      filePath.includes('/concept') ||
      filePath.includes('/architecture')
    ) {
      return 'explanation'
    }
    if (
      filePath.includes('/project') ||
      fileName.includes('roadmap') ||
      fileName.includes('changelog') ||
      fileName.includes('status')
    ) {
      return 'project'
    }
    if (filePath.includes('/archive') || filePath.includes('/old')) {
      return 'archive'
    }

    // Content-based heuristics
    const tutorialKeywords = [
      'getting started',
      'step by step',
      'tutorial',
      'walkthrough',
      'first',
      'beginner',
      'introduction to',
    ]
    const howToKeywords = [
      'how to',
      'guide',
      'configure',
      'setup',
      'deploy',
      'install',
      'create',
      'build',
    ]
    const referenceKeywords = [
      'api',
      'reference',
      'specification',
      'parameters',
      'returns',
      'endpoint',
      'function',
      'method',
      'property',
    ]
    const explanationKeywords = [
      'why',
      'concept',
      'architecture',
      'design',
      'pattern',
      'principle',
      'understanding',
      'explanation',
    ]

    const tutorialScore = this.countKeywords(content, tutorialKeywords)
    const howToScore = this.countKeywords(content, howToKeywords)
    const referenceScore = this.countKeywords(content, referenceKeywords)
    const explanationScore = this.countKeywords(content, explanationKeywords)

    const maxScore = Math.max(
      tutorialScore,
      howToScore,
      referenceScore,
      explanationScore,
    )

    if (maxScore === 0) {
      return 'uncategorized'
    }

    if (tutorialScore === maxScore) return 'tutorial'
    if (howToScore === maxScore) return 'how-to'
    if (referenceScore === maxScore) return 'reference'
    if (explanationScore === maxScore) return 'explanation'

    return 'uncategorized'
  }

  /**
   * Count keyword occurrences in content
   */
  private countKeywords(content: string, keywords: string[]): number {
    let count = 0
    for (const keyword of keywords) {
      const regex = new RegExp(keyword, 'gi')
      const matches = content.match(regex)
      count += matches ? matches.length : 0
    }
    return count
  }

  /**
   * Find duplicate content across files
   * @param inventory - File inventory to analyze
   * @returns Duplicate report
   */
  findDuplicates(inventory: FileInventory): DuplicateReport {
    const duplicateSets: DuplicateReport['duplicateSets'] = []
    const processed = new Set<string>()

    const files = inventory.files
    for (let i = 0; i < files.length; i++) {
      const file1 = files[i]!
      if (processed.has(file1.path)) continue

      const similarFiles: FileInfo[] = [file1]

      for (let j = i + 1; j < files.length; j++) {
        const file2 = files[j]!
        if (processed.has(file2.path)) continue

        const similarity = this.calculateSimilarity(file1.content, file2.content)

        if (similarity > 0.8) {
          similarFiles.push(file2)
          processed.add(file2.path)
        }
      }

      if (similarFiles.length > 1) {
        processed.add(file1.path)
        duplicateSets.push({
          files: similarFiles,
          similarity: this.calculateAverageSimilarity(similarFiles),
          recommendation: this.generateDuplicateRecommendation(similarFiles),
        })
      }
    }

    return { duplicateSets }
  }

  /**
   * Calculate similarity between two strings using cosine similarity
   */
  private calculateSimilarity(text1: string, text2: string): number {
    const words1 = this.tokenize(text1)
    const words2 = this.tokenize(text2)

    // If both texts have no meaningful tokens, they're only similar if identical
    if (words1.length === 0 && words2.length === 0) {
      return text1 === text2 ? 1 : 0
    }

    // If one has tokens and the other doesn't, they're not similar
    if (words1.length === 0 || words2.length === 0) {
      return 0
    }

    const allWords = new Set([...words1, ...words2])
    const vector1: number[] = []
    const vector2: number[] = []

    for (const word of allWords) {
      vector1.push(words1.filter(w => w === word).length)
      vector2.push(words2.filter(w => w === word).length)
    }

    return this.cosineSimilarity(vector1, vector2)
  }

  /**
   * Tokenize text into words
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2)
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(vec1: number[], vec2: number[]): number {
    let dotProduct = 0
    let mag1 = 0
    let mag2 = 0

    for (let i = 0; i < vec1.length; i++) {
      const v1 = vec1[i]!
      const v2 = vec2[i]!
      dotProduct += v1 * v2
      mag1 += v1 * v1
      mag2 += v2 * v2
    }

    mag1 = Math.sqrt(mag1)
    mag2 = Math.sqrt(mag2)

    if (mag1 === 0 || mag2 === 0) return 0

    return dotProduct / (mag1 * mag2)
  }

  /**
   * Calculate average similarity for a set of files
   */
  private calculateAverageSimilarity(files: FileInfo[]): number {
    if (files.length < 2) return 1

    let totalSimilarity = 0
    let comparisons = 0

    for (let i = 0; i < files.length; i++) {
      const fileI = files[i]!
      for (let j = i + 1; j < files.length; j++) {
        const fileJ = files[j]!
        totalSimilarity += this.calculateSimilarity(
          fileI.content,
          fileJ.content,
        )
        comparisons++
      }
    }

    return comparisons > 0 ? totalSimilarity / comparisons : 0
  }

  /**
   * Generate recommendation for duplicate files
   */
  private generateDuplicateRecommendation(files: FileInfo[]): string {
    const mostRecent = files.reduce((latest, file) =>
      file.lastModified > latest.lastModified ? file : latest,
    )

    return `Consider consolidating into ${mostRecent.name} (most recent) and archiving others`
  }

  /**
   * Identify gaps in documentation
   * @param inventory - File inventory to analyze
   * @returns Gap analysis
   */
  identifyGaps(inventory: FileInventory): GapAnalysis {
    // Define required documentation topics
    const requiredTutorials = [
      'getting-started',
      'first-feature',
      'testing-basics',
      'deployment-basics',
    ]

    const requiredHowTos = [
      'authentication',
      'checkout',
      'deployment',
      'testing',
      'database-migration',
    ]

    const requiredReference = [
      'api-reference',
      'architecture',
      'configuration',
      'components',
    ]

    const requiredExplanations = [
      'architecture-overview',
      'design-decisions',
      'security-model',
    ]

    const missingTutorials = this.findMissingTopics(
      inventory,
      'tutorial',
      requiredTutorials,
    )
    const missingHowTos = this.findMissingTopics(
      inventory,
      'how-to',
      requiredHowTos,
    )
    const missingReference = this.findMissingTopics(
      inventory,
      'reference',
      requiredReference,
    )
    const missingExplanations = this.findMissingTopics(
      inventory,
      'explanation',
      requiredExplanations,
    )

    // Determine priority based on number of gaps
    const totalGaps =
      missingTutorials.length +
      missingHowTos.length +
      missingReference.length +
      missingExplanations.length

    let priority: 'critical' | 'high' | 'medium' | 'low'
    if (totalGaps > 10) priority = 'critical'
    else if (totalGaps > 5) priority = 'high'
    else if (totalGaps > 2) priority = 'medium'
    else priority = 'low'

    return {
      missingTutorials,
      missingHowTos,
      missingReference,
      missingExplanations,
      priority,
    }
  }

  /**
   * Find missing topics in a category
   */
  private findMissingTopics(
    inventory: FileInventory,
    category: DiátaxisCategory,
    requiredTopics: string[],
  ): string[] {
    const categoryFiles = inventory.categories.get(category) || []
    const existingTopics = categoryFiles.map(file =>
      file.name.toLowerCase().replace(/\.md$/, ''),
    )

    return requiredTopics.filter(
      topic => !existingTopics.some(existing => existing.includes(topic)),
    )
  }

  /**
   * Create migration mapping from old paths to new paths
   * @param inventory - File inventory to map
   * @returns Migration map
   */
  createMigrationMapping(inventory: FileInventory): MigrationMap {
    const mappings: MigrationMap['mappings'] = []

    for (const file of inventory.files) {
      const category = this.categorizeFile(file)
      const newPath = this.generateNewPath(file, category)
      const priority = this.calculatePriority(file, category)
      const estimatedEffort = this.estimateEffort(file, category)

      mappings.push({
        oldPath: file.path,
        newPath,
        category,
        priority,
        estimatedEffort,
      })
    }

    // Sort by priority (higher first)
    mappings.sort((a, b) => b.priority - a.priority)

    return { mappings }
  }

  /**
   * Generate new path for a file based on its category
   */
  private generateNewPath(file: FileInfo, category: DiátaxisCategory): string {
    const docsRoot = 'docs'
    const fileName = file.name

    switch (category) {
      case 'tutorial':
        return path.join(docsRoot, 'tutorials', fileName)
      case 'how-to':
        return path.join(docsRoot, 'how-to', this.inferSubcategory(file), fileName)
      case 'reference':
        return path.join(docsRoot, 'reference', this.inferSubcategory(file), fileName)
      case 'explanation':
        return path.join(docsRoot, 'explanation', this.inferSubcategory(file), fileName)
      case 'project':
        return path.join(docsRoot, 'project', fileName)
      case 'archive':
        return path.join(docsRoot, 'archive', new Date().toISOString().split('T')[0] || 'unknown-date', fileName)
      default:
        return path.join(docsRoot, 'uncategorized', fileName)
    }
  }

  /**
   * Infer subcategory for how-to and reference docs
   */
  private inferSubcategory(file: FileInfo): string {
    const content = file.content.toLowerCase()
    const filePath = file.path.toLowerCase()

    // How-to subcategories
    if (content.includes('auth') || filePath.includes('auth')) return 'authentication'
    if (content.includes('checkout') || filePath.includes('checkout')) return 'checkout'
    if (content.includes('deploy') || filePath.includes('deploy')) return 'deployment'
    if (content.includes('test') || filePath.includes('test')) return 'testing'

    // Reference subcategories
    if (content.includes('api') || filePath.includes('api')) return 'api'
    if (content.includes('architecture') || filePath.includes('architecture'))
      return 'architecture'
    if (content.includes('config') || filePath.includes('config')) return 'configuration'
    if (content.includes('component') || filePath.includes('component')) return 'components'

    return 'general'
  }

  /**
   * Calculate priority for migration (1-10, higher is more important)
   */
  private calculatePriority(file: FileInfo, category: DiátaxisCategory): number {
    let priority = 5 // Default medium priority

    // Boost priority for certain categories
    if (category === 'tutorial') priority += 2
    if (category === 'how-to') priority += 1

    // Boost priority for getting started docs
    if (file.name.toLowerCase().includes('getting-started')) priority += 3
    if (file.name.toLowerCase().includes('readme')) priority += 2

    // Boost priority for recently modified files
    const daysSinceModified =
      (Date.now() - file.lastModified.getTime()) / (1000 * 60 * 60 * 24)
    if (daysSinceModified < 30) priority += 1

    // Lower priority for archived content
    if (category === 'archive') priority -= 3

    return Math.max(1, Math.min(10, priority))
  }

  /**
   * Estimate effort for migration
   */
  private estimateEffort(
    file: FileInfo,
    _category: DiátaxisCategory,
  ): 'low' | 'medium' | 'high' {
    const contentLength = file.content.length
    const linkCount = (file.content.match(/\[.*?\]\(.*?\)/g) || []).length

    // High effort if lots of content or many links
    if (contentLength > 5000 || linkCount > 20) return 'high'

    // Medium effort for moderate content
    if (contentLength > 2000 || linkCount > 10) return 'medium'

    // Low effort for simple files
    return 'low'
  }

  /**
   * Generate audit report
   * @param inventory - File inventory to report on
   * @returns Audit report
   */
  generateAuditReport(inventory: FileInventory): AuditReport {
    const duplicates = this.findDuplicates(inventory)
    const gaps = this.identifyGaps(inventory)

    const byCategory = new Map<DiátaxisCategory, number>()
    for (const [category, files] of inventory.categories) {
      byCategory.set(category, files.length)
    }

    const recommendations: string[] = []

    // Add recommendations based on findings
    if (duplicates.duplicateSets.length > 0) {
      recommendations.push(
        `Found ${duplicates.duplicateSets.length} sets of duplicate content. Consider consolidating.`,
      )
    }

    if (gaps.priority === 'critical' || gaps.priority === 'high') {
      recommendations.push(
        `Documentation gaps detected with ${gaps.priority} priority. Focus on creating missing content.`,
      )
    }

    const uncategorized = byCategory.get('uncategorized') || 0
    if (uncategorized > 0) {
      recommendations.push(
        `${uncategorized} files could not be categorized. Review and categorize manually.`,
      )
    }

    return {
      summary: {
        totalFiles: inventory.totalCount,
        byCategory,
        duplicates: duplicates.duplicateSets.length,
        gaps:
          gaps.missingTutorials.length +
          gaps.missingHowTos.length +
          gaps.missingReference.length +
          gaps.missingExplanations.length,
      },
      details: {
        inventory,
        duplicates,
        gaps,
      },
      recommendations,
    }
  }
}
