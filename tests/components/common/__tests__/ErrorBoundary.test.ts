import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ErrorBoundary from '~/components/common/ErrorBoundary.vue'

describe('Common ErrorBoundary', () => {
  it('should render children when no error', () => {
    const wrapper = mount(ErrorBoundary, {
      slots: { default: '<div data-testid="child">Child Content</div>' },
    })
    expect(wrapper.text()).toContain('Child Content')
  })

  it('should not show error UI when no error', () => {
    const wrapper = mount(ErrorBoundary)
    const errorUI = wrapper.find('[data-testid="error-boundary"]')
    expect(errorUI.exists()).toBe(false)
  })

  it('should show error title', async () => {
    const wrapper = mount(ErrorBoundary, {
      props: { title: 'Custom Error Title' },
    })
    wrapper.vm.hasError = true
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Custom Error Title')
  })

  it('should show default error title', async () => {
    const wrapper = mount(ErrorBoundary)
    wrapper.vm.hasError = true
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Something went wrong')
  })

  it('should display custom message', async () => {
    const wrapper = mount(ErrorBoundary, {
      props: { message: 'Custom error message' },
    })
    wrapper.vm.hasError = true
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Custom error message')
  })

  it('should show retry button when fallbackAction provided', async () => {
    const mockAction = vi.fn()
    const wrapper = mount(ErrorBoundary, {
      props: { fallbackAction: mockAction },
    })
    wrapper.vm.hasError = true
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Retry')
  })
})
