/**
 * Test User Simulation Module
 *
 * Handles test user persona simulation and test script progress tracking.
 * This module is only active when test users are enabled in the runtime config.
 */

import type { TestUserPersonaKey } from '~/lib/testing/testUserPersonas'
import type { AuthUser } from './types'

export interface TestScriptProgress {
  completedSteps: number[]
  notes: Record<number, string>
  lastTested: string
  completionPercentage: number
}

export interface TestUserState {
  isTestUser: boolean
  testPersonaKey: TestUserPersonaKey | null
  testScriptProgress: Record<string, TestScriptProgress>
  simulationMode: import('~/lib/testing/testUserPersonas').SimulationMode
}

const PROGRESS_STORAGE_KEY = 'md-test-script-progress'

/**
 * Read persisted test script progress from localStorage
 */
export const readPersistedProgress = (): Record<string, TestScriptProgress> => {
  if (!process.client) {
    return {}
  }

  const storedValue = window.localStorage.getItem(PROGRESS_STORAGE_KEY)
  if (!storedValue) {
    return {}
  }

  try {
    return JSON.parse(storedValue)
  } catch {
    return {}
  }
}

/**
 * Persist test script progress to localStorage
 */
export const persistProgress = (progress: Record<string, TestScriptProgress>) => {
  if (!process.client) {
    return
  }

  window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress))
}

/**
 * Load test user persona and simulate login
 */
export async function loadTestPersona(
  personaKey: TestUserPersonaKey
): Promise<{
  user: AuthUser
  lockoutTime: Date | null
}> {
  const config = useRuntimeConfig()
  const isEnabled = config?.public?.enableTestUsers ?? false

  if (!isEnabled) {
    throw new Error('Test user simulation is disabled in this environment.')
  }

  // Dynamically import test utilities to avoid bundling in production
  const { testUserPersonas } = await import('~/lib/testing/testUserPersonas')
  const persona = testUserPersonas[personaKey]

  if (!persona) {
    throw new Error(`Unknown test user persona: ${personaKey}`)
  }

  const simulatedLockout = persona.lockoutMinutes
    ? new Date(Date.now() + persona.lockoutMinutes * 60 * 1000)
    : null

  return {
    user: { ...persona.user },
    lockoutTime: simulatedLockout
  }
}

/**
 * Toggle completion status of a test script step
 */
export function toggleTestScriptStep(
  progress: Record<string, TestScriptProgress>,
  personaKey: TestUserPersonaKey,
  stepIndex: number,
  totalSteps: number
): Record<string, TestScriptProgress> {
  const updatedProgress = { ...progress }

  if (!updatedProgress[personaKey]) {
    updatedProgress[personaKey] = {
      completedSteps: [],
      notes: {},
      lastTested: new Date().toISOString(),
      completionPercentage: 0
    }
  }

  const personaProgress = updatedProgress[personaKey]
  const stepIdx = personaProgress.completedSteps.indexOf(stepIndex)

  if (stepIdx > -1) {
    // Remove step
    personaProgress.completedSteps.splice(stepIdx, 1)
  } else {
    // Add step
    personaProgress.completedSteps.push(stepIndex)
  }

  // Update last tested and completion percentage
  personaProgress.lastTested = new Date().toISOString()
  personaProgress.completionPercentage = Math.round(
    (personaProgress.completedSteps.length / totalSteps) * 100
  )

  persistProgress(updatedProgress)
  return updatedProgress
}

/**
 * Add or update a note for a test script step
 */
export function updateTestScriptNote(
  progress: Record<string, TestScriptProgress>,
  personaKey: TestUserPersonaKey,
  stepIndex: number,
  note: string
): Record<string, TestScriptProgress> {
  const updatedProgress = { ...progress }

  if (!updatedProgress[personaKey]) {
    updatedProgress[personaKey] = {
      completedSteps: [],
      notes: {},
      lastTested: new Date().toISOString(),
      completionPercentage: 0
    }
  }

  const personaProgress = updatedProgress[personaKey]

  if (note.trim()) {
    personaProgress.notes[stepIndex] = note
  } else {
    delete personaProgress.notes[stepIndex]
  }

  personaProgress.lastTested = new Date().toISOString()
  persistProgress(updatedProgress)
  return updatedProgress
}

/**
 * Clear progress for a specific persona
 */
export function clearPersonaProgress(
  progress: Record<string, TestScriptProgress>,
  personaKey: TestUserPersonaKey
): Record<string, TestScriptProgress> {
  const updatedProgress = { ...progress }
  delete updatedProgress[personaKey]
  persistProgress(updatedProgress)
  return updatedProgress
}

/**
 * Clear all test script progress
 */
export function clearAllProgress(): Record<string, TestScriptProgress> {
  persistProgress({})
  return {}
}

/**
 * Get test script progress for a specific persona
 */
export function getPersonaProgress(
  progress: Record<string, TestScriptProgress>,
  personaKey: TestUserPersonaKey | null
): TestScriptProgress | null {
  if (!personaKey) return null
  return progress[personaKey] || null
}
