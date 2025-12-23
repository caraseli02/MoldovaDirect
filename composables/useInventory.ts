/**
 * Inventory Management Composable
 *
 * Requirements addressed:
 * - 2.1: Visual stock level indicators with configurable thresholds
 * - 2.2: Low stock threshold system
 * - 2.5: Automatic out-of-stock status updates
 *
 * Provides:
 * - Stock status calculation with visual indicators
 * - Configurable threshold management
 * - Stock level color coding
 */

export interface StockStatus {
  level: 'high' | 'medium' | 'low' | 'out'
  color: 'green' | 'yellow' | 'orange' | 'red'
  label: string
  icon: string
}

export interface InventoryMovement {
  id: number
  productId: number
  movementType: 'in' | 'out' | 'adjustment'
  quantity: number
  quantityBefore: number
  quantityAfter: number
  reason?: string
  referenceId?: string
  performedBy?: string
  notes?: string
  createdAt: string
}

export const useInventory = () => {
  /**
   * Calculate stock status based on quantity and thresholds
   */
  const getStockStatus = (
    stockQuantity: number,
    lowStockThreshold: number = 5,
    reorderPoint: number = 10,
  ): StockStatus => {
    if (stockQuantity === 0) {
      return {
        level: 'out',
        color: 'red',
        label: 'Out of Stock',
        icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728',
      }
    }

    if (stockQuantity <= lowStockThreshold) {
      return {
        level: 'low',
        color: 'red',
        label: 'Low Stock',
        icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z',
      }
    }

    if (stockQuantity <= reorderPoint) {
      return {
        level: 'medium',
        color: 'yellow',
        label: 'Medium Stock',
        icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z',
      }
    }

    return {
      level: 'high',
      color: 'green',
      label: 'In Stock',
      icon: 'M5 13l4 4L19 7',
    }
  }

  /**
   * Get CSS classes for stock status display
   */
  const getStockStatusClasses = (status: StockStatus): string => {
    const baseClasses = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium'

    switch (status.color) {
      case 'green':
        return `${baseClasses} bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200`
      case 'yellow':
        return `${baseClasses} bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200`
      case 'orange':
        return `${baseClasses} bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200`
      case 'red':
        return `${baseClasses} bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200`
      default:
        return `${baseClasses} bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200`
    }
  }

  /**
   * Get stock indicator dot classes
   */
  const getStockIndicatorClasses = (status: StockStatus): string => {
    const baseClasses = 'inline-block w-2 h-2 rounded-full mr-2'

    switch (status.color) {
      case 'green':
        return `${baseClasses} bg-green-500`
      case 'yellow':
        return `${baseClasses} bg-yellow-500`
      case 'orange':
        return `${baseClasses} bg-orange-500`
      case 'red':
        return `${baseClasses} bg-red-500`
      default:
        return `${baseClasses} bg-gray-500`
    }
  }

  /**
   * Check if product needs reordering
   */
  const needsReorder = (
    stockQuantity: number,
    reorderPoint: number = 10,
  ): boolean => {
    return stockQuantity <= reorderPoint
  }

  /**
   * Check if product is out of stock
   */
  const isOutOfStock = (stockQuantity: number): boolean => {
    return stockQuantity === 0
  }

  /**
   * Check if product has low stock
   */
  const hasLowStock = (
    stockQuantity: number,
    lowStockThreshold: number = 5,
  ): boolean => {
    return stockQuantity > 0 && stockQuantity <= lowStockThreshold
  }

  /**
   * Format stock quantity for display
   */
  const formatStockQuantity = (quantity: number): string => {
    if (quantity === 0) return '0'
    if (quantity < 0) return '0' // Prevent negative display
    return quantity.toLocaleString()
  }

  /**
   * Get stock level percentage for progress bars
   */
  const getStockLevelPercentage = (
    stockQuantity: number,
    maxStock: number = 100,
  ): number => {
    if (maxStock === 0) return 0
    return Math.min((stockQuantity / maxStock) * 100, 100)
  }

  /**
   * Validate stock quantity input
   */
  const validateStockQuantity = (quantity: string | number): {
    isValid: boolean
    error?: string
    value?: number
  } => {
    const numValue = typeof quantity === 'string' ? parseInt(quantity, 10) : quantity

    if (isNaN(numValue)) {
      return {
        isValid: false,
        error: 'Stock quantity must be a valid number',
      }
    }

    if (numValue < 0) {
      return {
        isValid: false,
        error: 'Stock quantity cannot be negative',
      }
    }

    if (numValue > 999999) {
      return {
        isValid: false,
        error: 'Stock quantity is too large',
      }
    }

    return {
      isValid: true,
      value: numValue,
    }
  }

  /**
   * Calculate stock value
   */
  const calculateStockValue = (
    stockQuantity: number,
    unitPrice: number,
  ): number => {
    return stockQuantity * unitPrice
  }

  /**
   * Get inventory movement type label
   */
  const getMovementTypeLabel = (type: string): string => {
    switch (type) {
      case 'in':
        return 'Stock In'
      case 'out':
        return 'Stock Out'
      case 'adjustment':
        return 'Adjustment'
      default:
        return 'Unknown'
    }
  }

  /**
   * Get movement type color
   */
  const getMovementTypeColor = (type: string): string => {
    switch (type) {
      case 'in':
        return 'text-green-600 dark:text-green-400'
      case 'out':
        return 'text-red-600 dark:text-red-400'
      case 'adjustment':
        return 'text-blue-600 dark:text-blue-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  return {
    // Stock status functions
    getStockStatus,
    getStockStatusClasses,
    getStockIndicatorClasses,

    // Stock level checks
    needsReorder,
    isOutOfStock,
    hasLowStock,

    // Formatting and display
    formatStockQuantity,
    getStockLevelPercentage,
    calculateStockValue,

    // Validation
    validateStockQuantity,

    // Movement tracking
    getMovementTypeLabel,
    getMovementTypeColor,
  }
}
