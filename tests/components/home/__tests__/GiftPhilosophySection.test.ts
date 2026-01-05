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
            template: '<a :href="to" :class="$attrs.class"><slot /></a>',
            props: ['to'],
          },
          commonIcon: {
            template: '<span class="icon-stub" :data-icon="name"></span>',
            props: ['name', 'class'],
          },
        },
        directives: {
          motion: () => {},
        },
      },
    })
  }

  describe('Section Structure', () => {
    it('should render section element with proper classes', () => {
      const wrapper = createWrapper()
      const section = wrapper.find('section')
      expect(section.exists()).toBe(true)
      expect(section.classes()).toContain('relative')
      expect(section.classes()).toContain('overflow-hidden')
      expect(section.classes()).toContain('bg-slate-900')
      expect(section.classes()).toContain('text-white')
    })

    it('should render container inside section', () => {
      const wrapper = createWrapper()
      const container = wrapper.find('.container')
      expect(container.exists()).toBe(true)
      expect(container.classes()).toContain('relative')
    })

    it('should render background pattern decoration', () => {
      const wrapper = createWrapper()
      const backgroundPattern = wrapper.find('.absolute.inset-0.opacity-10')
      expect(backgroundPattern.exists()).toBe(true)
    })

    it('should have responsive padding on section', () => {
      const wrapper = createWrapper()
      const section = wrapper.find('section')
      expect(section.classes()).toContain('py-20')
      expect(section.classes()).toContain('md:py-32')
    })
  })

  describe('Header Section', () => {
    it('should render main title with correct element and classes', () => {
      const wrapper = createWrapper()
      const title = wrapper.find('h2')
      expect(title.exists()).toBe(true)
      expect(title.classes()).toContain('text-4xl')
      expect(title.classes()).toContain('font-bold')
      expect(title.classes()).toContain('tracking-tight')
      expect(title.text()).toBe('wineStory.giftPhilosophy.title')
    })

    it('should render subtitle with correct styling', () => {
      const wrapper = createWrapper()
      const subtitle = wrapper.find('p.mt-6.text-xl')
      expect(subtitle.exists()).toBe(true)
      expect(subtitle.classes()).toContain('text-white/80')
      expect(subtitle.text()).toBe('wineStory.giftPhilosophy.subtitle')
    })

    it('should render description with correct styling', () => {
      const wrapper = createWrapper()
      const description = wrapper.find('p.mx-auto.mt-6')
      expect(description.exists()).toBe(true)
      expect(description.classes()).toContain('text-lg')
      expect(description.classes()).toContain('text-white/70')
      expect(description.text()).toBe('wineStory.giftPhilosophy.description')
    })

    it('should center header content', () => {
      const wrapper = createWrapper()
      const headerWrapper = wrapper.find('.mx-auto.max-w-3xl.text-center')
      expect(headerWrapper.exists()).toBe(true)
    })
  })

  describe('Reasons Section', () => {
    it('should render reasons section title as h3', () => {
      const wrapper = createWrapper()
      const h3Elements = wrapper.findAll('h3')
      const reasonsTitle = h3Elements[0]
      expect(reasonsTitle.exists()).toBe(true)
      expect(reasonsTitle.classes()).toContain('text-2xl')
      expect(reasonsTitle.classes()).toContain('font-bold')
      expect(reasonsTitle.text()).toBe('wineStory.giftPhilosophy.reasons.title')
    })

    it('should render exactly 4 reason cards', () => {
      const wrapper = createWrapper()
      const reasonCards = wrapper.findAll('.group.rounded-2xl.bg-white\\/10')
      expect(reasonCards).toHaveLength(4)
    })

    it('should render responsive grid for reasons', () => {
      const wrapper = createWrapper()
      const reasonsGrid = wrapper.find('.grid.gap-6.md\\:grid-cols-2.lg\\:grid-cols-4')
      expect(reasonsGrid.exists()).toBe(true)
    })

    it('should render authenticity reason with correct icon', () => {
      const wrapper = createWrapper()
      const heartIcon = wrapper.find('[data-icon="lucide:heart"]')
      expect(heartIcon.exists()).toBe(true)
    })

    it('should render quality reason with award icon', () => {
      const wrapper = createWrapper()
      const awardIcon = wrapper.find('[data-icon="lucide:award"]')
      expect(awardIcon.exists()).toBe(true)
    })

    it('should render sustainability reason with leaf icon', () => {
      const wrapper = createWrapper()
      const leafIcon = wrapper.find('[data-icon="lucide:leaf"]')
      expect(leafIcon.exists()).toBe(true)
    })

    it('should render unique reason with sparkles icon', () => {
      const wrapper = createWrapper()
      const sparklesIcon = wrapper.find('[data-icon="lucide:sparkles"]')
      expect(sparklesIcon.exists()).toBe(true)
    })

    it('should render all reason titles', () => {
      const wrapper = createWrapper()
      const h4Elements = wrapper.findAll('h4')
      const reasonTitles = h4Elements.slice(0, 4).map(el => el.text())
      expect(reasonTitles).toContain('wineStory.giftPhilosophy.reasons.authenticity.title')
      expect(reasonTitles).toContain('wineStory.giftPhilosophy.reasons.quality.title')
      expect(reasonTitles).toContain('wineStory.giftPhilosophy.reasons.sustainability.title')
      expect(reasonTitles).toContain('wineStory.giftPhilosophy.reasons.unique.title')
    })

    it('should render all reason descriptions', () => {
      const wrapper = createWrapper()
      const descriptions = wrapper.findAll('.text-sm.leading-relaxed.text-white\\/70')
      expect(descriptions.length).toBeGreaterThanOrEqual(4)
      const descTexts = descriptions.map(el => el.text())
      expect(descTexts).toContain('wineStory.giftPhilosophy.reasons.authenticity.description')
      expect(descTexts).toContain('wineStory.giftPhilosophy.reasons.quality.description')
      expect(descTexts).toContain('wineStory.giftPhilosophy.reasons.sustainability.description')
      expect(descTexts).toContain('wineStory.giftPhilosophy.reasons.unique.description')
    })

    it('should apply hover styles to reason cards', () => {
      const wrapper = createWrapper()
      const reasonCard = wrapper.find('.group.rounded-2xl.bg-white\\/10')
      expect(reasonCard.classes()).toContain('backdrop-blur')
      expect(reasonCard.classes()).toContain('transition-all')
    })

    it('should render icon containers with proper styling', () => {
      const wrapper = createWrapper()
      const iconContainers = wrapper.findAll('.inline-flex.rounded-full.bg-primary\\/20.p-3')
      expect(iconContainers.length).toBeGreaterThanOrEqual(4)
    })
  })

  describe('Gift Scenarios Section', () => {
    it('should render scenarios section title as h3', () => {
      const wrapper = createWrapper()
      const h3Elements = wrapper.findAll('h3')
      const scenariosTitle = h3Elements[1]
      expect(scenariosTitle.exists()).toBe(true)
      expect(scenariosTitle.text()).toBe('wineStory.giftPhilosophy.scenarios.title')
    })

    it('should render exactly 4 scenario cards', () => {
      const wrapper = createWrapper()
      const scenarioCards = wrapper.findAll('.group.rounded-2xl.border.border-white\\/20')
      expect(scenarioCards).toHaveLength(4)
    })

    it('should render responsive grid for scenarios', () => {
      const wrapper = createWrapper()
      const scenariosGrid = wrapper.find('.grid.gap-6.md\\:grid-cols-2')
      expect(scenariosGrid.exists()).toBe(true)
    })

    it('should render corporate scenario with briefcase icon', () => {
      const wrapper = createWrapper()
      const briefcaseIcon = wrapper.find('[data-icon="lucide:briefcase"]')
      expect(briefcaseIcon.exists()).toBe(true)
    })

    it('should render celebration scenario with party-popper icon', () => {
      const wrapper = createWrapper()
      const partyIcon = wrapper.find('[data-icon="lucide:party-popper"]')
      expect(partyIcon.exists()).toBe(true)
    })

    it('should render gratitude scenario with gift icon', () => {
      const wrapper = createWrapper()
      const giftIcon = wrapper.find('[data-icon="lucide:gift"]')
      expect(giftIcon.exists()).toBe(true)
    })

    it('should render exploration scenario with compass icon', () => {
      const wrapper = createWrapper()
      const compassIcon = wrapper.find('[data-icon="lucide:compass"]')
      expect(compassIcon.exists()).toBe(true)
    })

    it('should render all scenario titles', () => {
      const wrapper = createWrapper()
      const h4Elements = wrapper.findAll('h4')
      const scenarioTitles = h4Elements.slice(4, 8).map(el => el.text())
      expect(scenarioTitles).toContain('wineStory.giftPhilosophy.scenarios.corporate.title')
      expect(scenarioTitles).toContain('wineStory.giftPhilosophy.scenarios.celebration.title')
      expect(scenarioTitles).toContain('wineStory.giftPhilosophy.scenarios.gratitude.title')
      expect(scenarioTitles).toContain('wineStory.giftPhilosophy.scenarios.exploration.title')
    })

    it('should apply correct border and background to scenario cards', () => {
      const wrapper = createWrapper()
      const scenarioCard = wrapper.find('.group.rounded-2xl.border.border-white\\/20')
      expect(scenarioCard.classes()).toContain('bg-white/5')
      expect(scenarioCard.classes()).toContain('backdrop-blur')
    })
  })

  describe('CTA Section', () => {
    it('should render CTA title as h3', () => {
      const wrapper = createWrapper()
      const h3Elements = wrapper.findAll('h3')
      const ctaTitle = h3Elements.find(h => h.text() === 'wineStory.giftPhilosophy.cta.title')
      expect(ctaTitle).toBeTruthy()
      expect(ctaTitle?.classes()).toContain('text-2xl')
      expect(ctaTitle?.classes()).toContain('font-bold')
    })

    it('should render CTA description', () => {
      const wrapper = createWrapper()
      const ctaDescription = wrapper.find('.text-white\\/70.mb-6')
      expect(ctaDescription.exists()).toBe(true)
      expect(ctaDescription.text()).toBe('wineStory.giftPhilosophy.cta.description')
    })

    it('should render CTA button with correct href', () => {
      const wrapper = createWrapper()
      const ctaButton = wrapper.find('.cta-button')
      expect(ctaButton.exists()).toBe(true)
      expect(ctaButton.attributes('href')).toBe('/products')
    })

    it('should render CTA button text', () => {
      const wrapper = createWrapper()
      const ctaButton = wrapper.find('.cta-button')
      expect(ctaButton.text()).toContain('wineStory.giftPhilosophy.cta.button')
    })

    it('should render arrow icon in CTA button', () => {
      const wrapper = createWrapper()
      const ctaButton = wrapper.find('.cta-button')
      const icon = ctaButton.find('[data-icon="lucide:arrow-right"]')
      expect(icon.exists()).toBe(true)
    })

    it('should apply correct styling to CTA button', () => {
      const wrapper = createWrapper()
      const ctaButton = wrapper.find('.cta-button')
      expect(ctaButton.classes()).toContain('inline-flex')
      expect(ctaButton.classes()).toContain('rounded-full')
      expect(ctaButton.classes()).toContain('bg-white')
      expect(ctaButton.classes()).toContain('px-8')
      expect(ctaButton.classes()).toContain('py-3')
    })

    it('should center CTA section', () => {
      const wrapper = createWrapper()
      const ctaSection = wrapper.find('.mt-16.text-center')
      expect(ctaSection.exists()).toBe(true)
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      const wrapper = createWrapper()
      const h2 = wrapper.find('h2')
      const h3Elements = wrapper.findAll('h3')
      const h4Elements = wrapper.findAll('h4')

      expect(h2.exists()).toBe(true)
      expect(h3Elements.length).toBeGreaterThan(0)
      expect(h4Elements.length).toBeGreaterThan(0)
    })

    it('should render all icons with proper role', () => {
      const wrapper = createWrapper()
      const icons = wrapper.findAll('.icon-stub')
      // 4 reason icons + 4 scenario icons + 1 CTA icon = 9 total
      expect(icons.length).toBeGreaterThanOrEqual(9)
    })

    it('should use semantic section element', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('section').exists()).toBe(true)
    })
  })

  describe('Icon Rendering', () => {
    it('should render correct total number of icons', () => {
      const wrapper = createWrapper()
      const icons = wrapper.findAll('[data-icon]')
      // 4 reason icons + 4 scenario icons + 1 arrow icon = 9 total
      expect(icons).toHaveLength(9)
    })

    it('should render all expected icon types', () => {
      const wrapper = createWrapper()
      const iconNames = wrapper.findAll('[data-icon]').map(el => el.attributes('data-icon'))
      expect(iconNames).toContain('lucide:heart')
      expect(iconNames).toContain('lucide:award')
      expect(iconNames).toContain('lucide:leaf')
      expect(iconNames).toContain('lucide:sparkles')
      expect(iconNames).toContain('lucide:briefcase')
      expect(iconNames).toContain('lucide:party-popper')
      expect(iconNames).toContain('lucide:gift')
      expect(iconNames).toContain('lucide:compass')
      expect(iconNames).toContain('lucide:arrow-right')
    })
  })

  describe('Styling Classes', () => {
    it('should apply backdrop blur to cards', () => {
      const wrapper = createWrapper()
      const reasonCard = wrapper.find('.group.rounded-2xl.bg-white\\/10')
      expect(reasonCard.classes()).toContain('backdrop-blur')
    })

    it('should apply correct spacing between sections', () => {
      const wrapper = createWrapper()
      const reasonsSection = wrapper.find('.mt-12')
      expect(reasonsSection.exists()).toBe(true)

      const scenariosSection = wrapper.find('.mt-16')
      expect(scenariosSection.exists()).toBe(true)
    })

    it('should have consistent card padding', () => {
      const wrapper = createWrapper()
      const reasonCard = wrapper.find('.group.rounded-2xl.bg-white\\/10')
      expect(reasonCard.classes()).toContain('p-6')

      const scenarioCard = wrapper.find('.group.rounded-2xl.border.border-white\\/20')
      expect(scenarioCard.classes()).toContain('p-8')
    })
  })
})
