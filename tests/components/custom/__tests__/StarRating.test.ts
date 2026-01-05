import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StarRating from '~/components/custom/StarRating.vue'

describe('Custom StarRating', () => {
  it('should render star rating', () => {
    const wrapper = mount(StarRating, {
      props: { rating: 4.5 },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('should display correct number of stars', () => {
    const wrapper = mount(StarRating, {
      props: { rating: 4, max: 5 },
    })
    const stars = wrapper.findAll('.relative')
    expect(stars.length).toBe(5)
  })

  it('should show rating value when enabled', () => {
    const wrapper = mount(StarRating, {
      props: { rating: 4.5, showValue: true },
    })
    expect(wrapper.text()).toContain('4.5')
  })

  it('should display review count', () => {
    const wrapper = mount(StarRating, {
      props: { rating: 4, reviewCount: 150 },
    })
    expect(wrapper.text()).toContain('(150)')
  })

  it('should format large review counts', () => {
    const wrapper = mount(StarRating, {
      props: { rating: 5, reviewCount: 2500 },
    })
    expect(wrapper.text()).toContain('2.5K')
  })

  it('should have aria-label for accessibility', () => {
    const wrapper = mount(StarRating, {
      props: { rating: 3, max: 5 },
    })
    expect(wrapper.html()).toContain('aria-label')
    expect(wrapper.html()).toContain('Rating: 3 out of 5')
  })
})
