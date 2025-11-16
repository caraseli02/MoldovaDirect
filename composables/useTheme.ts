import { useDark, useToggle } from '@vueuse/core'

/**
 * Theme management composable using VueUse's useDark
 *
 * Features:
 * - Automatic localStorage persistence
 * - System preference detection (prefers-color-scheme)
 * - Automatic dark class on <html> element
 * - SSR-safe initialization
 *
 * @returns {Object} Theme state and controls
 */
export const useTheme = () => {
  // useDark automatically handles:
  // 1. localStorage persistence (key: 'vueuse-color-scheme')
  // 2. System preference detection
  // 3. Adding/removing 'dark' class on document.documentElement
  // 4. Watching system preference changes
  const isDark = useDark({
    selector: 'html',
    attribute: 'class',
    valueDark: 'dark',
    valueLight: '',
    storageKey: 'theme',
    // Listen to system preference changes
    onChanged: (dark: boolean) => {
      // This is called whenever the theme changes
      // You can add custom logic here if needed
    },
  })

  // Create a toggle function
  const toggleTheme = useToggle(isDark)

  // Computed property for theme value ('light' | 'dark')
  const theme = computed(() => isDark.value ? 'dark' : 'light')

  // Set theme explicitly
  const setTheme = (newTheme: 'light' | 'dark') => {
    isDark.value = newTheme === 'dark'
  }

  return {
    isDark,
    theme,
    toggleTheme,
    setTheme,
  }
}