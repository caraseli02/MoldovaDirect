import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Toast from '~/components/common/Toast.vue'

// Mock Button component
vi.mock('@/components/ui/button', () => ({
  Button: {
    template: '<button v-bind="$attrs" @click="$emit(\'click\', $event)"><slot /></button>',
    inheritAttrs: false,
  },
}))

describe('Common Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // Clear any toasts from body
    document.body.innerHTML = ''
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    document.body.innerHTML = ''
  })

  const mountToast = (props = {}) => {
    return mount(Toast, {
      props: { title: 'Test Toast', ...props },
      attachTo: document.body,
      global: {
        stubs: {
          Teleport: {
            template: '<div><slot /></div>',
          },
          Transition: {
            template: '<div><slot /></div>',
          },
        },
      },
    })
  }

  it('should render toast', () => {
    const wrapper = mountToast()
    expect(wrapper.find('[data-testid="toast"]').exists()).toBe(true)
  })

  it('should display title', () => {
    const wrapper = mountToast({ title: 'Success!' })
    expect(wrapper.text()).toContain('Success!')
  })

  it('should show message when provided', () => {
    const wrapper = mountToast({ title: 'Title', message: 'This is a message' })
    expect(wrapper.text()).toContain('This is a message')
  })

  it('should show success icon for success type', () => {
    const wrapper = mountToast({ title: 'Success', type: 'success' })
    expect(wrapper.find('[data-testid="toast-type-success"]').exists()).toBe(true)
  })

  it('should show error icon for error type', () => {
    const wrapper = mountToast({ title: 'Error', type: 'error' })
    expect(wrapper.find('[data-testid="toast-type-error"]').exists()).toBe(true)
  })

  it('should show close button', () => {
    const wrapper = mountToast()
    expect(wrapper.find('[data-testid="toast-close-button"]').exists()).toBe(true)
  })

  it('should emit close when close button clicked', async () => {
    const wrapper = mountToast()
    const closeButton = wrapper.find('[data-testid="toast-close-button"]')
    await closeButton.trigger('click')
    expect(wrapper.vm.visible).toBe(false)
  })

  it('should show action button when provided', () => {
    const wrapper = mountToast({
      title: 'Test',
      actionText: 'Undo',
      actionHandler: vi.fn(),
    })
    expect(wrapper.find('[data-testid="toast-action-button"]').exists()).toBe(true)
  })
})
