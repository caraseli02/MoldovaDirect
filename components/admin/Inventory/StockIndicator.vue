<!--
  Stock Level Indicator Component

  Requirements addressed:
  - 2.1: Visual stock level indicators (red/yellow/green) in product listings
  - 2.2: Configurable low stock threshold system
  - 2.5: Automatic out-of-stock status updates when inventory reaches zero

  Features:
  - Color-coded stock status indicators
  - Configurable thresholds
  - Tooltip with detailed information
  - Responsive design
-->

<template>
  <div class="flex items-center space-x-2">
    <!-- Stock Status Badge -->
    <span
      :class="stockStatusClasses"
      :title="stockStatus.label"
    >
      <span :class="stockIndicatorClasses"></span>
      {{ formatStockQuantity(stockQuantity) }}
    </span>

    <!-- Stock Status Icon -->
    <div
      v-if="showIcon"
      :class="[
        'flex items-center justify-center w-5 h-5',
        stockStatus.color === 'red' ? 'text-red-500'
        : stockStatus.color === 'yellow' ? 'text-yellow-500'
          : stockStatus.color === 'orange' ? 'text-orange-500'
            : 'text-green-500',
      ]"
      :title="stockStatus.label"
    >
      <svg
        class="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          :d="stockStatus.icon"
        />
      </svg>
    </div>

    <!-- Progress Bar (optional) -->
    <div
      v-if="showProgressBar && maxStock > 0"
      class="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 min-w-[60px]"
      :title="`${stockQuantity} / ${maxStock} units`"
    >
      <div
        :class="[
          'h-2 rounded-full transition-all duration-300',
          stockStatus.color === 'red' ? 'bg-red-500'
          : stockStatus.color === 'yellow' ? 'bg-yellow-500'
            : stockStatus.color === 'orange' ? 'bg-orange-500'
              : 'bg-green-500',
        ]"
        :style="{ width: `${stockLevelPercentage}%` }"
      ></div>
    </div>

    <!-- Reorder Alert -->
    <div
      v-if="needsReorder && showReorderAlert"
      class="flex items-center text-orange-600 dark:text-orange-400"
      title="Needs reordering"
    >
      <svg
        class="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  stockQuantity: number
  lowStockThreshold?: number
  reorderPoint?: number
  maxStock?: number
  showIcon?: boolean
  showProgressBar?: boolean
  showReorderAlert?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  lowStockThreshold: 5,
  reorderPoint: 10,
  maxStock: 0,
  showIcon: false,
  showProgressBar: false,
  showReorderAlert: true,
  size: 'md',
})

const {
  getStockStatus,
  getStockStatusClasses,
  getStockIndicatorClasses,
  formatStockQuantity,
  getStockLevelPercentage,
  needsReorder: checkNeedsReorder,
} = useInventory()

// Computed properties
const stockStatus = computed(() =>
  getStockStatus(props.stockQuantity, props.lowStockThreshold, props.reorderPoint),
)

const stockStatusClasses = computed(() => {
  const baseClasses = getStockStatusClasses(stockStatus.value)

  // Add size variations
  if (props.size === 'sm') {
    return baseClasses.replace('px-2 py-1', 'px-1.5 py-0.5').replace('text-xs', 'text-xs')
  }
  else if (props.size === 'lg') {
    return baseClasses.replace('px-2 py-1', 'px-3 py-1.5').replace('text-xs', 'text-sm')
  }

  return baseClasses
})

const stockIndicatorClasses = computed(() =>
  getStockIndicatorClasses(stockStatus.value),
)

const stockLevelPercentage = computed(() =>
  getStockLevelPercentage(props.stockQuantity, props.maxStock),
)

const needsReorder = computed(() =>
  checkNeedsReorder(props.stockQuantity, props.reorderPoint),
)
</script>
