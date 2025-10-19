<template>
  <div
    class="relative"
    @keydown.escape.stop.prevent="isOpen = false"
  >
    <Button
      type="button"
      @click="isOpen = !isOpen"
      variant="outline"
      :aria-haspopup="'listbox'"
      :aria-expanded="isOpen"
      :aria-label="t('common.language')"
      :aria-controls="isOpen ? listboxId : undefined"
      :class="cn(
        'min-w-12 flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors dark:text-slate-200',
        isOpen ? 'ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-slate-900' : ''
      )"
      :id="triggerId"
    >
      <span>{{ currentLocale?.name }}</span>
      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </Button>

    <div
      v-if="isOpen"
      @click.outside="isOpen = false"
      class="absolute right-0 z-50 mt-2 w-48 rounded-lg bg-white py-1 shadow-lg ring-1 ring-black/10 dark:bg-slate-900 dark:ring-white/10"
      :id="listboxId"
      role="listbox"
      :aria-labelledby="triggerId"
    >
      <Button
        v-for="locale in locales"
        :key="locale.code"
        type="button"
        variant="ghost"
        @click="switchLanguage(locale.code)"
        class="block w-full px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-slate-200 dark:hover:bg-slate-800/70"
        :class="{ 'bg-primary-50 text-primary-600 dark:bg-primary-500/20 dark:text-primary-100': locale.code === currentLocale?.code }"
        role="option"
        :aria-selected="locale.code === currentLocale?.code"
      >
        {{ locale.name }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { cn } from '~/lib/utils'

const { t, locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const isOpen = ref(false)
const triggerId = 'language-switcher-trigger'
const listboxId = 'language-switcher-listbox'

const currentLocale = computed(() => {
  return locales.value.find((l: { code: string }) => l.code === locale.value)
})

const switchLanguage = async (code: 'es' | 'en' | 'ro' | 'ru') => {
  await navigateTo(switchLocalePath(code))
  isOpen.value = false
}
</script>
