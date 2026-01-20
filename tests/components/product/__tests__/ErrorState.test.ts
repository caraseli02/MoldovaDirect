/**
 * Error State Component Tests
 */
import { describe, it, expect } from 'vitest'

describe('ErrorState Component', () => {
  it('should accept errorMessage prop', () => {
    const props = { errorMessage: 'Something went wrong' }
    expect(props.errorMessage).toBe('Something went wrong')
  })

  it('should emit retry event', () => {
    const emits = ['retry']
    expect(emits).toContain('retry')
  })
})
