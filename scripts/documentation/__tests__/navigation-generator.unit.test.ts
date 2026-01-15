/**
 * Unit tests for Navigation Generator
 */

import { describe, it, expect } from 'vitest'
import { NavigationGenerator } from '../navigation-generator'
import type { DocumentationStructure, FileInfo } from '../types'

describe('NavigationGenerator', () => {
  const generator = new NavigationGenerator()

  describe('generateRootReadme', () => {
    it('should generate README with all required sections', () => {
      const structure: DocumentationStructure = {
        tutorials: [],
        howTo: new Map(),
        reference: new Map(),
        explanation: new Map(),
        project: []
      }

      const readme = generator.generateRootReadme(structure)

      // Check for required sections
      expect(readme).toContain('# 📚 Documentation')
      expect(readme).toContain('## 🚀 Quick Start')
      expect(readme).toContain('## 🧭 Find What You Need')
      expect(readme).toContain('### 📖 I want to learn')
      expect(readme).toContain('### 🔧 I want to solve a problem')
      expect(readme).toContain('### 📋 I need to look something up')
      expect(readme).toContain('### 💡 I want to understand')
      expect(readme).toContain('## ⚡ Common Tasks')
      expect(readme).toContain('## 📊 Project Information')
    })

    it('should include tutorial links when tutorials exist', () => {
      const tutorials: FileInfo[] = [
        {
          path: 'docs/tutorials/01-getting-started.md',
          name: '01-getting-started.md',
          size: 1000,
          lastModified: new Date(),
          content: '# Getting Started\n\nLearn the basics'
        },
        {
          path: 'docs/tutorials/02-first-feature.md',
          name: '02-first-feature.md',
          size: 1500,
          lastModified: new Date(),
          content: '# Your First Feature\n\nBuild something'
        }
      ]

      const structure: DocumentationStructure = {
        tutorials,
        howTo: new Map(),
        reference: new Map(),
        explanation: new Map(),
        project: []
      }

      const readme = generator.generateRootReadme(structure)

      expect(readme).toContain('Getting Started')
      expect(readme).toContain('./tutorials/01-getting-started.md')
      expect(readme).toContain('(2 available)')
    })

    it('should include how-to categories with file counts', () => {
      const howTo = new Map<string, FileInfo[]>()
      howTo.set('authentication', [
        {
          path: 'docs/how-to/authentication/setup.md',
          name: 'setup.md',
          size: 1000,
          lastModified: new Date(),
          content: '# Setup Authentication'
        },
        {
          path: 'docs/how-to/authentication/testing.md',
          name: 'testing.md',
          size: 800,
          lastModified: new Date(),
          content: '# Testing Authentication'
        }
      ])
      howTo.set('checkout', [
        {
          path: 'docs/how-to/checkout/configuration.md',
          name: 'configuration.md',
          size: 1200,
          lastModified: new Date(),
          content: '# Checkout Configuration'
        }
      ])

      const structure: DocumentationStructure = {
        tutorials: [],
        howTo,
        reference: new Map(),
        explanation: new Map(),
        project: []
      }

      const readme = generator.generateRootReadme(structure)

      expect(readme).toContain('Authentication')
      expect(readme).toContain('(2 guides)')
      expect(readme).toContain('Checkout')
      expect(readme).toContain('(1 guides)')
    })

    it('should include reference categories', () => {
      const reference = new Map<string, FileInfo[]>()
      reference.set('api', [
        {
          path: 'docs/reference/api/endpoints.md',
          name: 'endpoints.md',
          size: 2000,
          lastModified: new Date(),
          content: '# API Endpoints'
        }
      ])

      const structure: DocumentationStructure = {
        tutorials: [],
        howTo: new Map(),
        reference,
        explanation: new Map(),
        project: []
      }

      const readme = generator.generateRootReadme(structure)

      expect(readme).toContain('Api')
      expect(readme).toContain('./reference/api/')
    })

    it('should include project files when they exist', () => {
      const project: FileInfo[] = [
        {
          path: 'docs/project/status.md',
          name: 'status.md',
          size: 500,
          lastModified: new Date(),
          content: '# Project Status\n\nCurrent status'
        },
        {
          path: 'docs/project/roadmap.md',
          name: 'roadmap.md',
          size: 800,
          lastModified: new Date(),
          content: '# Roadmap\n\nFuture plans'
        }
      ]

      const structure: DocumentationStructure = {
        tutorials: [],
        howTo: new Map(),
        reference: new Map(),
        explanation: new Map(),
        project
      }

      const readme = generator.generateRootReadme(structure)

      expect(readme).toContain('Project Status')
      expect(readme).toContain('Roadmap')
    })

    it('should include AI assistant reference', () => {
      const structure: DocumentationStructure = {
        tutorials: [],
        howTo: new Map(),
        reference: new Map(),
        explanation: new Map(),
        project: []
      }

      const readme = generator.generateRootReadme(structure)

      expect(readme).toContain('For AI Assistants')
      expect(readme).toContain('AGENTS.md')
    })
  })

  describe('generateCategoryIndex', () => {
    it('should generate index with category title and description', () => {
      const files: FileInfo[] = []
      const index = generator.generateCategoryIndex('tutorial', files)

      expect(index).toContain('# 📖 Tutorial')
      expect(index).toContain('Step-by-step lessons')
      expect(index).toContain('No documentation files in this category yet')
    })

    it('should list files with titles and descriptions', () => {
      const files: FileInfo[] = [
        {
          path: 'docs/tutorials/getting-started.md',
          name: 'getting-started.md',
          size: 1000,
          lastModified: new Date(),
          content: '# Getting Started\n\nThis guide helps you set up your environment.'
        },
        {
          path: 'docs/tutorials/first-feature.md',
          name: 'first-feature.md',
          size: 1500,
          lastModified: new Date(),
          content: '# Your First Feature\n\nLearn to build a feature.'
        }
      ]

      const index = generator.generateCategoryIndex('tutorial', files)

      expect(index).toContain('Getting Started')
      expect(index).toContain('Your First Feature')
      expect(index).toContain('./tutorials/getting-started.md')
      expect(index).toContain('This guide helps you set up your environment')
    })

    it('should include back navigation link', () => {
      const files: FileInfo[] = []
      const index = generator.generateCategoryIndex('tutorial', files)

      expect(index).toContain('[← Back to Documentation Home](../README.md)')
    })

    it('should use correct emoji for each category', () => {
      expect(generator.generateCategoryIndex('tutorial', [])).toContain('📖')
      expect(generator.generateCategoryIndex('how-to', [])).toContain('🔧')
      expect(generator.generateCategoryIndex('reference', [])).toContain('📋')
      expect(generator.generateCategoryIndex('explanation', [])).toContain('💡')
    })
  })

  describe('generateBreadcrumbs', () => {
    it('should generate breadcrumbs for nested file', () => {
      const breadcrumbs = generator.generateBreadcrumbs('docs/how-to/authentication/setup.md')

      expect(breadcrumbs).toContain('📚 Documentation')
      expect(breadcrumbs).toContain('How To')
      expect(breadcrumbs).toContain('Authentication')
      expect(breadcrumbs).toContain('setup')
      expect(breadcrumbs).toContain('>')
    })

    it('should generate breadcrumbs for top-level file', () => {
      const breadcrumbs = generator.generateBreadcrumbs('docs/tutorials/getting-started.md')

      expect(breadcrumbs).toContain('📚 Documentation')
      expect(breadcrumbs).toContain('Tutorials')
      expect(breadcrumbs).toContain('getting started')
    })

    it('should not link the current page', () => {
      const breadcrumbs = generator.generateBreadcrumbs('docs/tutorials/getting-started.md')

      // Current page should not have markdown link syntax around it
      const parts = breadcrumbs.split(' > ')
      const lastPart = parts[parts.length - 1]
      expect(lastPart).not.toContain('[')
      expect(lastPart).not.toContain(']')
    })
  })

  describe('generateSeeAlso', () => {
    it('should return empty string when no related files', () => {
      const file: FileInfo = {
        path: 'docs/tutorials/getting-started.md',
        name: 'getting-started.md',
        size: 1000,
        lastModified: new Date(),
        content: '# Getting Started'
      }

      const seeAlso = generator.generateSeeAlso(file, [])

      expect(seeAlso).toBe('')
    })

    it('should generate see also section with related files', () => {
      const file: FileInfo = {
        path: 'docs/tutorials/getting-started.md',
        name: 'getting-started.md',
        size: 1000,
        lastModified: new Date(),
        content: '# Getting Started'
      }

      const relatedFiles: FileInfo[] = [
        {
          path: 'docs/tutorials/first-feature.md',
          name: 'first-feature.md',
          size: 1500,
          lastModified: new Date(),
          content: '# Your First Feature\n\nBuild something cool'
        },
        {
          path: 'docs/how-to/authentication/setup.md',
          name: 'setup.md',
          size: 1200,
          lastModified: new Date(),
          content: '# Setup Authentication\n\nConfigure auth'
        }
      ]

      const seeAlso = generator.generateSeeAlso(file, relatedFiles)

      expect(seeAlso).toContain('## See Also')
      expect(seeAlso).toContain('Your First Feature')
      expect(seeAlso).toContain('Setup Authentication')
    })
  })

  describe('generateQuickReference', () => {
    it('should generate quick reference card with items', () => {
      const items = [
        {
          title: 'Run Tests',
          description: 'Execute the test suite',
          code: 'npm test',
          link: './how-to/testing/unit-tests.md'
        },
        {
          title: 'Build Project',
          description: 'Build for production',
          code: 'npm run build'
        }
      ]

      const quickRef = generator.generateQuickReference('Common Commands', items)

      expect(quickRef).toContain('# ⚡ Quick Reference: Common Commands')
      expect(quickRef).toContain('## Run Tests')
      expect(quickRef).toContain('Execute the test suite')
      expect(quickRef).toContain('```')
      expect(quickRef).toContain('npm test')
      expect(quickRef).toContain('[Learn more](./how-to/testing/unit-tests.md)')
      expect(quickRef).toContain('## Build Project')
    })

    it('should handle items without code or links', () => {
      const items = [
        {
          title: 'Important Note',
          description: 'Remember to do this'
        }
      ]

      const quickRef = generator.generateQuickReference('Notes', items)

      expect(quickRef).toContain('Important Note')
      expect(quickRef).toContain('Remember to do this')
      expect(quickRef).not.toContain('```')
      expect(quickRef).not.toContain('[Learn more]')
    })
  })
})
