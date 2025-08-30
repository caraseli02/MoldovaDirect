import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup/vitest.setup.ts'],
    include: [
      'tests/unit/auth-*.test.ts',
      'tests/unit/use-auth.test.ts',
      'tests/unit/middleware-auth.test.ts',
      'tests/integration/auth-*.test.ts'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './test-results/coverage',
      include: [
        'stores/auth.ts',
        'composables/useAuth.ts',
        'composables/useAuthMessages.ts',
        'composables/useAuthValidation.ts',
        'components/auth/**/*.vue',
        'pages/auth/**/*.vue',
        'middleware/auth.ts',
        'middleware/guest.ts',
        'middleware/verified.ts'
      ],
      exclude: [
        'node_modules/',
        'tests/',
        '.nuxt/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        },
        // Specific thresholds for critical auth components
        'stores/auth.ts': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        },
        'composables/useAuth.ts': {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85
        }
      }
    }
  },
  resolve: {
    alias: {
      '~': resolve(__dirname, '.'),
      '@': resolve(__dirname, '.'),
      '~~': resolve(__dirname, '.'),
      '@@': resolve(__dirname, '.')
    }
  }
})