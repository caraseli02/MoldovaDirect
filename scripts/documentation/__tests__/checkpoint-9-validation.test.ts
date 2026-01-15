/**
 * Checkpoint 9: Validation test for navigation and organization
 * This test validates that all navigation features work correctly
 */

import { describe, it, expect } from 'vitest'
import { NavigationGenerator } from '../navigation-generator'
import { ContentOrganizer } from '../content-organizer'
import type { DocumentationStructure, FileInfo } from '../types'

describe('Checkpoint 9: Navigation and Organization Validation', () => {
  const generator = new NavigationGenerator()
  const organizer = new ContentOrganizer()

  describe('README Generation', () => {
    it('should generate a complete README with all required sections', () => {
      const structure: DocumentationStructure = {
        tutorials: [
          {
            path: 'docs/tutorials/01-getting-started.md',
            name: '01-getting-started.md',
            size: 1000,
            lastModified: new Date(),
            content: '# Getting Started\n\nLearn the basics of the project.'
          }
        ],
        howTo: new Map([
          ['authentication', [
            {
              path: 'docs/how-to/authentication/setup.md',
              name: 'setup.md',
              size: 800,
              lastModified: new Date(),
              content: '# Setup Authentication\n\nConfigure authentication.'
            }
          ]],
          ['checkout', [
            {
              path: 'docs/how-to/checkout/payment.md',
              name: 'payment.md',
              size: 900,
              lastModified: new Date(),
              content: '# Payment Integration\n\nIntegrate payment processing.'
            }
          ]]
        ]),
        reference: new Map([
          ['api', [
            {
              path: 'docs/reference/api/endpoints.md',
              name: 'endpoints.md',
              size: 1500,
              lastModified: new Date(),
              content: '# API Endpoints\n\nComplete API reference.'
            }
          ]]
        ]),
        explanation: new Map([
          ['architecture', [
            {
              path: 'docs/explanation/architecture/overview.md',
              name: 'overview.md',
              size: 2000,
              lastModified: new Date(),
              content: '# Architecture Overview\n\nSystem architecture explained.'
            }
          ]]
        ]),
        project: [
          {
            path: 'docs/project/status.md',
            name: 'status.md',
            size: 500,
            lastModified: new Date(),
            content: '# Project Status\n\nCurrent project status.'
          }
        ]
      }

      const readme = generator.generateRootReadme(structure)

      // Verify all required sections exist
      expect(readme).toContain('# 📚 Documentation')
      expect(readme).toContain('## 🚀 Quick Start')
      expect(readme).toContain('## 🧭 Find What You Need')
      expect(readme).toContain('### 📖 I want to learn')
      expect(readme).toContain('### 🔧 I want to solve a problem')
      expect(readme).toContain('### 📋 I need to look something up')
      expect(readme).toContain('### 💡 I want to understand')
      expect(readme).toContain('## ⚡ Common Tasks')
      expect(readme).toContain('## 📊 Project Information')

      // Verify navigation by user need
      expect(readme).toContain('Getting Started')
      expect(readme).toContain('Authentication')
      expect(readme).toContain('Checkout')
      expect(readme).toContain('Api')
      expect(readme).toContain('Architecture')

      // Verify AI assistant reference
      expect(readme).toContain('For AI Assistants')
      expect(readme).toContain('AGENTS.md')

      console.log('\n✅ README Generation: All required sections present')
    })
  })

  describe('Index Page Generation', () => {
    it('should generate index pages with proper structure', () => {
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

      // Verify structure
      expect(index).toContain('# 📖 Tutorial')
      expect(index).toContain('Step-by-step lessons')
      expect(index).toContain('[← Back to Documentation Home](../README.md)')

      // Verify files are listed
      expect(index).toContain('Getting Started')
      expect(index).toContain('Your First Feature')
      expect(index).toContain('./tutorials/getting-started.md')

      console.log('\n✅ Index Page Generation: Proper structure and file listings')
    })

    it('should generate index pages for all categories with correct emojis', () => {
      const categories = ['tutorial', 'how-to', 'reference', 'explanation', 'project', 'archive'] as const

      for (const category of categories) {
        const index = generator.generateCategoryIndex(category, [])

        // Verify emoji is present
        const emojiMap = {
          'tutorial': '📖',
          'how-to': '🔧',
          'reference': '📋',
          'explanation': '💡',
          'project': '📊',
          'archive': '📦'
        }

        expect(index).toContain(emojiMap[category])
      }

      console.log('\n✅ Category Emojis: All categories have correct visual hierarchy')
    })
  })

  describe('Breadcrumb Navigation', () => {
    it('should generate consistent breadcrumbs for nested files', () => {
      const testPaths = [
        'docs/tutorials/getting-started.md',
        'docs/how-to/authentication/setup.md',
        'docs/reference/api/endpoints.md',
        'docs/explanation/architecture/overview.md'
      ]

      for (const filePath of testPaths) {
        const breadcrumbs = generator.generateBreadcrumbs(filePath)

        // Verify breadcrumbs contain required elements
        expect(breadcrumbs).toContain('📚 Documentation')
        expect(breadcrumbs).toContain('>')

        // Verify breadcrumbs have links (except last item)
        const parts = breadcrumbs.split(' > ')
        expect(parts.length).toBeGreaterThan(1)
        expect(parts[0]).toContain('[')
        expect(parts[0]).toContain(']')

        // Last part should not be a link
        const lastPart = parts[parts.length - 1]
        expect(lastPart).not.toMatch(/\[.*\]\(.*\)/)
      }

      console.log('\n✅ Breadcrumb Navigation: Consistent and accurate for all paths')
    })
  })

  describe('See Also Sections', () => {
    it('should generate "See Also" sections with related files', () => {
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

      // Verify section exists
      expect(seeAlso).toContain('## See Also')

      // Verify all related files are listed
      expect(seeAlso).toContain('Your First Feature')
      expect(seeAlso).toContain('Setup Authentication')

      // Verify links are present
      expect(seeAlso).toContain('[')
      expect(seeAlso).toContain(']')
      expect(seeAlso).toContain('(')

      console.log('\n✅ See Also Sections: Related documentation properly linked')
    })

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

      console.log('\n✅ See Also Sections: Handles empty related files correctly')
    })
  })

  describe('Content Organization', () => {
    it('should correctly categorize how-to files by feature', () => {
      const testCases = [
        { content: 'authentication setup guide', expected: 'authentication' },
        { content: 'checkout payment integration', expected: 'checkout' },
        { content: 'deployment to production', expected: 'deployment' },
        { content: 'random widgets and gadgets', expected: 'general' }
      ]

      for (const testCase of testCases) {
        const file: FileInfo = {
          path: 'docs/how-to/guide.md',
          name: 'guide.md',
          size: 100,
          lastModified: new Date(),
          content: testCase.content
        }

        // Access private method through type assertion for testing
        const feature = (organizer as any).determineFeatureArea(file)
        expect(feature).toBe(testCase.expected)
      }

      console.log('\n✅ How-To Organization: Files correctly categorized by feature')
    })

    it('should correctly categorize reference files by domain', () => {
      const testCases = [
        { content: 'API endpoints reference', expected: 'api' },
        { content: 'architecture design patterns', expected: 'architecture' },
        { content: 'configuration settings', expected: 'configuration' },
        { content: 'Vue component documentation', expected: 'components' },
        { content: 'general reference', expected: 'general' }
      ]

      for (const testCase of testCases) {
        const file: FileInfo = {
          path: 'docs/reference/guide.md',
          name: 'guide.md',
          size: 100,
          lastModified: new Date(),
          content: testCase.content
        }

        // Access private method through type assertion for testing
        const domain = (organizer as any).determineDomain(file)
        expect(domain).toBe(testCase.expected)
      }

      console.log('\n✅ Reference Organization: Files correctly categorized by domain')
    })
  })

  describe('Visual Hierarchy', () => {
    it('should include emojis in all generated content', () => {
      const structure: DocumentationStructure = {
        tutorials: [],
        howTo: new Map(),
        reference: new Map(),
        explanation: new Map(),
        project: []
      }

      const readme = generator.generateRootReadme(structure)
      const index = generator.generateCategoryIndex('tutorial', [])

      // Check for emoji presence
      const emojiRegex = /[\u{1F300}-\u{1F9FF}]/u

      expect(emojiRegex.test(readme)).toBe(true)
      expect(emojiRegex.test(index)).toBe(true)

      console.log('\n✅ Visual Hierarchy: Emojis present in all generated content')
    })

    it('should use proper markdown formatting', () => {
      const structure: DocumentationStructure = {
        tutorials: [],
        howTo: new Map(),
        reference: new Map(),
        explanation: new Map(),
        project: []
      }

      const readme = generator.generateRootReadme(structure)

      // Check for proper markdown elements
      expect(readme).toMatch(/^# /m) // Headings
      expect(readme).toContain('\n\n') // Paragraph breaks
      expect(readme).toContain('[') // Links
      expect(readme).toContain('](') // Link syntax

      console.log('\n✅ Visual Hierarchy: Proper markdown formatting throughout')
    })
  })

  describe('Quick Reference Cards', () => {
    it('should generate quick reference cards with all elements', () => {
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

      // Verify structure
      expect(quickRef).toContain('# ⚡ Quick Reference: Common Commands')
      expect(quickRef).toContain('## Run Tests')
      expect(quickRef).toContain('Execute the test suite')
      expect(quickRef).toContain('```')
      expect(quickRef).toContain('npm test')
      expect(quickRef).toContain('[Learn more]')

      console.log('\n✅ Quick Reference Cards: Complete with code and links')
    })
  })
})
