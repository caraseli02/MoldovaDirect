import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import ReviewShippingSection from '~/components/checkout/review/ReviewShippingSection.vue'

vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({
    t: (k: string) => k,
    locale: ref('en'),
  })),
  ref,
  computed: vi.fn(fn => ({ value: fn() })),
}))

describe('ReviewShippingSection', () => {
  const mockAddress = {
    id: 1,
    type: 'shipping' as const,
    firstName: 'John',
    lastName: 'Doe',
    company: 'Acme Corp',
    street: '123 Main Street',
    city: 'Madrid',
    postalCode: '28001',
    province: 'Madrid',
    country: 'Spain',
    phone: '+34 612 345 678',
    isDefault: true,
  }

  const mockShippingMethod = {
    id: 'express',
    name: 'Express Shipping',
    description: '2-3 business days',
    price: 9.99,
    estimatedDays: 3,
  }

  const mockShippingInfo = {
    address: mockAddress,
    method: mockShippingMethod,
    instructions: 'Leave at the front door',
  }

  const mockFormatPrice = (value: number) => `$${value.toFixed(2)}`

  const defaultProps = {
    shippingInfo: mockShippingInfo,
    formatPrice: mockFormatPrice,
  }

  // ============================================
  // Rendering Tests
  // ============================================

  describe('rendering', () => {
    it('should render the component correctly', () => {
      const wrapper = mount(ReviewShippingSection, {
        props: defaultProps,
      })
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('section').exists()).toBe(true)
    })

    it('should render the section header with correct i18n key', () => {
      const wrapper = mount(ReviewShippingSection, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('checkout.review.shippingInfo')
    })

    it('should render edit button with correct i18n key', () => {
      const wrapper = mount(ReviewShippingSection, {
        props: defaultProps,
      })
      const editButton = wrapper.find('button')
      expect(editButton.exists()).toBe(true)
      expect(editButton.text()).toContain('checkout.review.editShipping')
    })

    it('should render shipping address section header', () => {
      const wrapper = mount(ReviewShippingSection, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('checkout.review.shippingAddress')
    })

    it('should render shipping method section header', () => {
      const wrapper = mount(ReviewShippingSection, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('checkout.review.shippingMethod')
    })

    it('should apply correct styling classes', () => {
      const wrapper = mount(ReviewShippingSection, {
        props: defaultProps,
      })
      const section = wrapper.find('section')
      expect(section.classes()).toContain('bg-white')
      expect(section.classes()).toContain('rounded-lg')
      expect(section.classes()).toContain('shadow-sm')
    })
  })

  // ============================================
  // Address Display Tests
  // ============================================

  describe('address display', () => {
    it('should display full name (firstName and lastName)', () => {
      const wrapper = mount(ReviewShippingSection, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('John')
      expect(wrapper.text()).toContain('Doe')
    })

    it('should display company name when provided', () => {
      const wrapper = mount(ReviewShippingSection, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('Acme Corp')
    })

    it('should not display company section when company is not provided', () => {
      const addressWithoutCompany = { ...mockAddress, company: undefined }
      const wrapper = mount(ReviewShippingSection, {
        props: {
          ...defaultProps,
          shippingInfo: {
            ...mockShippingInfo,
            address: addressWithoutCompany,
          },
        },
      })
      expect(wrapper.text()).not.toContain('Acme Corp')
    })

    it('should display street address', () => {
      const wrapper = mount(ReviewShippingSection, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('123 Main Street')
    })

    it('should display city and postal code', () => {
      const wrapper = mount(ReviewShippingSection, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('Madrid')
      expect(wrapper.text()).toContain('28001')
    })

    it('should display province when provided', () => {
      const wrapper = mount(ReviewShippingSection, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('Madrid')
    })

    it('should not display province section when province is not provided', () => {
      const addressWithoutProvince = { ...mockAddress, province: undefined }
      const wrapper = mount(ReviewShippingSection, {
        props: {
          ...defaultProps,
          shippingInfo: {
            ...mockShippingInfo,
            address: addressWithoutProvince,
          },
        },
      })
      // Province "Madrid" should not appear twice (only as city)
      const text = wrapper.text()
      // Count occurrences - should only appear once (in city line)
      const madridCount = (text.match(/Madrid/g) || []).length
      expect(madridCount).toBe(1)
    })

    it('should display country', () => {
      const wrapper = mount(ReviewShippingSection, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('Spain')
    })

    it('should display phone number when provided', () => {
      const wrapper = mount(ReviewShippingSection, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('+34 612 345 678')
    })

    it('should not display phone section when phone is not provided', () => {
      const addressWithoutPhone = { ...mockAddress, phone: undefined }
      const wrapper = mount(ReviewShippingSection, {
        props: {
          ...defaultProps,
          shippingInfo: {
            ...mockShippingInfo,
            address: addressWithoutPhone,
          },
        },
      })
      expect(wrapper.text()).not.toContain('+34 612 345 678')
    })
  })

  // ============================================
  // Shipping Method Display Tests
  // ============================================

  describe('shipping method display', () => {
    it('should display shipping method name', () => {
      const wrapper = mount(ReviewShippingSection, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('Express Shipping')
    })

    it('should display shipping method description', () => {
      const wrapper = mount(ReviewShippingSection, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('2-3 business days')
    })

    it('should display formatted shipping price', () => {
      const wrapper = mount(ReviewShippingSection, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('$9.99')
    })

    it('should use formatPrice function for price display', () => {
      const customFormatPrice = vi.fn((value: number) => `EUR ${value}`)
      const wrapper = mount(ReviewShippingSection, {
        props: {
          ...defaultProps,
          formatPrice: customFormatPrice,
        },
      })
      expect(customFormatPrice).toHaveBeenCalledWith(9.99)
      expect(wrapper.text()).toContain('EUR 9.99')
    })

    it('should handle zero shipping price', () => {
      const freeShippingMethod = { ...mockShippingMethod, price: 0 }
      const wrapper = mount(ReviewShippingSection, {
        props: {
          ...defaultProps,
          shippingInfo: {
            ...mockShippingInfo,
            method: freeShippingMethod,
          },
        },
      })
      expect(wrapper.text()).toContain('$0.00')
    })
  })

  // ============================================
  // Delivery Instructions Tests
  // ============================================

  describe('delivery instructions', () => {
    it('should display delivery instructions section when provided', () => {
      const wrapper = mount(ReviewShippingSection, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('checkout.review.deliveryInstructions')
      expect(wrapper.text()).toContain('Leave at the front door')
    })

    it('should not display delivery instructions section when not provided', () => {
      const shippingInfoWithoutInstructions = {
        address: mockAddress,
        method: mockShippingMethod,
      }
      const wrapper = mount(ReviewShippingSection, {
        props: {
          ...defaultProps,
          shippingInfo: shippingInfoWithoutInstructions,
        },
      })
      expect(wrapper.text()).not.toContain('checkout.review.deliveryInstructions')
    })

    it('should not display delivery instructions section when instructions is empty string', () => {
      const shippingInfoWithEmptyInstructions = {
        address: mockAddress,
        method: mockShippingMethod,
        instructions: '',
      }
      const wrapper = mount(ReviewShippingSection, {
        props: {
          ...defaultProps,
          shippingInfo: shippingInfoWithEmptyInstructions,
        },
      })
      // Empty string is falsy, so section should not render
      expect(wrapper.text()).not.toContain('checkout.review.deliveryInstructions')
    })
  })

  // ============================================
  // Event Emission Tests
  // ============================================

  describe('events', () => {
    it('should emit edit event when edit button is clicked', async () => {
      const wrapper = mount(ReviewShippingSection, {
        props: defaultProps,
      })
      const editButton = wrapper.find('button')
      await editButton.trigger('click')
      expect(wrapper.emitted()).toHaveProperty('edit')
      expect(wrapper.emitted('edit')).toHaveLength(1)
    })

    it('should emit edit event multiple times on multiple clicks', async () => {
      const wrapper = mount(ReviewShippingSection, {
        props: defaultProps,
      })
      const editButton = wrapper.find('button')
      await editButton.trigger('click')
      await editButton.trigger('click')
      await editButton.trigger('click')
      expect(wrapper.emitted('edit')).toHaveLength(3)
    })
  })

  // ============================================
  // Props Handling Tests
  // ============================================

  describe('props handling', () => {
    it('should not render address content when shippingInfo is null', () => {
      const wrapper = mount(ReviewShippingSection, {
        props: {
          shippingInfo: null,
          formatPrice: mockFormatPrice,
        },
      })
      // Header should still render
      expect(wrapper.text()).toContain('checkout.review.shippingInfo')
      // But address details should not
      expect(wrapper.text()).not.toContain('John')
      expect(wrapper.text()).not.toContain('Express Shipping')
    })

    it('should still render header and edit button when shippingInfo is null', () => {
      const wrapper = mount(ReviewShippingSection, {
        props: {
          shippingInfo: null,
          formatPrice: mockFormatPrice,
        },
      })
      expect(wrapper.find('header').exists()).toBe(true)
      expect(wrapper.find('button').exists()).toBe(true)
    })

    it('should handle different shipping methods', () => {
      const standardShipping = {
        id: 'standard',
        name: 'Standard Shipping',
        description: '5-7 business days',
        price: 4.99,
        estimatedDays: 7,
      }
      const wrapper = mount(ReviewShippingSection, {
        props: {
          ...defaultProps,
          shippingInfo: {
            ...mockShippingInfo,
            method: standardShipping,
          },
        },
      })
      expect(wrapper.text()).toContain('Standard Shipping')
      expect(wrapper.text()).toContain('5-7 business days')
      expect(wrapper.text()).toContain('$4.99')
    })

    it('should handle address with minimal required fields', () => {
      const minimalAddress = {
        id: 2,
        type: 'shipping' as const,
        firstName: 'Jane',
        lastName: 'Smith',
        street: '456 Oak Ave',
        city: 'Barcelona',
        postalCode: '08001',
        country: 'Spain',
        isDefault: false,
      }
      const wrapper = mount(ReviewShippingSection, {
        props: {
          ...defaultProps,
          shippingInfo: {
            address: minimalAddress,
            method: mockShippingMethod,
          },
        },
      })
      expect(wrapper.text()).toContain('Jane')
      expect(wrapper.text()).toContain('Smith')
      expect(wrapper.text()).toContain('456 Oak Ave')
      expect(wrapper.text()).toContain('Barcelona')
      expect(wrapper.text()).toContain('08001')
      expect(wrapper.text()).toContain('Spain')
    })
  })

  // ============================================
  // Edge Cases
  // ============================================

  describe('edge cases', () => {
    it('should handle special characters in address fields', () => {
      const specialCharAddress = {
        ...mockAddress,
        firstName: 'Jean-Pierre',
        lastName: 'O\'Connor',
        street: 'Calle de la Constitucion, 5-A',
        company: 'Smith & Associates LLC',
      }
      const wrapper = mount(ReviewShippingSection, {
        props: {
          ...defaultProps,
          shippingInfo: {
            ...mockShippingInfo,
            address: specialCharAddress,
          },
        },
      })
      expect(wrapper.text()).toContain('Jean-Pierre')
      expect(wrapper.text()).toContain('O\'Connor')
      expect(wrapper.text()).toContain('Calle de la Constitucion, 5-A')
      expect(wrapper.text()).toContain('Smith & Associates LLC')
    })

    it('should handle unicode characters in address', () => {
      const unicodeAddress = {
        ...mockAddress,
        firstName: 'Maria',
        lastName: 'Garcia',
        city: 'Chisinau',
        country: 'Moldova',
      }
      const wrapper = mount(ReviewShippingSection, {
        props: {
          ...defaultProps,
          shippingInfo: {
            ...mockShippingInfo,
            address: unicodeAddress,
          },
        },
      })
      expect(wrapper.text()).toContain('Chisinau')
      expect(wrapper.text()).toContain('Moldova')
    })

    it('should handle long delivery instructions', () => {
      const longInstructions = 'Please leave the package at the back door near the garage. If no one is home, you can also leave it with the neighbor at number 125. Ring the doorbell twice. The dog is friendly.'
      const wrapper = mount(ReviewShippingSection, {
        props: {
          ...defaultProps,
          shippingInfo: {
            ...mockShippingInfo,
            instructions: longInstructions,
          },
        },
      })
      expect(wrapper.text()).toContain(longInstructions)
    })

    it('should handle very long shipping method name', () => {
      const longNameMethod = {
        ...mockShippingMethod,
        name: 'Premium Express International Overnight Guaranteed Delivery Service',
      }
      const wrapper = mount(ReviewShippingSection, {
        props: {
          ...defaultProps,
          shippingInfo: {
            ...mockShippingInfo,
            method: longNameMethod,
          },
        },
      })
      expect(wrapper.text()).toContain('Premium Express International Overnight Guaranteed Delivery Service')
    })

    it('should handle high shipping price values', () => {
      const expensiveMethod = {
        ...mockShippingMethod,
        price: 999.99,
      }
      const wrapper = mount(ReviewShippingSection, {
        props: {
          ...defaultProps,
          shippingInfo: {
            ...mockShippingInfo,
            method: expensiveMethod,
          },
        },
      })
      expect(wrapper.text()).toContain('$999.99')
    })

    it('should handle formatPrice returning different currency formats', () => {
      const euroFormatPrice = (value: number) => `${value.toFixed(2).replace('.', ',')} EUR`
      const wrapper = mount(ReviewShippingSection, {
        props: {
          shippingInfo: mockShippingInfo,
          formatPrice: euroFormatPrice,
        },
      })
      expect(wrapper.text()).toContain('9,99 EUR')
    })
  })

  // ============================================
  // Accessibility Tests
  // ============================================

  describe('accessibility', () => {
    it('should use semantic section elements', () => {
      const wrapper = mount(ReviewShippingSection, {
        props: defaultProps,
      })
      const sections = wrapper.findAll('section')
      expect(sections.length).toBeGreaterThanOrEqual(1)
    })

    it('should use proper heading hierarchy', () => {
      const wrapper = mount(ReviewShippingSection, {
        props: defaultProps,
      })
      const h3 = wrapper.find('h3')
      const h4s = wrapper.findAll('h4')
      expect(h3.exists()).toBe(true)
      expect(h4s.length).toBeGreaterThan(0)
    })

    it('should have an accessible edit button', () => {
      const wrapper = mount(ReviewShippingSection, {
        props: defaultProps,
      })
      const editButton = wrapper.find('button')
      expect(editButton.exists()).toBe(true)
      expect(editButton.text().length).toBeGreaterThan(0)
    })

    it('should use header element for section header', () => {
      const wrapper = mount(ReviewShippingSection, {
        props: defaultProps,
      })
      const header = wrapper.find('header')
      expect(header.exists()).toBe(true)
    })
  })

  // ============================================
  // Dark Mode Support Tests
  // ============================================

  describe('dark mode styling', () => {
    it('should have dark mode classes on main section', () => {
      const wrapper = mount(ReviewShippingSection, {
        props: defaultProps,
      })
      const section = wrapper.find('section')
      expect(section.classes()).toContain('dark:bg-gray-800')
      expect(section.classes()).toContain('dark:border-gray-700')
    })

    it('should have dark mode classes on headings', () => {
      const wrapper = mount(ReviewShippingSection, {
        props: defaultProps,
      })
      const h3 = wrapper.find('h3')
      expect(h3.classes()).toContain('dark:text-white')
    })

    it('should have dark mode classes on edit button', () => {
      const wrapper = mount(ReviewShippingSection, {
        props: defaultProps,
      })
      const button = wrapper.find('button')
      expect(button.classes()).toContain('dark:text-green-400')
      expect(button.classes()).toContain('dark:hover:text-green-300')
    })
  })

  // ============================================
  // i18n Translation Key Tests
  // ============================================

  describe('i18n translation keys', () => {
    it('should use correct translation key for section header', () => {
      const wrapper = mount(ReviewShippingSection, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('checkout.review.shippingInfo')
    })

    it('should use correct translation key for edit button', () => {
      const wrapper = mount(ReviewShippingSection, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('checkout.review.editShipping')
    })

    it('should use correct translation key for shipping address subsection', () => {
      const wrapper = mount(ReviewShippingSection, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('checkout.review.shippingAddress')
    })

    it('should use correct translation key for shipping method subsection', () => {
      const wrapper = mount(ReviewShippingSection, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('checkout.review.shippingMethod')
    })

    it('should use correct translation key for delivery instructions', () => {
      const wrapper = mount(ReviewShippingSection, {
        props: defaultProps,
      })
      expect(wrapper.text()).toContain('checkout.review.deliveryInstructions')
    })
  })
})
