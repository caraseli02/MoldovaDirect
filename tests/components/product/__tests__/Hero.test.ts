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

  it('should render product hero', () => {
    const wrapper = mount(ProductHero, { props: mockProps })
    expect(wrapper.exists()).toBe(true)
  })

  it('should display seasonal badge', () => {
    const wrapper = mount(ProductHero, { props: mockProps })
    expect(wrapper.text()).toContain('Summer Collection')
  })

  it('should show title and subtitle', () => {
    const wrapper = mount(ProductHero, { props: mockProps })
    expect(wrapper.text()).toContain('Premium Wines')
    expect(wrapper.text()).toContain('Discover our curated selection')
  })

  it('should show CTA button', () => {
    const wrapper = mount(ProductHero, { props: mockProps })
    expect(wrapper.text()).toContain('Explore Now')
  })

  it('should emit scroll-to-results when CTA clicked', async () => {
    const wrapper = mount(ProductHero, { props: mockProps })
    const button = wrapper.find('button')
    await button.trigger('click')
    expect(wrapper.emitted('scroll-to-results')).toBeTruthy()
  })

  it('should show collection buttons', () => {
    const wrapper = mount(ProductHero, {
      props: {
        ...mockProps,
        collections: [
          { id: '1', label: 'Red Wines', filters: {} },
          { id: '2', label: 'White Wines', filters: {} },
        ],
      },
    })
    expect(wrapper.text()).toContain('Red Wines')
    expect(wrapper.text()).toContain('White Wines')
  })
})
