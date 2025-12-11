/**
 * Table utility functions
 *
 * Note: Direct imports from @tanstack/vue-table have been removed to enable lazy loading.
 * Use the useAsyncTable composable instead for dynamic table functionality.
 *
 * For basic table utilities that don't require TanStack Table, use these helper functions.
 */

import type { Ref } from 'vue'

/**
 * Type definition for value updaters (from TanStack Table)
 * This allows us to avoid importing the full library just for the type
 */
export type Updater<T> = T | ((old: T) => T)

/**
 * Helper function to update values - works with both direct values and updater functions
 * This is a standalone implementation that doesn't require TanStack Table
 *
 * @param updaterOrValue - Either a new value or a function that computes the new value
 * @param ref - The ref to update
 */
export function valueUpdater<T>(updaterOrValue: Updater<T>, ref: Ref<T>): void {
  ref.value = typeof updaterOrValue === 'function'
    ? (updaterOrValue as (old: T) => T)(ref.value)
    : updaterOrValue
}

/**
 * Check if a value is a function
 * Standalone implementation without TanStack dependency
 */
export function isFunction(value: unknown): value is (...args: unknown[]) => any {
  return typeof value === 'function'
}
