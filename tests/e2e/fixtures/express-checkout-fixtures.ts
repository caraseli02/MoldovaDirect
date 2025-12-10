/**
 * Test Fixtures: Express Checkout
 *
 * Provides test data and user personas for express checkout tests
 */

import type { Address } from '~/types/address'

export interface TestUser {
  email: string
  password: string
  firstName: string
  lastName: string
  address: Address
  hasPreferredShipping: boolean
  preferredShippingMethod?: string
}

export const ExpressCheckoutFixtures = {
  /**
   * Returning user with complete saved data (address + shipping preference)
   * Should trigger auto-skip countdown
   */
  returningUserWithPreferences(): TestUser {
    return {
      email: process.env.TEST_USER_WITH_PREFERENCES || 'returning.user@test.com',
      password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
      firstName: 'Maria',
      lastName: 'Rodriguez',
      address: {
        id: 1,
        user_id: 'user-123',
        firstName: 'Maria',
        lastName: 'Rodriguez',
        street: '123 Calle Principal',
        city: 'Madrid',
        postalCode: '28001',
        country: 'ES',
        phone: '+34 600 123 456',
        type: 'both',
        isDefault: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      hasPreferredShipping: true,
      preferredShippingMethod: 'standard',
    }
  },

  /**
   * User with saved address but no previous orders
   * Should show banner without countdown (manual express only)
   */
  userWithAddressOnly(): TestUser {
    return {
      email: process.env.TEST_USER_ADDRESS_ONLY || 'new.user@test.com',
      password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
      firstName: 'John',
      lastName: 'Smith',
      address: {
        id: 2,
        user_id: 'user-456',
        firstName: 'John',
        lastName: 'Smith',
        street: '456 Main Street',
        city: 'Barcelona',
        postalCode: '08001',
        country: 'ES',
        phone: '+34 600 789 012',
        type: 'both',
        isDefault: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      hasPreferredShipping: false,
    }
  },

  /**
   * User without any saved data
   * Should not show express checkout banner
   */
  userWithoutAddress(): TestUser {
    return {
      email: process.env.TEST_USER_NO_DATA || 'empty.user@test.com',
      password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
      firstName: 'Ana',
      lastName: 'García',
      address: {
        id: 0,
        user_id: '',
        firstName: '',
        lastName: '',
        street: '',
        city: '',
        postalCode: '',
        country: '',
        type: 'both',
        isDefault: false,
        created_at: '',
        updated_at: '',
      },
      hasPreferredShipping: false,
    }
  },

  /**
   * Guest user (not authenticated)
   */
  guestUser() {
    return {
      email: 'guest@example.com',
      wantsUpdates: false,
    }
  },

  /**
   * Sample addresses for different countries
   */
  sampleAddresses(): Record<string, Partial<Address>> {
    return {
      spain: {
        firstName: 'Carlos',
        lastName: 'Martínez',
        street: 'Calle Gran Via 123',
        city: 'Madrid',
        postalCode: '28013',
        country: 'ES',
        phone: '+34 600 111 222',
      },
      romania: {
        firstName: 'Ion',
        lastName: 'Popescu',
        street: 'Strada Victoriei 45',
        city: 'București',
        postalCode: '010072',
        country: 'RO',
        phone: '+40 700 123 456',
      },
      moldova: {
        firstName: 'Vasile',
        lastName: 'Ionescu',
        street: 'Strada Stefan cel Mare 78',
        city: 'Chișinău',
        postalCode: 'MD-2001',
        country: 'MD',
        phone: '+373 60 123 456',
      },
      france: {
        firstName: 'Pierre',
        lastName: 'Dubois',
        street: '23 Rue de Rivoli',
        city: 'Paris',
        postalCode: '75001',
        country: 'FR',
        phone: '+33 6 12 34 56 78',
      },
    }
  },

  /**
   * Shipping methods
   */
  shippingMethods() {
    return {
      standard: {
        id: 'standard',
        name: 'Standard Shipping',
        description: 'Delivery in 3-5 business days',
        price: 4.99,
        estimatedDays: 4,
      },
      express: {
        id: 'express',
        name: 'Express Shipping',
        description: 'Delivery in 1-2 business days',
        price: 9.99,
        estimatedDays: 1,
      },
      priority: {
        id: 'priority',
        name: 'Priority Shipping',
        description: 'Next day delivery',
        price: 14.99,
        estimatedDays: 1,
      },
      free: {
        id: 'free',
        name: 'Free Shipping',
        description: 'Delivery in 5-7 business days',
        price: 0,
        estimatedDays: 6,
      },
    }
  },

  /**
   * Test products
   */
  testProducts() {
    return {
      wine: {
        id: 1,
        name: 'Premium Moldovan Wine',
        price: 24.99,
        slug: 'premium-moldovan-wine',
      },
      cheese: {
        id: 2,
        name: 'Artisan Cheese',
        price: 12.99,
        slug: 'artisan-cheese',
      },
      honey: {
        id: 3,
        name: 'Organic Honey',
        price: 8.99,
        slug: 'organic-honey',
      },
    }
  },

  /**
   * Create a complete test scenario
   */
  createScenario(type: 'auto-skip' | 'manual-express' | 'guest' | 'new-user') {
    switch (type) {
      case 'auto-skip':
        return {
          user: this.returningUserWithPreferences(),
          product: this.testProducts().wine,
          shippingMethod: this.shippingMethods().standard,
          shouldAutoSkip: true,
          shouldShowCountdown: true,
        }

      case 'manual-express':
        return {
          user: this.userWithAddressOnly(),
          product: this.testProducts().cheese,
          shippingMethod: this.shippingMethods().standard,
          shouldAutoSkip: false,
          shouldShowCountdown: false,
        }

      case 'guest':
        return {
          user: this.guestUser(),
          product: this.testProducts().honey,
          shippingMethod: this.shippingMethods().free,
          shouldAutoSkip: false,
          shouldShowCountdown: false,
        }

      case 'new-user':
        return {
          user: this.userWithoutAddress(),
          product: this.testProducts().wine,
          shippingMethod: this.shippingMethods().express,
          shouldAutoSkip: false,
          shouldShowCountdown: false,
        }

      default:
        throw new Error(`Unknown scenario type: ${type}`)
    }
  },

  /**
   * Generate random email for test isolation
   */
  generateTestEmail(prefix: string = 'test'): string {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 10000)
    return `${prefix}.${timestamp}.${random}@test.moldovadirect.com`
  },

  /**
   * Generate random user data
   */
  generateRandomUser(): TestUser {
    const firstNames = ['Maria', 'John', 'Ana', 'Carlos', 'Elena', 'Pedro']
    const lastNames = ['Rodriguez', 'Smith', 'García', 'Martínez', 'Popescu', 'López']

    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]

    return {
      email: this.generateTestEmail(firstName.toLowerCase()),
      password: 'TestPassword123!',
      firstName,
      lastName,
      address: {
        id: 0,
        user_id: '',
        firstName,
        lastName,
        street: `${Math.floor(Math.random() * 999) + 1} Main Street`,
        city: 'Madrid',
        postalCode: '28001',
        country: 'ES',
        phone: `+34 600 ${Math.floor(Math.random() * 900000) + 100000}`,
        type: 'both',
        isDefault: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      hasPreferredShipping: false,
    }
  },
} as const
