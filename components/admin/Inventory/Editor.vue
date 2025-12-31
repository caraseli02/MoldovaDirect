<!--
  Inline Inventory Editor Component

  Requirements addressed:
  - 2.3: Click-to-edit stock quantity with input validation
  - 2.4: Inventory update API with positive number validation

  Features:
  - Click-to-edit functionality
  - Input validation for positive numbers
  - Real-time updates
  - Loading states
  - Error handling
-->

<template>
  <div class="inline-flex items-center space-x-2">
    <!-- Display Mode -->
    <div
      v-if="!isEditing"
      class="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-2 py-1 transition-colors"
      :title="'Click to edit stock quantity'"
      @click="startEditing"
    >
      <AdminInventoryStockIndicator
        :stock-quantity="currentQuantity"
        :low-stock-threshold="lowStockThreshold"
        :reorder-point="reorderPoint"
        show-icon
        show-reorder-alert
        :size="size"
      />
    </div>

    <!-- Edit Mode -->
    <div
      v-else
      class="flex items-center space-x-2"
    >
      <div class="relative">
        <input
          ref="inputRef"
          v-model="editValue"
          type="number"
          min="0"
          step="1"
          :class="[
            'w-20 px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            hasError ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600',
            'dark:bg-gray-700 dark:text-white',
          ]"
          :disabled="isUpdating"
          @keydown.enter="saveChanges"
          @keydown.escape="cancelEditing"
          @blur="saveChanges"
        />

        <!-- Loading Spinner -->
        <div
          v-if="isUpdating"
          class="absolute right-2 top-1/2 transform -translate-y-1/2"
        >
          <svg
            class="animate-spin h-4 w-4 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center space-x-1">
        <UiButton
          :disabled="isUpdating || hasError"
          variant="ghost"
          size="icon"
          class="h-6 w-6 text-green-600 hover:text-green-700"
          :aria-label="$t('common.save')"
          @click="saveChanges"
        >
          <commonIcon
            name="lucide:check"
            class="h-4 w-4"
          />
        </UiButton>
        <UiButton
          :disabled="isUpdating"
          variant="ghost"
          size="icon"
          class="h-6 w-6"
          :aria-label="$t('common.cancel')"
          @click="cancelEditing"
        >
          <commonIcon
            name="lucide:x"
            class="h-4 w-4"
          />
        </UiButton>
      </div>
    </div>

    <!-- Error Message -->
    <div
      v-if="hasError && errorMessage"
      class="text-xs text-red-600 dark:text-red-400 mt-1"
    >
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  productId: number
  stockQuantity: number
  lowStockThreshold?: number
  reorderPoint?: number
  size?: 'sm' | 'md' | 'lg'
  reason?: string
}

interface Emits {
  (e: 'updated', data: { productId: number, newQuantity: number, oldQuantity: number }): void
  (e: 'error', error: string): void
}

const props = withDefaults(defineProps<Props>(), {
  lowStockThreshold: 5,
  reorderPoint: 10,
  size: 'sm',
  reason: 'manual_adjustment',
})

const emit = defineEmits<Emits>()

// Composables
const { validateStockQuantity } = useInventory()
// Store - safely access with fallback
let adminProductsStore: Record<string, any> = {}

try {
  if (import.meta.client) {
    adminProductsStore = useAdminProductsStore() as Record<string, any>
  }
}
catch {
  console.warn('Admin products store not available during SSR/hydration')
}

if (!adminProductsStore || Object.keys(adminProductsStore).length === 0) {
  adminProductsStore = {
    // Add fallback properties as needed
    products: ref([]),
    isLoading: ref(false),
    updateProduct: () => Promise.resolve(),
  }
}

// Reactive state
const isEditing = ref(false)
const isUpdating = ref(false)
const editValue = ref('')
const currentQuantity = ref(props.stockQuantity)
const errorMessage = ref('')
const inputRef = ref<HTMLInputElement>()

// Computed
const hasError = computed(() => {
  if (!isEditing.value || editValue.value === '') return false
  const validation = validateStockQuantity(editValue.value)
  return !validation.isValid
})

// Watch for validation errors
watch([isEditing, editValue], () => {
  if (!isEditing.value || editValue.value === '') {
    errorMessage.value = ''
    return
  }
  const validation = validateStockQuantity(editValue.value)
  errorMessage.value = validation.error || ''
})

// Watch for prop changes
watch(() => props.stockQuantity, (newQuantity) => {
  currentQuantity.value = newQuantity
})

// Methods
const startEditing = () => {
  if (isUpdating.value) return

  isEditing.value = true
  editValue.value = currentQuantity.value.toString()
  errorMessage.value = ''

  nextTick(() => {
    inputRef.value?.focus()
    inputRef.value?.select()
  })
}

const cancelEditing = () => {
  isEditing.value = false
  editValue.value = ''
  errorMessage.value = ''
}

const saveChanges = async () => {
  if (hasError.value || isUpdating.value) return

  const validation = validateStockQuantity(editValue.value)
  if (!validation.isValid || validation.value === undefined) {
    errorMessage.value = validation.error || 'Invalid quantity'
    return
  }

  const newQuantity = validation.value
  const oldQuantity = currentQuantity.value

  // No change, just cancel editing
  if (newQuantity === oldQuantity) {
    cancelEditing()
    return
  }

  isUpdating.value = true

  try {
    await adminProductsStore.updateInventory(
      props.productId,
      newQuantity,
      props.reason,
      `Updated from ${oldQuantity} to ${newQuantity}`,
    )

    currentQuantity.value = newQuantity

    emit('updated', {
      productId: props.productId,
      newQuantity,
      oldQuantity,
    })

    cancelEditing()
  }
  catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to update inventory'
    errorMessage.value = errorMsg
    emit('error', errorMsg)
  }
  finally {
    isUpdating.value = false
  }
}

// Keyboard shortcuts
const handleKeydown = (event: KeyboardEvent) => {
  if (!isEditing.value) return

  if (event.key === 'Enter') {
    event.preventDefault()
    saveChanges()
  }
  else if (event.key === 'Escape') {
    event.preventDefault()
    cancelEditing()
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>
