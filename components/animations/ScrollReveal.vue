<template>
  <div ref="target" :class="wrapperClass">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { useIntersectionObserver, useReducedMotion } from '@vueuse/core'

export interface ScrollRevealProps {
  /**
   * Animation preset: 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'zoom-in' | 'zoom-out'
   * @default 'fade-up'
   */
  preset?: 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'zoom-in' | 'zoom-out'
  /**
   * Delay before animation starts (ms)
   * @default 0
   */
  delay?: number
  /**
   * Animation duration (ms)
   * @default 600
   */
  duration?: number
  /**
   * Threshold for intersection observer (0-1)
   * @default 0.1
   */
  threshold?: number
  /**
   * Enable stagger effect for child elements
   * @default false
   */
  stagger?: boolean
  /**
   * Stagger delay between child elements (ms)
   * @default 100
   */
  staggerDelay?: number
  /**
   * Only animate once (don't re-trigger on scroll)
   * @default true
   */
  once?: boolean
  /**
   * Custom CSS class for wrapper
   */
  wrapperClass?: string
}

const props = withDefaults(defineProps<ScrollRevealProps>(), {
  preset: 'fade-up',
  delay: 0,
  duration: 600,
  threshold: 0.1,
  stagger: false,
  staggerDelay: 100,
  once: true,
  wrapperClass: ''
})

const target = ref<HTMLElement | null>(null)
const hasAnimated = ref(false)
const prefersReducedMotion = useReducedMotion()

// Animation state classes
const getInitialTransform = () => {
  switch (props.preset) {
    case 'fade-up':
      return 'translate-y-12 opacity-0'
    case 'fade-down':
      return '-translate-y-12 opacity-0'
    case 'fade-left':
      return 'translate-x-12 opacity-0'
    case 'fade-right':
      return '-translate-x-12 opacity-0'
    case 'zoom-in':
      return 'scale-95 opacity-0'
    case 'zoom-out':
      return 'scale-105 opacity-0'
    default:
      return 'translate-y-12 opacity-0'
  }
}

const getFinalTransform = () => {
  return 'translate-x-0 translate-y-0 scale-100 opacity-100'
}

// Apply animation
const animate = () => {
  if (!target.value || hasAnimated.value || prefersReducedMotion.value) {
    return
  }

  hasAnimated.value = true

  // Add will-change hint for performance
  target.value.style.willChange = 'transform, opacity'

  // Apply initial state
  target.value.style.transition = 'none'
  target.value.className = `${props.wrapperClass} ${getInitialTransform()}`

  // Force reflow
  target.value.offsetHeight

  // Apply animation
  requestAnimationFrame(() => {
    if (!target.value) return

    target.value.style.transition = `transform ${props.duration}ms cubic-bezier(0.4, 0, 0.2, 1) ${props.delay}ms, opacity ${props.duration}ms cubic-bezier(0.4, 0, 0.2, 1) ${props.delay}ms`
    target.value.className = `${props.wrapperClass} ${getFinalTransform()}`

    // Handle stagger effect
    if (props.stagger) {
      const children = Array.from(target.value.children) as HTMLElement[]
      children.forEach((child, index) => {
        child.style.willChange = 'transform, opacity'
        child.style.transition = 'none'
        child.className = `${child.className} ${getInitialTransform()}`

        // Force reflow
        child.offsetHeight

        requestAnimationFrame(() => {
          const staggeredDelay = props.delay + (index * props.staggerDelay)
          child.style.transition = `transform ${props.duration}ms cubic-bezier(0.4, 0, 0.2, 1) ${staggeredDelay}ms, opacity ${props.duration}ms cubic-bezier(0.4, 0, 0.2, 1) ${staggeredDelay}ms`
          child.className = child.className.replace(getInitialTransform(), getFinalTransform())
        })
      })
    }

    // Remove will-change after animation completes
    setTimeout(() => {
      if (target.value) {
        target.value.style.willChange = 'auto'
        if (props.stagger) {
          const children = Array.from(target.value.children) as HTMLElement[]
          children.forEach((child) => {
            child.style.willChange = 'auto'
          })
        }
      }
    }, props.duration + props.delay + (props.stagger ? props.staggerDelay * 10 : 0))
  })
}

// Reset animation (if not once)
const reset = () => {
  if (!props.once && target.value) {
    hasAnimated.value = false
    target.value.className = `${props.wrapperClass} ${getInitialTransform()}`
  }
}

// Intersection observer
const { stop } = useIntersectionObserver(
  target,
  ([{ isIntersecting }]) => {
    if (isIntersecting) {
      animate()
      if (props.once) {
        stop()
      }
    } else if (!props.once) {
      reset()
    }
  },
  {
    threshold: props.threshold,
    rootMargin: '0px 0px -10% 0px'
  }
)

// Skip animation if reduced motion is preferred
watch(prefersReducedMotion, (reduced) => {
  if (reduced && target.value) {
    target.value.className = `${props.wrapperClass} ${getFinalTransform()}`
  }
})

// Cleanup
onUnmounted(() => {
  stop()
})
</script>
