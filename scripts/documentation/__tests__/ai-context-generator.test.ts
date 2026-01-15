/**
 * Tests for AI Context Generator
 */

import { describe, it, expect } from 'vitest'
import { AIContextGenerator } from '../ai-context-generator'
import type { LlmsTxtConfig, AgentsMdConfig, CursorRulesConfig } from '../types'

describe('AIContextGenerator', () => {
  const generator = new AIContextGenerator()

  describe('generateLlmsTxt', () => {
    it('should generate llms.txt with project overview', () => {
      const config: LlmsTxtConfig = {
        projectName: 'Test Project',
        projectDescription: 'A test e-commerce platform',
        stack: ['Nuxt 4', 'Vue 3', 'TypeScript'],
        coreDocLinks: [],
        conventions: [],
        keyConcepts: [],
      }

      const result = generator.generateLlmsTxt(config)

      expect(result).toContain('# Test Project')
      expect(result).toContain('A test e-commerce platform')
      expect(result).toContain('## Technical Stack')
      expect(result).toContain('- Nuxt 4')
      expect(result).toContain('- Vue 3')
      expect(result).toContain('- TypeScript')
    })

    it('should include core documentation links', () => {
      const config: LlmsTxtConfig = {
        projectName: 'Test Project',
        projectDescription: 'A test platform',
        stack: [],
        coreDocLinks: [
          { title: 'Getting Started', path: 'docs/tutorials/getting-started.md' },
          { title: 'API Reference', path: 'docs/reference/api.md' },
        ],
        conventions: [],
        keyConcepts: [],
      }

      const result = generator.generateLlmsTxt(config)

      expect(result).toContain('## Core Documentation')
      expect(result).toContain('[Getting Started](docs/tutorials/getting-started.md)')
      expect(result).toContain('[API Reference](docs/reference/api.md)')
    })

    it('should include code conventions', () => {
      const config: LlmsTxtConfig = {
        projectName: 'Test Project',
        projectDescription: 'A test platform',
        stack: [],
        coreDocLinks: [],
        conventions: [
          'Use kebab-case for file names',
          'Use PascalCase for component names',
          'Use camelCase for composables',
        ],
        keyConcepts: [],
      }

      const result = generator.generateLlmsTxt(config)

      expect(result).toContain('## Code Conventions')
      expect(result).toContain('- Use kebab-case for file names')
      expect(result).toContain('- Use PascalCase for component names')
      expect(result).toContain('- Use camelCase for composables')
    })

    it('should include key concepts', () => {
      const config: LlmsTxtConfig = {
        projectName: 'Test Project',
        projectDescription: 'A test platform',
        stack: [],
        coreDocLinks: [],
        conventions: [],
        keyConcepts: [
          'Server-side price verification',
          'CSRF protection',
          'Property-based testing',
        ],
      }

      const result = generator.generateLlmsTxt(config)

      expect(result).toContain('## Key Concepts')
      expect(result).toContain('- Server-side price verification')
      expect(result).toContain('- CSRF protection')
      expect(result).toContain('- Property-based testing')
    })

    it('should validate link format', () => {
      const config: LlmsTxtConfig = {
        projectName: 'Test Project',
        projectDescription: 'A test platform',
        stack: [],
        coreDocLinks: [
          { title: 'Guide', path: 'docs/guide.md' },
        ],
        conventions: [],
        keyConcepts: [],
      }

      const result = generator.generateLlmsTxt(config)

      // Check that links are in markdown format
      expect(result).toMatch(/\[Guide\]\(docs\/guide\.md\)/)
    })

    it('should handle empty configuration gracefully', () => {
      const config: LlmsTxtConfig = {
        projectName: 'Minimal Project',
        projectDescription: 'Minimal description',
        stack: [],
        coreDocLinks: [],
        conventions: [],
        keyConcepts: [],
      }

      const result = generator.generateLlmsTxt(config)

      expect(result).toContain('# Minimal Project')
      expect(result).toContain('Minimal description')
      // Should not contain empty sections
      expect(result).not.toContain('## Technical Stack\n\n## ')
    })
  })

  describe('generateAgentsMd', () => {
    it('should generate AGENTS.md with project identity', () => {
      const config: AgentsMdConfig = {
        projectIdentity: {
          name: 'Moldova Direct',
          type: 'E-commerce Platform',
          domain: 'Wine & Spirits',
          targetMarket: 'US Market',
        },
        technicalStack: {
          frontend: {},
          backend: {},
          infrastructure: {},
        },
        architecturePatterns: [],
        securityRules: [],
        codeConventions: [],
        commonTasks: [],
        knownIssues: [],
      }

      const result = generator.generateAgentsMd(config)

      expect(result).toContain('# AI Agent Documentation')
      expect(result).toContain('## Project Identity')
      expect(result).toContain('**Name:** Moldova Direct')
      expect(result).toContain('**Type:** E-commerce Platform')
      expect(result).toContain('**Domain:** Wine & Spirits')
      expect(result).toContain('**Target Market:** US Market')
    })

    it('should include technical stack sections', () => {
      const config: AgentsMdConfig = {
        projectIdentity: {
          name: 'Test',
          type: 'Platform',
          domain: 'Test',
          targetMarket: 'Test',
        },
        technicalStack: {
          frontend: {
            Framework: 'Nuxt 4',
            'UI Library': 'Vue 3',
            Language: 'TypeScript',
          },
          backend: {
            Runtime: 'Node.js',
            Database: 'Supabase',
          },
          infrastructure: {
            Hosting: 'Vercel',
            CDN: 'Cloudflare',
          },
        },
        architecturePatterns: [],
        securityRules: [],
        codeConventions: [],
        commonTasks: [],
        knownIssues: [],
      }

      const result = generator.generateAgentsMd(config)

      expect(result).toContain('### Frontend')
      expect(result).toContain('**Framework:** Nuxt 4')
      expect(result).toContain('### Backend')
      expect(result).toContain('**Runtime:** Node.js')
      expect(result).toContain('### Infrastructure')
      expect(result).toContain('**Hosting:** Vercel')
    })
  })

  describe('generateCursorRules', () => {
    it('should generate .cursorrules with project context', () => {
      const config: CursorRulesConfig = {
        projectContext: 'Moldova Direct is an e-commerce platform for wine and spirits',
        codeStyle: [],
        criticalRules: [],
        filePatterns: {},
        componentCreationGuidelines: [],
        apiRouteGuidelines: [],
        testingRequirements: [],
      }

      const result = generator.generateCursorRules(config)

      expect(result).toContain('# Project Context')
      expect(result).toContain('Moldova Direct is an e-commerce platform')
    })

    it('should include code style rules', () => {
      const config: CursorRulesConfig = {
        projectContext: 'Test project',
        codeStyle: [
          'Use TypeScript strict mode',
          'Prefer composition API over options API',
          'Use explicit return types',
        ],
        criticalRules: [],
        filePatterns: {},
        componentCreationGuidelines: [],
        apiRouteGuidelines: [],
        testingRequirements: [],
      }

      const result = generator.generateCursorRules(config)

      expect(result).toContain('## Code Style')
      expect(result).toContain('- Use TypeScript strict mode')
      expect(result).toContain('- Prefer composition API over options API')
    })

    it('should include critical rules', () => {
      const config: CursorRulesConfig = {
        projectContext: 'Test project',
        codeStyle: [],
        criticalRules: [
          'Never trust client-sent prices',
          'Always validate CSRF tokens',
          'Always use server-side price verification',
        ],
        filePatterns: {},
        componentCreationGuidelines: [],
        apiRouteGuidelines: [],
        testingRequirements: [],
      }

      const result = generator.generateCursorRules(config)

      expect(result).toContain('## Critical Rules')
      expect(result).toContain('- Never trust client-sent prices')
      expect(result).toContain('- Always validate CSRF tokens')
    })

    it('should include file patterns', () => {
      const config: CursorRulesConfig = {
        projectContext: 'Test project',
        codeStyle: [],
        criticalRules: [],
        filePatterns: {
          '*.vue': 'Vue 3 components with Composition API',
          'server/api/*.ts': 'API routes with CSRF validation',
          'composables/*.ts': 'Reusable business logic',
        },
        componentCreationGuidelines: [],
        apiRouteGuidelines: [],
        testingRequirements: [],
      }

      const result = generator.generateCursorRules(config)

      expect(result).toContain('## File Patterns')
      expect(result).toContain('***.vue:** Vue 3 components with Composition API')
      expect(result).toContain('**server/api/*.ts:** API routes with CSRF validation')
    })

    it('should include component creation guidelines', () => {
      const config: CursorRulesConfig = {
        projectContext: 'Test project',
        codeStyle: [],
        criticalRules: [],
        filePatterns: {},
        componentCreationGuidelines: [
          'Use script setup with TypeScript',
          'Define props with defineProps<T>()',
          'Use explicit return types for computed properties',
        ],
        apiRouteGuidelines: [],
        testingRequirements: [],
      }

      const result = generator.generateCursorRules(config)

      expect(result).toContain('## Component Creation Guidelines')
      expect(result).toContain('- Use script setup with TypeScript')
      expect(result).toContain('- Define props with defineProps<T>()')
    })

    it('should include API route guidelines', () => {
      const config: CursorRulesConfig = {
        projectContext: 'Test project',
        codeStyle: [],
        criticalRules: [],
        filePatterns: {},
        componentCreationGuidelines: [],
        apiRouteGuidelines: [
          'Always validate CSRF tokens first',
          'Authenticate user before processing',
          'Verify prices server-side',
          'Use atomic RPC functions for inventory',
        ],
        testingRequirements: [],
      }

      const result = generator.generateCursorRules(config)

      expect(result).toContain('## API Route Guidelines')
      expect(result).toContain('- Always validate CSRF tokens first')
      expect(result).toContain('- Verify prices server-side')
    })

    it('should include testing requirements', () => {
      const config: CursorRulesConfig = {
        projectContext: 'Test project',
        codeStyle: [],
        criticalRules: [],
        filePatterns: {},
        componentCreationGuidelines: [],
        apiRouteGuidelines: [],
        testingRequirements: [
          'Write property-based tests with fast-check',
          'Minimum 100 iterations per property test',
          'Add data-testid to interactive elements',
          'Test security rules with both valid and invalid inputs',
        ],
      }

      const result = generator.generateCursorRules(config)

      expect(result).toContain('## Testing Requirements')
      expect(result).toContain('- Write property-based tests with fast-check')
      expect(result).toContain('- Minimum 100 iterations per property test')
    })

    it('should handle complete configuration', () => {
      const config: CursorRulesConfig = {
        projectContext: 'Moldova Direct e-commerce platform',
        codeStyle: ['Use TypeScript strict mode', 'Prefer Composition API'],
        criticalRules: ['Never trust client prices', 'Always validate CSRF'],
        filePatterns: {
          '*.vue': 'Vue components',
          'server/api/*.ts': 'API routes',
        },
        componentCreationGuidelines: ['Use script setup'],
        apiRouteGuidelines: ['Validate CSRF first'],
        testingRequirements: ['Write property tests'],
      }

      const result = generator.generateCursorRules(config)

      expect(result).toContain('# Project Context')
      expect(result).toContain('## Code Style')
      expect(result).toContain('## Critical Rules')
      expect(result).toContain('## File Patterns')
      expect(result).toContain('## Component Creation Guidelines')
      expect(result).toContain('## API Route Guidelines')
      expect(result).toContain('## Testing Requirements')
    })
  })

  describe('Security Rules Documentation', () => {
    it('should include NEVER and ALWAYS security rules with code examples', () => {
      const config: AgentsMdConfig = {
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
        securityRules: [
          {
            type: 'never',
            rule: 'Trust client-sent prices',
            explanation: 'Client-sent prices can be manipulated by attackers',
            codeExample: '// WRONG: Using client price directly\nconst price = req.body.price',
          },
          {
            type: 'always',
            rule: 'Verify prices server-side',
            explanation: 'Always fetch prices from the database',
            codeExample: '// CORRECT: Fetch price from database\nconst price = await db.getProductPrice(productId)',
          },
        ],
        codeConventions: [],
        commonTasks: [],
        knownIssues: [],
      }

      const result = generator.generateAgentsMd(config)

      expect(result).toContain('## Security Rules')
      expect(result).toContain('⚠️ **CRITICAL:**')
      expect(result).toContain('### NEVER Do This')
      expect(result).toContain('#### Trust client-sent prices')
      expect(result).toContain('Client-sent prices can be manipulated')
      expect(result).toContain('```typescript')
      expect(result).toContain('// WRONG: Using client price directly')
      expect(result).toContain('### ALWAYS Do This')
      expect(result).toContain('#### Verify prices server-side')
      expect(result).toContain('// CORRECT: Fetch price from database')
    })

    it('should document all critical security requirements', () => {
      const config: AgentsMdConfig = {
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
        securityRules: [
          {
            type: 'never',
            rule: 'Trust client-sent prices',
            explanation: 'Prices must be verified server-side',
            codeExample: 'const price = req.body.price // WRONG',
          },
          {
            type: 'never',
            rule: 'Skip CSRF validation',
            explanation: 'All state-changing operations require CSRF tokens',
            codeExample: 'await updateData(req.body) // WRONG - no CSRF check',
          },
          {
            type: 'never',
            rule: 'Expose service keys in code',
            explanation: 'Service keys must be in environment variables',
            codeExample: 'const apiKey = "sk_live_123" // WRONG',
          },
          {
            type: 'always',
            rule: 'Validate CSRF tokens',
            explanation: 'Use CSRF middleware for all mutations',
            codeExample: 'await validateCsrfToken(req) // CORRECT',
          },
          {
            type: 'always',
            rule: 'Use atomic RPC functions for inventory',
            explanation: 'Prevent race conditions in inventory updates',
            codeExample: 'await supabase.rpc("decrement_inventory", { id }) // CORRECT',
          },
          {
            type: 'always',
            rule: 'Validate request origin',
            explanation: 'Check origin header for all requests',
            codeExample: 'if (req.headers.origin !== allowedOrigin) throw error // CORRECT',
          },
          {
            type: 'always',
            rule: 'Add data-testid to interactive elements',
            explanation: 'Required for E2E testing',
            codeExample: '<button data-testid="submit-btn">Submit</button> // CORRECT',
          },
        ],
        codeConventions: [],
        commonTasks: [],
        knownIssues: [],
      }

      const result = generator.generateAgentsMd(config)

      // Verify all NEVER rules are present
      expect(result).toContain('Trust client-sent prices')
      expect(result).toContain('Skip CSRF validation')
      expect(result).toContain('Expose service keys in code')

      // Verify all ALWAYS rules are present
      expect(result).toContain('Validate CSRF tokens')
      expect(result).toContain('Use atomic RPC functions for inventory')
      expect(result).toContain('Validate request origin')
      expect(result).toContain('Add data-testid to interactive elements')
    })
  })

  describe('Code Pattern Documentation', () => {
    it('should include Vue 3 component patterns with complete examples', () => {
      const config: AgentsMdConfig = {
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
        architecturePatterns: [
          {
            name: 'Vue 3 Component Pattern',
            description: 'Use Composition API with script setup',
            codeExample: `<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
const increment = () => count.value++
</script>

<template>
  <button @click="increment">{{ count }}</button>
</template>`,
            rationale: 'Composition API provides better TypeScript support and code organization',
          },
        ],
        securityRules: [],
        codeConventions: [],
        commonTasks: [],
        knownIssues: [],
      }

      const result = generator.generateAgentsMd(config)

      expect(result).toContain('## Architecture Patterns')
      expect(result).toContain('### Vue 3 Component Pattern')
      expect(result).toContain('Use Composition API with script setup')
      expect(result).toContain('<script setup lang="ts">')
      expect(result).toContain('**Rationale:**')
    })

    it('should include API route patterns with security examples', () => {
      const config: AgentsMdConfig = {
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
        architecturePatterns: [
          {
            name: 'API Route Pattern',
            description: 'Secure API route with CSRF validation and price verification',
            codeExample: `export default defineEventHandler(async (event) => {
  // 1. Validate CSRF token
  await validateCsrfToken(event)
  
  // 2. Authenticate user
  const user = await requireAuth(event)
  
  // 3. Validate input
  const body = await readBody(event)
  
  // 4. Verify price server-side
  const product = await db.getProduct(body.productId)
  if (product.price !== body.price) {
    throw createError({ statusCode: 400, message: 'Invalid price' })
  }
  
  // 5. Process request
  return await processOrder(user, product)
})`,
            rationale: 'Ensures security at every layer',
          },
        ],
        securityRules: [],
        codeConventions: [],
        commonTasks: [],
        knownIssues: [],
      }

      const result = generator.generateAgentsMd(config)

      expect(result).toContain('### API Route Pattern')
      expect(result).toContain('validateCsrfToken')
      expect(result).toContain('requireAuth')
      expect(result).toContain('Verify price server-side')
    })

    it('should include composable patterns', () => {
      const config: AgentsMdConfig = {
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
        architecturePatterns: [
          {
            name: 'Composable Pattern',
            description: 'Reusable business logic with TypeScript',
            codeExample: `export function useCart() {
  const items = ref<CartItem[]>([])
  
  const addItem = (item: CartItem) => {
    items.value.push(item)
  }
  
  const total = computed(() => 
    items.value.reduce((sum, item) => sum + item.price, 0)
  )
  
  return { items, addItem, total }
}`,
            rationale: 'Encapsulates business logic for reuse',
          },
        ],
        securityRules: [],
        codeConventions: [],
        commonTasks: [],
        knownIssues: [],
      }

      const result = generator.generateAgentsMd(config)

      expect(result).toContain('### Composable Pattern')
      expect(result).toContain('export function useCart()')
      expect(result).toContain('CartItem[]')
    })

    it('should include testing patterns', () => {
      const config: AgentsMdConfig = {
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
        architecturePatterns: [
          {
            name: 'Property-Based Testing Pattern',
            description: 'Test universal properties with fast-check',
            codeExample: `import fc from 'fast-check'

it('should preserve content during migration', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.string({ minLength: 1 }),
      async (content) => {
        const result = await migrateFile(content)
        expect(result).toBe(content)
      }
    ),
    { numRuns: 100 }
  )
})`,
            rationale: 'Property tests validate behavior across all inputs',
          },
        ],
        securityRules: [],
        codeConventions: [],
        commonTasks: [],
        knownIssues: [],
      }

      const result = generator.generateAgentsMd(config)

      expect(result).toContain('### Property-Based Testing Pattern')
      expect(result).toContain('fast-check')
      expect(result).toContain('numRuns: 100')
    })
  })

  describe('File Organization Documentation', () => {
    it('should include directory tree examples', () => {
      const config: AgentsMdConfig = {
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
        codeConventions: [
          {
            category: 'organization',
            convention: 'Components directory structure',
            example: `components/
  admin/
    Products/
      ProductList.vue
      ProductForm.vue
  cart/
    Item.vue
  common/
    Icon.vue`,
          },
        ],
        commonTasks: [],
        knownIssues: [],
      }

      const result = generator.generateAgentsMd(config)

      expect(result).toContain('## Code Conventions')
      expect(result).toContain('### Organization')
      expect(result).toContain('Components directory structure')
      expect(result).toContain('components/')
      expect(result).toContain('admin/')
    })

    it('should document naming conventions', () => {
      const config: AgentsMdConfig = {
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
        codeConventions: [
          {
            category: 'naming',
            convention: 'Use kebab-case for file names',
            example: 'product-list.vue',
          },
          {
            category: 'naming',
            convention: 'Use PascalCase for component names',
            example: 'ProductList',
          },
          {
            category: 'naming',
            convention: 'Use camelCase for composables',
            example: 'useProductFilters',
          },
        ],
        commonTasks: [],
        knownIssues: [],
      }

      const result = generator.generateAgentsMd(config)

      expect(result).toContain('### Naming')
      expect(result).toContain('kebab-case for file names')
      expect(result).toContain('PascalCase for component names')
      expect(result).toContain('camelCase for composables')
    })
  })

  describe('Common Tasks and Known Issues', () => {
    it('should document common development tasks', () => {
      const config: AgentsMdConfig = {
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
        codeConventions: [],
        commonTasks: [
          {
            task: 'Create a new API route',
            steps: [
              'Create file in server/api/',
              'Add CSRF validation',
              'Add authentication',
              'Implement business logic',
              'Add tests',
            ],
            codeExample: `export default defineEventHandler(async (event) => {
  await validateCsrfToken(event)
  const user = await requireAuth(event)
  // Business logic here
})`,
          },
        ],
        knownIssues: [],
      }

      const result = generator.generateAgentsMd(config)

      expect(result).toContain('## Common Tasks')
      expect(result).toContain('### Create a new API route')
      expect(result).toContain('1. Create file in server/api/')
      expect(result).toContain('2. Add CSRF validation')
      expect(result).toContain('validateCsrfToken')
    })

    it('should document known issues and workarounds', () => {
      const config: AgentsMdConfig = {
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
        codeConventions: [],
        commonTasks: [],
        knownIssues: [
          {
            issue: 'Supabase session refresh timing',
            workaround: 'Use manual refresh before critical operations',
            location: 'composables/useAuth.ts',
          },
        ],
      }

      const result = generator.generateAgentsMd(config)

      expect(result).toContain('## Known Issues and Workarounds')
      expect(result).toContain('### Supabase session refresh timing')
      expect(result).toContain('**Location:** composables/useAuth.ts')
      expect(result).toContain('**Workaround:** Use manual refresh')
    })
  })

  describe('AI Context Directory Generation', () => {
    describe('generateArchitectureSummary', () => {
      it('should generate architecture summary with system overview', () => {
        const result = generator.generateArchitectureSummary()

        expect(result).toContain('# Architecture Summary')
        expect(result).toContain('## System Overview')
        expect(result).toContain('Moldova Direct is a full-stack e-commerce platform')
        expect(result).toContain('**Frontend**: Nuxt 4 (Vue 3) with TypeScript')
        expect(result).toContain('**Backend**: Nuxt server routes with Supabase')
        expect(result).toContain('**Database**: PostgreSQL via Supabase')
        expect(result).toContain('**Payments**: Stripe integration')
        expect(result).toContain('**Hosting**: Vercel')
      })

      it('should include architecture layers', () => {
        const result = generator.generateArchitectureSummary()

        expect(result).toContain('## Architecture Layers')
        expect(result).toContain('### Presentation Layer')
        expect(result).toContain('Vue 3 components using Composition API')
        expect(result).toContain('### Application Layer')
        expect(result).toContain('Composables for business logic')
        expect(result).toContain('### API Layer')
        expect(result).toContain('Nuxt server routes in `server/api/`')
        expect(result).toContain('### Data Layer')
        expect(result).toContain('Supabase PostgreSQL database')
      })

      it('should include key design patterns', () => {
        const result = generator.generateArchitectureSummary()

        expect(result).toContain('## Key Design Patterns')
        expect(result).toContain('### Composition API Pattern')
        expect(result).toContain('### Composable Pattern')
        expect(result).toContain('### Server-Side Validation Pattern')
        expect(result).toContain('### Atomic Operations Pattern')
      })

      it('should include security architecture', () => {
        const result = generator.generateArchitectureSummary()

        expect(result).toContain('## Security Architecture')
        expect(result).toContain('### Defense in Depth')
        expect(result).toContain('### Critical Security Rules')
        expect(result).toContain('Never trust client-sent prices')
        expect(result).toContain('Always validate CSRF tokens')
      })

      it('should include data flow diagram', () => {
        const result = generator.generateArchitectureSummary()

        expect(result).toContain('## Data Flow')
        expect(result).toContain('### Typical Request Flow')
        expect(result).toContain('User Action → Component → Composable → API Route → Database')
      })

      it('should include testing strategy', () => {
        const result = generator.generateArchitectureSummary()

        expect(result).toContain('## Testing Strategy')
        expect(result).toContain('### Test Pyramid')
        expect(result).toContain('**E2E Tests**: Playwright')
        expect(result).toContain('**Property Tests**: fast-check')
        expect(result).toContain('### Test Coverage Goals')
      })
    })

    describe('generatePatterns', () => {
      it('should generate patterns documentation with all pattern types', () => {
        const result = generator.generatePatterns('/test/path')

        expect(result).toHaveProperty('vue3Patterns')
        expect(result).toHaveProperty('apiRoutePatterns')
        expect(result).toHaveProperty('composablePatterns')
        expect(result).toHaveProperty('testingPatterns')
      })

      it('should include Vue 3 component patterns', () => {
        const result = generator.generatePatterns('/test/path')

        expect(result.vue3Patterns).toHaveLength(1)
        expect(result.vue3Patterns[0].name).toBe('Vue 3 Component with Composition API')
        expect(result.vue3Patterns[0].codeExample).toContain('<script setup lang="ts">')
        expect(result.vue3Patterns[0].codeExample).toContain('defineProps')
        expect(result.vue3Patterns[0].codeExample).toContain('defineEmits')
        expect(result.vue3Patterns[0].rationale).toBeTruthy()
      })

      it('should include API route patterns with security', () => {
        const result = generator.generatePatterns('/test/path')

        expect(result.apiRoutePatterns).toHaveLength(1)
        expect(result.apiRoutePatterns[0].name).toBe('Secure API Route Pattern')
        expect(result.apiRoutePatterns[0].codeExample).toContain('validateCsrfToken')
        expect(result.apiRoutePatterns[0].codeExample).toContain('requireAuth')
        expect(result.apiRoutePatterns[0].codeExample).toContain('NEVER trust client')
        expect(result.apiRoutePatterns[0].codeExample).toContain('supabase.rpc')
      })

      it('should include composable patterns', () => {
        const result = generator.generatePatterns('/test/path')

        expect(result.composablePatterns).toHaveLength(1)
        expect(result.composablePatterns[0].name).toBe('Composable Pattern')
        expect(result.composablePatterns[0].codeExample).toContain('export function use')
        expect(result.composablePatterns[0].codeExample).toContain('ref<')
        expect(result.composablePatterns[0].codeExample).toContain('isLoading')
        expect(result.composablePatterns[0].codeExample).toContain('error')
      })

      it('should include testing patterns', () => {
        const result = generator.generatePatterns('/test/path')

        expect(result.testingPatterns).toHaveLength(2)
        
        // Property-based testing pattern
        const pbtPattern = result.testingPatterns.find(p => p.name === 'Property-Based Testing Pattern')
        expect(pbtPattern).toBeDefined()
        expect(pbtPattern?.codeExample).toContain('fast-check')
        expect(pbtPattern?.codeExample).toContain('fc.assert')
        expect(pbtPattern?.codeExample).toContain('numRuns: 100')

        // E2E testing pattern
        const e2ePattern = result.testingPatterns.find(p => p.name === 'E2E Testing Pattern')
        expect(e2ePattern).toBeDefined()
        expect(e2ePattern?.codeExample).toContain('playwright')
        expect(e2ePattern?.codeExample).toContain('getByTestId')
      })

      it('should include complete code examples', () => {
        const result = generator.generatePatterns('/test/path')

        // All patterns should have code examples
        result.vue3Patterns.forEach(pattern => {
          expect(pattern.codeExample).toBeTruthy()
          expect(pattern.codeExample.length).toBeGreaterThan(50)
        })

        result.apiRoutePatterns.forEach(pattern => {
          expect(pattern.codeExample).toBeTruthy()
          expect(pattern.codeExample.length).toBeGreaterThan(50)
        })

        result.composablePatterns.forEach(pattern => {
          expect(pattern.codeExample).toBeTruthy()
          expect(pattern.codeExample.length).toBeGreaterThan(50)
        })

        result.testingPatterns.forEach(pattern => {
          expect(pattern.codeExample).toBeTruthy()
          expect(pattern.codeExample.length).toBeGreaterThan(50)
        })
      })

      it('should include rationale for all patterns', () => {
        const result = generator.generatePatterns('/test/path')

        result.vue3Patterns.forEach(pattern => {
          expect(pattern.rationale).toBeTruthy()
        })

        result.apiRoutePatterns.forEach(pattern => {
          expect(pattern.rationale).toBeTruthy()
        })

        result.composablePatterns.forEach(pattern => {
          expect(pattern.rationale).toBeTruthy()
        })

        result.testingPatterns.forEach(pattern => {
          expect(pattern.rationale).toBeTruthy()
        })
      })
    })

    describe('generateDependencies', () => {
      it('should generate dependencies documentation from package.json', () => {
        const packageJson = {
          dependencies: {
            'nuxt': '^4.0.0',
            'vue': '^3.5.0',
            '@pinia/nuxt': '^0.11.0',
          },
          devDependencies: {
            'vitest': '^3.0.0',
            'playwright': '^1.50.0',
            'fast-check': '^4.0.0',
          },
        }

        const result = generator.generateDependencies(packageJson)

        expect(result).toHaveProperty('critical')
        expect(result).toHaveProperty('development')
        expect(result).toHaveProperty('dependencyGraph')
      })

      it('should categorize dependencies correctly', () => {
        const packageJson = {
          dependencies: {
            'nuxt': '^4.0.0',
            'vue': '^3.5.0',
          },
          devDependencies: {
            'vitest': '^3.0.0',
            'playwright': '^1.50.0',
          },
        }

        const result = generator.generateDependencies(packageJson)

        expect(result.critical).toHaveLength(2)
        expect(result.development).toHaveLength(2)

        // Check critical dependencies
        const nuxtDep = result.critical.find(d => d.name === 'nuxt')
        expect(nuxtDep).toBeDefined()
        expect(nuxtDep?.version).toBe('^4.0.0')
        expect(nuxtDep?.purpose).toBeTruthy()

        // Check development dependencies
        const vitestDep = result.development.find(d => d.name === 'vitest')
        expect(vitestDep).toBeDefined()
        expect(vitestDep?.version).toBe('^3.0.0')
        expect(vitestDep?.purpose).toBeTruthy()
      })

      it('should provide purpose descriptions for common dependencies', () => {
        const packageJson = {
          dependencies: {
            'nuxt': '^4.0.0',
            'vue': '^3.5.0',
            '@stripe/stripe-js': '^8.0.0',
            'tailwindcss': '^4.0.0',
          },
          devDependencies: {},
        }

        const result = generator.generateDependencies(packageJson)

        const nuxt = result.critical.find(d => d.name === 'nuxt')
        expect(nuxt?.purpose).toContain('framework')

        const vue = result.critical.find(d => d.name === 'vue')
        expect(vue?.purpose).toContain('framework')

        const stripe = result.critical.find(d => d.name === '@stripe/stripe-js')
        expect(stripe?.purpose.toLowerCase()).toContain('payment')

        const tailwind = result.critical.find(d => d.name === 'tailwindcss')
        expect(tailwind?.purpose).toContain('CSS')
      })

      it('should generate dependency graph in Mermaid format', () => {
        const packageJson = {
          dependencies: {
            'nuxt': '^4.0.0',
            'vue': '^3.5.0',
          },
          devDependencies: {
            'vitest': '^3.0.0',
          },
        }

        const result = generator.generateDependencies(packageJson)

        expect(result.dependencyGraph).toContain('```mermaid')
        expect(result.dependencyGraph).toContain('graph TD')
        expect(result.dependencyGraph).toContain('Moldova Direct App')
        expect(result.dependencyGraph).toContain('Nuxt')
        expect(result.dependencyGraph).toContain('Vue')
        expect(result.dependencyGraph).toContain('```')
      })

      it('should handle empty package.json', () => {
        const packageJson = {}

        const result = generator.generateDependencies(packageJson)

        expect(result.critical).toHaveLength(0)
        expect(result.development).toHaveLength(0)
        expect(result.dependencyGraph).toBeTruthy()
      })

      it('should include testing stack in dependency graph', () => {
        const packageJson = {
          dependencies: {},
          devDependencies: {
            'playwright': '^1.50.0',
            'vitest': '^3.0.0',
            'fast-check': '^4.0.0',
          },
        }

        const result = generator.generateDependencies(packageJson)

        expect(result.dependencyGraph).toContain('Testing')
        expect(result.dependencyGraph).toContain('Playwright')
        expect(result.dependencyGraph).toContain('Vitest')
        expect(result.dependencyGraph).toContain('fast-check')
      })
    })

    describe('generateConventions', () => {
      it('should generate conventions documentation', () => {
        const result = generator.generateConventions('/test/path')

        expect(result).toHaveProperty('naming')
        expect(result).toHaveProperty('fileOrganization')
        expect(result).toHaveProperty('codeStyle')
      })

      it('should include naming conventions for all types', () => {
        const result = generator.generateConventions('/test/path')

        expect(result.naming).toHaveLength(5)

        const types = result.naming.map(n => n.type)
        expect(types).toContain('file')
        expect(types).toContain('component')
        expect(types).toContain('composable')
        expect(types).toContain('type')
        expect(types).toContain('constant')
      })

      it('should provide examples for naming conventions', () => {
        const result = generator.generateConventions('/test/path')

        result.naming.forEach(convention => {
          expect(convention.convention).toBeTruthy()
          expect(convention.example).toBeTruthy()
        })

        // Check specific conventions
        const fileConvention = result.naming.find(n => n.type === 'file')
        expect(fileConvention?.convention).toContain('kebab-case')
        expect(fileConvention?.example).toContain('.vue')

        const componentConvention = result.naming.find(n => n.type === 'component')
        expect(componentConvention?.convention).toContain('PascalCase')

        const composableConvention = result.naming.find(n => n.type === 'composable')
        expect(composableConvention?.convention).toContain('use')
      })

      it('should include file organization structure', () => {
        const result = generator.generateConventions('/test/path')

        expect(result.fileOrganization.structure).toBeTruthy()
        expect(result.fileOrganization.structure).toContain('components/')
        expect(result.fileOrganization.structure).toContain('composables/')
        expect(result.fileOrganization.structure).toContain('server/')
        expect(result.fileOrganization.structure).toContain('pages/')
        expect(result.fileOrganization.structure).toContain('stores/')
        expect(result.fileOrganization.structure).toContain('types/')
      })

      it('should include file organization rules', () => {
        const result = generator.generateConventions('/test/path')

        expect(result.fileOrganization.rules).toHaveLength(5)
        expect(result.fileOrganization.rules[0]).toContain('Group related components')
        expect(result.fileOrganization.rules[1]).toContain('composables')
        expect(result.fileOrganization.rules[2]).toContain('API routes')
      })

      it('should include code style rules', () => {
        const result = generator.generateConventions('/test/path')

        expect(result.codeStyle.length).toBeGreaterThan(0)

        result.codeStyle.forEach(rule => {
          expect(rule.rule).toBeTruthy()
          expect(rule.example).toBeTruthy()
        })

        // Check for specific rules
        const strictMode = result.codeStyle.find(r => r.rule.includes('strict'))
        expect(strictMode).toBeDefined()

        const compositionApi = result.codeStyle.find(r => r.rule.includes('Composition API'))
        expect(compositionApi).toBeDefined()

        const testId = result.codeStyle.find(r => r.rule.includes('data-testid'))
        expect(testId).toBeDefined()
      })

      it('should provide complete examples for code style rules', () => {
        const result = generator.generateConventions('/test/path')

        const asyncAwait = result.codeStyle.find(r => r.rule.includes('async/await'))
        expect(asyncAwait?.example).toContain('await')

        const constLet = result.codeStyle.find(r => r.rule.includes('const'))
        expect(constLet?.example).toContain('const')
        expect(constLet?.example).toContain('let')
      })
    })
  })
})
