import { useDark, useToggle } from '@vueuse/core'
import type { Ref } from 'vue'

/**
 * Theme management composable using VueUse's useDark
 *
 * Features:
 * - Automatic localStorage persistence
 * - System preference detection (prefers-color-scheme)
 * - Automatic dark class on <html> element
 * - SSR-safe initialization
 * - Singleton pattern for shared state across all components
 *
 * @returns {Object} Theme state and controls
 */

// Create a singleton instance that's shared across all calls
// This ensures all components use the same theme state
let isDarkInstance: Ref<boolean> | null = null
let toggleThemeInstance: (value?: boolean) => boolean | null = null

export const useTheme = () => {
  // Only create the instance once (singleton pattern)
  if (!isDarkInstance) {
    // useDark automatically handles:
    // 1. localStorage persistence (key: 'theme')
    // 2. System preference detection (prefers-color-scheme)
    // 3. Adding/removing 'dark' class on document.documentElement
    // 4. Watching system preference changes
    isDarkInstance = useDark({
      selector: 'html',
      attribute: 'class',
      valueDark: 'dark',
      valueLight: '',
      storageKey: 'theme',
      // Listen to system preference changes
      onChanged: (dark: boolean) => {
        // This is called whenever the theme changes
        // You can add custom logic here if needed
        if (process.client) {
          console.log('Theme changed to:', dark ? 'dark' : 'light')
        }
      },
    })

    // Create a toggle function that works with our singleton
    toggleThemeInstance = useToggle(isDarkInstance)
  }

  // Computed property for theme value ('light' | 'dark')
  const theme = computed(() => isDarkInstance!.value ? 'dark' : 'light')

  // Set theme explicitly
  const setTheme = (newTheme: 'light' | 'dark') => {
    if (isDarkInstance) {
      isDarkInstance.value = newTheme === 'dark'
    }
  }

  return {
    isDark: isDarkInstance,
    theme,
    toggleTheme: toggleThemeInstance!,
    setTheme,
  }
}