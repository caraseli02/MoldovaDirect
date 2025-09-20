<template>
  <div
    ref="cartItemRef"
    :class="[
      'relative overflow-hidden rounded-lg border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800',
      'transition-all duration-300 ease-out',
      swipeOffset !== 0 ? 'shadow-lg' : '',
      isRemoving ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
    ]"
    :style="{ transform: `translateX(${swipeOffset}px)` }"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseEnd"
    @mouseleave="handleMouseEnd"
  >
    <!-- Remove Action Background -->
    <div
      :class="[
        'absolute inset-y-0 right-0 flex items-center justify-center',
        'bg-red-500 text-white transition-all duration-300',
        Math.abs(swipeOffset) > removeThreshold ? 'bg-red-600' : 'bg-red-500'
      ]"
      :style="{ width: `${Math.abs(swipeOffset)}px` }"
    >
      <div v-if="Math.abs(swipeOffset) > 20" class="flex items-center space-x-2 px-4">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        <span v-if="Math.abs(swipeOffset) > removeThreshold" class="text-sm font-medium">
          {{ $t('common.release_to_remove') }}
        </span>
        <span v-else class="text-sm">
          {{ $t('common.swipe_to_remove') }}
        </span>
      </div>
    </div>

    <!-- Cart Item Content -->
    <div class="relative bg-white dark:bg-gray-800 p-4">
      <!-- Selection Checkbox -->
      <div class="absolute top-2 left-2 z-10">
        <input
          type="checkbox"
          :checked="isSelected"
          @change="toggleSelection"
          class="w-5 h-5 text-blue-600 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded focus:ring-blue-500"
        >
      </div>

      <!-- Mobile Layout -->
      <div class="md:hidden pl-8">
        <!-- Product Image and Info Row -->
        <div class="flex items-start space-x-3 mb-3">
          <div class="flex-shrink-0">
            <CommonLazyImage
              :src="item.product.images[0] || '/placeholder-product.jpg'"
              :alt="item.product.name"
              container-class="w-20 h-20 rounded-lg"
              image-class="rounded-lg"
              aspect-ratio="1"
              root-margin="100px"
            />
          </div>

          <div class="flex-1 min-w-0">
            <h3 class="text-base font-medium text-gray-900 dark:text-white leading-tight mb-1">
              {{ item.product.name }}
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">
              {{ formatPrice(item.product.price) }} each
            </p>
            <p class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ formatPrice(item.product.price * item.quantity) }}
            </p>
          </div>
        </div>

        <!-- Quantity Controls and Actions Row -->
        <div class="space-y-3">
          <!-- Quantity Controls -->
          <div class="flex items-center bg-gray-50 dark:bg-gray-700 rounded-lg p-1 w-fit">
            <button
              @click="updateQuantity(item.quantity - 1)"
              :disabled="loading"
              :data-testid="`decrease-quantity-${item.product.id}`"
              class="w-11 h-11 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 active:bg-gray-100 dark:active:bg-gray-600 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
              </svg>
            </button>

            <div class="px-4 py-2 min-w-[3rem] text-center">
              <span class="text-lg font-medium text-gray-900 dark:text-white" :data-testid="`quantity-display-${item.product.id}`">
                {{ item.quantity }}
              </span>
            </div>

            <button
              @click="updateQuantity(item.quantity + 1)"
              :disabled="loading || item.quantity >= item.product.stock"
              :data-testid="`increase-quantity-${item.product.id}`"
              class="w-11 h-11 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 active:bg-gray-100 dark:active:bg-gray-600 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center justify-between">
            <!-- Save for Later Button -->
            <button
              @click="saveForLater"
              :disabled="loading"
              class="inline-flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              Guardar para después
            </button>

            <!-- Remove Button -->
            <button
              @click="removeItem"
              :disabled="loading"
              :data-testid="`remove-item-${item.product.id}`"
              class="w-11 h-11 rounded-md text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 active:bg-red-100 dark:active:bg-red-900/30 transition-colors flex items-center justify-center"
              :title="$t('common.remove')"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Desktop Layout -->
      <div class="hidden md:flex md:items-center md:space-x-4 pl-8">
        <!-- Product Image -->
        <div class="flex-shrink-0">
          <CommonLazyImage
            :src="item.product.images[0] || '/placeholder-product.jpg'"
            :alt="item.product.name"
            container-class="w-16 h-16 rounded-lg"
            image-class="rounded-lg"
            aspect-ratio="1"
            root-margin="100px"
          />
        </div>

        <!-- Product Info -->
        <div class="flex-1 min-w-0">
          <h3 class="text-sm font-medium text-gray-900 dark:text-white truncate">
            {{ item.product.name }}
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ formatPrice(item.product.price) }} each
          </p>
        </div>

        <!-- Quantity Controls -->
        <div class="flex items-center space-x-2">
          <button
            @click="updateQuantity(item.quantity - 1)"
            :disabled="loading"
            :data-testid="`decrease-quantity-${item.product.id}`"
            class="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
            </svg>
          </button>

          <span class="w-8 text-center text-sm font-medium text-gray-900 dark:text-white" :data-testid="`quantity-display-${item.product.id}`">
            {{ item.quantity }}
          </span>

          <button
            @click="updateQuantity(item.quantity + 1)"
            :disabled="loading || item.quantity >= item.product.stock"
            :data-testid="`increase-quantity-${item.product.id}`"
            class="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>

        <!-- Item Total -->
        <div class="text-right">
          <p class="text-sm font-medium text-gray-900 dark:text-white">
            {{ formatPrice(item.product.price * item.quantity) }}
          </p>
        </div>

        <!-- Actions -->
        <div class="flex items-center space-x-2">
          <!-- Save for Later Button -->
          <button
            @click="saveForLater"
            :disabled="loading"
            class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50 p-1"
            :title="'Guardar para después'"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>

          <!-- Remove Button -->
          <button
            @click="removeItem"
            :disabled="loading"
            :data-testid="`remove-item-${item.product.id}`"
            class="text-red-500 hover:text-red-700 disabled:opacity-50 p-1"
            :title="$t('common.remove')"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface CartItem {
  id: string
  product: {
    id: string
    slug: string
    name: string
    price: number
    images: string[]
    stock: number
  }
  quantity: number
  addedAt: Date
}

