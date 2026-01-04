import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ProducerCard from '~/components/producer/Card.vue'

vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({
    t: (k: string) => k,
    locale: { value: 'en' },
  })),
}))

describe('Producer Card', () => {
  const mockProducer = {
    id: 1,
    name: 'Test Vineyard',
    region: 'codru',
    portraitImage: '/images/producer.jpg',
    specialty: { en: 'Organic Wines', es: 'Vinos Orgánicos' },
    shortBio: { en: 'Family-owned vineyard', es: 'Viñedo familiar' },
    establishedYear: 1950,
    generationsOfWinemaking: 3,
    certifications: [{ name: 'Organic' }],
  }

  it('should render producer card', () => {
    const wrapper = mount(ProducerCard, {
      props: { producer: mockProducer },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('should display producer name', () => {
    const wrapper = mount(ProducerCard, {
      props: { producer: mockProducer },
    })
    expect(wrapper.text()).toContain('Test Vineyard')
  })

  it('should show specialty', () => {
    const wrapper = mount(ProducerCard, {
      props: { producer: mockProducer },
    })
    expect(wrapper.text()).toContain('Organic Wines')
  })

  it('should display established year', () => {
    const wrapper = mount(ProducerCard, {
      props: { producer: mockProducer },
    })
    expect(wrapper.text()).toContain('1950')
  })

  it('should show generations count', () => {
    const wrapper = mount(ProducerCard, {
      props: { producer: mockProducer },
    })
    expect(wrapper.text()).toContain('3')
  })

  it('should emit click event when clicked', async () => {
    const wrapper = mount(ProducerCard, {
      props: { producer: mockProducer },
    })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
    expect(wrapper.emitted('click')?.[0]).toEqual([mockProducer])
  })

  it('should show certification badge', () => {
    const wrapper = mount(ProducerCard, {
      props: { producer: mockProducer },
    })
    expect(wrapper.html()).toContain('lucide:leaf')
  })
})
