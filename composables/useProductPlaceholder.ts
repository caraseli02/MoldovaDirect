/**
 * Product Placeholder Utility
 *
 * Provides neutral placeholder icons and colors for products without images.
 * Addresses P0-3: Missing Product Images without misleading category cues.
 */

export interface PlaceholderConfig {
  icon: string
  bgGradient: string
  iconColor: string
  blurColor: string
}

/**
 * Get neutral placeholder configuration
 * Uses a generic image placeholder to avoid category mismatches
 */
export function useProductPlaceholder() {
  /**
   * Get neutral placeholder configuration
   *
   * NOTE: Parameters accepted for API compatibility but not used.
   * Always returns a neutral placeholder to avoid category-based mismatches.
   */
  const getPlaceholderConfig = (): PlaceholderConfig => {
    return {
      icon: 'lucide:image',
      bgGradient: 'from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900',
      iconColor: 'text-gray-500 dark:text-gray-400',
      blurColor: 'bg-gray-500/10',
    }
  }

  return {
    getPlaceholderConfig,
  }
}
