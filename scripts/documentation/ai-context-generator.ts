/**
 * AI Context Generator
 * Generates AI-friendly context files (llms.txt, AGENTS.md, .cursorrules)
 */

import type {
  LlmsTxtConfig,
  AgentsMdConfig,
  CursorRulesConfig,
  ArchitecturePattern,
  CodeConvention,
  PatternDoc,
  DependencyDoc,
  Dependency,
  ConventionDoc,
  NamingConvention,
  FileOrganization,
  CodeStyleRule,
} from './types'

export class AIContextGenerator {
  /**
   * Generate llms.txt file content
   * Creates a structured overview for AI assistants
   */
  generateLlmsTxt(config: LlmsTxtConfig): string {
    const sections: string[] = []

    // Project Overview Section
    sections.push('# ' + config.projectName)
    sections.push('')
    sections.push(config.projectDescription)
    sections.push('')

    // Technical Stack Section
    if (config.stack.length > 0) {
      sections.push('## Technical Stack')
      sections.push('')
      config.stack.forEach((tech) => {
        sections.push(`- ${tech}`)
      })
      sections.push('')
    }

    // Core Documentation Links Section
    if (config.coreDocLinks.length > 0) {
      sections.push('## Core Documentation')
      sections.push('')
      config.coreDocLinks.forEach((link) => {
        sections.push(`- [${link.title}](${link.path})`)
      })
      sections.push('')
    }

    // Code Conventions Summary Section
    if (config.conventions.length > 0) {
      sections.push('## Code Conventions')
      sections.push('')
      config.conventions.forEach((convention) => {
        sections.push(`- ${convention}`)
      })
      sections.push('')
    }

    // Key Concepts Section
    if (config.keyConcepts.length > 0) {
      sections.push('## Key Concepts')
      sections.push('')
      config.keyConcepts.forEach((concept) => {
        sections.push(`- ${concept}`)
      })
      sections.push('')
    }

    return sections.join('\n')
  }

