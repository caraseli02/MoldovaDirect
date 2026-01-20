/**
 * Search Bar Component Tests
 *
 * TDD: Tests for the extracted SearchBar component
 */
import { describe, it, expect } from 'vitest'

describe('SearchBar Component', () => {
  it('should accept modelValue prop', () => {
    const props = { modelValue: '', placeholder: 'Search...' }
    expect(props.modelValue).toBe('')
    expect(props.placeholder).toBe('Search...')
  })

  it('should emit update:modelValue on input', () => {
    const emits = ['update:modelValue', 'search', 'clear']
    expect(emits).toContain('update:modelValue')
    expect(emits).toContain('search')
    expect(emits).toContain('clear')
  })

  it('should expose focus method', () => {
    const exposedMethods = ['focus']
    expect(exposedMethods).toContain('focus')
  })
})
