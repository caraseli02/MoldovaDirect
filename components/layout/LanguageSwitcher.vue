<template>
  <UiDropdownMenu>
    <UiDropdownMenuTrigger as-child>
      <UiButton
        type="button"
        variant="outline"
        data-testid="locale-switcher-trigger"
        :aria-label="t('common.language')"
        class="min-w-[100px] flex items-center justify-between gap-2 px-3 py-2 text-sm font-medium"
      >
        <!-- Globe icon for better visual indication -->
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
        <span class="flex-1 text-left">{{ currentLocale?.name }}</span>
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
          'bg-primary-50 text-primary-600 font-medium dark:bg-primary-500/20 dark:text-primary-100': localeOption.code === currentLocale?.code,
        }"
        @click="switchLanguage(localeOption.code)"
      >
        <span class="flex items-center justify-between w-full">
          <span>{{ localeOption.name }}</span>
          <!-- Check mark for selected language -->
          <svg
            v-if="localeOption.code === currentLocale?.code"
            class="h-4 w-4 text-primary-600 dark:text-primary-400"
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
