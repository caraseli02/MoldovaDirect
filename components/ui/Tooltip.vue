<template>
  <div class="relative inline-flex">
    <!-- Trigger Element -->
    <div
      ref="triggerRef"
      @mouseenter="show"
      @mouseleave="hide"
      @focus="show"
      @blur="hide"
      @touchstart="toggleTouch"
    >
      <slot name="trigger">
        <button
          type="button"
          class="inline-flex items-center justify-center rounded-full p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          :aria-label="ariaLabel"
        >
          <commonIcon :name="icon" class="h-4 w-4" />
        </button>
      </slot>
    </div>

    <!-- Tooltip Content -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="isVisible"
          ref="tooltipRef"
          class="absolute z-50 max-w-xs rounded-lg bg-gray-900 px-3 py-2 text-sm text-white shadow-elevated-lg dark:bg-gray-800"
          :style="tooltipStyle"
          role="tooltip"
        >
          <!-- Arrow -->
          <div
            class="absolute h-2 w-2 rotate-45 bg-gray-900 dark:bg-gray-800"
            :style="arrowStyle"
          />

          <!-- Content -->
          <div class="relative z-10">
            <slot>{{ content }}</slot>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Props {
  content?: string
  icon?: string
  ariaLabel?: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
}

const props = withDefaults(defineProps<Props>(), {
  content: '',
  icon: 'lucide:info',
  ariaLabel: 'More information',
  placement: 'top',
  delay: 200
})

const triggerRef = ref<HTMLElement>()
const tooltipRef = ref<HTMLElement>()
const isVisible = ref(false)
const tooltipPosition = ref({ top: 0, left: 0 })

let showTimeout: ReturnType<typeof setTimeout> | null = null
let touchTimeout: ReturnType<typeof setTimeout> | null = null

const tooltipStyle = computed(() => ({
  top: `${tooltipPosition.value.top}px`,
  left: `${tooltipPosition.value.left}px`
}))

const arrowStyle = computed(() => {
  const placement = props.placement
  if (placement === 'top') {
    return { bottom: '-4px', left: '50%', transform: 'translateX(-50%)' }
  } else if (placement === 'bottom') {
    return { top: '-4px', left: '50%', transform: 'translateX(-50%)' }
  } else if (placement === 'left') {
    return { right: '-4px', top: '50%', transform: 'translateY(-50%)' }
  } else {
    return { left: '-4px', top: '50%', transform: 'translateY(-50%)' }
  }
})

const calculatePosition = () => {
  if (!triggerRef.value || !tooltipRef.value) return

  const triggerRect = triggerRef.value.getBoundingClientRect()
  const tooltipRect = tooltipRef.value.getBoundingClientRect()
  const scrollY = window.scrollY
  const scrollX = window.scrollX
  const gap = 8 // Gap between trigger and tooltip

  let top = 0
  let left = 0

  switch (props.placement) {
    case 'top':
      top = triggerRect.top + scrollY - tooltipRect.height - gap
      left = triggerRect.left + scrollX + (triggerRect.width - tooltipRect.width) / 2
      break
    case 'bottom':
      top = triggerRect.bottom + scrollY + gap
      left = triggerRect.left + scrollX + (triggerRect.width - tooltipRect.width) / 2
      break
    case 'left':
      top = triggerRect.top + scrollY + (triggerRect.height - tooltipRect.height) / 2
      left = triggerRect.left + scrollX - tooltipRect.width - gap
      break
    case 'right':
      top = triggerRect.top + scrollY + (triggerRect.height - tooltipRect.height) / 2
      left = triggerRect.right + scrollX + gap
      break
  }

  // Keep tooltip within viewport
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  if (left < scrollX) left = scrollX + 8
  if (left + tooltipRect.width > scrollX + viewportWidth) {
    left = scrollX + viewportWidth - tooltipRect.width - 8
  }
  if (top < scrollY) top = scrollY + 8
  if (top + tooltipRect.height > scrollY + viewportHeight) {
    top = scrollY + viewportHeight - tooltipRect.height - 8
  }

  tooltipPosition.value = { top, left }
}

const show = () => {
  if (showTimeout) clearTimeout(showTimeout)
  showTimeout = setTimeout(() => {
    isVisible.value = true
    // Wait for next tick to ensure tooltip is rendered
    requestAnimationFrame(() => {
      requestAnimationFrame(calculatePosition)
    })
  }, props.delay)
}

const hide = () => {
  if (showTimeout) {
    clearTimeout(showTimeout)
    showTimeout = null
  }
  isVisible.value = false
}

const toggleTouch = () => {
  // Handle touch devices - toggle visibility
  if (isVisible.value) {
    hide()
  } else {
    show()
    // Auto-hide after 3 seconds on touch
    if (touchTimeout) clearTimeout(touchTimeout)
    touchTimeout = setTimeout(hide, 3000)
  }
}

// Update position on scroll/resize
const updatePosition = () => {
  if (isVisible.value) {
    calculatePosition()
  }
}

onMounted(() => {
  window.addEventListener('scroll', updatePosition, { passive: true })
  window.addEventListener('resize', updatePosition, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', updatePosition)
  window.removeEventListener('resize', updatePosition)
  if (showTimeout) clearTimeout(showTimeout)
  if (touchTimeout) clearTimeout(touchTimeout)
})
</script>
