/**
 * Critical Test Constants
 *
 * Centralized constants for selectors, timeouts, and test data
 * to eliminate magic numbers and hard-coded values.
 *
 * Updated for Hybrid Progressive Checkout (Option D)
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
  // ===========================================
  // Cart Selectors
  // ===========================================

  /** Cart count badge selectors (in priority order) */
  CART_COUNT: [
    '[data-testid="cart-count"]',
    '[data-testid="cart-badge"]',
    '.cart-count',
    '[aria-label*="cart"] [aria-label*="item"]',
  ],

  /** Add to cart button */
  ADD_TO_CART: 'button:has-text("Añadir al Carrito")',

  /** Cart quantity controls - use aria-label for Spanish locale */
  INCREASE_QUANTITY: 'button[aria-label="Aumentar cantidad"], button[aria-label*="increase"], [data-testid="increase-quantity"]',
  DECREASE_QUANTITY: 'button[aria-label="Disminuir cantidad"], button[aria-label*="decrease"], [data-testid="decrease-quantity"]',
  ITEM_QUANTITY: '[aria-label*="cantidad"] span, [data-testid="item-quantity"], .min-w-\\[2rem\\]',

  /** Remove item button - use aria-label for Spanish locale */
  REMOVE_ITEM: 'button[aria-label="Eliminar artículo"], button[aria-label*="remove"], [data-testid="remove-item"]',

  /** Empty cart message */
  EMPTY_CART: '[data-testid="empty-cart-message"], :has-text("carrito está vacío"), :has-text("empty")',

  /** Product card */
  PRODUCT_CARD: '[data-testid="product-card"]',

  // ===========================================
  // Checkout Selectors (Hybrid Single-Page)
  // ===========================================

  /** Checkout form container */
  CHECKOUT_FORM: '.checkout-form-container, [data-testid="checkout-form"], form',

  /** Checkout sections */
  CHECKOUT_SECTION: '.checkout-section',
  CHECKOUT_SECTION_HIGHLIGHT: '.checkout-section-highlight',

  /** Section completion indicator */
  SECTION_COMPLETE: '.section-complete',

  /** Section numbers */
  SECTION_NUMBER: '.section-number',

  // ===========================================
  // Express Checkout Selectors
  // ===========================================

  /** Express checkout banner */
  EXPRESS_BANNER: '[class*="ExpressCheckoutBanner"], [data-testid="express-checkout-banner"]',

  /** Express checkout buttons */
  EXPRESS_PLACE_ORDER: 'button:has-text("Place Order Now"), button:has-text("Realizar Pedido Ahora")',
  EXPRESS_EDIT: 'button:has-text("Edit"), button:has-text("Editar")',

  // ===========================================
  // Guest Checkout Selectors
  // ===========================================

  /** Guest checkout prompt */
  GUEST_PROMPT: '[class*="GuestCheckoutPrompt"], [data-testid="guest-checkout-prompt"]',

  /** Continue as guest button */
  CONTINUE_AS_GUEST: 'button:has-text("Continue as Guest"), button:has-text("Continuar como Invitado")',

  /** Guest email input */
  GUEST_EMAIL: 'input[type="email"][name="email"], input[id="guest-email"]',

  // ===========================================
  // Address Form Selectors
  // ===========================================

  /** Address form fields - Updated for Hybrid Checkout with single fullName field */
  ADDRESS_FULL_NAME: 'input[name="fullName"], input[id="fullName"]',
  ADDRESS_STREET: 'input[name="street"], input[id="street"]',
  ADDRESS_CITY: 'input[name="city"], input[id="city"]',
  ADDRESS_POSTAL_CODE: 'input[name="postalCode"], input[id="postalCode"]',
  ADDRESS_COUNTRY: 'select[name="country"], select[id="country"]',
  ADDRESS_PHONE: 'input[name="phone"], input[id="phone"], input[type="tel"]',

  // ===========================================
  // Shipping Method Selectors
  // ===========================================

  /** Shipping method options */
  SHIPPING_METHOD_OPTIONS: '[class*="ShippingMethodSelector"] input[type="radio"], [data-testid="shipping-method-option"]',

  /** Shipping method loading */
  SHIPPING_METHOD_LOADING: '[class*="ShippingMethodSelector"] .animate-spin',

  // ===========================================
  // Payment Selectors
  // ===========================================

  /** Payment method options */
  PAYMENT_CASH: 'input[type="radio"][value="cash"], [data-testid="payment-cash"]',
  PAYMENT_CARD: 'input[type="radio"][value="credit_card"], [data-testid="payment-card"]',

  // ===========================================
  // Terms & Order Selectors
  // ===========================================

  /** Terms checkboxes */
  TERMS_CHECKBOX: 'input[type="checkbox"][id="terms"], input[name="terms"]',
  PRIVACY_CHECKBOX: 'input[type="checkbox"][id="privacy"], input[name="privacy"]',
  MARKETING_CHECKBOX: 'input[type="checkbox"][id="marketing"], input[name="marketing"]',

  /** Place order button */
  PLACE_ORDER_BUTTON: 'button:has-text("Place Order"), button:has-text("Realizar Pedido"), button:has-text("Оформить заказ"), button:has-text("Plasează comanda")',

  // ===========================================
  // Order Summary Selectors
  // ===========================================

  /** Order summary card */
  ORDER_SUMMARY: '[class*="OrderSummaryCard"], [data-testid="order-summary"]',
  ORDER_SUMMARY_TOTAL: '[class*="OrderSummaryCard"] [class*="total"], [data-testid="order-total"]',

  // ===========================================
  // Mobile Selectors
  // ===========================================

  /** Mobile sticky footer */
  MOBILE_FOOTER: '.lg\\:hidden.fixed.bottom-0, [data-testid="mobile-checkout-footer"]',

  // ===========================================
  // Auth Selectors
  // ===========================================

  /** Logout button variations */
  LOGOUT: 'button:has-text("Cerrar sesión"), button:has-text("Logout"), a:has-text("Cerrar sesión"), [data-testid="logout-button"]',

  /** Login form inputs */
  EMAIL_INPUT: 'input[type="email"]',
  PASSWORD_INPUT: 'input[type="password"]',
  SUBMIT_BUTTON: 'button[type="submit"]',

  // ===========================================
  // Admin Selectors
  // ===========================================

  /** Admin dashboard */
  ADMIN_DASHBOARD: '[data-testid="admin-dashboard"], h1:has-text("Panel"), h1:has-text("Dashboard")',

  // ===========================================
  // Search Selectors
  // ===========================================

  /** Search elements */
  SEARCH_INPUT: '[data-testid="search-input"], input[type="search"], input[placeholder*="Buscar"], input[aria-label*="search"]',
  SEARCH_BUTTON: '[data-testid="search-button"], button[aria-label*="search"], button[type="submit"]:has(svg)',
  SEARCH_RESULTS: '[data-testid="search-results"], .search-results',
  SEARCH_SUGGESTION: '[data-testid="search-suggestion"], .search-suggestion',

  // ===========================================
  // Feedback Selectors
  // ===========================================

  /** Toast notifications */
  TOAST: '[class*="toast"], [class*="notification"], [role="alert"]',

  /** Loading spinner */
  LOADING_SPINNER: '.animate-spin',

  /** Error messages */
  ERROR_MESSAGE: '[class*="error"], .text-red-500, .text-red-600',
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
  CHECKOUT_CONFIRMATION: /\/checkout\/confirmation/,
  ADMIN: /\/admin/,
  ADMIN_DASHBOARD: /\/admin\/(dashboard)?$/,
  SEARCH: /\/products\?.*q=/,
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

  /** Test shipping address - uses fullName which is split into firstName/lastName internally */
  TEST_ADDRESS: {
    fullName: 'Test User',
    street: '123 Test Street',
    city: 'Test City',
    postalCode: '12345',
    country: 'ES',
    phone: '+34 600 123 456',
  },

  /** Guest test email */
  GUEST_EMAIL: 'guest.test@example.com',
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
  CHECKOUT_FORM_NOT_VISIBLE: 'Checkout form should be visible on checkout page',
  ADMIN_NOT_ACCESSIBLE: 'Admin dashboard should be accessible to admin users',
  SEARCH_NO_RESULTS: 'Expected search to return results',
  SEARCH_INPUT_NOT_FOUND: 'Search input not found on page',
  EXPRESS_BANNER_UNEXPECTED: 'Express checkout banner should not appear for guests',
  PLACE_ORDER_NOT_ENABLED: 'Place order button should be enabled when form is complete',
  ORDER_NOT_COMPLETED: 'Order should complete and redirect to confirmation',
} as const
