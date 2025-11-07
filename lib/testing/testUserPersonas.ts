import type { AuthUser } from '~/stores/auth'

// Reuse AuthUser type to maintain single source of truth
export type TestUserPersonaUser = AuthUser

export interface TestOrder {
  id: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  currency: string
  itemCount: number
  createdAt: string
  deliveredAt?: string
  items: Array<{
    productId: string
    name: string
    quantity: number
    price: number
  }>
}

export interface TestAddress {
  id: string
  type: 'shipping' | 'billing'
  isDefault: boolean
  name: string
  street: string
  city: string
  state: string
  postalCode: string
  country: string
  phone?: string
}

export interface TestCartItem {
  productId: string
  name: string
  quantity: number
  price: number
  image?: string
}

export interface TestPaymentMethod {
  id: string
  type: 'card' | 'paypal' | 'bank_transfer'
  isDefault: boolean
  last4?: string
  brand?: string
  expiryMonth?: number
  expiryYear?: number
}

export interface TestUserPreferences {
  notifications: {
    email: boolean
    sms: boolean
    orderUpdates: boolean
    promotions: boolean
  }
  marketing: {
    newsletter: boolean
    recommendations: boolean
  }
  display: {
    theme: 'light' | 'dark' | 'auto'
    currency: string
  }
}

export type SimulationMode = 'normal' | 'slow-network' | 'intermittent-errors' | 'offline'

export interface TestUserPersona {
  key: TestUserPersonaKey
  title: string
  summary: string
  goals: string[]
  focusAreas: string[]
  quickLinks: Array<{
    label: string
    description: string
    route: string
  }>
  testScript: string[]
  lockoutMinutes?: number
  user: TestUserPersonaUser
  orders?: TestOrder[]
  cart?: TestCartItem[]
  addresses?: TestAddress[]
  paymentMethods?: TestPaymentMethod[]
  preferences?: TestUserPreferences
  simulationMode?: SimulationMode
  changelog?: Array<{
    date: string
    changes: string
    version: string
  }>
}

export type TestUserPersonaKey =
  | 'first-order-explorer'
  | 'loyal-subscriber'
  | 'recovery-seeker'
  | 'cart-abandoner'
  | 'vip-customer'
  | 'international-shopper'
  | 'mobile-only-user'
  | 'bulk-buyer'

const baseDate = new Date('2024-01-15T08:30:00Z')

