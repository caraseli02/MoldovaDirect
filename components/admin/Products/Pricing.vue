<!--
  Product Pricing Component

  Handles product pricing fields with mobile optimizations
  Extracted from ProductForm.vue for better maintainability

  Features:
  - Price and compare price inputs with validation
  - Mobile-friendly numeric inputs
  - Real-time discount calculation
  - Touch optimizations and haptic feedback
  - Currency formatting and validation
-->

<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-6">
      {{ $t('admin.products.sections.pricing') }}
    </h3>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Price -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {{ $t('admin.products.fields.price') }} *
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span class="text-gray-500 dark:text-gray-400">€</span>
          </div>
          <input
            ref="priceInput"
            v-model.number="localForm.price"
            type="number"
            step="0.01"
            min="0"
            :placeholder="$t('admin.products.placeholders.price')"
            class="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white touch-manipulation"
            :class="{
              'border-red-500': errors?.price,
              'min-h-[44px]': isMobile,
            }"
            @input="handlePriceInput"
            @focus="handleInputFocus"
            @blur="handleInputBlur"
          />
        </div>
        <p
          v-if="errors?.price"
          class="mt-1 text-sm text-red-600"
        >
          {{ errors.price }}
        </p>
        <p
          v-if="formattedPrice && localForm.price"
          class="mt-1 text-xs text-gray-500 dark:text-gray-400"
        >
          {{ $t('admin.products.hints.displayPrice', { price: formattedPrice }) }}
        </p>
      </div>

      <!-- Compare Price -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {{ $t('admin.products.fields.comparePrice') }}
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span class="text-gray-500 dark:text-gray-400">€</span>
          </div>
          <input
            v-model.number="localForm.comparePrice"
            type="number"
            step="0.01"
            min="0"
            :placeholder="$t('admin.products.placeholders.comparePrice')"
            class="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white touch-manipulation"
            :class="{
              'border-red-500': errors?.comparePrice,
              'min-h-[44px]': isMobile,
              'border-orange-300 bg-orange-50 dark:bg-orange-900/20': comparePriceWarning,
            }"
            @input="handleComparePriceInput"
            @focus="handleInputFocus"
            @blur="handleInputBlur"
          />
          <!-- Warning icon for invalid compare price -->
          <div
            v-if="comparePriceWarning"
            class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
          >
            <commonIcon
              name="lucide:alert-triangle"
              class="w-5 h-5 text-orange-500"
            />
          </div>
        </div>
        <p
          v-if="errors?.comparePrice"
          class="mt-1 text-sm text-red-600"
        >
          {{ errors.comparePrice }}
        </p>
        <p
          v-if="comparePriceWarning"
          class="mt-1 text-sm text-orange-600 dark:text-orange-400"
        >
          {{ $t('admin.products.warnings.comparePriceTooLow') }}
        </p>
        <p
          v-if="discountPercentage && !comparePriceWarning"
          class="mt-1 text-xs text-green-600 dark:text-green-400"
        >
          {{ $t('admin.products.hints.discount', { percentage: discountPercentage }) }}
        </p>
      </div>
    </div>

    <!-- Pricing Summary Card -->
    <div
      v-if="pricingSummary"
      class="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
    >
      <h4 class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
        {{ $t('admin.products.sections.pricingSummary') }}
      </h4>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <!-- Current Price -->
        <div class="text-center">
          <div class="text-lg font-bold text-gray-900 dark:text-gray-100">
            {{ formattedPrice }}
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400">
            {{ $t('admin.products.labels.currentPrice') }}
          </div>
        </div>

        <!-- Original Price (if on sale) -->
        <div
          v-if="localForm.comparePrice && discountPercentage"
          class="text-center"
        >
          <div class="text-lg font-bold text-gray-500 dark:text-gray-400 line-through">
            {{ formattedComparePrice }}
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400">
            {{ $t('admin.products.labels.originalPrice') }}
          </div>
        </div>

        <!-- Discount -->
        <div
          v-if="discountPercentage && !comparePriceWarning"
          class="text-center"
        >
          <div class="text-lg font-bold text-green-600 dark:text-green-400">
            -{{ discountPercentage }}%
          </div>
          <div class="text-xs text-green-600 dark:text-green-400">
            {{ $t('admin.products.labels.discount') }}
          </div>
        </div>
      </div>

      <!-- Profit Margin (if cost is available) -->
      <div
        v-if="profitMargin"
        class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600"
      >
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-600 dark:text-gray-400">
            {{ $t('admin.products.labels.profitMargin') }}
          </span>
          <span
            class="text-sm font-medium"
            :class="{
              'text-green-600 dark:text-green-400': profitMargin >= 20,
              'text-yellow-600 dark:text-yellow-400': profitMargin >= 10 && profitMargin < 20,
              'text-red-600 dark:text-red-400': profitMargin < 10,
            }"
          >
            {{ profitMargin }}%
          </span>
        </div>
      </div>
    </div>

    <!-- Mobile Price Preview -->
    <div
      v-if="isMobile && (localForm.price || localForm.comparePrice)"
      class="mt-6"
    >
      <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div class="flex items-center mb-2">
          <commonIcon
            name="lucide:smartphone"
            class="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2"
          />
          <span class="text-sm font-medium text-blue-800 dark:text-blue-200">
            {{ $t('admin.products.preview.mobileTitle') }}
          </span>
        </div>

        <div class="flex items-center space-x-2">
          <!-- Current Price -->
          <span class="text-lg font-bold text-blue-900 dark:text-blue-100">
            {{ formattedPrice }}
          </span>

          <!-- Compare Price -->
          <span
            v-if="localForm.comparePrice && discountPercentage"
            class="text-sm text-gray-500 line-through"
          >
            {{ formattedComparePrice }}
          </span>

          <!-- Discount Badge -->
          <span
            v-if="discountPercentage && !comparePriceWarning"
            class="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium"
          >
            -{{ discountPercentage }}%
          </span>
        </div>

        <p class="text-xs text-blue-700 dark:text-blue-300 mt-2">
          {{ $t('admin.products.preview.mobileDescription') }}
        </p>
      </div>
    </div>

    <!-- Pricing Tips for Mobile -->
    <div
      v-if="isMobile && showPricingTips"
      class="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg"
    >
      <div class="flex items-start space-x-3">
        <commonIcon
          name="lucide:euro"
          class="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0"
        />
        <div class="text-sm text-green-800 dark:text-green-200">
          <p class="font-medium mb-1">
            {{ $t('admin.products.tips.pricingTitle') }}
          </p>
          <ul class="space-y-1 text-xs">
            <li>{{ $t('admin.products.tips.pricing1') }}</li>
            <li>{{ $t('admin.products.tips.pricing2') }}</li>
            <li>{{ $t('admin.products.tips.pricing3') }}</li>
          </ul>
        </div>
        <button
          class="text-green-600 dark:text-green-400 touch-manipulation p-1"
          @click="showPricingTips = false"
          @touchstart="vibrate('tap')"
        >
          <commonIcon
            name="lucide:x"
            class="w-4 h-4"
          />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: {
    price: number
    comparePrice: number | null
  }
  errors?: Record<string, any>
  disabled?: boolean
  costPrice?: number // Optional cost price for profit margin calculation
}

