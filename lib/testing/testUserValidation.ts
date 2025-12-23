/**
 * Zod Validation Schemas for Test User Personas
 *
 * Provides runtime validation for persona data, session state,
 * and configuration to ensure data integrity.
 */

import { z } from 'zod'

export const TestOrderSchema = z.object({
  id: z.string(),
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
  total: z.number().positive(),
  currency: z.string().length(3),
  itemCount: z.number().int().positive(),
  createdAt: z.string().datetime(),
  deliveredAt: z.string().datetime().optional(),
  items: z.array(
    z.object({
      productId: z.string(),
      name: z.string(),
      quantity: z.number().int().positive(),
      price: z.number().positive(),
    }),
  ),
})

export const TestAddressSchema = z.object({
  id: z.string(),
  type: z.enum(['shipping', 'billing']),
  isDefault: z.boolean(),
  name: z.string().min(1),
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().length(2),
  phone: z.string().optional(),
})

export const TestCartItemSchema = z.object({
  productId: z.string(),
  name: z.string().min(1),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
  image: z.string().optional(),
})

export const TestPaymentMethodSchema = z.object({
  id: z.string(),
  type: z.enum(['card', 'paypal', 'bank_transfer']),
  isDefault: z.boolean(),
  last4: z.string().length(4).optional(),
  brand: z.string().optional(),
  expiryMonth: z.number().int().min(1).max(12).optional(),
  expiryYear: z.number().int().min(2024).max(2050).optional(),
})

export const TestUserPreferencesSchema = z.object({
  notifications: z.object({
    email: z.boolean(),
    sms: z.boolean(),
    orderUpdates: z.boolean(),
    promotions: z.boolean(),
  }),
  marketing: z.object({
    newsletter: z.boolean(),
    recommendations: z.boolean(),
  }),
  display: z.object({
    theme: z.enum(['light', 'dark', 'auto']),
    currency: z.string().length(3),
  }),
})

export const SimulationModeSchema = z.enum(['normal', 'slow-network', 'intermittent-errors', 'offline'])

export const AuthUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  emailVerified: z.boolean(),
  name: z.string().optional(),
  phone: z.string().optional(),
  preferredLanguage: z.string(),
  lastLogin: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  mfaEnabled: z.boolean(),
  mfaFactors: z.array(
    z.object({
      id: z.string(),
      type: z.literal('totp'),
      status: z.enum(['verified', 'unverified']),
      friendlyName: z.string().optional(),
    }),
  ),
})

export const TestUserPersonaKeySchema = z.enum([
  'first-order-explorer',
  'loyal-subscriber',
  'recovery-seeker',
  'cart-abandoner',
  'vip-customer',
  'international-shopper',
  'mobile-only-user',
  'bulk-buyer',
])

export const TestUserPersonaSchema = z.object({
  key: TestUserPersonaKeySchema,
  title: z.string().min(1),
  summary: z.string().min(1),
  goals: z.array(z.string().min(1)),
  focusAreas: z.array(z.string().min(1)),
  quickLinks: z.array(
    z.object({
      label: z.string().min(1),
      description: z.string().min(1),
      route: z.string().startsWith('/'),
    }),
  ),
  testScript: z.array(z.string().min(1)),
  lockoutMinutes: z.number().int().positive().optional(),
  user: AuthUserSchema,
  orders: z.array(TestOrderSchema).optional(),
  cart: z.array(TestCartItemSchema).optional(),
  addresses: z.array(TestAddressSchema).optional(),
  paymentMethods: z.array(TestPaymentMethodSchema).optional(),
  preferences: TestUserPreferencesSchema.optional(),
  simulationMode: SimulationModeSchema.optional(),
  changelog: z
    .array(
      z.object({
        date: z.string(),
        changes: z.string(),
        version: z.string(),
      }),
    )
    .optional(),
})

export const PersonaSessionStateSchema = z.object({
  personaKey: TestUserPersonaKeySchema,
  simulationMode: SimulationModeSchema,
  testScriptProgress: z.object({
    completedSteps: z.array(z.number().int().nonnegative()),
    notes: z.record(z.number(), z.string()),
  }),
  timestamp: z.string().datetime(),
  version: z.string(),
})

export const TestScriptProgressSchema = z.object({
  completedSteps: z.array(z.number().int().nonnegative()),
  notes: z.record(z.number(), z.string()),
  lastTested: z.string().datetime(),
  completionPercentage: z.number().int().min(0).max(100),
})

/**
 * Validate a test user persona
 */
export const validatePersona = (persona: any) => {
  try {
    return TestUserPersonaSchema.parse(persona)
  }
  catch (error: any) {
    if (error instanceof z.ZodError) {
      console.error('Persona validation errors:', error.issues)
      throw new Error(`Invalid persona data: ${error.issues.map((e: z.ZodIssue) => e.message).join(', ')}`)
    }
    throw error
  }
}

/**
 * Validate persona session state
 */
export const validateSessionState = (state: any) => {
  try {
    return PersonaSessionStateSchema.parse(state)
  }
  catch (error: any) {
    if (error instanceof z.ZodError) {
      console.error('Session state validation errors:', error.issues)
      throw new Error(`Invalid session state: ${error.issues.map((e: z.ZodIssue) => e.message).join(', ')}`)
    }
    throw error
  }
}

/**
 * Validate test script progress
 */
export const validateProgress = (progress: any) => {
  try {
    return TestScriptProgressSchema.parse(progress)
  }
  catch (error: any) {
    if (error instanceof z.ZodError) {
      console.error('Progress validation errors:', error.issues)
      throw new Error(`Invalid progress data: ${error.issues.map((e: z.ZodIssue) => e.message).join(', ')}`)
    }
    throw error
  }
}

/**
 * Safe parse (returns result without throwing)
 */
export const safeValidatePersona = (persona: any) => {
  return TestUserPersonaSchema.safeParse(persona)
}

export const safeValidateSessionState = (state: any) => {
  return PersonaSessionStateSchema.safeParse(state)
}

export const safeValidateProgress = (progress: any) => {
  return TestScriptProgressSchema.safeParse(progress)
}
