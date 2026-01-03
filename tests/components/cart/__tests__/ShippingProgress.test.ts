import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ShippingProgress from '~/components/cart/ShippingProgress.vue'

vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({
    t: (k: string, params?: any) => {
      if (k === 'cart.shipping.addMore') {
        return `Add ${params?.amount} for free shipping`
      }
      return k
    },
    locale: { value: 'en' },
  })),
}))

describe('Cart ShippingProgress', () => {
  it('should render shipping progress', () => {
    const wrapper = mount(ShippingProgress, {
      props: {
        subtotal: 30,
        freeShippingThreshold: 50,
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('should show progress bar at correct percentage', () => {
    const wrapper = mount(ShippingProgress, {
      props: {
        subtotal: 25,
        freeShippingThreshold: 50,
      },
    })
    const progressBar = wrapper.find('.h-full')
    expect(progressBar.attributes('style')).toContain('width: 50%')
  })

  it('should show qualified message when threshold met', () => {
    const wrapper = mount(ShippingProgress, {
      props: {
        subtotal: 60,
        freeShippingThreshold: 50,
      },
    })
    expect(wrapper.text()).toContain('cart.shipping.qualified')
  })

  it('should show amount remaining when below threshold', () => {
    const wrapper = mount(ShippingProgress, {
      props: {
        subtotal: 30,
        freeShippingThreshold: 50,
      },
    })
    expect(wrapper.text()).toContain('Add')
  })

  it('should hide when subtotal is zero', () => {
    const wrapper = mount(ShippingProgress, {
      props: {
        subtotal: 0,
        freeShippingThreshold: 50,
      },
    })
    expect(wrapper.html()).toBe('<!--v-if-->')
  })

  it('should use emerald color when qualified', () => {
    const wrapper = mount(ShippingProgress, {
      props: {
        subtotal: 60,
        freeShippingThreshold: 50,
      },
    })
    const progressBar = wrapper.find('.h-full')
    expect(progressBar.classes()).toContain('bg-emerald-500')
  })

  it('should cap progress at 100%', () => {
    const wrapper = mount(ShippingProgress, {
      props: {
        subtotal: 150,
        freeShippingThreshold: 50,
      },
    })
    const progressBar = wrapper.find('.h-full')
    expect(progressBar.attributes('style')).toContain('width: 100%')
  })
})
