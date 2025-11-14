import { useHead, useI18n, useLocalePath, useRoute, useSiteUrl } from '#imports'
import type { MetaObject } from 'nuxt/schema'
import { SEO_DEFAULTS } from '~/constants/seo'

export interface BreadcrumbInput {
  name: string
  path: string
}

export interface LandingSeoInput {
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

/**
 * Generates SEO metadata for landing pages including OpenGraph, Twitter Cards,
 * canonical URLs, structured data, and i18n alternate links.
 *
 * This composable automatically sets up comprehensive SEO tags based on the current
 * locale and route. The canonical URL is generated using the current locale unless
 * a specific path is provided, ensuring proper SEO for multilingual sites.
 *
 * @param {LandingSeoInput} input - SEO configuration options
 * @returns {LandingSeoHelpers} Helper functions for URL generation
 * @example
 * useLandingSeo({
 *   title: 'About Us - Moldova Direct',
 *   description: 'Learn about our company',
 *   image: '/about-hero.jpg',
 *   breadcrumbs: [
 *     { name: 'Home', path: '/' },
 *     { name: 'About', path: '/about' }
 *   ]
 * })
 */
export function useLandingSeo(input: LandingSeoInput): LandingSeoHelpers {
  // Safely access composables with try-catch for ISR compatibility
  let route, locale, locales, localePath, siteUrl, toAbsoluteUrl

  try {
    route = useRoute()
    const i18n = useI18n()
    locale = i18n.locale
    locales = i18n.locales
    localePath = useLocalePath()
    const siteUrlHelpers = useSiteUrl()
    siteUrl = siteUrlHelpers.siteUrl
    toAbsoluteUrl = siteUrlHelpers.toAbsoluteUrl
  } catch (error) {
    console.warn('[useLandingSeo] Error accessing composables during ISR, using fallbacks:', error)
    // Fallback values for ISR context
    const fallbackSiteUrl = 'https://moldova-direct.vercel.app'
    return {
      canonicalUrl: input.path ? `${fallbackSiteUrl}${input.path}` : fallbackSiteUrl,
      siteUrl: fallbackSiteUrl,
      toAbsoluteUrl: (path?: string) => path ? `${fallbackSiteUrl}${path}` : fallbackSiteUrl
    }
  }

  // Use current route path if no path is provided, ensuring locale-aware canonical URLs
  // If a path is provided, convert it to the current locale's path
  // During ISR, route.path might be undefined, so fallback to '/'
  const routePath = route?.path || '/'
  const canonicalPath = input.path ? localePath(input.path) : routePath
  const canonicalUrl = toAbsoluteUrl(canonicalPath)
  const ogImage = toAbsoluteUrl(input.image ?? SEO_DEFAULTS.DEFAULT_IMAGE)
  const imageAlt = input.imageAlt ?? input.title
  const keywords = Array.isArray(input.keywords) ? input.keywords.join(', ') : input.keywords
  const robots = input.robots ?? SEO_DEFAULTS.DEFAULT_ROBOTS
  const pageType = input.pageType ?? SEO_DEFAULTS.DEFAULT_PAGE_TYPE

  // Properly type locale codes from i18n
  const localeCodes = (locales.value || []).map((loc) =>
    typeof loc === 'string' ? loc : loc.code
  )
  const currentLocale = locale.value || 'es'

  const meta: MetaObject['meta'] = [
    { name: 'description', content: input.description },
    { name: 'robots', content: robots },
    keywords ? { name: 'keywords', content: keywords } : null,
    { property: 'og:type', content: pageType },
    { property: 'og:site_name', content: SEO_DEFAULTS.SITE_NAME },
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

  const links: MetaObject['link'] = [{ rel: 'canonical', href: canonicalUrl }]

  // Optimize locale handling by iterating once for both og:locale:alternate and hreflang
  if (localeCodes.length > 1) {
    // Get the base path without locale prefix for generating alternate links
    // Dynamically build locale pattern from available locales to avoid maintenance issues
    const localePattern = new RegExp(`^/(${localeCodes.join('|')})`)
    const basePath = input.path || routePath.replace(localePattern, '') || '/'

    for (const code of localeCodes) {
      if (code !== currentLocale) {
        meta.push({ property: 'og:locale:alternate', content: code.replace('_', '-') })
      }
      const localizedPath = localePath(basePath, code)
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
