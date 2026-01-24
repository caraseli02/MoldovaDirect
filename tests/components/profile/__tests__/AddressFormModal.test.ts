/**
 * AddressFormModal Accessibility Tests
 *
 * Verifies that the AddressFormModal component uses Reka UI Dialog
 * for proper accessibility (focus trap, ESC key, ARIA attributes).
 *
 * REQUIREMENT: a11y-1 - Use Reka UI Dialog primitives for accessibility
 *
 * Why this matters:
 * - Proper focus management for keyboard navigation
 * - ESC key closes the dialog (built into Reka UI)
 * - ARIA attributes for screen readers
 * - Focus trap prevents focus from leaving modal
 */

import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const COMPONENT_PATH = 'components/profile/AddressFormModal.vue'

/**
 * Get the component source code
 */
function getComponentSource(): string {
  const fullPath = join(process.cwd(), COMPONENT_PATH)
  if (!existsSync(fullPath)) {
    throw new Error(`Component not found: ${COMPONENT_PATH}`)
  }
  return readFileSync(fullPath, 'utf-8')
}

/**
 * Check if the component imports from Reka UI Dialog
 */
function usesRekaUIDialog(source: string): {
  importsDialog: boolean
  importsDialogContent: boolean
  importsDialogTitle: boolean
  importsDialogDescription: boolean
  usesDialogComponent: boolean
  usesDialogScrollContent: boolean
} {
  return {
    // Check for Dialog import from UI components (multi-line import)
    importsDialog: /from\s+['"]@\/components\/ui\/dialog['"]/.test(source) && /Dialog/.test(source),
    // Check for DialogContent import
    importsDialogContent: /DialogContent|DialogScrollContent/.test(source),
    // Check for DialogTitle usage
    importsDialogTitle: /DialogTitle/.test(source),
    // Check for DialogDescription usage (accessibility requirement)
    importsDialogDescription: /DialogDescription/.test(source),
    // Check template uses Dialog component - handles Ui prefix
    usesDialogComponent: /<Ui?Dialog[\s/>]/.test(source),
    // Check uses DialogScrollContent for scrollable content - handles Ui prefix
    usesDialogScrollContent: /<Ui?DialogScrollContent[\s/>]/.test(source),
  }
}

/**
 * Check for manual accessibility implementations that should be replaced
 */
function hasManualAccessibility(source: string): {
  hasManualFocusTrap: boolean
  hasManualAriaModal: boolean
  hasManualRoleDialog: boolean
} {
  return {
    // Manual focus trap implementation
    hasManualFocusTrap: /trapFocus|@keydown\.tab/.test(source),
    // Manual aria-modal attribute
    hasManualAriaModal: /aria-modal="true"/.test(source),
    // Manual role="dialog"
    hasManualRoleDialog: /role="dialog"/.test(source),
  }
}

describe('AddressFormModal Accessibility (Reka UI Dialog)', () => {
  const source = getComponentSource()
  const rekaUIUsage = usesRekaUIDialog(source)
  const manualA11y = hasManualAccessibility(source)

  describe('Reka UI Dialog Integration', () => {
    it('should import Dialog from UI components', () => {
      expect(rekaUIUsage.importsDialog).toBe(true)
    })

    it('should use Dialog component in template', () => {
      expect(rekaUIUsage.usesDialogComponent).toBe(true)
    })

    it('should import and use DialogContent or DialogScrollContent', () => {
      expect(rekaUIUsage.importsDialogContent).toBe(true)
    })

    it('should include DialogTitle for accessibility', () => {
      expect(rekaUIUsage.importsDialogTitle).toBe(true)
    })

    it('should include DialogDescription for accessibility', () => {
      expect(rekaUIUsage.importsDialogDescription).toBe(true)
    })
  })

  describe('No Manual Accessibility Overrides', () => {
    it('should not have manual focus trap (Reka UI handles this)', () => {
      // After refactoring, manual focus trap should be removed
      // Reka UI Dialog provides focus trapping automatically
      expect(manualA11y.hasManualFocusTrap).toBe(false)
    })

    it('should not have manual aria-modal (Reka UI handles this)', () => {
      // After refactoring, manual aria-modal should be removed
      // Reka UI DialogContent provides this automatically
      expect(manualA11y.hasManualAriaModal).toBe(false)
    })

    it('should not have manual role="dialog" (Reka UI handles this)', () => {
      // After refactoring, manual role should be removed
      // Reka UI DialogContent provides this automatically
      expect(manualA11y.hasManualRoleDialog).toBe(false)
    })
  })
})
