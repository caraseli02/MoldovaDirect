/**
 * Simulation Helpers for Test User Personas
 *
 * Provides mock API responses and network simulation modes to
 * test the application without hitting real backend services.
 */

import { testUserPersonas, type TestUserPersonaKey, type SimulationMode } from './testUserPersonas'
import type { AuthUser } from '~/stores/auth'

export class SimulationError extends Error {
  constructor(
    message: string,
    public personaKey: string,
    public context: Record<string, unknown> = {}
  ) {
    super(message)
    this.name = 'SimulationError'
  }
}

/**
 * Simulate network delay based on simulation mode
 */
export const simulateDelay = async (mode: SimulationMode = 'normal'): Promise<void> => {
  const delays = {
    normal: 0,
    'slow-network': 2000 + Math.random() * 1000, // 2-3s
    'intermittent-errors': Math.random() * 1500, // 0-1.5s
    offline: 0
  }

  const delay = delays[mode]
  if (delay > 0) {
    await new Promise((resolve) => setTimeout(resolve, delay))
  }
}

/**
 * Simulate network errors based on simulation mode
 */
export const shouldSimulateError = (mode: SimulationMode = 'normal'): boolean => {
  if (mode === 'offline') return true
  if (mode === 'intermittent-errors') return Math.random() < 0.3 // 30% chance of error
  return false
}

/**
 * Get mock data for a specific persona
 */
export const getPersonaMockData = (personaKey: TestUserPersonaKey) => {
  const persona = testUserPersonas[personaKey]
  if (!persona) {
    throw new SimulationError('Unknown persona', personaKey)
  }

  return {
    user: persona.user,
    orders: persona.orders || [],
    cart: persona.cart || [],
    addresses: persona.addresses || [],
    paymentMethods: persona.paymentMethods || [],
    preferences: persona.preferences || null
  }
}

/**
 * Mock API: Fetch user profile
 */
export const mockFetchProfile = async (
  personaKey: TestUserPersonaKey,
  mode: SimulationMode = 'normal'
): Promise<AuthUser> => {
  await simulateDelay(mode)

  if (shouldSimulateError(mode)) {
    throw new SimulationError('Failed to fetch profile', personaKey, { mode })
  }

  const data = getPersonaMockData(personaKey)
  return data.user
}

/**
 * Mock API: Fetch user orders
 */
export const mockFetchOrders = async (
  personaKey: TestUserPersonaKey,
  mode: SimulationMode = 'normal'
) => {
  await simulateDelay(mode)

  if (shouldSimulateError(mode)) {
    throw new SimulationError('Failed to fetch orders', personaKey, { mode })
  }

  const data = getPersonaMockData(personaKey)
  return data.orders
}

/**
 * Mock API: Fetch user cart
 */
export const mockFetchCart = async (
  personaKey: TestUserPersonaKey,
  mode: SimulationMode = 'normal'
) => {
  await simulateDelay(mode)

  if (shouldSimulateError(mode)) {
    throw new SimulationError('Failed to fetch cart', personaKey, { mode })
  }

  const data = getPersonaMockData(personaKey)
  return data.cart
}

/**
 * Mock API: Fetch user addresses
 */
export const mockFetchAddresses = async (
  personaKey: TestUserPersonaKey,
  mode: SimulationMode = 'normal'
) => {
  await simulateDelay(mode)

  if (shouldSimulateError(mode)) {
    throw new SimulationError('Failed to fetch addresses', personaKey, { mode })
  }

  const data = getPersonaMockData(personaKey)
  return data.addresses
}

/**
 * Mock API: Fetch payment methods
 */
export const mockFetchPaymentMethods = async (
  personaKey: TestUserPersonaKey,
  mode: SimulationMode = 'normal'
) => {
  await simulateDelay(mode)

  if (shouldSimulateError(mode)) {
    throw new SimulationError('Failed to fetch payment methods', personaKey, { mode })
  }

  const data = getPersonaMockData(personaKey)
  return data.paymentMethods
}

/**
 * Mock API: Update user profile
 */
export const mockUpdateProfile = async (
  personaKey: TestUserPersonaKey,
  updates: Partial<AuthUser>,
  mode: SimulationMode = 'normal'
): Promise<AuthUser> => {
  await simulateDelay(mode)

  if (shouldSimulateError(mode)) {
    throw new SimulationError('Failed to update profile', personaKey, { mode, updates })
  }

  const data = getPersonaMockData(personaKey)
  return {
    ...data.user,
    ...updates,
    updatedAt: new Date().toISOString()
  }
}

/**
 * Mock API: Add item to cart
 */
export const mockAddToCart = async (
  personaKey: TestUserPersonaKey,
  productId: string,
  quantity: number,
  mode: SimulationMode = 'normal'
) => {
  await simulateDelay(mode)

  if (shouldSimulateError(mode)) {
    throw new SimulationError('Failed to add to cart', personaKey, { mode, productId, quantity })
  }

  // Simulate successful addition
  return {
    success: true,
    message: 'Item added to cart',
    cartItemCount: (testUserPersonas[personaKey].cart?.length || 0) + 1
  }
}

/**
 * Mock API: Place order
 */
export const mockPlaceOrder = async (
  personaKey: TestUserPersonaKey,
  orderData: {
    items: Array<{ productId: string; quantity: number }>
    addressId: string
    paymentMethodId: string
  },
  mode: SimulationMode = 'normal'
) => {
  await simulateDelay(mode)

  if (shouldSimulateError(mode)) {
    throw new SimulationError('Failed to place order', personaKey, { mode, orderData })
  }

  // Create mock order
  const orderId = `ord-sim-${Date.now()}`
  return {
    success: true,
    orderId,
    status: 'pending',
    message: 'Order placed successfully'
  }
}

/**
 * Export/Import persona session state
 */
export interface PersonaSessionState {
  personaKey: TestUserPersonaKey
  simulationMode: SimulationMode
  testScriptProgress: {
    completedSteps: number[]
    notes: Record<number, string>
  }
  timestamp: string
  version: string
}

export const exportPersonaSession = (
  personaKey: TestUserPersonaKey,
  simulationMode: SimulationMode,
  testScriptProgress: { completedSteps: number[]; notes: Record<number, string> }
): string => {
  const state: PersonaSessionState = {
    personaKey,
    simulationMode,
    testScriptProgress,
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  }

  return JSON.stringify(state, null, 2)
}

export const importPersonaSession = (jsonString: string): PersonaSessionState => {
  try {
    const state = JSON.parse(jsonString) as PersonaSessionState

    // Validate required fields
    if (!state.personaKey || !state.simulationMode) {
      throw new Error('Invalid session state: missing required fields')
    }

    // Validate persona key exists
    if (!testUserPersonas[state.personaKey]) {
      throw new Error(`Unknown persona key: ${state.personaKey}`)
    }

    return state
  } catch (error) {
    throw new SimulationError(
      'Failed to import session',
      'unknown',
      { error: error instanceof Error ? error.message : 'Unknown error' }
    )
  }
}

/**
 * Helper to check if current session is using test persona
 */
export const isTestUserSession = (): boolean => {
  if (!process.client) return false

  // Check if auth store has active test persona
  try {
    const authStore = useAuthStore()
    return authStore.isTestSession
  } catch {
    return false
  }
}

/**
 * Helper to get current test persona key
 */
export const getCurrentTestPersona = (): TestUserPersonaKey | null => {
  if (!process.client) return null

  try {
    const authStore = useAuthStore()
    return authStore.activeTestPersona
  } catch {
    return null
  }
}