  /**
   * Generate AGENTS.md file content
   * Creates comprehensive AI assistant documentation
   */
  generateAgentsMd(config: AgentsMdConfig): string {
    const sections: string[] = []

    // Header
    sections.push('# AI Agent Documentation')
    sections.push('')
    sections.push(
      'This document provides comprehensive context for AI assistants working on this project.'
    )
    sections.push('')

    // Project Identity Section
    sections.push('## Project Identity')
    sections.push('')
    sections.push(`**Name:** ${config.projectIdentity.name}`)
    sections.push(`**Type:** ${config.projectIdentity.type}`)
    sections.push(`**Domain:** ${config.projectIdentity.domain}`)
    sections.push(`**Target Market:** ${config.projectIdentity.targetMarket}`)
    sections.push('')

    // Technical Stack Section
    sections.push('## Technical Stack')
    sections.push('')

    if (Object.keys(config.technicalStack.frontend).length > 0) {
      sections.push('### Frontend')
      sections.push('')
      Object.entries(config.technicalStack.frontend).forEach(([key, value]) => {
        sections.push(`- **${key}:** ${value}`)
      })
      sections.push('')
    }

    if (Object.keys(config.technicalStack.backend).length > 0) {
      sections.push('### Backend')
      sections.push('')
      Object.entries(config.technicalStack.backend).forEach(([key, value]) => {
        sections.push(`- **${key}:** ${value}`)
      })
      sections.push('')
    }

    if (Object.keys(config.technicalStack.infrastructure).length > 0) {
      sections.push('### Infrastructure')
      sections.push('')
      Object.entries(config.technicalStack.infrastructure).forEach(([key, value]) => {
        sections.push(`- **${key}:** ${value}`)
      })
      sections.push('')
    }

    // Architecture Patterns Section
    if (config.architecturePatterns.length > 0) {
      sections.push('## Architecture Patterns')
      sections.push('')
      config.architecturePatterns.forEach((pattern) => {
        sections.push(`### ${pattern.name}`)
        sections.push('')
        sections.push(pattern.description)
        sections.push('')
        if (pattern.codeExample) {
          sections.push('```typescript')
          sections.push(pattern.codeExample)
          sections.push('```')
          sections.push('')
        }
        if (pattern.rationale) {
          sections.push(`**Rationale:** ${pattern.rationale}`)
          sections.push('')
        }
      })
    }

    // Security Rules Section
    if (config.securityRules.length > 0) {
      sections.push('## Security Rules')
      sections.push('')
      sections.push(
        '⚠️ **CRITICAL:** These security rules must be followed in all code generation.'
      )
      sections.push('')

      const neverRules = config.securityRules.filter((r) => r.type === 'never')
      const alwaysRules = config.securityRules.filter((r) => r.type === 'always')

      if (neverRules.length > 0) {
        sections.push('### NEVER Do This')
        sections.push('')
        neverRules.forEach((rule) => {
          sections.push(`#### ${rule.rule}`)
          sections.push('')
          sections.push(rule.explanation)
          sections.push('')
          if (rule.codeExample) {
            sections.push('```typescript')
            sections.push(rule.codeExample)
            sections.push('```')
            sections.push('')
          }
        })
      }

      if (alwaysRules.length > 0) {
        sections.push('### ALWAYS Do This')
        sections.push('')
        alwaysRules.forEach((rule) => {
          sections.push(`#### ${rule.rule}`)
          sections.push('')
          sections.push(rule.explanation)
          sections.push('')
          if (rule.codeExample) {
            sections.push('```typescript')
            sections.push(rule.codeExample)
            sections.push('```')
            sections.push('')
          }
        })
      }
    }

    // Code Conventions Section
    if (config.codeConventions.length > 0) {
      sections.push('## Code Conventions')
      sections.push('')

      const byCategory = new Map<string, CodeConvention[]>()
      config.codeConventions.forEach((conv) => {
        const category = conv.category
        if (!byCategory.has(category)) {
          byCategory.set(category, [])
        }
        byCategory.get(category)!.push(conv)
      })

      byCategory.forEach((conventions, category) => {
        sections.push(`### ${category.charAt(0).toUpperCase() + category.slice(1)}`)
        sections.push('')
        conventions.forEach((conv) => {
          sections.push(`- **${conv.convention}**`)
          if (conv.example) {
            sections.push(`  \`\`\`typescript`)
            sections.push(`  ${conv.example}`)
            sections.push(`  \`\`\``)
          }
          sections.push('')
        })
      })
    }

    // Common Tasks Section
    if (config.commonTasks.length > 0) {
      sections.push('## Common Tasks')
      sections.push('')
      config.commonTasks.forEach((task) => {
        sections.push(`### ${task.task}`)
        sections.push('')
        task.steps.forEach((step, index) => {
          sections.push(`${index + 1}. ${step}`)
        })
        sections.push('')
        if (task.codeExample) {
          sections.push('```typescript')
          sections.push(task.codeExample)
          sections.push('```')
          sections.push('')
        }
      })
    }

    // Known Issues Section
    if (config.knownIssues.length > 0) {
      sections.push('## Known Issues and Workarounds')
      sections.push('')
      config.knownIssues.forEach((issue) => {
        sections.push(`### ${issue.issue}`)
        sections.push('')
        sections.push(`**Location:** ${issue.location}`)
        sections.push('')
        sections.push(`**Workaround:** ${issue.workaround}`)
        sections.push('')
      })
    }

    return sections.join('\n')
  }

