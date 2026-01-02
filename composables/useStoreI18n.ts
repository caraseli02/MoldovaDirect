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
  // This is expected during SSR, but log a warning to help debug if it happens unexpectedly on client
  if (import.meta.client) {
    console.warn('[useStoreI18n] i18n not available on client - translations will show as keys')
  }
  else if (import.meta.dev) {
    console.debug('[useStoreI18n] i18n not available during SSR (expected)')
  }

  return {
    // Fallback t() converts "checkout.warnings.concurrentCheckout" to "Concurrent Checkout"
    // This provides a more readable fallback than raw keys
    t: (key: string, _params?: unknown) => {
      const lastSegment = key.split('.').pop() || key
      return lastSegment
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, s => s.toUpperCase())
        .trim()
    },
    locale: ref('es'),
    available: false,
  }
}
