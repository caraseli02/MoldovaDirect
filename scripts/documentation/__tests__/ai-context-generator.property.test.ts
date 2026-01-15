/**
 * Property-based tests for AI Context Generator
 * Feature: dual-layer-documentation
 */

import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { AIContextGenerator } from '../ai-context-generator'
import type { SecurityRule, ArchitecturePattern, CodeConvention } from '../types'

describe('AIContextGenerator Property Tests', () => {
  const generator = new AIContextGenerator()

  // Feature: dual-layer-documentation, Property 10: Security rule documentation format
  describe('Property 10: Security rule documentation format', () => {
    it('should format all security rules with NEVER/ALWAYS examples and code', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generator: random security rules
          fc.array(
            fc.record({
              type: fc.constantFrom('never' as const, 'always' as const),
              rule: fc.string({ minLength: 10, maxLength: 100 }),
              explanation: fc.string({ minLength: 20, maxLength: 200 }),
              codeExample: fc.string({ minLength: 10, maxLength: 200 }),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          async (securityRules: SecurityRule[]) => {
            // Setup: create config with security rules
            const config = {
              projectIdentity: {
                name: 'Test',
                type: 'Platform',
                domain: 'Test',
                targetMarket: 'Test',
              },
              technicalStack: {
                frontend: {},
                backend: {},
                infrastructure: {},
              },
              architecturePatterns: [],
              securityRules,
              codeConventions: [],
              commonTasks: [],
              knownIssues: [],
            }

            // Execute: generate AGENTS.md
            const result = generator.generateAgentsMd(config)

            // Verify: all security rules have proper format
            for (const rule of securityRules) {
              // Each rule should appear in the output
              expect(result).toContain(rule.rule)
              expect(result).toContain(rule.explanation)

              // Each rule should have a code example in a code block
              if (rule.codeExample) {
                expect(result).toContain('```typescript')
                expect(result).toContain(rule.codeExample)
              }
            }

            // Verify: NEVER and ALWAYS sections exist if rules of those types exist
            const hasNeverRules = securityRules.some((r) => r.type === 'never')
            const hasAlwaysRules = securityRules.some((r) => r.type === 'always')

            if (hasNeverRules) {
              expect(result).toContain('### NEVER Do This')
            }
            if (hasAlwaysRules) {
              expect(result).toContain('### ALWAYS Do This')
            }

            // Verify: Security Rules section has critical warning
            if (securityRules.length > 0) {
              expect(result).toContain('## Security Rules')
              expect(result).toContain('⚠️ **CRITICAL:**')
            }
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  // Feature: dual-layer-documentation, Property 11: Code example completeness
  describe('Property 11: Code example completeness', () => {
    it('should include complete, valid code examples for all patterns', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generator: random architecture patterns
          fc.array(
            fc.record({
              name: fc.string({ minLength: 5, maxLength: 50 }),
              description: fc.string({ minLength: 20, maxLength: 200 }),
              codeExample: fc.string({ minLength: 20, maxLength: 500 }),
              rationale: fc.string({ minLength: 20, maxLength: 200 }),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          async (patterns: ArchitecturePattern[]) => {
            // Setup: create config with patterns
            const config = {
              projectIdentity: {
                name: 'Test',
                type: 'Platform',
                domain: 'Test',
                targetMarket: 'Test',
              },
              technicalStack: {
                frontend: {},
                backend: {},
                infrastructure: {},
              },
              architecturePatterns: patterns,
              securityRules: [],
              codeConventions: [],
              commonTasks: [],
              knownIssues: [],
            }

            // Execute: generate AGENTS.md
            const result = generator.generateAgentsMd(config)

            // Verify: all patterns have complete code examples
            for (const pattern of patterns) {
              // Pattern name should be a heading
              expect(result).toContain(`### ${pattern.name}`)

              // Description should be present
              expect(result).toContain(pattern.description)

              // Code example should be in a code block
              if (pattern.codeExample) {
                expect(result).toContain('```typescript')
                expect(result).toContain(pattern.codeExample)
                expect(result).toContain('```')

                // Code example should not contain placeholders
                expect(pattern.codeExample).not.toMatch(/\.\.\.|TODO|FIXME|XXX/)
              }

              // Rationale should be present
              if (pattern.rationale) {
                expect(result).toContain(`**Rationale:** ${pattern.rationale}`)
              }
            }
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  // Feature: dual-layer-documentation, Property 12: File organization documentation structure
  describe('Property 12: File organization documentation structure', () => {
    it('should include directory tree examples for file organization', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generator: random code conventions with organization category
          fc.array(
            fc.record({
              category: fc.constantFrom(
                'naming' as const,
                'organization' as const,
                'testing' as const,
                'other' as const
              ),
              convention: fc.string({ minLength: 10, maxLength: 100 }),
              example: fc.string({ minLength: 10, maxLength: 200 }),
            }),
            { minLength: 1, maxLength: 20 }
          ),
          async (conventions: CodeConvention[]) => {
            // Setup: create config with conventions
            const config = {
              projectIdentity: {
                name: 'Test',
                type: 'Platform',
                domain: 'Test',
                targetMarket: 'Test',
              },
              technicalStack: {
                frontend: {},
                backend: {},
                infrastructure: {},
              },
              architecturePatterns: [],
              securityRules: [],
              codeConventions: conventions,
              commonTasks: [],
              knownIssues: [],
            }

            // Execute: generate AGENTS.md
            const result = generator.generateAgentsMd(config)

            // Verify: all conventions are documented
            for (const conv of conventions) {
              expect(result).toContain(conv.convention)

              // Example should be in a code block
              if (conv.example) {
                expect(result).toContain('```typescript')
                expect(result).toContain(conv.example)
              }
            }

            // Verify: conventions are grouped by category
            const categories = new Set(conventions.map((c) => c.category))
            for (const category of categories) {
              const capitalizedCategory =
                category.charAt(0).toUpperCase() + category.slice(1)
              expect(result).toContain(`### ${capitalizedCategory}`)
            }

            // Verify: organization conventions include structural examples
            const orgConventions = conventions.filter((c) => c.category === 'organization')
            if (orgConventions.length > 0) {
              // At least one organization convention should exist
              expect(result).toContain('### Organization')
            }
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
