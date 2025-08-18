<template>
  <div class="relative">
    <button 
      @click="isOpen = !isOpen"
      data-testid="locale-switcher"
      class="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
    >
      <span>{{ currentLocaleName }}</span>
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    
    <div 
      v-if="isOpen"
      @click.away="isOpen = false"
      class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50"
    >
      <button
        v-for="availableLocale in availableLocales"
        :key="availableLocale.code"
        @click="switchLocale(availableLocale.code)"
        :data-testid="`locale-${availableLocale.code}`"
        class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
        :class="{ 'bg-primary-50 text-primary-600': locale === availableLocale.code }"
      >
        {{ availableLocale.name }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const { locale, locales, setLocale } = useI18n()
const switchLocaleTo = useSwitchLocalePath()
const router = useRouter()

const isOpen = ref(false)

const availableLocales = computed(() => {
  return (locales.value as any[]).filter(i => i.code !== locale.value)
})

const currentLocaleName = computed(() => {
  const current = (locales.value as any[]).find(i => i.code === locale.value)
  return current ? current.name : locale.value
})

const switchLocale = async (code: string) => {
  isOpen.value = false
  const path = switchLocaleTo(code)
  if (path) {
    await router.push(path)
  }
}
</script>