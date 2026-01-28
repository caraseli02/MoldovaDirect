import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AuthProgressIndicator from '~/components/auth/AuthProgressIndicator.vue'

describe('AuthProgressIndicator', () => {
  const defaultProps = {
    currentStep: 1,
    totalSteps: 3,
    stepLabels: ['Email', 'Password', 'Confirm'],
  }

  const mountComponent = (props = {}) => {
    return mount(AuthProgressIndicator, {
      props: { ...defaultProps, ...props },
    })
  }

  it('should render the progress indicator', () => {
    const wrapper = mountComponent()
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('[role="progressbar"]').exists()).toBe(true)
  })

  it('should display correct aria attributes', () => {
    const wrapper = mountComponent({ currentStep: 2, totalSteps: 4 })
    const progressbar = wrapper.find('[role="progressbar"]')

    expect(progressbar.attributes('aria-valuenow')).toBe('2')
    expect(progressbar.attributes('aria-valuemin')).toBe('1')
    expect(progressbar.attributes('aria-valuemax')).toBe('4')
  })

  it('should render correct number of step circles', () => {
    const wrapper = mountComponent({ totalSteps: 4 })
    const stepCircles = wrapper.findAll('.w-8.h-8.rounded-full')
    expect(stepCircles).toHaveLength(4)
  })

  it('should display step labels', () => {
    const labels = ['Step 1', 'Step 2', 'Step 3']
    const wrapper = mountComponent({ stepLabels: labels })

    labels.forEach((label) => {
      expect(wrapper.text()).toContain(label)
    })
  })

  it('should show checkmark for completed steps', () => {
    const wrapper = mountComponent({ currentStep: 3, totalSteps: 3 })
    // Completed steps (1 and 2) should have checkmark SVG
    const svgs = wrapper.findAll('svg')
    expect(svgs.length).toBeGreaterThanOrEqual(2)
  })

  it('should show step number for current and future steps', () => {
    const wrapper = mountComponent({ currentStep: 2, totalSteps: 3 })
    // Step 2 should show "2", step 3 should show "3"
    expect(wrapper.text()).toContain('2')
    expect(wrapper.text()).toContain('3')
  })

  it('should apply primary color classes to current step', () => {
    const wrapper = mountComponent({ currentStep: 2 })
    const stepCircles = wrapper.findAll('.w-8.h-8.rounded-full')
    // Current step (index 1) should have primary color
    expect(stepCircles[1]?.classes()).toContain('bg-slate-600')
    expect(stepCircles[1]?.classes()).toContain('border-slate-600')
  })

  it('should apply primary color to completed step connector', () => {
    const wrapper = mountComponent({ currentStep: 2 })
    const connectors = wrapper.findAll('.h-0\\.5')
    // First connector should be primary (completed)
    expect(connectors[0]?.classes()).toContain('bg-slate-600')
  })

  it('should apply gray color to future step connectors', () => {
    const wrapper = mountComponent({ currentStep: 1, totalSteps: 3 })
    const connectors = wrapper.findAll('.h-0\\.5')
    // Both connectors should be gray (future)
    connectors.forEach((connector) => {
      expect(connector.classes()).toContain('bg-gray-200')
    })
  })

  it('should highlight current step label', () => {
    const wrapper = mountComponent({ currentStep: 2 })
    const labels = wrapper.findAll('.text-center.flex-1')
    // Current step label should have primary color
    expect(labels[1]?.classes()).toContain('text-slate-600')
    expect(labels[1]?.classes()).toContain('font-medium')
  })

  it('should mark completed step labels with green', () => {
    const wrapper = mountComponent({ currentStep: 3 })
    const labels = wrapper.findAll('.text-center.flex-1')
    // Steps 1 and 2 are completed, should have green color
    expect(labels[0]?.classes()).toContain('text-green-600')
    expect(labels[1]?.classes()).toContain('text-green-600')
  })

  it('should include screen reader only progress announcement', () => {
    const wrapper = mountComponent()
    const srOnly = wrapper.find('.sr-only[aria-live="polite"]')
    expect(srOnly.exists()).toBe(true)
    expect(srOnly.attributes('aria-atomic')).toBe('true')
  })

  it('should accept context prop', () => {
    const wrapper = mountComponent({ context: 'register' })
    expect(wrapper.exists()).toBe(true)
  })

  it('should handle single step', () => {
    const wrapper = mountComponent({
      currentStep: 1,
      totalSteps: 1,
      stepLabels: ['Only Step'],
    })
    const stepCircles = wrapper.findAll('.w-8.h-8.rounded-full')
    expect(stepCircles).toHaveLength(1)
    expect(wrapper.text()).toContain('Only Step')
  })

  it('should handle first step as current', () => {
    const wrapper = mountComponent({ currentStep: 1 })
    const stepCircles = wrapper.findAll('.w-8.h-8.rounded-full')
    // First step should have primary color
    expect(stepCircles[0]?.classes()).toContain('bg-slate-600')
    // Should show step number, not checkmark
    expect(wrapper.text()).toContain('1')
  })

  it('should handle last step as current', () => {
    const wrapper = mountComponent({ currentStep: 3, totalSteps: 3 })
    // All previous steps should be completed (checkmarks)
    const svgs = wrapper.findAll('svg')
    expect(svgs.length).toBeGreaterThanOrEqual(2)
  })
})
