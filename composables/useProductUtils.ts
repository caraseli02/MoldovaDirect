/**
 * Product Utilities Composable
 *
 * Provides utility functions for product data formatting and localization
 */

import { useI18n } from 'vue-i18n'
import type { ProductWithRelations, Translations } from '~/types/database'

export function useProductUtils() {
  const { locale } = useI18n()

  /**
   * Get localized text from translation object
   */
  const getLocalizedText = (text: Translations | Record<string, string> | null | undefined): string => {
    if (!text) return ''
    const textObj = text as Record<string, string | undefined>
    return textObj[locale.value] || textObj.es || Object.values(textObj).find(v => v) || ''
  }

  /**
   * Format price to 2 decimal places
   */
  const formatPrice = (price: string | number): string => {
    return Number(price).toFixed(2)
  }

  /**
   * Get category label with proper localization
   */
  const getCategoryLabel = (category: any): string => {
    if (!category) return ''

    if (category.nameTranslations) {
      return getLocalizedText(category.nameTranslations)
    }

    if (category.name) {
      return typeof category.name === 'string'
        ? category.name
        : getLocalizedText(category.name)
    }

    return ''
  }

  /**
   * Calculate discount percentage
   */
  const calculateDiscountPercentage = (price: number, comparePrice: number): number => {
    if (!comparePrice || comparePrice <= price) return 0
    return Math.round((1 - price / comparePrice) * 100)
  }

  /**
   * Check if product has active discount
   */
  const hasActiveDiscount = (price: string | number, comparePrice: string | number): boolean => {
    return !!comparePrice && Number(comparePrice) > Number(price)
  }

  /**
   * Get estimated delivery date
   */
  const getEstimatedDelivery = (daysToAdd: number = 1): string => {
    const baseDate = new Date()
    baseDate.setDate(baseDate.getDate() + daysToAdd)
    return new Intl.DateTimeFormat(locale.value, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(baseDate)
  }

  return {
    getLocalizedText,
    formatPrice,
    getCategoryLabel,
    calculateDiscountPercentage,
    hasActiveDiscount,
    getEstimatedDelivery,
  }
}
