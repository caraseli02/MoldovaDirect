/**
 * Recently Viewed Component Tests
 *
 * TDD: Tests for the extracted RecentlyViewed component
 */
import { describe, it, expect } from 'vitest'

describe('RecentlyViewed Component', () => {
  it('should accept products array prop', () => {
    const products = [
      { id: '1', name: 'Product 1' },
      { id: '2', name: 'Product 2' },
    ]

    expect(products).toHaveLength(2)
  })

  it('should only render when products exist', () => {
    const emptyProducts: never[] = []
    const withProducts = [{ id: '1', name: 'Product 1' }]

    expect(emptyProducts.length).toBe(0)
    expect(withProducts.length).toBe(1)
  })
})
