import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { LandingSeoInput } from '~/composables/useLandingSeo'

// Mock the Nuxt imports
vi.mock('#imports', () => ({
  useHead: vi.fn(),
  useI18n: vi.fn(),
  useLocalePath: vi.fn(),
  useRoute: vi.fn(),
  useSiteUrl: vi.fn()
}))

describe('useLandingSeo', () => {
  let mockUseHead: any
  let mockUseI18n: any
  let mockUseLocalePath: any
  let mockUseRoute: any
  let mockUseSiteUrl: any

  beforeEach(async () => {
    vi.resetAllMocks()

    const imports = await import('#imports')
    mockUseHead = vi.mocked(imports.useHead)
    mockUseI18n = vi.mocked(imports.useI18n)
    mockUseLocalePath = vi.mocked(imports.useLocalePath)
    mockUseRoute = vi.mocked(imports.useRoute)
    mockUseSiteUrl = vi.mocked(imports.useSiteUrl)

    // Set up default mocks
    mockUseRoute.mockReturnValue({
      path: '/about'
    } as any)

    mockUseI18n.mockReturnValue({
      locale: { value: 'es' },
      locales: {
        value: [
          { code: 'es', name: 'Español' },
          { code: 'en', name: 'English' },
          { code: 'ro', name: 'Română' },
          { code: 'ru', name: 'Русский' }
        ]
      }
    } as any)

    mockUseLocalePath.mockImplementation((path: string, locale?: string) => {
      if (!locale || locale === 'es') return path
      return `/${locale}${path}`
    })

    mockUseSiteUrl.mockReturnValue({
      siteUrl: 'https://www.moldovadirect.com',
      toAbsoluteUrl: (path?: string) => {
        if (!path) return 'https://www.moldovadirect.com'
        return `https://www.moldovadirect.com${path.startsWith('/') ? '' : '/'}${path}`
      }
    })

    mockUseHead.mockImplementation(() => {})
  })

  it('should generate canonical URL based on current route when no path provided', async () => {
    const { useLandingSeo } = await import('~/composables/useLandingSeo')

    const result = useLandingSeo({
      title: 'Test Page',
      description: 'Test description'
    })

    expect(result.canonicalUrl).toBe('https://www.moldovadirect.com/about')
  })

  it('should generate locale-aware canonical URL when path is provided', async () => {
    const { useLandingSeo } = await import('~/composables/useLandingSeo')

    mockUseI18n.mockReturnValue({
      locale: { value: 'en' },
      locales: {
        value: [
          { code: 'es', name: 'Español' },
          { code: 'en', name: 'English' }
        ]
      }
    } as any)

    const result = useLandingSeo({
      title: 'Test Page',
      description: 'Test description',
      path: '/about'
    })

    expect(result.canonicalUrl).toBe('https://www.moldovadirect.com/en/about')
  })

  it('should set up comprehensive meta tags', async () => {
    const { useLandingSeo } = await import('~/composables/useLandingSeo')

    useLandingSeo({
      title: 'About Us',
      description: 'Learn about our company',
      keywords: ['about', 'company', 'Moldova Direct']
    })

    expect(mockUseHead).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'About Us',
        meta: expect.arrayContaining([
          { name: 'description', content: 'Learn about our company' },
          { name: 'robots', content: 'index,follow' },
          { name: 'keywords', content: 'about, company, Moldova Direct' },
          { property: 'og:type', content: 'website' },
          { property: 'og:site_name', content: 'Moldova Direct' },
          { property: 'og:title', content: 'About Us' },
          { property: 'og:description', content: 'Learn about our company' }
        ])
      })
    )
  })

  it('should handle string keywords', async () => {
    const { useLandingSeo } = await import('~/composables/useLandingSeo')

    useLandingSeo({
      title: 'Test',
      description: 'Test',
      keywords: 'keyword1, keyword2'
    })

    expect(mockUseHead).toHaveBeenCalledWith(
      expect.objectContaining({
        meta: expect.arrayContaining([
          { name: 'keywords', content: 'keyword1, keyword2' }
        ])
      })
    )
  })

  it('should use SEO defaults for missing optional fields', async () => {
    const { useLandingSeo } = await import('~/composables/useLandingSeo')

    useLandingSeo({
      title: 'Test',
      description: 'Test'
    })

    expect(mockUseHead).toHaveBeenCalledWith(
      expect.objectContaining({
        meta: expect.arrayContaining([
          { name: 'robots', content: 'index,follow' },
          { property: 'og:type', content: 'website' },
          { property: 'og:image', content: 'https://www.moldovadirect.com/icon.svg' }
        ])
      })
    )
  })

  it('should generate alternate hreflang links for multiple locales', async () => {
    const { useLandingSeo } = await import('~/composables/useLandingSeo')

    useLandingSeo({
      title: 'Test',
      description: 'Test',
      path: '/about'
    })

    expect(mockUseHead).toHaveBeenCalledWith(
      expect.objectContaining({
        link: expect.arrayContaining([
          { rel: 'canonical', href: 'https://www.moldovadirect.com/about' },
          { rel: 'alternate', hreflang: 'es', href: expect.any(String) },
          { rel: 'alternate', hreflang: 'en', href: expect.any(String) },
          { rel: 'alternate', hreflang: 'ro', href: expect.any(String) },
          { rel: 'alternate', hreflang: 'ru', href: expect.any(String) },
          { rel: 'alternate', hreflang: 'x-default', href: 'https://www.moldovadirect.com/about' }
        ])
      })
    )
  })

  it('should generate og:locale:alternate for non-current locales', async () => {
    const { useLandingSeo } = await import('~/composables/useLandingSeo')

    useLandingSeo({
      title: 'Test',
      description: 'Test'
    })

    expect(mockUseHead).toHaveBeenCalledWith(
      expect.objectContaining({
        meta: expect.arrayContaining([
          { property: 'og:locale', content: 'es' },
          { property: 'og:locale:alternate', content: 'en' },
          { property: 'og:locale:alternate', content: 'ro' },
          { property: 'og:locale:alternate', content: 'ru' }
        ])
      })
    )
  })

  it('should generate structured data scripts', async () => {
    const { useLandingSeo } = await import('~/composables/useLandingSeo')

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Moldova Direct'
    }

    useLandingSeo({
      title: 'Test',
      description: 'Test',
      structuredData
    })

    expect(mockUseHead).toHaveBeenCalledWith(
      expect.objectContaining({
        script: expect.arrayContaining([
          {
            type: 'application/ld+json',
            children: JSON.stringify(structuredData)
          }
        ])
      })
    )
  })

  it('should generate breadcrumb structured data', async () => {
    const { useLandingSeo } = await import('~/composables/useLandingSeo')

    useLandingSeo({
      title: 'Test',
      description: 'Test',
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' }
      ]
    })

    expect(mockUseHead).toHaveBeenCalledWith(
      expect.objectContaining({
        script: expect.arrayContaining([
          expect.objectContaining({
            type: 'application/ld+json',
            children: expect.stringContaining('BreadcrumbList')
          })
        ])
      })
    )
  })

  it('should handle multiple structured data objects', async () => {
    const { useLandingSeo } = await import('~/composables/useLandingSeo')

    const structuredData = [
      { '@context': 'https://schema.org', '@type': 'Organization' },
      { '@context': 'https://schema.org', '@type': 'WebSite' }
    ]

    useLandingSeo({
      title: 'Test',
      description: 'Test',
      structuredData
    })

    expect(mockUseHead).toHaveBeenCalledWith(
      expect.objectContaining({
        script: expect.arrayContaining([
          {
            type: 'application/ld+json',
            children: JSON.stringify(structuredData[0])
          },
          {
            type: 'application/ld+json',
            children: JSON.stringify(structuredData[1])
          }
        ])
      })
    )
  })

  it('should return helper functions', async () => {
    const { useLandingSeo } = await import('~/composables/useLandingSeo')

    const result = useLandingSeo({
      title: 'Test',
      description: 'Test'
    })

    expect(result).toHaveProperty('canonicalUrl')
    expect(result).toHaveProperty('siteUrl')
    expect(result).toHaveProperty('toAbsoluteUrl')
    expect(typeof result.toAbsoluteUrl).toBe('function')
  })

  it('should use custom image and imageAlt', async () => {
    const { useLandingSeo } = await import('~/composables/useLandingSeo')

    useLandingSeo({
      title: 'Test',
      description: 'Test',
      image: '/custom-image.jpg',
      imageAlt: 'Custom alt text'
    })

    expect(mockUseHead).toHaveBeenCalledWith(
      expect.objectContaining({
        meta: expect.arrayContaining([
          { property: 'og:image', content: 'https://www.moldovadirect.com/custom-image.jpg' },
          { property: 'og:image:alt', content: 'Custom alt text' },
          { name: 'twitter:image', content: 'https://www.moldovadirect.com/custom-image.jpg' },
          { name: 'twitter:image:alt', content: 'Custom alt text' }
        ])
      })
    )
  })

  it('should use title as imageAlt fallback', async () => {
    const { useLandingSeo } = await import('~/composables/useLandingSeo')

    useLandingSeo({
      title: 'Test Title',
      description: 'Test'
    })

    expect(mockUseHead).toHaveBeenCalledWith(
      expect.objectContaining({
        meta: expect.arrayContaining([
          { property: 'og:image:alt', content: 'Test Title' },
          { name: 'twitter:image:alt', content: 'Test Title' }
        ])
      })
    )
  })
})
