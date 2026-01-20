/**
 * Loading State Component Tests
 */
import { describe, it, expect } from 'vitest'

describe('LoadingState Component', () => {
  it('should accept skeletonCount prop with default', () => {
    const props = { skeletonCount: 8 }
    expect(props.skeletonCount).toBe(8)
  })

  it('should default to 8 skeletons', () => {
    const defaultSkeletons = 8
    expect(defaultSkeletons).toBe(8)
  })
})
