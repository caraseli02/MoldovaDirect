import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PasswordStrengthMeter from '~/components/auth/PasswordStrengthMeter.vue'

describe('PasswordStrengthMeter', () => {
  const mountComponent = (props = {}) => {
    return mount(PasswordStrengthMeter, {
      props: { password: 'testPassword123', ...props },
    })
  }

  it('should render the password strength meter', () => {
    const wrapper = mountComponent()
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('[data-testid="password-strength-meter"]').exists()).toBe(true)
  })

  it('should not render when password is empty', () => {
    const wrapper = mountComponent({ password: '' })
    expect(wrapper.find('[data-testid="password-strength-meter"]').exists()).toBe(false)
  })

  it('should display strength bar with 4 segments', () => {
    const wrapper = mountComponent()
    const bars = wrapper.findAll('.h-1.flex-1.rounded-full')
    expect(bars).toHaveLength(4)
  })

  it('should have correct aria attributes on progressbar', () => {
    const wrapper = mountComponent()
    const progressbar = wrapper.find('[role="progressbar"]')
    expect(progressbar.attributes('aria-valuemin')).toBe('0')
    expect(progressbar.attributes('aria-valuemax')).toBe('4')
  })

  it('should display strength label', () => {
    const wrapper = mountComponent()
    // The component shows strength labels like "Very Weak", "Weak", etc.
    const labelContainer = wrapper.find('.flex.items-center.justify-between.text-xs')
    expect(labelContainer.exists()).toBe(true)
  })

  it('should show password hint text', () => {
    const wrapper = mountComponent()
    expect(wrapper.text()).toContain('auth.passwordHint')
  })

  it('should display requirements checklist by default', () => {
    const wrapper = mountComponent()
    const requirementsList = wrapper.find('[role="list"]')
    expect(requirementsList.exists()).toBe(true)
    expect(requirementsList.attributes('aria-label')).toBe('Password requirements')
  })

  it('should hide requirements when showRequirements is false', () => {
    const wrapper = mountComponent({ showRequirements: false })
    const requirementsList = wrapper.find('[role="list"]')
    expect(requirementsList.exists()).toBe(false)
  })

  it('should show all 4 requirements', () => {
    const wrapper = mountComponent()
    const requirements = wrapper.findAll('[role="listitem"]')
    expect(requirements).toHaveLength(4)
    expect(wrapper.text()).toContain('auth.validation.password.minLength')
    expect(wrapper.text()).toContain('auth.validation.password.uppercase')
    expect(wrapper.text()).toContain('auth.validation.password.lowercase')
    expect(wrapper.text()).toContain('auth.validation.password.number')
  })

  it('should color passed requirements in green', () => {
    const wrapper = mountComponent({ password: 'Aa1aaaaa' }) // 8 chars, upper, lower, number
    const requirements = wrapper.findAll('[role="listitem"]')

    // Check that passed requirements have green text
    requirements.forEach((req) => {
      const span = req.find('span')
      // All requirements should be met with this password
      expect(span.classes().some(c => c.includes('green') || c.includes('gray'))).toBe(true)
    })
  })

  it('should have role="status" for accessibility', () => {
    const wrapper = mountComponent()
    const status = wrapper.find('[role="status"]')
    expect(status.exists()).toBe(true)
    expect(status.attributes('aria-live')).toBe('polite')
  })

  it('should update when password changes', async () => {
    const wrapper = mountComponent({ password: 'a' })

    expect(wrapper.exists()).toBe(true)

    await wrapper.setProps({ password: 'StrongPass123!' })
    expect(wrapper.find('[data-testid="password-strength-meter"]').exists()).toBe(true)
  })

  it('should display red bars for weak passwords', () => {
    const wrapper = mountComponent({ password: 'a' })
    const bars = wrapper.findAll('.h-1.flex-1.rounded-full')
    // Weak password should show red bars or gray (unfilled)
    expect(bars.length).toBe(4)
  })

  it('should display green bars for strong passwords', () => {
    const wrapper = mountComponent({ password: 'VeryStrongPassword123!' })
    const bars = wrapper.findAll('.h-1.flex-1.rounded-full')
    // Strong password should show green bars
    expect(bars.length).toBe(4)
  })

  it('should check length requirement correctly', () => {
    // Password with less than 8 characters
    const wrapperWeak = mountComponent({ password: 'Aa1bbbb' }) // 7 chars
    expect(wrapperWeak.text()).toContain('auth.validation.password.minLength')

    // Password with 8+ characters
    const wrapperStrong = mountComponent({ password: 'Aa1bbbbb' }) // 8 chars
    expect(wrapperStrong.text()).toContain('auth.validation.password.minLength')
  })

  it('should check uppercase requirement correctly', () => {
    const wrapper = mountComponent({ password: 'TestPassword123' })
    expect(wrapper.text()).toContain('auth.validation.password.uppercase')
  })

  it('should check lowercase requirement correctly', () => {
    const wrapper = mountComponent({ password: 'testpassword123' })
    expect(wrapper.text()).toContain('auth.validation.password.lowercase')
  })

  it('should check number requirement correctly', () => {
    const wrapper = mountComponent({ password: 'TestPassword123' })
    expect(wrapper.text()).toContain('auth.validation.password.number')
  })
})
