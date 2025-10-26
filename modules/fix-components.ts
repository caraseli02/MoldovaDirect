import { defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  meta: { name: 'fix-components' },
  setup(_options, nuxt) {
    nuxt.hook('components:dirs', (dirs) => {
      for (let i = dirs.length - 1; i >= 0; i--) {
        const entry = dirs[i] as any
        if (typeof entry === 'string') continue
        if (entry?.path && String(entry.path).includes('/components/ui')) {
          dirs.splice(i, 1)
        }
      }
    })
  }
})

