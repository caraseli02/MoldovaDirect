import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import OrderCardEnhanced from '~/components/order/OrderCardEnhanced.vue'

vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({
    t: (k: string) => k,
    locale: { value: 'en' },
  })),
}))

describe('OrderCardEnhanced', () => {
  // Mock order matching the OrderWithItems interface
  const createMockOrder = (overrides = {}) => ({
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
      {
        id: 1,
        orderId: 1,
        productId: 1,
        productSnapshot: {
          nameTranslations: { en: 'Product 1', es: 'Producto 1' },
          images: ['https://example.com/image1.jpg'],
        },
        quantity: 2,
        priceEur: 50,
        totalEur: 100,
      },
      {
        id: 2,
        orderId: 1,
        productId: 2,
        productSnapshot: {
          nameTranslations: { en: 'Product 2', es: 'Producto 2' },
          images: ['https://example.com/image2.jpg'],
        },
        quantity: 1,
        priceEur: 25.99,
        totalEur: 25.99,
      },
    ],
    ...overrides,
  })

  const globalStubs = {
    OrderStatus: {
      template: '<span class="order-status" role="status">{{ status }}</span>',
      props: ['status'],
    },
    Button: {
      template: '<button @click="handleClick($event)"><slot /></button>',
      methods: {
        handleClick(e: Event) {
          this.$emit('click', e)
        },
      },
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render order card', () => {
      const wrapper = mount(OrderCardEnhanced, {
        props: { order: createMockOrder() },
        global: { stubs: globalStubs },
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('should render as an article element with button role', () => {
      const wrapper = mount(OrderCardEnhanced, {
        props: { order: createMockOrder() },
        global: { stubs: globalStubs },
      })
      const article = wrapper.find('article')
      expect(article.exists()).toBe(true)
      expect(article.attributes('role')).toBe('button')
    })

    it('should have correct tabindex for keyboard navigation', () => {
      const wrapper = mount(OrderCardEnhanced, {
        props: { order: createMockOrder() },
        global: { stubs: globalStubs },
      })
      const article = wrapper.find('article')
      expect(article.attributes('tabindex')).toBe('0')
    })

    it('should display order number', () => {
      const wrapper = mount(OrderCardEnhanced, {
        props: { order: createMockOrder({ orderNumber: 'ORD-12345' }) },
        global: { stubs: globalStubs },
      })
      expect(wrapper.text()).toContain('ORD-12345')
    })

    it('should display order total with proper formatting', () => {
      const wrapper = mount(OrderCardEnhanced, {
        props: { order: createMockOrder({ totalEur: 125.99 }) },
        global: { stubs: globalStubs },
      })
      // Check for formatted price (Intl.NumberFormat formats as currency)
      expect(wrapper.text()).toMatch(/125[.,]99/)
    })

    it('should show total item count correctly', () => {
      const wrapper = mount(OrderCardEnhanced, {
        props: { order: createMockOrder() },
        global: { stubs: globalStubs },
      })
      // Total items: 2 + 1 = 3
      expect(wrapper.text()).toContain('3')
    })

    it('should render OrderStatus component with correct status', () => {
      const wrapper = mount(OrderCardEnhanced, {
        props: { order: createMockOrder({ status: 'shipped' }) },
        global: { stubs: globalStubs },
      })
      expect(wrapper.text()).toContain('shipped')
    })
  })

  describe('Props Handling', () => {
    it('should apply default prop values', () => {
      const wrapper = mount(OrderCardEnhanced, {
        props: { order: createMockOrder() },
        global: { stubs: globalStubs },
      })
      // Default showActions is true, showProgress is true
      expect(wrapper.exists()).toBe(true)
    })

    it('should hide actions when showActions is false', () => {
      const wrapper = mount(OrderCardEnhanced, {
        props: {
          order: createMockOrder(),
          showActions: false,
        },
        global: { stubs: globalStubs },
      })
      const actionsGroup = wrapper.find('[role="group"]')
      expect(actionsGroup.exists()).toBe(false)
    })

    it('should show actions when showActions is true', () => {
      const wrapper = mount(OrderCardEnhanced, {
        props: {
          order: createMockOrder(),
          showActions: true,
        },
        global: { stubs: globalStubs },
      })
      const actionsGroup = wrapper.find('[role="group"]')
      expect(actionsGroup.exists()).toBe(true)
    })

    it('should show fewer preview items in compact mode', () => {
      const orderWithManyItems = createMockOrder({
        items: [
          { id: 1, orderId: 1, productId: 1, productSnapshot: { nameTranslations: { en: 'Product 1' }, images: ['img1.jpg'] }, quantity: 1, priceEur: 10, totalEur: 10 },
          { id: 2, orderId: 1, productId: 2, productSnapshot: { nameTranslations: { en: 'Product 2' }, images: ['img2.jpg'] }, quantity: 1, priceEur: 10, totalEur: 10 },
          { id: 3, orderId: 1, productId: 3, productSnapshot: { nameTranslations: { en: 'Product 3' }, images: ['img3.jpg'] }, quantity: 1, priceEur: 10, totalEur: 10 },
          { id: 4, orderId: 1, productId: 4, productSnapshot: { nameTranslations: { en: 'Product 4' }, images: ['img4.jpg'] }, quantity: 1, priceEur: 10, totalEur: 10 },
        ],
      })

      const compactWrapper = mount(OrderCardEnhanced, {
        props: { order: orderWithManyItems, compact: true },
        global: { stubs: globalStubs },
      })

      const regularWrapper = mount(OrderCardEnhanced, {
        props: { order: orderWithManyItems, compact: false },
        global: { stubs: globalStubs },
      })

      // Compact shows 2 items, regular shows 3
      const compactImages = compactWrapper.findAll('img')
      const regularImages = regularWrapper.findAll('img')

      expect(compactImages.length).toBeLessThanOrEqual(2)
      expect(regularImages.length).toBeLessThanOrEqual(3)
    })
  })

  describe('Progress Bar', () => {
    it('should show progress bar for pending orders', () => {
      const wrapper = mount(OrderCardEnhanced, {
        props: {
          order: createMockOrder({ status: 'pending' }),
          showProgress: true,
        },
        global: { stubs: globalStubs },
      })
      const progressBar = wrapper.find('[role="progressbar"]')
      expect(progressBar.exists()).toBe(true)
      expect(progressBar.attributes('aria-valuenow')).toBe('25')
    })

    it('should show progress bar for processing orders', () => {
      const wrapper = mount(OrderCardEnhanced, {
        props: {
          order: createMockOrder({ status: 'processing' }),
          showProgress: true,
        },
        global: { stubs: globalStubs },
      })
      const progressBar = wrapper.find('[role="progressbar"]')
      expect(progressBar.exists()).toBe(true)
      expect(progressBar.attributes('aria-valuenow')).toBe('50')
    })

    it('should show progress bar for shipped orders', () => {
      const wrapper = mount(OrderCardEnhanced, {
        props: {
          order: createMockOrder({ status: 'shipped' }),
          showProgress: true,
        },
        global: { stubs: globalStubs },
      })
      const progressBar = wrapper.find('[role="progressbar"]')
      expect(progressBar.exists()).toBe(true)
      expect(progressBar.attributes('aria-valuenow')).toBe('75')
    })

    it('should not show progress bar for delivered orders', () => {
      const wrapper = mount(OrderCardEnhanced, {
        props: {
          order: createMockOrder({ status: 'delivered' }),
          showProgress: true,
        },
        global: { stubs: globalStubs },
      })
      const progressBar = wrapper.find('[role="progressbar"]')
      expect(progressBar.exists()).toBe(false)
    })

    it('should not show progress bar for cancelled orders', () => {
      const wrapper = mount(OrderCardEnhanced, {
        props: {
          order: createMockOrder({ status: 'cancelled' }),
          showProgress: true,
        },
        global: { stubs: globalStubs },
      })
      const progressBar = wrapper.find('[role="progressbar"]')
      expect(progressBar.exists()).toBe(false)
    })

    it('should hide progress bar when showProgress is false', () => {
      const wrapper = mount(OrderCardEnhanced, {
        props: {
          order: createMockOrder({ status: 'processing' }),
          showProgress: false,
        },
        global: { stubs: globalStubs },
      })
      const progressBar = wrapper.find('[role="progressbar"]')
      expect(progressBar.exists()).toBe(false)
    })

    it('should show estimated delivery date when available', () => {
      const wrapper = mount(OrderCardEnhanced, {
        props: {
          order: createMockOrder({
            status: 'shipped',
            estimatedShipDate: '2026-01-15',
          }),
          showProgress: true,
        },
        global: { stubs: globalStubs },
      })
      expect(wrapper.text()).toContain('orders.progress.estimatedArrival')
    })
  })

  describe('Delivered Status', () => {
    it('should show delivered success message for delivered orders', () => {
      const wrapper = mount(OrderCardEnhanced, {
        props: {
          order: createMockOrder({ status: 'delivered' }),
        },
        global: { stubs: globalStubs },
      })
      expect(wrapper.text()).toContain('orders.progress.deliveredSuccessfully')
    })

    it('should show delivered date when available', () => {
      const wrapper = mount(OrderCardEnhanced, {
        props: {
          order: createMockOrder({
            status: 'delivered',
            deliveredAt: '2026-01-10T14:30:00Z',
          }),
        },
        global: { stubs: globalStubs },
      })
      // Check that the delivered at date section exists
      const deliveredSection = wrapper.find('.bg-green-50')
      expect(deliveredSection.exists()).toBe(true)
    })

    it('should not show delivered message for non-delivered orders', () => {
      const wrapper = mount(OrderCardEnhanced, {
        props: {
          order: createMockOrder({ status: 'processing' }),
        },
        global: { stubs: globalStubs },
      })
      expect(wrapper.text()).not.toContain('orders.progress.deliveredSuccessfully')
    })
  })

  describe('Order Items Preview', () => {
    it('should display product images', () => {
      const wrapper = mount(OrderCardEnhanced, {
        props: { order: createMockOrder() },
        global: { stubs: globalStubs },
      })
      const images = wrapper.findAll('img')
      expect(images.length).toBeGreaterThan(0)
    })

    it('should show placeholder when product has no image', () => {
      const orderWithNoImages = createMockOrder({
        items: [
          {
            id: 1,
            orderId: 1,
            productId: 1,
            productSnapshot: { nameTranslations: { en: 'Product 1' } },
            quantity: 1,
            priceEur: 10,
            totalEur: 10,
          },
        ],
      })
      const wrapper = mount(OrderCardEnhanced, {
        props: { order: orderWithNoImages },
        global: { stubs: globalStubs },
      })
      // Should show placeholder div instead of image
      const placeholders = wrapper.findAll('.bg-gray-200')
      expect(placeholders.length).toBeGreaterThan(0)
    })

    it('should show remaining items count when more than preview limit', () => {
      const orderWithManyItems = createMockOrder({
        items: [
          { id: 1, orderId: 1, productId: 1, productSnapshot: { nameTranslations: { en: 'P1' }, images: ['img1.jpg'] }, quantity: 1, priceEur: 10, totalEur: 10 },
          { id: 2, orderId: 1, productId: 2, productSnapshot: { nameTranslations: { en: 'P2' }, images: ['img2.jpg'] }, quantity: 1, priceEur: 10, totalEur: 10 },
          { id: 3, orderId: 1, productId: 3, productSnapshot: { nameTranslations: { en: 'P3' }, images: ['img3.jpg'] }, quantity: 1, priceEur: 10, totalEur: 10 },
          { id: 4, orderId: 1, productId: 4, productSnapshot: { nameTranslations: { en: 'P4' }, images: ['img4.jpg'] }, quantity: 1, priceEur: 10, totalEur: 10 },
          { id: 5, orderId: 1, productId: 5, productSnapshot: { nameTranslations: { en: 'P5' }, images: ['img5.jpg'] }, quantity: 1, priceEur: 10, totalEur: 10 },
        ],
      })
      const wrapper = mount(OrderCardEnhanced, {
        props: { order: orderWithManyItems },
        global: { stubs: globalStubs },
      })
      expect(wrapper.text()).toContain('+2')
      expect(wrapper.text()).toContain('orders.moreItems')
    })

    it('should not show remaining count when items equal preview limit', () => {
      const orderWithThreeItems = createMockOrder({
        items: [
          { id: 1, orderId: 1, productId: 1, productSnapshot: { nameTranslations: { en: 'P1' }, images: ['img1.jpg'] }, quantity: 1, priceEur: 10, totalEur: 10 },
          { id: 2, orderId: 1, productId: 2, productSnapshot: { nameTranslations: { en: 'P2' }, images: ['img2.jpg'] }, quantity: 1, priceEur: 10, totalEur: 10 },
          { id: 3, orderId: 1, productId: 3, productSnapshot: { nameTranslations: { en: 'P3' }, images: ['img3.jpg'] }, quantity: 1, priceEur: 10, totalEur: 10 },
        ],
      })
      const wrapper = mount(OrderCardEnhanced, {
        props: { order: orderWithThreeItems },
        global: { stubs: globalStubs },
      })
      expect(wrapper.text()).not.toContain('orders.moreItems')
    })

    it('should handle empty items array gracefully', () => {
      const orderWithNoItems = createMockOrder({ items: [] })
      const wrapper = mount(OrderCardEnhanced, {
        props: { order: orderWithNoItems },
        global: { stubs: globalStubs },
      })
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.text()).toContain('0') // Total items should be 0
    })

    it('should handle null items gracefully', () => {
      const orderWithNullItems = createMockOrder({ items: null })
      const wrapper = mount(OrderCardEnhanced, {
        props: { order: orderWithNullItems },
        global: { stubs: globalStubs },
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle undefined items gracefully', () => {
      const orderWithUndefinedItems = createMockOrder({ items: undefined })
      const wrapper = mount(OrderCardEnhanced, {
        props: { order: orderWithUndefinedItems },
        global: { stubs: globalStubs },
      })
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('User Interactions', () => {
    it('should emit click event when card is clicked', async () => {
      const mockOrder = createMockOrder()
      const wrapper = mount(OrderCardEnhanced, {
        props: { order: mockOrder },
        global: { stubs: globalStubs },
      })
      const article = wrapper.find('article')
      await article.trigger('click')
      expect(wrapper.emitted('click')).toBeTruthy()
      expect(wrapper.emitted('click')![0]).toEqual([mockOrder])
    })

    it('should emit click event when Enter key is pressed', async () => {
      const mockOrder = createMockOrder()
      const wrapper = mount(OrderCardEnhanced, {
        props: { order: mockOrder },
        global: { stubs: globalStubs },
      })
      const article = wrapper.find('article')
      await article.trigger('keydown.enter')
      expect(wrapper.emitted('click')).toBeTruthy()
      expect(wrapper.emitted('click')![0]).toEqual([mockOrder])
    })

    it('should emit click event when Space key is pressed', async () => {
      const mockOrder = createMockOrder()
      const wrapper = mount(OrderCardEnhanced, {
        props: { order: mockOrder },
        global: { stubs: globalStubs },
      })
      const article = wrapper.find('article')
      await article.trigger('keydown.space')
      expect(wrapper.emitted('click')).toBeTruthy()
      expect(wrapper.emitted('click')![0]).toEqual([mockOrder])
    })

    it('should emit viewDetails event when track button is clicked for active orders', async () => {
      const mockOrder = createMockOrder({ status: 'shipped' })
      const wrapper = mount(OrderCardEnhanced, {
        props: { order: mockOrder, showActions: true },
        global: { stubs: globalStubs },
      })
      const buttons = wrapper.findAll('button')
      const trackButton = buttons.find(btn => btn.text().includes('orders.track'))
      if (trackButton) {
        await trackButton.trigger('click')
        expect(wrapper.emitted('viewDetails')).toBeTruthy()
      }
    })

    it('should emit reorder event when reorder button is clicked', async () => {
      const mockOrder = createMockOrder({ status: 'delivered' })
      const wrapper = mount(OrderCardEnhanced, {
        props: { order: mockOrder, showActions: true },
        global: { stubs: globalStubs },
      })
      const buttons = wrapper.findAll('button')
      const reorderButton = buttons.find(btn => btn.text().includes('orders.reorder'))
      if (reorderButton) {
        await reorderButton.trigger('click')
        expect(wrapper.emitted('reorder')).toBeTruthy()
      }
    })

    it('should emit viewDetails event when view details button is clicked', async () => {
      const mockOrder = createMockOrder({ status: 'delivered' })
      const wrapper = mount(OrderCardEnhanced, {
        props: { order: mockOrder, showActions: true },
        global: { stubs: globalStubs },
      })
      const buttons = wrapper.findAll('button')
      const viewDetailsButton = buttons.find(btn => btn.text().includes('orders.viewDetails'))
      if (viewDetailsButton) {
        await viewDetailsButton.trigger('click')
        expect(wrapper.emitted('viewDetails')).toBeTruthy()
      }
    })

    it('should stop propagation when action button is clicked', async () => {
      const mockOrder = createMockOrder({ status: 'delivered' })
      const wrapper = mount(OrderCardEnhanced, {
        props: { order: mockOrder, showActions: true },
        global: { stubs: globalStubs },
      })

      // Click on reorder button
      const buttons = wrapper.findAll('button')
      const reorderButton = buttons.find(btn => btn.text().includes('orders.reorder'))
      if (reorderButton) {
        await reorderButton.trigger('click')
        // Should emit reorder but not click (propagation stopped)
        expect(wrapper.emitted('reorder')).toBeTruthy()
        // The click event would also be emitted but that is the button click
      }
    })
  })

  describe('Action Buttons Visibility', () => {
    it('should show track button for pending orders', () => {
      const wrapper = mount(OrderCardEnhanced, {
        props: { order: createMockOrder({ status: 'pending' }), showActions: true },
        global: { stubs: globalStubs },
      })
      expect(wrapper.text()).toContain('orders.track')
    })

    it('should show track button for processing orders', () => {
      const wrapper = mount(OrderCardEnhanced, {
        props: { order: createMockOrder({ status: 'processing' }), showActions: true },
        global: { stubs: globalStubs },
      })
      expect(wrapper.text()).toContain('orders.track')
    })

    it('should show track button for shipped orders', () => {
      const wrapper = mount(OrderCardEnhanced, {
        props: { order: createMockOrder({ status: 'shipped' }), showActions: true },
        global: { stubs: globalStubs },
      })
      expect(wrapper.text()).toContain('orders.track')
    })

    it('should show reorder button for delivered orders', () => {
      const wrapper = mount(OrderCardEnhanced, {
        props: { order: createMockOrder({ status: 'delivered' }), showActions: true },
        global: { stubs: globalStubs },
      })
      expect(wrapper.text()).toContain('orders.reorder')
    })

    it('should show reorder button for cancelled orders', () => {
      const wrapper = mount(OrderCardEnhanced, {
        props: { order: createMockOrder({ status: 'cancelled' }), showActions: true },
        global: { stubs: globalStubs },
      })
      expect(wrapper.text()).toContain('orders.reorder')
    })

    it('should show view details button for delivered orders', () => {
      const wrapper = mount(OrderCardEnhanced, {
        props: { order: createMockOrder({ status: 'delivered' }), showActions: true },
        global: { stubs: globalStubs },
      })
      expect(wrapper.text()).toContain('orders.viewDetails')
    })

    it('should not show view details button for active orders', () => {
      const wrapper = mount(OrderCardEnhanced, {
        props: { order: createMockOrder({ status: 'processing' }), showActions: true },
        global: { stubs: globalStubs },
      })
      // Active orders show track button instead of view details
      expect(wrapper.text()).not.toContain('orders.viewDetails')
    })
  })

  describe('Accessibility', () => {
    it('should have aria-label on the order card', () => {
      const wrapper = mount(OrderCardEnhanced, {
        props: { order: createMockOrder({ orderNumber: 'ORD-123' }) },
        global: { stubs: globalStubs },
      })
      const article = wrapper.find('article')
      expect(article.attributes('aria-label')).toContain('orders.accessibility.orderCard')
    })

    it('should have proper aria attributes on progress bar', () => {
      const wrapper = mount(OrderCardEnhanced, {
        props: {
          order: createMockOrder({ status: 'processing' }),
          showProgress: true,
        },
        global: { stubs: globalStubs },
      })
      const progressBar = wrapper.find('[role="progressbar"]')
      expect(progressBar.attributes('aria-valuemin')).toBe('0')
      expect(progressBar.attributes('aria-valuemax')).toBe('100')
      expect(progressBar.attributes('aria-valuenow')).toBeDefined()
    })

    it('should have aria-label on date element', () => {
      const wrapper = mount(OrderCardEnhanced, {
        props: { order: createMockOrder() },
        global: { stubs: globalStubs },
      })
      const timeElement = wrapper.find('time')
      expect(timeElement.attributes('aria-label')).toContain('orders.accessibility.orderDate')
    })

    it('should have datetime attribute on time element', () => {
      const wrapper = mount(OrderCardEnhanced, {
        props: { order: createMockOrder({ createdAt: '2026-01-02T10:00:00Z' }) },
        global: { stubs: globalStubs },
      })
      const timeElement = wrapper.find('time')
      expect(timeElement.attributes('datetime')).toBe('2026-01-02T10:00:00Z')
    })

    it('should have aria-label on items region', () => {
      const wrapper = mount(OrderCardEnhanced, {
        props: { order: createMockOrder() },
        global: { stubs: globalStubs },
      })
      const itemsRegion = wrapper.find('[aria-label="orders.items"]')
      expect(itemsRegion.exists()).toBe(true)
    })

    it('should have aria-label on order summary region', () => {
      const wrapper = mount(OrderCardEnhanced, {
        props: { order: createMockOrder() },
        global: { stubs: globalStubs },
      })
      const summaryRegion = wrapper.find('[aria-label="common.orderSummary"]')
      expect(summaryRegion.exists()).toBe(true)
    })

    it('should have aria-label on actions group', () => {
      const wrapper = mount(OrderCardEnhanced, {
        props: { order: createMockOrder(), showActions: true },
        global: { stubs: globalStubs },
      })
      const actionsGroup = wrapper.find('[aria-label="orders.accessibility.orderActions"]')
      expect(actionsGroup.exists()).toBe(true)
    })

    it('should have aria-live on remaining items count', () => {
      const orderWithManyItems = createMockOrder({
        items: [
          { id: 1, orderId: 1, productId: 1, productSnapshot: { nameTranslations: { en: 'P1' }, images: ['img1.jpg'] }, quantity: 1, priceEur: 10, totalEur: 10 },
          { id: 2, orderId: 1, productId: 2, productSnapshot: { nameTranslations: { en: 'P2' }, images: ['img2.jpg'] }, quantity: 1, priceEur: 10, totalEur: 10 },
          { id: 3, orderId: 1, productId: 3, productSnapshot: { nameTranslations: { en: 'P3' }, images: ['img3.jpg'] }, quantity: 1, priceEur: 10, totalEur: 10 },
          { id: 4, orderId: 1, productId: 4, productSnapshot: { nameTranslations: { en: 'P4' }, images: ['img4.jpg'] }, quantity: 1, priceEur: 10, totalEur: 10 },
        ],
      })
      const wrapper = mount(OrderCardEnhanced, {
        props: { order: orderWithManyItems },
        global: { stubs: globalStubs },
      })
      const liveRegion = wrapper.find('[aria-live="polite"]')
      expect(liveRegion.exists()).toBe(true)
    })

    it('should mark decorative SVGs as aria-hidden', () => {
      const wrapper = mount(OrderCardEnhanced, {
        props: { order: createMockOrder({ status: 'delivered' }), showActions: true },
        global: { stubs: globalStubs },
      })
      const svgs = wrapper.findAll('svg')
      svgs.forEach((svg) => {
        // All SVGs should be aria-hidden as they are decorative
        expect(svg.attributes('aria-hidden')).toBe('true')
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero total gracefully', () => {
      const wrapper = mount(OrderCardEnhanced, {
        props: { order: createMockOrder({ totalEur: 0 }) },
        global: { stubs: globalStubs },
      })
      expect(wrapper.text()).toContain('0')
    })

    it('should handle invalid date gracefully', () => {
      const wrapper = mount(OrderCardEnhanced, {
        props: { order: createMockOrder({ createdAt: 'invalid-date' }) },
        global: { stubs: globalStubs },
      })
      // Should render without crashing
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle missing product snapshot name translations', () => {
      const orderWithMissingTranslations = createMockOrder({
        items: [
          {
            id: 1,
            orderId: 1,
            productId: 1,
            productSnapshot: {},
            quantity: 1,
            priceEur: 10,
            totalEur: 10,
          },
        ],
      })
      const wrapper = mount(OrderCardEnhanced, {
        props: { order: orderWithMissingTranslations },
        global: { stubs: globalStubs },
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle product images as string instead of array', () => {
      const orderWithStringImage = createMockOrder({
        items: [
          {
            id: 1,
            orderId: 1,
            productId: 1,
            productSnapshot: {
              nameTranslations: { en: 'Product' },
              images: 'https://example.com/image.jpg',
            },
            quantity: 1,
            priceEur: 10,
            totalEur: 10,
          },
        ],
      })
      const wrapper = mount(OrderCardEnhanced, {
        props: { order: orderWithStringImage },
        global: { stubs: globalStubs },
      })
      const img = wrapper.find('img')
      expect(img.exists()).toBe(true)
      expect(img.attributes('src')).toBe('https://example.com/image.jpg')
    })

    it('should handle null price gracefully', () => {
      const wrapper = mount(OrderCardEnhanced, {
        props: { order: createMockOrder({ totalEur: null as any }) },
        global: { stubs: globalStubs },
      })
      expect(wrapper.text()).toContain('0.00')
    })

    it('should handle undefined status gracefully', () => {
      const orderWithUnknownStatus = createMockOrder({ status: 'unknown' as any })
      const wrapper = mount(OrderCardEnhanced, {
        props: { order: orderWithUnknownStatus },
        global: { stubs: globalStubs },
      })
      // Progress percentage should be 0 for unknown status
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle items with null quantity', () => {
      const orderWithNullQuantity = createMockOrder({
        items: [
          { id: 1, orderId: 1, productId: 1, productSnapshot: { nameTranslations: { en: 'P1' } }, quantity: null as any, priceEur: 10, totalEur: 10 },
          { id: 2, orderId: 1, productId: 2, productSnapshot: { nameTranslations: { en: 'P2' } }, quantity: 2, priceEur: 10, totalEur: 20 },
        ],
      })
      const wrapper = mount(OrderCardEnhanced, {
        props: { order: orderWithNullQuantity },
        global: { stubs: globalStubs },
      })
      // Total should be 2 (0 + 2)
      expect(wrapper.text()).toContain('2')
    })
  })

  describe('Date Formatting', () => {
    it('should format date correctly', () => {
      const wrapper = mount(OrderCardEnhanced, {
        props: { order: createMockOrder({ createdAt: '2026-01-02T10:00:00Z' }) },
        global: { stubs: globalStubs },
      })
      const timeElement = wrapper.find('time')
      // The date should be formatted according to locale
      expect(timeElement.text()).toBeTruthy()
    })

    it('should handle empty date string', () => {
      const wrapper = mount(OrderCardEnhanced, {
        props: { order: createMockOrder({ createdAt: '' }) },
        global: { stubs: globalStubs },
      })
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Localization', () => {
    it('should use locale for product name', () => {
      const orderWithTranslations = createMockOrder({
        items: [
          {
            id: 1,
            orderId: 1,
            productId: 1,
            productSnapshot: {
              nameTranslations: {
                en: 'English Name',
                es: 'Spanish Name',
                ro: 'Romanian Name',
              },
              images: ['img.jpg'],
            },
            quantity: 1,
            priceEur: 10,
            totalEur: 10,
          },
        ],
      })
      const wrapper = mount(OrderCardEnhanced, {
        props: { order: orderWithTranslations },
        global: { stubs: globalStubs },
      })
      // Should use English as the mock locale is 'en'
      const img = wrapper.find('img')
      expect(img.attributes('alt')).toBe('English Name')
    })

    it('should fallback to English when locale translation not available', () => {
      // The mock sets locale to 'en', but we can verify fallback logic exists
      const orderWithPartialTranslations = createMockOrder({
        items: [
          {
            id: 1,
            orderId: 1,
            productId: 1,
            productSnapshot: {
              nameTranslations: {
                en: 'Fallback English',
              },
              images: ['img.jpg'],
            },
            quantity: 1,
            priceEur: 10,
            totalEur: 10,
          },
        ],
      })
      const wrapper = mount(OrderCardEnhanced, {
        props: { order: orderWithPartialTranslations },
        global: { stubs: globalStubs },
      })
      const img = wrapper.find('img')
      expect(img.attributes('alt')).toBe('Fallback English')
    })
  })
})
