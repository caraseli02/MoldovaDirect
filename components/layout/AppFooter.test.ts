import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import AppFooter from './AppFooter.vue'

// Mock vue-sonner
const mockToastSuccess = vi.fn()
const mockToastError = vi.fn()

vi.mock('vue-sonner', () => ({
  toast: {
    success: mockToastSuccess,
    error: mockToastError,
  },
}))

// Mock Button component
vi.mock('@/components/ui/button', () => ({
  Button: {
    name: 'Button',
    template: '<button><slot /></button>',
    props: ['type', 'disabled', 'class'],
  },
}))

describe('AppFooter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders footer sections', () => {
    const wrapper = mount(AppFooter, {
      global: {
        stubs: {
          NuxtLink: {
            template: '<a><slot /></a>',
            props: ['to'],
          },
        },
      },
    })

    // Check main sections are rendered
    expect(wrapper.text()).toContain('Moldova Direct')
    expect(wrapper.text()).toContain('footer.info.title')
    expect(wrapper.text()).toContain('footer.help.title')
    expect(wrapper.text()).toContain('footer.newsletter.title')
  })

  it('renders trust badges with i18n', () => {
    const wrapper = mount(AppFooter, {
      global: {
        stubs: {
          NuxtLink: {
            template: '<a><slot /></a>',
            props: ['to'],
          },
        },
      },
    })

    expect(wrapper.text()).toContain('footer.trust.title')
    expect(wrapper.text()).toContain('footer.trust.sslSecure')
    expect(wrapper.text()).toContain('footer.trust.securePayment')
  })

  it('renders payment method logos', () => {
    const wrapper = mount(AppFooter, {
      global: {
        stubs: {
          NuxtLink: {
            template: '<a><slot /></a>',
            props: ['to'],
          },
        },
      },
    })

    // Check for SVG elements (payment logos)
    const svgs = wrapper.findAll('svg')
    expect(svgs.length).toBeGreaterThan(3) // At least badge icons + payment logos
  })

  describe('Newsletter subscription', () => {
    it('renders newsletter form with correct elements', () => {
      const wrapper = mount(AppFooter, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a><slot /></a>',
              props: ['to'],
            },
          },
        },
      })

      const form = wrapper.find('form')
      expect(form.exists()).toBe(true)

      const emailInput = wrapper.find('input[type="email"]')
      expect(emailInput.exists()).toBe(true)
      expect(emailInput.attributes('required')).toBeDefined()
      expect(emailInput.attributes('aria-label')).toBe('footer.newsletter.placeholder')

      const submitButton = wrapper.find('button[type="submit"]')
      expect(submitButton.exists()).toBe(true)
    })

    it('shows loading state during submission', async () => {
      const wrapper = mount(AppFooter, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a><slot /></a>',
              props: ['to'],
            },
          },
        },
      })

      const emailInput = wrapper.find('input[type="email"]')
      const form = wrapper.find('form')

      // Fill in email
      await emailInput.setValue('test@example.com')

      // Submit form
      const submitPromise = form.trigger('submit')

      // Check loading state (before promise resolves)
      await nextTick()
      expect(wrapper.text()).toContain('footer.newsletter.submitting')

      // Wait for submission to complete
      await submitPromise
      await new Promise(resolve => setTimeout(resolve, 1100)) // Wait for mock timeout
      await nextTick()
    })

    it('disables form during submission', async () => {
      const wrapper = mount(AppFooter, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a><slot /></a>',
              props: ['to'],
            },
          },
        },
      })

      const emailInput = wrapper.find('input[type="email"]')
      const submitButton = wrapper.find('button[type="submit"]')
      const form = wrapper.find('form')

      await emailInput.setValue('test@example.com')

      // Submit form
      const submitPromise = form.trigger('submit')
      await nextTick()

      // Check that input and button are disabled during submission
      expect(emailInput.attributes('disabled')).toBeDefined()
      expect(submitButton.attributes('disabled')).toBeDefined()

      // Wait for submission to complete
      await submitPromise
      await new Promise(resolve => setTimeout(resolve, 1100))
      await nextTick()
    })

    it('shows success toast on successful subscription', async () => {
      const wrapper = mount(AppFooter, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a><slot /></a>',
              props: ['to'],
            },
          },
        },
      })

      const emailInput = wrapper.find('input[type="email"]')
      const form = wrapper.find('form')

      const testEmail = 'test@example.com'
      await emailInput.setValue(testEmail)

      // Submit form
      await form.trigger('submit')
      await new Promise(resolve => setTimeout(resolve, 1100)) // Wait for mock API call
      await nextTick()

      // Check success toast was called
      expect(mockToastSuccess).toHaveBeenCalledWith(
        'footer.newsletter.success',
        expect.objectContaining({
          description: expect.stringContaining(testEmail),
        })
      )
    })

    it('clears email field after successful subscription', async () => {
      const wrapper = mount(AppFooter, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a><slot /></a>',
              props: ['to'],
            },
          },
        },
      })

      const emailInput = wrapper.find('input[type="email"]')
      const form = wrapper.find('form')

      await emailInput.setValue('test@example.com')
      await form.trigger('submit')
      await new Promise(resolve => setTimeout(resolve, 1100))
      await nextTick()

      // Email should be cleared
      expect((emailInput.element as HTMLInputElement).value).toBe('')
    })

    it('does not submit when email is empty', async () => {
      const wrapper = mount(AppFooter, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a><slot /></a>',
              props: ['to'],
            },
          },
        },
      })

      const form = wrapper.find('form')

      // Try to submit without email
      await form.trigger('submit')
      await nextTick()

      // Toast should not be called
      expect(mockToastSuccess).not.toHaveBeenCalled()
      expect(mockToastError).not.toHaveBeenCalled()
    })

    it('prevents double submission', async () => {
      const wrapper = mount(AppFooter, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a><slot /></a>',
              props: ['to'],
            },
          },
        },
      })

      const emailInput = wrapper.find('input[type="email"]')
      const form = wrapper.find('form')

      await emailInput.setValue('test@example.com')

      // Submit form twice quickly
      const promise1 = form.trigger('submit')
      const promise2 = form.trigger('submit')

      await Promise.all([promise1, promise2])
      await new Promise(resolve => setTimeout(resolve, 1100))
      await nextTick()

      // Should only submit once
      expect(mockToastSuccess).toHaveBeenCalledTimes(1)
    })
  })

  describe('Navigation links', () => {
    it('renders information section links', () => {
      const wrapper = mount(AppFooter, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ['to'],
            },
          },
        },
      })

      const links = wrapper.findAllComponents({ name: 'NuxtLink' })
      const linkTexts = links.map(link => link.text())

      expect(linkTexts).toContain('footer.info.about')
      expect(linkTexts).toContain('footer.info.terms')
      expect(linkTexts).toContain('footer.info.privacy')
      expect(linkTexts).toContain('footer.info.shipping')
    })

    it('renders help section links', () => {
      const wrapper = mount(AppFooter, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ['to'],
            },
          },
        },
      })

      const links = wrapper.findAllComponents({ name: 'NuxtLink' })
      const linkTexts = links.map(link => link.text())

      expect(linkTexts).toContain('footer.help.contact')
      expect(linkTexts).toContain('footer.help.faq')
      expect(linkTexts).toContain('footer.help.returns')
      expect(linkTexts).toContain('footer.help.track')
    })
  })

  describe('Accessibility', () => {
    it('has proper aria-label on email input', () => {
      const wrapper = mount(AppFooter, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a><slot /></a>',
              props: ['to'],
            },
          },
        },
      })

      const emailInput = wrapper.find('input[type="email"]')
      expect(emailInput.attributes('aria-label')).toBe('footer.newsletter.placeholder')
    })

    it('marks email field as required', () => {
      const wrapper = mount(AppFooter, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a><slot /></a>',
              props: ['to'],
            },
          },
        },
      })

      const emailInput = wrapper.find('input[type="email"]')
      expect(emailInput.attributes('required')).toBeDefined()
    })
  })
})
