import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, nextTick } from 'vue'
import Card from './Card.vue'

const locale = ref('en')
const pushMock = vi.fn()
const localePathMock = vi.fn((route: any, localeOverride?: string) => {
  const slug = typeof route === 'string' ? route : route?.params?.slug || ''
  return `/${localeOverride || locale.value}/products/${slug}`
})

vi.mock('#imports', () => ({
  useRouter: () => ({ push: pushMock }),
  useI18n: () => ({
    t: (key: string) => key,
    locale,
  }),
  useLocalePath: () => localePathMock,
}))

vi.mock('~/composables/useCart', () => ({
  useCart: () => ({
    addItem: vi.fn(),
    loading: ref(false),
    isInCart: vi.fn().mockReturnValue(false),
  }),
}))

vi.mock('~/composables/useDevice', () => ({
  useDevice: () => ({
    isMobile: ref(false),
  }),
}))

vi.mock('~/composables/useHapticFeedback', () => ({
  useHapticFeedback: () => ({
    vibrate: vi.fn(),
  }),
}))

vi.mock('~/composables/useTouchEvents', () => ({
  useTouchEvents: () => ({
    setHandlers: vi.fn(),
    setupTouchListeners: vi.fn().mockReturnValue(() => {}),
    cleanup: vi.fn(),
  }),
}))

vi.mock('~/composables/useToast', () => ({
  useToast: () => ({
    error: vi.fn(),
  }),
}))

vi.mock('@/components/ui/button', () => ({
  Button: {
    name: 'Button',
    template: '<button><slot /></button>',
    props: ['disabled', 'ariaLabel', 'ariaLive', 'class'],
  },
}))

const createProduct = () => ({
  id: 1,
  slug: 'rare-wine',
  name: {
    en: 'Rare Wine',
    ro: 'Vin Rar',
  },
  shortDescription: {
    en: 'A very rare wine',
    ro: 'Un vin foarte rar',
  },
  price: '25.50',
  comparePrice: '30.00',
  stockQuantity: 5,
  tags: ['limited'],
  images: [
    {
      url: '/images/wine.jpg',
      isPrimary: true,
    },
  ],
})

const createWrapper = () => mount(Card, {
  props: {
    product: createProduct(),
  },
  global: {
    mocks: {
      $t: (key: string) => key,
    },
    stubs: {
      NuxtLink: {
        template: '<a data-test="nuxt-link" :href="to"><slot /></a>',
        props: ['to'],
      },
      NuxtImg: {
        template: '<img />',
        props: ['src', 'alt'],
      },
      commonIcon: true,
    },
  },
})

describe('Product Card locale-aware links', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    locale.value = 'en'
  })

  it('builds locale-aware product detail links for the active locale', () => {
    const wrapper = createWrapper()
    const links = wrapper.findAll('[data-test="nuxt-link"]')

    expect(links).toHaveLength(3)
    links.forEach((link) => {
      expect(link.attributes('href')).toBe('/en/products/rare-wine')
    })
    expect(localePathMock).toHaveBeenCalledWith(
      { name: 'products-slug', params: { slug: 'rare-wine' } },
      'en',
    )
  })

  it('updates product detail links when the locale changes', async () => {
    const wrapper = createWrapper()
    locale.value = 'ro'
    await nextTick()

    const links = wrapper.findAll('[data-test="nuxt-link"]')
    links.forEach((link) => {
      expect(link.attributes('href')).toBe('/ro/products/rare-wine')
    })

    expect(localePathMock).toHaveBeenCalledWith(
      { name: 'products-slug', params: { slug: 'rare-wine' } },
      'ro',
    )
  })
})
