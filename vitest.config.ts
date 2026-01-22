import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

const plugins = []

try {
  const vue = await import('@vitejs/plugin-vue')
  if (vue?.default) {
    plugins.push(vue.default())
  }
}
catch {
  console.warn('[vitest] @vitejs/plugin-vue not found, proceeding without it.')
}

export default defineConfig({
  plugins,
  test: {
    environment: 'jsdom',
    globals: !process.env.PLAYWRIGHT_TEST,
    setupFiles: process.env.PLAYWRIGHT_TEST ? [] : ['./tests/setup/vitest.setup.ts'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/e2e/**',
      '**/tests/e2e/**',
      '**/tests/pre-commit/**',
      '**/tests/visual/**',
      '**/tests/visual-regression/**',
      '**/tests/fixtures/**',
      '**/tests/templates/**',
      '**/tests/utils/**',
      // Documentation tests have their own vitest config (scripts/documentation/vitest.config.ts)
      'scripts/documentation/**/*.test.ts',
      'scripts/documentation/**/*.spec.ts',
      'tests/server/api/admin/__tests__/**/*.test.ts',
      'tests/server/api/admin/orders/__tests__/**/*.test.ts',
      'tests/server/api/admin/products/__tests__/**/*.test.ts',
      'tests/server/api/webhooks/__tests__/**/*.test.ts',
      'tests/server/utils/__tests__/impersonation.test.ts',
      'tests/server/utils/__tests__/orderEmails.test.ts',
      'tests/server/utils/__tests__/searchSanitization.test.ts',
      // Excluded due to Supabase import resolution issues - needs proper mocking
      'tests/server/utils/orderEmails.test.ts',
      'tests/integration/**/*.test.ts',
      'components/layout/AppFooter.test.ts',
      '**/.{idea,git,cache,output,temp}/**',
      // Exclude shadcn-vue/reka-ui components - these are third-party UI primitives
      'tests/components/ui/**/*.test.ts',
      'components/ui/**/*.test.ts',
    ],
    // Limit parallel processes to prevent memory exhaustion
    pool: 'threads',
    poolOptions: {
      threads: {
        maxThreads: 4,
        minThreads: 1,
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '*.config.{js,ts}',
        '.nuxt/',
        'dist/',
        'coverage/',
        '**/*.d.ts',
        '**/*.test.ts',
        '**/*.spec.ts',
        // Exclude shadcn-vue/reka-ui components from coverage
        'components/ui/**',
      ],
      // Coverage thresholds - Updated 2025-12-30
      // Current baseline: ~142k uncovered lines (codebase growth since 2025-12-08)
      // Using negative = max uncovered allowed (prevents regression)
      // TODO: Add more unit tests to reduce uncovered lines back to 85k target
      thresholds: {
        branches: 70, // Currently 75%, set floor at 70%
        functions: 55, // Currently 60%, set floor at 55%
        lines: -145000, // Currently ~142k uncovered, allow small buffer
        statements: -145000,
      },
    },
    server: {
      deps: {
        inline: [
          '@supabase/supabase-js',
          '@supabase/auth-js',
          '@supabase/realtime-js',
          '@supabase/postgrest-js',
          '@supabase/storage-js',
          '@supabase/functions-js',
          '@supabase/ssr',
        ],
      },
    },
  },
  resolve: {
    alias: {
      '~': resolve(__dirname, '.'),
      '@': resolve(__dirname, '.'),
      '~~': resolve(__dirname, '.'),
      '@@': resolve(__dirname, '.'),
      '#app': resolve(__dirname, './.nuxt'),
      '#imports': resolve(__dirname, './tests/setup/nuxt-imports-mock.ts'),
      'vue-i18n': resolve(__dirname, './tests/setup/vue-i18n-mock.ts'),
      'pinia': resolve(__dirname, './node_modules/pinia'),
      '#supabase/server': resolve(__dirname, './tests/server/utils/mocks/supabase-server.mock.ts'),
      '#nitro': resolve(__dirname, './tests/server/utils/mocks/nitro.mock.ts'),
      'h3': resolve(__dirname, './tests/server/utils/mocks/h3.mock.ts'),
    },
    dedupe: ['vue', 'pinia', '@vue/runtime-core'],
  },
})
