import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProductHero from '~/components/product/Hero.vue'

describe('Product Hero', () => {
  const mockProps = {
    seasonalBadge: 'Summer Collection',
    title: 'Premium Wines',
    subtitle: 'Discover our curated selection',
    ctaText: 'Explore Now',
    collections: [],
  }

  // Custom stubs for UI components
  const stubs = {
    UiButton: {
      template: '<button type="button" @click="$emit(\'click\')"><slot /></button>',
      props: ['type', 'variant', 'class'],
    },
  }

  const mountComponent = (props = {}) => {
    return mount(ProductHero, {
      props: { ...mockProps, ...props },
      global: {
        stubs,
        directives: {
          motion: {},
        },
      },
    })
  }

  it('should render product hero', () => {
    const wrapper = mountComponent()
    expect(wrapper.exists()).toBe(true)
  })

  it('should display seasonal badge', () => {
    const wrapper = mountComponent()
    expect(wrapper.text()).toContain('Summer Collection')
  })

  it('should show title and subtitle', () => {
    const wrapper = mountComponent()
    expect(wrapper.text()).toContain('Premium Wines')
    expect(wrapper.text()).toContain('Discover our curated selection')
  })

  it('should show CTA button', () => {
    const wrapper = mountComponent()
    expect(wrapper.text()).toContain('Explore Now')
  })

  it('should emit scroll-to-results when CTA clicked', async () => {
    const wrapper = mountComponent()
    const button = wrapper.find('button')
    await button.trigger('click')
    expect(wrapper.emitted('scroll-to-results')).toBeTruthy()
  })

  it('should show collection buttons', () => {
    const wrapper = mountComponent({
      collections: [
        { id: '1', label: 'Red Wines', filters: {} },
        { id: '2', label: 'White Wines', filters: {} },
      ],
    })
    expect(wrapper.text()).toContain('Red Wines')
    expect(wrapper.text()).toContain('White Wines')
  })
})
