import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import PairingCard from '~/components/pairing/Card.vue'

vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({
    t: (k: string) => {
      if (k === 'wineStory.pairings.whyItWorks') return 'Why It Works'
      if (k === 'wineStory.pairings.viewPairing') return 'View Pairing'
      return k
    },
    locale: { value: 'en' },
  })),
}))

describe('Pairing Card', () => {
  const mockPairing = {
    id: 1,
    wineType: 'red',
    wineName: { en: 'Cabernet Sauvignon' },
    dishName: { en: 'Grilled Steak' },
    wineImage: '/wine.jpg',
    foodImage: '/food.jpg',
    pairingReason: { en: 'Bold flavors complement rich meat' },
    occasions: ['dinner', 'celebration'],
    seasons: ['winter'],
    characteristics: {
      intensity: 'bold' as const,
    },
  }

  it('should render pairing card', () => {
    const wrapper = mount(PairingCard, {
      props: { pairing: mockPairing },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('should display wine name', () => {
    const wrapper = mount(PairingCard, {
      props: { pairing: mockPairing },
    })
    expect(wrapper.text()).toContain('Cabernet Sauvignon')
  })

  it('should display dish name', () => {
    const wrapper = mount(PairingCard, {
      props: { pairing: mockPairing },
    })
    expect(wrapper.text()).toContain('Grilled Steak')
  })

  it('should show pairing reason', () => {
    const wrapper = mount(PairingCard, {
      props: { pairing: mockPairing },
    })
    expect(wrapper.text()).toContain('Why It Works')
    expect(wrapper.text()).toContain('Bold flavors complement rich meat')
  })

  it('should emit click event when clicked', async () => {
    const wrapper = mount(PairingCard, {
      props: { pairing: mockPairing },
    })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
    expect(wrapper.emitted('click')?.[0]).toEqual([mockPairing])
  })

  it('should display intensity indicator', () => {
    const wrapper = mount(PairingCard, {
      props: { pairing: mockPairing },
    })
    const intensityDots = wrapper.findAll('.h-1')
    expect(intensityDots.length).toBe(3)
  })

  it('should show occasion tags', () => {
    const wrapper = mount(PairingCard, {
      props: { pairing: mockPairing },
    })
    expect(wrapper.html()).toContain('lucide:calendar')
  })
})
