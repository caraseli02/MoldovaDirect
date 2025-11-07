import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import LandingProductCard from '@/components/landing/LandingProductCard.vue'

describe('LandingProductCard', () => {
  const mockProduct = {
    id: '1',
    name: 'Purcari Roșu de Purcari',
    slug: 'purcari-rosu-de-purcari',
    price: 29.99,
    image: 'https://example.com/wine.jpg',
    benefits: ['Award-Winning', 'Organic', '5000+ Years Heritage'],
    rating: 4.8,
    reviewCount: 124
  }

  const createWrapper = (product = mockProduct) => {
    return mount(LandingProductCard, {
      props: { product },
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
          }
        },
        mocks: {
          $t: (key: string) => {
            const translations: Record<string, string> = {
              'landing.products.shopNow': 'Shop Now'
            }
            return translations[key] || key
          },
          localePath: (path: string) => path
        }
      }
    })
  }

  it('renders product card correctly', () => {
    const wrapper = createWrapper()
    expect(wrapper.exists()).toBe(true)
  })

  it('displays product name', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('Purcari Roșu de Purcari')
  })

  it('displays product price correctly formatted', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('€29.99')
  })

  it('displays rating and review count', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('4.8')
    expect(wrapper.text()).toContain('124')
  })

  it('displays benefits pills (max 2)', () => {
    const wrapper = createWrapper()
    const benefits = wrapper.findAll('.bg-amber-100')
    expect(benefits.length).toBeLessThanOrEqual(2)
    expect(wrapper.text()).toContain('Award-Winning')
    expect(wrapper.text()).toContain('Organic')
  })

  it('renders product image with correct alt text', () => {
    const wrapper = createWrapper()
    const img = wrapper.find('img')
    expect(img.attributes('alt')).toBe('Purcari Roșu de Purcari')
  })

  it('has link to product detail page', () => {
    const wrapper = createWrapper()
    const links = wrapper.findAll('a')
    const productLinks = links.filter(link =>
      link.attributes('href')?.includes('purcari-rosu-de-purcari')
    )
    expect(productLinks.length).toBeGreaterThan(0)
  })

  it('renders shop now button', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('Shop Now')
  })

  it('add to cart button has proper aria-label', () => {
    const wrapper = createWrapper()
    const addButton = wrapper.find('button[aria-label*="Add"]')
    expect(addButton.exists()).toBe(true)
    expect(addButton.attributes('aria-label')).toContain('Purcari Roșu de Purcari')
  })

  it('calls addToCart when quick add button is clicked', async () => {
    const wrapper = createWrapper()
    const consoleSpy = vi.spyOn(console, 'log')

    const addButton = wrapper.find('button[aria-label*="Add"]')
    await addButton.trigger('click')

    expect(consoleSpy).toHaveBeenCalledWith('Add to cart:', '1')
    consoleSpy.mockRestore()
  })

  it('has proper card structure with flexbox layout', () => {
    const wrapper = createWrapper()
    const card = wrapper.find('.product-card')
    expect(card.classes()).toContain('flex')
    expect(card.classes()).toContain('flex-col')
  })

  it('image has lazy loading attribute', () => {
    const wrapper = createWrapper()
    const img = wrapper.find('img')
    expect(img.attributes('loading')).toBe('lazy')
  })

  it('rating displays star icon', () => {
    const wrapper = createWrapper()
    const icons = wrapper.findAllComponents({ name: 'commonIcon' })
    const starIcon = icons.find(icon => icon.props('name') === 'lucide:star')
    expect(starIcon).toBeDefined()
  })
})
