<template>
  <UiDropdownMenu>
    <UiDropdownMenuTrigger as-child>
      <UiButton
        type="button"
        variant="outline"
        data-testid="locale-switcher-trigger"
        :aria-label="t('common.language')"
        class="flex items-center justify-center md:justify-between gap-2 px-2 md:px-3 py-2 text-sm font-medium transition-all duration-300 min-w-[44px] md:min-w-[100px]"
      >
        <!-- Globe icon -->
        <svg
          class="h-4 w-4 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
          />
        </svg>
        <span class="hidden md:inline-block flex-1 text-left">{{ currentLocale?.name }}</span>
        <svg
          class="hidden md:block h-3 w-3 flex-shrink-0 opacity-50"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </UiButton>
    </UiDropdownMenuTrigger>

    <UiDropdownMenuContent
      align="end"
      data-testid="locale-switcher"
      class="w-48"
    >
      <UiDropdownMenuItem
        v-for="localeOption in locales"
        :key="localeOption.code"
        :data-testid="`locale-${localeOption.code}`"
        :class="{
          'bg-slate-50 text-slate-600 font-medium dark:bg-slate-500/20 dark:text-slate-100': localeOption.code === currentLocale?.code,
        }"
        @click="switchLanguage(localeOption.code)"
      >
        <span class="flex items-center justify-between w-full">
          <span>{{ localeOption.name }}</span>
          <!-- Check mark for selected language -->
          <svg
            v-if="localeOption.code === currentLocale?.code"
            class="h-4 w-4 text-slate-600 dark:text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </span>
      </UiDropdownMenuItem>
    </UiDropdownMenuContent>
  </UiDropdownMenu>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const { t, locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()

// Current locale
const currentLocale = computed(() => {
  return locales.value.find((l: { code: string }) => l.code === locale.value)
})

const switchLanguage = async (code: 'es' | 'en' | 'ro' | 'ru') => {
  try {
    const newPath = switchLocalePath(code)
    await navigateTo(newPath)
  }
  catch (error: unknown) {
    console.error('Error switching language:', error)
  }
}
</script>
