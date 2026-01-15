/**
 * Generate AI Context Command
 * Generates AI-friendly context files (llms.txt, AGENTS.md, .cursorrules, ai-context/)
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'
import type { CLIOptions, Logger } from '../cli'
import { AIContextGenerator } from '../ai-context-generator'
import type {
  LlmsTxtConfig,
  AgentsMdConfig,
  CursorRulesConfig,
  ProjectIdentity,
  TechnicalStack,
  ArchitecturePattern,
  SecurityRule,
  CodeConvention,
  CommonTask,
  KnownIssue,
} from '../types'

/**
 * Run generate-ai-context command
 * Generates all AI context files
 */
export async function runGenerateAIContext(
  options: CLIOptions,
  logger: Logger
): Promise<void> {
  logger.info('Generating AI context files...')

  const generator = new AIContextGenerator()

  // Generate llms.txt
  logger.info('\n=== Generating llms.txt ===')
  const llmsTxtConfig = createLlmsTxtConfig()
  const llmsTxtContent = generator.generateLlmsTxt(llmsTxtConfig)
  await fs.writeFile('llms.txt', llmsTxtContent, 'utf-8')
  logger.info('✓ llms.txt generated')

  // Generate AGENTS.md
  logger.info('\n=== Generating AGENTS.md ===')
  const agentsMdConfig = createAgentsMdConfig()
  const agentsMdContent = generator.generateAgentsMd(agentsMdConfig)
  await fs.writeFile('AGENTS.md', agentsMdContent, 'utf-8')
  logger.info('✓ AGENTS.md generated')

  // Generate .cursorrules
  logger.info('\n=== Generating .cursorrules ===')
  const cursorRulesConfig = createCursorRulesConfig()
  const cursorRulesContent = generator.generateCursorRules(cursorRulesConfig)
  await fs.writeFile('.cursorrules', cursorRulesContent, 'utf-8')
  logger.info('✓ .cursorrules generated')

  // Create ai-context directory
  logger.info('\n=== Generating ai-context/ directory ===')
  const aiContextDir = 'docs/ai-context'
  await fs.mkdir(aiContextDir, { recursive: true })

  // Generate ARCHITECTURE_SUMMARY.md
  const architectureSummary = generator.generateArchitectureSummary()
  await fs.writeFile(
    path.join(aiContextDir, 'ARCHITECTURE_SUMMARY.md'),
    architectureSummary,
    'utf-8'
  )
  logger.info('✓ ARCHITECTURE_SUMMARY.md generated')

  // Generate PATTERNS.md
  const patterns = generator.generatePatterns('.')
  const patternsContent = generatePatternsMarkdown(patterns)
  await fs.writeFile(
    path.join(aiContextDir, 'PATTERNS.md'),
    patternsContent,
    'utf-8'
  )
  logger.info('✓ PATTERNS.md generated')

  // Generate DEPENDENCIES.md
  const packageJson = await loadPackageJson()
  const dependencies = generator.generateDependencies(packageJson)
  const dependenciesContent = generateDependenciesMarkdown(dependencies)
  await fs.writeFile(
    path.join(aiContextDir, 'DEPENDENCIES.md'),
    dependenciesContent,
    'utf-8'
  )
  logger.info('✓ DEPENDENCIES.md generated')

  // Generate CONVENTIONS.md
  const conventions = generator.generateConventions('.')
  const conventionsContent = generateConventionsMarkdown(conventions)
  await fs.writeFile(
    path.join(aiContextDir, 'CONVENTIONS.md'),
    conventionsContent,
    'utf-8'
  )
  logger.info('✓ CONVENTIONS.md generated')

  logger.info('\n=== AI Context Generation Complete ===')
  logger.info('Generated files:')
  logger.info('  - llms.txt')
  logger.info('  - AGENTS.md')
  logger.info('  - .cursorrules')
  logger.info('  - docs/ai-context/ARCHITECTURE_SUMMARY.md')
  logger.info('  - docs/ai-context/PATTERNS.md')
  logger.info('  - docs/ai-context/DEPENDENCIES.md')
  logger.info('  - docs/ai-context/CONVENTIONS.md')
}

/**
 * Create llms.txt configuration
 */
