import { defineConfig } from 'vitest/config'
import { resolve, dirname } from 'path'
import { createRequire } from 'module'

const plugins = []

try {
  const vue = await import('@vitejs/plugin-vue')
  if (vue?.default) {
    plugins.push(vue.default())
  }
} catch (error) {
  console.warn('[vitest] @vitejs/plugin-vue not found, proceeding without it.')
}

export default defineConfig({
  plugins,
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup/vitest.setup.ts'],
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
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 75,
          lines: 80,
          statements: 80,
        },
        // Critical paths - higher thresholds
        'components/checkout/**': {
          branches: 85,
          functions: 90,
          lines: 90,
          statements: 90,
        },
        'composables/useStripe.ts': {
          branches: 85,
          functions: 90,
          lines: 90,
          statements: 90,
        },
        'composables/useShipping*.ts': {
          branches: 85,
          functions: 90,
          lines: 90,
          statements: 90,
        },
        'composables/useGuestCheckout.ts': {
          branches: 85,
          functions: 90,
          lines: 90,
          statements: 90,
        },
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
      'pinia': resolve(__dirname, './node_modules/.pnpm/pinia@3.0.3_typescript@5.9.3_vue@3.5.22_typescript@5.9.3_/node_modules/pinia'),
    },
    dedupe: ['vue', 'pinia', '@vue/runtime-core'],
  },
})
