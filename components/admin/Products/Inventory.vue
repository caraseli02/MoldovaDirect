<!--
  Product Inventory Component

  Handles product inventory management with mobile optimizations
  Extracted from ProductForm.vue for better maintainability

  Features:
  - Stock quantity and threshold management
  - Mobile-friendly numeric inputs
  - Real-time stock level indicators
  - Touch optimizations and haptic feedback
  - Inventory alerts and warnings
-->

<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-medium text-gray-900 dark:text-white">
        {{ $t('admin.products.sections.inventory') }}
      </h3>

      <!-- Stock Status Badge -->
      <div
        v-if="stockStatus"
        class="flex items-center"
      >
        <span
          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
          :class="stockStatusClasses"
        >
          <commonIcon
            :name="stockStatusIcon"
            class="w-3 h-3 mr-1"
          />
          {{ stockStatusText }}
        </span>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Stock Quantity -->
      <div>
        <UiLabel>{{ $t('admin.products.fields.stockQuantity') }} *</UiLabel>
        <div class="relative">
          <UiInput
            ref="stockInput"
            v-model.number="localForm.stockQuantity"
            type="number"
            min="0"
            :placeholder="$t('admin.products.placeholders.stockQuantity')"
            :class="{ 'border-red-500': errors?.stockQuantity, 'min-h-[44px]': isMobile, 'pr-16': isLowStock || isOutOfStock }"
            @input="handleStockQuantityInput"
            @focus="handleInputFocus"
            @blur="handleInputBlur"
          />

          <!-- Stock Level Indicator -->
          <div
            v-if="isLowStock || isOutOfStock"
            class="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <commonIcon
              :name="stockWarningIcon"
              :class="stockWarningClasses"
              class="w-5 h-5"
            />
          </div>

          <!-- Quick Stock Actions -->
          <div
            v-if="isMobile"
            class="flex mt-2 space-x-2"
          >
            <UiButton
              :disabled="localForm.stockQuantity <= 0"
              type="button"
              @click="adjustStock(-1)"
              @touchstart="vibrate('tap')"
            >
              <commonIcon
                name="lucide:minus"
                class="w-4 h-4 mx-auto"
              />
            </UiButton>
            <UiButton
              type="button"
              @click="adjustStock(1)"
              @touchstart="vibrate('tap')"
            >
              <commonIcon
                name="lucide:plus"
                class="w-4 h-4 mx-auto"
              />
            </UiButton>
            <UiButton
              type="button"
              @click="showQuickStockModal = true"
              @touchstart="vibrate('tap')"
            >
              <commonIcon
                name="lucide:square-pen"
                class="w-4 h-4 mx-auto"
              />
            </UiButton>
          </div>
        </div>

        <p
          v-if="errors?.stockQuantity"
          class="mt-1 text-sm text-red-600"
        >
          {{ errors.stockQuantity }}
        </p>

        <div
          v-if="stockMessage"
          class="mt-2 p-2 rounded-lg"
          :class="stockMessageClasses"
        >
          <div class="flex items-center text-sm">
            <commonIcon
              :name="stockMessageIcon"
              class="w-4 h-4 mr-2 flex-shrink-0"
            />
            <span>{{ stockMessage }}</span>
          </div>
        </div>
      </div>

      <!-- Low Stock Threshold -->
      <div>
        <UiLabel>{{ $t('admin.products.fields.lowStockThreshold') }}</UiLabel>
        <UiInput
          v-model.number="localForm.lowStockThreshold"
          type="number"
          min="0"
          :placeholder="$t('admin.products.placeholders.lowStockThreshold')"
          :class="{ 'border-red-500': errors?.lowStockThreshold, 'min-h-[44px]': isMobile }"
          @input="handleLowStockThresholdInput"
          @focus="handleInputFocus"
          @blur="handleInputBlur"
        />
        <p
          v-if="errors?.lowStockThreshold"
          class="mt-1 text-sm text-red-600"
        >
          {{ errors.lowStockThreshold }}
        </p>
        <p
          v-if="localForm.lowStockThreshold"
          class="mt-1 text-xs text-gray-500 dark:text-gray-400"
        >
          {{ $t('admin.products.hints.lowStockThreshold', { threshold: localForm.lowStockThreshold }) }}
        </p>
      </div>
    </div>

    <!-- Inventory Insights -->
    <div
      v-if="inventoryInsights"
      class="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
    >
      <h4 class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
        {{ $t('admin.products.sections.inventoryInsights') }}
      </h4>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Current Stock -->
        <div class="text-center">
          <div
            class="text-2xl font-bold"
            :class="stockQuantityColor"
          >
            {{ localForm.stockQuantity || 0 }}
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {{ $t('admin.products.labels.currentStock') }}
          </div>
        </div>

        <!-- Days of Stock -->
        <div
          v-if="daysOfStock"
          class="text-center"
        >
          <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {{ daysOfStock }}
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {{ $t('admin.products.labels.daysOfStock') }}
          </div>
        </div>

        <!-- Reorder Point -->
        <div class="text-center">
          <div class="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {{ reorderPoint }}
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {{ $t('admin.products.labels.reorderPoint') }}
          </div>
        </div>

        <!-- Stock Value -->
        <div
          v-if="stockValue"
          class="text-center"
        >
          <div class="text-2xl font-bold text-green-600 dark:text-green-400">
            {{ formattedStockValue }}
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {{ $t('admin.products.labels.stockValue') }}
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Inventory Tips -->
    <div
      v-if="isMobile && showInventoryTips"
      class="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg"
    >
      <div class="flex items-start space-x-3">
        <commonIcon
          name="lucide:box"
          class="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0"
        />
        <div class="text-sm text-indigo-800 dark:text-indigo-200">
          <p class="font-medium mb-1">
            {{ $t('admin.products.tips.inventoryTitle') }}
          </p>
          <ul class="space-y-1 text-xs">
            <li>{{ $t('admin.products.tips.inventory1') }}</li>
            <li>{{ $t('admin.products.tips.inventory2') }}</li>
            <li>{{ $t('admin.products.tips.inventory3') }}</li>
          </ul>
        </div>
        <UiButton
          @click="showInventoryTips = false"
          @touchstart="vibrate('tap')"
        >
          <commonIcon
            name="lucide:x"
            class="w-4 h-4"
          />
        </UiButton>
      </div>
    </div>

    <!-- Quick Stock Modal for Mobile -->
    <div
      v-if="showQuickStockModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="showQuickStockModal = false"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            {{ $t('admin.products.modal.quickStock') }}
          </h3>
          <UiButton
            @click="showQuickStockModal = false"
            @touchstart="vibrate('tap')"
          >
            <commonIcon
              name="lucide:x"
              class="w-5 h-5"
            />
          </UiButton>
        </div>

        <div class="space-y-4">
          <!-- Quick Stock Input -->
          <div>
            <UiLabel>{{ $t('admin.products.fields.newStock') }}</UiLabel>
            <UiInput
              v-model.number="quickStockValue"
              type="number"
              min="0"
              @focus="vibrate('tap')"
            />
          </div>

          <!-- Quick Actions -->
          <div class="grid grid-cols-3 gap-2">
            <UiButton
              @click="setQuickStock(10)"
              @touchstart="vibrate('tap')"
            >
              10
            </UiButton>
            <UiButton
              @click="setQuickStock(50)"
              @touchstart="vibrate('tap')"
            >
              50
            </UiButton>
            <UiButton
              @click="setQuickStock(100)"
              @touchstart="vibrate('tap')"
            >
              100
            </UiButton>
          </div>

          <!-- Apply Button -->
          <UiButton
            @click="applyQuickStock"
            @touchstart="vibrate('tap')"
          >
            {{ $t('admin.products.actions.applyStock') }}
          </UiButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: {
    stockQuantity: number
    lowStockThreshold: number
  }
  errors?: Record<string, any>
  disabled?: boolean
  productPrice?: number // For stock value calculation
  averageDailySales?: number // For days of stock calculation
}

