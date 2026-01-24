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

  // Tier 2: High Value - Strong engagement and trust builders
  collectionsShowcase: boolean
  socialProof: boolean
  trustBadges: boolean

  // Tier 3: Support - Additional context
  howItWorks: boolean
  services: boolean
  faqPreview: boolean
  newsletter: boolean
}

export const useLandingConfig = () => {
  const config: LandingPageConfig = {
    // Tier 1: Critical (Always enabled)
    announcementBar: true,
    videoHero: true,
    categoryGrid: true,
    featuredProducts: true,

    // Tier 2: High Value
    collectionsShowcase: true,
    socialProof: true,
    trustBadges: true,

    // Tier 3: Support
    howItWorks: true,
    services: true,
    faqPreview: true,
    newsletter: true,
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
    const tier2 = ['collectionsShowcase', 'socialProof', 'trustBadges']
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
