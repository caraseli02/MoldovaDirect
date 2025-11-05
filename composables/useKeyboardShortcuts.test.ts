import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, ref } from 'vue'

// Mock navigator for platform detection
const originalNavigator = global.navigator
const mockNavigator = (platform: string) => {
  Object.defineProperty(global, 'navigator', {
    value: { platform },
    writable: true,
    configurable: true,
  })
}

// Import AFTER mocks are set up
const { useKeyboardShortcuts } = await import('./useKeyboardShortcuts')

describe('useKeyboardShortcuts', () => {
  let eventListeners: Map<string, EventListener>

  beforeEach(() => {
    vi.clearAllMocks()
    eventListeners = new Map()

    // Mock addEventListener and removeEventListener
    global.window.addEventListener = vi.fn((event: string, handler: EventListener) => {
      eventListeners.set(event, handler)
    })
    global.window.removeEventListener = vi.fn((event: string) => {
      eventListeners.delete(event)
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    // Restore original navigator
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true,
      configurable: true,
    })
  })

  describe('Initialization', () => {
    it('returns correct API methods', () => {
      const TestComponent = defineComponent({
        setup() {
          const api = useKeyboardShortcuts()
          return { api }
        },
        template: '<div></div>',
      })

      const wrapper = mount(TestComponent)
      const api = wrapper.vm.api

      expect(api).toHaveProperty('registerShortcut')
      expect(api).toHaveProperty('unregisterShortcut')
      expect(api).toHaveProperty('getShortcutDisplay')
      expect(typeof api.registerShortcut).toBe('function')
      expect(typeof api.unregisterShortcut).toBe('function')
      expect(typeof api.getShortcutDisplay).toBe('function')
    })

    it('attaches global keydown listener on mount', () => {
      const TestComponent = defineComponent({
        setup() {
          useKeyboardShortcuts()
          return {}
        },
        template: '<div></div>',
      })

      mount(TestComponent)

      expect(window.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function))
    })
  })

  describe('registerShortcut and unregisterShortcut', () => {
    it('registers and triggers a basic shortcut', () => {
      const handler = vi.fn()
      const TestComponent = defineComponent({
        setup() {
          const { registerShortcut } = useKeyboardShortcuts()
          registerShortcut('k', handler, { ctrlOrCmd: true, preventDefault: true })
          return {}
        },
        template: '<div></div>',
      })

      mount(TestComponent)

      // Simulate Ctrl+K
      const keydownHandler = eventListeners.get('keydown')
      expect(keydownHandler).toBeDefined()

      const event = new KeyboardEvent('keydown', {
        key: 'k',
        ctrlKey: true,
        bubbles: true,
      })
      Object.defineProperty(event, 'target', {
        value: document.body,
        writable: false,
      })

      keydownHandler!(event)

      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith(expect.any(KeyboardEvent))
    })

    it('unregisters a shortcut', () => {
      const handler = vi.fn()
      const TestComponent = defineComponent({
        setup() {
          const { registerShortcut, unregisterShortcut } = useKeyboardShortcuts()
          registerShortcut('k', handler, { ctrlOrCmd: true })
          unregisterShortcut('k', { ctrlOrCmd: true })
          return {}
        },
        template: '<div></div>',
      })

      mount(TestComponent)

      // Simulate Ctrl+K
      const keydownHandler = eventListeners.get('keydown')
      const event = new KeyboardEvent('keydown', {
        key: 'k',
        ctrlKey: true,
      })
      Object.defineProperty(event, 'target', {
        value: document.body,
        writable: false,
      })

      keydownHandler!(event)

      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('Shortcut matching', () => {
    it('matches Ctrl+K on Windows/Linux', () => {
      const handler = vi.fn()
      const TestComponent = defineComponent({
        setup() {
          const { registerShortcut } = useKeyboardShortcuts()
          registerShortcut('k', handler, { ctrlOrCmd: true })
          return {}
        },
        template: '<div></div>',
      })

      mount(TestComponent)

      const keydownHandler = eventListeners.get('keydown')
      const event = new KeyboardEvent('keydown', {
        key: 'k',
        ctrlKey: true,
      })
      Object.defineProperty(event, 'target', {
        value: document.body,
        writable: false,
      })

      keydownHandler!(event)

      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('matches Cmd+K on Mac', () => {
      const handler = vi.fn()
      const TestComponent = defineComponent({
        setup() {
          const { registerShortcut } = useKeyboardShortcuts()
          registerShortcut('k', handler, { ctrlOrCmd: true })
          return {}
        },
        template: '<div></div>',
      })

      mount(TestComponent)

      const keydownHandler = eventListeners.get('keydown')
      const event = new KeyboardEvent('keydown', {
        key: 'k',
        metaKey: true,
      })
      Object.defineProperty(event, 'target', {
        value: document.body,
        writable: false,
      })

      keydownHandler!(event)

      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('matches Shift+Alt+K', () => {
      const handler = vi.fn()
      const TestComponent = defineComponent({
        setup() {
          const { registerShortcut } = useKeyboardShortcuts()
          registerShortcut('k', handler, { shift: true, alt: true })
          return {}
        },
        template: '<div></div>',
      })

      mount(TestComponent)

      const keydownHandler = eventListeners.get('keydown')
      const event = new KeyboardEvent('keydown', {
        key: 'k',
        shiftKey: true,
        altKey: true,
      })
      Object.defineProperty(event, 'target', {
        value: document.body,
        writable: false,
      })

      keydownHandler!(event)

      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('does not match when modifiers are incorrect', () => {
      const handler = vi.fn()
      const TestComponent = defineComponent({
        setup() {
          const { registerShortcut } = useKeyboardShortcuts()
          registerShortcut('k', handler, { ctrlOrCmd: true })
          return {}
        },
        template: '<div></div>',
      })

      mount(TestComponent)

      const keydownHandler = eventListeners.get('keydown')

      // Try without Ctrl/Cmd
      const event1 = new KeyboardEvent('keydown', { key: 'k' })
      Object.defineProperty(event1, 'target', {
        value: document.body,
        writable: false,
      })
      keydownHandler!(event1)

      // Try with extra modifier
      const event2 = new KeyboardEvent('keydown', {
        key: 'k',
        ctrlKey: true,
        shiftKey: true,
      })
      Object.defineProperty(event2, 'target', {
        value: document.body,
        writable: false,
      })
      keydownHandler!(event2)

      expect(handler).not.toHaveBeenCalled()
    })

    it('is case-insensitive for keys', () => {
      const handler = vi.fn()
      const TestComponent = defineComponent({
        setup() {
          const { registerShortcut } = useKeyboardShortcuts()
          registerShortcut('K', handler, { ctrlOrCmd: true })
          return {}
        },
        template: '<div></div>',
      })

      mount(TestComponent)

      const keydownHandler = eventListeners.get('keydown')
      const event = new KeyboardEvent('keydown', {
        key: 'k',
        ctrlKey: true,
      })
      Object.defineProperty(event, 'target', {
        value: document.body,
        writable: false,
      })

      keydownHandler!(event)

      expect(handler).toHaveBeenCalledTimes(1)
    })
  })

  describe('Input field handling', () => {
    it('does not trigger shortcuts in input fields', () => {
      const handler = vi.fn()
      const TestComponent = defineComponent({
        setup() {
          const { registerShortcut } = useKeyboardShortcuts()
          registerShortcut('a', handler)
          return {}
        },
        template: '<div></div>',
      })

      mount(TestComponent)

      const keydownHandler = eventListeners.get('keydown')
      const input = document.createElement('input')
      const event = new KeyboardEvent('keydown', { key: 'a' })
      Object.defineProperty(event, 'target', {
        value: input,
        writable: false,
      })

      keydownHandler!(event)

      expect(handler).not.toHaveBeenCalled()
    })

    it('does not trigger shortcuts in textarea', () => {
      const handler = vi.fn()
      const TestComponent = defineComponent({
        setup() {
          const { registerShortcut } = useKeyboardShortcuts()
          registerShortcut('a', handler)
          return {}
        },
        template: '<div></div>',
      })

      mount(TestComponent)

      const keydownHandler = eventListeners.get('keydown')
      const textarea = document.createElement('textarea')
      const event = new KeyboardEvent('keydown', { key: 'a' })
      Object.defineProperty(event, 'target', {
        value: textarea,
        writable: false,
      })

      keydownHandler!(event)

      expect(handler).not.toHaveBeenCalled()
    })

    it('allows Ctrl/Cmd+K even in input fields (search shortcut)', () => {
      const handler = vi.fn()
      const TestComponent = defineComponent({
        setup() {
          const { registerShortcut } = useKeyboardShortcuts()
          registerShortcut('k', handler, { ctrlOrCmd: true })
          return {}
        },
        template: '<div></div>',
      })

      mount(TestComponent)

      const keydownHandler = eventListeners.get('keydown')
      const input = document.createElement('input')
      const event = new KeyboardEvent('keydown', {
        key: 'k',
        ctrlKey: true,
      })
      Object.defineProperty(event, 'target', {
        value: input,
        writable: false,
      })

      keydownHandler!(event)

      expect(handler).toHaveBeenCalledTimes(1)
    })
  })

  describe('Event options', () => {
    it('calls preventDefault when option is set', () => {
      const handler = vi.fn()
      const TestComponent = defineComponent({
        setup() {
          const { registerShortcut } = useKeyboardShortcuts()
          registerShortcut('k', handler, { ctrlOrCmd: true, preventDefault: true })
          return {}
        },
        template: '<div></div>',
      })

      mount(TestComponent)

      const keydownHandler = eventListeners.get('keydown')
      const event = new KeyboardEvent('keydown', {
        key: 'k',
        ctrlKey: true,
      })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
      Object.defineProperty(event, 'target', {
        value: document.body,
        writable: false,
      })

      keydownHandler!(event)

      expect(preventDefaultSpy).toHaveBeenCalled()
    })

    it('calls stopPropagation when option is set', () => {
      const handler = vi.fn()
      const TestComponent = defineComponent({
        setup() {
          const { registerShortcut } = useKeyboardShortcuts()
          registerShortcut('k', handler, { ctrlOrCmd: true, stopPropagation: true })
          return {}
        },
        template: '<div></div>',
      })

      mount(TestComponent)

      const keydownHandler = eventListeners.get('keydown')
      const event = new KeyboardEvent('keydown', {
        key: 'k',
        ctrlKey: true,
      })
      const stopPropagationSpy = vi.spyOn(event, 'stopPropagation')
      Object.defineProperty(event, 'target', {
        value: document.body,
        writable: false,
      })

      keydownHandler!(event)

      expect(stopPropagationSpy).toHaveBeenCalled()
    })
  })

  describe('getShortcutDisplay', () => {
    it('returns Mac format when on Mac platform', () => {
      mockNavigator('MacIntel')

      const TestComponent = defineComponent({
        setup() {
          const { getShortcutDisplay } = useKeyboardShortcuts()
          return { display: getShortcutDisplay('k', { ctrlOrCmd: true }) }
        },
        template: '<div>{{ display }}</div>',
      })

      const wrapper = mount(TestComponent)

      expect(wrapper.vm.display).toBe('⌘K')
    })

    it('returns Windows format when on Windows platform', () => {
      mockNavigator('Win32')

      const TestComponent = defineComponent({
        setup() {
          const { getShortcutDisplay } = useKeyboardShortcuts()
          return { display: getShortcutDisplay('k', { ctrlOrCmd: true }) }
        },
        template: '<div>{{ display }}</div>',
      })

      const wrapper = mount(TestComponent)

      expect(wrapper.vm.display).toBe('Ctrl+K')
    })

    it('returns formatted shortcut with multiple modifiers', () => {
      mockNavigator('Win32')

      const TestComponent = defineComponent({
        setup() {
          const { getShortcutDisplay } = useKeyboardShortcuts()
          return {
            display: getShortcutDisplay('k', {
              ctrlOrCmd: true,
              shift: true,
              alt: true,
            }),
          }
        },
        template: '<div>{{ display }}</div>',
      })

      const wrapper = mount(TestComponent)

      expect(wrapper.vm.display).toBe('Ctrl+Shift+Alt+K')
    })
  })

  describe('Cleanup', () => {
    it('removes event listener and clears shortcuts on unmount', () => {
      const handler = vi.fn()
      const TestComponent = defineComponent({
        setup() {
          const { registerShortcut } = useKeyboardShortcuts()
          registerShortcut('k', handler, { ctrlOrCmd: true })
          return {}
        },
        template: '<div></div>',
      })

      const wrapper = mount(TestComponent)
      wrapper.unmount()

      // Try to trigger after unmount
      const keydownHandler = eventListeners.get('keydown')
      if (keydownHandler) {
        const event = new KeyboardEvent('keydown', {
          key: 'k',
          ctrlKey: true,
        })
        Object.defineProperty(event, 'target', {
          value: document.body,
          writable: false,
        })
        keydownHandler(event)
      }

      // Should not be called after unmount
      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('Multiple instances', () => {
    it('handles multiple components registering different shortcuts', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()

      const Component1 = defineComponent({
        setup() {
          const { registerShortcut } = useKeyboardShortcuts()
          registerShortcut('a', handler1)
          return {}
        },
        template: '<div></div>',
      })

      const Component2 = defineComponent({
        setup() {
          const { registerShortcut } = useKeyboardShortcuts()
          registerShortcut('b', handler2)
          return {}
        },
        template: '<div></div>',
      })

      mount(Component1)
      mount(Component2)

      const keydownHandler = eventListeners.get('keydown')

      // Trigger shortcut A
      const eventA = new KeyboardEvent('keydown', { key: 'a' })
      Object.defineProperty(eventA, 'target', {
        value: document.body,
        writable: false,
      })
      keydownHandler!(eventA)

      // Trigger shortcut B
      const eventB = new KeyboardEvent('keydown', { key: 'b' })
      Object.defineProperty(eventB, 'target', {
        value: document.body,
        writable: false,
      })
      keydownHandler!(eventB)

      expect(handler1).toHaveBeenCalledTimes(1)
      expect(handler2).toHaveBeenCalledTimes(1)
    })
  })
})
