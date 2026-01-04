import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Toast from '~/components/common/Toast.vue'

describe('Common Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should render toast', () => {
    const wrapper = mount(Toast, {
      props: { title: 'Test Toast' },
      attachTo: document.body,
    })
    expect(wrapper.find('[data-testid="toast"]').exists()).toBe(true)
  })

  it('should display title', () => {
    const wrapper = mount(Toast, {
      props: { title: 'Success!' },
      attachTo: document.body,
    })
    expect(wrapper.text()).toContain('Success!')
  })

  it('should show message when provided', () => {
    const wrapper = mount(Toast, {
      props: { title: 'Title', message: 'This is a message' },
      attachTo: document.body,
    })
    expect(wrapper.text()).toContain('This is a message')
  })

  it('should show success icon for success type', () => {
    const wrapper = mount(Toast, {
      props: { title: 'Success', type: 'success' },
      attachTo: document.body,
    })
    expect(wrapper.find('[data-testid="toast-type-success"]').exists()).toBe(true)
  })

  it('should show error icon for error type', () => {
    const wrapper = mount(Toast, {
      props: { title: 'Error', type: 'error' },
      attachTo: document.body,
    })
    expect(wrapper.find('[data-testid="toast-type-error"]').exists()).toBe(true)
  })

  it('should show close button', () => {
    const wrapper = mount(Toast, {
      props: { title: 'Test' },
      attachTo: document.body,
    })
    expect(wrapper.find('[data-testid="toast-close-button"]').exists()).toBe(true)
  })

  it('should emit close when close button clicked', async () => {
    const wrapper = mount(Toast, {
      props: { title: 'Test' },
      attachTo: document.body,
    })
    const closeButton = wrapper.find('[data-testid="toast-close-button"]')
    await closeButton.trigger('click')
    expect(wrapper.vm.visible).toBe(false)
  })

  it('should show action button when provided', () => {
    const wrapper = mount(Toast, {
      props: {
        title: 'Test',
        actionText: 'Undo',
        actionHandler: vi.fn(),
      },
      attachTo: document.body,
    })
    expect(wrapper.find('[data-testid="toast-action-button"]').exists()).toBe(true)
  })
})
