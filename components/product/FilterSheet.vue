<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        role="presentation"
        @click="handleBackdropClick"
      ></div>
    </Transition>

    <Transition
      enter-active-class="transition-transform duration-300 ease-out"
      enter-from-class="translate-y-full"
      enter-to-class="translate-y-0"
      leave-active-class="transition-transform duration-200 ease-in"
      leave-from-class="translate-y-0"
      leave-to-class="translate-y-full"
    >
      <div
        v-if="modelValue"
        ref="sheetRef"
        class="fixed inset-x-0 bottom-0 z-50 flex max-h-[90vh] flex-col rounded-t-3xl bg-white dark:bg-gray-900 shadow-2xl"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <!-- Drag Handle -->
        <div class="flex justify-center px-4 pt-4">
          <div
            class="h-1.5 w-12 rounded-full bg-gray-300 dark:bg-gray-700"
            aria-hidden="true"
          ></div>
          <span class="sr-only">{{ t('products.filters.swipeToClose') }}</span>
        </div>

        <!-- Header -->
        <div class="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div class="flex items-center gap-3">
            <h2
              :id="titleId"
              class="text-xl font-semibold text-gray-900 dark:text-white"
            >
              {{ title }}
            </h2>
            <span
              v-if="activeFilterCount > 0"
              class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white"
              :aria-label="t('products.filters.activeCount', { count: activeFilterCount })"
            >
              {{ activeFilterCount }}
            </span>
          </div>
          <button
            type="button"
            class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            :aria-label="t('common.close')"
            @click="handleClose"
          >
            <commonIcon
              name="lucide:x"
              class="h-5 w-5"
              aria-hidden="true"
            />
          </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto overscroll-contain px-6 py-4">
          <slot></slot>
        </div>

        <!-- Footer -->
        <div class="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 px-6 py-4">
          <div class="flex gap-3">
            <UiButton
              v-if="showClearButton && activeFilterCount > 0"
              type="button"
              variant="outline"
              class="flex-1"
              @click="handleClear"
            >
              {{ clearButtonLabel || t('products.filters.clear') }}
            </UiButton>
            <UiButton
              type="button"
              class="flex-1"
              @click="handleApply"
            >
              {{ applyButtonLabel || t('products.filters.apply', { count: filteredCount }) }}
            </UiButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useHapticFeedback } from '~/composables/useHapticFeedback'
import commonIcon from '~/components/common/Icon.vue'

interface Props {
  modelValue: boolean
  title?: string
  activeFilterCount?: number
  filteredCount?: number
  showClearButton?: boolean
  clearButtonLabel?: string
  applyButtonLabel?: string
  closeOnBackdrop?: boolean
  swipeToClose?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Filters',
  activeFilterCount: 0,
  filteredCount: 0,
  showClearButton: true,
  closeOnBackdrop: true,
  swipeToClose: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'apply': []
  'clear': []
  'close': []
}>()

const { t } = useI18n()
const { vibrate } = useHapticFeedback()

const titleId = `filter-sheet-title-${Math.random().toString(36).substr(2, 9)}`
const sheetRef = ref<HTMLElement>()

// Touch/swipe handling
const touchStartY = ref(0)
const touchCurrentY = ref(0)
const isDragging = ref(false)
const SWIPE_THRESHOLD = 100 // pixels to trigger close

const handleTouchStart = (e: TouchEvent) => {
  if (!props.swipeToClose) return

  const touch = e.touches[0]
  if (!touch) return

  touchStartY.value = touch.clientY
  touchCurrentY.value = touch.clientY
  isDragging.value = true
}

const handleTouchMove = (e: TouchEvent) => {
  if (!props.swipeToClose || !isDragging.value) return

  const touch = e.touches[0]
  if (!touch) return

  touchCurrentY.value = touch.clientY

  const deltaY = touchCurrentY.value - touchStartY.value

  // Only allow dragging down
  if (deltaY > 0 && sheetRef.value) {
    sheetRef.value.style.transform = `translateY(${deltaY}px)`
  }
}

const handleTouchEnd = () => {
  if (!props.swipeToClose || !isDragging.value) return

  const deltaY = touchCurrentY.value - touchStartY.value

  if (deltaY > SWIPE_THRESHOLD) {
    vibrate('light')
    handleClose()
  }
  else if (sheetRef.value) {
    // Reset position
    sheetRef.value.style.transform = ''
  }

  isDragging.value = false
  touchStartY.value = 0
  touchCurrentY.value = 0
}

const handleBackdropClick = () => {
  if (props.closeOnBackdrop) {
    handleClose()
  }
}

const handleClose = () => {
  emit('update:modelValue', false)
  emit('close')
}

const handleApply = () => {
  vibrate('success')
  emit('apply')
}

const handleClear = () => {
  vibrate('light')
  emit('clear')
}

// Lock body scroll when sheet is open
watch(() => props.modelValue, async (isOpen) => {
  await nextTick()

  if (isOpen) {
    document.body.style.overflow = 'hidden'
    vibrate('light')
  }
  else {
    document.body.style.overflow = ''
  }
})

// Cleanup on unmount
onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>
