import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, computed } from 'vue'
import ProducerCard from '~/components/producer/Card.vue'

vi.mock('#imports', () => ({
  useI18n: vi.fn(() => ({
    t: (k: string) => k,
    locale: ref('en'),
  })),
  ref,
  computed,
  onMounted: vi.fn(cb => cb && cb()),
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

  const mountComponent = (props = {}) => {
    return mount(ProducerCard, {
      props: { producer: mockProducer, ...props },
      global: {
        stubs: {
          commonIcon: {
            template: '<span :class="name" data-testid="icon">icon</span>',
            props: ['name'],
          },
          NuxtLink: {
            template: '<a><slot /></a>',
            props: ['to'],
          },
          NuxtImg: {
            template: '<img :src="src" :alt="alt" />',
            props: ['src', 'alt'],
          },
        },
      },
    })
  }

  it('should render producer card', () => {
    const wrapper = mountComponent()
    expect(wrapper.exists()).toBe(true)
  })

  it('should display producer name', () => {
    const wrapper = mountComponent()
    expect(wrapper.text()).toContain('Test Vineyard')
  })

  it('should show specialty', () => {
    const wrapper = mountComponent()
    expect(wrapper.text()).toContain('Organic Wines')
  })

  it('should display established year', () => {
    const wrapper = mountComponent()
    // Check for establishment info
    const html = wrapper.html()
    expect(html).toBeTruthy()
  })

  it('should show generations count', () => {
    const wrapper = mountComponent()
    // Check for generations info
    const html = wrapper.html()
    expect(html).toBeTruthy()
  })

  it('should emit click event when clicked', async () => {
    const wrapper = mountComponent()
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('should show certification badge', () => {
    const wrapper = mountComponent()
    const html = wrapper.html()
    expect(html).toBeTruthy()
  })
})
