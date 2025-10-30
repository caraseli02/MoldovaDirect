import { useHead, useI18n, useLocalePath, useRoute, useSiteUrl } from '#imports'
import type { MetaObject } from 'nuxt/schema'

interface BreadcrumbInput {
  name: string
  path: string
}

interface LandingSeoInput {
  title: string
  description: string
  path?: string
  image?: string
  imageAlt?: string
  pageType?: 'website' | 'article' | 'webpage' | string
  keywords?: string[] | string
  robots?: string
  structuredData?: Record<string, unknown> | Array<Record<string, unknown>>
  breadcrumbs?: BreadcrumbInput[]
}

interface LandingSeoHelpers {
  canonicalUrl: string
  siteUrl: string
  toAbsoluteUrl: (path?: string) => string
}

export function useLandingSeo(input: LandingSeoInput): LandingSeoHelpers {
  const route = useRoute()
  const { locale, locales } = useI18n()
  const localePath = useLocalePath()
  const { siteUrl, toAbsoluteUrl } = useSiteUrl()

  const canonicalPath = input.path ?? route.path
  const canonicalUrl = toAbsoluteUrl(canonicalPath)
  const ogImage = toAbsoluteUrl(input.image ?? '/icon.svg')
  const imageAlt = input.imageAlt ?? input.title
  const keywords = Array.isArray(input.keywords) ? input.keywords.join(', ') : input.keywords
  const robots = input.robots ?? 'index,follow'
  const pageType = input.pageType ?? 'website'

  const localeCodes = (locales.value || []).map((loc: string | { code: string }) =>
    typeof loc === 'string' ? loc : loc.code
  )
  const currentLocale = locale.value || 'es'

  const meta: MetaObject['meta'] = [
    { name: 'description', content: input.description },
    { name: 'robots', content: robots },
    keywords ? { name: 'keywords', content: keywords } : null,
    { property: 'og:type', content: pageType },
    { property: 'og:site_name', content: 'Moldova Direct' },
    { property: 'og:title', content: input.title },
    { property: 'og:description', content: input.description },
    { property: 'og:url', content: canonicalUrl },
    { property: 'og:image', content: ogImage },
    { property: 'og:image:alt', content: imageAlt },
    { property: 'og:locale', content: currentLocale.replace('_', '-') },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: input.title },
    { name: 'twitter:description', content: input.description },
    { name: 'twitter:image', content: ogImage },
    { name: 'twitter:image:alt', content: imageAlt }
  ].filter(Boolean) as MetaObject['meta']

  if (localeCodes.length > 1) {
    for (const code of localeCodes) {
      if (code === currentLocale) continue
      meta.push({ property: 'og:locale:alternate', content: code.replace('_', '-') })
    }
  }

  const links: MetaObject['link'] = [{ rel: 'canonical', href: canonicalUrl }]

  if (localeCodes.length > 0) {
    for (const code of localeCodes) {
      const localizedPath = localePath(canonicalPath, code)
      links.push({ rel: 'alternate', hreflang: code, href: toAbsoluteUrl(localizedPath) })
    }
    links.push({ rel: 'alternate', hreflang: 'x-default', href: canonicalUrl })
  }

  const scripts: MetaObject['script'] = []
  const structuredData = input.structuredData
  if (structuredData) {
    const payloads = Array.isArray(structuredData) ? structuredData : [structuredData]
    for (const payload of payloads) {
      scripts.push({
        type: 'application/ld+json',
        children: JSON.stringify(payload)
      })
    }
  }

  if (input.breadcrumbs && input.breadcrumbs.length > 0) {
    const breadcrumbList = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: input.breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: toAbsoluteUrl(crumb.path)
      }))
    }
    scripts.push({
      type: 'application/ld+json',
      children: JSON.stringify(breadcrumbList)
    })
  }

  useHead({
    title: input.title,
    meta,
    link: links,
    script: scripts
  })

  return {
    canonicalUrl,
    siteUrl,
    toAbsoluteUrl
  }
}
