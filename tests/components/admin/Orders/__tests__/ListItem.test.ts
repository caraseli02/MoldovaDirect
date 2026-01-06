import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ListItem from '~/components/admin/Orders/ListItem.vue'

vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({ t: (k: string) => k })),
}))

describe('Admin Orders ListItem', () => {
  const mockOrder = {
    id: 1,
    order_number: 'ORD-12345',
    created_at: '2026-01-01T10:00:00Z',
    total_eur: 125.50,
    status: 'processing' as const,
    payment_status: 'paid',
    guest_email: 'customer@example.com',
    order_items: [{ id: 1 }, { id: 2 }],
  }

  it('should render order list item', () => {
    const wrapper = mount(ListItem, {
      props: {
        order: mockOrder,
        isSelected: false,
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('should display order number', () => {
    const wrapper = mount(ListItem, {
      props: {
        order: mockOrder,
        isSelected: false,
      },
    })
    expect(wrapper.text()).toContain('#ORD-12345')
  })

  it('should show customer email', () => {
    const wrapper = mount(ListItem, {
      props: {
        order: mockOrder,
        isSelected: false,
      },
    })
    expect(wrapper.text()).toContain('customer@example.com')
  })

  it('should display order total', () => {
    const wrapper = mount(ListItem, {
      props: {
        order: mockOrder,
        isSelected: false,
      },
    })
    expect(wrapper.text()).toContain('€125.50')
  })

  it('should show item count', () => {
    const wrapper = mount(ListItem, {
      props: {
        order: mockOrder,
        isSelected: false,
      },
    })
    expect(wrapper.text()).toContain('2 items')
  })

  it('should render selection checkbox', () => {
    const wrapper = mount(ListItem, {
      props: {
        order: mockOrder,
        isSelected: false,
      },
    })
    const checkbox = wrapper.find('input[type="checkbox"]')
    expect(checkbox.exists()).toBe(true)
  })

  it('should emit toggle-selection when checkbox clicked', async () => {
    const wrapper = mount(ListItem, {
      props: {
        order: mockOrder,
        isSelected: false,
      },
    })
    const checkbox = wrapper.find('input[type="checkbox"]')
    await checkbox.trigger('change')
    expect(wrapper.emitted('toggle-selection')).toBeTruthy()
    expect(wrapper.emitted('toggle-selection')?.[0]).toEqual([1])
  })

  it('should highlight row when selected', () => {
    const wrapper = mount(ListItem, {
      props: {
        order: mockOrder,
        isSelected: true,
      },
    })
    expect(wrapper.html()).toContain('bg-blue-50')
  })
})
