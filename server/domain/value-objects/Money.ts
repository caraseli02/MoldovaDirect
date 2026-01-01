/**
 * Money Value Object
 * Immutable representation of monetary values with currency
 */
export class Money {
  readonly amount: number
  readonly currency: string

  constructor(amount: number, currency: string) {
    // Round to 2 decimal places to avoid floating point issues
    this.amount = Math.round(amount * 100) / 100
    this.currency = currency.toUpperCase()
  }

  static euros(amount: number): Money {
    return new Money(amount, 'EUR')
  }

  static zero(currency: string = 'EUR'): Money {
    return new Money(0, currency)
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot add different currencies')
    }
    return new Money(this.amount + other.amount, this.currency)
  }

  subtract(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot subtract different currencies')
    }
    return new Money(this.amount - other.amount, this.currency)
  }

  multiply(factor: number): Money {
    return new Money(this.amount * factor, this.currency)
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency
  }

  isZero(): boolean {
    return this.amount === 0
  }

  isPositive(): boolean {
    return this.amount > 0
  }

  isNegative(): boolean {
    return this.amount < 0
  }

  greaterThan(other: Money): boolean {
    if (this.currency !== other.currency) {
      throw new Error('Cannot compare different currencies')
    }
    return this.amount > other.amount
  }

  lessThan(other: Money): boolean {
    if (this.currency !== other.currency) {
      throw new Error('Cannot compare different currencies')
    }
    return this.amount < other.amount
  }

  format(locale: string = 'es-ES'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: this.currency,
    }).format(this.amount)
  }

  toJSON(): { amount: number, currency: string } {
    return {
      amount: this.amount,
      currency: this.currency,
    }
  }
}