function createLlmsTxtConfig(): LlmsTxtConfig {
  return {
    projectName: 'Moldova Direct',
    projectDescription:
      'E-commerce platform for Moldovan wines and spirits with multilingual support, Stripe payments, and Supabase backend.',
    stack: [
      'Nuxt 4.2.2',
      'Vue 3.5 (Composition API)',
      'TypeScript (strict mode)',
      'Tailwind CSS',
      'Pinia (state management)',
      'Supabase (database & auth)',
      'Stripe (payments)',
      'Playwright (E2E testing)',
      'Vitest (unit testing)',
    ],
    coreDocLinks: [
      { title: 'Getting Started', path: 'docs/tutorials/getting-started.md' },
      { title: 'Architecture Overview', path: 'docs/explanation/architecture/overview.md' },
      { title: 'API Reference', path: 'docs/reference/api/README.md' },
      { title: 'Security Guidelines', path: 'docs/how-to/security/guidelines.md' },
      { title: 'Testing Guide', path: 'docs/how-to/testing/guide.md' },
    ],
    conventions: [
      'Use TypeScript strict mode for all code',
      'Components use PascalCase, files use kebab-case',
      'Composables use camelCase with "use" prefix',
      'Never trust client-sent prices - always verify server-side',
      'Add data-testid to all interactive elements',
      'Use property-based testing with minimum 100 iterations',
    ],
    keyConcepts: [
      'Diátaxis documentation framework (tutorials, how-to, reference, explanation)',
      'Server-side price verification for security',
      'Atomic RPC functions for inventory management',
      'CSRF protection for all state-changing operations',
      'Row-level security (RLS) in Supabase',
    ],
  }
}

/**
 * Create AGENTS.md configuration
 */
