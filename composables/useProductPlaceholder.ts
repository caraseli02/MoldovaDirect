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
 * Avoids category mismatches by using a generic image icon
 */
export function useProductPlaceholder() {
  /**
   * Determine placeholder based on category slug or name
   */
  const getPlaceholderConfig = (
    _categorySlug?: string | null,
    _categoryName?: string | null,
  ): PlaceholderConfig => {
    // Neutral fallback to avoid category-mismatch placeholders
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
