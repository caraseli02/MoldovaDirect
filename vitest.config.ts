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
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup/vitest.setup.ts']
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