function createAgentsMdConfig(): AgentsMdConfig {
  const projectIdentity: ProjectIdentity = {
    name: 'Moldova Direct',
    type: 'E-commerce Platform',
    domain: 'Food & Wine',
    targetMarket: 'Spanish-speaking markets (primary), multilingual support',
  }

  const technicalStack: TechnicalStack = {
    frontend: {
      Framework: 'Nuxt 4.2.2',
      'UI Library': 'Vue 3.5 (Composition API)',
      Language: 'TypeScript (strict mode)',
      Styling: 'Tailwind CSS',
      'State Management': 'Pinia',
    },
    backend: {
      Runtime: 'Nitro (Nuxt server)',
      Database: 'Supabase (PostgreSQL)',
      Authentication: 'Supabase Auth',
      Payments: 'Stripe',
    },
    infrastructure: {
      Hosting: 'Vercel',
      CDN: 'Vercel Edge Network',
      Testing: 'Playwright (E2E), Vitest (unit)',
    },
  }

  const architecturePatterns: ArchitecturePattern[] = [
    {
      name: 'Vue 3 Component Pattern',
      description: 'Standard component structure using Composition API',
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

function increment() {
  localCount.value++
  emit('update', localCount.value)
}
</script>

<template>
  <div>
    <h2>{{ title }}</h2>
    <p>Count: {{ localCount }} (Double: {{ doubleCount }})</p>
    <button @click="increment">Increment</button>
  </div>
</template>`,
      rationale: 'Composition API provides better TypeScript support and code organization',
    },
  ]

  const securityRules: SecurityRule[] = [
    {
      type: 'never',
      rule: 'Never trust client-sent prices',
      codeExample: `// ❌ NEVER DO THIS
export default defineEventHandler(async (event) => {
  const { productId, price } = await readBody(event)
  // Using client price directly - SECURITY VULNERABILITY
  await createOrder({ productId, price })
})

// ✅ ALWAYS DO THIS
export default defineEventHandler(async (event) => {
  const { productId } = await readBody(event)
  // Fetch price from database
  const product = await getProduct(productId)
  await createOrder({ productId, price: product.price })
})`,
      explanation:
        'Client-sent prices can be manipulated. Always verify prices server-side.',
    },
  ]

  const codeConventions: CodeConvention[] = [
    {
      category: 'naming',
      convention: 'Components use PascalCase',
      example: 'ProductCard.vue, CheckoutForm.vue',
    },
    {
      category: 'naming',
      convention: 'Composables use camelCase with "use" prefix',
      example: 'useCart.ts, useAuth.ts',
    },
  ]

  const commonTasks: CommonTask[] = [
    {
      task: 'Add a new API route',
      steps: [
        'Create file in server/api/',
        'Add CSRF validation',
        'Add authentication check',
        'Implement business logic',
        'Add error handling',
        'Write tests',
      ],
    },
  ]

  const knownIssues: KnownIssue[] = [
    {
      issue: 'Supabase session refresh timing',
      location: 'composables/useAuth.ts',
      workaround: 'Use onAuthStateChange listener to handle session updates',
    },
  ]

  return {
    projectIdentity,
    technicalStack,
    architecturePatterns,
    securityRules,
    codeConventions,
    commonTasks,
    knownIssues,
  }
}

/**
 * Create .cursorrules configuration
 */
function createCursorRulesConfig(): CursorRulesConfig {
  return {
    projectContext:
      'Moldova Direct is an e-commerce platform for Moldovan wines and spirits. Built with Nuxt 4, Vue 3, TypeScript, and Supabase.',
    codeStyle: [
      'Use TypeScript strict mode',
      'Prefer Composition API over Options API',
      'Use explicit return types for functions',
      'Use const for immutable values, let for mutable',
      'Prefer async/await over .then() chains',
    ],
    criticalRules: [
      'NEVER trust client-sent prices - always verify server-side',
      'ALWAYS validate CSRF tokens for state-changing operations',
      'ALWAYS use atomic RPC functions for inventory updates',
      'NEVER expose service keys in code',
      'ALWAYS add data-testid to interactive elements',
    ],
    filePatterns: {
      '*.vue': 'Vue 3 components using Composition API with <script setup>',
      'composables/*.ts': 'Reusable business logic with "use" prefix',
      'server/api/*.ts': 'API routes with CSRF validation and auth checks',
      'types/*.ts': 'TypeScript type definitions',
      '*.test.ts': 'Vitest unit tests',
      '*.spec.ts': 'Playwright E2E tests',
    },
    componentCreationGuidelines: [
      'Use <script setup lang="ts"> for all components',
      'Define Props interface with TypeScript',
      'Use defineEmits for type-safe events',
      'Add data-testid to interactive elements',
      'Keep components focused on single responsibility',
    ],
    apiRouteGuidelines: [
      'Validate CSRF token first',
      'Check authentication second',
      'Validate input third',
      'Verify prices server-side (never trust client)',
      'Use atomic RPC functions for inventory',
      'Return proper error codes',
    ],
    testingRequirements: [
      'Write property-based tests with minimum 100 iterations',
      'Add E2E tests for critical user flows',
      'Test security-critical code thoroughly',
      'Use data-testid for element selection',
      'Mock external services in unit tests',
    ],
  }
}

/**
 * Load package.json
 */
async function loadPackageJson(): Promise<any> {
  const content = await fs.readFile('package.json', 'utf-8')
  return JSON.parse(content)
}

/**
 * Generate PATTERNS.md markdown content
 */
function generatePatternsMarkdown(patterns: any): string {
  const sections: string[] = []

  sections.push('# Code Patterns')
  sections.push('')
  sections.push('This document contains code patterns extracted from the codebase.')
  sections.push('')

  // Vue 3 Patterns
  if (patterns.vue3Patterns.length > 0) {
    sections.push('## Vue 3 Component Patterns')
    sections.push('')
    patterns.vue3Patterns.forEach((pattern: ArchitecturePattern) => {
      sections.push(`### ${pattern.name}`)
      sections.push('')
      sections.push(pattern.description)
      sections.push('')
      sections.push('```typescript')
      sections.push(pattern.codeExample)
      sections.push('```')
      sections.push('')
      sections.push(`**Rationale:** ${pattern.rationale}`)
      sections.push('')
    })
  }

  // API Route Patterns
  if (patterns.apiRoutePatterns.length > 0) {
    sections.push('## API Route Patterns')
    sections.push('')
    patterns.apiRoutePatterns.forEach((pattern: ArchitecturePattern) => {
      sections.push(`### ${pattern.name}`)
      sections.push('')
      sections.push(pattern.description)
      sections.push('')
      sections.push('```typescript')
      sections.push(pattern.codeExample)
      sections.push('```')
      sections.push('')
      sections.push(`**Rationale:** ${pattern.rationale}`)
      sections.push('')
    })
  }

  // Composable Patterns
  if (patterns.composablePatterns.length > 0) {
    sections.push('## Composable Patterns')
    sections.push('')
    patterns.composablePatterns.forEach((pattern: ArchitecturePattern) => {
      sections.push(`### ${pattern.name}`)
      sections.push('')
      sections.push(pattern.description)
      sections.push('')
      sections.push('```typescript')
      sections.push(pattern.codeExample)
      sections.push('```')
      sections.push('')
      sections.push(`**Rationale:** ${pattern.rationale}`)
      sections.push('')
    })
  }

  // Testing Patterns
  if (patterns.testingPatterns.length > 0) {
    sections.push('## Testing Patterns')
    sections.push('')
    patterns.testingPatterns.forEach((pattern: ArchitecturePattern) => {
      sections.push(`### ${pattern.name}`)
      sections.push('')
      sections.push(pattern.description)
      sections.push('')
      sections.push('```typescript')
      sections.push(pattern.codeExample)
      sections.push('```')
      sections.push('')
      sections.push(`**Rationale:** ${pattern.rationale}`)
      sections.push('')
    })
  }

  return sections.join('\n')
}

