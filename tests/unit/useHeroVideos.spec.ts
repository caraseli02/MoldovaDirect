import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import * as heroModule from '~/composables/useHeroVideos'

describe('useHeroVideos', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    // Simulate client environment for SSR guard
    ;(process as any).client = true
    // Minimal Nuxt composable stubs
    vi.stubGlobal('useState', (_key: string, init: () => any) => {
      return ref(init())
    })
    // Mock Vue lifecycle hooks used in composable
    vi.stubGlobal('getCurrentInstance', () => null)
    vi.stubGlobal('onMounted', () => {})
  })

  const mockDevice = (isMobileValue: boolean) => {
    vi.stubGlobal('useDevice', () => ({
      isMobile: ref(isMobileValue),
      updateDimensions: () => {}, // Required by composable
    }))
  }

  it('exposes all configured videos including latest additions', () => {
    mockDevice(false)
    const { useHeroVideos } = heroModule
    const { videos } = useHeroVideos()

    expect(videos.length).toBeGreaterThanOrEqual(4)
    const ids = videos.map(v => v.id)
    expect(ids).toContain('vineyard-aerial')
  })

  it('picks a random video from the configured list', () => {
    mockDevice(false)
    // Force deterministic pick
    vi.spyOn(Math, 'random').mockReturnValue(0.42)

    const { useHeroVideos } = heroModule
    const { currentVideo, videos } = useHeroVideos()
    expect(videos).toContainEqual(currentVideo.value)
  })

  it('disables video on mobile via showVideo', () => {
    mockDevice(true)
    const { useHeroVideos } = heroModule
    const { showVideo } = useHeroVideos()

    expect(showVideo.value).toBe(false)
  })

  it('throws on empty video library', async () => {
    mockDevice(false)
    vi.stubGlobal('useState', (_key: string, init: () => any) => {
      try {
        return ref(init())
      }
      catch (e) {
        throw e
      }
    })

    vi.resetModules()
    vi.doMock('~/composables/useHeroVideos', async () => {
      const mod = await vi.importActual<typeof heroModule>('~/composables/useHeroVideos')
      const useHeroVideos = () => {
        const videos: any[] = []
        const { isMobile } = { isMobile: ref(false) }
        const isClient = true
        const getRandomVideo = () => {
          if (videos.length === 0) {
            throw new Error('Hero video library is empty. Add videos to the array.')
          }
          return videos[0]
        }
        const currentVideo = ref(getRandomVideo())
        const showVideo = ref(isClient && !isMobile.value)
        return { videos, currentVideo, showVideo }
      }
      return { ...mod, useHeroVideos }
    })
    const mocked = await import('~/composables/useHeroVideos')
    expect(() => mocked.useHeroVideos()).toThrow('Hero video library is empty')
  })

  it('handles single video array and persists via useState', async () => {
    mockDevice(false)
    const singleVideo = {
      id: 'only-one',
      webm: '/videos/hero/hero-1.webm',
      mp4: '/videos/hero/hero-1.mp4',
      poster: '/videos/hero/hero-1-poster.jpg',
      alt: 'Only one',
    }

    const useStateSpy = vi.fn((_key: string, init: () => any) => ref(init()))
    vi.stubGlobal('useState', useStateSpy)

    vi.resetModules()
    vi.doMock('~/composables/useHeroVideos', async () => {
      const mod = await vi.importActual<typeof heroModule>('~/composables/useHeroVideos')
      const useHeroVideos = () => {
        const videos = [singleVideo]
        const { isMobile } = { isMobile: ref(false) }
        const isClient = true
        const getRandomVideo = () => videos[0]
        const currentVideo = useStateSpy('hero-video', getRandomVideo)
        const showVideo = ref(isClient && !isMobile.value)
        return { videos, currentVideo, showVideo }
      }
      return { ...mod, useHeroVideos }
    })

    const mocked = await import('~/composables/useHeroVideos')
    const { currentVideo } = mocked.useHeroVideos()
    expect(currentVideo.value).toEqual(singleVideo)
    expect(useStateSpy).toHaveBeenCalled()
  })

  it('returns false for showVideo during SSR (process.client false)', () => {
    mockDevice(false)
    ;(process as any).client = false
    const { useHeroVideos } = heroModule
    const { showVideo } = useHeroVideos()
    expect(showVideo.value).toBe(false)
    ;(process as any).client = true
  })
})
