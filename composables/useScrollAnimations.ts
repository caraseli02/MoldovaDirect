import { useIntersectionObserver, useRafFn, usePreferredReducedMotion } from '@vueuse/core'

export interface ScrollAnimationOptions {
  /**
   * Animation preset type
   */
  preset?: 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'zoom-in' | 'zoom-out'
  /**
   * Delay before animation starts (ms)
   */
  delay?: number
  /**
   * Animation duration (ms)
   */
  duration?: number
  /**
   * Intersection observer threshold (0-1)
   */
  threshold?: number
  /**
   * Only animate once
   */
  once?: boolean
  /**
   * Root margin for intersection observer
   */
  rootMargin?: string
}

export interface StaggerAnimationOptions extends ScrollAnimationOptions {
  /**
   * Delay between staggered elements (ms)
   */
  staggerDelay?: number
}

/**
 * Composable for scroll-triggered animations
 * Uses intersection observer and GPU-accelerated transforms
 */
export function useScrollAnimations() {
  const prefersReducedMotion = usePreferredReducedMotion()

  /**
   * Get initial CSS transform classes based on preset
   */
  const getInitialClasses = (preset: string = 'fade-up'): string => {
    const classes: Record<string, string> = {
      'fade-up': 'translate-y-12 opacity-0',
      'fade-down': '-translate-y-12 opacity-0',
      'fade-left': 'translate-x-12 opacity-0',
      'fade-right': '-translate-x-12 opacity-0',
      'zoom-in': 'scale-95 opacity-0',
      'zoom-out': 'scale-105 opacity-0'
    }
    return classes[preset] || classes['fade-up']
  }

  /**
   * Get final CSS transform classes (neutral state)
   */
  const getFinalClasses = (): string => {
    return 'translate-x-0 translate-y-0 scale-100 opacity-100'
  }

  /**
   * Apply animation to element
   */
  const applyAnimation = (
    element: HTMLElement,
    options: ScrollAnimationOptions = {}
  ): void => {
    const {
      preset = 'fade-up',
      delay = 0,
      duration = 600
    } = options

    if (prefersReducedMotion.value) {
      element.classList.add(...getFinalClasses().split(' '))
      return
    }

    // Performance hint
    element.style.willChange = 'transform, opacity'

    // Set initial state
    element.style.transition = 'none'
    element.classList.add(...getInitialClasses(preset).split(' '))

    // Force reflow
    element.offsetHeight

    // Animate
    requestAnimationFrame(() => {
      element.style.transition = `transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms, opacity ${duration}ms cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`
      element.classList.remove(...getInitialClasses(preset).split(' '))
      element.classList.add(...getFinalClasses().split(' '))

      // Remove will-change after animation
      setTimeout(() => {
        element.style.willChange = 'auto'
      }, duration + delay)
    })
  }

  /**
   * Apply staggered animation to child elements
   */
  const applyStaggerAnimation = (
    container: HTMLElement,
    options: StaggerAnimationOptions = {}
  ): void => {
    const {
      preset = 'fade-up',
      delay = 0,
      duration = 600,
      staggerDelay = 100
    } = options

    if (prefersReducedMotion.value) {
      const children = Array.from(container.children) as HTMLElement[]
      children.forEach((child) => {
        child.classList.add(...getFinalClasses().split(' '))
      })
      return
    }

    const children = Array.from(container.children) as HTMLElement[]

    children.forEach((child, index) => {
      const elementDelay = delay + (index * staggerDelay)
      applyAnimation(child, { preset, delay: elementDelay, duration })
    })
  }

  /**
   * Create intersection observer for scroll animations
   */
  const createScrollObserver = (
    element: Ref<HTMLElement | null>,
    callback: () => void,
    options: ScrollAnimationOptions = {}
  ) => {
    const {
      threshold = 0.1,
      once = true,
      rootMargin = '0px 0px -10% 0px'
    } = options

    const hasTriggered = ref(false)

    const { stop } = useIntersectionObserver(
      element,
      ([{ isIntersecting }]) => {
        if (isIntersecting && (!once || !hasTriggered.value)) {
          hasTriggered.value = true
          callback()
          if (once) {
            stop()
          }
        }
      },
      {
        threshold,
        rootMargin
      }
    )

    return { stop, hasTriggered }
  }

  /**
   * Animate element on scroll into view
   */
  const animateOnScroll = (
    element: Ref<HTMLElement | null>,
    options: ScrollAnimationOptions = {}
  ) => {
    const animate = () => {
      if (element.value) {
        applyAnimation(element.value, options)
      }
    }

    return createScrollObserver(element, animate, options)
  }

  /**
   * Animate children with stagger effect on scroll
   */
  const staggerOnScroll = (
    container: Ref<HTMLElement | null>,
    options: StaggerAnimationOptions = {}
  ) => {
    const animate = () => {
      if (container.value) {
        applyStaggerAnimation(container.value, options)
      }
    }

    return createScrollObserver(container, animate, options)
  }

  /**
   * Create parallax effect
   */
  const createParallax = (
    element: Ref<HTMLElement | null>,
    speed: number = 0.5
  ) => {
    if (prefersReducedMotion.value) {
      return { pause: () => {}, resume: () => {} }
    }

    const updateParallax = () => {
      if (!element.value) return

      const rect = element.value.getBoundingClientRect()
      const scrollProgress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height)
      const translateY = scrollProgress * 100 * speed - 50 * speed

      element.value.style.transform = `translateY(${translateY}px)`
    }

    const { pause, resume } = useRafFn(updateParallax, { immediate: true })

    return { pause, resume }
  }

  /**
   * Add hover micro-interaction
   */
  const addHoverAnimation = (
    element: Ref<HTMLElement | null>,
    options: {
      scale?: number
      duration?: number
      bounce?: boolean
    } = {}
  ) => {
    const {
      scale = 1.05,
      duration = 200,
      bounce = true
    } = options

    if (!element.value || prefersReducedMotion.value) return

    const easing = bounce
      ? 'cubic-bezier(0.34, 1.56, 0.64, 1)' // Bounce effect
      : 'cubic-bezier(0.4, 0, 0.2, 1)' // Standard easing

    element.value.style.transition = `transform ${duration}ms ${easing}`

    const handleMouseEnter = () => {
      if (element.value) {
        element.value.style.transform = `scale(${scale})`
      }
    }

    const handleMouseLeave = () => {
      if (element.value) {
        element.value.style.transform = 'scale(1)'
      }
    }

    element.value.addEventListener('mouseenter', handleMouseEnter)
    element.value.addEventListener('mouseleave', handleMouseLeave)

    onUnmounted(() => {
      if (element.value) {
        element.value.removeEventListener('mouseenter', handleMouseEnter)
        element.value.removeEventListener('mouseleave', handleMouseLeave)
      }
    })
  }

  return {
    // Utilities
    getInitialClasses,
    getFinalClasses,
    prefersReducedMotion,

    // Animation functions
    applyAnimation,
    applyStaggerAnimation,

    // Scroll observers
    createScrollObserver,
    animateOnScroll,
    staggerOnScroll,

    // Effects
    createParallax,
    addHoverAnimation
  }
}
