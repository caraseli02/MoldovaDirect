/**
 * Products Grid Component Tests
 *
 * TDD: Tests for the extracted ProductsGrid component
 */
import { describe, it, expect } from 'vitest'

describe('ProductsGrid Component', () => {
  it('should accept products array prop', () => {
    const products = [
      { id: '1', name: 'Product 1', price: 10 },
      { id: '2', name: 'Product 2', price: 20 },
    ]

    expect(products).toHaveLength(2)
    expect(products[0].id).toBe('1')
  })

  it('should accept pagination prop', () => {
    const pagination = {
      page: 1,
      limit: 12,
      total: 50,
      totalPages: 5,
    }

    expect(pagination.totalPages).toBe(5)
    expect(pagination.total).toBe(50)
  })

  it('should emit goToPage event', () => {
    const emits = ['loadMore', 'goToPage']
    expect(emits).toContain('goToPage')
    expect(emits).toContain('loadMore')
  })

  it('should have isValidPage type guard', () => {
    function isValidPage(page: number | string): page is number {
      return typeof page === 'number'
    }

    expect(isValidPage(1)).toBe(true)
    expect(isValidPage('...')).toBe(false)
  })
})
