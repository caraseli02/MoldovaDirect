/**
 * Composable for managing global keyboard shortcuts
 *
 * @example
 * ```ts
 * const { registerShortcut, unregisterShortcut } = useKeyboardShortcuts()
 *
 * registerShortcut('k', (e) => {
 *   console.log('Ctrl/Cmd + K pressed')
 * }, { ctrlOrCmd: true })
 * ```
 */
export function useKeyboardShortcuts() {
  const shortcuts = new Map<string, {
    handler: (e: KeyboardEvent) => void
    options: KeyboardShortcutOptions
  }>()

  interface KeyboardShortcutOptions {
    /** Require Ctrl (Windows/Linux) or Cmd (Mac) */
    ctrlOrCmd?: boolean
    /** Require Shift key */
    shift?: boolean
    /** Require Alt/Option key */
    alt?: boolean
    /** Prevent default browser behavior */
    preventDefault?: boolean
    /** Stop event propagation */
    stopPropagation?: boolean
    /** Description for accessibility/documentation */
    description?: string
  }

  /**
   * Check if the keyboard event matches the shortcut configuration
   */
  const matchesShortcut = (
    event: KeyboardEvent,
    key: string,
    options: KeyboardShortcutOptions
  ): boolean => {
    // Check if the key matches (case-insensitive)
    if (event.key.toLowerCase() !== key.toLowerCase()) {
      return false
    }

    // Check modifier keys
    const requiresCtrlOrCmd = options.ctrlOrCmd ?? false
    const requiresShift = options.shift ?? false
    const requiresAlt = options.alt ?? false

    const hasCtrlOrCmd = event.ctrlKey || event.metaKey
    const hasShift = event.shiftKey
    const hasAlt = event.altKey

    // Check if modifiers match
    if (requiresCtrlOrCmd && !hasCtrlOrCmd) return false
    if (!requiresCtrlOrCmd && hasCtrlOrCmd) return false

    if (requiresShift && !hasShift) return false
    if (!requiresShift && hasShift) return false

    if (requiresAlt && !hasAlt) return false
    if (!requiresAlt && hasAlt) return false

    return true
  }

  /**
   * Global keydown event handler
   */
  const handleKeydown = (event: KeyboardEvent) => {
    // Don't trigger shortcuts when user is typing in an input field
    const target = event.target as HTMLElement
    const isInput = target.tagName === 'INPUT' ||
                    target.tagName === 'TEXTAREA' ||
                    target.isContentEditable

    // Allow Ctrl/Cmd+K even in input fields for search
    const isSearchShortcut = (event.key.toLowerCase() === 'k' && (event.ctrlKey || event.metaKey))

    if (isInput && !isSearchShortcut) {
      return
    }

    // Check each registered shortcut
    for (const [key, { handler, options }] of shortcuts.entries()) {
      if (matchesShortcut(event, key, options)) {
        if (options.preventDefault) {
          event.preventDefault()
        }
        if (options.stopPropagation) {
          event.stopPropagation()
        }
        handler(event)
        break // Only trigger the first matching shortcut
      }
    }
  }

  /**
   * Register a keyboard shortcut
   */
  const registerShortcut = (
    key: string,
    handler: (e: KeyboardEvent) => void,
    options: KeyboardShortcutOptions = {}
  ) => {
    const shortcutKey = getShortcutKey(key, options)
    shortcuts.set(shortcutKey, { handler, options })
  }

  /**
   * Unregister a keyboard shortcut
   */
  const unregisterShortcut = (key: string, options: KeyboardShortcutOptions = {}) => {
    const shortcutKey = getShortcutKey(key, options)
    shortcuts.delete(shortcutKey)
  }

  /**
   * Get a unique key for the shortcut combination
   */
  const getShortcutKey = (key: string, options: KeyboardShortcutOptions): string => {
    const parts: string[] = []
    if (options.ctrlOrCmd) parts.push('ctrl')
    if (options.shift) parts.push('shift')
    if (options.alt) parts.push('alt')
    parts.push(key.toLowerCase())
    return parts.join('+')
  }

  /**
   * Get the display name for a shortcut (e.g., "Ctrl+K" or "⌘K")
   */
  const getShortcutDisplay = (key: string, options: KeyboardShortcutOptions = {}): string => {
    const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform)
    const parts: string[] = []

    if (options.ctrlOrCmd) {
      parts.push(isMac ? '⌘' : 'Ctrl')
    }
    if (options.shift) {
      parts.push(isMac ? '⇧' : 'Shift')
    }
    if (options.alt) {
      parts.push(isMac ? '⌥' : 'Alt')
    }
    parts.push(key.toUpperCase())

    return isMac ? parts.join('') : parts.join('+')
  }

  /**
   * Setup lifecycle hooks
   */
  onMounted(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeydown)
    }
  })

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', handleKeydown)
    }
    shortcuts.clear()
  })

  return {
    registerShortcut,
    unregisterShortcut,
    getShortcutDisplay
  }
}