/**
 * Generate DEPENDENCIES.md markdown content
 */
function generateDependenciesMarkdown(dependencies: any): string {
  const sections: string[] = []

  sections.push('# Project Dependencies')
  sections.push('')
  sections.push('This document lists all project dependencies and their purposes.')
  sections.push('')

  // Critical Dependencies
  sections.push('## Critical Dependencies')
  sections.push('')
  sections.push('These dependencies are required for the application to run.')
  sections.push('')
  dependencies.critical.forEach((dep: any) => {
    sections.push(`### ${dep.name}`)
    sections.push('')
    sections.push(`- **Version:** ${dep.version}`)
    sections.push(`- **Purpose:** ${dep.purpose}`)
    sections.push('')
  })

  // Development Dependencies
  sections.push('## Development Dependencies')
  sections.push('')
  sections.push('These dependencies are used during development and testing.')
  sections.push('')
  dependencies.development.forEach((dep: any) => {
    sections.push(`### ${dep.name}`)
    sections.push('')
    sections.push(`- **Version:** ${dep.version}`)
    sections.push(`- **Purpose:** ${dep.purpose}`)
    sections.push('')
  })

  // Dependency Graph
  sections.push('## Dependency Graph')
  sections.push('')
  sections.push(dependencies.dependencyGraph)
  sections.push('')

  return sections.join('\n')
}

/**
 * Generate CONVENTIONS.md markdown content
 */
function generateConventionsMarkdown(conventions: any): string {
  const sections: string[] = []

  sections.push('# Code Conventions')
  sections.push('')
  sections.push('This document defines naming conventions, file organization, and code style rules.')
  sections.push('')

  // Naming Conventions
  sections.push('## Naming Conventions')
  sections.push('')
  conventions.naming.forEach((conv: any) => {
    sections.push(`### ${conv.type}`)
    sections.push('')
    sections.push(`**Convention:** ${conv.convention}`)
    sections.push('')
    sections.push(`**Example:** \`${conv.example}\``)
    sections.push('')
  })

  // File Organization
  sections.push('## File Organization')
  sections.push('')
  sections.push('```')
  sections.push(conventions.fileOrganization.structure)
  sections.push('```')
  sections.push('')
  sections.push('### Rules')
  sections.push('')
  conventions.fileOrganization.rules.forEach((rule: string) => {
    sections.push(`- ${rule}`)
  })
  sections.push('')

  // Code Style
  sections.push('## Code Style')
  sections.push('')
  conventions.codeStyle.forEach((style: any) => {
    sections.push(`### ${style.rule}`)
    sections.push('')
    sections.push(`\`\`\`typescript`)
    sections.push(style.example)
    sections.push(`\`\`\``)
    sections.push('')
  })

  return sections.join('\n')
}
