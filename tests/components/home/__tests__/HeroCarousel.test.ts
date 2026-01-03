import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import HeroCarousel from '~/components/home/HeroCarousel.vue'

vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({ t: (k: string) => k })),
  useLocalePath: vi.fn(() => (path: string) => path),
}))

vi.mock('vue3-carousel', () => ({
  Carousel: {
    name: 'Carousel',
    template: '<div class="carousel"><slot /></div>',
  },
  Slide: {
    name: 'Slide',
    template: '<div class="slide"><slot /></div>',
  },
}))

describe('Home HeroCarousel', () => {
  it('should render hero carousel', () => {
    const wrapper = mount(HeroCarousel)
    expect(wrapper.exists()).toBe(true)
  })

  it('should display carousel slides', () => {
    const wrapper = mount(HeroCarousel)
    const slides = wrapper.findAll('.slide')
    expect(slides.length).toBeGreaterThan(0)
  })

  it('should have navigation dots', () => {
    const wrapper = mount(HeroCarousel)
    const dots = wrapper.findAll('button[role="tab"]')
    expect(dots.length).toBeGreaterThan(0)
  })

  it('should have aria-label for accessibility', () => {
    const wrapper = mount(HeroCarousel)
    const region = wrapper.find('[role="region"]')
    expect(region.attributes('aria-label')).toBe('Product carousel')
  })

  it('should render slide images', () => {
    const wrapper = mount(HeroCarousel)
    const images = wrapper.findAll('img')
    expect(images.length).toBeGreaterThan(0)
  })

  it('should display slide titles', () => {
    const wrapper = mount(HeroCarousel)
    const titles = wrapper.findAll('h2')
    expect(titles.length).toBeGreaterThan(0)
  })
})
