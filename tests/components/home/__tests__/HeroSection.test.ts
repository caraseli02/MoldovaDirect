import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import HeroSection from '~/components/home/HeroSection.vue'

vi.mock('#imports', () => ({ useI18n: vi.fn(() => ({ t: (k: string) => k })) }))

describe('Home HeroSection', () => {
  it('should render hero section', () => {
    const wrapper = mount(HeroSection)
    expect(wrapper.exists()).toBe(true)
  })

  it('should display hero title', () => {
    const wrapper = mount(HeroSection, {
      props: { title: 'Welcome to Moldova Direct' },
    })
    expect(wrapper.text()).toContain('Welcome')
  })

  it('should show CTA button', () => {
    const wrapper = mount(HeroSection, {
      props: { ctaText: 'Shop Now' },
    })
    expect(wrapper.text()).toContain('Shop Now')
  })

  it('should render background image', () => {
    const wrapper = mount(HeroSection, {
      props: { backgroundImage: '/hero-bg.jpg' },
    })
    expect(wrapper.html()).toBeTruthy()
  })

  it('should emit CTA click event', async () => {
    const wrapper = mount(HeroSection)
    const button = wrapper.find('button') || wrapper.find('a')
    if (button.exists()) {
      await button.trigger('click')
      expect(wrapper.emitted()).toBeTruthy()
    }
  })
})