export const testUserPersonas: Record<TestUserPersonaKey, TestUserPersona> = {
  'first-order-explorer': {
    key: 'first-order-explorer',
    title: 'First Order Explorer',
    summary:
      'Covers the on-boarding flow: profile completion, discovering products, and going through checkout for the first time.',
    goals: [
      'Validate account dashboard layout and empty states',
      'Ensure profile editing UX is approachable for new customers',
      'Confirm checkout copy clearly guides an inexperienced shopper'
    ],
    focusAreas: ['Profile Basics', 'Cart Creation', 'Checkout Validation'],
    quickLinks: [
      {
        label: 'Account overview',
        description: 'Confirm empty dashboard cards render helpful guidance',
        route: '/account'
      },
      {
        label: 'Complete profile',
        description: 'Update contact information and language preferences',
        route: '/account/profile'
      },
      {
        label: 'Start checkout',
        description: 'Add a product to cart and walk through guest checkout copy',
        route: '/checkout'
      }
    ],
    testScript: [
      'Open the account dashboard and verify the “recent orders” empty state call-to-action.',
      'Navigate to Profile → edit the phone number and preferred language, then cancel the change to ensure buttons reset.',
      'Browse the featured products, add one to cart, and confirm the cart badge updates instantly.',
      'Proceed to checkout as guest and confirm form validations for required shipping fields.',
      'Return to the dashboard and ensure guidance still points the user to finish checkout.'
    ],
    user: {
      id: 'test-user-onboarding',
      email: 'test-onboarding@moldovadirect.com',
      emailVerified: true,
      name: 'Alex Explorer',
      phone: '+34666000001',
      preferredLanguage: 'en',
      lastLogin: new Date(baseDate.getTime() - 1000 * 60 * 60).toISOString(),
      createdAt: baseDate.toISOString(),
      updatedAt: baseDate.toISOString(),
      mfaEnabled: false,
      mfaFactors: []
    }
  },
  'loyal-subscriber': {
    key: 'loyal-subscriber',
    title: 'Loyal Subscriber',
    summary:
      'Represents a returning customer with multiple orders, saved addresses, and expectations around reorder speed.',
    goals: [
      'Verify dashboard statistics render realistic totals',
      'Test order detail pages and reorder shortcuts',
      'Validate that saved addresses pre-fill checkout forms'
    ],
    focusAreas: ['Order History', 'Reorder CTA', 'Saved Addresses'],
    quickLinks: [
      {
        label: 'Recent orders',
        description: 'Spot-check status chips, totals, and navigation to order detail',
        route: '/account/orders'
      },
      {
        label: 'Order detail',
        description: 'Ensure timeline, totals, and contact options are visible',
        route: '/account/orders/demo-loyal-order'
      },
      {
        label: 'Checkout with saved data',
        description: 'Confirm the shipping step offers stored address suggestions',
        route: '/checkout'
      }
    ],
    testScript: [
      'Review the dashboard metrics to confirm total order count, lifetime spend, and loyalty badges render.',
      'Open the most recent order and validate the shipment timeline, status pill, and download invoice link.',
      'Trigger the “reorder” shortcut (if available) and ensure cart contents refresh correctly.',
      'Begin checkout to verify address auto-complete and payment method persistence.',
      'Logout and log back in to confirm persisted personalization (language, name).'
    ],
    user: {
      id: 'test-user-loyal',
      email: 'test-loyal@moldovadirect.com',
      emailVerified: true,
      name: 'Maya Loyal',
      phone: '+34666000055',
      preferredLanguage: 'es',
      lastLogin: new Date(baseDate.getTime() - 1000 * 60 * 15).toISOString(),
      createdAt: new Date('2023-09-12T10:00:00Z').toISOString(),
      updatedAt: baseDate.toISOString(),
      mfaEnabled: false,
      mfaFactors: []
    }
  },
  'recovery-seeker': {
    key: 'recovery-seeker',
    title: 'Recovery Seeker',
    summary:
      'Focuses on account recovery, password reset, and email verification messaging for support scenarios.',
    goals: [
      'Exercise password reset from login and account screens',
      'Verify verification-pending messaging and resend flows',
      'Confirm account lockout messaging and timers display properly'
    ],
    focusAreas: ['Auth Messaging', 'Password Recovery', 'Lockout Timer'],
    quickLinks: [
      {
        label: 'Trigger lockout',
        description: 'Attempt failed logins and confirm lockout banner text',
        route: '/auth/login'
      },
      {
        label: 'Reset password',
        description: 'Start password recovery from login and verify confirmation screens',
        route: '/auth/forgot-password'
      },
      {
        label: 'Verification pending',
        description: 'Use the verification pending screen with persona email to test copy',
        route: '/auth/verification-pending?email=test-recovery@moldovadirect.com'
      }
    ],
    testScript: [
      'Open the login page and intentionally fail to log in three times to surface lockout messaging.',
      'Request a password reset using the persona email and verify confirmation copy and translated strings.',
      'Navigate to the verification pending page to confirm support actions (resend, contact links) appear.',
      'Simulate unlocking by clearing the timer within the Test Users dashboard and retry login messaging.',
      'Document any copy inconsistencies or missing accessibility attributes encountered.'
    ],
    lockoutMinutes: 12,
    user: {
      id: 'test-user-recovery',
      email: 'test-recovery@moldovadirect.com',
      emailVerified: false,
      name: 'Nicu Recovery',
      phone: '+34666000999',
      preferredLanguage: 'ro',
      lastLogin: new Date(baseDate.getTime() - 1000 * 60 * 60 * 24).toISOString(),
      createdAt: new Date('2023-05-01T09:12:00Z').toISOString(),
      updatedAt: baseDate.toISOString(),
      mfaEnabled: false,
      mfaFactors: []
    }
  },
  'cart-abandoner': {
    key: 'cart-abandoner',
    title: 'Cart Abandoner',
    summary:
      'Simulates a user who added items to cart but never completed checkout, testing cart recovery and reminder flows.',
    goals: [
      'Validate cart persistence across sessions',
      'Test cart recovery email triggers and messaging',
      'Verify abandoned cart banner and recovery CTAs'
    ],
    focusAreas: ['Cart Persistence', 'Recovery Flows', 'Checkout Friction'],
    quickLinks: [
      {
        label: 'View cart',
        description: 'Check that abandoned items are still visible',
        route: '/cart'
      },
      {
        label: 'Continue checkout',
        description: 'Resume the checkout process and identify friction points',
        route: '/checkout'
      },
      {
        label: 'Product page',
        description: 'Test adding more items to existing cart',
        route: '/products'
      }
    ],
    testScript: [
      'Navigate to the cart and verify all abandoned items are displayed with correct prices.',
      'Check for any cart recovery messaging or incentives (discounts, free shipping thresholds).',
      'Start checkout and stop at shipping step to simulate another abandonment.',
      'Return to homepage and verify any "complete your order" prompts or banners.',
      'Test cart expiration behavior if items have been in cart for extended period.'
    ],
    user: {
      id: 'test-user-abandoner',
      email: 'test-abandoner@moldovadirect.com',
      emailVerified: true,
      name: 'Sofia Cart',
      phone: '+34666000222',
      preferredLanguage: 'es',
      lastLogin: new Date(baseDate.getTime() - 1000 * 60 * 60 * 48).toISOString(),
      createdAt: new Date('2023-11-20T14:20:00Z').toISOString(),
      updatedAt: new Date(baseDate.getTime() - 1000 * 60 * 60 * 48).toISOString(),
      mfaEnabled: false,
      mfaFactors: []
    },
    cart: [
      {
        productId: 'prod-wine-001',
        name: 'Moldovan Red Wine Premium',
        quantity: 2,
        price: 24.99,
        image: '/images/products/wine-red.jpg'
      },
      {
        productId: 'prod-honey-003',
        name: 'Organic Honey 500g',
        quantity: 1,
        price: 12.50,
        image: '/images/products/honey.jpg'
      },
      {
        productId: 'prod-cheese-005',
        name: 'Traditional Moldovan Cheese',
        quantity: 1,
        price: 18.75,
        image: '/images/products/cheese.jpg'
      }
    ],
    addresses: [
      {
        id: 'addr-abandoner-1',
        type: 'shipping',
        isDefault: true,
        name: 'Sofia Cart',
        street: 'Calle Mayor 45',
        city: 'Madrid',
        state: 'Madrid',
        postalCode: '28013',
        country: 'ES',
        phone: '+34666000222'
      }
    ],
    preferences: {
      notifications: {
        email: true,
        sms: false,
        orderUpdates: true,
        promotions: true
      },
      marketing: {
        newsletter: true,
        recommendations: true
      },
      display: {
        theme: 'auto',
        currency: 'EUR'
      }
    }
  },
  'vip-customer': {
    key: 'vip-customer',
    title: 'VIP Customer',
    summary:
      'High-value customer with extensive order history, loyalty rewards, and premium support expectations.',
    goals: [
      'Validate VIP badge and special status indicators',
      'Test loyalty points calculation and redemption',
      'Verify priority support and exclusive offers display'
    ],
    focusAreas: ['Loyalty Program', 'VIP Benefits', 'Order Volume'],
    quickLinks: [
      {
        label: 'Account dashboard',
        description: 'View VIP status and loyalty rewards',
        route: '/account'
      },
      {
        label: 'Order history',
        description: 'Review extensive purchase history',
        route: '/account/orders'
      },
      {
        label: 'Loyalty rewards',
        description: 'Check points balance and available rewards',
        route: '/account/rewards'
      }
    ],
    testScript: [
      'Verify VIP badge appears on dashboard and profile sections.',
      'Check loyalty points balance and ensure calculations match order history.',
      'Test redeeming loyalty points for discounts during checkout.',
      'Verify exclusive VIP offers and early access to sales are displayed.',
      'Contact support via chat/email and confirm VIP priority queuing.'
    ],
    user: {
      id: 'test-user-vip',
      email: 'test-vip@moldovadirect.com',
      emailVerified: true,
      name: 'Alexandru Premium',
      phone: '+40744123456',
      preferredLanguage: 'ro',
      lastLogin: new Date(baseDate.getTime() - 1000 * 60 * 30).toISOString(),
      createdAt: new Date('2022-03-10T09:00:00Z').toISOString(),
      updatedAt: baseDate.toISOString(),
      mfaEnabled: false,
      mfaFactors: []
    },
    orders: [
      {
        id: 'ord-vip-001',
        status: 'delivered',
        total: 245.80,
        currency: 'EUR',
        itemCount: 8,
        createdAt: new Date('2024-01-10T11:20:00Z').toISOString(),
        deliveredAt: new Date('2024-01-15T14:30:00Z').toISOString(),
        items: [
          { productId: 'prod-wine-001', name: 'Premium Red Wine', quantity: 6, price: 24.99 },
          { productId: 'prod-cheese-002', name: 'Artisan Cheese', quantity: 2, price: 35.95 }
        ]
      },
      {
        id: 'ord-vip-002',
        status: 'delivered',
        total: 189.50,
        currency: 'EUR',
        itemCount: 5,
        createdAt: new Date('2023-12-15T16:45:00Z').toISOString(),
        deliveredAt: new Date('2023-12-20T10:15:00Z').toISOString(),
        items: [
          { productId: 'prod-honey-001', name: 'Organic Honey', quantity: 5, price: 12.50 }
        ]
      },
      {
        id: 'ord-vip-003',
        status: 'processing',
        total: 320.00,
        currency: 'EUR',
        itemCount: 12,
        createdAt: new Date('2024-01-14T09:10:00Z').toISOString(),
        items: [
          { productId: 'prod-wine-003', name: 'Vintage Collection', quantity: 12, price: 45.00 }
        ]
      }
    ],
    addresses: [
      {
        id: 'addr-vip-home',
        type: 'shipping',
        isDefault: true,
        name: 'Alexandru Premium',
        street: 'Strada Mihai Eminescu 88',
        city: 'Chișinău',
        state: 'Chișinău',
        postalCode: 'MD-2012',
        country: 'MD',
        phone: '+40744123456'
      },
      {
        id: 'addr-vip-office',
        type: 'shipping',
        isDefault: false,
        name: 'Alexandru Premium (Office)',
        street: 'Bulevardul Ștefan cel Mare 123',
        city: 'Chișinău',
        state: 'Chișinău',
        postalCode: 'MD-2001',
        country: 'MD',
        phone: '+40744123456'
      }
    ],
    paymentMethods: [
      {
        id: 'pm-vip-1',
        type: 'card',
        isDefault: true,
        last4: '4242',
        brand: 'Visa',
        expiryMonth: 12,
        expiryYear: 2026
      }
    ],
    preferences: {
      notifications: {
        email: true,
        sms: true,
        orderUpdates: true,
        promotions: true
      },
      marketing: {
        newsletter: true,
        recommendations: true
      },
      display: {
        theme: 'light',
        currency: 'EUR'
      }
    }
  },
  'international-shopper': {
    key: 'international-shopper',
    title: 'International Shopper',
    summary:
      'Customer shopping from outside Moldova with different timezone, currency, and international shipping requirements.',
    goals: [
      'Validate multi-currency display and conversion',
      'Test international shipping calculation and restrictions',
      'Verify timezone-aware order tracking and communication'
    ],
    focusAreas: ['Currency Conversion', 'International Shipping', 'Localization'],
    quickLinks: [
      {
        label: 'Product catalog',
        description: 'Verify prices display in preferred currency',
        route: '/products'
      },
      {
        label: 'Checkout',
        description: 'Test international shipping options',
        route: '/checkout'
      },
      {
        label: 'Order tracking',
        description: 'Check timezone-aware delivery estimates',
        route: '/account/orders'
      }
    ],
    testScript: [
      'Verify product prices are displayed in USD and conversion rate is accurate.',
      'Add items to cart and check that totals reflect correct currency.',
      'Start checkout and verify international shipping options (DHL, FedEx) are available.',
      'Test address validation for US format (ZIP code, state selection).',
      'Check that delivery estimates account for international transit times and timezone differences.'
    ],
    user: {
      id: 'test-user-intl',
      email: 'test-international@moldovadirect.com',
      emailVerified: true,
      name: 'Emily Johnson',
      phone: '+1-555-0199',
      preferredLanguage: 'en',
      lastLogin: new Date(baseDate.getTime() - 1000 * 60 * 120).toISOString(),
      createdAt: new Date('2023-08-15T18:30:00Z').toISOString(),
      updatedAt: baseDate.toISOString(),
      mfaEnabled: false,
      mfaFactors: []
    },
    addresses: [
      {
        id: 'addr-intl-1',
        type: 'shipping',
        isDefault: true,
        name: 'Emily Johnson',
        street: '742 Evergreen Terrace',
        city: 'Springfield',
        state: 'IL',
        postalCode: '62704',
        country: 'US',
        phone: '+1-555-0199'
      }
    ],
    orders: [
      {
        id: 'ord-intl-001',
        status: 'shipped',
        total: 156.80,
        currency: 'USD',
        itemCount: 3,
        createdAt: new Date('2024-01-08T21:15:00Z').toISOString(),
        items: [
          { productId: 'prod-wine-001', name: 'Moldovan Red Wine', quantity: 2, price: 28.99 },
          { productId: 'prod-honey-003', name: 'Organic Honey', quantity: 1, price: 15.80 }
        ]
      }
    ],
    paymentMethods: [
      {
        id: 'pm-intl-1',
        type: 'card',
        isDefault: true,
        last4: '1234',
        brand: 'Mastercard',
        expiryMonth: 8,
        expiryYear: 2027
      }
    ],
    preferences: {
      notifications: {
        email: true,
        sms: false,
        orderUpdates: true,
        promotions: false
      },
      marketing: {
        newsletter: false,
        recommendations: true
      },
      display: {
        theme: 'light',
        currency: 'USD'
      }
    }
  },
  'mobile-only-user': {
    key: 'mobile-only-user',
    title: 'Mobile-Only User',
    summary:
      'Customer who exclusively shops on mobile devices, testing responsive design and mobile-specific features.',
    goals: [
      'Validate mobile responsive design and touch interactions',
      'Test mobile payment methods (Apple Pay, Google Pay)',
      'Verify mobile-optimized checkout flow'
    ],
    focusAreas: ['Mobile UX', 'Touch Interactions', 'Mobile Payments'],
    quickLinks: [
      {
        label: 'Mobile home',
        description: 'Test mobile homepage layout and navigation',
        route: '/'
      },
      {
        label: 'Product browsing',
        description: 'Verify mobile product cards and filters',
        route: '/products'
      },
      {
        label: 'Mobile checkout',
        description: 'Test mobile-optimized checkout flow',
        route: '/checkout'
      }
    ],
    testScript: [
      'Verify hamburger menu opens smoothly and all navigation is accessible.',
      'Test product image galleries with swipe gestures.',
      'Add items to cart using mobile interface and verify cart drawer animation.',
      'Start checkout and test form input on mobile (autocomplete, keyboard types).',
      'Verify mobile payment options (Apple Pay, Google Pay) are available and functional.'
    ],
    simulationMode: 'normal',
    user: {
      id: 'test-user-mobile',
      email: 'test-mobile@moldovadirect.com',
      emailVerified: true,
      name: 'Maria Mobile',
      phone: '+34622555777',
      preferredLanguage: 'es',
      lastLogin: new Date(baseDate.getTime() - 1000 * 60 * 5).toISOString(),
      createdAt: new Date('2023-10-05T12:45:00Z').toISOString(),
      updatedAt: baseDate.toISOString(),
      mfaEnabled: false,
      mfaFactors: []
    },
    orders: [
      {
        id: 'ord-mobile-001',
        status: 'delivered',
        total: 45.99,
        currency: 'EUR',
        itemCount: 2,
        createdAt: new Date('2024-01-05T19:30:00Z').toISOString(),
        deliveredAt: new Date('2024-01-09T11:20:00Z').toISOString(),
        items: [
          { productId: 'prod-wine-002', name: 'White Wine Selection', quantity: 1, price: 29.99 },
          { productId: 'prod-honey-001', name: 'Honey Jar', quantity: 1, price: 16.00 }
        ]
      }
    ],
    addresses: [
      {
        id: 'addr-mobile-1',
        type: 'shipping',
        isDefault: true,
        name: 'Maria Mobile',
        street: 'Av. Diagonal 123',
        city: 'Barcelona',
        state: 'Cataluña',
        postalCode: '08019',
        country: 'ES',
        phone: '+34622555777'
      }
    ],
    paymentMethods: [
      {
        id: 'pm-mobile-1',
        type: 'card',
        isDefault: true,
        last4: '5678',
        brand: 'Visa',
        expiryMonth: 3,
        expiryYear: 2028
      }
    ],
    preferences: {
      notifications: {
        email: true,
        sms: true,
        orderUpdates: true,
        promotions: true
      },
      marketing: {
        newsletter: true,
        recommendations: true
      },
      display: {
        theme: 'auto',
        currency: 'EUR'
      }
    }
  },
  'bulk-buyer': {
    key: 'bulk-buyer',
    title: 'Bulk Buyer',
    summary:
      'Business customer purchasing large quantities with different pricing, invoicing, and shipping requirements.',
    goals: [
      'Validate bulk pricing and volume discounts',
      'Test business invoicing and tax documentation',
      'Verify large order handling and split shipments'
    ],
    focusAreas: ['Bulk Pricing', 'Business Invoicing', 'Large Orders'],
    quickLinks: [
      {
        label: 'Bulk catalog',
        description: 'View products with bulk pricing tiers',
        route: '/products?view=bulk'
      },
      {
        label: 'Quote requests',
        description: 'Test custom quote request form',
        route: '/account/quotes'
      },
      {
        label: 'Business account',
        description: 'Manage business profile and tax information',
        route: '/account/business'
      }
    ],
    testScript: [
      'Browse products and verify bulk pricing tiers are displayed (10+, 50+, 100+ units).',
      'Add large quantities to cart and confirm volume discounts apply automatically.',
      'Start checkout and verify business tax fields (VAT, company registration).',
      'Request a custom quote for very large orders and verify quote flow.',
      'Check order history and verify invoice download includes proper business documentation.'
    ],
    user: {
      id: 'test-user-bulk',
      email: 'test-bulk@moldovadirect.com',
      emailVerified: true,
      name: 'Restaurant Moldova SRL',
      phone: '+40212345678',
      preferredLanguage: 'ro',
      lastLogin: new Date(baseDate.getTime() - 1000 * 60 * 180).toISOString(),
      createdAt: new Date('2022-06-20T08:00:00Z').toISOString(),
      updatedAt: baseDate.toISOString(),
      mfaEnabled: false,
      mfaFactors: []
    },
    orders: [
      {
        id: 'ord-bulk-001',
        status: 'delivered',
        total: 2450.00,
        currency: 'EUR',
        itemCount: 120,
        createdAt: new Date('2024-01-01T10:00:00Z').toISOString(),
        deliveredAt: new Date('2024-01-05T15:45:00Z').toISOString(),
        items: [
          { productId: 'prod-wine-001', name: 'Premium Red Wine (Bulk)', quantity: 100, price: 19.99 },
          { productId: 'prod-wine-002', name: 'White Wine (Bulk)', quantity: 20, price: 22.50 }
        ]
      },
      {
        id: 'ord-bulk-002',
        status: 'processing',
        total: 1890.00,
        currency: 'EUR',
        itemCount: 150,
        createdAt: new Date('2024-01-12T14:20:00Z').toISOString(),
        items: [
          { productId: 'prod-honey-001', name: 'Organic Honey (Bulk 1kg)', quantity: 150, price: 12.60 }
        ]
      }
    ],
    addresses: [
      {
        id: 'addr-bulk-1',
        type: 'shipping',
        isDefault: true,
        name: 'Restaurant Moldova SRL - Warehouse',
        street: 'Șoseaua Industrială 45',
        city: 'Chișinău',
        state: 'Chișinău',
        postalCode: 'MD-2023',
        country: 'MD',
        phone: '+40212345678'
      },
      {
        id: 'addr-bulk-billing',
        type: 'billing',
        isDefault: true,
        name: 'Restaurant Moldova SRL',
        street: 'Bd. Dacia 20, Birou 5',
        city: 'Chișinău',
        state: 'Chișinău',
        postalCode: 'MD-2038',
        country: 'MD',
        phone: '+40212345678'
      }
    ],
    paymentMethods: [
      {
        id: 'pm-bulk-1',
        type: 'bank_transfer',
        isDefault: true
      }
    ],
    preferences: {
      notifications: {
        email: true,
        sms: false,
        orderUpdates: true,
        promotions: false
      },
      marketing: {
        newsletter: false,
        recommendations: false
      },
      display: {
        theme: 'light',
        currency: 'EUR'
      }
    }
  }
}
