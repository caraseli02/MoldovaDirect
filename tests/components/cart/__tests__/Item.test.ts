import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import CartItem from '~/components/cart/Item.vue'

// Mock useI18n
vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({
    locale: { value: 'es' },
    t: (key: string) => key,
  })),
  useCart: vi.fn(() => ({
    isItemSelected: vi.fn((id: string) => false),
  })),
}))

describe('Cart Item Component', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  const mockItem = {
    id: 'item-1',
    product: {
      id: 'product-1',
      name: { es: 'Vino Tinto', en: 'Red Wine' },
      price: 25.99,
      images: [{ url: '/test-wine.jpg' }],
      stock: 10,
    },
    quantity: 2,
  }

  it('should render cart item correctly', () => {
    const wrapper = mount(CartItem, {
      props: { item: mockItem },
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toContain('Vino Tinto')
  })

  it('should display product image', () => {
    const wrapper = mount(CartItem, {
      props: { item: mockItem },
    })

    const image = wrapper.find('img')
    expect(image.exists()).toBe(true)
    expect(image.attributes('src')).toContain('test-wine.jpg')
    expect(image.attributes('alt')).toBe('Vino Tinto')
  })

  it('should display correct price formatting', () => {
    const wrapper = mount(CartItem, {
      props: { item: mockItem },
    })

    // Should show total price (25.99 * 2)
    expect(wrapper.html()).toContain('51,98')
  })

  it('should display quantity correctly', () => {
    const wrapper = mount(CartItem, {
      props: { item: mockItem },
    })

    const quantityDisplay = wrapper.find('[role="status"]')
    expect(quantityDisplay.text()).toBe('2')
  })

  it('should emit update-quantity when increase button clicked', async () => {
    const wrapper = mount(CartItem, {
      props: { item: mockItem },
    })

    const increaseButton = wrapper.findAll('button').find(btn =>
      btn.attributes('aria-label') === 'cart.increaseQuantity'
    )

    await increaseButton?.trigger('click')

    expect(wrapper.emitted('update-quantity')).toBeTruthy()
    expect(wrapper.emitted('update-quantity')?.[0]).toEqual(['item-1', 3])
  })

  it('should emit update-quantity when decrease button clicked', async () => {
    const wrapper = mount(CartItem, {
      props: { item: mockItem },
    })

    const decreaseButton = wrapper.findAll('button').find(btn =>
      btn.attributes('aria-label') === 'cart.decreaseQuantity'
    )

    await decreaseButton?.trigger('click')

    expect(wrapper.emitted('update-quantity')).toBeTruthy()
    expect(wrapper.emitted('update-quantity')?.[0]).toEqual(['item-1', 1])
  })

  it('should disable decrease button when quantity is 1', () => {
    const wrapper = mount(CartItem, {
      props: {
        item: { ...mockItem, quantity: 1 },
      },
    })

    const decreaseButton = wrapper.findAll('button').find(btn =>
      btn.attributes('aria-label') === 'cart.decreaseQuantity'
    )

    expect(decreaseButton?.attributes('disabled')).toBeDefined()
  })

  it('should disable increase button when quantity equals stock', () => {
    const wrapper = mount(CartItem, {
      props: {
        item: {
          ...mockItem,
          quantity: 10, // equals stock
        },
      },
    })

    const increaseButton = wrapper.findAll('button').find(btn =>
      btn.attributes('aria-label') === 'cart.increaseQuantity'
    )

    expect(increaseButton?.attributes('disabled')).toBeDefined()
  })

  it('should emit remove-item when remove button clicked', async () => {
    const wrapper = mount(CartItem, {
      props: { item: mockItem },
    })

    const removeButton = wrapper.findAll('button').find(btn =>
      btn.attributes('aria-label') === 'cart.removeItem'
    )

    await removeButton?.trigger('click')

    expect(wrapper.emitted('remove-item')).toBeTruthy()
    expect(wrapper.emitted('remove-item')?.[0]).toEqual(['item-1'])
  })

  it('should emit save-for-later when save button clicked', async () => {
    const wrapper = mount(CartItem, {
      props: { item: mockItem },
    })

    const saveButton = wrapper.findAll('button').find(btn =>
      btn.text().includes('cart.saveForLater')
    )

    await saveButton?.trigger('click')

    expect(wrapper.emitted('save-for-later')).toBeTruthy()
    expect(wrapper.emitted('save-for-later')?.[0]).toEqual(['item-1'])
  })

  it('should show low stock indicator when stock <= 5', () => {
    const wrapper = mount(CartItem, {
      props: {
        item: {
          ...mockItem,
          product: { ...mockItem.product, stock: 3 },
        },
      },
    })

    expect(wrapper.html()).toContain('cart.stock.low')
    expect(wrapper.html()).toContain('animate-pulse')
  })

  it('should show in stock indicator when stock > 5', () => {
    const wrapper = mount(CartItem, {
      props: { item: mockItem }, // stock is 10
    })

    expect(wrapper.html()).toContain('cart.stock.inStock')
  })

  it('should disable all buttons when loading prop is true', () => {
    const wrapper = mount(CartItem, {
      props: {
        item: mockItem,
        loading: true,
      },
    })

    const buttons = wrapper.findAll('button')
    buttons.forEach((button) => {
      expect(button.attributes('disabled')).toBeDefined()
    })
  })

  it('should display unit price when quantity > 1', () => {
    const wrapper = mount(CartItem, {
      props: { item: mockItem }, // quantity is 2
    })

    expect(wrapper.text()).toContain('common.each')
  })

  it('should handle missing product images gracefully', () => {
    const wrapper = mount(CartItem, {
      props: {
        item: {
          ...mockItem,
          product: { ...mockItem.product, images: [] },
        },
      },
    })

    const image = wrapper.find('img')
    expect(image.attributes('src')).toContain('placeholder-product.svg')
  })

  it('should handle localized product names', () => {
    const wrapper = mount(CartItem, {
      props: { item: mockItem },
    })

    expect(wrapper.text()).toContain('Vino Tinto')
  })

  it('should apply low stock border styling', () => {
    const wrapper = mount(CartItem, {
      props: {
        item: {
          ...mockItem,
          product: { ...mockItem.product, stock: 2 },
        },
      },
    })

    const container = wrapper.find('div')
    expect(container.classes()).toContain('border-amber-300')
  })
})
