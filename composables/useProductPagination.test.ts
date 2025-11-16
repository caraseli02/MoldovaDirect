import { describe, it, expect, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useProductPagination, type PaginationState } from './useProductPagination'

describe('useProductPagination', () => {
  beforeEach(() => {
    // No global state to reset
  })

  describe('Visible Pages Calculation - Small Page Counts (1-7 pages)', () => {
    it('shows single page for 1 total page', () => {
      // Arrange
      const pagination = ref<PaginationState>({
        page: 1,
        limit: 10,
        total: 5,
        totalPages: 1
      })

      // Act
      const { visiblePages } = useProductPagination(pagination)

      // Assert
      expect(visiblePages.value).toEqual([1])
    })

    it('shows all pages for 2 total pages', () => {
      // Arrange
      const pagination = ref<PaginationState>({
        page: 1,
        limit: 10,
        total: 15,
        totalPages: 2
      })

      // Act
      const { visiblePages } = useProductPagination(pagination)

      // Assert
      expect(visiblePages.value).toEqual([1, 2])
    })

    it('shows all pages for 5 total pages', () => {
      // Arrange
      const pagination = ref<PaginationState>({
        page: 3,
        limit: 10,
        total: 45,
        totalPages: 5
      })

      // Act
      const { visiblePages } = useProductPagination(pagination)

      // Assert
      expect(visiblePages.value).toEqual([1, 2, 3, 4, 5])
    })

    it('shows all pages for exactly 7 total pages (no ellipsis)', () => {
      // Arrange
      const pagination = ref<PaginationState>({
        page: 4,
        limit: 10,
        total: 70,
        totalPages: 7
      })

      // Act
      const { visiblePages } = useProductPagination(pagination)

      // Assert
      expect(visiblePages.value).toEqual([1, 2, 3, 4, 5, 6, 7])
    })

    it('shows all pages regardless of current page when totalPages <= 7', () => {
      // Arrange
      const pagination = ref<PaginationState>({
        page: 1,
        limit: 10,
        total: 60,
        totalPages: 6
      })

      // Act
      const { visiblePages } = useProductPagination(pagination)

      // Assert
      expect(visiblePages.value).toEqual([1, 2, 3, 4, 5, 6])
    })
  })

  describe('Visible Pages Calculation - Medium Page Counts (8-20 pages)', () => {
    it('shows ellipsis for 8 total pages on first page', () => {
      // Arrange
      const pagination = ref<PaginationState>({
        page: 1,
        limit: 10,
        total: 80,
        totalPages: 8
      })

      // Act
      const { visiblePages } = useProductPagination(pagination)

      // Assert
      expect(visiblePages.value).toEqual([1, 2, '...', 8])
    })

    it('shows correct pages for 8 total pages on page 2', () => {
      // Arrange
      const pagination = ref<PaginationState>({
        page: 2,
        limit: 10,
        total: 80,
        totalPages: 8
      })

      // Act
      const { visiblePages } = useProductPagination(pagination)

      // Assert
      expect(visiblePages.value).toEqual([1, 2, 3, '...', 8])
    })

    it('shows correct pages for 8 total pages on page 3', () => {
      // Arrange
      const pagination = ref<PaginationState>({
        page: 3,
        limit: 10,
        total: 80,
        totalPages: 8
      })

      // Act
      const { visiblePages } = useProductPagination(pagination)

      // Assert
      expect(visiblePages.value).toEqual([1, 2, 3, 4, '...', 8])
    })

    it('shows correct pages for 20 total pages on page 1', () => {
      // Arrange
      const pagination = ref<PaginationState>({
        page: 1,
        limit: 10,
        total: 200,
        totalPages: 20
      })

      // Act
      const { visiblePages } = useProductPagination(pagination)

      // Assert
      expect(visiblePages.value).toEqual([1, 2, '...', 20])
    })

    it('shows correct pages for 20 total pages on page 5', () => {
      // Arrange
      const pagination = ref<PaginationState>({
        page: 5,
        limit: 10,
        total: 200,
        totalPages: 20
      })

      // Act
      const { visiblePages } = useProductPagination(pagination)

      // Assert
      expect(visiblePages.value).toEqual([1, '...', 4, 5, 6, '...', 20])
    })

    it('shows correct pages for 20 total pages on page 10 (middle)', () => {
      // Arrange
      const pagination = ref<PaginationState>({
        page: 10,
        limit: 10,
        total: 200,
        totalPages: 20
      })

      // Act
      const { visiblePages } = useProductPagination(pagination)

      // Assert
      expect(visiblePages.value).toEqual([1, '...', 9, 10, 11, '...', 20])
    })

    it('shows correct pages for 20 total pages on page 19 (near end)', () => {
      // Arrange
      const pagination = ref<PaginationState>({
        page: 19,
        limit: 10,
        total: 200,
        totalPages: 20
      })

      // Act
      const { visiblePages } = useProductPagination(pagination)

      // Assert
      expect(visiblePages.value).toEqual([1, '...', 18, 19, 20])
    })

    it('shows correct pages for 20 total pages on page 20 (last)', () => {
      // Arrange
      const pagination = ref<PaginationState>({
        page: 20,
        limit: 10,
        total: 200,
        totalPages: 20
      })

      // Act
      const { visiblePages } = useProductPagination(pagination)

      // Assert
      expect(visiblePages.value).toEqual([1, '...', 19, 20])
    })
  })

  describe('Visible Pages Calculation - Large Page Counts (100 pages)', () => {
    it('shows correct pages for 100 total pages on page 1', () => {
      // Arrange
      const pagination = ref<PaginationState>({
        page: 1,
        limit: 10,
        total: 1000,
        totalPages: 100
      })

      // Act
      const { visiblePages } = useProductPagination(pagination)

      // Assert
      expect(visiblePages.value).toEqual([1, 2, '...', 100])
    })

    it('shows correct pages for 100 total pages on page 5', () => {
      // Arrange
      const pagination = ref<PaginationState>({
        page: 5,
        limit: 10,
        total: 1000,
        totalPages: 100
      })

      // Act
      const { visiblePages } = useProductPagination(pagination)

      // Assert
      expect(visiblePages.value).toEqual([1, '...', 4, 5, 6, '...', 100])
    })

    it('shows correct pages for 100 total pages on page 50 (exact middle)', () => {
      // Arrange
      const pagination = ref<PaginationState>({
        page: 50,
        limit: 10,
        total: 1000,
        totalPages: 100
      })

      // Act
      const { visiblePages } = useProductPagination(pagination)

      // Assert
      expect(visiblePages.value).toEqual([1, '...', 49, 50, 51, '...', 100])
    })

    it('shows correct pages for 100 total pages on page 96 (near end)', () => {
      // Arrange
      const pagination = ref<PaginationState>({
        page: 96,
        limit: 10,
        total: 1000,
        totalPages: 100
      })

      // Act
      const { visiblePages } = useProductPagination(pagination)

      // Assert
      expect(visiblePages.value).toEqual([1, '...', 95, 96, 97, '...', 100])
    })

    it('shows correct pages for 100 total pages on page 97 (transition point)', () => {
      // Arrange
      const pagination = ref<PaginationState>({
        page: 97,
        limit: 10,
        total: 1000,
        totalPages: 100
      })

      // Act
      const { visiblePages } = useProductPagination(pagination)

      // Assert
      expect(visiblePages.value).toEqual([1, '...', 96, 97, 98, 100])
    })

    it('shows correct pages for 100 total pages on page 100 (last)', () => {
      // Arrange
      const pagination = ref<PaginationState>({
        page: 100,
        limit: 10,
        total: 1000,
        totalPages: 100
      })

      // Act
      const { visiblePages } = useProductPagination(pagination)

      // Assert
      expect(visiblePages.value).toEqual([1, '...', 99, 100])
    })
  })

  describe('Ellipsis Logic - Boundary Conditions', () => {
    it('shows no ellipsis at start when current page <= 3', () => {
      // Arrange
      const pagination = ref<PaginationState>({
        page: 3,
        limit: 10,
        total: 100,
        totalPages: 10
      })

      // Act
      const { visiblePages } = useProductPagination(pagination)

      // Assert
      expect(visiblePages.value).toEqual([1, 2, 3, 4, '...', 10])
      expect(visiblePages.value[1]).not.toBe('...')
    })

    it('shows no ellipsis at start when current page = 4', () => {
      // Arrange
      const pagination = ref<PaginationState>({
        page: 4,
        limit: 10,
        total: 100,
        totalPages: 10
      })

      // Act
      const { visiblePages } = useProductPagination(pagination)

      // Assert
      expect(visiblePages.value).toEqual([1, 3, 4, 5, '...', 10])
      expect(visiblePages.value[1]).not.toBe('...')
    })

    it('shows ellipsis at start when current page = 5', () => {
      // Arrange
      const pagination = ref<PaginationState>({
        page: 5,
        limit: 10,
        total: 100,
        totalPages: 10
      })

      // Act
      const { visiblePages } = useProductPagination(pagination)

      // Assert
      expect(visiblePages.value).toEqual([1, '...', 4, 5, 6, '...', 10])
      expect(visiblePages.value[1]).toBe('...')
    })

    it('shows no ellipsis at end when current page >= totalPages - 3', () => {
      // Arrange
      const pagination = ref<PaginationState>({
        page: 7,
        limit: 10,
        total: 100,
        totalPages: 10
      })

      // Act
      const { visiblePages } = useProductPagination(pagination)

      // Assert
      expect(visiblePages.value).toEqual([1, '...', 6, 7, 8, 10])
      expect(visiblePages.value[visiblePages.value.length - 2]).not.toBe('...')
    })

    it('shows ellipsis at end when current page = totalPages - 4', () => {
      // Arrange
      const pagination = ref<PaginationState>({
        page: 6,
        limit: 10,
        total: 100,
        totalPages: 10
      })

      // Act
      const { visiblePages } = useProductPagination(pagination)

      // Assert
      expect(visiblePages.value).toEqual([1, '...', 5, 6, 7, '...', 10])
      expect(visiblePages.value).toContain('...')
    })

    it('shows both ellipses when in middle of large page set', () => {
      // Arrange
      const pagination = ref<PaginationState>({
        page: 15,
        limit: 10,
        total: 300,
        totalPages: 30
      })

      // Act
      const { visiblePages } = useProductPagination(pagination)

      // Assert
      expect(visiblePages.value).toEqual([1, '...', 14, 15, 16, '...', 30])
      expect(visiblePages.value.filter(p => p === '...')).toHaveLength(2)
    })
  })

  describe('Page Boundary Detection', () => {
    it('detects first page correctly when on page 1', () => {
      // Arrange
      const pagination = ref<PaginationState>({
        page: 1,
        limit: 10,
        total: 50,
        totalPages: 5
      })

      // Act
      const { isFirstPage, isLastPage } = useProductPagination(pagination)

      // Assert
      expect(isFirstPage.value).toBe(true)
      expect(isLastPage.value).toBe(false)
    })

    it('detects not first page when on page 2', () => {
      // Arrange
      const pagination = ref<PaginationState>({
        page: 2,
        limit: 10,
        total: 50,
        totalPages: 5
      })

      // Act
      const { isFirstPage } = useProductPagination(pagination)

      // Assert
      expect(isFirstPage.value).toBe(false)
    })

    it('detects last page correctly when on last page', () => {
      // Arrange
      const pagination = ref<PaginationState>({
        page: 5,
        limit: 10,
        total: 50,
        totalPages: 5
      })

      // Act
      const { isLastPage, isFirstPage } = useProductPagination(pagination)

      // Assert
      expect(isLastPage.value).toBe(true)
      expect(isFirstPage.value).toBe(false)
    })

    it('detects not last page when on middle page', () => {
      // Arrange
      const pagination = ref<PaginationState>({
        page: 3,
        limit: 10,
        total: 50,
        totalPages: 5
      })

      // Act
      const { isLastPage } = useProductPagination(pagination)

      // Assert
      expect(isLastPage.value).toBe(false)
    })

    it('detects first and last page for single page', () => {
      // Arrange
      const pagination = ref<PaginationState>({
        page: 1,
        limit: 10,
        total: 5,
        totalPages: 1
      })

      // Act
      const { isFirstPage, isLastPage } = useProductPagination(pagination)

      // Assert
      expect(isFirstPage.value).toBe(true)
      expect(isLastPage.value).toBe(true)
    })

    it('handles page 0 as first page', () => {
      // Arrange
      const pagination = ref<PaginationState>({
        page: 0,
        limit: 10,
        total: 50,
        totalPages: 5
      })

      // Act
      const { isFirstPage } = useProductPagination(pagination)

      // Assert
      expect(isFirstPage.value).toBe(true)
    })

    it('handles page beyond totalPages as last page', () => {
      // Arrange
      const pagination = ref<PaginationState>({
        page: 10,
        limit: 10,
        total: 50,
        totalPages: 5
      })

      // Act
      const { isLastPage } = useProductPagination(pagination)

      // Assert
      expect(isLastPage.value).toBe(true)
    })

    it('handles negative page number as first page', () => {
      // Arrange
      const pagination = ref<PaginationState>({
        page: -1,
        limit: 10,
        total: 50,
        totalPages: 5
      })

      // Act
      const { isFirstPage } = useProductPagination(pagination)

      // Assert
      expect(isFirstPage.value).toBe(true)
    })
  })

  describe('Item Range Calculation', () => {
    it('calculates correct range for first page', () => {
      // Arrange
      const pagination = ref<PaginationState>({
        page: 1,
        limit: 10,
        total: 50,
        totalPages: 5
      })

      // Act
      const { currentRange } = useProductPagination(pagination)

      // Assert
      expect(currentRange.value).toEqual({ start: 1, end: 10 })
    })

    it('calculates correct range for second page', () => {
      // Arrange
      const pagination = ref<PaginationState>({
        page: 2,
        limit: 10,
        total: 50,
        totalPages: 5
      })

      // Act
      const { currentRange } = useProductPagination(pagination)

      // Assert
      expect(currentRange.value).toEqual({ start: 11, end: 20 })
    })

    it('calculates correct range for middle page', () => {
      // Arrange
      const pagination = ref<PaginationState>({
        page: 3,
        limit: 10,
        total: 50,
        totalPages: 5
      })

      // Act
      const { currentRange } = useProductPagination(pagination)

      // Assert
      expect(currentRange.value).toEqual({ start: 21, end: 30 })
    })

    it('calculates correct range for last full page', () => {
      // Arrange
      const pagination = ref<PaginationState>({
        page: 5,
        limit: 10,
        total: 50,
        totalPages: 5
      })

      // Act
      const { currentRange } = useProductPagination(pagination)

      // Assert
      expect(currentRange.value).toEqual({ start: 41, end: 50 })
    })

    it('calculates correct range for partial last page', () => {
      // Arrange
      const pagination = ref<PaginationState>({
        page: 5,
        limit: 10,
        total: 47,
        totalPages: 5
      })

      // Act
      const { currentRange } = useProductPagination(pagination)

      // Assert
      expect(currentRange.value).toEqual({ start: 41, end: 47 })
    })

    it('calculates correct range with different limit (20 items)', () => {
      // Arrange
      const pagination = ref<PaginationState>({
        page: 2,
        limit: 20,
        total: 100,
        totalPages: 5
      })

      // Act
      const { currentRange } = useProductPagination(pagination)

      // Assert
      expect(currentRange.value).toEqual({ start: 21, end: 40 })
    })

    it('calculates correct range with different limit (5 items)', () => {
      // Arrange
      const pagination = ref<PaginationState>({
        page: 3,
        limit: 5,
        total: 25,
        totalPages: 5
      })

      // Act
      const { currentRange } = useProductPagination(pagination)

      // Assert
      expect(currentRange.value).toEqual({ start: 11, end: 15 })
    })

    it('handles single item on last page', () => {
      // Arrange
      const pagination = ref<PaginationState>({
        page: 6,
        limit: 10,
        total: 51,
        totalPages: 6
      })

      // Act
      const { currentRange } = useProductPagination(pagination)

      // Assert
      expect(currentRange.value).toEqual({ start: 51, end: 51 })
    })

    it('handles zero total items', () => {
      // Arrange
      const pagination = ref<PaginationState>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      })

      // Act
      const { currentRange } = useProductPagination(pagination)

      // Assert
      expect(currentRange.value).toEqual({ start: 1, end: 0 })
    })

    it('calculates range correctly for large page numbers', () => {
      // Arrange
      const pagination = ref<PaginationState>({
        page: 50,
        limit: 10,
        total: 1000,
        totalPages: 100
      })

      // Act
      const { currentRange } = useProductPagination(pagination)

      // Assert
      expect(currentRange.value).toEqual({ start: 491, end: 500 })
    })
  })

  describe('Multiple Pages Flag', () => {
    it('returns false for single page', () => {
      // Arrange
      const pagination = ref<PaginationState>({
        page: 1,
        limit: 10,
        total: 5,
        totalPages: 1
      })

      // Act
      const { hasMultiplePages } = useProductPagination(pagination)

      // Assert
      expect(hasMultiplePages.value).toBe(false)
    })

    it('returns true for two pages', () => {
      // Arrange
      const pagination = ref<PaginationState>({
        page: 1,
        limit: 10,
        total: 15,
        totalPages: 2
      })

      // Act
      const { hasMultiplePages } = useProductPagination(pagination)

      // Assert
      expect(hasMultiplePages.value).toBe(true)
    })

    it('returns true for many pages', () => {
      // Arrange
      const pagination = ref<PaginationState>({
        page: 5,
        limit: 10,
        total: 100,
        totalPages: 10
      })

      // Act
      const { hasMultiplePages } = useProductPagination(pagination)

      // Assert
      expect(hasMultiplePages.value).toBe(true)
    })

    it('returns false for zero pages', () => {
      // Arrange
      const pagination = ref<PaginationState>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      })

      // Act
      const { hasMultiplePages } = useProductPagination(pagination)

      // Assert
      expect(hasMultiplePages.value).toBe(false)
    })
  })

  describe('Reactivity and State Changes', () => {
    it('updates visiblePages when pagination changes', () => {
      // Arrange
      const pagination = ref<PaginationState>({
        page: 1,
        limit: 10,
        total: 100,
        totalPages: 10
      })
      const { visiblePages } = useProductPagination(pagination)

      // Act
      pagination.value.page = 5

      // Assert
      expect(visiblePages.value).toEqual([1, '...', 4, 5, 6, '...', 10])
    })

    it('updates currentRange when page changes', () => {
      // Arrange
      const pagination = ref<PaginationState>({
        page: 1,
        limit: 10,
        total: 50,
        totalPages: 5
      })
      const { currentRange } = useProductPagination(pagination)

      // Act
      pagination.value.page = 3

      // Assert
      expect(currentRange.value).toEqual({ start: 21, end: 30 })
    })

    it('updates isFirstPage when navigating away from first page', () => {
      // Arrange
      const pagination = ref<PaginationState>({
        page: 1,
        limit: 10,
        total: 50,
        totalPages: 5
      })
      const { isFirstPage } = useProductPagination(pagination)

      // Act
      pagination.value.page = 2

      // Assert
      expect(isFirstPage.value).toBe(false)
    })

    it('updates isLastPage when navigating to last page', () => {
      // Arrange
      const pagination = ref<PaginationState>({
        page: 1,
        limit: 10,
        total: 50,
        totalPages: 5
      })
      const { isLastPage } = useProductPagination(pagination)

      // Act
      pagination.value.page = 5

      // Assert
      expect(isLastPage.value).toBe(true)
    })

    it('updates hasMultiplePages when totalPages changes', () => {
      // Arrange
      const pagination = ref<PaginationState>({
        page: 1,
        limit: 10,
        total: 5,
        totalPages: 1
      })
      const { hasMultiplePages } = useProductPagination(pagination)

      expect(hasMultiplePages.value).toBe(false)

      // Act
      pagination.value.totalPages = 2
      pagination.value.total = 15

      // Assert
      expect(hasMultiplePages.value).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('handles page 4 with 10 total pages (transition point for start ellipsis)', () => {
      // Arrange
      const pagination = ref<PaginationState>({
        page: 4,
        limit: 10,
        total: 100,
        totalPages: 10
      })

      // Act
      const { visiblePages } = useProductPagination(pagination)

      // Assert
      expect(visiblePages.value).toEqual([1, 3, 4, 5, '...', 10])
    })

    it('handles very large total items count', () => {
      // Arrange
      const pagination = ref<PaginationState>({
        page: 500,
        limit: 10,
        total: 10000,
        totalPages: 1000
      })

      // Act
      const { visiblePages, currentRange } = useProductPagination(pagination)

      // Assert
      expect(visiblePages.value).toEqual([1, '...', 499, 500, 501, '...', 1000])
      expect(currentRange.value).toEqual({ start: 4991, end: 5000 })
    })

    it('handles limit of 1 (one item per page)', () => {
      // Arrange
      const pagination = ref<PaginationState>({
        page: 5,
        limit: 1,
        total: 10,
        totalPages: 10
      })

      // Act
      const { currentRange, visiblePages } = useProductPagination(pagination)

      // Assert
      expect(currentRange.value).toEqual({ start: 5, end: 5 })
      expect(visiblePages.value).toEqual([1, '...', 4, 5, 6, '...', 10])
    })
  })
})