interface Emits {
  (e: 'update:modelValue', value: Props['modelValue']): void
  (e: 'validate'): void
  (e: 'stock-alert', data: { level: 'low' | 'out' | 'normal', quantity: number }): void
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})

const emit = defineEmits<Emits>()

// Composables
const { isMobile } = useDevice()
const { vibrate } = useHapticFeedback()
const { t } = useI18n()

// Template refs
const stockInput = ref<HTMLInputElement>()

// Local state
const localForm = ref({ ...props.modelValue })
const showInventoryTips = ref(isMobile.value)
const showQuickStockModal = ref(false)
const quickStockValue = ref(localForm.value.stockQuantity)
const isFocused = ref(false)

// Computed
const isOutOfStock = computed(() => {
  return localForm.value.stockQuantity <= 0
})

const isLowStock = computed(() => {
  if (isOutOfStock.value) return false
  return localForm.value.stockQuantity <= (localForm.value.lowStockThreshold || 5)
})

const stockStatus = computed(() => {
  return isOutOfStock.value || isLowStock.value || localForm.value.stockQuantity > 0
})

const stockStatusClasses = computed(() => {
  if (isOutOfStock.value) {
    return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
  }
  if (isLowStock.value) {
    return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
  }
  return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
})

const stockStatusIcon = computed(() => {
  if (isOutOfStock.value) return 'lucide:circle-x'
  if (isLowStock.value) return 'lucide:alert-triangle'
  return 'lucide:check-circle-2'
})

