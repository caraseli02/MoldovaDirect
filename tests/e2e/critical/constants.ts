/**
 * Critical Test Constants
 *
 * Centralized constants for selectors, timeouts, and test data
 * to eliminate magic numbers and hard-coded values.
 */

/**
 * Timeout values in milliseconds
 */
export const TIMEOUTS = {
  /** Very short wait - 500ms */
  VERY_SHORT: 500,

  /** Short wait - 1 second */
  SHORT: 1000,

  /** Standard wait - 5 seconds */
  STANDARD: 5000,

  /** Navigation/long operations - 10 seconds */
  LONG: 10000,

  /** Extended operations - 30 seconds */
  EXTENDED: 30000,
} as const

/**
 * Common selectors used across tests
 */
export const SELECTORS = {
  /** Cart count badge selectors (in priority order) */
  CART_COUNT: [
    '[data-testid="cart-count"]',
    '[data-testid="cart-badge"]',
    '.cart-count',
    '[aria-label*="cart"] [aria-label*="item"]'
  ],

  /** Add to cart button */
  ADD_TO_CART: 'button:has-text("Añadir al Carrito")',

  /** Logout button variations */
  LOGOUT: 'button:has-text("Cerrar sesión"), button:has-text("Logout"), a:has-text("Cerrar sesión"), [data-testid="logout-button"]',

  /** Checkout form */
  CHECKOUT_FORM: 'form, [data-testid="checkout-form"]',

  /** Product card */
  PRODUCT_CARD: '[data-testid="product-card"]',

  /** Cart quantity controls */
  INCREASE_QUANTITY: '[data-testid="increase-quantity"], button:has-text("+")',
  DECREASE_QUANTITY: '[data-testid="decrease-quantity"], button:has-text("-")',
  ITEM_QUANTITY: '[data-testid="item-quantity"], input[type="number"]',

  /** Remove item button */
  REMOVE_ITEM: '[data-testid="remove-item"], button:has-text("Eliminar"), button[aria-label*="emove"]',

  /** Empty cart message */
  EMPTY_CART: ':has-text("carrito está vacío"), :has-text("No items"), :has-text("empty")',

  /** Admin dashboard */
  ADMIN_DASHBOARD: '[data-testid="admin-dashboard"], h1:has-text("Panel"), h1:has-text("Dashboard")',

  /** Login form inputs */
  EMAIL_INPUT: 'input[type="email"]',
  PASSWORD_INPUT: 'input[type="password"]',
  SUBMIT_BUTTON: 'button[type="submit"]',
} as const

/**
 * URL patterns for navigation assertions
 */
export const URL_PATTERNS = {
  HOME: /^\/($|es|en|ro|ru)/,
  LOGIN: /\/auth\/login/,
  REGISTER: /\/auth\/register/,
  ACCOUNT: /\/account/,
  PRODUCTS: /\/products/,
  PRODUCT_DETAIL: /\/products\/[^/]+/,
  CART: /\/cart/,
  CHECKOUT: /\/checkout/,
  ADMIN: /\/admin/,
  ADMIN_DASHBOARD: /\/admin\/(dashboard)?$/,
} as const

/**
 * Test data constants
 */
export const TEST_DATA = {
  /** Default test user email */
  DEFAULT_TEST_EMAIL: 'teste2e@example.com',

  /** Default admin email fallback */
  DEFAULT_ADMIN_EMAIL: 'admin@example.com',

  /** Minimum products expected on products page */
  MIN_PRODUCTS: 1,
} as const

/**
 * Error messages for better test failure debugging
 */
export const ERROR_MESSAGES = {
  NO_PASSWORD: 'TEST_USER_PASSWORD environment variable is required',
  NO_ADMIN_PASSWORD: 'ADMIN_PASSWORD or TEST_USER_PASSWORD environment variable is required',
  CART_NOT_UPDATED: 'Expected cart count to update after adding product',
  LOGIN_FAILED: 'Login failed - did not redirect to account page',
  LOGOUT_FAILED: 'Logout failed - did not redirect to home or login page',
  PRODUCT_NOT_FOUND: 'Expected at least one product card to be visible',
  CHECKOUT_NOT_ACCESSIBLE: 'Checkout page should be accessible with items in cart',
  ADMIN_NOT_ACCESSIBLE: 'Admin dashboard should be accessible to admin users',
} as const
