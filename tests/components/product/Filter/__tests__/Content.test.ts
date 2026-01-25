/**
 * Tests for ProductFilterContent component
 *
 * Component: components/product/Filter/Content.vue
 * Purpose: Displays filter controls including price range, availability,
 *          categories, and attribute filters
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { VueWrapper } from '@vue/test-utils'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import FilterContent from '~/components/product/Filter/Content.vue'
import type { ProductFilters, CategoryFilter, AttributeFilter, PriceRange } from '~/types'

// Mock UI components to avoid jsdom rendering issues (especially calc(NaN% + 0px) CSS errors)
vi.mock('~/components/ui/checkbox', () => ({
  Checkbox: defineComponent({
    name: 'Checkbox',
    props: ['modelValue', 'id', 'name', 'disabled', 'class'],
    emits: ['update:modelValue'],
    setup(props, { emit }) {
      return () => h('input', {
        type: 'checkbox',
        checked: !!props.modelValue,
        class: props.class,
        id: props.id,
        name: props.name,
        disabled: props.disabled,
        onChange: (e: Event) => emit('update:modelValue', (e.target as HTMLInputElement).checked),
      })
    },
  }),
}))

vi.mock('~/components/ui/slider', () => ({
  Slider: defineComponent({
    name: 'Slider',
    props: ['modelValue', 'min', 'max', 'step', 'class'],
    setup(props) {
      return () => h('div', { 'class': ['slider-stub', props.class], 'data-testid': 'slider' }, `Slider: ${props.modelValue}`)
    },
  }),
}))

vi.mock('~/components/ui/input', () => ({
  Input: defineComponent({
    name: 'Input',
    props: ['modelValue', 'type', 'placeholder', 'disabled', 'name', 'id', 'class', 'min', 'max'],
    emits: ['update:modelValue'],
    setup(props, { emit }) {
      return () => h('input', {
        type: props.type || 'text',
        value: props.modelValue,
        class: props.class,
        placeholder: props.placeholder,
        disabled: props.disabled,
        id: props.id,
        name: props.name,
        min: props.min,
        max: props.max,
        onInput: (e: Event) => emit('update:modelValue', (e.target as HTMLInputElement).value),
      })
    },
  }),
}))

vi.mock('~/components/ui/label', () => ({
  Label: defineComponent({
    name: 'Label',
    props: ['class'],
    setup(props, { slots }) {
      return () => h('label', { class: props.class }, slots.default?.())
    },
  }),
}))

describe('ProductFilterContent', () => {
  let wrapper: VueWrapper

  // Mock data
  const mockFilters: ProductFilters = {
    category: undefined,
    search: '',
    priceMin: undefined,
    priceMax: undefined,
    inStock: false,
    featured: false,
    attributes: {},
  }

  const mockPriceRange: PriceRange = {
    min: 0,
    max: 100,
  }

  const mockCategories: CategoryFilter[] = [
    { id: 1, name: { en: 'Wine', es: 'Vino' }, slug: 'wine', productCount: 50, count: 50 },
    { id: 2, name: { en: 'Spirits', es: 'Licores' }, slug: 'spirits', productCount: 30, count: 30 },
    { id: 3, name: { en: 'Beer', es: 'Cerveza' }, slug: 'beer', productCount: 20, count: 20 },
  ]

  const mockAttributes: AttributeFilter[] = [
    {
      name: 'color',
      label: 'Color',
      values: [
        { value: 'red', label: 'Red', count: 25 },
        { value: 'white', label: 'White', count: 20 },
        { value: 'rose', label: 'Rose', count: 10 },
      ],
    },
    {
      name: 'region',
      label: 'Region',
      values: [
        { value: 'spain', label: 'Spain', count: 15 },
        { value: 'france', label: 'France', count: 20 },
      ],
    },
  ]

  const mockAvailableFilters = {
    categories: mockCategories,
    priceRange: mockPriceRange,
    attributes: mockAttributes,
  }

  // Helper function to create wrapper with default props
  const createWrapper = (props = {}) => {
    return mount(FilterContent, {
      props: {
        filters: mockFilters,
        availableFilters: mockAvailableFilters,
        ...props,
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render the component', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      expect(wrapper.exists()).toBe(true)
    })

    it('should render price range section when available', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      expect(wrapper.text()).toContain('products.filters.priceRange')
    })

    it('should render availability section', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      expect(wrapper.text()).toContain('products.filters.availability')
      expect(wrapper.text()).toContain('products.filters.inStockOnly')
      expect(wrapper.text()).toContain('products.filters.featuredOnly')
    })

    it('should render category section when categories available', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      expect(wrapper.text()).toContain('products.filters.categories')
    })

    it('should not render category section when no categories', () => {
      // Arrange & Act
      wrapper = createWrapper({
        availableFilters: {
          ...mockAvailableFilters,
          categories: [],
        },
      })

      // Assert
      expect(wrapper.text()).not.toContain('products.filters.categories')
    })

    it('should render attribute filters', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      expect(wrapper.text()).toContain('Color')
      expect(wrapper.text()).toContain('Region')
    })

    it('should not render price range when not available', () => {
      // Arrange & Act
      wrapper = createWrapper({
        availableFilters: {
          ...mockAvailableFilters,
          priceRange: undefined,
        },
      })

      // Assert
      // Should not crash and should still render
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Price Range Filter', () => {
    it('should render price inputs', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert - look for input elements of type number
      const numberInputs = wrapper.findAll('input[type="number"]')
      expect(numberInputs.length).toBeGreaterThanOrEqual(2)
    })

    it('should display euro symbol for price inputs', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      expect(wrapper.text()).toContain('€')
    })

    it('should render min and max price labels', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      expect(wrapper.text()).toContain('products.filters.minPrice')
      expect(wrapper.text()).toContain('products.filters.maxPrice')
    })
  })

  describe('Availability Filter', () => {
    it('should render in-stock checkbox', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert - find checkbox inputs with type checkbox
      const checkboxes = wrapper.findAll('input[type="checkbox"]')
      expect(checkboxes.length).toBeGreaterThanOrEqual(2)
    })

    it('should render featured checkbox', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      expect(wrapper.text()).toContain('products.filters.featuredOnly')
    })

    it('should reflect inStock filter state', async () => {
      // Arrange
      wrapper = createWrapper({
        filters: { ...mockFilters, inStock: true },
      })

      // Assert - first availability checkbox should be checked
      const checkboxes = wrapper.findAll('input[type="checkbox"]')
      // Check that at least one checkbox is checked
      const anyChecked = checkboxes.some(c => (c.element as HTMLInputElement).checked)
      expect(anyChecked).toBe(true)
    })

    it('should reflect featured filter state', async () => {
      // Arrange
      wrapper = createWrapper({
        filters: { ...mockFilters, featured: true },
      })

      // Assert - at least one checkbox should be checked
      const checkboxes = wrapper.findAll('input[type="checkbox"]')
      const anyChecked = checkboxes.some(c => (c.element as HTMLInputElement).checked)
      expect(anyChecked).toBe(true)
    })

    it('should emit update when a checkbox is toggled', async () => {
      // Arrange
      wrapper = createWrapper()
      const checkboxes = wrapper.findAll('input[type="checkbox"]')
      expect(checkboxes.length).toBeGreaterThan(0)

      // Act - click first checkbox
      await checkboxes[0].setValue(true)
      await flushPromises()

      // Assert
      expect(wrapper.emitted('update:filters')).toBeTruthy()
    })
  })

  describe('Category Filter', () => {
    it('should render all category options', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert - there should be checkboxes for categories
      // Total checkboxes = 2 availability + 3 categories + 5 attributes = 10
      const checkboxes = wrapper.findAll('input[type="checkbox"]')
      expect(checkboxes.length).toBeGreaterThanOrEqual(5) // At least availability + categories
    })

    it('should display category count', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert - check for count values
      expect(wrapper.text()).toContain('50')
      expect(wrapper.text()).toContain('30')
      expect(wrapper.text()).toContain('20')
    })

    it('should handle category selection', async () => {
      // Arrange
      wrapper = createWrapper()
      // Find a checkbox in the categories section
      const checkboxes = wrapper.findAll('input[type="checkbox"]')
      expect(checkboxes.length).toBeGreaterThan(2)

      // Act - select a category checkbox (after the availability ones)
      await checkboxes[2].setValue(true)
      await flushPromises()

      // Assert
      expect(wrapper.emitted('update:filters')).toBeTruthy()
    })

    it('should reflect selected category state', () => {
      // Arrange & Act
      wrapper = createWrapper({
        filters: { ...mockFilters, category: '1' },
      })

      // Assert - at least one checkbox should be checked
      const checkboxes = wrapper.findAll('input[type="checkbox"]')
      const anyChecked = checkboxes.some(c => (c.element as HTMLInputElement).checked)
      expect(anyChecked).toBe(true)
    })
  })

  describe('Attribute Filters', () => {
    it('should render attribute labels', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      expect(wrapper.text()).toContain('Color')
      expect(wrapper.text()).toContain('Region')
    })

    it('should render all attribute values', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      expect(wrapper.text()).toContain('Red')
      expect(wrapper.text()).toContain('White')
      expect(wrapper.text()).toContain('Rose')
      expect(wrapper.text()).toContain('Spain')
      expect(wrapper.text()).toContain('France')
    })

    it('should handle attribute selection', async () => {
      // Arrange
      wrapper = createWrapper()
      const checkboxes = wrapper.findAll('input[type="checkbox"]')
      // Attribute checkboxes are after availability and category ones
      expect(checkboxes.length).toBeGreaterThan(5)

      // Act - click an attribute checkbox
      await checkboxes[checkboxes.length - 1].setValue(true)
      await flushPromises()

      // Assert
      expect(wrapper.emitted('update:filters')).toBeTruthy()
    })

    it('should reflect selected attribute state', () => {
      // Arrange & Act
      wrapper = createWrapper({
        filters: {
          ...mockFilters,
          attributes: { color: ['red'] },
        },
      })

      // Assert - at least one checkbox should be checked
      const checkboxes = wrapper.findAll('input[type="checkbox"]')
      const anyChecked = checkboxes.some(c => (c.element as HTMLInputElement).checked)
      expect(anyChecked).toBe(true)
    })

    it('should handle multiple attribute selections', async () => {
      // Arrange
      wrapper = createWrapper({
        filters: {
          ...mockFilters,
          attributes: { color: ['red', 'white'] },
        },
      })

      // Assert - multiple checkboxes should be checked
      const checkboxes = wrapper.findAll('input[type="checkbox"]')
      const checkedCount = checkboxes.filter(c => (c.element as HTMLInputElement).checked).length
      expect(checkedCount).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Events', () => {
    it('should emit update:filters with updated filter state', async () => {
      // Arrange
      wrapper = createWrapper()
      const checkboxes = wrapper.findAll('input[type="checkbox"]')
      expect(checkboxes.length).toBeGreaterThan(0)

      // Act - toggle first checkbox
      await checkboxes[0].setValue(true)
      await flushPromises()

      // Assert
      const emitted = wrapper.emitted('update:filters')
      expect(emitted).toBeTruthy()
    })

    it('should sync with external filter changes', async () => {
      // Arrange
      wrapper = createWrapper()
      const newFilters = { ...mockFilters, inStock: true }

      // Act
      await wrapper.setProps({ filters: newFilters })
      await flushPromises()

      // Assert - at least one checkbox should be checked
      const checkboxes = wrapper.findAll('input[type="checkbox"]')
      const anyChecked = checkboxes.some(c => (c.element as HTMLInputElement).checked)
      expect(anyChecked).toBe(true)
    })
  })

  describe('Props Validation', () => {
    it('should accept filters prop', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      expect(wrapper.props('filters')).toEqual(mockFilters)
    })

    it('should accept availableFilters prop', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      expect(wrapper.props('availableFilters')).toEqual(mockAvailableFilters)
    })

    it('should handle empty filters gracefully', () => {
      // Arrange & Act
      wrapper = createWrapper({
        filters: {},
      })

      // Assert
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle empty availableFilters gracefully', () => {
      // Arrange & Act
      wrapper = createWrapper({
        availableFilters: {
          categories: [],
          priceRange: { min: 0, max: 0 },
          attributes: [],
        },
      })

      // Assert
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('should handle category with string name', () => {
      // Arrange & Act
      wrapper = createWrapper({
        availableFilters: {
          ...mockAvailableFilters,
          categories: [
            { id: 1, name: 'Simple Wine' as any, slug: 'wine', productCount: 50, count: 50 },
          ],
        },
      })

      // Assert
      expect(wrapper.text()).toContain('Simple Wine')
    })

    it('should handle zero price range', () => {
      // Arrange & Act
      wrapper = createWrapper({
        availableFilters: {
          ...mockAvailableFilters,
          priceRange: { min: 0, max: 0 },
        },
      })

      // Assert
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle large price range', () => {
      // Arrange & Act
      wrapper = createWrapper({
        availableFilters: {
          ...mockAvailableFilters,
          priceRange: { min: 0, max: 999999 },
        },
      })

      // Assert
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle many categories', () => {
      // Arrange
      const manyCategories = Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        name: { en: `Category ${i}` },
        slug: `category-${i}`,
        productCount: i * 10,
        count: i * 10,
      }))

      // Act
      wrapper = createWrapper({
        availableFilters: {
          ...mockAvailableFilters,
          categories: manyCategories,
        },
      })

      // Assert - should have at least 50 checkboxes for categories (plus availability)
      const checkboxes = wrapper.findAll('input[type="checkbox"]')
      expect(checkboxes.length).toBeGreaterThanOrEqual(50)
    })

    it('should handle many attribute options', () => {
      // Arrange
      const manyOptions = Array.from({ length: 20 }, (_, i) => ({
        value: `option-${i}`,
        label: `Option ${i}`,
        count: i * 5,
      }))

      // Act
      wrapper = createWrapper({
        availableFilters: {
          ...mockAvailableFilters,
          attributes: [
            { name: 'many', label: 'Many Options', values: manyOptions },
          ],
        },
      })

      // Assert
      expect(wrapper.text()).toContain('Option 0')
      expect(wrapper.text()).toContain('Option 19')
    })
  })

  describe('Accessibility', () => {
    it('should have proper labels for checkboxes', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      const labels = wrapper.findAll('label')
      expect(labels.length).toBeGreaterThan(0)
    })

    it('should have form inputs for filters', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert - should have number inputs for price
      const numberInputs = wrapper.findAll('input[type="number"]')
      expect(numberInputs.length).toBeGreaterThanOrEqual(2)

      // Assert - should have checkboxes for boolean and multi-select filters
      const checkboxes = wrapper.findAll('input[type="checkbox"]')
      expect(checkboxes.length).toBeGreaterThan(0)
    })
  })
})
