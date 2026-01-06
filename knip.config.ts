import type { KnipConfig } from 'knip'

/**
 * Knip Configuration for Moldova Direct
 *
 * Knip finds unused files, dependencies, and exports in your codebase.
 *
 * HOW IT WORKS WITH NUXT:
 * - Setting `nuxt: true` enables the built-in Nuxt plugin
 * - The Nuxt plugin automatically detects: nuxt.config.ts, pages, components,
 *   composables, layouts, middleware, plugins, server routes, and modules
 * - We add custom entry points for stores and additional test configs
 *
 * Run: pnpm lint:knip
 * Fix: pnpm lint:knip:fix (auto-removes unused exports)
 */

const config: KnipConfig = {
  // Additional entry points beyond Nuxt defaults
  // Note: Nuxt auto-imports components, composables, utils from these directories
  // We need to include them as entry points so Knip knows they're used
  entry: [
    // Nuxt config files (used by Nuxt, not imported)
    'app.config.ts',
    // Nuxt auto-imported directories (components are auto-registered)
    'components/**/*.vue',
    'composables/**/*.ts',
    'utils/**/*.ts',
    // Nuxt auto-loaded plugins
    'plugins/**/*.ts',
    // Nuxt server utilities (auto-imported in server context)
    'server/utils/**/*.ts',
    // Pinia stores
    'stores/**/*.ts',
    // Custom type definitions
    'types/**/*.ts',
    // Lib utilities
    'lib/**/*.ts',
  ],

  // Project files to analyze
  project: ['**/*.{ts,vue,js,mjs}'],

  // Ignore patterns - files that should not be analyzed
  ignore: [
    // Build outputs
    '.nuxt/**',
    '.output/**',
    'node_modules/**',
    'dist/**',
    'coverage/**',
    'test-results/**',
    'playwright-report/**',
    '.visual-testing/**',
    'supabase/**',

    // Scripts (intentionally standalone, run via CLI)
    'tests/manual/**',
    'scripts/**',
    '.github/scripts/**',

    // Standalone test configs and runners (run via CLI, not imported)
    'tests/playwright-standalone.config.ts',
    'tests/run-auth-tests.ts',

    // Test infrastructure (imported by test framework, not app code)
    'tests/templates/**',
    'tests/fixtures/**',
    'tests/utils/**',
    'tests/setup/**',
    'tests/e2e/fixtures/**',
    'tests/e2e/helpers/**',
    'tests/e2e/page-objects/**',
    'tests/e2e/setup/**',
    'tests/e2e/visual-regression/**',
    'tests/server/utils/mocks/**',

    // Documentation
    'docs/**/*.ts',

    // Nuxt modules (custom modules - auto-detected by Nuxt plugin)
    'modules/**',

    // UI component barrel exports (re-exports for convenience)
    'components/ui/**/index.ts',
  ],

  // Dependencies used implicitly (not imported in code)
  ignoreDependencies: [
    // ===== Nuxt Auto-Imports =====
    // These are provided globally by Nuxt/modules, not imported in code
    'vue-i18n', // via @nuxtjs/i18n
    'h3', // via Nuxt server
    'ofetch', // via Nuxt ($fetch)
    'vue3-carousel', // component import

    // ===== Build Tools =====
    // Used by build system, not imported in code
    'ipx', // @nuxt/image optimizer
    'sharp', // image processing
    'tailwindcss', // loaded via CSS
    'tailwindcss-animate',

    // ===== Testing Tools =====
    // Used via config files, not imported in app code
    '@pinia/testing',

    // ===== Type Definitions =====
    '@types/uuid',

    // ===== Runtime Dependencies =====
    'uuid', // used via import, but may show as unused in some scans
  ],

  // CLI tools (not npm packages to check)
  ignoreBinaries: [
    'vercel',
    'prettier',
  ],

  // Allow unused exports in files that export types for external use
  ignoreExportsUsedInFile: true,

  // ===== Plugin Configuration =====

  // Enable Nuxt plugin - auto-detects Nuxt project structure
  nuxt: true,

  // Playwright configuration
  playwright: {
    config: ['playwright.config.ts', 'playwright.*.config.ts'],
    entry: ['tests/**/*.spec.ts', 'tests/**/*.test.ts'],
  },

  // Vitest configuration
  vitest: {
    config: ['vitest.config.ts', 'vitest.*.config.ts'],
    entry: ['tests/**/*.test.ts', '**/*.test.ts'],
  },
}

export default config
