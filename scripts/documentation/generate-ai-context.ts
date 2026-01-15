#!/usr/bin/env node
/**
 * Script to generate AI context files for validation
 */

import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { AIContextGenerator } from './ai-context-generator'
import type { LlmsTxtConfig, AgentsMdConfig, CursorRulesConfig, PatternDoc, DependencyDoc, ConventionDoc } from './types'

const generator = new AIContextGenerator()

// Helper functions to format objects as markdown
function formatPatternsAsMarkdown(patterns: PatternDoc): string {
  const sections: string[] = []
  
  sections.push('# Code Patterns')
  sections.push('')
  sections.push('Documented code patterns for Moldova Direct.')
  sections.push('')
  
  sections.push('## Vue 3 Component Patterns')
  sections.push('')
  patterns.vue3Patterns.forEach(pattern => {
    sections.push(`### ${pattern.name}`)
    sections.push('')
    sections.push(pattern.description)
    sections.push('')
    sections.push('```vue')
    sections.push(pattern.codeExample)
    sections.push('```')
    sections.push('')
    sections.push(`**Rationale**: ${pattern.rationale}`)
    sections.push('')
  })
  
  sections.push('## API Route Patterns')
  sections.push('')
  patterns.apiRoutePatterns.forEach(pattern => {
    sections.push(`### ${pattern.name}`)
    sections.push('')
    sections.push(pattern.description)
    sections.push('')
    sections.push('```typescript')
    sections.push(pattern.codeExample)
    sections.push('```')
    sections.push('')
    sections.push(`**Rationale**: ${pattern.rationale}`)
    sections.push('')
  })
  
  sections.push('## Composable Patterns')
  sections.push('')
  patterns.composablePatterns.forEach(pattern => {
    sections.push(`### ${pattern.name}`)
    sections.push('')
    sections.push(pattern.description)
    sections.push('')
    sections.push('```typescript')
    sections.push(pattern.codeExample)
    sections.push('```')
    sections.push('')
    sections.push(`**Rationale**: ${pattern.rationale}`)
    sections.push('')
  })
  
  sections.push('## Testing Patterns')
  sections.push('')
  patterns.testingPatterns.forEach(pattern => {
    sections.push(`### ${pattern.name}`)
    sections.push('')
    sections.push(pattern.description)
    sections.push('')
    sections.push('```typescript')
    sections.push(pattern.codeExample)
    sections.push('```')
    sections.push('')
    sections.push(`**Rationale**: ${pattern.rationale}`)
    sections.push('')
  })
  
  return sections.join('\n')
}

function formatDependenciesAsMarkdown(deps: DependencyDoc): string {
  const sections: string[] = []
  
  sections.push('# Dependencies')
  sections.push('')
  sections.push('Project dependencies and their purposes.')
  sections.push('')
  
  sections.push('## Critical Dependencies')
  sections.push('')
  sections.push('| Package | Version | Purpose |')
  sections.push('|---------|---------|---------|')
  deps.critical.forEach(dep => {
    sections.push(`| ${dep.name} | ${dep.version} | ${dep.purpose} |`)
  })
  sections.push('')
  
  sections.push('## Development Dependencies')
  sections.push('')
  sections.push('| Package | Version | Purpose |')
  sections.push('|---------|---------|---------|')
  deps.development.forEach(dep => {
    sections.push(`| ${dep.name} | ${dep.version} | ${dep.purpose} |`)
  })
  sections.push('')
  
  sections.push('## Dependency Graph')
  sections.push('')
  sections.push('```mermaid')
  sections.push(deps.dependencyGraph)
  sections.push('```')
  sections.push('')
  
  return sections.join('\n')
}

function formatConventionsAsMarkdown(conventions: ConventionDoc): string {
  const sections: string[] = []
  
  sections.push('# Code Conventions')
  sections.push('')
  sections.push('Naming conventions, file organization, and code style rules.')
  sections.push('')
  
  sections.push('## Naming Conventions')
  sections.push('')
  conventions.naming.forEach(conv => {
    sections.push(`### ${conv.type}`)
    sections.push('')
    sections.push(conv.convention)
    sections.push('')
    sections.push(`**Example**: ${conv.example}`)
    sections.push('')
  })
  
  sections.push('## File Organization')
  sections.push('')
  sections.push('```')
  sections.push(conventions.fileOrganization.structure)
  sections.push('```')
  sections.push('')
  sections.push('### Rules')
  sections.push('')
  conventions.fileOrganization.rules.forEach(rule => {
    sections.push(`- ${rule}`)
  })
  sections.push('')
  
  sections.push('## Code Style')
  sections.push('')
  conventions.codeStyle.forEach(style => {
    sections.push(`### ${style.rule}`)
    sections.push('')
    sections.push('```typescript')
    sections.push(style.example)
    sections.push('```')
    sections.push('')
  })
  
  return sections.join('\n')
}


