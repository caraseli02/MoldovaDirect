import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import Filters from '~/components/admin/Orders/Filters.vue'

describe('Admin Orders Filters', () => {
  const mockProps = {
    search: '',
    total: 50,
    loading: false,
  }

  it('should render filters component', () => {
    const wrapper = mount(Filters, {
      props: mockProps,
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('should display search input', () => {
    const wrapper = mount(Filters, {
      props: mockProps,
    })
    const searchInput = wrapper.find('input[type="text"]')
    expect(searchInput.exists()).toBe(true)
  })

  it('should show status filter dropdown', () => {
    const wrapper = mount(Filters, {
      props: mockProps,
    })
    expect(wrapper.text()).toContain('Order Status')
  })

  it('should display total orders count', () => {
    const wrapper = mount(Filters, {
      props: mockProps,
    })
    expect(wrapper.text()).toContain('50')
    expect(wrapper.text()).toContain('orders found')
  })

  it('should show clear all button when filters active', () => {
    const wrapper = mount(Filters, {
      props: {
        ...mockProps,
        search: 'test search',
      },
    })
    expect(wrapper.text()).toContain('Clear all')
  })

  it('should display date range inputs', () => {
    const wrapper = mount(Filters, {
      props: mockProps,
    })
    expect(wrapper.text()).toContain('Start Date')
    expect(wrapper.text()).toContain('End Date')
  })

  it('should show quick date preset buttons', () => {
    const wrapper = mount(Filters, {
      props: mockProps,
    })
    expect(wrapper.text()).toContain('Today')
    expect(wrapper.text()).toContain('Last 7 days')
    expect(wrapper.text()).toContain('Last 30 days')
  })

  // Active filter badge tests - verify status labels
  describe('active filter badges', () => {
    it('should display correct status label "Pending" in active filter badge', () => {
      const wrapper = mount(Filters, {
        props: { ...mockProps, status: ['pending'] },
      })
      expect(wrapper.text()).toContain('Status: Pending')
    })

    it('should display correct status label "Processing" in active filter badge', () => {
      const wrapper = mount(Filters, {
        props: { ...mockProps, status: ['processing'] },
      })
      expect(wrapper.text()).toContain('Status: Processing')
    })

    it('should display correct status label "Shipped" in active filter badge', () => {
      const wrapper = mount(Filters, {
        props: { ...mockProps, status: ['shipped'] },
      })
      expect(wrapper.text()).toContain('Status: Shipped')
    })

    it('should display correct status label "Delivered" in active filter badge', () => {
      const wrapper = mount(Filters, {
        props: { ...mockProps, status: ['delivered'] },
      })
      expect(wrapper.text()).toContain('Status: Delivered')
    })

    it('should display correct status label "Cancelled" in active filter badge', () => {
      const wrapper = mount(Filters, {
        props: { ...mockProps, status: ['cancelled'] },
      })
      expect(wrapper.text()).toContain('Status: Cancelled')
    })

    it('should display correct payment status label "Paid" in active filter badge', () => {
      const wrapper = mount(Filters, {
        props: { ...mockProps, paymentStatus: ['paid'] },
      })
      expect(wrapper.text()).toContain('Payment: Paid')
    })

    it('should display correct payment status label "Failed" in active filter badge', () => {
      const wrapper = mount(Filters, {
        props: { ...mockProps, paymentStatus: ['failed'] },
      })
      expect(wrapper.text()).toContain('Payment: Failed')
    })

    it('should display correct payment status label "Refunded" in active filter badge', () => {
      const wrapper = mount(Filters, {
        props: { ...mockProps, paymentStatus: ['refunded'] },
      })
      expect(wrapper.text()).toContain('Payment: Refunded')
    })

    it('should display date range in active filter badge', () => {
      const wrapper = mount(Filters, {
        props: {
          ...mockProps,
          dateRange: { start: '2025-01-01', end: '2025-01-15' },
        },
      })
      // The formatDateRange function formats as "Jan 1 - Jan 15"
      expect(wrapper.text()).toContain('Jan')
    })
  })

  // Computed property tests
  describe('computed properties', () => {
    it('hasActiveFilters should be true when search is not empty', () => {
      const wrapper = mount(Filters, {
        props: { ...mockProps, search: 'test' },
      })
      // The "Clear all" button only shows when hasActiveFilters is true
      expect(wrapper.text()).toContain('Clear all')
    })

    it('hasActiveFilters should be true when status is set', () => {
      const wrapper = mount(Filters, {
        props: { ...mockProps, status: ['pending'] },
      })
      expect(wrapper.text()).toContain('Clear all')
    })

    it('hasActiveFilters should be true when paymentStatus is set', () => {
      const wrapper = mount(Filters, {
        props: { ...mockProps, paymentStatus: ['paid'] },
      })
      expect(wrapper.text()).toContain('Clear all')
    })

    it('hasActiveFilters should be true when dateRange is set', () => {
      const wrapper = mount(Filters, {
        props: {
          ...mockProps,
          dateRange: { start: '2025-01-01', end: '2025-01-15' },
        },
      })
      expect(wrapper.text()).toContain('Clear all')
      expect(wrapper.text()).toContain('Clear dates')
    })

    it('hasActiveFilters should be false when no filters are active', () => {
      const wrapper = mount(Filters, {
        props: mockProps,
      })
      expect(wrapper.text()).not.toContain('Clear all')
    })
  })

  // Event emission tests with payload validation
  describe('event emissions with payloads', () => {
    it('should emit update-search with correct value after debounce', async () => {
      vi.useFakeTimers()
      const wrapper = mount(Filters, {
        props: mockProps,
      })
      const searchInput = wrapper.find('input[type="text"]')
      await searchInput.setValue('test search')
      vi.advanceTimersByTime(300) // Wait for debounce
      await flushPromises()
      const emitted = wrapper.emitted('update-search')
      expect(emitted).toBeTruthy()
      expect(emitted![0]).toEqual(['test search'])
      vi.useRealTimers()
    })

    it('should emit clear-filters when clear all button clicked', async () => {
      const wrapper = mount(Filters, {
        props: { ...mockProps, search: 'test' },
      })
      const clearAllButton = wrapper.findAll('button').find(b => b.text().includes('Clear all'))
      expect(clearAllButton).toBeDefined()
      await clearAllButton!.trigger('click')
      const emitted = wrapper.emitted('clear-filters')
      expect(emitted).toBeTruthy()
      expect(emitted!.length).toBe(1)
    })

    it('should emit update-status with undefined when status filter cleared', async () => {
      const wrapper = mount(Filters, {
        props: { ...mockProps, status: ['pending'] },
      })
      // Find the clear button within the status badge
      const badges = wrapper.findAll('.gap-1')
      const statusBadge = badges.find(b => b.text().includes('Status:'))
      expect(statusBadge).toBeDefined()
      const clearButton = statusBadge!.find('button')
      await clearButton.trigger('click')
      const emitted = wrapper.emitted('update-status')
      expect(emitted).toBeTruthy()
      expect(emitted![0]).toEqual([undefined])
    })

    it('should emit update-payment-status with undefined when payment filter cleared', async () => {
      const wrapper = mount(Filters, {
        props: { ...mockProps, paymentStatus: ['paid'] },
      })
      // Find the clear button within the payment status badge
      const badges = wrapper.findAll('.gap-1')
      const paymentBadge = badges.find(b => b.text().includes('Payment:'))
      expect(paymentBadge).toBeDefined()
      const clearButton = paymentBadge!.find('button')
      await clearButton.trigger('click')
      const emitted = wrapper.emitted('update-payment-status')
      expect(emitted).toBeTruthy()
      expect(emitted![0]).toEqual([undefined])
    })

    it('should emit update-date-range with undefined when date range cleared', async () => {
      const wrapper = mount(Filters, {
        props: {
          ...mockProps,
          dateRange: { start: '2025-01-01', end: '2025-01-15' },
        },
      })
      const clearDatesButton = wrapper.findAll('button').find(b => b.text().includes('Clear dates'))
      expect(clearDatesButton).toBeDefined()
      await clearDatesButton!.trigger('click')
      const emitted = wrapper.emitted('update-date-range')
      expect(emitted).toBeTruthy()
      expect(emitted![0]).toEqual([undefined, undefined])
    })

    it('should emit update-search with empty string when search cleared', async () => {
      const wrapper = mount(Filters, {
        props: { ...mockProps, search: 'existing search' },
      })
      // Find the clear button in the search input
      const clearSearchButton = wrapper.find('.absolute.inset-y-0.right-0 button')
      expect(clearSearchButton.exists()).toBe(true)
      await clearSearchButton.trigger('click')
      const emitted = wrapper.emitted('update-search')
      expect(emitted).toBeTruthy()
      expect(emitted![0]).toEqual([''])
    })
  })

  // Order count display tests
  describe('order count display', () => {
    it('should display singular "order" when total is 1', () => {
      const wrapper = mount(Filters, {
        props: { ...mockProps, total: 1 },
      })
      expect(wrapper.text()).toContain('1')
      expect(wrapper.text()).toContain('order found')
      expect(wrapper.text()).not.toContain('orders found')
    })

    it('should display plural "orders" when total is greater than 1', () => {
      const wrapper = mount(Filters, {
        props: { ...mockProps, total: 50 },
      })
      expect(wrapper.text()).toContain('50')
      expect(wrapper.text()).toContain('orders found')
    })

    it('should display plural "orders" when total is 0', () => {
      const wrapper = mount(Filters, {
        props: { ...mockProps, total: 0 },
      })
      expect(wrapper.text()).toContain('0')
      expect(wrapper.text()).toContain('orders found')
    })
  })
})
