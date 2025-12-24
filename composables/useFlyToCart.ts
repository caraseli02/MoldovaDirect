/**
 * Fly-to-Cart Animation Composable
 *
 * Creates a visual animation where a product thumbnail "flies" from the product card
 * to the cart icon when adding items to cart.
 *
 * Features:
 * - SSR-safe with client-only execution
 * - Responsive: targets mobile bottom nav or desktop header cart
 * - CSS-based animation for performance
 * - Respects prefers-reduced-motion
 * - Emits completion callback for cart bounce trigger
 */

import { useDevice } from './useDevice'

interface FlyToCartOptions {
  /** Source element (product image) to animate from */
  sourceElement: HTMLElement | null
  /** Image URL to display in the flying thumbnail */
  imageUrl: string
  /** Callback when animation completes */
  onComplete?: () => void
}

// Cart target selectors
const CART_SELECTORS = {
  desktop: '[data-cart-target="desktop"]',
  mobile: '[data-cart-target="mobile"]',
  fallback: '[data-testid="cart-count"]',
}

export function useFlyToCart() {
  const { isMobile } = useDevice()

  /**
   * Trigger fly-to-cart animation
   */
  const fly = async (options: FlyToCartOptions): Promise<void> => {
    // SSR guard - only run on client
    if (!import.meta.client || typeof window === 'undefined') {
      options.onComplete?.()
      return
    }

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      options.onComplete?.()
      return
    }

    const { sourceElement, imageUrl, onComplete } = options

    if (!sourceElement) {
      onComplete?.()
      return
    }

    // Get cart target position
    const cartTarget = getCartTarget(isMobile.value)
    if (!cartTarget) {
      onComplete?.()
      return
    }

    // Get positions
    const sourceRect = sourceElement.getBoundingClientRect()
    const targetRect = cartTarget.getBoundingClientRect()

    // Create flying element
    const flyingEl = createFlyingElement(imageUrl, sourceRect)
    document.body.appendChild(flyingEl)

    // Calculate animation path
    const deltaX = targetRect.left + targetRect.width / 2 - (sourceRect.left + sourceRect.width / 2)
    const deltaY = targetRect.top + targetRect.height / 2 - (sourceRect.top + sourceRect.height / 2)

    // Set CSS custom properties for animation
    flyingEl.style.setProperty('--fly-end-x', `${deltaX}px`)
    flyingEl.style.setProperty('--fly-end-y', `${deltaY}px`)

    // Trigger animation
    requestAnimationFrame(() => {
      flyingEl.classList.add('fly-to-cart-animate')
    })

    // Clean up after animation
    const animationDuration = 600 // matches CSS animation duration
    setTimeout(() => {
      flyingEl.remove()
      onComplete?.()
    }, animationDuration)
  }

  return { fly }
}

/**
 * Get the cart icon element based on device type
 */
function getCartTarget(isMobile: boolean): HTMLElement | null {
  // Try device-specific selector first
  const selector = isMobile ? CART_SELECTORS.mobile : CART_SELECTORS.desktop

  let target = document.querySelector<HTMLElement>(selector)

  // Fallback to generic cart count selector
  if (!target) {
    target = document.querySelector<HTMLElement>(CART_SELECTORS.fallback)
  }

  return target
}

/**
 * Create the flying thumbnail element
 */
function createFlyingElement(imageUrl: string, sourceRect: DOMRect): HTMLElement {
  const el = document.createElement('div')
  el.className = 'fly-to-cart-element'

  // Position at source
  el.style.cssText = `
    position: fixed;
    left: ${sourceRect.left + sourceRect.width / 2 - 24}px;
    top: ${sourceRect.top + sourceRect.height / 2 - 24}px;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    overflow: hidden;
    z-index: 9999;
    pointer-events: none;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  `

  // Add image
  const img = document.createElement('img')
  img.src = imageUrl
  img.alt = ''
  img.style.cssText = 'width: 100%; height: 100%; object-fit: cover;'
  el.appendChild(img)

  return el
}
