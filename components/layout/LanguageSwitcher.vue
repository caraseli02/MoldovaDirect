<template>
  <div
    ref="dropdownRef"
    class="relative"
    @keydown.escape="closeDropdown"
  >
    <UiButton
      ref="triggerRef"
      type="button"
      @click="toggleDropdown"
      @keydown.arrow-down.prevent="openDropdown"
      @keydown.arrow-up.prevent="openDropdown"
      variant="outline"
      :aria-haspopup="'listbox'"
      :aria-expanded="isOpen"
      :aria-label="t('common.language')"
      :aria-controls="isOpen ? listboxId : undefined"
      :class="cn(
        'min-w-[100px] flex items-center justify-between gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors dark:text-slate-200',
        isOpen ? 'ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-slate-900' : ''
      )"
      :id="triggerId"
    >
      <!-- Globe icon for better visual indication -->
      <svg class="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
      </svg>
      <span class="flex-1 text-left">{{ currentLocale?.name }}</span>
      <svg
        class="h-4 w-4 flex-shrink-0 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </UiButton>

    <!-- Dropdown menu -->
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        ref="menuRef"
        class="absolute right-0 z-50 mt-2 w-48 rounded-lg bg-white py-1 shadow-lg ring-1 ring-black/10 dark:bg-slate-900 dark:ring-white/10"
        :id="listboxId"
        role="listbox"
        :aria-labelledby="triggerId"
        @keydown.arrow-down.prevent="focusNextOption"
        @keydown.arrow-up.prevent="focusPreviousOption"
        @keydown.enter.prevent="selectFocusedOption"
        @keydown.escape="closeDropdown"
      >
        <button
          v-for="(locale, index) in locales"
          :key="locale.code"
          ref="optionRefs"
          type="button"
          @click="switchLanguage(locale.code)"
          class="block w-full px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 focus:bg-gray-100 focus:outline-none dark:text-slate-200 dark:hover:bg-slate-800/70 dark:focus:bg-slate-800/70"
          :class="{
            'bg-primary-50 text-primary-600 font-medium dark:bg-primary-500/20 dark:text-primary-100': locale.code === currentLocale?.code,
            'font-normal': locale.code !== currentLocale?.code
          }"
          role="option"
          :aria-selected="locale.code === currentLocale?.code"
          :tabindex="isOpen ? 0 : -1"
        >
          <span class="flex items-center justify-between">
            <span>{{ locale.name }}</span>
            <!-- Check mark for selected language -->
            <svg
              v-if="locale.code === currentLocale?.code"
              class="h-4 w-4 text-primary-600 dark:text-primary-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { cn } from '~/lib/utils'

const { t, locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()

// Refs
const dropdownRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)
const optionRefs = ref<HTMLElement[]>([])

// State
const isOpen = ref(false)
const focusedIndex = ref(-1)

// IDs for accessibility
const triggerId = 'language-switcher-trigger'
const listboxId = 'language-switcher-listbox'

// Current locale
const currentLocale = computed(() => {
  return locales.value.find((l: { code: string }) => l.code === locale.value)
})

// Close dropdown when clicking outside
onClickOutside(dropdownRef, () => {
  if (isOpen.value) {
    closeDropdown()
  }
})

// Methods
const toggleDropdown = () => {
  if (isOpen.value) {
    closeDropdown()
  } else {
    openDropdown()
  }
}

const openDropdown = async () => {
  isOpen.value = true
  // Focus the first option after opening
  await nextTick()
  focusedIndex.value = locales.value.findIndex((l: { code: string }) => l.code === locale.value)
  if (focusedIndex.value !== -1 && optionRefs.value[focusedIndex.value]) {
    optionRefs.value[focusedIndex.value].focus()
  }
}

const closeDropdown = () => {
  isOpen.value = false
  focusedIndex.value = -1
  // Return focus to trigger button
  if (triggerRef.value) {
    const button = triggerRef.value.$el || triggerRef.value
    if (button?.focus) {
      button.focus()
    }
  }
}

const focusNextOption = () => {
  if (!isOpen.value || !optionRefs.value.length) return

  focusedIndex.value = (focusedIndex.value + 1) % optionRefs.value.length
  optionRefs.value[focusedIndex.value]?.focus()
}

const focusPreviousOption = () => {
  if (!isOpen.value || !optionRefs.value.length) return

  focusedIndex.value = focusedIndex.value <= 0
    ? optionRefs.value.length - 1
    : focusedIndex.value - 1
  optionRefs.value[focusedIndex.value]?.focus()
}

const selectFocusedOption = () => {
  if (focusedIndex.value >= 0 && focusedIndex.value < locales.value.length) {
    const selectedLocale = locales.value[focusedIndex.value] as { code: 'es' | 'en' | 'ro' | 'ru' }
    switchLanguage(selectedLocale.code)
  }
}

const switchLanguage = async (code: 'es' | 'en' | 'ro' | 'ru') => {
  try {
    const newPath = switchLocalePath(code)
    closeDropdown()
    await navigateTo(newPath)
  } catch (error) {
    console.error('Error switching language:', error)
    closeDropdown()
  }
}
</script>
