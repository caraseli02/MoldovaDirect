/**
 * Content Organizer
 * Organizes documentation files into appropriate subdirectories
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'
import type { FileInfo } from './types'

export interface OrganizationResult {
  success: boolean
  originalPath: string
  organizedPath: string
  errors: string[]
}

export class ContentOrganizer {
  /**
   * Organize how-to guides by feature area
   * @param files - Array of how-to guide files
   * @param howToRoot - Root directory for how-to guides (default: 'docs/how-to')
   * @returns Array of organization results
   */
  async organizeHowToByFeature(
    files: FileInfo[],
    howToRoot: string = 'docs/how-to',
  ): Promise<OrganizationResult[]> {
    const results: OrganizationResult[] = []

    for (const file of files) {
      try {
        // Determine feature area from file content and path
        const feature = this.determineFeatureArea(file)

        // Build target path
        const targetPath = path.join(howToRoot, feature, path.basename(file.path))

        // Check if file is already in the correct location
        if (file.path === targetPath) {
          results.push({
            success: true,
            originalPath: file.path,
            organizedPath: targetPath,
            errors: [],
          })
          continue
        }

        // Create feature subdirectory if it doesn't exist
        await fs.mkdir(path.join(howToRoot, feature), { recursive: true })

        // Move file to feature subdirectory
        await fs.rename(file.path, targetPath)

        results.push({
          success: true,
          originalPath: file.path,
          organizedPath: targetPath,
          errors: [],
        })
      } catch (error) {
        results.push({
          success: false,
          originalPath: file.path,
          organizedPath: '',
          errors: [error instanceof Error ? error.message : String(error)],
        })
      }
    }

    return results
  }

  /**
   * Organize reference documentation by domain
   * @param files - Array of reference documentation files
   * @param referenceRoot - Root directory for reference docs (default: 'docs/reference')
   * @returns Array of organization results
   */
  async organizeReferenceByDomain(
    files: FileInfo[],
    referenceRoot: string = 'docs/reference',
  ): Promise<OrganizationResult[]> {
    const results: OrganizationResult[] = []

    for (const file of files) {
      try {
        // Determine domain from file content and path
        const domain = this.determineDomain(file)

        // Build target path
        const targetPath = path.join(referenceRoot, domain, path.basename(file.path))

        // Check if file is already in the correct location
        if (file.path === targetPath) {
          results.push({
            success: true,
            originalPath: file.path,
            organizedPath: targetPath,
            errors: [],
          })
          continue
        }

        // Create domain subdirectory if it doesn't exist
        await fs.mkdir(path.join(referenceRoot, domain), { recursive: true })

        // Move file to domain subdirectory
        await fs.rename(file.path, targetPath)

        results.push({
          success: true,
          originalPath: file.path,
          organizedPath: targetPath,
          errors: [],
        })
      } catch (error) {
        results.push({
          success: false,
          originalPath: file.path,
          organizedPath: '',
          errors: [error instanceof Error ? error.message : String(error)],
        })
      }
    }

    return results
  }

  /**
   * Determine feature area for a how-to guide
   * @param file - File to analyze
   * @returns Feature area (authentication, checkout, deployment, testing, or general)
   */
  private determineFeatureArea(file: FileInfo): string {
    const content = file.content.toLowerCase()
    const filePath = file.path.toLowerCase()
    const fileName = file.name.toLowerCase()

    // Check for authentication-related content
    if (
      content.includes('authentication') ||
      content.includes('auth') ||
      content.includes('login') ||
      content.includes('signup') ||
      content.includes('sign up') ||
      content.includes('password') ||
      content.includes('session') ||
      content.includes('jwt') ||
      content.includes('oauth') ||
      filePath.includes('auth') ||
      fileName.includes('auth')
    ) {
      return 'authentication'
    }

    // Check for checkout-related content
    if (
      content.includes('checkout') ||
      content.includes('payment') ||
      content.includes('stripe') ||
      content.includes('cart') ||
      content.includes('order') ||
      content.includes('purchase') ||
      filePath.includes('checkout') ||
      fileName.includes('checkout')
    ) {
      return 'checkout'
    }

    // Check for deployment-related content
    if (
      content.includes('deployment') ||
      content.includes('deploy') ||
      content.includes('vercel') ||
      content.includes('production') ||
      content.includes('ci/cd') ||
      content.includes('docker') ||
      content.includes('kubernetes') ||
      filePath.includes('deploy') ||
      fileName.includes('deploy')
    ) {
      return 'deployment'
    }

    // Check for testing-related content
    if (
      content.includes('testing') ||
      content.includes('test') ||
      content.includes('vitest') ||
      content.includes('playwright') ||
      content.includes('e2e') ||
      content.includes('unit test') ||
      content.includes('integration test') ||
      filePath.includes('test') ||
      fileName.includes('test')
    ) {
      return 'testing'
    }

    // Default to general if no specific feature is detected
    return 'general'
  }

  /**
   * Determine domain for reference documentation
   * @param file - File to analyze
   * @returns Domain (api, architecture, configuration, components, or general)
   */
  private determineDomain(file: FileInfo): string {
    const content = file.content.toLowerCase()
    const filePath = file.path.toLowerCase()
    const fileName = file.name.toLowerCase()

    // Check for API-related content
    if (
      content.includes('api') ||
      content.includes('endpoint') ||
      content.includes('route') ||
      content.includes('rest') ||
      content.includes('graphql') ||
      content.includes('/api/') ||
      filePath.includes('api') ||
      fileName.includes('api')
    ) {
      return 'api'
    }

    // Check for architecture-related content
    if (
      content.includes('architecture') ||
      content.includes('design pattern') ||
      content.includes('system design') ||
      content.includes('data flow') ||
      content.includes('diagram') ||
      filePath.includes('architecture') ||
      fileName.includes('architecture')
    ) {
      return 'architecture'
    }

    // Check for configuration-related content
    if (
      content.includes('configuration') ||
      content.includes('config') ||
      content.includes('environment variable') ||
      content.includes('settings') ||
      content.includes('.env') ||
      content.includes('nuxt.config') ||
      filePath.includes('config') ||
      fileName.includes('config')
    ) {
      return 'configuration'
    }

    // Check for component-related content
    if (
      content.includes('component') ||
      content.includes('vue') ||
      content.includes('<template>') ||
      content.includes('<script') ||
      content.includes('composable') ||
      filePath.includes('component') ||
      fileName.includes('component')
    ) {
      return 'components'
    }

    // Default to general if no specific domain is detected
    return 'general'
  }
}