interface Props {
  item: CartItem
  loading: boolean
}

interface Emits {
  (e: 'update-quantity', itemId: string, quantity: number): void
  (e: 'remove-item', itemId: string): void
  (e: 'swipe-remove', itemId: string): void
  (e: 'save-for-later', itemId: string): void
  (e: 'toggle-selection', itemId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Get cart functionality for selection
const { isItemSelected } = useCart()

// Computed properties
const isSelected = computed(() => isItemSelected(props.item.id))

// Swipe functionality
const cartItemRef = ref<HTMLElement>()
const swipeOffset = ref(0)
const isDragging = ref(false)
const startX = ref(0)
const startY = ref(0)
const removeThreshold = 120
const isRemoving = ref(false)

// Touch/Mouse event handlers
const handleTouchStart = (e: TouchEvent) => {
  if (e.touches.length !== 1) return
  startDrag(e.touches[0].clientX, e.touches[0].clientY)
}

const handleMouseDown = (e: MouseEvent) => {
  startDrag(e.clientX, e.clientY)
}

const startDrag = (x: number, y: number) => {
  isDragging.value = true
  startX.value = x
  startY.value = y
  swipeOffset.value = 0
}

const handleTouchMove = (e: TouchEvent) => {
  if (!isDragging.value || e.touches.length !== 1) return
  e.preventDefault()
  updateDrag(e.touches[0].clientX, e.touches[0].clientY)
}

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value) return
  e.preventDefault()
  updateDrag(e.clientX, e.clientY)
}

const updateDrag = (x: number, y: number) => {
  const deltaX = x - startX.value
  const deltaY = y - startY.value

  // Only allow horizontal swipe if it's more horizontal than vertical
  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
    // Only allow left swipe (negative deltaX)
    if (deltaX < 0) {
      swipeOffset.value = Math.max(deltaX, -200) // Limit swipe distance
    }
  }
}

const handleTouchEnd = () => {
  endDrag()
}

const handleMouseEnd = () => {
  endDrag()
}

const endDrag = () => {
  if (!isDragging.value) return

  isDragging.value = false

  // Check if swipe threshold was reached
  if (Math.abs(swipeOffset.value) > removeThreshold) {
    // Trigger remove animation
    isRemoving.value = true
    swipeOffset.value = -300 // Animate off screen

    // Emit swipe remove event after animation
    setTimeout(() => {
      emit('swipe-remove', props.item.id)
    }, 300)
  } else {
    // Snap back to original position
    swipeOffset.value = 0
  }
}

// Utility functions
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

const updateQuantity = (newQuantity: number) => {
  emit('update-quantity', props.item.id, newQuantity)
}

const removeItem = () => {
  emit('remove-item', props.item.id)
}

const saveForLater = () => {
  emit('save-for-later', props.item.id)
}

const toggleSelection = () => {
  emit('toggle-selection', props.item.id)
}

// Cleanup on unmount
onUnmounted(() => {
  isDragging.value = false
  swipeOffset.value = 0
})
</script>