<template>
  <div class="relative">
    <Button
      @click="isOpen = !isOpen"
      :class="cn('min-w-12 flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors')"
    >
      <span>{{ currentLocale?.name }}</span>
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
      </svg>
    </Button>
    
    <div
      v-if="isOpen"
      @click.outside="isOpen = false"
      class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50"
    >
      <Button
        v-for="locale in locales"
        :key="locale.code"
        @click="switchLanguage(locale.code)"
        class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
        :class="{ 'bg-primary-50 text-primary-600': locale.code === currentLocale?.code }"
      >
        {{ locale.name }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { cn } from '~/lib/utils'
const { locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const isOpen = ref(false)

const currentLocale = computed(() => {
  return locales.value.find((l: { code: string }) => l.code === locale.value)
})

const switchLanguage = async (code: 'es' | 'en' | 'ro' | 'ru') => {
  await navigateTo(switchLocalePath(code))
  isOpen.value = false
}
</script>