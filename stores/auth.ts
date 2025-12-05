/**
 * Auth Store - Re-export Module
 *
 * This file re-exports the modular auth store for backward compatibility.
 * The actual implementation is in stores/auth/ directory.
 *
 * @see stores/auth/README.md for module documentation
 */

export { useAuthStore } from './auth/index'
export type * from './auth/types'
