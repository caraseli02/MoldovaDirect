import { defineNuxtModule } from 'nuxt/kit'
import type { Nuxt } from 'nuxt/schema'

export default defineNuxtModule({
  meta: { name: 'fix-components' },
  setup(_options: unknown, nuxt: Nuxt) {
    nuxt.hook('components:dirs', (dirs: unknown[]) => {
      for (let i = dirs.length - 1; i >= 0; i--) {
        const entry = dirs[i] as unknown
        if (typeof entry === 'string') continue
        if (entry?.path && String(entry.path).includes('/components/ui')) {
          dirs.splice(i, 1)
        }
      }
    })
  },
})
