import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import OrderCardEnhanced from '~/components/order/OrderCardEnhanced.vue'

vi.mock('#imports', () => ({ useI18n: vi.fn(() => ({ t: (k: string) => k, locale: { value: 'en' } })) }))

describe('OrderCardEnhanced - Enhanced', () => {
  // Mock order matching the OrderWithItems interface
  const mockOrder = {
    id: 1,
    orderNumber: 'ORD-001',
    status: 'processing' as const,
    paymentMethod: 'stripe' as const,
    paymentStatus: 'paid' as const,
    subtotalEur: 100,
    shippingCostEur: 15.99,
    taxEur: 10,
    totalEur: 125.99,
    shippingAddress: {
      fullName: 'John Doe',
      street: '123 Main St',
      city: 'Madrid',
      state: 'Madrid',
      postalCode: '28001',
      country: 'ES',
    },
    billingAddress: {
      fullName: 'John Doe',
      street: '123 Main St',
      city: 'Madrid',
      state: 'Madrid',
      postalCode: '28001',
      country: 'ES',
    },
    createdAt: '2026-01-02T10:00:00Z',
    updatedAt: '2026-01-02T10:00:00Z',
    items: [
      { id: 1, orderId: 1, productId: 1, productSnapshot: { nameTranslations: { en: 'Product 1' } }, quantity: 2, priceEur: 50, totalEur: 100 },
      { id: 2, orderId: 1, productId: 2, productSnapshot: { nameTranslations: { en: 'Product 2' } }, quantity: 1, priceEur: 25.99, totalEur: 25.99 },
    ],
  }

  const globalStubs = {
    OrderStatus: { template: '<span class="order-status">{{ status }}</span>', props: ['status'] },
    Button: { template: '<button @click="$emit(\'click\')"><slot /></button>' },
  }

  it('should render order card', () => {
    const wrapper = mount(OrderCardEnhanced, {
      props: { order: mockOrder },
      global: { stubs: globalStubs },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('should display order ID', () => {
    const wrapper = mount(OrderCardEnhanced, {
      props: { order: mockOrder },
      global: { stubs: globalStubs },
    })
    expect(wrapper.text()).toContain('ORD-001')
  })

  it('should show order status badge', () => {
    const wrapper = mount(OrderCardEnhanced, {
      props: { order: mockOrder },
      global: { stubs: globalStubs },
    })
    expect(wrapper.text()).toContain('processing')
  })

  it('should display order total', () => {
    const wrapper = mount(OrderCardEnhanced, {
      props: { order: mockOrder },
      global: { stubs: globalStubs },
    })
    // Check for formatted price - Intl.NumberFormat formats as €125.99
    expect(wrapper.text()).toMatch(/125[.,]99/)
  })

  it('should show total item count', () => {
    const wrapper = mount(OrderCardEnhanced, {
      props: { order: mockOrder },
      global: { stubs: globalStubs },
    })
    // Total items: 2 + 1 = 3
    expect(wrapper.text()).toContain('3')
  })

  it('should emit click event when card is clicked', async () => {
    const wrapper = mount(OrderCardEnhanced, {
      props: { order: mockOrder },
      global: { stubs: globalStubs },
    })
    // The card is the article element with role="button"
    const card = wrapper.find('article')
    await card.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
    expect(wrapper.emitted('click')![0]).toEqual([mockOrder])
  })
})
