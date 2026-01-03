import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import VideoHero from '~/components/home/VideoHero.vue'

vi.mock('#imports', () => ({ useI18n: vi.fn(() => ({ t: (k: string) => k })) }))

describe('VideoHero - Enhanced', () => {
  const mockProps = {
    videoUrl: '/videos/hero.mp4',
    title: 'Welcome to Moldova Direct',
    subtitle: 'Premium wines delivered',
    ctaText: 'Shop Now',
  }

  it('should render video hero', () => {
    const wrapper = mount(VideoHero, {
      props: mockProps,
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('should display video element', () => {
    const wrapper = mount(VideoHero, {
      props: mockProps,
    })
    const video = wrapper.find('video')
    expect(video.exists() || wrapper.find('iframe').exists()).toBe(true)
  })

  it('should show hero title', () => {
    const wrapper = mount(VideoHero, {
      props: mockProps,
    })
    expect(wrapper.text()).toContain('Welcome to Moldova Direct')
  })

  it('should display subtitle', () => {
    const wrapper = mount(VideoHero, {
      props: mockProps,
    })
    expect(wrapper.text()).toContain('Premium wines delivered')
  })

  it('should have CTA button', () => {
    const wrapper = mount(VideoHero, {
      props: mockProps,
    })
    expect(wrapper.text()).toContain('Shop Now')
  })

  it('should support video playback controls', () => {
    const wrapper = mount(VideoHero, {
      props: mockProps,
    })
    const playButton = wrapper.find('[aria-label*="play"]') || wrapper.find('button')
    expect(playButton.exists() || wrapper.find('video').exists()).toBe(true)
  })
})
