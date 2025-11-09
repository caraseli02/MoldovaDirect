/**
 * Landing Page Section Configuration
 *
 * Centralized feature flag system for managing landing page sections.
 * This composable follows the KISS principle by allowing easy toggling
 * of sections without code changes.
 *
 * Sections are organized in 3 tiers based on conversion impact:
 * - Tier 1 (Critical): Core conversion elements
 * - Tier 2 (High Value): Strong engagement and trust builders
 * - Tier 3 (Support): Additional context and engagement
 */

interface LandingPageConfig {
  // Tier 1: Critical - Core conversion elements
  announcementBar: boolean
  videoHero: boolean
  categoryGrid: boolean
  featuredProducts: boolean

  // Tier 2: High Value - Strong engagement and trust
  producerStories: boolean
  collectionsShowcase: boolean
  pairingGuides: boolean
  wineStoryCta: boolean
  socialProof: boolean
  mediaMentions: boolean
  trustBadges: boolean
  certificationBar: boolean

  // Tier 3: Support - Additional context
  howItWorks: boolean
  services: boolean
  faqPreview: boolean
  newsletter: boolean

  // Disabled - Non-functional or problematic sections
  productQuiz: boolean
  ugcGallery: boolean
  realtimeNotification: boolean
}

export const useLandingConfig = () => {
  const config: LandingPageConfig = {
    // Tier 1: Critical (Always enabled)
    announcementBar: true,
    videoHero: true,
    categoryGrid: true,
    featuredProducts: true,

    // Tier 2: High Value
    producerStories: false, // Moved to /wine-story page to avoid duplication
    collectionsShowcase: true,
    pairingGuides: false, // Moved to /wine-story page to avoid duplication
    wineStoryCta: true,
    socialProof: true,
    mediaMentions: true,
    trustBadges: true,
    certificationBar: true,

    // Tier 3: Support
    howItWorks: true,
    services: true,
    faqPreview: true,
    newsletter: true,

    // Disabled - Issues identified in KISS principle analysis:
    // - ProducerStories: Moved to /wine-story to avoid content duplication
    // - PairingGuides: Moved to /wine-story to avoid content duplication
    // - ProductQuiz: No backend, shows skeleton placeholders (components/home/ProductQuiz.vue:222-233)
    // - UgcGallery: 100% fabricated content, legal/trust violation (components/home/UgcGallery.vue:138-205)
    // - RealtimeNotification: Fake purchase notifications, EU consumer protection violations
    productQuiz: false,
    ugcGallery: false,
    realtimeNotification: false,
  }

  /**
   * Check if a specific section is enabled
   * @param sectionKey - The section identifier from LandingPageConfig
   * @returns boolean indicating if section should be rendered
   */
  const isSectionEnabled = (sectionKey: keyof LandingPageConfig): boolean => {
    return config[sectionKey] ?? false
  }

  /**
   * Get all enabled sections (useful for debugging)
   * @returns Array of enabled section keys
   */
  const getEnabledSections = (): string[] => {
    return Object.entries(config)
      .filter(([_, enabled]) => enabled)
      .map(([key]) => key)
  }

  /**
   * Get section count by tier
   * @returns Object with counts per tier
   */
  const getSectionStats = () => {
    const tier1 = ['announcementBar', 'videoHero', 'categoryGrid', 'featuredProducts']
    const tier2 = ['producerStories', 'collectionsShowcase', 'pairingGuides', 'wineStoryCta', 'socialProof', 'mediaMentions', 'trustBadges', 'certificationBar']
    const tier3 = ['howItWorks', 'services', 'faqPreview', 'newsletter']

    return {
      tier1: tier1.filter(key => config[key as keyof LandingPageConfig]).length,
      tier2: tier2.filter(key => config[key as keyof LandingPageConfig]).length,
      tier3: tier3.filter(key => config[key as keyof LandingPageConfig]).length,
      total: getEnabledSections().length,
    }
  }

  return {
    config,
    isSectionEnabled,
    getEnabledSections,
    getSectionStats,
  }
}
