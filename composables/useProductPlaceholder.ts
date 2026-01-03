/**
 * Product Placeholder Utility
 *
 * Provides category-specific placeholder icons and colors for products without images.
 * Addresses P0-3: Missing Product Images
 */

export interface PlaceholderConfig {
  icon: string
  bgGradient: string
  iconColor: string
  blurColor: string
}

/**
 * Get category-specific placeholder configuration
 * Maps product categories to appropriate visual placeholders
 */
export function useProductPlaceholder() {
  /**
   * Determine placeholder based on category slug or name
   */
  const getPlaceholderConfig = (
    categorySlug?: string | null,
    categoryName?: string | null,
  ): PlaceholderConfig => {
    const slug = (categorySlug || '').toLowerCase()
    const name = (categoryName || '').toLowerCase()

    // Wine & Beverages
    if (
      slug.includes('wine') || slug.includes('vino') || slug.includes('vin')
      || slug.includes('beverage') || slug.includes('drink')
      || name.includes('wine') || name.includes('vino') || name.includes('vin')
    ) {
      return {
        icon: 'wine',
        bgGradient: 'from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30',
        iconColor: 'text-purple-500 dark:text-purple-400',
        blurColor: 'bg-purple-500/10',
      }
    }

    // Textiles & Fabrics
    if (
      slug.includes('textile') || slug.includes('fabric') || slug.includes('cloth')
      || slug.includes('tejido') || slug.includes('textil')
      || name.includes('textile') || name.includes('fabric') || name.includes('tejido')
    ) {
      return {
        icon: 'lucide:shirt',
        bgGradient: 'from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30',
        iconColor: 'text-blue-500 dark:text-blue-400',
        blurColor: 'bg-blue-500/10',
      }
    }

    // Crafts & Handmade
    if (
      slug.includes('craft') || slug.includes('handmade') || slug.includes('artisan')
      || slug.includes('artesania') || slug.includes('artesanal')
      || name.includes('craft') || name.includes('handmade') || name.includes('artisan')
    ) {
      return {
        icon: 'lucide:palette',
        bgGradient: 'from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30',
        iconColor: 'text-amber-600 dark:text-amber-400',
        blurColor: 'bg-amber-500/10',
      }
    }

    // Food & Culinary
    if (
      slug.includes('food') || slug.includes('cuisine') || slug.includes('culinary')
      || slug.includes('comida') || slug.includes('alimento') || slug.includes('gastronomia')
      || name.includes('food') || name.includes('comida') || name.includes('alimento')
    ) {
      return {
        icon: 'lucide:utensils',
        bgGradient: 'from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30',
        iconColor: 'text-green-600 dark:text-green-500',
        blurColor: 'bg-green-500/10',
      }
    }

    // Jewelry & Accessories
    if (
      slug.includes('jewelry') || slug.includes('jewellery') || slug.includes('accessory')
      || slug.includes('joyeria') || slug.includes('accesorio')
      || name.includes('jewelry') || name.includes('joyeria')
    ) {
      return {
        icon: 'lucide:gem',
        bgGradient: 'from-pink-100 to-pink-200 dark:from-pink-900/30 dark:to-pink-800/30',
        iconColor: 'text-pink-600 dark:text-pink-400',
        blurColor: 'bg-pink-500/10',
      }
    }

    // Home & Decor
    if (
      slug.includes('home') || slug.includes('decor') || slug.includes('decoration')
      || slug.includes('hogar') || slug.includes('decoracion')
      || name.includes('home') || name.includes('decor') || name.includes('hogar')
    ) {
      return {
        icon: 'lucide:home',
        bgGradient: 'from-indigo-100 to-indigo-200 dark:from-indigo-900/30 dark:to-indigo-800/30',
        iconColor: 'text-indigo-600 dark:text-indigo-400',
        blurColor: 'bg-indigo-500/10',
      }
    }

    // Default fallback (generic product)
    return {
      icon: 'lucide:package',
      bgGradient: 'from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900',
      iconColor: 'text-gray-500 dark:text-gray-400',
      blurColor: 'bg-gray-500/10',
    }
  }

  return {
    getPlaceholderConfig,
  }
}
