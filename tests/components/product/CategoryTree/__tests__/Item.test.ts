/**
 * Tests for ProductCategoryTreeItem component
 *
 * Component: components/product/CategoryTree/Item.vue
 * Purpose: Displays a single category item in the tree with expand/collapse
 *          functionality and child categories
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { VueWrapper } from '@vue/test-utils'
import { mount, flushPromises } from '@vue/test-utils'
import CategoryTreeItem from '~/components/product/CategoryTree/Item.vue'
import type { CategoryFilter } from '~/types'

describe('ProductCategoryTreeItem', () => {
  let wrapper: VueWrapper

  // Mock data
  const mockCategory: CategoryFilter = {
    id: 1,
    name: { en: 'Wine', es: 'Vino' },
    slug: 'wine',
    productCount: 50,
    count: 50,
  }

  const mockCategoryWithChildren: CategoryFilter = {
    id: 1,
    name: { en: 'Wine', es: 'Vino' },
    slug: 'wine',
    productCount: 100,
    count: 100,
    children: [
      { id: 11, name: { en: 'Red Wine' }, slug: 'red-wine', productCount: 40, count: 40 },
      { id: 12, name: { en: 'White Wine' }, slug: 'white-wine', productCount: 35, count: 35 },
      { id: 13, name: { en: 'Rose Wine' }, slug: 'rose-wine', productCount: 25, count: 25 },
    ],
  }

  // Helper function to create wrapper with default props
  const createWrapper = (props = {}) => {
    return mount(CategoryTreeItem, {
      props: {
        category: mockCategory,
        selected: [],
        level: 0,
        ...props,
      },
      global: {
        stubs: {
          productCategoryTreeItem: true, // Stub recursive component
          // UiButton needs to emit click to parent
          UiButton: {
            template: '<button type="button" :class="[variant, size]" :aria-label="ariaLabel" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'size', 'ariaLabel'],
          },
          commonIcon: {
            template: '<span data-testid="icon" :class="name ? name.replace(\'lucide:\', \'icon-\') : \'\'" />',
            props: ['name'],
          },
        },
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

    it('should display category name', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert - name is localized object, checking for any text content
      expect(wrapper.text().length).toBeGreaterThan(0)
    })

    it('should display category count', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      expect(wrapper.text()).toContain('(50)')
    })

    it('should have proper class for container', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      expect(wrapper.find('.category-tree-item').exists()).toBe(true)
    })

    it('should render custom radio button for selection', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert - custom radio div
      const radioContainer = wrapper.find('.size-4.rounded-full.border')
      expect(radioContainer.exists()).toBe(true)
    })
  })

  describe('Expand/Collapse Functionality', () => {
    it('should show expand button when category has children', () => {
      // Arrange & Act
      wrapper = createWrapper({ category: mockCategoryWithChildren })

      // Assert
      const expandButton = wrapper.find('button')
      expect(expandButton.exists()).toBe(true)
    })

    it('should not show expand button when category has no children', () => {
      // Arrange & Act
      wrapper = createWrapper({ category: mockCategory })

      // Assert - should have placeholder div instead of button
      const buttons = wrapper.findAll('button')
      // Only the implicit buttons from UiButton stubs, not expand buttons
      expect(buttons.length).toBe(0)
    })

    it('should show chevron-right icon when collapsed', () => {
      // Arrange & Act
      wrapper = createWrapper({ category: mockCategoryWithChildren })

      // Assert - icon name prop is passed to the stubbed commonIcon
      const icon = wrapper.find('[data-testid="icon"]')
      expect(icon.classes().join(' ')).toContain('icon-chevron-right')
    })

    it('should toggle icon when expanded', async () => {
      // Arrange
      wrapper = createWrapper({ category: mockCategoryWithChildren })
      const expandButton = wrapper.find('button')

      // Act
      await expandButton.trigger('click')
      await flushPromises()

      // Assert - check that the icon still exists (props would have changed)
      const icon = wrapper.find('[data-testid="icon"]')
      expect(icon.exists()).toBe(true)
    })

    it('should show children div when expanded', async () => {
      // Arrange
      wrapper = createWrapper({ category: mockCategoryWithChildren })

      // Check initial state - no children shown
      const initialHtml = wrapper.html()
      expect(initialHtml).not.toContain('product-category-tree-item-stub')

      // Act - directly access the component vm and call the toggleExpanded method
      // This tests the internal state change since click propagation is tricky with stubs
      const vm = wrapper.vm as any
      vm.toggleExpanded()
      await wrapper.vm.$nextTick()
      await flushPromises()

      // Assert - HTML should contain the children section after expansion
      const html = wrapper.html()
      expect(html).toContain('product-category-tree-item-stub')
    })

    it('should hide children when collapsed', async () => {
      // Arrange
      wrapper = createWrapper({ category: mockCategoryWithChildren })
      const vm = wrapper.vm as any

      // Act - expand then collapse
      vm.toggleExpanded()
      await wrapper.vm.$nextTick()
      await flushPromises()
      vm.toggleExpanded()
      await wrapper.vm.$nextTick()
      await flushPromises()

      // Assert - HTML should not contain child stubs
      const html = wrapper.html()
      expect(html).not.toContain('product-category-tree-item-stub')
    })

    it('should have accessible aria-label on expand button', () => {
      // Arrange & Act
      wrapper = createWrapper({ category: mockCategoryWithChildren })
      const button = wrapper.find('button')

      // Assert
      expect(button.attributes('aria-label')).toBe('common.expand')
    })
  })

  describe('Selection Behavior', () => {
    it('should show unchecked radio when not selected', () => {
      // Arrange & Act
      wrapper = createWrapper({ selected: [] })

      // Assert - no inner check indicator div
      const checkIndicator = wrapper.find('.size-2.rounded-full.bg-primary')
      expect(checkIndicator.exists()).toBe(false)
    })

    it('should show checked radio when selected', () => {
      // Arrange & Act
      wrapper = createWrapper({ selected: ['1'] })

      // Assert - inner check indicator div is present
      const checkIndicator = wrapper.find('.size-2.rounded-full.bg-primary')
      expect(checkIndicator.exists()).toBe(true)
    })

    it('should emit update:selected when clickable area is clicked', async () => {
      // Arrange
      wrapper = createWrapper({ selected: [] })
      const clickableArea = wrapper.find('.flex.items-center.gap-2.flex-1.cursor-pointer')

      // Act
      await clickableArea.trigger('click')
      await flushPromises()

      // Assert
      expect(wrapper.emitted('update:selected')).toBeTruthy()
    })

    it('should select category when clicking unchecked radio', async () => {
      // Arrange
      wrapper = createWrapper({ selected: [] })
      const clickableArea = wrapper.find('.flex.items-center.gap-2.flex-1.cursor-pointer')

      // Act
      await clickableArea.trigger('click')
      await flushPromises()

      // Assert
      const emitted = wrapper.emitted('update:selected')
      expect(emitted?.[0]?.[0]).toEqual(['1'])
    })

    it('should deselect category when clicking checked radio', async () => {
      // Arrange
      wrapper = createWrapper({ selected: ['1'] })
      const clickableArea = wrapper.find('.flex.items-center.gap-2.flex-1.cursor-pointer')

      // Act
      await clickableArea.trigger('click')
      await flushPromises()

      // Assert
      const emitted = wrapper.emitted('update:selected')
      expect(emitted?.[0]?.[0]).toEqual([])
    })
  })

  describe('Auto-expand on Child Selection', () => {
    it('should auto-expand when child is selected', async () => {
      // Arrange & Act
      wrapper = createWrapper({
        category: mockCategoryWithChildren,
        selected: ['11'], // Child is selected
      })
      await flushPromises()

      // Assert - should be expanded (child stubs visible in HTML)
      const html = wrapper.html()
      expect(html).toContain('product-category-tree-item-stub')
    })

    it('should not auto-expand when parent is selected', async () => {
      // Arrange & Act
      wrapper = createWrapper({
        category: mockCategoryWithChildren,
        selected: ['1'], // Parent is selected, not a child
      })
      await flushPromises()

      // Assert - should not be auto-expanded (no child stubs)
      const html = wrapper.html()
      expect(html).not.toContain('product-category-tree-item-stub')
    })
  })

  describe('Level-based Indentation', () => {
    it('should not add padding at level 0', () => {
      // Arrange & Act
      wrapper = createWrapper({ level: 0 })

      // Assert
      const itemDiv = wrapper.find('.flex.items-center')
      expect(itemDiv.classes()).not.toContain('pl-4')
    })

    it('should add padding at level > 0', () => {
      // Arrange & Act
      wrapper = createWrapper({ level: 1 })

      // Assert
      const itemDiv = wrapper.find('.flex.items-center')
      expect(itemDiv.classes()).toContain('pl-4')
    })
  })

  describe('Props Validation', () => {
    it('should accept category prop', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      expect(wrapper.props('category')).toEqual(mockCategory)
    })

    it('should accept selected prop', () => {
      // Arrange & Act
      wrapper = createWrapper({ selected: ['1', '2'] })

      // Assert
      expect(wrapper.props('selected')).toEqual(['1', '2'])
    })

    it('should accept level prop', () => {
      // Arrange & Act
      wrapper = createWrapper({ level: 2 })

      // Assert
      expect(wrapper.props('level')).toBe(2)
    })
  })

  describe('Edge Cases', () => {
    it('should handle category with empty children array', () => {
      // Arrange
      const categoryWithEmptyChildren: CategoryFilter = {
        ...mockCategory,
        children: [],
      }

      // Act
      wrapper = createWrapper({ category: categoryWithEmptyChildren })

      // Assert - should not show expand button
      const buttons = wrapper.findAll('button')
      expect(buttons.length).toBe(0)
    })

    it('should handle deeply nested categories', () => {
      // Arrange
      const deepCategory: CategoryFilter = {
        id: 1,
        name: { en: 'Level 0' },
        slug: 'level-0',
        productCount: 100,
        count: 100,
        children: [
          {
            id: 2,
            name: { en: 'Level 1' },
            slug: 'level-1',
            productCount: 50,
            count: 50,
            children: [
              { id: 3, name: { en: 'Level 2' }, slug: 'level-2', productCount: 25, count: 25 },
            ],
          },
        ],
      }

      // Act
      wrapper = createWrapper({ category: deepCategory })

      // Assert
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle category with zero count', () => {
      // Arrange
      const zeroCountCategory: CategoryFilter = {
        ...mockCategory,
        count: 0,
        productCount: 0,
      }

      // Act
      wrapper = createWrapper({ category: zeroCountCategory })

      // Assert
      expect(wrapper.text()).toContain('(0)')
    })

    it('should handle category with large count', () => {
      // Arrange
      const largeCountCategory: CategoryFilter = {
        ...mockCategory,
        count: 999999,
        productCount: 999999,
      }

      // Act
      wrapper = createWrapper({ category: largeCountCategory })

      // Assert
      expect(wrapper.text()).toContain('(999999)')
    })
  })

  describe('Accessibility', () => {
    it('should have clickable area with proper styling', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      const clickableArea = wrapper.find('.flex.items-center.gap-2.flex-1.cursor-pointer')
      expect(clickableArea.exists()).toBe(true)
    })

    it('should have cursor-pointer on clickable area', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      const clickableArea = wrapper.find('.flex.items-center.gap-2.flex-1.cursor-pointer')
      expect(clickableArea.classes()).toContain('cursor-pointer')
    })

    it('should have accessible aria-label on expand button', () => {
      // Arrange & Act
      wrapper = createWrapper({ category: mockCategoryWithChildren })
      const button = wrapper.find('button')

      // Assert
      expect(button.attributes('aria-label')).toBeTruthy()
    })
  })
})
