/**
 * Composable for using i18n in Pinia stores
 * This provides a safe way to access i18n functions within stores
 */
import { ref } from 'vue'

export const useStoreI18n = () => {
  // Get the Nuxt app instance to access i18n
  const nuxtApp = useNuxtApp()

  // Return i18n functions if available
  if (nuxtApp && nuxtApp.$i18n) {
    const { t, locale } = nuxtApp.$i18n
    return {
      t,
      locale,
      available: true,
    }
  }

  // Fallback for server-side or when i18n is not available
  // Log in development to help debug i18n initialization issues
  if (import.meta.dev) {
    console.debug('[useStoreI18n] i18n not available, using fallback t() that returns keys')
  }
  return {
    t: (key: string, _params?: unknown) => key,
    locale: ref('es'),
    available: false,
  }
}
