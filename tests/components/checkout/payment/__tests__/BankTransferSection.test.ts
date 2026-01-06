import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { VueWrapper } from '@vue/test-utils'
import { mount, flushPromises } from '@vue/test-utils'
import BankTransferSection from '~/components/checkout/payment/BankTransferSection.vue'

// Mock useToast composable
const mockToastSuccess = vi.fn()
const mockToastInfo = vi.fn()

vi.mock('~/composables/useToast', () => ({
  useToast: () => ({
    success: mockToastSuccess,
    error: vi.fn(),
    info: mockToastInfo,
    warning: vi.fn(),
    dismiss: vi.fn(),
    toast: vi.fn(),
  }),
}))

// Mock navigator.clipboard
const mockWriteText = vi.fn()

describe('BankTransferSection', () => {
  const defaultProps = {
    modelValue: {
      reference: '',
    },
  }

  const mountComponent = (props = {}, options = {}): VueWrapper => {
    return mount(BankTransferSection, {
      props: { ...defaultProps, ...props },
      global: {
        stubs: {
          Button: {
            template: '<button type="button" :aria-label="$attrs[\'aria-label\']" @click="$emit(\'click\', $event)"><slot /></button>',
            inheritAttrs: false,
          },
          commonIcon: {
            template: '<span :class="name" data-testid="icon" :data-icon-name="name"></span>',
            props: ['name'],
          },
        },
      },
      ...options,
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Reset clipboard mock
    mockWriteText.mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: mockWriteText,
      },
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Rendering', () => {
    it('should render the bank transfer section', () => {
      const wrapper = mountComponent()
      expect(wrapper.exists()).toBe(true)
    })

    it('should render bank building icon', () => {
      const wrapper = mountComponent()
      const icons = wrapper.findAll('[data-testid="icon"]')
      const buildingIcon = icons.find(icon => icon.attributes('data-icon-name') === 'lucide:building-2')
      expect(buildingIcon).toBeTruthy()
    })

    it('should render bank transfer title', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('checkout.payment.bankTransfer.title')
    })

    it('should render bank transfer description', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('checkout.payment.bankTransfer.description')
    })
  })

  describe('Bank details display', () => {
    it('should render bank details section heading', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('checkout.payment.bankDetails')
    })

    it('should display bank name', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('checkout.payment.bankName')
      expect(wrapper.text()).toContain('Banca Transilvania')
    })

    it('should display account holder', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('checkout.payment.accountHolder')
      expect(wrapper.text()).toContain('Moldovan Products SRL')
    })

    it('should display IBAN', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('checkout.payment.iban')
      expect(wrapper.text()).toContain('RO49 AAAA 1B31 0075 9384 0000')
    })

    it('should display SWIFT code', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('checkout.payment.swift')
      expect(wrapper.text()).toContain('BTRLRO22')
    })

    it('should use monospace font for bank details values', () => {
      const wrapper = mountComponent()
      const monoElements = wrapper.findAll('.font-mono')
      expect(monoElements.length).toBeGreaterThan(0)
    })
  })

  describe('Reference number display', () => {
    it('should display reference label', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('checkout.payment.reference')
    })

    it('should display provided reference from props', () => {
      const wrapper = mountComponent({
        modelValue: { reference: 'TEST-REF-123' },
      })
      expect(wrapper.text()).toContain('TEST-REF-123')
    })

    it('should generate reference if not provided', () => {
      const wrapper = mountComponent({
        modelValue: { reference: '' },
      })
      // Should contain ORDER- prefix for generated reference
      expect(wrapper.text()).toMatch(/ORDER-\d+/)
    })

    it('should generate reference with ORDER- prefix and timestamp', () => {
      const wrapper = mountComponent()
      const html = wrapper.html()
      // Check for ORDER- prefix in the generated reference
      expect(html).toMatch(/ORDER-\d{8}/)
    })
  })

  describe('Copy button functionality', () => {
    it('should render copy button', () => {
      const wrapper = mountComponent()
      const copyButton = wrapper.find('button')
      expect(copyButton.exists()).toBe(true)
    })

    it('should have copy button text', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('checkout.payment.copyDetails')
    })

    it('should have proper aria-label on copy button', () => {
      const wrapper = mountComponent()
      const copyButton = wrapper.find('button')
      expect(copyButton.attributes('aria-label')).toBe('checkout.payment.copyBankDetails')
    })

    it('should render clipboard icon in copy button', () => {
      const wrapper = mountComponent()
      const icons = wrapper.findAll('[data-testid="icon"]')
      const clipboardIcon = icons.find(icon => icon.attributes('data-icon-name') === 'lucide:clipboard-list')
      expect(clipboardIcon).toBeTruthy()
    })

    it('should copy bank details to clipboard when clicked', async () => {
      const wrapper = mountComponent({
        modelValue: { reference: 'TEST-123' },
      })
      const copyButton = wrapper.find('button')

      await copyButton.trigger('click')
      await flushPromises()

      expect(mockWriteText).toHaveBeenCalled()
      const copiedText = mockWriteText.mock.calls[0][0]
      expect(copiedText).toContain('Bank: Banca Transilvania')
      expect(copiedText).toContain('Account Holder: Moldovan Products SRL')
      expect(copiedText).toContain('IBAN: RO49 AAAA 1B31 0075 9384 0000')
      expect(copiedText).toContain('SWIFT: BTRLRO22')
      expect(copiedText).toContain('Reference: TEST-123')
    })

    it('should show success toast on successful copy', async () => {
      const wrapper = mountComponent()
      const copyButton = wrapper.find('button')

      await copyButton.trigger('click')
      await flushPromises()

      expect(mockToastSuccess).toHaveBeenCalledWith('checkout.payment.bankDetailsCopied')
    })

    it('should show info toast when copy fails', async () => {
      mockWriteText.mockRejectedValue(new Error('Copy failed'))

      const wrapper = mountComponent()
      const copyButton = wrapper.find('button')

      await copyButton.trigger('click')
      await flushPromises()

      expect(mockToastInfo).toHaveBeenCalledWith('checkout.payment.bankDetailsCopyFailed')
    })

    it('should handle missing clipboard API gracefully', async () => {
      // Remove clipboard API
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        writable: true,
        configurable: true,
      })

      const wrapper = mountComponent()
      const copyButton = wrapper.find('button')

      await copyButton.trigger('click')
      await flushPromises()

      expect(mockToastInfo).toHaveBeenCalledWith('checkout.payment.bankDetailsCopyFailed')
    })
  })

  describe('Bank transfer instructions', () => {
    it('should render instructions section with alert role', () => {
      const wrapper = mountComponent()
      const alertSection = wrapper.find('[role="alert"]')
      expect(alertSection.exists()).toBe(true)
    })

    it('should render instructions heading', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('checkout.payment.bankTransferInstructions')
    })

    it('should render all 3 instruction items', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('checkout.payment.bankInstruction1')
      expect(wrapper.text()).toContain('checkout.payment.bankInstruction2')
      expect(wrapper.text()).toContain('checkout.payment.bankInstruction3')
    })

    it('should render instructions in a list', () => {
      const wrapper = mountComponent()
      const list = wrapper.find('ul[role="list"]')
      expect(list.exists()).toBe(true)

      const listItems = list.findAll('li')
      expect(listItems.length).toBe(3)
    })

    it('should render warning icon in instructions', () => {
      const wrapper = mountComponent()
      const icons = wrapper.findAll('[data-testid="icon"]')
      const warningIcon = icons.find(icon => icon.attributes('data-icon-name') === 'lucide:alert-triangle')
      expect(warningIcon).toBeTruthy()
    })
  })

  describe('emit update:modelValue on mount', () => {
    it('should emit update:modelValue with reference on mount', async () => {
      const wrapper = mountComponent()
      await flushPromises()

      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted).toBeTruthy()
      expect(emitted![0][0]).toHaveProperty('reference')
    })

    it('should emit generated reference if not provided', async () => {
      const wrapper = mountComponent()
      await flushPromises()

      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted).toBeTruthy()
      const emittedValue = emitted![0][0] as { reference: string }
      expect(emittedValue.reference).toMatch(/ORDER-\d+/)
    })

    it('should emit provided reference from props', async () => {
      const wrapper = mountComponent({
        modelValue: { reference: 'CUSTOM-REF-456' },
      })
      await flushPromises()

      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted).toBeTruthy()
      const emittedValue = emitted![0][0] as { reference: string }
      expect(emittedValue.reference).toBe('CUSTOM-REF-456')
    })
  })

  describe('Styling', () => {
    it('should have centered header section', () => {
      const wrapper = mountComponent()
      const centeredSection = wrapper.find('.text-center.py-8')
      expect(centeredSection.exists()).toBe(true)
    })

    it('should have gray background for bank details section', () => {
      const wrapper = mountComponent()
      const bankDetailsSection = wrapper.find('.bg-gray-50')
      expect(bankDetailsSection.exists()).toBe(true)
    })

    it('should have yellow background for instructions section', () => {
      const wrapper = mountComponent()
      const instructionsSection = wrapper.find('.bg-yellow-50')
      expect(instructionsSection.exists()).toBe(true)
    })

    it('should have proper spacing', () => {
      const wrapper = mountComponent()
      const mainContainer = wrapper.find('.space-y-4')
      expect(mainContainer.exists()).toBe(true)
    })

    it('should have copy button inside bank details container', () => {
      const wrapper = mountComponent()
      // The copy button should be inside the bank details section
      const bankDetailsSection = wrapper.find('.bg-gray-50')
      const copyButton = bankDetailsSection.find('button')
      expect(copyButton.exists()).toBe(true)
    })
  })

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      const wrapper = mountComponent()
      const h3Elements = wrapper.findAll('h3')
      const h4Elements = wrapper.findAll('h4')

      expect(h3Elements.length).toBeGreaterThanOrEqual(1)
      expect(h4Elements.length).toBeGreaterThanOrEqual(1)
    })

    it('should use role="alert" for important instructions', () => {
      const wrapper = mountComponent()
      const alert = wrapper.find('[role="alert"]')
      expect(alert.exists()).toBe(true)
    })

    it('should use role="list" for instructions list', () => {
      const wrapper = mountComponent()
      const list = wrapper.find('[role="list"]')
      expect(list.exists()).toBe(true)
    })

    it('should have aria-hidden on decorative icons', () => {
      const wrapper = mountComponent()
      expect(wrapper.html()).toContain('aria-hidden')
    })

    it('should have accessible copy button with aria-label', () => {
      const wrapper = mountComponent()
      const button = wrapper.find('button')
      expect(button.attributes('aria-label')).toBeTruthy()
    })

    it('should have inline button content for copy action', () => {
      const wrapper = mountComponent()
      // The copy button should contain icon and text as inline elements
      const copyButton = wrapper.find('button')
      expect(copyButton.exists()).toBe(true)
      expect(copyButton.text()).toContain('checkout.payment.copyDetails')
    })
  })

  describe('Error handling', () => {
    it('should handle clipboard writeText rejection gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockWriteText.mockRejectedValue(new Error('Clipboard permission denied'))

      const wrapper = mountComponent()
      const copyButton = wrapper.find('button')

      await copyButton.trigger('click')
      await flushPromises()

      // Should not throw, should show info toast instead
      expect(mockToastInfo).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('should not crash if modelValue is undefined', () => {
      // Should handle gracefully by generating a reference
      const wrapper = mount(BankTransferSection, {
        props: {},
        global: {
          stubs: {
            Button: {
              template: '<button><slot /></button>',
            },
            commonIcon: {
              template: '<span data-testid="icon"></span>',
            },
          },
        },
      })

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.text()).toMatch(/ORDER-\d+/)
    })
  })
})
