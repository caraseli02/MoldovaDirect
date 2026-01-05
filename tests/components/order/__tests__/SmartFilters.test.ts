import { describe, it, expect, vi } from 'vitest'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import SmartFilters from '~/components/order/SmartFilters.vue'

// Mock #imports for Nuxt auto-imports
vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({
    t: (key: string) => key,
  })),
}))

type FilterType = 'in-transit' | 'delivered-month' | 'last-3-months' | null

interface FilterCounts {
  inTransit: number
  deliveredMonth: number
}

describe('SmartFilters', () => {
  const defaultCounts: FilterCounts = {
    inTransit: 5,
    deliveredMonth: 12,
  }

  const mountComponent = (props: {
    counts?: FilterCounts
    modelValue?: FilterType
  } = {}): VueWrapper => {
    return mount(SmartFilters, {
      props: {
        counts: props.counts ?? defaultCounts,
        modelValue: props.modelValue ?? null,
      },
    })
  }

  describe('Rendering', () => {
    it('should render the component', () => {
      const wrapper = mountComponent()
      expect(wrapper.exists()).toBe(true)
    })

    it('should render all four filter buttons', () => {
      const wrapper = mountComponent()
      const buttons = wrapper.findAll('button')
      expect(buttons.length).toBe(4)
    })

    it('should render in-transit filter button', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('orders.filters.inTransit')
    })

    it('should render delivered this month filter button', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('orders.filters.deliveredThisMonth')
    })

    it('should render last 3 months filter button', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('orders.filters.last3Months')
    })

    it('should render all orders filter button', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('orders.filters.allOrders')
    })

    it('should render icons for all filter buttons', () => {
      const wrapper = mountComponent()
      const svgs = wrapper.findAll('svg')
      expect(svgs.length).toBe(4)
    })
  })

  describe('Count Badges', () => {
    it('should display in-transit count badge when count > 0', () => {
      const wrapper = mountComponent({ counts: { inTransit: 5, deliveredMonth: 0 } })
      expect(wrapper.text()).toContain('5')
    })

    it('should display delivered month count badge when count > 0', () => {
      const wrapper = mountComponent({ counts: { inTransit: 0, deliveredMonth: 12 } })
      expect(wrapper.text()).toContain('12')
    })

    it('should not display in-transit badge when count is 0', () => {
      const wrapper = mountComponent({ counts: { inTransit: 0, deliveredMonth: 10 } })
      const buttons = wrapper.findAll('button')
      const inTransitButton = buttons[0]
      // Badge should not be rendered for 0 count
      const badges = inTransitButton.findAll('.px-2.py-0\\.5')
      expect(badges.length).toBe(0)
    })

    it('should not display delivered month badge when count is 0', () => {
      const wrapper = mountComponent({ counts: { inTransit: 10, deliveredMonth: 0 } })
      const buttons = wrapper.findAll('button')
      const deliveredButton = buttons[1]
      const badges = deliveredButton.findAll('.px-2.py-0\\.5')
      expect(badges.length).toBe(0)
    })

    it('should handle undefined counts gracefully', () => {
      const wrapper = mount(SmartFilters, {
        props: {},
      })
      expect(wrapper.exists()).toBe(true)
      // Should use default counts of 0
    })

    it('should handle null counts gracefully', () => {
      const wrapper = mount(SmartFilters, {
        props: {
          // @ts-expect-error - Testing edge case
          counts: null,
        },
      })
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Filter Selection', () => {
    it('should emit filter event when in-transit button is clicked', async () => {
      const wrapper = mountComponent()
      const buttons = wrapper.findAll('button')
      await buttons[0].trigger('click')

      expect(wrapper.emitted('filter')).toBeTruthy()
      expect(wrapper.emitted('filter')![0]).toEqual(['in-transit'])
    })

    it('should emit filter event when delivered-month button is clicked', async () => {
      const wrapper = mountComponent()
      const buttons = wrapper.findAll('button')
      await buttons[1].trigger('click')

      expect(wrapper.emitted('filter')).toBeTruthy()
      expect(wrapper.emitted('filter')![0]).toEqual(['delivered-month'])
    })

    it('should emit filter event when last-3-months button is clicked', async () => {
      const wrapper = mountComponent()
      const buttons = wrapper.findAll('button')
      await buttons[2].trigger('click')

      expect(wrapper.emitted('filter')).toBeTruthy()
      expect(wrapper.emitted('filter')![0]).toEqual(['last-3-months'])
    })

    it('should emit filter event with null when all orders button is clicked', async () => {
      const wrapper = mountComponent({ modelValue: 'in-transit' })
      const buttons = wrapper.findAll('button')
      await buttons[3].trigger('click')

      expect(wrapper.emitted('filter')).toBeTruthy()
      expect(wrapper.emitted('filter')![0]).toEqual([null])
    })

    it('should emit update:modelValue when filter changes', async () => {
      const wrapper = mountComponent()
      const buttons = wrapper.findAll('button')
      await buttons[0].trigger('click')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')![0]).toEqual(['in-transit'])
    })

    it('should emit both filter and update:modelValue events', async () => {
      const wrapper = mountComponent()
      const buttons = wrapper.findAll('button')
      await buttons[1].trigger('click')

      expect(wrapper.emitted('filter')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('filter')![0]).toEqual(['delivered-month'])
      expect(wrapper.emitted('update:modelValue')![0]).toEqual(['delivered-month'])
    })
  })

  describe('Active State Styling', () => {
    it('should show active state for in-transit filter', () => {
      const wrapper = mountComponent({ modelValue: 'in-transit' })
      const buttons = wrapper.findAll('button')
      expect(buttons[0].classes()).toContain('bg-blue-600')
      expect(buttons[0].classes()).toContain('text-white')
    })

    it('should show active state for delivered-month filter', () => {
      const wrapper = mountComponent({ modelValue: 'delivered-month' })
      const buttons = wrapper.findAll('button')
      expect(buttons[1].classes()).toContain('bg-green-600')
      expect(buttons[1].classes()).toContain('text-white')
    })

    it('should show active state for last-3-months filter', () => {
      const wrapper = mountComponent({ modelValue: 'last-3-months' })
      const buttons = wrapper.findAll('button')
      expect(buttons[2].classes()).toContain('bg-purple-600')
      expect(buttons[2].classes()).toContain('text-white')
    })

    it('should show active state for all orders filter (null)', () => {
      const wrapper = mountComponent({ modelValue: null })
      const buttons = wrapper.findAll('button')
      expect(buttons[3].classes()).toContain('bg-gray-600')
    })

    it('should show inactive state for non-selected filters', () => {
      const wrapper = mountComponent({ modelValue: 'in-transit' })
      const buttons = wrapper.findAll('button')
      // Delivered month should be inactive
      expect(buttons[1].classes()).toContain('bg-gray-100')
      expect(buttons[1].classes()).toContain('text-gray-700')
    })

    it('should update active state when clicking different filters', async () => {
      const wrapper = mountComponent({ modelValue: null })
      const buttons = wrapper.findAll('button')

      // Initially all orders is active
      expect(buttons[3].classes()).toContain('bg-gray-600')

      // Click in-transit
      await buttons[0].trigger('click')

      // Internal state should update
      expect(buttons[0].classes()).toContain('bg-blue-600')
    })
  })

  describe('Badge Styling Based on Active State', () => {
    it('should apply active badge style when in-transit is selected', () => {
      const wrapper = mountComponent({
        modelValue: 'in-transit',
        counts: { inTransit: 5, deliveredMonth: 10 },
      })
      const buttons = wrapper.findAll('button')
      const badge = buttons[0].find('.px-2')
      expect(badge.classes()).toContain('bg-blue-500')
      expect(badge.classes()).toContain('text-white')
    })

    it('should apply inactive badge style when in-transit is not selected', () => {
      const wrapper = mountComponent({
        modelValue: 'delivered-month',
        counts: { inTransit: 5, deliveredMonth: 10 },
      })
      const buttons = wrapper.findAll('button')
      const badge = buttons[0].find('.px-2')
      expect(badge.classes()).toContain('bg-blue-100')
    })

    it('should apply active badge style when delivered-month is selected', () => {
      const wrapper = mountComponent({
        modelValue: 'delivered-month',
        counts: { inTransit: 5, deliveredMonth: 10 },
      })
      const buttons = wrapper.findAll('button')
      const badge = buttons[1].find('.px-2')
      expect(badge.classes()).toContain('bg-green-500')
      expect(badge.classes()).toContain('text-white')
    })

    it('should apply inactive badge style when delivered-month is not selected', () => {
      const wrapper = mountComponent({
        modelValue: 'in-transit',
        counts: { inTransit: 5, deliveredMonth: 10 },
      })
      const buttons = wrapper.findAll('button')
      const badge = buttons[1].find('.px-2')
      expect(badge.classes()).toContain('bg-green-100')
    })
  })

  describe('v-model Binding', () => {
    it('should sync with external modelValue changes', async () => {
      const wrapper = mountComponent({ modelValue: null })
      const buttons = wrapper.findAll('button')

      // Initially null (all orders active)
      expect(buttons[3].classes()).toContain('bg-gray-600')

      // Update modelValue prop
      await wrapper.setProps({ modelValue: 'in-transit' })

      // Should reflect the new value
      expect(buttons[0].classes()).toContain('bg-blue-600')
    })

    it('should work as controlled component', async () => {
      const wrapper = mountComponent({ modelValue: 'delivered-month' })
      const buttons = wrapper.findAll('button')

      // Delivered month should be active
      expect(buttons[1].classes()).toContain('bg-green-600')

      // Click a different filter
      await buttons[2].trigger('click')

      // Should emit update event
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')![0]).toEqual(['last-3-months'])
    })
  })

  describe('Accessibility', () => {
    it('should have role="group" on container', () => {
      const wrapper = mountComponent()
      const container = wrapper.find('[role="group"]')
      expect(container.exists()).toBe(true)
    })

    it('should have aria-label on container', () => {
      const wrapper = mountComponent()
      const container = wrapper.find('[role="group"]')
      expect(container.attributes('aria-label')).toBe('orders.filters.quickFilters')
    })

    it('should have aria-pressed attribute on buttons', () => {
      const wrapper = mountComponent({ modelValue: 'in-transit' })
      const buttons = wrapper.findAll('button')

      // Active button should have aria-pressed="true"
      expect(buttons[0].attributes('aria-pressed')).toBe('true')

      // Inactive buttons should have aria-pressed="false"
      expect(buttons[1].attributes('aria-pressed')).toBe('false')
      expect(buttons[2].attributes('aria-pressed')).toBe('false')
      expect(buttons[3].attributes('aria-pressed')).toBe('false')
    })

    it('should have aria-pressed="true" for null filter when all orders is selected', () => {
      const wrapper = mountComponent({ modelValue: null })
      const buttons = wrapper.findAll('button')
      expect(buttons[3].attributes('aria-pressed')).toBe('true')
    })

    it('should have aria-hidden on decorative icons', () => {
      const wrapper = mountComponent()
      const svgs = wrapper.findAll('svg')
      svgs.forEach((svg) => {
        expect(svg.attributes('aria-hidden')).toBe('true')
      })
    })

    it('should have focus ring classes for keyboard navigation', () => {
      const wrapper = mountComponent()
      const buttons = wrapper.findAll('button')
      buttons.forEach((button) => {
        expect(button.classes()).toContain('focus:outline-none')
        expect(button.classes()).toContain('focus:ring-2')
      })
    })

    it('should have appropriate focus ring colors per filter type', () => {
      const wrapper = mountComponent()
      const buttons = wrapper.findAll('button')

      // In-transit: blue focus ring
      expect(buttons[0].classes()).toContain('focus:ring-blue-500')

      // Delivered month: green focus ring
      expect(buttons[1].classes()).toContain('focus:ring-green-500')

      // Last 3 months: purple focus ring
      expect(buttons[2].classes()).toContain('focus:ring-purple-500')

      // All orders: gray focus ring
      expect(buttons[3].classes()).toContain('focus:ring-gray-500')
    })
  })

  describe('Dark Mode Support', () => {
    it('should have dark mode classes for inactive buttons', () => {
      const wrapper = mountComponent({ modelValue: 'in-transit' })
      const buttons = wrapper.findAll('button')

      // Check inactive button has dark mode classes
      expect(buttons[1].classes()).toContain('dark:bg-gray-700')
      expect(buttons[1].classes()).toContain('dark:text-gray-300')
    })

    it('should have dark mode hover classes', () => {
      const wrapper = mountComponent({ modelValue: 'in-transit' })
      const buttons = wrapper.findAll('button')

      // Inactive buttons should have dark hover classes
      expect(buttons[1].classes()).toContain('dark:hover:bg-gray-600')
    })

    it('should have dark mode badge classes', () => {
      const wrapper = mountComponent({
        modelValue: null,
        counts: { inTransit: 5, deliveredMonth: 10 },
      })
      const buttons = wrapper.findAll('button')

      // In-transit badge when inactive
      const inTransitBadge = buttons[0].find('.px-2')
      expect(inTransitBadge.classes()).toContain('dark:bg-blue-900')
      expect(inTransitBadge.classes()).toContain('dark:text-blue-300')
    })
  })

  describe('Responsive Design', () => {
    it('should have overflow handling for horizontal scroll', () => {
      const wrapper = mountComponent()
      const container = wrapper.find('[role="group"]')
      expect(container.classes()).toContain('overflow-x-auto')
    })

    it('should have horizontal layout with gap', () => {
      const wrapper = mountComponent()
      const container = wrapper.find('[role="group"]')
      expect(container.classes()).toContain('flex')
      expect(container.classes()).toContain('items-center')
      expect(container.classes()).toContain('gap-2')
    })

    it('should prevent text wrapping in buttons', () => {
      const wrapper = mountComponent()
      const buttons = wrapper.findAll('button')
      buttons.forEach((button) => {
        expect(button.classes()).toContain('whitespace-nowrap')
      })
    })

    it('should have bottom padding for scroll indicator', () => {
      const wrapper = mountComponent()
      const container = wrapper.find('[role="group"]')
      expect(container.classes()).toContain('pb-2')
    })
  })

  describe('Button Styling', () => {
    it('should have rounded-full class on all buttons', () => {
      const wrapper = mountComponent()
      const buttons = wrapper.findAll('button')
      buttons.forEach((button) => {
        expect(button.classes()).toContain('rounded-full')
      })
    })

    it('should have consistent padding on buttons', () => {
      const wrapper = mountComponent()
      const buttons = wrapper.findAll('button')
      buttons.forEach((button) => {
        expect(button.classes()).toContain('px-4')
        expect(button.classes()).toContain('py-2')
      })
    })

    it('should have transition-all for smooth state changes', () => {
      const wrapper = mountComponent()
      const buttons = wrapper.findAll('button')
      buttons.forEach((button) => {
        expect(button.classes()).toContain('transition-all')
      })
    })

    it('should have proper font styling', () => {
      const wrapper = mountComponent()
      const buttons = wrapper.findAll('button')
      buttons.forEach((button) => {
        expect(button.classes()).toContain('text-sm')
        expect(button.classes()).toContain('font-medium')
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle rapid clicking', async () => {
      const wrapper = mountComponent()
      const buttons = wrapper.findAll('button')

      // Rapid clicks on different buttons
      await buttons[0].trigger('click')
      await buttons[1].trigger('click')
      await buttons[2].trigger('click')
      await buttons[3].trigger('click')

      expect(wrapper.emitted('filter')!.length).toBe(4)
      expect(wrapper.emitted('update:modelValue')!.length).toBe(4)
    })

    it('should handle clicking the same filter multiple times', async () => {
      const wrapper = mountComponent()
      const buttons = wrapper.findAll('button')

      await buttons[0].trigger('click')
      await buttons[0].trigger('click')
      await buttons[0].trigger('click')

      // Should emit each time
      expect(wrapper.emitted('filter')!.length).toBe(3)
      // All emissions should be the same filter
      expect(wrapper.emitted('filter')![0]).toEqual(['in-transit'])
      expect(wrapper.emitted('filter')![1]).toEqual(['in-transit'])
      expect(wrapper.emitted('filter')![2]).toEqual(['in-transit'])
    })

    it('should handle very large count numbers', () => {
      const wrapper = mountComponent({
        counts: { inTransit: 9999, deliveredMonth: 99999 },
      })
      expect(wrapper.text()).toContain('9999')
      expect(wrapper.text()).toContain('99999')
    })

    it('should handle negative counts gracefully', () => {
      const wrapper = mountComponent({
        counts: { inTransit: -5, deliveredMonth: -10 },
      })
      // Negative counts should not show badges (count > 0 check)
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle float counts', () => {
      const wrapper = mountComponent({
        // @ts-expect-error - Testing edge case with float
        counts: { inTransit: 5.5, deliveredMonth: 10.9 },
      })
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Icon Rendering', () => {
    it('should render lightning bolt icon for in-transit', () => {
      const wrapper = mountComponent()
      const buttons = wrapper.findAll('button')
      const svg = buttons[0].find('svg')
      expect(svg.exists()).toBe(true)
      expect(svg.classes()).toContain('w-4')
      expect(svg.classes()).toContain('h-4')
    })

    it('should render checkmark circle icon for delivered month', () => {
      const wrapper = mountComponent()
      const buttons = wrapper.findAll('button')
      const svg = buttons[1].find('svg')
      expect(svg.exists()).toBe(true)
    })

    it('should render calendar icon for last 3 months', () => {
      const wrapper = mountComponent()
      const buttons = wrapper.findAll('button')
      const svg = buttons[2].find('svg')
      expect(svg.exists()).toBe(true)
    })

    it('should render list icon for all orders', () => {
      const wrapper = mountComponent()
      const buttons = wrapper.findAll('button')
      const svg = buttons[3].find('svg')
      expect(svg.exists()).toBe(true)
    })

    it('should have proper spacing between icon and text', () => {
      const wrapper = mountComponent()
      const buttons = wrapper.findAll('button')
      const svgs = buttons[0].findAll('svg')
      svgs.forEach((svg) => {
        expect(svg.classes()).toContain('mr-1.5')
      })
    })
  })

  describe('Props Default Values', () => {
    it('should use default modelValue of null', () => {
      const wrapper = mount(SmartFilters, {
        props: { counts: defaultCounts },
      })
      const buttons = wrapper.findAll('button')
      // All orders should be active by default
      expect(buttons[3].classes()).toContain('bg-gray-600')
    })

    it('should use default counts of 0', () => {
      const wrapper = mount(SmartFilters, {
        props: {},
      })
      expect(wrapper.exists()).toBe(true)
      // Should not show any badges with 0 counts
    })
  })

  describe('Component State Management', () => {
    it('should maintain internal state correctly', async () => {
      const wrapper = mountComponent({ modelValue: null })
      const buttons = wrapper.findAll('button')

      // Click in-transit
      await buttons[0].trigger('click')
      expect(buttons[0].classes()).toContain('bg-blue-600')

      // Click delivered-month
      await buttons[1].trigger('click')
      expect(buttons[1].classes()).toContain('bg-green-600')
      expect(buttons[0].classes()).not.toContain('bg-blue-600')
    })

    it('should watch for external modelValue changes', async () => {
      const wrapper = mountComponent({ modelValue: null })

      // Update external prop
      await wrapper.setProps({ modelValue: 'in-transit' })

      const buttons = wrapper.findAll('button')
      expect(buttons[0].classes()).toContain('bg-blue-600')

      // Change to another filter
      await wrapper.setProps({ modelValue: 'last-3-months' })
      expect(buttons[2].classes()).toContain('bg-purple-600')
    })
  })
})