const stockStatusText = computed(() => {
  if (isOutOfStock.value) return t('admin.products.status.outOfStock')
  if (isLowStock.value) return t('admin.products.status.lowStock')
  return t('admin.products.status.inStock')
})

const stockWarningIcon = computed(() => {
  return isOutOfStock.value ? 'lucide:alert-circle' : 'lucide:alert-triangle'
})

const stockWarningClasses = computed(() => {
  return isOutOfStock.value ? 'text-red-500' : 'text-yellow-500'
})

const stockQuantityColor = computed(() => {
  if (isOutOfStock.value) return 'text-red-600 dark:text-red-400'
  if (isLowStock.value) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-green-600 dark:text-green-400'
})

const stockMessage = computed(() => {
  if (isOutOfStock.value) {
    return t('admin.products.messages.outOfStock')
  }
  if (isLowStock.value) {
    return t('admin.products.messages.lowStock', { threshold: localForm.value.lowStockThreshold || 5 })
  }
  if (localForm.value.stockQuantity > 100) {
    return t('admin.products.messages.highStock')
  }
  return ''
})

const stockMessageClasses = computed(() => {
  if (isOutOfStock.value) {
    return 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
  }
  if (isLowStock.value) {
    return 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300'
  }
  return 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300'
})

const stockMessageIcon = computed(() => {
  if (isOutOfStock.value) return 'lucide:alert-circle'
  if (isLowStock.value) return 'lucide:alert-triangle'
  return 'lucide:info'
})

const daysOfStock = computed(() => {
  if (!props.averageDailySales || props.averageDailySales <= 0 || localForm.value.stockQuantity <= 0) {
    return null
  }
  return Math.ceil(localForm.value.stockQuantity / props.averageDailySales)
})

const reorderPoint = computed(() => {
  // Simple reorder point calculation: low stock threshold + lead time buffer
  const leadTimeBuffer = 5 // days
  const dailySales = props.averageDailySales || 1
  return Math.max(localForm.value.lowStockThreshold || 5, leadTimeBuffer * dailySales)
})

const stockValue = computed(() => {
  if (!props.productPrice || localForm.value.stockQuantity <= 0) return null
  return localForm.value.stockQuantity * props.productPrice
})

