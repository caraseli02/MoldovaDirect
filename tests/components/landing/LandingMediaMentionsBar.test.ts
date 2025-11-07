import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import LandingMediaMentionsBar from '~/components/landing/LandingMediaMentionsBar.vue'

// Mock Nuxt Image component
vi.mock('#components', () => ({
  NuxtImg: {
    name: 'NuxtImg',
    template: '<img v-bind="$attrs" />',
    props: ['src', 'alt', 'width', 'height', 'loading']
  }
}))

describe('LandingMediaMentionsBar', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        landing: {
          mediaMentions: {
            heading: 'As Featured In'
          }
        }
      }
    }
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the component', () => {
    const wrapper = mount(LandingMediaMentionsBar, {
      global: {
        plugins: [i18n]
      }
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('displays the heading from i18n', () => {
    const wrapper = mount(LandingMediaMentionsBar, {
      global: {
        plugins: [i18n]
      }
    })

    expect(wrapper.text()).toContain('As Featured In')
  })

  it('renders all press logo links', () => {
    const wrapper = mount(LandingMediaMentionsBar, {
      global: {
        plugins: [i18n]
      }
    })

    const links = wrapper.findAll('a')
    // We have 5 mentions × 2 sets (for seamless loop) = 10 links total
    expect(links.length).toBe(10)
  })

  it('sets correct accessibility attributes', () => {
    const wrapper = mount(LandingMediaMentionsBar, {
      global: {
        plugins: [i18n]
      }
    })

    const firstLink = wrapper.find('a')
    expect(firstLink.attributes('target')).toBe('_blank')
    expect(firstLink.attributes('rel')).toBe('noopener noreferrer')
    expect(firstLink.attributes('aria-label')).toContain('Read article on')
  })

  it('applies animation duration from props', () => {
    const wrapper = mount(LandingMediaMentionsBar, {
      props: {
        duration: 20
      },
      global: {
        plugins: [i18n]
      }
    })

    const carouselTrack = wrapper.find('.animate-scroll')
    expect(carouselTrack.attributes('style')).toContain('20s')
  })

  it('uses default duration when not provided', () => {
    const wrapper = mount(LandingMediaMentionsBar, {
      global: {
        plugins: [i18n]
      }
    })

    const carouselTrack = wrapper.find('.animate-scroll')
    expect(carouselTrack.attributes('style')).toContain('30s')
  })

  it('second set of logos has aria-hidden', () => {
    const wrapper = mount(LandingMediaMentionsBar, {
      global: {
        plugins: [i18n]
      }
    })

    const containers = wrapper.findAll('.flex-shrink-0')
    // Second half should have aria-hidden parent
    const secondHalf = containers.slice(5)
    secondHalf.forEach(container => {
      expect(container.attributes('aria-hidden')).toBe('true')
    })
  })

  it('second set links have tabindex -1', () => {
    const wrapper = mount(LandingMediaMentionsBar, {
      global: {
        plugins: [i18n]
      }
    })

    const links = wrapper.findAll('a')
    // Second half of links (duplicate set)
    const secondHalfLinks = links.slice(5)
    secondHalfLinks.forEach(link => {
      expect(link.attributes('tabindex')).toBe('-1')
    })
  })

  it('renders with correct CSS classes for styling', () => {
    const wrapper = mount(LandingMediaMentionsBar, {
      global: {
        plugins: [i18n]
      }
    })

    expect(wrapper.find('.media-mentions-bar').exists()).toBe(true)
    expect(wrapper.find('.mentions-carousel').exists()).toBe(true)
    expect(wrapper.find('.animate-scroll').exists()).toBe(true)
  })

  it('applies grayscale filter that removes on hover', () => {
    const wrapper = mount(LandingMediaMentionsBar, {
      global: {
        plugins: [i18n]
      }
    })

    const link = wrapper.find('a')
    expect(link.classes()).toContain('grayscale')
    expect(link.classes()).toContain('hover:grayscale-0')
  })
})
