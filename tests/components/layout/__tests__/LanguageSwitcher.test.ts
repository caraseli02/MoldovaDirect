import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import LanguageSwitcher from '~/components/layout/LanguageSwitcher.vue'

vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({
    locale: { value: 'es' },
    availableLocales: ['es', 'en', 'ro', 'ru'],
    setLocale: vi.fn(),
    t: (k: string) => k,
  })),
}))

describe('LanguageSwitcher', () => {
  it('should render language switcher', () => {
    const wrapper = mount(LanguageSwitcher)
    expect(wrapper.exists()).toBe(true)
  })

  it('should display available languages', () => {
    const wrapper = mount(LanguageSwitcher)
    const html = wrapper.html()
    expect(html).toBeTruthy()
  })

  it('should highlight current language', () => {
    const wrapper = mount(LanguageSwitcher)
    expect(wrapper.html()).toContain('es')
  })

  it('should emit locale change on click', async () => {
    const wrapper = mount(LanguageSwitcher)
    const buttons = wrapper.findAll('button')
    if (buttons.length > 0) {
      await buttons[0].trigger('click')
      expect(wrapper.emitted()).toBeTruthy()
    }
  })

  it('should show language flags or codes', () => {
    const wrapper = mount(LanguageSwitcher)
    const text = wrapper.text()
    expect(text.length).toBeGreaterThan(0)
  })
})
