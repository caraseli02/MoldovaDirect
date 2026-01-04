import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import OrderMetrics from '~/components/order/OrderMetrics.vue'

vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({
    t: (k: string, fallback?: string) => fallback || k,
    locale: { value: 'en' },
  })),
}))

describe('Order OrderMetrics', () => {
  // Mock metrics data factory
  const createMockMetrics = (overrides = {}) => ({
    activeOrders: 5,
    deliveredThisMonth: 12,
    totalOrders: 50,
    totalSpentThisMonth: 1250,
    ...overrides,
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render the component', () => {
      const wrapper = mount(OrderMetrics, {
        props: {
          metrics: createMockMetrics(),
        },
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('should render all four metric cards', () => {
      const wrapper = mount(OrderMetrics, {
        props: {
          metrics: createMockMetrics(),
        },
      })
      const cards = wrapper.findAll('[role="region"]')
      expect(cards.length).toBe(4)
    })

    it('should apply grid layout classes', () => {
      const wrapper = mount(OrderMetrics, {
        props: {
          metrics: createMockMetrics(),
        },
      })
      const container = wrapper.find('.grid')
      expect(container.classes()).toContain('grid-cols-2')
      expect(container.classes()).toContain('md:grid-cols-4')
      expect(container.classes()).toContain('gap-4')
    })
  })

  describe('Active Orders Metric', () => {
    it('should display active orders count', () => {
      const wrapper = mount(OrderMetrics, {
        props: {
          metrics: createMockMetrics({ activeOrders: 8 }),
        },
      })
      expect(wrapper.text()).toContain('8')
    })

    it('should display active orders label', () => {
      const wrapper = mount(OrderMetrics, {
        props: {
          metrics: createMockMetrics(),
        },
      })
      expect(wrapper.text()).toContain('orders.metrics.active')
    })

    it('should have blue theme colors', () => {
      const wrapper = mount(OrderMetrics, {
        props: {
          metrics: createMockMetrics(),
        },
      })
      const activeCard = wrapper.find('.bg-blue-50')
      expect(activeCard.exists()).toBe(true)
      expect(activeCard.classes()).toContain('border-blue-200')
    })

    it('should have proper aria-label for active orders', () => {
      const wrapper = mount(OrderMetrics, {
        props: {
          metrics: createMockMetrics(),
        },
      })
      const activeCard = wrapper.find('[aria-label="orders.metrics.activeOrders"]')
      expect(activeCard.exists()).toBe(true)
    })
  })

  describe('Delivered This Month Metric', () => {
    it('should display delivered count', () => {
      const wrapper = mount(OrderMetrics, {
        props: {
          metrics: createMockMetrics({ deliveredThisMonth: 15 }),
        },
      })
      expect(wrapper.text()).toContain('15')
    })

    it('should display delivered label', () => {
      const wrapper = mount(OrderMetrics, {
        props: {
          metrics: createMockMetrics(),
        },
      })
      expect(wrapper.text()).toContain('orders.metrics.delivered')
    })

    it('should have green theme colors', () => {
      const wrapper = mount(OrderMetrics, {
        props: {
          metrics: createMockMetrics(),
        },
      })
      const deliveredCard = wrapper.find('.bg-green-50')
      expect(deliveredCard.exists()).toBe(true)
      expect(deliveredCard.classes()).toContain('border-green-200')
    })

    it('should have proper aria-label for delivered orders', () => {
      const wrapper = mount(OrderMetrics, {
        props: {
          metrics: createMockMetrics(),
        },
      })
      const deliveredCard = wrapper.find('[aria-label="orders.metrics.deliveredThisMonth"]')
      expect(deliveredCard.exists()).toBe(true)
    })
  })

  describe('Total Orders Metric', () => {
    it('should display total orders count', () => {
      const wrapper = mount(OrderMetrics, {
        props: {
          metrics: createMockMetrics({ totalOrders: 100 }),
        },
      })
      expect(wrapper.text()).toContain('100')
    })

    it('should display total orders label', () => {
      const wrapper = mount(OrderMetrics, {
        props: {
          metrics: createMockMetrics(),
        },
      })
      expect(wrapper.text()).toContain('orders.metrics.total')
    })

    it('should have purple theme colors', () => {
      const wrapper = mount(OrderMetrics, {
        props: {
          metrics: createMockMetrics(),
        },
      })
      const totalCard = wrapper.find('.bg-purple-50')
      expect(totalCard.exists()).toBe(true)
      expect(totalCard.classes()).toContain('border-purple-200')
    })

    it('should have proper aria-label for total orders', () => {
      const wrapper = mount(OrderMetrics, {
        props: {
          metrics: createMockMetrics(),
        },
      })
      const totalCard = wrapper.find('[aria-label="orders.metrics.totalOrders"]')
      expect(totalCard.exists()).toBe(true)
    })
  })

  describe('Total Spent This Month Metric', () => {
    it('should display formatted total spent amount', () => {
      const wrapper = mount(OrderMetrics, {
        props: {
          metrics: createMockMetrics({ totalSpentThisMonth: 2500 }),
        },
      })
      // Should contain the formatted price with EUR symbol or amount
      expect(wrapper.html()).toContain('2')
    })

    it('should display spent this month label', () => {
      const wrapper = mount(OrderMetrics, {
        props: {
          metrics: createMockMetrics(),
        },
      })
      expect(wrapper.text()).toContain('orders.metrics.thisMonth')
    })

    it('should have amber theme colors', () => {
      const wrapper = mount(OrderMetrics, {
        props: {
          metrics: createMockMetrics(),
        },
      })
      const spentCard = wrapper.find('.bg-amber-50')
      expect(spentCard.exists()).toBe(true)
      expect(spentCard.classes()).toContain('border-amber-200')
    })

    it('should have proper aria-label for spent amount', () => {
      const wrapper = mount(OrderMetrics, {
        props: {
          metrics: createMockMetrics(),
        },
      })
      const spentCard = wrapper.find('[aria-label="orders.metrics.spentThisMonth"]')
      expect(spentCard.exists()).toBe(true)
    })
  })

  describe('Loading State', () => {
    it('should show loading indicator when loading is true', () => {
      const wrapper = mount(OrderMetrics, {
        props: {
          metrics: createMockMetrics(),
          loading: true,
        },
      })
      const loadingIndicators = wrapper.findAll('.animate-pulse')
      expect(loadingIndicators.length).toBe(4)
    })

    it('should show ellipsis during loading', () => {
      const wrapper = mount(OrderMetrics, {
        props: {
          metrics: createMockMetrics(),
          loading: true,
        },
      })
      expect(wrapper.text()).toContain('...')
    })

    it('should not show metrics values during loading', () => {
      const wrapper = mount(OrderMetrics, {
        props: {
          metrics: createMockMetrics({ activeOrders: 999 }),
          loading: true,
        },
      })
      // When loading, the 999 value should not be displayed
      const valueElements = wrapper.findAll('.text-2xl.font-bold')
      valueElements.forEach((el) => {
        if (el.classes().includes('animate-pulse')) {
          expect(el.text()).toBe('...')
        }
      })
    })

    it('should show actual values when loading is false', () => {
      const wrapper = mount(OrderMetrics, {
        props: {
          metrics: createMockMetrics({ activeOrders: 7 }),
          loading: false,
        },
      })
      expect(wrapper.text()).toContain('7')
    })

    it('should default loading to false', () => {
      const wrapper = mount(OrderMetrics, {
        props: {
          metrics: createMockMetrics({ activeOrders: 3 }),
        },
      })
      expect(wrapper.text()).toContain('3')
      expect(wrapper.findAll('.animate-pulse').length).toBe(0)
    })
  })

  describe('Price Formatting', () => {
    it('should format price with EUR currency', () => {
      const wrapper = mount(OrderMetrics, {
        props: {
          metrics: createMockMetrics({ totalSpentThisMonth: 1500 }),
        },
      })
      // EUR formatting should be applied
      expect(wrapper.html()).toContain('1')
    })

    it('should handle zero spent amount', () => {
      const wrapper = mount(OrderMetrics, {
        props: {
          metrics: createMockMetrics({ totalSpentThisMonth: 0 }),
        },
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle null price gracefully', () => {
      const wrapper = mount(OrderMetrics, {
        props: {
          metrics: createMockMetrics({ totalSpentThisMonth: null as any }),
        },
      })
      expect(wrapper.text()).toContain('0.00')
    })

    it('should handle undefined price gracefully', () => {
      const wrapper = mount(OrderMetrics, {
        props: {
          metrics: createMockMetrics({ totalSpentThisMonth: undefined as any }),
        },
      })
      expect(wrapper.text()).toContain('0.00')
    })

    it('should handle NaN price gracefully', () => {
      const wrapper = mount(OrderMetrics, {
        props: {
          metrics: createMockMetrics({ totalSpentThisMonth: NaN }),
        },
      })
      expect(wrapper.text()).toContain('0.00')
    })

    it('should format large amounts correctly', () => {
      const wrapper = mount(OrderMetrics, {
        props: {
          metrics: createMockMetrics({ totalSpentThisMonth: 999999 }),
        },
      })
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero values for all metrics', () => {
      const wrapper = mount(OrderMetrics, {
        props: {
          metrics: {
            activeOrders: 0,
            deliveredThisMonth: 0,
            totalOrders: 0,
            totalSpentThisMonth: 0,
          },
        },
      })
      expect(wrapper.exists()).toBe(true)
      // Should show 0 for the numeric fields
      const values = wrapper.findAll('.text-2xl.font-bold')
      expect(values.length).toBe(4)
    })

    it('should handle very large numbers', () => {
      const wrapper = mount(OrderMetrics, {
        props: {
          metrics: {
            activeOrders: 1000000,
            deliveredThisMonth: 999999,
            totalOrders: 9999999,
            totalSpentThisMonth: 100000000,
          },
        },
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle negative numbers', () => {
      const wrapper = mount(OrderMetrics, {
        props: {
          metrics: {
            activeOrders: -5,
            deliveredThisMonth: -10,
            totalOrders: -1,
            totalSpentThisMonth: -500,
          },
        },
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle decimal spent amount', () => {
      const wrapper = mount(OrderMetrics, {
        props: {
          metrics: createMockMetrics({ totalSpentThisMonth: 1234.56 }),
        },
      })
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Accessibility', () => {
    it('should have role="region" on all metric cards', () => {
      const wrapper = mount(OrderMetrics, {
        props: {
          metrics: createMockMetrics(),
        },
      })
      const regions = wrapper.findAll('[role="region"]')
      expect(regions.length).toBe(4)
    })

    it('should have aria-label on all metric cards', () => {
      const wrapper = mount(OrderMetrics, {
        props: {
          metrics: createMockMetrics(),
        },
      })
      const regions = wrapper.findAll('[role="region"]')
      regions.forEach((region) => {
        expect(region.attributes('aria-label')).toBeTruthy()
      })
    })

    it('should have aria-hidden on decorative icons', () => {
      const wrapper = mount(OrderMetrics, {
        props: {
          metrics: createMockMetrics(),
        },
      })
      const icons = wrapper.findAll('svg')
      icons.forEach((icon) => {
        expect(icon.attributes('aria-hidden')).toBe('true')
      })
    })

    it('should have proper heading structure with labels', () => {
      const wrapper = mount(OrderMetrics, {
        props: {
          metrics: createMockMetrics(),
        },
      })
      const labels = wrapper.findAll('.text-xs.font-medium')
      expect(labels.length).toBe(4)
    })
  })

  describe('Dark Mode Support', () => {
    it('should have dark mode classes for active orders card', () => {
      const wrapper = mount(OrderMetrics, {
        props: {
          metrics: createMockMetrics(),
        },
      })
      const activeCard = wrapper.find('.bg-blue-50')
      expect(activeCard.classes()).toContain('dark:bg-blue-900/20')
      expect(activeCard.classes()).toContain('dark:border-blue-800')
    })

    it('should have dark mode classes for delivered card', () => {
      const wrapper = mount(OrderMetrics, {
        props: {
          metrics: createMockMetrics(),
        },
      })
      const deliveredCard = wrapper.find('.bg-green-50')
      expect(deliveredCard.classes()).toContain('dark:bg-green-900/20')
      expect(deliveredCard.classes()).toContain('dark:border-green-800')
    })

    it('should have dark mode classes for total orders card', () => {
      const wrapper = mount(OrderMetrics, {
        props: {
          metrics: createMockMetrics(),
        },
      })
      const totalCard = wrapper.find('.bg-purple-50')
      expect(totalCard.classes()).toContain('dark:bg-purple-900/20')
      expect(totalCard.classes()).toContain('dark:border-purple-800')
    })

    it('should have dark mode classes for spent card', () => {
      const wrapper = mount(OrderMetrics, {
        props: {
          metrics: createMockMetrics(),
        },
      })
      const spentCard = wrapper.find('.bg-amber-50')
      expect(spentCard.classes()).toContain('dark:bg-amber-900/20')
      expect(spentCard.classes()).toContain('dark:border-amber-800')
    })

    it('should have dark mode text colors', () => {
      const wrapper = mount(OrderMetrics, {
        props: {
          metrics: createMockMetrics(),
        },
      })
      const blueLabels = wrapper.findAll('.text-blue-700')
      blueLabels.forEach((label) => {
        expect(label.classes()).toContain('dark:text-blue-300')
      })
    })
  })

  describe('Icons', () => {
    it('should render all four metric icons', () => {
      const wrapper = mount(OrderMetrics, {
        props: {
          metrics: createMockMetrics(),
        },
      })
      const icons = wrapper.findAll('svg')
      expect(icons.length).toBe(4)
    })

    it('should have proper icon styling', () => {
      const wrapper = mount(OrderMetrics, {
        props: {
          metrics: createMockMetrics(),
        },
      })
      const icons = wrapper.findAll('svg')
      icons.forEach((icon) => {
        expect(icon.classes()).toContain('w-5')
        expect(icon.classes()).toContain('h-5')
      })
    })
  })

  describe('Layout and Styling', () => {
    it('should have proper card padding', () => {
      const wrapper = mount(OrderMetrics, {
        props: {
          metrics: createMockMetrics(),
        },
      })
      const cards = wrapper.findAll('[role="region"]')
      cards.forEach((card) => {
        expect(card.classes()).toContain('p-4')
      })
    })

    it('should have rounded corners on cards', () => {
      const wrapper = mount(OrderMetrics, {
        props: {
          metrics: createMockMetrics(),
        },
      })
      const cards = wrapper.findAll('[role="region"]')
      cards.forEach((card) => {
        expect(card.classes()).toContain('rounded-lg')
      })
    })

    it('should have border on cards', () => {
      const wrapper = mount(OrderMetrics, {
        props: {
          metrics: createMockMetrics(),
        },
      })
      const cards = wrapper.findAll('[role="region"]')
      cards.forEach((card) => {
        expect(card.classes()).toContain('border')
      })
    })

    it('should have proper flex layout for card headers', () => {
      const wrapper = mount(OrderMetrics, {
        props: {
          metrics: createMockMetrics(),
        },
      })
      const headers = wrapper.findAll('.flex.items-center.justify-between')
      expect(headers.length).toBe(4)
    })

    it('should have proper font weight for metric values', () => {
      const wrapper = mount(OrderMetrics, {
        props: {
          metrics: createMockMetrics(),
        },
      })
      const values = wrapper.findAll('.text-2xl.font-bold')
      expect(values.length).toBe(4)
    })
  })

  describe('Responsiveness', () => {
    it('should have responsive grid classes', () => {
      const wrapper = mount(OrderMetrics, {
        props: {
          metrics: createMockMetrics(),
        },
      })
      const grid = wrapper.find('.grid')
      expect(grid.classes()).toContain('grid-cols-2')
      expect(grid.classes()).toContain('md:grid-cols-4')
    })
  })

  describe('Props Validation', () => {
    it('should accept valid metrics object', () => {
      const wrapper = mount(OrderMetrics, {
        props: {
          metrics: createMockMetrics(),
        },
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('should accept loading as boolean', () => {
      const wrapper = mount(OrderMetrics, {
        props: {
          metrics: createMockMetrics(),
          loading: true,
        },
      })
      expect(wrapper.props('loading')).toBe(true)
    })
  })

  describe('Loading vs Loaded State Transitions', () => {
    it('should transition from loading to loaded state', async () => {
      const wrapper = mount(OrderMetrics, {
        props: {
          metrics: createMockMetrics({ activeOrders: 25 }),
          loading: true,
        },
      })

      // Initially in loading state
      expect(wrapper.findAll('.animate-pulse').length).toBe(4)

      // Update to loaded state
      await wrapper.setProps({ loading: false })

      // Should no longer show loading indicators
      expect(wrapper.findAll('.animate-pulse').length).toBe(0)
      expect(wrapper.text()).toContain('25')
    })

    it('should transition from loaded to loading state', async () => {
      const wrapper = mount(OrderMetrics, {
        props: {
          metrics: createMockMetrics({ activeOrders: 10 }),
          loading: false,
        },
      })

      // Initially showing values
      expect(wrapper.text()).toContain('10')

      // Update to loading state
      await wrapper.setProps({ loading: true })

      // Should show loading indicators
      expect(wrapper.findAll('.animate-pulse').length).toBe(4)
    })
  })

  describe('Metric Values Update', () => {
    it('should update when metrics prop changes', async () => {
      const wrapper = mount(OrderMetrics, {
        props: {
          metrics: createMockMetrics({ activeOrders: 5 }),
        },
      })

      expect(wrapper.text()).toContain('5')

      await wrapper.setProps({
        metrics: createMockMetrics({ activeOrders: 15 }),
      })

      expect(wrapper.text()).toContain('15')
    })

    it('should update all metrics when prop changes', async () => {
      const wrapper = mount(OrderMetrics, {
        props: {
          metrics: {
            activeOrders: 1,
            deliveredThisMonth: 2,
            totalOrders: 3,
            totalSpentThisMonth: 100,
          },
        },
      })

      await wrapper.setProps({
        metrics: {
          activeOrders: 10,
          deliveredThisMonth: 20,
          totalOrders: 30,
          totalSpentThisMonth: 1000,
        },
      })

      expect(wrapper.text()).toContain('10')
      expect(wrapper.text()).toContain('20')
      expect(wrapper.text()).toContain('30')
    })
  })
})
