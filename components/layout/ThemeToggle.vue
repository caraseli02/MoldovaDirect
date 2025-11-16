<template>
  <Button
    type="button"
    variant="ghost"
    size="icon"
    @click="toggleTheme"
    :aria-pressed="isDark"
    :aria-label="`Theme toggle, currently ${theme} mode`"
    class="relative inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-accent"
    title="Toggle theme"
  >
    <!-- Sun Icon (shown in dark mode) -->
    <Transition name="theme-icon" mode="out-in">
      <svg
        v-if="isDark"
        key="sun"
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5 text-gray-700 dark:text-slate-300 transition-transform duration-300 hover:rotate-180"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
      <!-- Moon Icon (shown in light mode) -->
      <svg
        v-else
        key="moon"
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5 text-gray-700 dark:text-slate-300 transition-transform duration-300"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>
    </Transition>
  </Button>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'

const { isDark, theme, toggleTheme } = useTheme()
</script>

<style scoped>
/* Theme icon transition animations */
.theme-icon-enter-active,
.theme-icon-leave-active {
  transition: all 0.3s ease;
}

.theme-icon-enter-from {
  opacity: 0;
  transform: rotate(-180deg) scale(0.8);
}

.theme-icon-leave-to {
  opacity: 0;
  transform: rotate(180deg) scale(0.8);
}

.theme-icon-enter-to,
.theme-icon-leave-from {
  opacity: 1;
  transform: rotate(0) scale(1);
}
</style>