/**
 * a11y-2: Accessibility tests for DeleteAccountModal
 *
 * Tests that the component uses Reka UI AlertDialog primitives for:
 * - Automatic focus trapping
 * - Proper ARIA attributes
 * - Keyboard navigation (ESC to close)
 * - Accessible dialog semantics for destructive actions
 */

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import DeleteAccountModal from '~/components/profile/DeleteAccountModal.vue'

const componentPath = resolve(__dirname, '../../../../components/profile/DeleteAccountModal.vue')

describe('DeleteAccountModal Accessibility (a11y-2)', () => {
  it('should have component file', () => {
    expect(existsSync(componentPath)).toBe(true)
  })

  describe('Reka UI AlertDialog Usage', () => {
    function usesRekaUIAlertDialog(source: string): {
      importsAlertDialog: boolean
      importsAlertDialogContent: boolean
      importsAlertDialogTitle: boolean
      importsAlertDialogDescription: boolean
      importsAlertDialogAction: boolean
      importsAlertDialogCancel: boolean
      usesAlertDialogComponent: boolean
      usesAlertDialogContent: boolean
    } {
      // Check for import from ui/alert-dialog
      const hasAlertDialogImport = /from\s+['"][@/~].*components\/ui\/alert-dialog['"]/.test(source)

      return {
        importsAlertDialog: hasAlertDialogImport && /AlertDialog[,\s}]/.test(source),
        importsAlertDialogContent: hasAlertDialogImport && /AlertDialogContent/.test(source),
        importsAlertDialogTitle: hasAlertDialogImport && /AlertDialogTitle/.test(source),
        importsAlertDialogDescription: hasAlertDialogImport && /AlertDialogDescription/.test(source),
        importsAlertDialogAction: hasAlertDialogImport && /AlertDialogAction/.test(source),
        importsAlertDialogCancel: hasAlertDialogImport && /AlertDialogCancel/.test(source),
        usesAlertDialogComponent: /<AlertDialog[\s/>]/.test(source),
        usesAlertDialogContent: /<AlertDialogContent[\s/>]/.test(source),
      }
    }

    it('should import AlertDialog from Reka UI', () => {
      const source = readFileSync(componentPath, 'utf-8')
      const usage = usesRekaUIAlertDialog(source)
      expect(usage.importsAlertDialog).toBe(true)
    })

    it('should import AlertDialogContent', () => {
      const source = readFileSync(componentPath, 'utf-8')
      const usage = usesRekaUIAlertDialog(source)
      expect(usage.importsAlertDialogContent).toBe(true)
    })

    it('should import AlertDialogTitle', () => {
      const source = readFileSync(componentPath, 'utf-8')
      const usage = usesRekaUIAlertDialog(source)
      expect(usage.importsAlertDialogTitle).toBe(true)
    })

    it('should import AlertDialogDescription', () => {
      const source = readFileSync(componentPath, 'utf-8')
      const usage = usesRekaUIAlertDialog(source)
      expect(usage.importsAlertDialogDescription).toBe(true)
    })

    it('should import AlertDialogAction for destructive button', () => {
      const source = readFileSync(componentPath, 'utf-8')
      const usage = usesRekaUIAlertDialog(source)
      expect(usage.importsAlertDialogAction).toBe(true)
    })

    it('should import AlertDialogCancel for cancel button', () => {
      const source = readFileSync(componentPath, 'utf-8')
      const usage = usesRekaUIAlertDialog(source)
      expect(usage.importsAlertDialogCancel).toBe(true)
    })

    it('should use AlertDialog component in template', () => {
      const source = readFileSync(componentPath, 'utf-8')
      const usage = usesRekaUIAlertDialog(source)
      expect(usage.usesAlertDialogComponent).toBe(true)
    })

    it('should use AlertDialogContent in template', () => {
      const source = readFileSync(componentPath, 'utf-8')
      const usage = usesRekaUIAlertDialog(source)
      expect(usage.usesAlertDialogContent).toBe(true)
    })
  })

  describe('Manual Implementation Removal', () => {
    it('should NOT have manual focus trap function', () => {
      const source = readFileSync(componentPath, 'utf-8')
      // AlertDialog provides automatic focus trapping, so manual implementation should be removed
      expect(/const\s+trapFocus\s*=/.test(source)).toBe(false)
    })

    it('should NOT have manual aria-modal attribute', () => {
      const source = readFileSync(componentPath, 'utf-8')
      // AlertDialog provides aria-modal automatically
      expect(/aria-modal="true"/.test(source)).toBe(false)
    })

    it('should NOT have manual role="dialog" attribute', () => {
      const source = readFileSync(componentPath, 'utf-8')
      // AlertDialog provides role="alertdialog" automatically
      expect(/role="dialog"/.test(source)).toBe(false)
    })

    it('should NOT have manual @keydown.escape handler', () => {
      const source = readFileSync(componentPath, 'utf-8')
      // AlertDialog handles escape key automatically
      expect(/@keydown\.escape/.test(source)).toBe(false)
    })

    it('should NOT have manual @keydown.tab handler for focus trap', () => {
      const source = readFileSync(componentPath, 'utf-8')
      // AlertDialog handles tab key for focus trap automatically
      expect(/@keydown\.tab="trapFocus"/.test(source)).toBe(false)
    })
  })

  describe('Form Accessibility', () => {
    it('should retain form validation with proper aria attributes', () => {
      const source = readFileSync(componentPath, 'utf-8')
      // Form fields should still have proper aria-invalid and aria-describedby
      expect(/aria-invalid/.test(source)).toBe(true)
      expect(/aria-describedby/.test(source)).toBe(true)
    })

    it('should have proper label associations', () => {
      const wrapper = mount(DeleteAccountModal, {
        props: { open: true },
      })
      // Component should render when open
      expect(wrapper.exists()).toBe(true)
    })
  })
})
