import { describe, it, expect } from 'vitest'
import { emailStatusVariant, movementVariant, priorityVariant, productStatusVariant } from '@/lib/uiVariants'

describe('uiVariants helpers', () => {
  it('maps email status to badge variant', () => {
    expect(emailStatusVariant('delivered')).toBe('default')
    expect(emailStatusVariant('failed')).toBe('destructive')
    expect(emailStatusVariant('bounced')).toBe('destructive')
    expect(emailStatusVariant('sent')).toBe('secondary')
  })

  it('maps movement type to badge variant', () => {
    expect(movementVariant('in')).toBe('default')
    expect(movementVariant('out')).toBe('destructive')
    expect(movementVariant('adjustment')).toBe('secondary')
  })

  it('maps priority to badge variant', () => {
    expect(priorityVariant('critical')).toBe('destructive')
    expect(priorityVariant('high')).toBe('secondary')
    expect(priorityVariant('medium')).toBe('default')
    expect(priorityVariant('unknown')).toBe('default')
  })

  it('maps product active status to badge variant', () => {
    expect(productStatusVariant(true)).toBe('default')
    expect(productStatusVariant(false)).toBe('secondary')
  })
})

