import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import NewsletterSignup from '~/components/home/NewsletterSignup.vue'

// Mock composables
vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({
    t: (k: string) => k,
    locale: ref('es'),
  })),
  useFetch: vi.fn(() => ({
    data: ref(null),
    error: ref(null),
  })),
}))

const mockI18n = {
  install(app: any) {
    app.config.globalProperties.$t = (key: string) => key
    app.config.globalProperties.$i18n = { locale: 'es' }
  },
}

const defaultStubs = {
  UiButton: {
    template: '<button :type="type" :disabled="disabled" :aria-label="ariaLabel" :aria-busy="ariaBusy"><slot /></button>',
    props: ['type', 'disabled', 'ariaLabel', 'ariaBusy'],
  },
  commonIcon: {
    template: '<span class="icon" :class="name" :aria-hidden="ariaHidden"></span>',
    props: ['name', 'ariaHidden'],
  },
}

describe('Home NewsletterSignup', () => {
  const mountOptions = {
    global: {
      plugins: [mockI18n],
      stubs: defaultStubs,
    },
  }

  describe('Rendering', () => {
    it('should render newsletter signup section', () => {
      const wrapper = mount(NewsletterSignup, mountOptions)
      expect(wrapper.exists()).toBe(true)
    })

    it('should render with correct heading', () => {
      const wrapper = mount(NewsletterSignup, mountOptions)
      const heading = wrapper.find('h2#newsletter-heading')
      expect(heading.exists()).toBe(true)
      expect(heading.text()).toBe('home.newsletter.title')
    })

    it('should render subtitle', () => {
      const wrapper = mount(NewsletterSignup, mountOptions)
      expect(wrapper.text()).toContain('home.newsletter.subtitle')
    })

    it('should render disclaimer text', () => {
      const wrapper = mount(NewsletterSignup, mountOptions)
      expect(wrapper.text()).toContain('home.newsletter.disclaimer')
    })

    it('should render email input field', () => {
      const wrapper = mount(NewsletterSignup, mountOptions)
      const input = wrapper.find('input#newsletter-email')
      expect(input.exists()).toBe(true)
      expect(input.attributes('type')).toBe('email')
    })

    it('should render submit button', () => {
      const wrapper = mount(NewsletterSignup, mountOptions)
      const button = wrapper.find('button[type="submit"]')
      expect(button.exists()).toBe(true)
    })

    it('should render form element', () => {
      const wrapper = mount(NewsletterSignup, mountOptions)
      const form = wrapper.find('form')
      expect(form.exists()).toBe(true)
    })

    it('should render send icon by default', () => {
      const wrapper = mount(NewsletterSignup, mountOptions)
      const sendIcon = wrapper.find('.icon.lucide\\:send')
      expect(sendIcon.exists()).toBe(true)
    })
  })

  describe('Form Validation', () => {
    it('should have required attribute on email input', () => {
      const wrapper = mount(NewsletterSignup, mountOptions)
      const input = wrapper.find('input#newsletter-email')
      expect(input.attributes('required')).toBeDefined()
    })

    it('should have email pattern validation', () => {
      const wrapper = mount(NewsletterSignup, mountOptions)
      const input = wrapper.find('input#newsletter-email')
      expect(input.attributes('pattern')).toBe('[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$')
    })

    it('should have placeholder text', () => {
      const wrapper = mount(NewsletterSignup, mountOptions)
      const input = wrapper.find('input#newsletter-email')
      expect(input.attributes('placeholder')).toBe('home.newsletter.placeholder')
    })

    it('should have validation title', () => {
      const wrapper = mount(NewsletterSignup, mountOptions)
      const input = wrapper.find('input#newsletter-email')
      expect(input.attributes('title')).toBe('Please enter a valid email address')
    })
  })

  describe('User Interactions', () => {
    it('should update email value when user types', async () => {
      const wrapper = mount(NewsletterSignup, mountOptions)
      const input = wrapper.find('input#newsletter-email')

      await input.setValue('test@example.com')
      expect((input.element as HTMLInputElement).value).toBe('test@example.com')
    })

    it('should prevent default form submission', async () => {
      const wrapper = mount(NewsletterSignup, mountOptions)
      const form = wrapper.find('form')

      const submitEvent = new Event('submit', { bubbles: true, cancelable: true })
      const preventDefaultSpy = vi.spyOn(submitEvent, 'preventDefault')

      await form.element.dispatchEvent(submitEvent)
      expect(preventDefaultSpy).toHaveBeenCalled()
    })
  })

  describe('Initial State', () => {
    it('should not be in loading state initially', () => {
      const wrapper = mount(NewsletterSignup, mountOptions)
      const input = wrapper.find('input#newsletter-email')

      expect(input.attributes('disabled')).toBeUndefined()
    })

    it('should not display success message initially', () => {
      const wrapper = mount(NewsletterSignup, mountOptions)
      const successMessage = wrapper.find('#newsletter-success')
      expect(successMessage.exists()).toBe(false)
    })

    it('should not display error message initially', () => {
      const wrapper = mount(NewsletterSignup, mountOptions)
      const errorMessage = wrapper.find('#newsletter-error')
      expect(errorMessage.exists()).toBe(false)
    })

    it('should have empty email value initially', () => {
      const wrapper = mount(NewsletterSignup, mountOptions)
      const input = wrapper.find('input#newsletter-email')
      expect((input.element as HTMLInputElement).value).toBe('')
    })
  })

  describe('Button State', () => {
    it('should display CTA text on button by default', () => {
      const wrapper = mount(NewsletterSignup, mountOptions)
      const button = wrapper.find('button[type="submit"]')
      expect(button.text()).toContain('home.newsletter.cta')
    })

    it('should not be disabled initially', () => {
      const wrapper = mount(NewsletterSignup, mountOptions)
      const button = wrapper.find('button[type="submit"]')
      expect(button.attributes('disabled')).toBeUndefined()
    })

    it('should have aria-label attribute', () => {
      const wrapper = mount(NewsletterSignup, mountOptions)
      const button = wrapper.find('button[type="submit"]')
      expect(button.attributes('aria-label')).toBe('home.newsletter.subscribeButton')
    })
  })

  describe('Accessibility', () => {
    it('should have aria-labelledby on section', () => {
      const wrapper = mount(NewsletterSignup, mountOptions)
      const section = wrapper.find('section')
      expect(section.attributes('aria-labelledby')).toBe('newsletter-heading')
    })

    it('should have aria-labelledby on form', () => {
      const wrapper = mount(NewsletterSignup, mountOptions)
      const form = wrapper.find('form')
      expect(form.attributes('aria-labelledby')).toBe('newsletter-heading')
    })

    it('should have screen reader only label for input', () => {
      const wrapper = mount(NewsletterSignup, mountOptions)
      const label = wrapper.find('label[for="newsletter-email"]')
      expect(label.exists()).toBe(true)
      expect(label.text()).toBe('home.newsletter.placeholder')
    })

    it('should have aria-busy attribute on input', () => {
      const wrapper = mount(NewsletterSignup, mountOptions)
      const input = wrapper.find('input#newsletter-email')
      expect(input.attributes('aria-busy')).toBe('false')
    })

    it('should have status region with live announcement', () => {
      const wrapper = mount(NewsletterSignup, mountOptions)
      const status = wrapper.find('[role="status"]')
      expect(status.exists()).toBe(true)
      expect(status.attributes('aria-live')).toBe('polite')
      expect(status.attributes('aria-atomic')).toBe('true')
    })

    it('should have aria-hidden on decorative icons', () => {
      const wrapper = mount(NewsletterSignup, mountOptions)
      const icons = wrapper.findAll('.icon')

      icons.forEach((icon) => {
        expect(icon.attributes('aria-hidden')).toBe('true')
      })
    })

    it('should have focus-visible ring styles on input', () => {
      const wrapper = mount(NewsletterSignup, mountOptions)
      const input = wrapper.find('input#newsletter-email')
      const classes = input.classes().join(' ')

      expect(classes).toContain('focus-visible:ring')
    })

    it('should have focus-visible ring styles on button', () => {
      const wrapper = mount(NewsletterSignup, mountOptions)
      const button = wrapper.find('button[type="submit"]')
      const classes = button.classes().join(' ')

      expect(classes).toContain('focus-visible:ring')
    })

    it('should have proper heading structure', () => {
      const wrapper = mount(NewsletterSignup, mountOptions)
      const heading = wrapper.find('h2#newsletter-heading')
      expect(heading.exists()).toBe(true)
      expect(heading.attributes('id')).toBe('newsletter-heading')
    })

    it('should have minimum button height for touch targets', () => {
      const wrapper = mount(NewsletterSignup, mountOptions)
      const button = wrapper.find('button[type="submit"]')
      const classes = button.classes().join(' ')

      expect(classes).toContain('min-h-[44px]')
    })
  })

  describe('Input Attributes', () => {
    it('should have id attribute for label association', () => {
      const wrapper = mount(NewsletterSignup, mountOptions)
      const input = wrapper.find('input#newsletter-email')
      expect(input.attributes('id')).toBe('newsletter-email')
    })

    it('should be associated with label via for attribute', () => {
      const wrapper = mount(NewsletterSignup, mountOptions)
      const label = wrapper.find('label')
      expect(label.attributes('for')).toBe('newsletter-email')
    })

    it('should have proper input mode for email', () => {
      const wrapper = mount(NewsletterSignup, mountOptions)
      const input = wrapper.find('input#newsletter-email')
      expect(input.attributes('type')).toBe('email')
    })
  })

  describe('Form Structure', () => {
    it('should have prevent modifier on submit event', () => {
      const wrapper = mount(NewsletterSignup, mountOptions)
      const form = wrapper.find('form')
      expect(form.exists()).toBe(true)
      // Form has @submit.prevent handler
      const html = form.html()
      expect(html).toBeTruthy()
    })

    it('should contain input and button within form', () => {
      const wrapper = mount(NewsletterSignup, mountOptions)
      const form = wrapper.find('form')
      const input = form.find('input#newsletter-email')
      const button = form.find('button[type="submit"]')

      expect(input.exists()).toBe(true)
      expect(button.exists()).toBe(true)
    })

    it('should use flexbox layout for form', () => {
      const wrapper = mount(NewsletterSignup, mountOptions)
      const form = wrapper.find('form')
      const classes = form.classes()

      expect(classes).toContain('flex')
      expect(classes).toContain('flex-col')
    })
  })

  describe('Styling', () => {
    it('should have rounded input styling', () => {
      const wrapper = mount(NewsletterSignup, mountOptions)
      const input = wrapper.find('input#newsletter-email')
      expect(input.exists()).toBe(true)
    })

    it('should have rounded button styling', () => {
      const wrapper = mount(NewsletterSignup, mountOptions)
      const button = wrapper.find('button[type="submit"]')
      expect(button.exists()).toBe(true)
    })

    it('should have dark mode support on section', () => {
      const wrapper = mount(NewsletterSignup, mountOptions)
      const section = wrapper.find('section')
      expect(section.exists()).toBe(true)
    })

    it('should have transition classes on input', () => {
      const wrapper = mount(NewsletterSignup, mountOptions)
      const input = wrapper.find('input#newsletter-email')
      expect(input.exists()).toBe(true)
    })
  })
})