const formattedStockValue = computed(() => {
  if (!stockValue.value) return ''
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
  }).format(stockValue.value)
})

const inventoryInsights = computed(() => {
  return localForm.value.stockQuantity > 0 || localForm.value.lowStockThreshold > 0
})

// Event handlers
const handleInputFocus = () => {
  isFocused.value = true
  if (isMobile.value) {
    vibrate('tap')
  }
}

const handleInputBlur = () => {
  isFocused.value = false
  emit('validate')
}

const handleStockQuantityInput = () => {
  // Ensure stock is not negative
  if (localForm.value.stockQuantity < 0) {
    localForm.value.stockQuantity = 0
  }

  updateModel()
  checkStockLevels()

  if (isMobile.value) {
    vibrate('light')
  }
}

const handleLowStockThresholdInput = () => {
  // Ensure threshold is not negative
  if (localForm.value.lowStockThreshold < 0) {
    localForm.value.lowStockThreshold = 0
  }

  updateModel()
  checkStockLevels()

  if (isMobile.value) {
    vibrate('light')
  }
}

const adjustStock = (adjustment: number) => {
  const newQuantity = Math.max(0, localForm.value.stockQuantity + adjustment)
  localForm.value.stockQuantity = newQuantity
  updateModel()
  checkStockLevels()

  if (isMobile.value) {
    vibrate(adjustment > 0 ? 'success' : 'medium')
  }
}

const setQuickStock = (value: number) => {
  quickStockValue.value = value
  vibrate('tap')
}

const applyQuickStock = () => {
  if (quickStockValue.value >= 0) {
    localForm.value.stockQuantity = quickStockValue.value
    updateModel()
    checkStockLevels()
    showQuickStockModal.value = false

    if (isMobile.value) {
      vibrate('success')
    }
  }
}

const updateModel = () => {
  emit('update:modelValue', { ...localForm.value })
}

const checkStockLevels = () => {
  let alertLevel: 'low' | 'out' | 'normal' = 'normal'

  if (isOutOfStock.value) {
    alertLevel = 'out'
  }
  else if (isLowStock.value) {
    alertLevel = 'low'
  }

  emit('stock-alert', {
    level: alertLevel,
    quantity: localForm.value.stockQuantity,
  })
}

// Watch for prop changes
watch(() => props.modelValue, (newValue) => {
  localForm.value = { ...newValue }
  quickStockValue.value = newValue.stockQuantity
}, { deep: true })

// Watch for stock level changes and provide haptic feedback
watch([isOutOfStock, isLowStock], ([outOfStock, lowStock], [prevOutOfStock, prevLowStock]) => {
  if (isMobile.value) {
    if (outOfStock && !prevOutOfStock) {
      vibrate('error')
    }
    else if (lowStock && !prevLowStock && !outOfStock) {
      vibrate('warning')
    }
    else if (!outOfStock && !lowStock && (prevOutOfStock || prevLowStock)) {
      vibrate('success')
    }
  }
})

// Auto-focus stock input on desktop
onMounted(() => {
  if (!isMobile.value && stockInput.value) {
    nextTick(() => {
      setTimeout(() => {
        stockInput.value?.focus()
      }, 100)
    })
  }
})
</script>

<style scoped>
.touch-manipulation {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.active\\:scale-95:active {
  transform: scale(0.95);
}

/* Enhanced focus states for accessibility */
input:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
  box-shadow: 0 0 0 2px white, 0 0 0 4px rgb(59 130 246);
}

@media (prefers-color-scheme: dark) {
  input:focus {
    box-shadow: 0 0 0 2px rgb(31 41 55), 0 0 0 4px rgb(59 130 246);
  }
}

/* Mobile number input optimization */
@media (max-width: 640px) {
  input[type="number"] {
    font-size: 16px; /* Prevents zoom on iOS */
  }
}

/* Number input styling */
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}

/* Smooth transitions */
.transition-colors {
  transition-property: background-color, border-color, color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}
</style>"
