/**
 * Composable for using i18n in Pinia stores
 * This provides a safe way to access i18n functions within stores
 */

export const useStoreI18n = () => {
  // Get the Nuxt app instance to access i18n
  const nuxtApp = useNuxtApp()
  
  // Return i18n functions if available
  if (nuxtApp && nuxtApp.$i18n) {
    const { t, locale } = nuxtApp.$i18n
    return {
      t,
      locale,
      available: true
    }
  }
  
  // Fallback for server-side or when i18n is not available
  return {
    t: (key: string, params?: any) => key,
    locale: ref('es'),
    available: false
  }
}