  /**
   * Generate .cursorrules file content
   * Creates Cursor AI-specific rules and patterns
   */
  generateCursorRules(config: CursorRulesConfig): string {
    const sections: string[] = []

    // Project Context
    sections.push('# Project Context')
    sections.push('')
    sections.push(config.projectContext)
    sections.push('')

    // Code Style
    if (config.codeStyle.length > 0) {
      sections.push('## Code Style')
      sections.push('')
      config.codeStyle.forEach((style) => {
        sections.push(`- ${style}`)
      })
      sections.push('')
    }

    // Critical Rules
    if (config.criticalRules.length > 0) {
      sections.push('## Critical Rules')
      sections.push('')
      config.criticalRules.forEach((rule) => {
        sections.push(`- ${rule}`)
      })
      sections.push('')
    }

    // File Patterns
    if (Object.keys(config.filePatterns).length > 0) {
      sections.push('## File Patterns')
      sections.push('')
      Object.entries(config.filePatterns).forEach(([pattern, description]) => {
        sections.push(`- **${pattern}:** ${description}`)
      })
      sections.push('')
    }

    // Component Creation Guidelines
    if (config.componentCreationGuidelines.length > 0) {
      sections.push('## Component Creation Guidelines')
      sections.push('')
      config.componentCreationGuidelines.forEach((guideline) => {
        sections.push(`- ${guideline}`)
      })
      sections.push('')
    }

    // API Route Guidelines
    if (config.apiRouteGuidelines.length > 0) {
      sections.push('## API Route Guidelines')
      sections.push('')
      config.apiRouteGuidelines.forEach((guideline) => {
        sections.push(`- ${guideline}`)
      })
      sections.push('')
    }

    // Testing Requirements
    if (config.testingRequirements.length > 0) {
      sections.push('## Testing Requirements')
      sections.push('')
      config.testingRequirements.forEach((requirement) => {
        sections.push(`- ${requirement}`)
      })
      sections.push('')
    }

    return sections.join('\n')
  }

