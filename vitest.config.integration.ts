import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

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
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup/vitest.integration.setup.ts'],
    include: [
      'server/api/admin/__tests__/**/*.test.ts',
      'server/api/admin/orders/__tests__/**/*.test.ts',
      'server/api/admin/products/__tests__/**/*.test.ts',
      'tests/integration/admin/**/*.test.ts',
    ],
    testTimeout: 30000, // Integration tests may take longer
    hookTimeout: 30000,
    server: {
      deps: {
        inline: [
          '@supabase/supabase-js',
          '@supabase/auth-js',
          '@supabase/realtime-js',
          '@supabase/postgrest-js',
          '@supabase/storage-js',
          '@supabase/functions-js',
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
    },
  },
})
