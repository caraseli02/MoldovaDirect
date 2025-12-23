/**
 * Product Stock Status Composable
 *
 * Handles stock status, urgency messages, and delivery estimates
 */

import { computed, type ComputedRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useProductUtils } from './useProductUtils'

export function useProductStockStatus(stockQuantity: ComputedRef<number>) {
  const { t } = useI18n()
  const { getEstimatedDelivery } = useProductUtils()

  /**
   * Get CSS classes for stock status badge
   */
  const stockStatusClass = computed((): string => {
    const stock = stockQuantity.value
    if (stock > 10) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
    if (stock > 0) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200'
    return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200'
  })

  /**
   * Get stock status text
   */
  const stockStatusText = computed((): string => {
    const stock = stockQuantity.value
    if (stock > 10) return t('products.stockStatus.inStock')
    if (stock > 0) return t('products.stockStatus.onlyLeft', { count: stock })
    return t('products.stockStatus.outOfStock')
  })

  /**
   * Get estimated delivery message
   */
  const estimatedDelivery = computed((): string => {
    const date = getEstimatedDelivery(1)
    return t('products.stock.eta', { date })
  })

  /**
   * Get stock urgency message
   */
  const stockUrgencyMessage = computed((): string => {
    const stock = stockQuantity.value
    if (stock === 0) return ''
    if (stock <= 3) {
      return t('products.stock.urgencyLow', { count: stock })
    }
    if (stock <= 8) {
      return t('products.stock.urgencyMedium', { count: stock })
    }
    return ''
  })

  /**
   * Check if product is in stock
   */
  const isInStock = computed((): boolean => {
    return stockQuantity.value > 0
  })

  return {
    stockStatusClass,
    stockStatusText,
    estimatedDelivery,
    stockUrgencyMessage,
    isInStock,
  }
}
