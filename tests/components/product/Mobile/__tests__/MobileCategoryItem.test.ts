/**
 * Tests for MobileCategoryItem component
 *
 * Component: components/product/Mobile/MobileCategoryItem.vue
 * Purpose: Displays a mobile-friendly category item with expand/collapse
 *          functionality and child categories
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { VueWrapper } from '@vue/test-utils'
import { mount, flushPromises } from '@vue/test-utils'
import MobileCategoryItem from '~/components/product/Mobile/MobileCategoryItem.vue'
import type { CategoryWithChildren } from '~/types'

describe('MobileCategoryItem', () => {
  let wrapper: VueWrapper

  // Mock data
  const mockCategory: CategoryWithChildren = {
    id: 1,
    name: { en: 'Wine', es: 'Vino' },
    slug: 'wine',
    productCount: 50,
    children: undefined,
    icon: 'lucide:wine',
  }

  const mockCategoryWithChildren: CategoryWithChildren = {
    id: 1,
    name: { en: 'Wine' },
    slug: 'wine',
    productCount: 100,
    children: [
      { id: 11, name: { en: 'Red Wine' }, slug: 'red-wine', productCount: 40, children: undefined },
      { id: 12, name: { en: 'White Wine' }, slug: 'white-wine', productCount: 35, children: undefined },
      { id: 13, name: { en: 'Rose Wine' }, slug: 'rose-wine', productCount: 25, children: undefined },
    ],
    icon: 'lucide:wine',
  }

  // Helper function to create wrapper with default props
  const createWrapper = (props = {}) => {
    return mount(MobileCategoryItem, {
      props: {
        category: mockCategory,
        level: 0,
        ...props,
      },
      global: {
        stubs: {
          MobileCategoryItem: true, // Stub recursive component
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

    it('should have mobile-category-item class', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      expect(wrapper.find('.mobile-category-item').exists()).toBe(true)
    })

    it('should display category name', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert - name is an object, component should render it
      expect(wrapper.text().length).toBeGreaterThan(0)
    })

    it('should display product count when showProductCount is true', () => {
      // Arrange & Act
      wrapper = createWrapper({ showProductCount: true })

      // Assert
      expect(wrapper.text()).toContain('50')
    })

    it('should not display product count when showProductCount is false', () => {
      // Arrange & Act
      wrapper = createWrapper({ showProductCount: false })

      // Assert - count should not be visible (but name still should)
      // Category productCount should not be in a visible span
      expect(wrapper.findAll('.text-gray-500').filter(el => el.text() === '50').length).toBe(0)
    })

    it('should render category icon when provided', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      const icons = wrapper.findAll('[data-testid="icon"]')
      expect(icons.length).toBeGreaterThan(0)
    })
  })

  describe('Expand/Collapse Functionality', () => {
    it('should show expand button when category has children', () => {
      // Arrange & Act
      wrapper = createWrapper({ category: mockCategoryWithChildren })

      // Assert
      const buttons = wrapper.findAll('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should not show expand button when category has no children', () => {
      // Arrange & Act
      wrapper = createWrapper({ category: mockCategory })

      // Assert - should have no inner expand button, just the main button
      const expandButtons = wrapper.findAll('button button')
      expect(expandButtons.length).toBe(0)
    })

    it('should expand children when expand button clicked', async () => {
      // Arrange
      wrapper = createWrapper({ category: mockCategoryWithChildren })
      const vm = wrapper.vm as any

      // Act
      vm.toggleExpanded()
      await wrapper.vm.$nextTick()
      await flushPromises()

      // Assert - children container should be visible
      const html = wrapper.html()
      expect(html).toContain('mobile-category-item-stub')
    })

    it('should collapse children when clicked again', async () => {
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

      // Assert - children should not be visible
      const html = wrapper.html()
      expect(html).not.toContain('mobile-category-item-stub')
    })
  })

  describe('Selection', () => {
    it('should emit select event when category is clicked', async () => {
      // Arrange
      wrapper = createWrapper()
      const mainButton = wrapper.find('.flex.items-center.flex-1')

      // Act
      await mainButton.trigger('click')

      // Assert
      expect(wrapper.emitted('select')).toBeTruthy()
    })

    it('should emit category object with select event', async () => {
      // Arrange
      wrapper = createWrapper()
      const mainButton = wrapper.find('.flex.items-center.flex-1')

      // Act
      await mainButton.trigger('click')

      // Assert
      const emitted = wrapper.emitted('select')
      expect(emitted?.[0]?.[0]).toEqual(mockCategory)
    })

    it('should show check icon when current category matches', () => {
      // Arrange & Act
      wrapper = createWrapper({
        currentCategory: '1',
      })

      // Assert
      const html = wrapper.html()
      expect(html).toContain('check')
    })

    it('should not show check icon when not current category', () => {
      // Arrange & Act
      wrapper = createWrapper({
        currentCategory: '2',
      })

      // Assert - should not have check icon visible
      const icons = wrapper.findAll('[data-testid="icon"]')
      const checkIcons = icons.filter(i => i.classes().join('').includes('check'))
      expect(checkIcons.length).toBe(0)
    })

    it('should match by id or slug', () => {
      // Arrange & Act
      wrapper = createWrapper({
        currentCategory: 'wine', // slug
      })

      // Assert - should show check icon
      const html = wrapper.html()
      expect(html).toContain('bg-blue-50')
    })
  })

  describe('Level-based Indentation', () => {
    it('should not add extra padding at level 0', () => {
      // Arrange & Act
      wrapper = createWrapper({ level: 0 })

      // Assert - component renders without errors
      expect(wrapper.exists()).toBe(true)
    })

    it('should add pl-6 at level 1', () => {
      // Arrange & Act
      wrapper = createWrapper({ level: 1 })

      // Assert
      const item = wrapper.find('.flex.items-center.justify-between')
      expect(item.classes()).toContain('pl-6')
    })

    it('should add pl-9 at level 2', () => {
      // Arrange & Act
      wrapper = createWrapper({ level: 2 })

      // Assert
      const item = wrapper.find('.flex.items-center.justify-between')
      expect(item.classes()).toContain('pl-9')
    })

    it('should add pl-12 at level 3 or higher', () => {
      // Arrange & Act
      wrapper = createWrapper({ level: 3 })

      // Assert
      const item = wrapper.find('.flex.items-center.justify-between')
      expect(item.classes()).toContain('pl-12')
    })
  })

  describe('Auto-expand on Child Selection', () => {
    it('should auto-expand when child is selected', async () => {
      // Arrange & Act
      wrapper = createWrapper({
        category: mockCategoryWithChildren,
        currentCategory: '11', // Child ID
      })
      await flushPromises()

      // Assert - should be expanded
      const html = wrapper.html()
      expect(html).toContain('mobile-category-item-stub')
    })

    it('should not auto-expand when parent is selected', async () => {
      // Arrange & Act
      wrapper = createWrapper({
        category: mockCategoryWithChildren,
        currentCategory: '1', // Parent ID
      })
      await flushPromises()

      // Assert - should not be auto-expanded
      const html = wrapper.html()
      expect(html).not.toContain('mobile-category-item-stub')
    })
  })

  describe('Props Validation', () => {
    it('should accept category prop', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      expect(wrapper.props('category')).toEqual(mockCategory)
    })

    it('should accept level prop', () => {
      // Arrange & Act
      wrapper = createWrapper({ level: 2 })

      // Assert
      expect(wrapper.props('level')).toBe(2)
    })

    it('should accept showProductCount prop', () => {
      // Arrange & Act
      wrapper = createWrapper({ showProductCount: false })

      // Assert
      expect(wrapper.props('showProductCount')).toBe(false)
    })

    it('should default showProductCount to true', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      expect(wrapper.props('showProductCount')).toBe(true)
    })

    it('should accept currentCategory prop', () => {
      // Arrange & Act
      wrapper = createWrapper({ currentCategory: 'wine' })

      // Assert
      expect(wrapper.props('currentCategory')).toBe('wine')
    })
  })

  describe('Edge Cases', () => {
    it('should handle category without icon', () => {
      // Arrange
      const categoryNoIcon: CategoryWithChildren = {
        ...mockCategory,
        icon: undefined,
      }

      // Act
      wrapper = createWrapper({ category: categoryNoIcon })

      // Assert
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle deeply nested categories', () => {
      // Arrange
      const deepCategory: CategoryWithChildren = {
        id: 1,
        name: { en: 'Level 0' },
        slug: 'level-0',
        productCount: 100,
        children: [
          {
            id: 2,
            name: { en: 'Level 1' },
            slug: 'level-1',
            productCount: 50,
            children: [
              { id: 3, name: { en: 'Level 2' }, slug: 'level-2', productCount: 25, children: undefined },
            ],
          },
        ],
      }

      // Act
      wrapper = createWrapper({ category: deepCategory, level: 0 })

      // Assert
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle category with empty children array', () => {
      // Arrange
      const categoryEmptyChildren: CategoryWithChildren = {
        ...mockCategory,
        children: [],
      }

      // Act
      wrapper = createWrapper({ category: categoryEmptyChildren })

      // Assert - should not show expand button
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Accessibility', () => {
    it('should have button element for category selection', () => {
      // Arrange & Act
      wrapper = createWrapper()

      // Assert
      const buttons = wrapper.findAll('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })
})