  /**
   * Generate ARCHITECTURE_SUMMARY.md content
   * Creates high-level architecture overview for AI context
   */
  generateArchitectureSummary(): string {
    const sections: string[] = []

    // Header
    sections.push('# Architecture Summary')
    sections.push('')
    sections.push('High-level overview of the Moldova Direct e-commerce platform architecture.')
    sections.push('')

    // System Overview
    sections.push('## System Overview')
    sections.push('')
    sections.push('Moldova Direct is a full-stack e-commerce platform built with:')
    sections.push('')
    sections.push('- **Frontend**: Nuxt 4 (Vue 3) with TypeScript')
    sections.push('- **Backend**: Nuxt server routes with Supabase')
    sections.push('- **Database**: PostgreSQL via Supabase')
    sections.push('- **Payments**: Stripe integration')
    sections.push('- **Hosting**: Vercel')
    sections.push('')

    // Architecture Layers
    sections.push('## Architecture Layers')
    sections.push('')
    sections.push('### Presentation Layer')
    sections.push('')
    sections.push('- Vue 3 components using Composition API')
    sections.push('- Reka UI component library')
    sections.push('- Tailwind CSS for styling')
    sections.push('- Client-side routing with Vue Router')
    sections.push('- State management with Pinia')
    sections.push('')

    sections.push('### Application Layer')
    sections.push('')
    sections.push('- Composables for business logic')
    sections.push('- Stores for global state')
    sections.push('- Middleware for route protection')
    sections.push('- Plugins for initialization')
    sections.push('')

    sections.push('### API Layer')
    sections.push('')
    sections.push('- Nuxt server routes in `server/api/`')
    sections.push('- CSRF protection for all mutations')
    sections.push('- Authentication via Supabase')
    sections.push('- Server-side price verification')
    sections.push('- Stripe payment processing')
    sections.push('')

    sections.push('### Data Layer')
    sections.push('')
    sections.push('- Supabase PostgreSQL database')
    sections.push('- Row-level security (RLS) policies')
    sections.push('- Atomic RPC functions for inventory')
    sections.push('- Real-time subscriptions for admin features')
    sections.push('')

    // Key Design Patterns
    sections.push('## Key Design Patterns')
    sections.push('')
    sections.push('### Composition API Pattern')
    sections.push('')
    sections.push('All Vue components use `<script setup>` with TypeScript for better type safety and code organization.')
    sections.push('')

    sections.push('### Composable Pattern')
    sections.push('')
    sections.push('Business logic is extracted into reusable composables (e.g., `useCart`, `useAuth`, `useProductFilters`).')
    sections.push('')

    sections.push('### Server-Side Validation Pattern')
    sections.push('')
    sections.push('All critical operations (pricing, inventory, payments) are validated server-side to prevent client manipulation.')
    sections.push('')

    sections.push('### Atomic Operations Pattern')
    sections.push('')
    sections.push('Inventory updates use PostgreSQL RPC functions to prevent race conditions.')
    sections.push('')

    // Security Architecture
    sections.push('## Security Architecture')
    sections.push('')
    sections.push('### Defense in Depth')
    sections.push('')
    sections.push('1. **Client-side**: Input validation and UI feedback')
    sections.push('2. **API Layer**: CSRF tokens, authentication, authorization')
    sections.push('3. **Database Layer**: Row-level security policies')
    sections.push('4. **Payment Layer**: Server-side Stripe integration')
    sections.push('')

    sections.push('### Critical Security Rules')
    sections.push('')
    sections.push('- Never trust client-sent prices')
    sections.push('- Always validate CSRF tokens for mutations')
    sections.push('- Always verify prices server-side')
    sections.push('- Use atomic RPC functions for inventory')
    sections.push('- Never expose service keys in code')
    sections.push('')

    // Data Flow
    sections.push('## Data Flow')
    sections.push('')
    sections.push('### Typical Request Flow')
    sections.push('')
    sections.push('```')
    sections.push('User Action → Component → Composable → API Route → Database')
    sections.push('                                          ↓')
    sections.push('                                    CSRF Check')
    sections.push('                                    Auth Check')
    sections.push('                                    Validation')
    sections.push('                                    Price Verify')
    sections.push('```')
    sections.push('')

    // Testing Strategy
    sections.push('## Testing Strategy')
    sections.push('')
    sections.push('### Test Pyramid')
    sections.push('')
    sections.push('- **E2E Tests**: Playwright for critical user flows')
    sections.push('- **Integration Tests**: Vitest for API routes and composables')
    sections.push('- **Unit Tests**: Vitest for utilities and helpers')
    sections.push('- **Property Tests**: fast-check for universal properties (min 100 iterations)')
    sections.push('')

    sections.push('### Test Coverage Goals')
    sections.push('')
    sections.push('- Security-critical code: 100%')
    sections.push('- Business logic: 80%+')
    sections.push('- UI components: 60%+')
    sections.push('')

    return sections.join('\n')
  }