interface Emits {
  (e: 'update:modelValue', value: Props['modelValue']): void
  (e: 'validate'): void
  (e: 'price-calculated', data: { discount?: number, margin?: number }): void
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})

const emit = defineEmits<Emits>()

// Composables
const { isMobile } = useDevice()
const { vibrate } = useHapticFeedback()
const { t: _t } = useI18n()

// Template refs
const priceInput = ref<HTMLInputElement>()

// Local state
const localForm = ref({ ...props.modelValue })
const showPricingTips = ref(isMobile.value)
const isFocused = ref(false)

// Computed
const formattedPrice = computed(() => {
  if (!localForm.value.price) return ''
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
  }).format(localForm.value.price)
})

const formattedComparePrice = computed(() => {
  if (!localForm.value.comparePrice) return ''
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
  }).format(localForm.value.comparePrice)
})

const discountPercentage = computed(() => {
  if (!localForm.value.price || !localForm.value.comparePrice) return null
  if (localForm.value.comparePrice <= localForm.value.price) return null

  const discount = Math.round(
    ((localForm.value.comparePrice - localForm.value.price) / localForm.value.comparePrice) * 100,
  )

  return discount > 0 ? discount : null
})

const comparePriceWarning = computed(() => {
  if (!localForm.value.price || !localForm.value.comparePrice) return false
  return localForm.value.comparePrice <= localForm.value.price
})

const profitMargin = computed(() => {
  if (!props.costPrice || !localForm.value.price) return null
  if (props.costPrice >= localForm.value.price) return 0

  return Math.round(
    ((localForm.value.price - props.costPrice) / localForm.value.price) * 100,
  )
})

const pricingSummary = computed(() => {
  return localForm.value.price || localForm.value.comparePrice
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

const handlePriceInput = () => {
  // Ensure price is not negative
  if (localForm.value.price < 0) {
    localForm.value.price = 0
  }

  updateModel()
  emitCalculations()

  if (isMobile.value) {
    vibrate('light')
  }
}

const handleComparePriceInput = () => {
  // Ensure compare price is not negative
  if (localForm.value.comparePrice && localForm.value.comparePrice < 0) {
    localForm.value.comparePrice = 0
  }

  updateModel()
  emitCalculations()

  if (isMobile.value) {
    vibrate('light')
  }
}

const updateModel = () => {
  emit('update:modelValue', { ...localForm.value })
}

const emitCalculations = () => {
  const data: { discount?: number, margin?: number } = {}

  if (discountPercentage.value) {
    data.discount = discountPercentage.value
  }

  if (profitMargin.value !== null) {
    data.margin = profitMargin.value
  }

  emit('price-calculated', data)
}

// Watch for prop changes
watch(() => props.modelValue, (newValue) => {
  localForm.value = { ...newValue }
}, { deep: true })

// Watch for compare price warnings and provide haptic feedback
watch(comparePriceWarning, (hasWarning) => {
  if (hasWarning && isMobile.value) {
    vibrate('warning')
  }
})

// Auto-focus price input on desktop
onMounted(() => {
  if (!isMobile.value && priceInput.value) {
    nextTick(() => {
      setTimeout(() => {
        priceInput.value?.focus()
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

/* Smooth transitions */
.transition-colors {
  transition-property: background-color, border-color, color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
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
</style>"
