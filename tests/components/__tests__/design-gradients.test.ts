/**
 * design-5: Tests for gradient removal across components
 *
 * Verifies that components follow design-guide principles:
 * - No gradient backgrounds (solid colors preferred)
 * - Exception: Image overlays for text readability are acceptable
 */

import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const componentsDir = resolve(__dirname, '../../../components')

// Components that should have NO gradients (section/card backgrounds)
const noGradientComponents = [
  'home/HeroSection.vue',
  'home/ServicesSection.vue',
  'home/SocialProofSection.vue',
  'checkout/ShippingMethodSelector.vue',
  'checkout/GuestCheckoutPrompt.vue',
  'checkout/ExpressCheckoutBannerEnhanced.vue',
  'order/OrderMetrics.vue',
  'order/OrderDeliveryConfirmation.vue',
]

// Components with image overlays that are acceptable (dark overlays for text readability)
const imageOverlayComponents = [
  'home/CategoryGrid.vue',
  'product/Card.vue',
  'product/Hero.vue',
  'product/EditorialStories.vue',
  'producer/Card.vue',
  'producer/DetailModal.vue',
  'pairing/Card.vue',
]

describe('Gradient Removal (design-5)', () => {
  describe.each(noGradientComponents)('%s', (componentPath) => {
    const fullPath = resolve(componentsDir, componentPath)

    it('should exist', () => {
      expect(existsSync(fullPath)).toBe(true)
    })

    it('should NOT have bg-gradient-to-* classes', () => {
      if (!existsSync(fullPath)) return

      const source = readFileSync(fullPath, 'utf-8')
      const hasGradient = /\bbg-gradient-to-(br|bl|tr|tl|t|b|l|r)\b/.test(source)
      expect(hasGradient).toBe(false)
    })

    it('should NOT have from-*/to-* gradient color classes', () => {
      if (!existsSync(fullPath)) return

      const source = readFileSync(fullPath, 'utf-8')
      // Check for gradient color stops (but not opacity like from-black/60)
      const hasGradientColors = /\bfrom-[a-zA-Z]+-\d+(?!\/)\b.*\bto-[a-zA-Z]/.test(source)
      expect(hasGradientColors).toBe(false)
    })
  })

  describe('Image overlay components (gradients allowed)', () => {
    // These components use gradients for image overlays (text readability)
    // which is an acceptable design pattern
    it.each(imageOverlayComponents)('%s exists and may have overlay gradients', (componentPath) => {
      const fullPath = resolve(componentsDir, componentPath)
      expect(existsSync(fullPath)).toBe(true)
    })
  })
})
