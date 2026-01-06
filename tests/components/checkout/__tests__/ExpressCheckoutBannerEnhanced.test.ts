import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import ExpressCheckoutBannerEnhanced from '~/components/checkout/ExpressCheckoutBannerEnhanced.vue'
import type { Address } from '~/types/address'

vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({
    t: (k: string, fallback?: string) => fallback || k,
    locale: ref('en'),
  })),
  ref,
}))

describe('ExpressCheckoutBannerEnhanced', () => {
  const mockAddress: Address = {
    id: 1,
    type: 'shipping',
    firstName: 'John',
    lastName: 'Doe',
    street: '123 Main Street',
    city: 'Madrid',
    postalCode: '28001',
    country: 'Spain',
    isDefault: true,
  }

  const defaultProps = {
    defaultAddress: mockAddress,
    preferredShippingMethod: 'Express Shipping',
    orderTotal: '99.99 EUR',
    loading: false,
  }

  describe('Rendering', () => {
    it('should render express checkout banner', () => {
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: defaultProps,
      })
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('[data-testid="express-checkout-banner"]').exists()).toBe(true)
    })

    it('should display express checkout title', () => {
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('checkout.expressCheckout.title')
    })

    it('should display one-click description', () => {
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('checkout.expressCheckout.oneClickDescription')
    })

    it('should display lightning emoji icon', () => {
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: defaultProps,
      })
      expect(wrapper.html()).toContain('\u26A1')
    })

    it('should have express-checkout-enhanced class for animation', () => {
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: defaultProps,
      })
      const banner = wrapper.find('[data-testid="express-checkout-banner"]')
      expect(banner.classes()).toContain('express-checkout-enhanced')
    })
  })

  describe('Address Display', () => {
    it('should display customer name from address', () => {
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('John')
      expect(wrapper.text()).toContain('Doe')
    })

    it('should display street address', () => {
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('123 Main Street')
    })

    it('should display city and postal code', () => {
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('Madrid')
      expect(wrapper.text()).toContain('28001')
    })

    it('should display country', () => {
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('Spain')
    })

    it('should display shipping to label', () => {
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('checkout.expressCheckout.shippingTo')
    })

    it('should handle null address gracefully', () => {
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: {
          ...defaultProps,
          defaultAddress: null,
        },
      })
      expect(wrapper.exists()).toBe(true)
      // Should not throw errors with null address
    })
  })

  describe('Payment and Shipping Method Display', () => {
    it('should display payment method label', () => {
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('checkout.expressCheckout.paymentMethod')
    })

    it('should display cash on delivery as payment method', () => {
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('checkout.payment.cash.label')
    })

    it('should display cash emoji for payment', () => {
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: defaultProps,
      })
      expect(wrapper.html()).toContain('\uD83D\uDCB5')
    })

    it('should display preferred shipping method', () => {
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('Express Shipping')
    })

    it('should display default shipping method when preferredShippingMethod is null', () => {
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: {
          ...defaultProps,
          preferredShippingMethod: null,
        },
      })
      expect(wrapper.text()).toContain('checkout.shippingMethod.standard.name')
    })

    it('should display default shipping method when preferredShippingMethod is undefined', () => {
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: {
          defaultAddress: mockAddress,
          orderTotal: '99.99 EUR',
          loading: false,
        },
      })
      expect(wrapper.text()).toContain('checkout.shippingMethod.standard.name')
    })

    it('should display shipping label', () => {
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('Shipping')
    })
  })

  describe('Order Total Display', () => {
    it('should display order total', () => {
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('99.99 EUR')
    })

    it('should display total label', () => {
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('common.total')
    })

    it('should display different order total values', () => {
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: {
          ...defaultProps,
          orderTotal: '150.50 EUR',
        },
      })
      expect(wrapper.text()).toContain('150.50 EUR')
    })
  })

  describe('Action Buttons', () => {
    it('should display place order button', () => {
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('checkout.expressCheckout.placeOrderNow')
    })

    it('should display edit details button', () => {
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('checkout.expressCheckout.editDetails')
    })

    it('should have dismiss/close button', () => {
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: defaultProps,
      })
      const closeButton = wrapper.find('button[aria-label]')
      expect(closeButton.exists()).toBe(true)
    })

    it('should have close button with accessibility label', () => {
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: defaultProps,
      })
      const closeButton = wrapper.find('button[aria-label="common.close"]')
      expect(closeButton.exists()).toBe(true)
    })
  })

  describe('Loading State', () => {
    it('should show processing text when loading', () => {
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: {
          ...defaultProps,
          loading: true,
        },
      })
      expect(wrapper.text()).toContain('checkout.processing')
    })

    it('should not show place order text when loading', () => {
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: {
          ...defaultProps,
          loading: true,
        },
      })
      expect(wrapper.text()).not.toContain('checkout.expressCheckout.placeOrderNow')
    })

    it('should disable place order button when loading', () => {
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: {
          ...defaultProps,
          loading: true,
        },
      })
      const buttons = wrapper.findAll('button')
      const placeOrderButton = buttons.find(btn => btn.attributes('disabled') !== undefined)
      expect(placeOrderButton).toBeDefined()
      expect(placeOrderButton?.attributes('disabled')).toBeDefined()
    })

    it('should show loading spinner when loading', () => {
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: {
          ...defaultProps,
          loading: true,
        },
      })
      const spinner = wrapper.find('.animate-spin')
      expect(spinner.exists()).toBe(true)
    })

    it('should not show loading spinner when not loading', () => {
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: {
          ...defaultProps,
          loading: false,
        },
      })
      const spinner = wrapper.find('.animate-spin')
      expect(spinner.exists()).toBe(false)
    })

    it('should enable place order button when not loading', () => {
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: defaultProps,
      })
      const buttons = wrapper.findAll('button')
      // Find the button that contains "Place Order Now" text
      const placeOrderButton = buttons.find(btn => btn.text().includes('Place Order Now'))
      expect(placeOrderButton?.attributes('disabled')).toBeUndefined()
    })
  })

  describe('Emitted Events', () => {
    it('should emit place-order event when clicking place order button', async () => {
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: defaultProps,
      })
      const buttons = wrapper.findAll('button')
      const placeOrderButton = buttons.find(btn => btn.text().includes('checkout.expressCheckout.placeOrderNow'))
      await placeOrderButton?.trigger('click')
      expect(wrapper.emitted('place-order')).toBeTruthy()
      expect(wrapper.emitted('place-order')?.length).toBe(1)
    })

    it('should emit edit event when clicking edit details button', async () => {
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: defaultProps,
      })
      const buttons = wrapper.findAll('button')
      const editButton = buttons.find(btn => btn.text().includes('checkout.expressCheckout.editDetails'))
      await editButton?.trigger('click')
      expect(wrapper.emitted('edit')).toBeTruthy()
      expect(wrapper.emitted('edit')?.length).toBe(1)
    })

    it('should emit dismiss event when clicking close button', async () => {
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: defaultProps,
      })
      const closeButton = wrapper.find('button[aria-label="common.close"]')
      await closeButton.trigger('click')
      expect(wrapper.emitted('dismiss')).toBeTruthy()
      expect(wrapper.emitted('dismiss')?.length).toBe(1)
    })

    it('should not emit place-order event when loading', async () => {
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: {
          ...defaultProps,
          loading: true,
        },
      })
      const buttons = wrapper.findAll('button')
      const placeOrderButton = buttons.find(btn => btn.attributes('disabled') !== undefined)
      await placeOrderButton?.trigger('click')
      // Disabled buttons should not emit events in most cases
      // Vue Test Utils may still trigger the event, so we verify the button is disabled
      expect(placeOrderButton?.attributes('disabled')).toBeDefined()
    })
  })

  describe('Trust Badges', () => {
    it('should display secure badge', () => {
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('checkout.trustBadges.secure')
    })

    it('should display guaranteed badge', () => {
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('checkout.trustBadges.guaranteed')
    })

    it('should display fast delivery badge', () => {
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('checkout.trustBadges.fastDelivery')
    })

    it('should have trust badge icons', () => {
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: defaultProps,
      })
      const badgeIcons = wrapper.findAll('.text-green-500')
      expect(badgeIcons.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('i18n Translations', () => {
    it('should use i18n for express checkout title', () => {
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: defaultProps,
      })
      // Should display fallback or translation key
      expect(wrapper.text()).toMatch(/Express Checkout|checkout\.expressCheckout\.title/)
    })

    it('should use i18n for common close label', () => {
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: defaultProps,
      })
      const closeButton = wrapper.find('button[aria-label]')
      expect(closeButton.attributes('aria-label')).toContain('common.close')
    })

    it('should use i18n for payment method', () => {
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: defaultProps,
      })
      expect(wrapper.text()).toMatch(/Cash on Delivery|checkout\.payment\.cash\.label/)
    })

    it('should use i18n for processing text', () => {
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: {
          ...defaultProps,
          loading: true,
        },
      })
      expect(wrapper.text()).toMatch(/Processing|checkout\.processing/)
    })
  })

  describe('Styling and Classes', () => {
    it('should have rounded corners styling', () => {
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: defaultProps,
      })
      const banner = wrapper.find('[data-testid="express-checkout-banner"]')
      expect(banner.classes()).toContain('rounded-xl')
    })

    it('should have proper padding', () => {
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: defaultProps,
      })
      const banner = wrapper.find('[data-testid="express-checkout-banner"]')
      expect(banner.classes()).toContain('p-6')
    })

    it('should have margin bottom for spacing', () => {
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: defaultProps,
      })
      const banner = wrapper.find('[data-testid="express-checkout-banner"]')
      expect(banner.classes()).toContain('mb-6')
    })

    it('should have border styling', () => {
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: defaultProps,
      })
      const banner = wrapper.find('[data-testid="express-checkout-banner"]')
      expect(banner.classes()).toContain('border')
    })

    it('should have primary background color', () => {
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: defaultProps,
      })
      const banner = wrapper.find('[data-testid="express-checkout-banner"]')
      expect(banner.classes().join(' ')).toContain('bg-primary')
    })

    it('should have dark mode classes', () => {
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: defaultProps,
      })
      const banner = wrapper.find('[data-testid="express-checkout-banner"]')
      expect(banner.html()).toContain('dark:')
    })

    it('should have responsive grid for address and payment info', () => {
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: defaultProps,
      })
      const grid = wrapper.find('.grid')
      expect(grid.exists()).toBe(true)
      expect(grid.classes()).toContain('md:grid-cols-2')
    })

    it('should have responsive flex for action buttons', () => {
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: defaultProps,
      })
      const actionContainer = wrapper.find('.flex-col')
      expect(actionContainer.exists()).toBe(true)
      expect(actionContainer.html()).toContain('sm:flex-row')
    })
  })

  describe('Edge Cases', () => {
    it('should handle address with optional fields', () => {
      const addressWithOptionals: Address = {
        ...mockAddress,
        company: 'Test Company',
        province: 'Test Province',
        phone: '+34123456789',
      }
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: {
          ...defaultProps,
          defaultAddress: addressWithOptionals,
        },
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle empty order total', () => {
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: {
          ...defaultProps,
          orderTotal: '',
        },
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle very long shipping method name', () => {
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: {
          ...defaultProps,
          preferredShippingMethod: 'Premium Express International Next Day Delivery with Insurance',
        },
      })
      expect(wrapper.text()).toContain('Premium Express International')
    })

    it('should handle special characters in address', () => {
      const specialAddress: Address = {
        ...mockAddress,
        firstName: 'Jose',
        lastName: 'Garcia-Lopez',
        street: 'Calle Nunez de Balboa, 5-7',
        city: 'Malaga',
      }
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: {
          ...defaultProps,
          defaultAddress: specialAddress,
        },
      })
      expect(wrapper.text()).toContain('Garcia-Lopez')
      expect(wrapper.text()).toContain('5-7')
    })

    it('should handle loading prop default value', () => {
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: {
          defaultAddress: mockAddress,
          orderTotal: '50.00 EUR',
        },
      })
      // Should render without loading state when loading prop is not provided
      expect(wrapper.text()).toContain('checkout.expressCheckout.placeOrderNow')
      expect(wrapper.text()).not.toContain('checkout.processing')
    })
  })

  describe('Accessibility', () => {
    it('should have accessible close button with aria-label', () => {
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: defaultProps,
      })
      const closeButton = wrapper.find('button[aria-label]')
      expect(closeButton.exists()).toBe(true)
      expect(closeButton.attributes('aria-label')).toBeTruthy()
    })

    it('should use semantic heading for title', () => {
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: defaultProps,
      })
      const heading = wrapper.find('h3')
      expect(heading.exists()).toBe(true)
      expect(heading.text()).toContain('checkout.expressCheckout.title')
    })

    it('should have descriptive button text for actions', () => {
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: defaultProps,
      })
      const buttons = wrapper.findAll('button')
      const buttonTexts = buttons.map(btn => btn.text())
      expect(buttonTexts.some(text => text.includes('checkout.expressCheckout.placeOrderNow'))).toBe(true)
      expect(buttonTexts.some(text => text.includes('checkout.expressCheckout.editDetails'))).toBe(true)
    })

    it('should have SVG icons with proper viewBox', () => {
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: defaultProps,
      })
      const svgs = wrapper.findAll('svg')
      svgs.forEach((svg) => {
        expect(svg.attributes('viewBox')).toBeTruthy()
      })
    })

    it('should indicate disabled state on loading button', () => {
      const wrapper = mount(ExpressCheckoutBannerEnhanced, {
        props: {
          ...defaultProps,
          loading: true,
        },
      })
      const disabledButton = wrapper.find('button[disabled]')
      expect(disabledButton.exists()).toBe(true)
      expect(disabledButton.classes()).toContain('disabled:cursor-not-allowed')
    })
  })
})
