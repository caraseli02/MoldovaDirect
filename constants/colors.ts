/**
 * Moldova Direct Brand Colors
 *
 * These colors define the core brand identity inspired by To'ak Chocolate's design system.
 * Use these constants when you need to reference colors in TypeScript/JavaScript.
 * For styling, prefer using CSS variables (var(--brand-*)) or Tailwind classes (bg-brand-*).
 */
export const BRAND_COLORS = {
  /** Primary dark brown - Used for backgrounds, text, and primary UI elements */
  DARK: '#241405',

  /** Primary cream - Used for backgrounds and text on dark surfaces */
  LIGHT: '#FCFAF2',

  /** Wine red accent - Used for CTAs, highlights, and interactive elements */
  ACCENT: '#722F37',
} as const

/**
 * CSS variable names for brand colors
 * Use these in style objects when you need to reference CSS variables programmatically
 */
export const BRAND_CSS_VARS = {
  DARK: 'var(--brand-dark)',
  LIGHT: 'var(--brand-light)',
  ACCENT: 'var(--brand-accent)',
} as const

/**
 * Tailwind class names for brand colors
 * Common utility class combinations for quick reference
 */
export const BRAND_CLASSES = {
  BG_DARK: 'bg-brand-dark',
  BG_LIGHT: 'bg-brand-light',
  BG_ACCENT: 'bg-brand-accent',
  TEXT_DARK: 'text-brand-dark',
  TEXT_LIGHT: 'text-brand-light',
  TEXT_ACCENT: 'text-brand-accent',
  BORDER_DARK: 'border-brand-dark',
  BORDER_LIGHT: 'border-brand-light',
  BORDER_ACCENT: 'border-brand-accent',
} as const
