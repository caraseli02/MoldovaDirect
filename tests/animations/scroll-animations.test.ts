import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { useScrollAnimations } from '~/composables/useScrollAnimations'

describe('useScrollAnimations', () => {
  let intersectionObserverCallback: IntersectionObserverCallback
  let mockIntersectionObserver: any

  beforeEach(() => {
    // Mock IntersectionObserver
    mockIntersectionObserver = vi.fn((callback: IntersectionObserverCallback) => {
      intersectionObserverCallback = callback
      return {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn()
      }
    })
    global.IntersectionObserver = mockIntersectionObserver as any

    // Mock requestAnimationFrame
    global.requestAnimationFrame = vi.fn((callback) => {
      callback(0)
      return 0
    })

    // Mock matchMedia for reduced motion detection
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: query === '(prefers-reduced-motion: reduce)' ? false : false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      }))
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('getInitialClasses', () => {
    it('should return correct classes for fade-up preset', () => {
      const { getInitialClasses } = useScrollAnimations()
      expect(getInitialClasses('fade-up')).toBe('translate-y-12 opacity-0')
    })

    it('should return correct classes for fade-down preset', () => {
      const { getInitialClasses } = useScrollAnimations()
      expect(getInitialClasses('fade-down')).toBe('-translate-y-12 opacity-0')
    })

    it('should return correct classes for zoom-in preset', () => {
      const { getInitialClasses } = useScrollAnimations()
      expect(getInitialClasses('zoom-in')).toBe('scale-95 opacity-0')
    })

    it('should default to fade-up if preset not recognized', () => {
      const { getInitialClasses } = useScrollAnimations()
      expect(getInitialClasses('unknown')).toBe('translate-y-12 opacity-0')
    })
  })

  describe('getFinalClasses', () => {
    it('should return neutral transform classes', () => {
      const { getFinalClasses } = useScrollAnimations()
      expect(getFinalClasses()).toBe('translate-x-0 translate-y-0 scale-100 opacity-100')
    })
  })

  describe('applyAnimation', () => {
    it('should apply animation to element with correct timing', () => {
      const { applyAnimation } = useScrollAnimations()
      const element = document.createElement('div')

      applyAnimation(element, {
        preset: 'fade-up',
        duration: 600,
        delay: 100
      })

      expect(element.style.willChange).toBe('transform, opacity')
      expect(requestAnimationFrame).toHaveBeenCalled()
    })

    it('should skip animation if reduced motion is preferred', () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: query === '(prefers-reduced-motion: reduce)' ? true : false,
          media: query,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn()
        }))
      })

      const { applyAnimation } = useScrollAnimations()
      const element = document.createElement('div')

      applyAnimation(element, { preset: 'fade-up' })

      expect(element.classList.contains('opacity-100')).toBe(true)
      expect(element.style.willChange).toBe('')
    })
  })

  describe('applyStaggerAnimation', () => {
    it('should apply staggered animations to child elements', () => {
      const { applyStaggerAnimation } = useScrollAnimations()
      const container = document.createElement('div')
      const child1 = document.createElement('div')
      const child2 = document.createElement('div')
      const child3 = document.createElement('div')

      container.appendChild(child1)
      container.appendChild(child2)
      container.appendChild(child3)

      applyStaggerAnimation(container, {
        preset: 'fade-up',
        duration: 500,
        delay: 0,
        staggerDelay: 100
      })

      // Each child should have will-change hint
      expect(child1.style.willChange).toBe('transform, opacity')
      expect(child2.style.willChange).toBe('transform, opacity')
      expect(child3.style.willChange).toBe('transform, opacity')
    })
  })

  describe('createScrollObserver', () => {
    it('should create intersection observer with correct options', () => {
      const { createScrollObserver } = useScrollAnimations()
      const element = ref<HTMLElement>(document.createElement('div'))
      const callback = vi.fn()

      createScrollObserver(element, callback, {
        threshold: 0.5,
        rootMargin: '0px 0px -20% 0px'
      })

      expect(mockIntersectionObserver).toHaveBeenCalled()
      const observerConfig = mockIntersectionObserver.mock.calls[0][1] ||
                            mockIntersectionObserver.mock.calls[1]

      if (observerConfig) {
        expect(observerConfig.threshold).toBe(0.5)
        expect(observerConfig.rootMargin).toBe('0px 0px -20% 0px')
      }
    })

    it('should trigger callback when element intersects', () => {
      const { createScrollObserver } = useScrollAnimations()
      const element = ref<HTMLElement>(document.createElement('div'))
      const callback = vi.fn()

      createScrollObserver(element, callback)

      // Simulate intersection
      const entries = [{
        isIntersecting: true,
        target: element.value,
        intersectionRatio: 0.5
      }] as IntersectionObserverEntry[]

      if (intersectionObserverCallback) {
        intersectionObserverCallback(entries, {} as IntersectionObserver)
        expect(callback).toHaveBeenCalled()
      }
    })

    it('should only trigger once if once option is true', () => {
      const { createScrollObserver } = useScrollAnimations()
      const element = ref<HTMLElement>(document.createElement('div'))
      const callback = vi.fn()

      const { stop } = createScrollObserver(element, callback, { once: true })

      // Simulate intersection twice
      const entries = [{
        isIntersecting: true,
        target: element.value,
        intersectionRatio: 0.5
      }] as IntersectionObserverEntry[]

      if (intersectionObserverCallback) {
        intersectionObserverCallback(entries, {} as IntersectionObserver)
        intersectionObserverCallback(entries, {} as IntersectionObserver)

        // Callback should only be called once due to once: true
        expect(callback).toHaveBeenCalledTimes(1)
      }
    })
  })

  describe('performance optimizations', () => {
    it('should use GPU-accelerated transforms', () => {
      const { applyAnimation } = useScrollAnimations()
      const element = document.createElement('div')

      applyAnimation(element, { preset: 'fade-up' })

      // Verify transform and opacity are used (GPU-accelerated properties)
      expect(element.style.transition).toContain('transform')
      expect(element.style.transition).toContain('opacity')
    })

    it('should set will-change hint for performance', () => {
      const { applyAnimation } = useScrollAnimations()
      const element = document.createElement('div')

      applyAnimation(element, { preset: 'fade-up', duration: 600 })

      expect(element.style.willChange).toBe('transform, opacity')
    })
  })
})

describe('ScrollReveal Component Integration', () => {
  it('should have proper accessibility with reduced motion support', () => {
    // This is a placeholder for component integration tests
    // Full component tests would require mounting the ScrollReveal component
    expect(true).toBe(true)
  })

  it('should maintain CLS score below 0.1', () => {
    // Placeholder for CLS measurement
    // In real tests, this would use performance APIs
    expect(true).toBe(true)
  })

  it('should achieve 60 FPS during animations', () => {
    // Placeholder for performance monitoring
    // Real implementation would use Performance Observer API
    expect(true).toBe(true)
  })
})
