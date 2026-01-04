import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ProductionProcessSection from '~/components/home/ProductionProcessSection.vue'

vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({ t: (k: string) => k })),
}))

describe('Home ProductionProcessSection', () => {
  const createWrapper = () => {
    return mount(ProductionProcessSection, {
      global: {
        stubs: {
          commonIcon: {
            template: '<span class="icon-stub"></span>',
            props: ['name', 'class'],
          },
        },
        directives: {
          motion: () => {},
        },
      },
    })
  }

  it('renders the component', () => {
    const wrapper = createWrapper()
    expect(wrapper.exists()).toBe(true)
  })

  it('renders as a semantic section element', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('section').exists()).toBe(true)
  })

  it('has white background', () => {
    const wrapper = createWrapper()
    const section = wrapper.find('section')
    expect(section.classes()).toContain('bg-white')
  })

  describe('Section Header', () => {
    it('displays the main title', () => {
      const wrapper = createWrapper()
      const title = wrapper.find('h2')
      expect(title.exists()).toBe(true)
      expect(title.text()).toBe('wineStory.production.title')
    })

    it('displays the subtitle', () => {
      const wrapper = createWrapper()
      const subtitle = wrapper.find('p.text-xl')
      expect(subtitle.exists()).toBe(true)
      expect(subtitle.text()).toBe('wineStory.production.subtitle')
    })

    it('has centered text alignment', () => {
      const wrapper = createWrapper()
      const header = wrapper.find('.mx-auto.max-w-3xl.text-center')
      expect(header.exists()).toBe(true)
    })
  })

  describe('Timeline', () => {
    it('renders desktop timeline line', () => {
      const wrapper = createWrapper()
      const timelineLine = wrapper.find('.absolute.left-1\\/2.top-0.h-full.w-0\\.5')
      expect(timelineLine.exists()).toBe(true)
    })

    it('renders mobile timeline line', () => {
      const wrapper = createWrapper()
      const mobileTimeline = wrapper.find('.absolute.left-8.top-0.h-full.w-0\\.5')
      expect(mobileTimeline.exists()).toBe(true)
    })

    it('has gradient colors', () => {
      const wrapper = createWrapper()
      const timelineLine = wrapper.find('.bg-gradient-to-b.from-primary\\/30.via-primary\\/60.to-primary')
      expect(timelineLine.exists()).toBe(true)
    })
  })

  describe('Production Steps', () => {
    it('renders all six production steps', () => {
      const wrapper = createWrapper()
      const steps = wrapper.findAll('.relative.grid.md\\:grid-cols-2')
      expect(steps.length).toBe(6)
    })

    describe('Step 1: Harvest', () => {
      it('renders harvest step title', () => {
        const wrapper = createWrapper()
        const headings = wrapper.findAll('h3')
        expect(headings[0].text()).toBe('wineStory.production.steps.harvest.title')
      })

      it('renders harvest timing badge', () => {
        const wrapper = createWrapper()
        const text = wrapper.text()
        expect(text).toContain('wineStory.production.steps.harvest.timing')
      })

      it('renders harvest description', () => {
        const wrapper = createWrapper()
        const text = wrapper.text()
        expect(text).toContain('wineStory.production.steps.harvest.description')
      })

      it('has grape icon', () => {
        const wrapper = createWrapper()
        const icons = wrapper.findAll('.icon-stub')
        expect(icons.length).toBeGreaterThan(0)
      })
    })

    describe('Step 2: Crushing & Fermentation', () => {
      it('renders crushing step title', () => {
        const wrapper = createWrapper()
        const headings = wrapper.findAll('h3')
        expect(headings[1].text()).toBe('wineStory.production.steps.crushing.title')
      })

      it('renders crushing timing', () => {
        const wrapper = createWrapper()
        const text = wrapper.text()
        expect(text).toContain('wineStory.production.steps.crushing.timing')
      })

      it('renders crushing description', () => {
        const wrapper = createWrapper()
        const text = wrapper.text()
        expect(text).toContain('wineStory.production.steps.crushing.description')
      })
    })

    describe('Step 3: Aging', () => {
      it('renders aging step title', () => {
        const wrapper = createWrapper()
        const headings = wrapper.findAll('h3')
        expect(headings[2].text()).toBe('wineStory.production.steps.aging.title')
      })

      it('renders aging timing', () => {
        const wrapper = createWrapper()
        const text = wrapper.text()
        expect(text).toContain('wineStory.production.steps.aging.timing')
      })

      it('renders aging description', () => {
        const wrapper = createWrapper()
        const text = wrapper.text()
        expect(text).toContain('wineStory.production.steps.aging.description')
      })
    })

    describe('Step 4: Bottling', () => {
      it('renders bottling step title', () => {
        const wrapper = createWrapper()
        const headings = wrapper.findAll('h3')
        expect(headings[3].text()).toBe('wineStory.production.steps.bottling.title')
      })

      it('renders bottling timing', () => {
        const wrapper = createWrapper()
        const text = wrapper.text()
        expect(text).toContain('wineStory.production.steps.bottling.timing')
      })

      it('renders bottling description', () => {
        const wrapper = createWrapper()
        const text = wrapper.text()
        expect(text).toContain('wineStory.production.steps.bottling.description')
      })
    })

    describe('Step 5: Quality Selection', () => {
      it('renders selection step title', () => {
        const wrapper = createWrapper()
        const headings = wrapper.findAll('h3')
        expect(headings[4].text()).toBe('wineStory.production.steps.selection.title')
      })

      it('renders selection timing', () => {
        const wrapper = createWrapper()
        const text = wrapper.text()
        expect(text).toContain('wineStory.production.steps.selection.timing')
      })

      it('renders selection description', () => {
        const wrapper = createWrapper()
        const text = wrapper.text()
        expect(text).toContain('wineStory.production.steps.selection.description')
      })
    })

    describe('Step 6: Delivery', () => {
      it('renders delivery step title', () => {
        const wrapper = createWrapper()
        const headings = wrapper.findAll('h3')
        expect(headings[5].text()).toBe('wineStory.production.steps.delivery.title')
      })

      it('renders delivery timing', () => {
        const wrapper = createWrapper()
        const text = wrapper.text()
        expect(text).toContain('wineStory.production.steps.delivery.timing')
      })

      it('renders delivery description', () => {
        const wrapper = createWrapper()
        const text = wrapper.text()
        expect(text).toContain('wineStory.production.steps.delivery.description')
      })
    })

    it('renders step icons with proper styling', () => {
      const wrapper = createWrapper()
      const iconContainers = wrapper.findAll('.flex.h-16.w-16.items-center.justify-center.rounded-full.bg-gold-500')
      expect(iconContainers.length).toBe(6)
    })

    it('renders timing badges for all steps', () => {
      const wrapper = createWrapper()
      const badges = wrapper.findAll('.inline-flex.items-center.gap-2.rounded-full.bg-gold-50')
      expect(badges.length).toBe(6)
    })
  })

  describe('Traditions & Sustainability', () => {
    it('renders both tradition and sustainability cards', () => {
      const wrapper = createWrapper()
      const cards = wrapper.findAll('.rounded-2xl')
      expect(cards.length).toBeGreaterThanOrEqual(2)
    })

    it('renders traditions section title', () => {
      const wrapper = createWrapper()
      const text = wrapper.text()
      expect(text).toContain('wineStory.production.traditions.title')
    })

    it('renders traditions description', () => {
      const wrapper = createWrapper()
      const text = wrapper.text()
      expect(text).toContain('wineStory.production.traditions.description')
    })

    it('renders sustainability section title', () => {
      const wrapper = createWrapper()
      const text = wrapper.text()
      expect(text).toContain('wineStory.production.sustainability.title')
    })

    it('renders sustainability description', () => {
      const wrapper = createWrapper()
      const text = wrapper.text()
      expect(text).toContain('wineStory.production.sustainability.description')
    })

    it('traditions card has primary gradient', () => {
      const wrapper = createWrapper()
      const traditionsCard = wrapper.find('.bg-gradient-to-br.from-primary\\/5.to-primary\\/10')
      expect(traditionsCard.exists()).toBe(true)
    })

    it('sustainability card has green gradient', () => {
      const wrapper = createWrapper()
      const sustainabilityCard = wrapper.find('.bg-gradient-to-br.from-green-50.to-green-100')
      expect(sustainabilityCard.exists()).toBe(true)
    })

    it('renders on a two-column grid', () => {
      const wrapper = createWrapper()
      const grid = wrapper.find('.grid.gap-8.md\\:grid-cols-2')
      expect(grid.exists()).toBe(true)
    })
  })

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      const wrapper = createWrapper()
      const h2 = wrapper.find('h2')
      const h3 = wrapper.find('h3')

      expect(h2.exists()).toBe(true)
      expect(h3.exists()).toBe(true)
    })

    it('renders all decorative elements with aria-hidden', () => {
      const wrapper = createWrapper()
      const ariaHidden = wrapper.findAll('[aria-hidden="true"]')
      expect(ariaHidden.length).toBeGreaterThanOrEqual(2)
    })

    it('has semantic HTML structure', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('section').exists()).toBe(true)
      expect(wrapper.find('.container').exists()).toBe(true)
    })
  })

  describe('Responsive Design', () => {
    it('has responsive padding', () => {
      const wrapper = createWrapper()
      const section = wrapper.find('section')
      expect(section.classes()).toContain('py-20')
      expect(section.classes()).toContain('md:py-32')
    })

    it('has responsive text sizes for title', () => {
      const wrapper = createWrapper()
      const title = wrapper.find('h2')
      expect(title.classes()).toContain('text-4xl')
      expect(title.classes()).toContain('sm:text-5xl')
      expect(title.classes()).toContain('md:text-6xl')
    })

    it('has responsive grid for steps', () => {
      const wrapper = createWrapper()
      const grid = wrapper.find('.grid.md\\:grid-cols-2')
      expect(grid.exists()).toBe(true)
    })
  })

  describe('Visual Design', () => {
    it('has overflow hidden', () => {
      const wrapper = createWrapper()
      const section = wrapper.find('section')
      expect(section.classes()).toContain('overflow-hidden')
    })

    it('uses slate-900 text color for headings', () => {
      const wrapper = createWrapper()
      const headings = wrapper.findAll('.text-slate-900')
      expect(headings.length).toBeGreaterThan(0)
    })

    it('uses slate-600 for body text', () => {
      const wrapper = createWrapper()
      const bodyText = wrapper.findAll('.text-slate-600')
      expect(bodyText.length).toBeGreaterThan(0)
    })
  })
})