// Configuration for llms.txt
const llmsTxtConfig: LlmsTxtConfig = {
  projectName: 'Moldova Direct',
  projectDescription: 'E-commerce platform for authentic Moldovan food and wine products',
  stack: ['Nuxt 4.2.2', 'Vue 3.5', 'TypeScript', 'Supabase', 'Stripe'],
  coreDocLinks: [
    { title: 'Project Status', path: 'docs/status/PROJECT_STATUS.md' },
    { title: 'Architecture Overview', path: 'docs/architecture/README.md' },
    { title: 'Authentication', path: 'docs/architecture/AUTHENTICATION_ARCHITECTURE.md' },
    { title: 'Cart System', path: 'docs/architecture/CART_SYSTEM_ARCHITECTURE.md' },
    { title: 'Checkout Flow', path: 'docs/architecture/CHECKOUT_FLOW.md' },
  ],
  conventions: [
    'TypeScript: Strict mode, explicit types, no any',
    'Vue 3: Composition API with <script setup lang="ts">',
    'Components: PascalCase, feature-organized',
    'API Routes: CSRF validation required, server-side price verification',
    'Testing: E2E with Playwright, unit with Vitest',
  ],
  keyConcepts: [
    'Modular Stores: Cart and auth stores split into focused modules',
    'Dual Persistence: Cookie + localStorage for cart reliability',
    'Server-Side Validation: All prices verified server-side (CRITICAL)',
    'Atomic Operations: Inventory updates in single transaction',
    'Security First: CSRF protection, rate limiting, MFA for admins',
  ],
}

// Configuration for AGENTS.md
const agentsMdConfig: AgentsMdConfig = {
  projectIdentity: {
    name: 'Moldova Direct',
    type: 'E-commerce Platform',
    domain: 'Food & Wine',
    targetMarket: 'Spanish-speaking markets (primary), multilingual support',
  },
  technicalStack: {
    frontend: {
      'Framework': 'Nuxt 4.2.2',
      'UI Library': 'Vue 3.5 (Composition API)',
      'Language': 'TypeScript (strict mode)',
      'Styling': 'Tailwind CSS',
      'State Management': 'Pinia',
    },
    backend: {
      'Runtime': 'Nitro (Nuxt server)',
      'Database': 'Supabase (PostgreSQL)',
      'Authentication': 'Supabase Auth',
      'Payments': 'Stripe',
    },
    infrastructure: {
      'Hosting': 'Vercel',
      'CDN': 'Vercel Edge Network',
      'Testing': 'Playwright (E2E), Vitest (unit)',
    },
  },
  architecturePatterns: [
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
  ],
  securityRules: [
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
      explanation: 'Client-sent prices can be manipulated. Always verify prices server-side.',
    },
  ],
  codeConventions: [
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
  ],
  commonTasks: [
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
  ],
  knownIssues: [
    {
      issue: 'Supabase session refresh timing',
      workaround: 'Use onAuthStateChange listener to handle session updates',
      location: 'composables/useAuth.ts',
    },
  ],
}

