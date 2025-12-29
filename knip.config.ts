import type { KnipConfig } from 'knip'

const config: KnipConfig = {
  // Entry points for the application
  entry: [
    'nuxt.config.ts',
    'pages/**/*.vue',
    'layouts/**/*.vue',
    'components/**/*.vue',
    'composables/**/*.ts',
    'plugins/**/*.ts',
    'server/**/*.ts',
    'middleware/**/*.ts',
    'utils/**/*.ts',
    'stores/**/*.ts',
  ],

  // Project files to analyze
  project: ['**/*.{ts,vue,js,mjs}'],

  // Ignore patterns
  ignore: [
    '.nuxt/**',
    '.output/**',
    'node_modules/**',
    'dist/**',
    'coverage/**',
    'test-results/**',
    'playwright-report/**',
    '.visual-testing/**',
    'supabase/**',
    // Manual test scripts (intentionally standalone)
    'tests/manual/**',
    'scripts/**',
    '.github/scripts/**',
    // Test templates and fixtures (reference/helper files)
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
    // Documentation patches
    'docs/**/*.ts',
    // Nuxt modules
    'modules/**',
    // UI component index files (re-exports)
    'components/ui/**/index.ts',
  ],

  // Ignore dependencies that are used implicitly by Nuxt/Vite
  ignoreDependencies: [
    // Image processing (used by @nuxt/image)
    'ipx',
    'sharp',
    // Tailwind (loaded via CSS, not JS imports)
    'tailwindcss',
    'tailwindcss-animate',
    // Type definitions (used by TypeScript, not imported)
    '@types/uuid',
    // Testing frameworks (used via config files)
    '@axe-core/playwright',
    '@pinia/testing', // Used in test setup
    // Nuxt modules (auto-loaded via nuxt.config)
    'shadcn-nuxt',
    'nuxt-swiper',
    // Dev tools
    'husky',
    'dotenv',
    'markdown-link-check',
    'markdownlint-cli',
    // Auto-provided by Nuxt (available globally)
    'vue-i18n', // via @nuxtjs/i18n
    'h3', // via Nuxt server
    'ofetch', // via Nuxt
    'vue3-carousel', // via nuxt-swiper / manual import
    'uuid', // used in composables
  ],

  // Ignore binaries (CLI tools)
  ignoreBinaries: [
    'playwright',
    'vitest',
    'eslint',
    'oxlint',
    'knip',
  ],

  // Ignore specific workspaces patterns for test files
  ignoreWorkspaces: [],

  // Files where exports are allowed to be unused (type definition files)
  ignoreExportsUsedInFile: true,

  // Nuxt-specific plugin
  nuxt: true,

  // Playwright test configuration
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
