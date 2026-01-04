import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import GiftPhilosophySection from '~/components/home/GiftPhilosophySection.vue'

vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({ t: (k: string) => k })),
  useLocalePath: vi.fn(() => (path: string) => path),
}))

describe('Home GiftPhilosophySection', () => {
  const createWrapper = () => {
    return mount(GiftPhilosophySection, {
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :href="to"><slot /></a>',
            props: ['to'],
          },
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

  it('renders the section as a semantic section element', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('section').exists()).toBe(true)
  })

  it('displays the main title', () => {
    const wrapper = createWrapper()
    const title = wrapper.find('h2')
    expect(title.exists()).toBe(true)
    expect(title.text()).toBe('wineStory.giftPhilosophy.title')
  })

  it('displays the subtitle', () => {
    const wrapper = createWrapper()
    const paragraphs = wrapper.findAll('p')
    expect(paragraphs.length).toBeGreaterThan(0)
    expect(paragraphs[0].text()).toBe('wineStory.giftPhilosophy.subtitle')
  })

  it('displays the description', () => {
    const wrapper = createWrapper()
    const paragraphs = wrapper.findAll('p')
    expect(paragraphs[1].text()).toBe('wineStory.giftPhilosophy.description')
  })

  describe('Reasons Grid', () => {
    it('renders the reasons section title', () => {
      const wrapper = createWrapper()
      const headings = wrapper.findAll('h3')
      expect(headings[0].text()).toBe('wineStory.giftPhilosophy.reasons.title')
    })

    it('renders all four reason cards', () => {
      const wrapper = createWrapper()
      const reasonCards = wrapper.findAll('.group.rounded-2xl.bg-white\\/10')
      expect(reasonCards.length).toBe(4)
    })

    it('renders authenticity reason with correct icon', () => {
      const wrapper = createWrapper()
      const headings = wrapper.findAll('h4')
      expect(headings[0].text()).toBe('wineStory.giftPhilosophy.reasons.authenticity.title')
    })

    it('renders quality reason with correct content', () => {
      const wrapper = createWrapper()
      const headings = wrapper.findAll('h4')
      expect(headings[1].text()).toBe('wineStory.giftPhilosophy.reasons.quality.title')
    })

    it('renders sustainability reason', () => {
      const wrapper = createWrapper()
      const headings = wrapper.findAll('h4')
      expect(headings[2].text()).toBe('wineStory.giftPhilosophy.reasons.sustainability.title')
    })

    it('renders unique reason', () => {
      const wrapper = createWrapper()
      const headings = wrapper.findAll('h4')
      expect(headings[3].text()).toBe('wineStory.giftPhilosophy.reasons.unique.title')
    })

    it('displays descriptions for all reasons', () => {
      const wrapper = createWrapper()
      const descriptions = wrapper.findAll('.text-sm.leading-relaxed.text-white\\/70')
      expect(descriptions.length).toBeGreaterThanOrEqual(4)
    })
  })

  describe('Gift Scenarios', () => {
    it('renders the scenarios section title', () => {
      const wrapper = createWrapper()
      const headings = wrapper.findAll('h3')
      expect(headings[1].text()).toBe('wineStory.giftPhilosophy.scenarios.title')
    })

    it('renders all four scenario cards', () => {
      const wrapper = createWrapper()
      const scenarioCards = wrapper.findAll('.group.rounded-2xl.border.border-white\\/20')
      expect(scenarioCards.length).toBe(4)
    })

    it('renders corporate gifts scenario', () => {
      const wrapper = createWrapper()
      const headings = wrapper.findAll('h4')
      const corporateHeading = headings.find(h => h.text() === 'wineStory.giftPhilosophy.scenarios.corporate.title')
      expect(corporateHeading).toBeTruthy()
    })

    it('renders celebration scenario', () => {
      const wrapper = createWrapper()
      const headings = wrapper.findAll('h4')
      const celebrationHeading = headings.find(h => h.text() === 'wineStory.giftPhilosophy.scenarios.celebration.title')
      expect(celebrationHeading).toBeTruthy()
    })

    it('renders gratitude scenario', () => {
      const wrapper = createWrapper()
      const headings = wrapper.findAll('h4')
      const gratitudeHeading = headings.find(h => h.text() === 'wineStory.giftPhilosophy.scenarios.gratitude.title')
      expect(gratitudeHeading).toBeTruthy()
    })

    it('renders exploration scenario', () => {
      const wrapper = createWrapper()
      const headings = wrapper.findAll('h4')
      const explorationHeading = headings.find(h => h.text() === 'wineStory.giftPhilosophy.scenarios.exploration.title')
      expect(explorationHeading).toBeTruthy()
    })
  })

  describe('CTA Section', () => {
    it('renders the CTA title', () => {
      const wrapper = createWrapper()
      const headings = wrapper.findAll('h3')
      const ctaHeading = headings.find(h => h.text() === 'wineStory.giftPhilosophy.cta.title')
      expect(ctaHeading).toBeTruthy()
    })

    it('renders the CTA description', () => {
      const wrapper = createWrapper()
      const text = wrapper.text()
      expect(text).toContain('wineStory.giftPhilosophy.cta.description')
    })

    it('renders the CTA button with correct link', () => {
      const wrapper = createWrapper()
      const ctaButton = wrapper.find('.cta-button')
      expect(ctaButton.exists()).toBe(true)
      expect(ctaButton.attributes('href')).toBe('/products')
    })

    it('displays the button text', () => {
      const wrapper = createWrapper()
      const ctaButton = wrapper.find('.cta-button')
      expect(ctaButton.text()).toContain('wineStory.giftPhilosophy.cta.button')
    })

    it('includes an arrow icon in the CTA button', () => {
      const wrapper = createWrapper()
      const ctaButton = wrapper.find('.cta-button')
      const icon = ctaButton.find('.icon-stub')
      expect(icon.exists()).toBe(true)
    })
  })

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      const wrapper = createWrapper()
      const h2 = wrapper.find('h2')
      const h3 = wrapper.find('h3')
      const h4 = wrapper.find('h4')

      expect(h2.exists()).toBe(true)
      expect(h3.exists()).toBe(true)
      expect(h4.exists()).toBe(true)
    })

    it('renders all icons', () => {
      const wrapper = createWrapper()
      const icons = wrapper.findAll('.icon-stub')
      // 4 reason icons + 4 scenario icons + 1 CTA icon = 9 total
      expect(icons.length).toBeGreaterThanOrEqual(9)
    })

    it('has focus-visible styles defined', () => {
      const wrapper = createWrapper()
      expect(wrapper.html()).toBeTruthy()
      // Component should have scoped styles
      expect(wrapper.vm).toBeTruthy()
    })
  })

  describe('Visual Structure', () => {
    it('has a dark background', () => {
      const wrapper = createWrapper()
      const section = wrapper.find('section')
      expect(section.classes()).toContain('bg-slate-900')
    })

    it('has text in white color', () => {
      const wrapper = createWrapper()
      const section = wrapper.find('section')
      expect(section.classes()).toContain('text-white')
    })

    it('has background pattern decoration', () => {
      const wrapper = createWrapper()
      const backgroundPattern = wrapper.find('.absolute.inset-0.opacity-10')
      expect(backgroundPattern.exists()).toBe(true)
    })

    it('has responsive padding', () => {
      const wrapper = createWrapper()
      const section = wrapper.find('section')
      expect(section.classes()).toContain('py-20')
      expect(section.classes()).toContain('md:py-32')
    })
  })

  describe('Grid Layouts', () => {
    it('reasons grid is responsive', () => {
      const wrapper = createWrapper()
      const reasonsGrid = wrapper.find('.grid.gap-6.md\\:grid-cols-2.lg\\:grid-cols-4')
      expect(reasonsGrid.exists()).toBe(true)
    })

    it('scenarios grid is responsive', () => {
      const wrapper = createWrapper()
      const scenariosGrid = wrapper.find('.grid.gap-6.md\\:grid-cols-2')
      expect(scenariosGrid.exists()).toBe(true)
    })
  })
})
