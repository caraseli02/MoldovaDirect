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
    setupFiles: ['./tests/setup/vitest.setup.ts']
  },
  resolve: {
    alias: (() => {
      const require = createRequire(import.meta.url)
      let piniaAlias: string | null = null

      try {
        piniaAlias = dirname(require.resolve('pinia/package.json'))
      } catch {
        try {
          const nuxtPinia = dirname(require.resolve('@pinia/nuxt/package.json'))
          piniaAlias = resolve(nuxtPinia, 'node_modules/pinia')
        } catch {
          console.warn('[vitest] Unable to resolve pinia package for unit tests.')
        }
      }

      const baseAliases: Record<string, string> = {
        '~': resolve(__dirname, '.'),
        '@': resolve(__dirname, '.'),
        '~~': resolve(__dirname, '.'),
        '@@': resolve(__dirname, '.')
      }

      if (piniaAlias) {
        baseAliases.pinia = piniaAlias
      }

      return baseAliases
    })()
  }
})
