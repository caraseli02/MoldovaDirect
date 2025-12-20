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
  },
  resolve: {
    alias: {
      '~': resolve(__dirname, '.'),
      '@': resolve(__dirname, '.'),
      '~~': resolve(__dirname, '.'),
      '@@': resolve(__dirname, '.'),
      '@supabase/supabase-js': resolve(__dirname, './node_modules/.pnpm/@supabase+supabase-js@2.58.0/node_modules/@supabase/supabase-js'),
      '@supabase/auth-js': resolve(__dirname, './node_modules/.pnpm/@supabase+auth-js@2.72.0/node_modules/@supabase/auth-js'),
      '@supabase/ssr': resolve(__dirname, './node_modules/.pnpm/@supabase+ssr@0.7.0_@supabase+supabase-js@2.58.0/node_modules/@supabase/ssr'),
    },
  },
})
