import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import ListItem from '~/components/admin/Orders/ListItem.vue'

vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({ t: (k: string) => k })),
}))

// Stub UiCheckbox for testing
const UiCheckboxStub = {
  name: 'UiCheckbox',
  props: ['checked', 'class'],
  emits: ['update:checked'],
  render() {
    return h('input', {
      'type': 'checkbox',
      'checked': this.checked,
      'class': this.class,
      'data-testid': 'checkbox',
      'onChange': (e: Event) => this.$emit('update:checked', (e.target as HTMLInputElement).checked),
    })
  },
}

describe('Admin Orders ListItem', () => {
  // Helper to create wrapper with stubs
  const createWrapper = (props = {}) => {
    return mount(ListItem, {
      props,
      global: {
        stubs: {
          UiCheckbox: UiCheckboxStub,
        },
      },
    })
  }

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
    const wrapper = createWrapper({
      order: mockOrder,
      isSelected: false,
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('should display order number', () => {
    const wrapper = createWrapper({
      order: mockOrder,
      isSelected: false,
    })
    expect(wrapper.text()).toContain('#ORD-12345')
  })

  it('should show customer email', () => {
    const wrapper = createWrapper({
      order: mockOrder,
      isSelected: false,
    })
    expect(wrapper.text()).toContain('customer@example.com')
  })

  it('should display order total', () => {
    const wrapper = createWrapper({
      order: mockOrder,
      isSelected: false,
    })
    expect(wrapper.text()).toContain('€125.50')
  })

  it('should show item count', () => {
    const wrapper = createWrapper({
      order: mockOrder,
      isSelected: false,
    })
    expect(wrapper.text()).toContain('2 items')
  })

  it('should render selection checkbox', () => {
    const wrapper = createWrapper({
      order: mockOrder,
      isSelected: false,
    })
    const checkbox = wrapper.find('input[type="checkbox"]')
    expect(checkbox.exists()).toBe(true)
  })

  it('should emit toggle-selection when checkbox clicked', async () => {
    const wrapper = createWrapper({
      order: mockOrder,
      isSelected: false,
    })
    const checkbox = wrapper.find('input[type="checkbox"]')
    await checkbox.setValue(true)
    expect(wrapper.emitted('toggle-selection')).toBeTruthy()
    expect(wrapper.emitted('toggle-selection')?.[0]).toEqual([1])
  })

  it('should highlight row when selected', () => {
    const wrapper = createWrapper({
      order: mockOrder,
      isSelected: true,
    })
    expect(wrapper.html()).toContain('bg-blue-50')
  })
})
