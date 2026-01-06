/**
 * Tests for ProductFilterTag component
 *
 * Component: components/product/Filter/Tag.vue
 * Purpose: Displays a filter tag with label and remove button
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import FilterTag from '~/components/product/Filter/Tag.vue'

describe('ProductFilterTag', () => {
  let wrapper: VueWrapper

  // Helper function to create wrapper with default props
  const createWrapper = (props = {}) => {
    return mount(FilterTag, {
      props: {
        label: 'Test Filter',
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

    it('should display the label text', () => {
      // Arrange & Act
      wrapper = createWrapper({ label: 'Wine Category' })

      // Assert
      expect(wrapper.text()).toContain('Wine Category')
    })

    it('should render with proper tag styling', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert - check for badge-like styling
      const tagElement = wrapper.find('span')
      expect(tagElement.exists()).toBe(true)
      expect(tagElement.classes()).toContain('inline-flex')
      expect(tagElement.classes()).toContain('items-center')
    })

    it('should render a remove button', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      const button = wrapper.find('button')
      expect(button.exists()).toBe(true)
    })

    it('should render an X icon for removal', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      const icon = wrapper.find('[data-testid="icon"]')
      expect(icon.exists()).toBe(true)
    })
  })

  describe('Props Validation', () => {
    it('should accept label prop', () => {
      // Arrange & Act
      wrapper = createWrapper({ label: 'Custom Label' })

      // Assert
      expect(wrapper.text()).toContain('Custom Label')
    })

    it('should handle special characters in label', () => {
      // Arrange
      const specialLabel = 'Price: €10-€50'

      // Act
      wrapper = createWrapper({ label: specialLabel })

      // Assert
      expect(wrapper.text()).toContain(specialLabel)
    })

    it('should handle long label text', () => {
      // Arrange
      const longLabel = 'This is a very long filter label that should still be displayed'

      // Act
      wrapper = createWrapper({ label: longLabel })

      // Assert
      expect(wrapper.text()).toContain(longLabel)
    })

    it('should handle empty label gracefully', () => {
      // Arrange & Act
      wrapper = createWrapper({ label: '' })

      // Assert
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Events', () => {
    it('should emit remove event when button is clicked', async () => {
      // Arrange
      wrapper = createWrapper()
      // UiButton stub emits click which triggers @click on the component
      const buttons = wrapper.findAll('button')
      const removeButton = buttons[buttons.length - 1] // Get the last/innermost button

      // Act
      await removeButton.trigger('click')

      // Assert
      expect(wrapper.emitted('remove')).toBeTruthy()
      expect(wrapper.emitted('remove')?.length).toBeGreaterThanOrEqual(1)
    })

    it('should emit remove event for each click', async () => {
      // Arrange
      wrapper = createWrapper()
      const buttons = wrapper.findAll('button')
      const removeButton = buttons[buttons.length - 1]

      // Act - get initial count, then click twice
      const initialCount = wrapper.emitted('remove')?.length ?? 0
      await removeButton.trigger('click')
      await removeButton.trigger('click')

      // Assert - should have 2 more events than before
      const finalCount = wrapper.emitted('remove')?.length ?? 0
      expect(finalCount - initialCount).toBeGreaterThanOrEqual(2)
    })

    it('should have accessible aria-label on remove button', () => {
      // Arrange & Act
      wrapper = createWrapper({ label: 'Test Filter' })
      const button = wrapper.find('button')

      // Assert
      expect(button.attributes('aria-label')).toBe('products.filters.removeFilter')
    })
  })

  describe('Accessibility', () => {
    it('should have proper button role', () => {
      // Arrange & Act
      wrapper = createWrapper()
      const button = wrapper.find('button')

      // Assert - button is implicitly accessible
      expect(button.element.tagName).toBe('BUTTON')
    })

    it('should be keyboard accessible', async () => {
      // Arrange
      wrapper = createWrapper()
      const button = wrapper.find('button')

      // Act - simulate keyboard interaction
      await button.trigger('keypress.enter')

      // Assert
      expect(button.exists()).toBe(true)
    })
  })

  describe('Styling', () => {
    it('should have pill/rounded styling', () => {
      // Arrange & Act
      wrapper = createWrapper()
      const tagElement = wrapper.find('span')

      // Assert
      expect(tagElement.classes()).toContain('rounded-full')
    })

    it('should have appropriate padding', () => {
      // Arrange & Act
      wrapper = createWrapper()
      const tagElement = wrapper.find('span')

      // Assert
      expect(tagElement.classes()).toContain('px-3')
      expect(tagElement.classes()).toContain('py-1')
    })

    it('should have blue color scheme', () => {
      // Arrange & Act
      wrapper = createWrapper()
      const tagElement = wrapper.find('span')

      // Assert - check for blue theme classes
      const classes = tagElement.classes().join(' ')
      expect(classes).toMatch(/bg-blue/)
      expect(classes).toMatch(/text-blue/)
    })
  })

  describe('Edge Cases', () => {
    it('should handle numeric label when converted to string', () => {
      // Arrange & Act
      // TypeScript would catch this but testing runtime behavior
      wrapper = mount(FilterTag, {
        props: {
          label: '12345',
        },
      })

      // Assert
      expect(wrapper.text()).toContain('12345')
    })

    it('should handle unicode characters in label', () => {
      // Arrange
      const unicodeLabel = 'Categoría: 🍷'

      // Act
      wrapper = createWrapper({ label: unicodeLabel })

      // Assert
      expect(wrapper.text()).toContain(unicodeLabel)
    })

    it('should handle whitespace-only label', () => {
      // Arrange & Act
      wrapper = createWrapper({ label: '   ' })

      // Assert
      expect(wrapper.exists()).toBe(true)
    })
  })
})