  /**
   * Generate PATTERNS.md content
   * Documents code patterns extracted from codebase
   */
  generatePatterns(_codebasePath: string): PatternDoc {
    // This is a simplified implementation that returns predefined patterns
    // In a full implementation, this would analyze the codebase
    
    const vue3Patterns: ArchitecturePattern[] = [
      {
        name: 'Vue 3 Component with Composition API',
        description: 'Standard component pattern using script setup and TypeScript',
        codeExample: `<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  title: string
  count?: number
}

const props = withDefaults(defineProps<Props>(), {
  count: 0
})

const emit = defineEmits<{
  update: [value: number]
}>()

const localCount = ref(props.count)

const doubleCount = computed(() => localCount.value * 2)

const increment = () => {
  localCount.value++
  emit('update', localCount.value)
}
</script>

<template>
  <div>
    <h2>{{ title }}</h2>
    <p>Count: {{ localCount }} (Double: {{ doubleCount }})</p>
    <button @click="increment" data-testid="increment-btn">
      Increment
    </button>
  </div>
</template>`,
        rationale: 'Provides type safety, better IDE support, and cleaner code organization',
      },
    ]

    const apiRoutePatterns: ArchitecturePattern[] = [
      {
        name: 'Secure API Route Pattern',
        description: 'API route with CSRF validation, authentication, and server-side verification',
        codeExample: `export default defineEventHandler(async (event) => {
  // 1. Validate CSRF token
  await validateCsrfToken(event)
  
  // 2. Authenticate user
  const user = await requireAuth(event)
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }
  
  // 3. Parse and validate input
  const body = await readBody(event)
  const validated = await validateInput(body)
  
  // 4. Verify price server-side (NEVER trust client)
  const product = await getProduct(validated.productId)
  if (product.price !== validated.price) {
    throw createError({
      statusCode: 400,
      message: 'Price mismatch'
    })
  }
  
  // 5. Process request with atomic operations
  const result = await supabase.rpc('process_order', {
    user_id: user.id,
    product_id: product.id,
    quantity: validated.quantity
  })
  
  return result
})`,
        rationale: 'Ensures security at every layer and prevents common vulnerabilities',
      },
    ]

    const composablePatterns: ArchitecturePattern[] = [
      {
        name: 'Composable Pattern',
        description: 'Reusable business logic with TypeScript and proper error handling',
        codeExample: `export function useProductFilters() {
  const filters = ref<ProductFilters>({
    category: null,
    priceRange: [0, 1000],
    inStock: true
  })

  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  const applyFilters = async (products: Product[]) => {
    isLoading.value = true
    error.value = null

    try {
      const filtered = products.filter(product => {
        if (filters.value.category && product.category !== filters.value.category) {
          return false
        }
        if (product.price < filters.value.priceRange[0] || 
            product.price > filters.value.priceRange[1]) {
          return false
        }
        if (filters.value.inStock && !product.inStock) {
          return false
        }
        return true
      })

      return filtered
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      isLoading.value = false
    }
  }

  const resetFilters = () => {
    filters.value = {
      category: null,
      priceRange: [0, 1000],
      inStock: true
    }
  }

  return {
    filters,
    isLoading,
    error,
    applyFilters,
    resetFilters
  }
}`,
        rationale: 'Encapsulates business logic for reuse across components',
      },
    ]

    const testingPatterns: ArchitecturePattern[] = [
      {
        name: 'Property-Based Testing Pattern',
        description: 'Test universal properties with fast-check (minimum 100 iterations)',
        codeExample: `import fc from 'fast-check'
import { describe, it, expect } from 'vitest'

describe('Product Filters', () => {
  // Feature: product-filters, Property 1: Filter preserves product structure
  it('should preserve product structure when filtering', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.record({
          id: fc.string(),
          name: fc.string(),
          price: fc.float({ min: 0, max: 1000 }),
          category: fc.constantFrom('wine', 'spirits', 'beer'),
          inStock: fc.boolean()
        })),
        async (products) => {
          const { applyFilters } = useProductFilters()
          const filtered = await applyFilters(products)
          
          // All filtered products should have same structure
          filtered.forEach(product => {
            expect(product).toHaveProperty('id')
            expect(product).toHaveProperty('name')
            expect(product).toHaveProperty('price')
            expect(product).toHaveProperty('category')
            expect(product).toHaveProperty('inStock')
          })
        }
      ),
      { numRuns: 100 }
    )
  })
})`,
        rationale: 'Property tests validate behavior across all possible inputs',
      },
      {
        name: 'E2E Testing Pattern',
        description: 'Playwright test for critical user flows',
        codeExample: `import { test, expect } from '@playwright/test'

test.describe('Checkout Flow', () => {
  test('should complete purchase with valid payment', async ({ page }) => {
    // 1. Navigate to product
    await page.goto('/products/wine-123')
    
    // 2. Add to cart
    await page.getByTestId('add-to-cart-btn').click()
    await expect(page.getByTestId('cart-count')).toHaveText('1')
    
    // 3. Go to checkout
    await page.getByTestId('checkout-btn').click()
    
    // 4. Fill shipping info
    await page.getByTestId('shipping-name').fill('John Doe')
    await page.getByTestId('shipping-address').fill('123 Main St')
    
    // 5. Enter payment (test mode)
    await page.getByTestId('card-number').fill('4242424242424242')
    await page.getByTestId('card-expiry').fill('12/25')
    await page.getByTestId('card-cvc').fill('123')
    
    // 6. Submit order
    await page.getByTestId('submit-order-btn').click()
    
    // 7. Verify success
    await expect(page.getByTestId('order-success')).toBeVisible()
  })
})`,
        rationale: 'E2E tests validate complete user flows and catch integration issues',
      },
    ]

    return {
      vue3Patterns,
      apiRoutePatterns,
      composablePatterns,
      testingPatterns,
    }
  }

