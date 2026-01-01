/**
 * Address Value Object
 * Immutable representation of a physical address
 */
export interface AddressProps {
  firstName: string
  lastName: string
  company?: string
  street: string
  city: string
  postalCode: string
  province?: string
  country: string
  phone?: string
}

export class Address {
  readonly firstName: string
  readonly lastName: string
  readonly company?: string
  readonly street: string
  readonly city: string
  readonly postalCode: string
  readonly province?: string
  readonly country: string
  readonly phone?: string

  constructor(props: AddressProps) {
    this.firstName = props.firstName?.trim() || ''
    this.lastName = props.lastName?.trim() || ''
    this.company = props.company?.trim()
    this.street = props.street?.trim() || ''
    this.city = props.city?.trim() || ''
    this.postalCode = props.postalCode?.trim() || ''
    this.province = props.province?.trim()
    this.country = props.country?.trim().toUpperCase() || ''
    this.phone = props.phone?.trim()
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`.trim()
  }

  isValid(): boolean {
    return !!(
      this.firstName
      && this.lastName
      && this.street
      && this.city
      && this.postalCode
      && this.country
    )
  }

  getValidationErrors(): string[] {
    const errors: string[] = []
    if (!this.firstName) errors.push('First name is required')
    if (!this.lastName) errors.push('Last name is required')
    if (!this.street) errors.push('Street is required')
    if (!this.city) errors.push('City is required')
    if (!this.postalCode) errors.push('Postal code is required')
    if (!this.country) errors.push('Country is required')
    return errors
  }

  format(): string {
    const lines: string[] = [this.fullName]
    if (this.company) lines.push(this.company)
    lines.push(this.street)
    lines.push(`${this.postalCode} ${this.city}`)
    if (this.province) lines.push(this.province)
    lines.push(this.country)
    if (this.phone) lines.push(this.phone)
    return lines.join('\n')
  }

  formatOneLine(): string {
    const parts = [this.street, this.city, this.postalCode, this.country]
    return parts.filter(Boolean).join(', ')
  }

  equals(other: Address): boolean {
    return (
      this.firstName === other.firstName
      && this.lastName === other.lastName
      && this.street === other.street
      && this.city === other.city
      && this.postalCode === other.postalCode
      && this.country === other.country
    )
  }

  toJSON(): AddressProps {
    return {
      firstName: this.firstName,
      lastName: this.lastName,
      company: this.company,
      street: this.street,
      city: this.city,
      postalCode: this.postalCode,
      province: this.province,
      country: this.country,
      phone: this.phone,
    }
  }

  static fromJSON(json: AddressProps): Address {
    return new Address(json)
  }
}
