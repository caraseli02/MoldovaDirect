import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import LandingProductCarousel from '@/components/landing/LandingProductCarousel.vue'

// Mock Embla Carousel
vi.mock('embla-carousel-vue', () => ({
  default: () => [
    { value: null },
    {
      value: {
        scrollPrev: vi.fn(),
        scrollNext: vi.fn(),
        scrollTo: vi.fn(),
        selectedScrollSnap: () => 0,
        canScrollPrev: () => false,
        canScrollNext: () => true,
        scrollSnapList: () => [0, 1, 2],
        on: vi.fn(),
        destroy: vi.fn()
      }
    }
  ]
}))

describe('LandingProductCarousel', () => {
  const createWrapper = () => {
    return mount(LandingProductCarousel, {
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :href="to"><slot /></a>',
            props: ['to']
          },
          NuxtImg: {
            template: '<img :src="src" :alt="alt" />',
            props: ['src', 'alt', 'width', 'height', 'format', 'quality', 'loading']
          },
          commonIcon: {
            template: '<span class="icon" />',
            props: ['name']
          },
          LandingProductCard: {
            template: '<div class="product-card"><slot /></div>',
            props: ['product']
          }
        },
        mocks: {
          $t: (key: string) => {
            const translations: Record<string, string> = {
              'landing.products.heading': 'Curated Collection',
              'landing.products.subheading': 'Discover our hand-picked selection',
              'landing.products.viewAllCta': 'View All Products',
              'common.previous': 'Previous',
              'common.next': 'Next'
            }
            return translations[key] || key
          },
          localePath: (path: string) => path
        }
      }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders component correctly', () => {
    const wrapper = createWrapper()
    expect(wrapper.exists()).toBe(true)
  })

  it('displays section heading and subheading', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('Curated Collection')
    expect(wrapper.text()).toContain('Discover our hand-picked selection')
  })

  it('renders featured products', () => {
    const wrapper = createWrapper()
    // Should have 5 products in mock data
    const productCards = wrapper.findAllComponents({ name: 'LandingProductCard' })
    expect(productCards.length).toBeGreaterThan(0)
  })

  it('renders navigation arrows on desktop', () => {
    const wrapper = createWrapper()
    const arrows = wrapper.findAll('button[aria-label="Previous"], button[aria-label="Next"]')
    expect(arrows.length).toBeGreaterThan(0)
  })

  it('renders pagination dots', () => {
    const wrapper = createWrapper()
    const dots = wrapper.findAll('[role="tab"]')
    expect(dots.length).toBeGreaterThan(0)
  })

  it('renders view all CTA button', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('View All Products')
  })

  it('carousel navigation buttons have proper ARIA labels', () => {
    const wrapper = createWrapper()
    const buttons = wrapper.findAll('button')
    const hasAriaLabels = buttons.some(button =>
      button.attributes('aria-label')?.includes('Previous') ||
      button.attributes('aria-label')?.includes('Next') ||
      button.attributes('aria-label')?.includes('slide')
    )
    expect(hasAriaLabels).toBe(true)
  })

  it('pagination has proper role attributes', () => {
    const wrapper = createWrapper()
    const tablist = wrapper.find('[role="tablist"]')
    expect(tablist.exists()).toBe(true)

    const tabs = wrapper.findAll('[role="tab"]')
    expect(tabs.length).toBeGreaterThan(0)
  })

  it('active pagination dot has aria-selected', () => {
    const wrapper = createWrapper()
    const tabs = wrapper.findAll('[role="tab"]')
    const activeTab = tabs.find(tab => tab.attributes('aria-selected') === 'true')
    expect(activeTab).toBeDefined()
  })

  it('has proper section landmark', () => {
    const wrapper = createWrapper()
    const section = wrapper.find('section')
    expect(section.exists()).toBe(true)
  })
})