  /**
   * Generate DEPENDENCIES.md content
   * Documents project dependencies and their purposes
   */
  generateDependencies(packageJson: any): DependencyDoc {
    const critical: Dependency[] = []
    const development: Dependency[] = []

    // Parse dependencies
    if (packageJson.dependencies) {
      Object.entries(packageJson.dependencies).forEach(([name, version]) => {
        critical.push({
          name,
          version: version as string,
          purpose: this.getDependencyPurpose(name),
        })
      })
    }

    // Parse devDependencies
    if (packageJson.devDependencies) {
      Object.entries(packageJson.devDependencies).forEach(([name, version]) => {
        development.push({
          name,
          version: version as string,
          purpose: this.getDependencyPurpose(name),
        })
      })
    }

    // Generate dependency graph
    const dependencyGraph = this.generateDependencyGraph(critical, development)

    return {
      critical,
      development,
      dependencyGraph,
    }
  }

  /**
   * Generate CONVENTIONS.md content
   * Documents naming conventions, file organization, and code style
   */
  generateConventions(_codebasePath: string): ConventionDoc {
    const naming: NamingConvention[] = [
      {
        type: 'file',
        convention: 'Use kebab-case for file names',
        example: 'product-list.vue, use-cart.ts, api-client.ts',
      },
      {
        type: 'component',
        convention: 'Use PascalCase for component names',
        example: 'ProductList, CartItem, CheckoutForm',
      },
      {
        type: 'composable',
        convention: 'Use camelCase with "use" prefix for composables',
        example: 'useCart, useAuth, useProductFilters',
      },
      {
        type: 'type',
        convention: 'Use PascalCase for TypeScript types and interfaces',
        example: 'Product, CartItem, UserProfile',
      },
      {
        type: 'constant',
        convention: 'Use UPPER_SNAKE_CASE for constants',
        example: 'MAX_CART_ITEMS, DEFAULT_CURRENCY, API_BASE_URL',
      },
    ]

    const fileOrganization: FileOrganization = {
      structure: `project-root/
├── components/          # Vue components
│   ├── admin/          # Admin-specific components
│   ├── cart/           # Cart-related components
│   ├── checkout/       # Checkout flow components
│   ├── common/         # Shared components
│   └── product/        # Product-related components
├── composables/        # Reusable business logic
├── pages/              # Nuxt pages (routes)
├── server/             # Server-side code
│   ├── api/           # API routes
│   ├── middleware/    # Server middleware
│   └── utils/         # Server utilities
├── stores/             # Pinia stores
├── types/              # TypeScript type definitions
└── utils/              # Client utilities`,
      rules: [
        'Group related components in subdirectories',
        'Keep composables focused on single responsibility',
        'Place API routes in server/api/ matching URL structure',
        'Define shared types in types/ directory',
        'Keep utilities pure functions when possible',
      ],
    }

    const codeStyle: CodeStyleRule[] = [
      {
        rule: 'Use TypeScript strict mode',
        example: '// tsconfig.json: "strict": true',
      },
      {
        rule: 'Prefer Composition API over Options API',
        example: '<script setup lang="ts"> instead of export default { ... }',
      },
      {
        rule: 'Use explicit return types for functions',
        example: 'function getTotal(): number { return 100 }',
      },
      {
        rule: 'Use const for immutable values, let for mutable',
        example: 'const MAX = 100; let count = 0',
      },
      {
        rule: 'Prefer async/await over .then() chains',
        example: 'const data = await fetchData() instead of fetchData().then()',
      },
      {
        rule: 'Add data-testid to interactive elements',
        example: '<button data-testid="submit-btn">Submit</button>',
      },
    ]

    return {
      naming,
      fileOrganization,
      codeStyle,
    }
  }

