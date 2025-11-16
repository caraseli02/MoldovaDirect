/**
 * Theme plugin for client-side initialization
 *
 * VueUse's useDark handles initialization automatically,
 * but we call useTheme() here to ensure it's initialized
 * early in the app lifecycle
 */
export default defineNuxtPlugin(() => {
  // Initialize theme - useDark will automatically:
  // 1. Check localStorage for saved preference
  // 2. Fall back to system preference (prefers-color-scheme)
  // 3. Apply the appropriate class to the HTML element
  useTheme()
})