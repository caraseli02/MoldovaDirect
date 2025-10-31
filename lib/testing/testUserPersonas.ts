import type { AuthUser } from '~/stores/auth'

// Reuse AuthUser type to maintain single source of truth
export type TestUserPersonaUser = AuthUser

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
}

export type TestUserPersonaKey =
  | 'first-order-explorer'
  | 'loyal-subscriber'
  | 'recovery-seeker'

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
      updatedAt: baseDate.toISOString()
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
      updatedAt: baseDate.toISOString()
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
      updatedAt: baseDate.toISOString()
    }
  }
}
