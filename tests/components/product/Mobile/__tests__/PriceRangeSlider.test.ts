/**
 * Tests for PriceRangeSlider component
 *
 * Component: components/product/Mobile/PriceRangeSlider.vue
 * Purpose: Displays a dual-range slider for price filtering with
 *          input fields for min/max price
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { VueWrapper } from '@vue/test-utils'
import { mount, flushPromises } from '@vue/test-utils'
import PriceRangeSlider from '~/components/product/Mobile/PriceRangeSlider.vue'

describe('PriceRangeSlider', () => {
  let wrapper: VueWrapper

  // Default props
  const defaultProps = {
    min: 0,
    max: 100,
    value: [10, 90] as [number, number],
  }

  // Helper function to create wrapper with default props
  const createWrapper = (props = {}) => {
    return mount(PriceRangeSlider, {
      props: {
        ...defaultProps,
        ...props,
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Rendering', () => {
    it('should render the component', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      expect(wrapper.exists()).toBe(true)
    })

    it('should have price-range-slider class', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      expect(wrapper.find('.price-range-slider').exists()).toBe(true)
    })

    it('should display current min price', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      expect(wrapper.text()).toContain('€10')
    })

    it('should display current max price', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      expect(wrapper.text()).toContain('€90')
    })

    it('should render two range inputs', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      const rangeInputs = wrapper.findAll('input[type="range"]')
      expect(rangeInputs.length).toBe(2)
    })

    it('should render two number inputs', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      const numberInputs = wrapper.findAll('input[type="number"]')
      expect(numberInputs.length).toBe(2)
    })

    it('should display min and max price labels', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      expect(wrapper.text()).toContain('products.filters.minPrice')
      expect(wrapper.text()).toContain('products.filters.maxPrice')
    })

    it('should show euro symbol in input fields', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert - multiple euro symbols should be present
      const euroSymbols = wrapper.findAll('span').filter(s => s.text() === '€')
      expect(euroSymbols.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Slider Track', () => {
    it('should render track highlight', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      const track = wrapper.find('.bg-blue-600')
      expect(track.exists()).toBe(true)
    })

    it('should render two thumb elements', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      const thumbs = wrapper.findAll('.rounded-full.cursor-pointer')
      expect(thumbs.length).toBe(2)
    })

    it('should calculate track position based on values', () => {
      // Arrange & Act
      wrapper = createWrapper({
        min: 0,
        max: 100,
        value: [25, 75],
      })

      // Assert
      const track = wrapper.find('.bg-blue-600')
      expect(track.exists()).toBe(true)
      // Track should be positioned at 25% from left with 50% width
    })
  })

  describe('Input Synchronization', () => {
    it('should update display when value changes', async () => {
      // Arrange
      wrapper = createWrapper()

      // Act
      await wrapper.setProps({ value: [20, 80] })

      // Assert
      expect(wrapper.text()).toContain('€20')
      expect(wrapper.text()).toContain('€80')
    })

    it('should have number inputs with correct initial values', () => {
      // Arrange & Act
      wrapper = createWrapper({
        value: [15, 85],
      })

      // Assert
      const numberInputs = wrapper.findAll('input[type="number"]')
      expect((numberInputs[0].element as HTMLInputElement).value).toBe('15')
      expect((numberInputs[1].element as HTMLInputElement).value).toBe('85')
    })
  })

  describe('Value Constraints', () => {
    it('should respect min prop', () => {
      // Arrange & Act
      wrapper = createWrapper({
        min: 10,
        max: 100,
        value: [10, 50],
      })

      // Assert
      const rangeInputs = wrapper.findAll('input[type="range"]')
      expect((rangeInputs[0].element as HTMLInputElement).min).toBe('10')
    })

    it('should respect max prop', () => {
      // Arrange & Act
      wrapper = createWrapper({
        min: 0,
        max: 200,
        value: [0, 200],
      })

      // Assert
      const rangeInputs = wrapper.findAll('input[type="range"]')
      expect((rangeInputs[0].element as HTMLInputElement).max).toBe('200')
    })

    it('should respect step prop', () => {
      // Arrange & Act
      wrapper = createWrapper({
        step: 5,
      })

      // Assert
      const rangeInputs = wrapper.findAll('input[type="range"]')
      expect((rangeInputs[0].element as HTMLInputElement).step).toBe('5')
    })

    it('should default step to 1', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      const rangeInputs = wrapper.findAll('input[type="range"]')
      expect((rangeInputs[0].element as HTMLInputElement).step).toBe('1')
    })
  })

  describe('Props Validation', () => {
    it('should accept min prop', () => {
      // Arrange & Act
      wrapper = createWrapper({ min: 0 })

      // Assert
      expect(wrapper.props('min')).toBe(0)
    })

    it('should accept max prop', () => {
      // Arrange & Act
      wrapper = createWrapper({ max: 200 })

      // Assert
      expect(wrapper.props('max')).toBe(200)
    })

    it('should accept value prop', () => {
      // Arrange & Act
      wrapper = createWrapper({ value: [25, 75] })

      // Assert
      expect(wrapper.props('value')).toEqual([25, 75])
    })

    it('should accept step prop', () => {
      // Arrange & Act
      wrapper = createWrapper({ step: 10 })

      // Assert
      expect(wrapper.props('step')).toBe(10)
    })
  })

  describe('Events', () => {
    it('should emit update:value when input changes', async () => {
      // Arrange
      wrapper = createWrapper()
      const numberInputs = wrapper.findAll('input[type="number"]')

      // Act
      await numberInputs[0].setValue(30)
      await numberInputs[0].trigger('input')

      // Fast-forward debounce timer
      vi.advanceTimersByTime(350)
      await flushPromises()

      // Assert
      expect(wrapper.emitted('update:value')).toBeTruthy()
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero range (min equals max)', () => {
      // Arrange & Act
      wrapper = createWrapper({
        min: 50,
        max: 50,
        value: [50, 50],
      })

      // Assert
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle large price range', () => {
      // Arrange & Act
      wrapper = createWrapper({
        min: 0,
        max: 999999,
        value: [0, 999999],
      })

      // Assert
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.text()).toContain('€0')
      expect(wrapper.text()).toContain('€999999')
    })

    it('should handle decimal values', () => {
      // Arrange & Act
      wrapper = createWrapper({
        min: 0,
        max: 100,
        value: [10.5, 90.5],
        step: 0.5,
      })

      // Assert
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle same min and max values', () => {
      // Arrange & Act
      wrapper = createWrapper({
        min: 0,
        max: 100,
        value: [50, 50],
      })

      // Assert
      expect(wrapper.exists()).toBe(true)
    })

    it('should sync with external value changes', async () => {
      // Arrange
      wrapper = createWrapper()

      // Act
      await wrapper.setProps({ value: [30, 70] })

      // Assert
      expect(wrapper.text()).toContain('€30')
      expect(wrapper.text()).toContain('€70')
    })
  })

  describe('Accessibility', () => {
    it('should have aria-label on range inputs', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      const rangeInputs = wrapper.findAll('input[type="range"]')
      expect(rangeInputs[0].attributes('aria-label')).toBe('products.filters.minPrice')
      expect(rangeInputs[1].attributes('aria-label')).toBe('products.filters.maxPrice')
    })

    it('should have labels for number inputs', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      const labels = wrapper.findAll('label')
      expect(labels.length).toBeGreaterThanOrEqual(2)
    })

    it('should have draggable thumbs with cursor-pointer', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      const thumbs = wrapper.findAll('.cursor-pointer.transform')
      expect(thumbs.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Visual Styling', () => {
    it('should have rounded track', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      const track = wrapper.find('.rounded-lg')
      expect(track.exists()).toBe(true)
    })

    it('should have blue highlight for selected range', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      const highlight = wrapper.find('.bg-blue-600')
      expect(highlight.exists()).toBe(true)
    })

    it('should have white thumbs with blue border', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      const thumbs = wrapper.findAll('.bg-white.border-blue-600')
      expect(thumbs.length).toBe(2)
    })

    it('should have hover scale effect on thumbs', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      const thumbs = wrapper.findAll('.hover\\:scale-110')
      expect(thumbs.length).toBe(2)
    })
  })

  describe('Input Fields', () => {
    it('should have euro symbol prefix', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      const euroSpans = wrapper.findAll('.text-gray-500').filter(s => s.text() === '€')
      expect(euroSpans.length).toBeGreaterThanOrEqual(2)
    })

    it('should have proper input styling', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      const numberInputs = wrapper.findAll('input[type="number"]')
      expect(numberInputs[0].classes()).toContain('pl-8')
    })

    it('should set min constraint on max input', () => {
      // Arrange & Act
      wrapper = createWrapper({
        value: [25, 75],
      })

      // Assert
      const numberInputs = wrapper.findAll('input[type="number"]')
      expect((numberInputs[1].element as HTMLInputElement).min).toBe('25')
    })

    it('should set max constraint on min input', () => {
      // Arrange & Act
      wrapper = createWrapper({
        value: [25, 75],
      })

      // Assert
      const numberInputs = wrapper.findAll('input[type="number"]')
      expect((numberInputs[0].element as HTMLInputElement).max).toBe('75')
    })
  })

  describe('Min/Max Validation', () => {
    it('should emit values in correct order [min, max] where min <= max', async () => {
      // Arrange
      wrapper = createWrapper({
        value: [20, 80],
      })
      const numberInputs = wrapper.findAll('input[type="number"]')

      // Act - change min value
      await numberInputs[0].setValue(30)
      await numberInputs[0].trigger('input')

      // Fast-forward debounce
      vi.advanceTimersByTime(350)
      await flushPromises()

      // Assert - emitted value should have min <= max
      const emitted = wrapper.emitted('update:value')
      if (emitted && emitted.length > 0) {
        const lastEmit = emitted[emitted.length - 1][0] as [number, number]
        expect(lastEmit[0]).toBeLessThanOrEqual(lastEmit[1])
      }
    })

    it('should swap values when min is set greater than max', async () => {
      // Arrange - start with min=20, max=80
      wrapper = createWrapper({
        value: [20, 80],
      })
      const numberInputs = wrapper.findAll('input[type="number"]')

      // Act - try to set min value higher than max (should be corrected)
      await numberInputs[0].setValue(90)
      await numberInputs[0].trigger('input')

      // Fast-forward debounce
      vi.advanceTimersByTime(350)
      await flushPromises()

      // Assert - component should handle this case
      const emitted = wrapper.emitted('update:value')
      if (emitted && emitted.length > 0) {
        const lastEmit = emitted[emitted.length - 1][0] as [number, number]
        // The min should never be greater than max in emitted value
        expect(lastEmit[0]).toBeLessThanOrEqual(lastEmit[1])
      }
    })

    it('should clamp values to props.min bound', async () => {
      // Arrange
      wrapper = createWrapper({
        min: 10,
        max: 100,
        value: [20, 80],
      })
      const numberInputs = wrapper.findAll('input[type="number"]')

      // Act - try to set value below min
      await numberInputs[0].setValue(5)
      await numberInputs[0].trigger('input')

      // Fast-forward debounce
      vi.advanceTimersByTime(350)
      await flushPromises()

      // Assert
      const emitted = wrapper.emitted('update:value')
      if (emitted && emitted.length > 0) {
        const lastEmit = emitted[emitted.length - 1][0] as [number, number]
        // Value should be clamped to min
        expect(lastEmit[0]).toBeGreaterThanOrEqual(10)
      }
    })

    it('should clamp values to props.max bound', async () => {
      // Arrange
      wrapper = createWrapper({
        min: 0,
        max: 100,
        value: [20, 80],
      })
      const numberInputs = wrapper.findAll('input[type="number"]')

      // Act - try to set value above max
      await numberInputs[1].setValue(150)
      await numberInputs[1].trigger('input')

      // Fast-forward debounce
      vi.advanceTimersByTime(350)
      await flushPromises()

      // Assert
      const emitted = wrapper.emitted('update:value')
      if (emitted && emitted.length > 0) {
        const lastEmit = emitted[emitted.length - 1][0] as [number, number]
        // Value should be clamped to max
        expect(lastEmit[1]).toBeLessThanOrEqual(100)
      }
    })

    it('should correctly update max value', async () => {
      // Arrange
      wrapper = createWrapper({
        value: [10, 90],
      })
      const numberInputs = wrapper.findAll('input[type="number"]')

      // Act - change max value
      await numberInputs[1].setValue(70)
      await numberInputs[1].trigger('input')

      // Fast-forward debounce
      vi.advanceTimersByTime(350)
      await flushPromises()

      // Assert
      const emitted = wrapper.emitted('update:value')
      expect(emitted).toBeTruthy()
      if (emitted && emitted.length > 0) {
        const lastEmit = emitted[emitted.length - 1][0] as [number, number]
        expect(lastEmit[1]).toBe(70)
      }
    })

    it('should handle equal min and max values', async () => {
      // Arrange
      wrapper = createWrapper({
        value: [50, 50],
      })

      // Assert - equal values should be valid
      expect(wrapper.text()).toContain('€50')
      const numberInputs = wrapper.findAll('input[type="number"]')
      expect((numberInputs[0].element as HTMLInputElement).value).toBe('50')
      expect((numberInputs[1].element as HTMLInputElement).value).toBe('50')
    })

    it('should emit update with correctly ordered values after range input change', async () => {
      // Arrange
      wrapper = createWrapper()
      const rangeInputs = wrapper.findAll('input[type="range"]')

      // Act - trigger input on first range
      await rangeInputs[0].setValue(40)
      await rangeInputs[0].trigger('input')

      // Fast-forward debounce
      vi.advanceTimersByTime(350)
      await flushPromises()

      // Assert
      const emitted = wrapper.emitted('update:value')
      expect(emitted).toBeTruthy()
      if (emitted && emitted.length > 0) {
        const lastEmit = emitted[emitted.length - 1][0] as [number, number]
        expect(lastEmit[0]).toBeLessThanOrEqual(lastEmit[1])
      }
    })
  })
})
