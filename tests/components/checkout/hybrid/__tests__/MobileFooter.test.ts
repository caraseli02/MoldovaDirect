import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import MobileFooter from '~/components/checkout/hybrid/MobileFooter.vue'

vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({ t: (k: string) => k })),
}))

describe('MobileFooter', () => {
  const defaultProps = {
    canPlaceOrder: true,
    processingOrder: false,
    formattedTotal: '$99.99',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render mobile footer component', () => {
      const wrapper = mount(MobileFooter, {
        props: defaultProps,
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('should have fixed positioning at bottom', () => {
      const wrapper = mount(MobileFooter, {
        props: defaultProps,
      })
      const container = wrapper.find('div')
      expect(container.classes()).toContain('fixed')
      expect(container.classes()).toContain('bottom-0')
      expect(container.classes()).toContain('left-0')
      expect(container.classes()).toContain('right-0')
    })

    it('should be hidden on large screens', () => {
      const wrapper = mount(MobileFooter, {
        props: defaultProps,
      })
      const container = wrapper.find('div')
      expect(container.classes()).toContain('lg:hidden')
    })

    it('should have high z-index for overlay positioning', () => {
      const wrapper = mount(MobileFooter, {
        props: defaultProps,
      })
      const container = wrapper.find('div')
      expect(container.classes()).toContain('z-50')
    })

    it('should display the total label translation key', () => {
      const wrapper = mount(MobileFooter, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('common.total')
    })

    it('should display the formatted total amount', () => {
      const wrapper = mount(MobileFooter, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('$99.99')
    })

    it('should render place order button', () => {
      const wrapper = mount(MobileFooter, {
        props: defaultProps,
      })
      const button = wrapper.find('button')
      expect(button.exists()).toBe(true)
    })

    it('should display place order button text', () => {
      const wrapper = mount(MobileFooter, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('checkout.placeOrder')
    })
  })

  describe('props handling', () => {
    it('should display different formatted total values', () => {
      const wrapper = mount(MobileFooter, {
        props: {
          ...defaultProps,
          formattedTotal: '$250.00',
        },
      })
      expect(wrapper.text()).toContain('$250.00')
    })

    it('should handle euro formatted total', () => {
      const wrapper = mount(MobileFooter, {
        props: {
          ...defaultProps,
          formattedTotal: '150,00 EUR',
        },
      })
      expect(wrapper.text()).toContain('150,00 EUR')
    })

    it('should enable button when canPlaceOrder is true', () => {
      const wrapper = mount(MobileFooter, {
        props: {
          ...defaultProps,
          canPlaceOrder: true,
          processingOrder: false,
        },
      })
      const button = wrapper.find('button')
      expect(button.attributes('disabled')).toBeUndefined()
    })

    it('should disable button when canPlaceOrder is false', () => {
      const wrapper = mount(MobileFooter, {
        props: {
          ...defaultProps,
          canPlaceOrder: false,
          processingOrder: false,
        },
      })
      const button = wrapper.find('button')
      expect(button.attributes('disabled')).toBeDefined()
    })

    it('should disable button when processingOrder is true', () => {
      const wrapper = mount(MobileFooter, {
        props: {
          ...defaultProps,
          canPlaceOrder: true,
          processingOrder: true,
        },
      })
      const button = wrapper.find('button')
      expect(button.attributes('disabled')).toBeDefined()
    })

    it('should disable button when both canPlaceOrder is false and processingOrder is true', () => {
      const wrapper = mount(MobileFooter, {
        props: {
          ...defaultProps,
          canPlaceOrder: false,
          processingOrder: true,
        },
      })
      const button = wrapper.find('button')
      expect(button.attributes('disabled')).toBeDefined()
    })
  })

  describe('processing state', () => {
    it('should show processing text when processingOrder is true', () => {
      const wrapper = mount(MobileFooter, {
        props: {
          ...defaultProps,
          processingOrder: true,
        },
      })
      expect(wrapper.text()).toContain('checkout.processing')
    })

    it('should not show place order text when processing', () => {
      const wrapper = mount(MobileFooter, {
        props: {
          ...defaultProps,
          processingOrder: true,
        },
      })
      const buttonText = wrapper.find('button').text()
      expect(buttonText).not.toContain('checkout.placeOrder')
    })

    it('should show spinner when processing', () => {
      const wrapper = mount(MobileFooter, {
        props: {
          ...defaultProps,
          processingOrder: true,
        },
      })
      const spinner = wrapper.find('svg.animate-spin')
      expect(spinner.exists()).toBe(true)
    })

    it('should not show spinner when not processing', () => {
      const wrapper = mount(MobileFooter, {
        props: {
          ...defaultProps,
          processingOrder: false,
        },
      })
      const spinner = wrapper.find('svg.animate-spin')
      expect(spinner.exists()).toBe(false)
    })

    it('should show place order text when not processing', () => {
      const wrapper = mount(MobileFooter, {
        props: {
          ...defaultProps,
          processingOrder: false,
        },
      })
      expect(wrapper.text()).toContain('checkout.placeOrder')
    })
  })

  describe('user interactions', () => {
    it('should emit place-order event when button is clicked', async () => {
      const wrapper = mount(MobileFooter, {
        props: defaultProps,
      })
      const button = wrapper.find('button')
      await button.trigger('click')
      expect(wrapper.emitted('place-order')).toBeTruthy()
      expect(wrapper.emitted('place-order')).toHaveLength(1)
    })

    it('should emit place-order event multiple times on multiple clicks', async () => {
      const wrapper = mount(MobileFooter, {
        props: defaultProps,
      })
      const button = wrapper.find('button')
      await button.trigger('click')
      await button.trigger('click')
      await button.trigger('click')
      expect(wrapper.emitted('place-order')).toHaveLength(3)
    })

    it('should not emit event when button is disabled due to canPlaceOrder', async () => {
      const wrapper = mount(MobileFooter, {
        props: {
          ...defaultProps,
          canPlaceOrder: false,
        },
      })
      const button = wrapper.find('button')
      await button.trigger('click')
      // Disabled buttons don't emit click events
      expect(wrapper.emitted('place-order')).toBeFalsy()
    })

    it('should not emit event when button is disabled due to processingOrder', async () => {
      const wrapper = mount(MobileFooter, {
        props: {
          ...defaultProps,
          processingOrder: true,
        },
      })
      const button = wrapper.find('button')
      await button.trigger('click')
      expect(wrapper.emitted('place-order')).toBeFalsy()
    })
  })

  describe('i18n translations', () => {
    it('should use common.total translation key', () => {
      const wrapper = mount(MobileFooter, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('common.total')
    })

    it('should use checkout.placeOrder translation key when not processing', () => {
      const wrapper = mount(MobileFooter, {
        props: {
          ...defaultProps,
          processingOrder: false,
        },
      })
      expect(wrapper.text()).toContain('checkout.placeOrder')
    })

    it('should use checkout.processing translation key when processing', () => {
      const wrapper = mount(MobileFooter, {
        props: {
          ...defaultProps,
          processingOrder: true,
        },
      })
      expect(wrapper.text()).toContain('checkout.processing')
    })
  })

  describe('styling', () => {
    it('should have white background', () => {
      const wrapper = mount(MobileFooter, {
        props: defaultProps,
      })
      const container = wrapper.find('div')
      expect(container.classes()).toContain('bg-white')
    })

    it('should have dark mode background class', () => {
      const wrapper = mount(MobileFooter, {
        props: defaultProps,
      })
      const container = wrapper.find('div')
      expect(container.classes()).toContain('dark:bg-gray-800')
    })

    it('should have border styling', () => {
      const wrapper = mount(MobileFooter, {
        props: defaultProps,
      })
      const container = wrapper.find('div')
      expect(container.classes()).toContain('border-t')
      expect(container.classes()).toContain('border-gray-200')
    })

    it('should have shadow for elevation', () => {
      const wrapper = mount(MobileFooter, {
        props: defaultProps,
      })
      const container = wrapper.find('div')
      expect(container.classes()).toContain('shadow-lg')
    })

    it('should have primary button styling', () => {
      const wrapper = mount(MobileFooter, {
        props: defaultProps,
      })
      const button = wrapper.find('button')
      expect(button.classes()).toContain('bg-slate-600')
      expect(button.classes()).toContain('hover:bg-slate-700')
    })

    it('should have disabled styling classes on button', () => {
      const wrapper = mount(MobileFooter, {
        props: defaultProps,
      })
      const button = wrapper.find('button')
      expect(button.classes()).toContain('disabled:bg-gray-400')
      expect(button.classes()).toContain('disabled:cursor-not-allowed')
    })

    it('should have full width button', () => {
      const wrapper = mount(MobileFooter, {
        props: defaultProps,
      })
      const button = wrapper.find('button')
      expect(button.classes()).toContain('w-full')
    })

    it('should have rounded button styling', () => {
      const wrapper = mount(MobileFooter, {
        props: defaultProps,
      })
      const button = wrapper.find('button')
      expect(button.classes()).toContain('rounded-lg')
    })
  })

  describe('edge cases', () => {
    it('should handle empty formatted total', () => {
      const wrapper = mount(MobileFooter, {
        props: {
          ...defaultProps,
          formattedTotal: '',
        },
      })
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.text()).toContain('common.total')
    })

    it('should handle zero formatted total', () => {
      const wrapper = mount(MobileFooter, {
        props: {
          ...defaultProps,
          formattedTotal: '$0.00',
        },
      })
      expect(wrapper.text()).toContain('$0.00')
    })

    it('should handle very large formatted total', () => {
      const wrapper = mount(MobileFooter, {
        props: {
          ...defaultProps,
          formattedTotal: '$999,999.99',
        },
      })
      expect(wrapper.text()).toContain('$999,999.99')
    })

    it('should handle formatted total with special characters', () => {
      const wrapper = mount(MobileFooter, {
        props: {
          ...defaultProps,
          formattedTotal: 'MDL 1.500,00',
        },
      })
      expect(wrapper.text()).toContain('MDL 1.500,00')
    })

    it('should maintain structure when props change', async () => {
      const wrapper = mount(MobileFooter, {
        props: defaultProps,
      })

      await wrapper.setProps({ formattedTotal: '$150.00' })
      expect(wrapper.text()).toContain('$150.00')

      await wrapper.setProps({ processingOrder: true })
      expect(wrapper.text()).toContain('checkout.processing')

      await wrapper.setProps({ processingOrder: false, canPlaceOrder: false })
      const button = wrapper.find('button')
      expect(button.attributes('disabled')).toBeDefined()
    })

    it('should render correctly with all props false/empty', () => {
      const wrapper = mount(MobileFooter, {
        props: {
          canPlaceOrder: false,
          processingOrder: false,
          formattedTotal: '',
        },
      })
      expect(wrapper.exists()).toBe(true)
      const button = wrapper.find('button')
      expect(button.exists()).toBe(true)
      expect(button.attributes('disabled')).toBeDefined()
    })
  })

  describe('accessibility', () => {
    it('should have accessible button', () => {
      const wrapper = mount(MobileFooter, {
        props: defaultProps,
      })
      const button = wrapper.find('button')
      expect(button.exists()).toBe(true)
    })

    it('should indicate disabled state properly', () => {
      const wrapper = mount(MobileFooter, {
        props: {
          ...defaultProps,
          canPlaceOrder: false,
        },
      })
      const button = wrapper.find('button')
      expect(button.attributes('disabled')).toBeDefined()
    })

    it('should have visible text for screen readers', () => {
      const wrapper = mount(MobileFooter, {
        props: defaultProps,
      })
      const button = wrapper.find('button')
      expect(button.text()).toBeTruthy()
    })
  })
})