  /**
   * Helper: Get purpose description for a dependency
   */
  private getDependencyPurpose(name: string): string {
    const purposes: Record<string, string> = {
      'nuxt': 'Full-stack Vue framework',
      'vue': 'Progressive JavaScript framework',
      '@pinia/nuxt': 'State management',
      '@stripe/stripe-js': 'Payment processing (client)',
      'stripe': 'Payment processing (server)',
      '@supabase/supabase-js': 'Database and authentication',
      '@nuxtjs/supabase': 'Supabase integration for Nuxt',
      'tailwindcss': 'Utility-first CSS framework',
      'reka-ui': 'Accessible UI component library',
      'zod': 'TypeScript-first schema validation',
      'playwright': 'E2E testing framework',
      'vitest': 'Unit testing framework',
      'fast-check': 'Property-based testing library',
      '@vueuse/core': 'Vue composition utilities',
      'pinia': 'State management library',
      'typescript': 'Type-safe JavaScript',
      'chart.js': 'Data visualization',
      'date-fns': 'Date manipulation',
      'lucide-vue-next': 'Icon library',
      'vue-sonner': 'Toast notifications',
      'jsonwebtoken': 'JWT token handling',
      'resend': 'Email service',
      'uuid': 'Unique ID generation',
      'sharp': 'Image processing',
      'ipx': 'Image optimization',
      '@nuxt/image': 'Image optimization for Nuxt',
      '@tanstack/vue-table': 'Table component library',
      'swiper': 'Touch slider',
      'vue3-carousel': 'Carousel component',
      '@vueuse/motion': 'Animation utilities',
      'class-variance-authority': 'CSS variant management',
      'clsx': 'Conditional class names',
      'tailwind-merge': 'Tailwind class merging',
      'tailwindcss-animate': 'Tailwind animations',
      'chartjs-adapter-date-fns': 'Chart.js date adapter',
    }

    return purposes[name] || 'Project dependency'
  }

  /**
   * Helper: Generate Mermaid dependency graph
   */
  private generateDependencyGraph(_critical: Dependency[], _development: Dependency[]): string {
    const sections: string[] = []

    sections.push('```mermaid')
    sections.push('graph TD')
    sections.push('  App[Moldova Direct App]')
    sections.push('')
    sections.push('  %% Frontend Stack')
    sections.push('  App --> Nuxt[Nuxt 4]')
    sections.push('  Nuxt --> Vue[Vue 3]')
    sections.push('  Vue --> Pinia[Pinia State]')
    sections.push('  Vue --> VueUse[VueUse]')
    sections.push('  Vue --> RekaUI[Reka UI]')
    sections.push('  Vue --> Tailwind[Tailwind CSS]')
    sections.push('')
    sections.push('  %% Backend Stack')
    sections.push('  App --> Server[Nuxt Server]')
    sections.push('  Server --> Supabase[Supabase]')
    sections.push('  Server --> Stripe[Stripe]')
    sections.push('  Server --> Resend[Resend Email]')
    sections.push('')
    sections.push('  %% Testing Stack')
    sections.push('  App --> Testing[Testing]')
    sections.push('  Testing --> Playwright[Playwright E2E]')
    sections.push('  Testing --> Vitest[Vitest Unit]')
    sections.push('  Testing --> FastCheck[fast-check PBT]')
    sections.push('')
    sections.push('  %% Build Tools')
    sections.push('  App --> Build[Build Tools]')
    sections.push('  Build --> TypeScript[TypeScript]')
    sections.push('  Build --> Vite[Vite]')
    sections.push('```')

    return sections.join('\n')
  }

}