// Configuration for .cursorrules
const cursorRulesConfig: CursorRulesConfig = {
  projectContext: 'Moldova Direct - E-commerce platform for Moldovan products',
  codeStyle: [
    'Use TypeScript strict mode',
    'Use Vue 3 Composition API with <script setup>',
    'Use explicit types, avoid any',
    'Use PascalCase for components',
    'Use camelCase for composables',
  ],
  criticalRules: [
    'NEVER trust client-sent prices - always verify server-side',
    'ALWAYS add CSRF validation to state-changing API routes',
    'ALWAYS use atomic RPC functions for inventory updates',
    'ALWAYS add data-testid attributes to interactive elements',
  ],
  filePatterns: {
    'components/*.vue': 'Vue 3 components with Composition API',
    'composables/*.ts': 'Reusable composition functions',
    'server/api/**/*.ts': 'API routes with CSRF validation',
    'stores/*.ts': 'Pinia stores with TypeScript',
  },
  componentCreationGuidelines: [
    'Use <script setup lang="ts">',
    'Define Props interface',
    'Use defineProps with withDefaults',
    'Use defineEmits with type',
    'Add data-testid for testing',
  ],
  apiRouteGuidelines: [
    'Add CSRF validation',
    'Add authentication check',
    'Validate input',
    'Verify prices server-side',
    'Use try-catch for error handling',
    'Return consistent error format',
  ],
  testingRequirements: [
    'E2E tests with Playwright',
    'Unit tests with Vitest',
    'Property-based tests with fast-check (minimum 100 iterations)',
    'Add data-testid to all interactive elements',
  ],
}

console.log('Generating AI context files...\n')

// Generate llms.txt
console.log('1. Generating llms.txt...')
const llmsTxt = generator.generateLlmsTxt(llmsTxtConfig)
writeFileSync('llms-generated.txt', llmsTxt)
console.log('   ✓ Generated llms-generated.txt')

// Generate AGENTS.md
console.log('2. Generating AGENTS.md...')
const agentsMd = generator.generateAgentsMd(agentsMdConfig)
writeFileSync('AGENTS.md', agentsMd)
console.log('   ✓ Generated AGENTS.md')

// Generate .cursorrules
console.log('3. Generating .cursorrules...')
const cursorRules = generator.generateCursorRules(cursorRulesConfig)
writeFileSync('.cursorrules', cursorRules)
console.log('   ✓ Generated .cursorrules')

// Generate ai-context directory files
console.log('4. Generating ai-context/ directory...')
const aiContextDir = join(process.cwd(), 'docs', 'ai-context')
mkdirSync(aiContextDir, { recursive: true })

console.log('   4.1 Generating ARCHITECTURE_SUMMARY.md...')
const architectureSummary = generator.generateArchitectureSummary()
writeFileSync(join(aiContextDir, 'ARCHITECTURE_SUMMARY.md'), architectureSummary)
console.log('       ✓ Generated ARCHITECTURE_SUMMARY.md')

console.log('   4.2 Generating PATTERNS.md...')
const patternsDoc = generator.generatePatterns('.')
const patternsMarkdown = formatPatternsAsMarkdown(patternsDoc)
writeFileSync(join(aiContextDir, 'PATTERNS.md'), patternsMarkdown)
console.log('       ✓ Generated PATTERNS.md')

console.log('   4.3 Generating DEPENDENCIES.md...')
const dependenciesDoc = generator.generateDependencies({
  dependencies: {
    'nuxt': '^4.2.2',
    'vue': '^3.5.0',
    '@supabase/supabase-js': '^2.0.0',
    'stripe': '^14.0.0',
  },
  devDependencies: {
    'vitest': '^3.2.4',
    '@playwright/test': '^1.40.0',
    'typescript': '^5.3.0',
  },
})
const dependenciesMarkdown = formatDependenciesAsMarkdown(dependenciesDoc)
writeFileSync(join(aiContextDir, 'DEPENDENCIES.md'), dependenciesMarkdown)
console.log('       ✓ Generated DEPENDENCIES.md')

console.log('   4.4 Generating CONVENTIONS.md...')
const conventionsDoc = generator.generateConventions('.')
const conventionsMarkdown = formatConventionsAsMarkdown(conventionsDoc)
writeFileSync(join(aiContextDir, 'CONVENTIONS.md'), conventionsMarkdown)
console.log('       ✓ Generated CONVENTIONS.md')

console.log('\n✅ All AI context files generated successfully!')
console.log('\nGenerated files:')
console.log('  - llms-generated.txt (for comparison)')
console.log('  - AGENTS.md')
console.log('  - .cursorrules')
console.log('  - docs/ai-context/ARCHITECTURE_SUMMARY.md')
console.log('  - docs/ai-context/PATTERNS.md')
console.log('  - docs/ai-context/DEPENDENCIES.md')
console.log('  - docs/ai-context/CONVENTIONS.md')
